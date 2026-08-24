/**
 * Edge Function: sync-trustpilot
 *
 * Admin-only. Runs an Apify Trustpilot actor, upserts reviews into
 * public.trustpilot_reviews, and updates public.trustpilot_stats.
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   APIFY_TOKEN                 = apify_api_...
 *   APIFY_TRUSTPILOT_ACTOR_ID   = reviewly/trustpilot-review-scraper  (optional; WAF + residential)
 *   TRUSTPILOT_PROFILE_URL      = https://www.trustpilot.com/review/peplab.com.au
 *
 * Deploy: supabase functions deploy sync-trustpilot
 *
 * Note: spiders/trustpilot-scraper is blocked by Trustpilot AWS WAF. Prefer reviewly
 * (browser WAF solve + RESIDENTIAL proxy). Approve the actor in Apify console first.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type MappedReview = {
  external_id: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  reviewed_at: string | null;
  is_verified: boolean;
  source_url: string | null;
  raw: Record<string, unknown>;
};

const GHK_CU_PATTERN = /ghk[\s._\-/:]*cu\b/i;

function reviewMentionsGhkCu(row: Pick<MappedReview, "title" | "body" | "author_name">): boolean {
  return GHK_CU_PATTERN.test([row.title, row.body, row.author_name].filter(Boolean).join(" "));
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function actorIdForUrl(actorId: string): string {
  return actorId.replace("/", "~");
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asRating(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function asTrustScore(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 5) return null;
  return Math.round(n * 10) / 10;
}

function asIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const s = asString(value);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Flatten dataset rows — some actors nest reviews under `reviews` / `items` / `entity`. */
function flattenItems(items: unknown[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const item of items) {
    if (!isPlainObject(item)) continue;

    // reviewly: { entity: { score, totalNumberOfReviews, ... }, reviews: [...] }
    const entity = isPlainObject(item.entity) ? item.entity : null;
    const nested =
      (Array.isArray(item.reviews) && item.reviews) ||
      (Array.isArray(item.reviewList) && item.reviewList) ||
      (Array.isArray(item.items) && item.items) ||
      null;

    if (nested && nested.length > 0) {
      for (const n of nested) {
        if (isPlainObject(n)) out.push(n);
      }
      if (entity) {
        out.push({
          ...entity,
          trust_score: entity.score ?? entity.trust_score,
          trustScore: entity.score ?? entity.trustScore,
          total_reviews: entity.totalNumberOfReviews ?? entity.total_reviews,
          company_name: entity.businessName ?? entity.company_name,
        });
      } else if (
        item.trust_score != null ||
        item.trustScore != null ||
        item.total_reviews != null ||
        item.company_name != null ||
        item.score != null
      ) {
        out.push(item);
      }
      continue;
    }

    if (entity && !nested) {
      out.push({
        ...entity,
        trust_score: entity.score ?? entity.trust_score,
        total_reviews: entity.totalNumberOfReviews ?? entity.total_reviews,
        company_name: entity.businessName ?? entity.company_name,
      });
      continue;
    }

    out.push(item);
  }
  return out;
}

function isCompanyProfileRow(item: Record<string, unknown>): boolean {
  // spiders company row has company_name / total_reviews and no review_id/content
  if (item.review_id || item.reviewId || item.content || item.reviewBody) return false;
  return Boolean(
    item.company_name ||
      item.trust_score != null ||
      item.total_reviews != null ||
      (item.business_unit && item.categories),
  );
}

function pickAuthor(item: Record<string, unknown>): string | null {
  const authorInfo = isPlainObject(item.author_info) ? item.author_info : null;
  const consumer = isPlainObject(item.consumer) ? item.consumer : null;
  return (
    asString(authorInfo?.name) ||
    asString(item.authorName) ||
    asString(item.author) ||
    asString(item.consumerName) ||
    asString(item.reviewerName) ||
    asString(consumer?.displayName) ||
    asString(consumer?.name) ||
    asString((item.user as Record<string, unknown> | undefined)?.name) ||
    null
  );
}

function pickBody(item: Record<string, unknown>): string | null {
  return (
    asString(item.content) ||
    asString(item.text) ||
    asString(item.body) ||
    asString(item.reviewBody) ||
    asString(item.reviewText) ||
    null
  );
}

function pickTitle(item: Record<string, unknown>): string | null {
  return asString(item.title) || asString(item.reviewTitle) || asString(item.headline) || null;
}

function pickExternalId(item: Record<string, unknown>, index: number): string | null {
  // Prefer review_id — company profiles also have `id` (business unit id)
  const direct =
    asString(item.review_id) ||
    asString(item.reviewId) ||
    asString(item.externalId) ||
    asString(item.external_id);
  if (direct) return direct;

  // Only use bare `id` when this looks like a review (has content/title)
  if (pickBody(item) || pickTitle(item)) {
    const id = asString(item.id);
    if (id && !isCompanyProfileRow(item)) return id;
  }

  const url = asString(item.url) || asString(item.reviewUrl) || asString(item.link);
  if (url) {
    const m = url.match(/reviews?\/([a-zA-Z0-9_-]+)/i) || url.match(/([a-f0-9]{16,})/i);
    if (m?.[1]) return m[1];
    return `url:${url}`;
  }

  const author = pickAuthor(item) || "anon";
  const dates = isPlainObject(item.dates) ? item.dates : null;
  const date =
    asIsoDate(dates?.published_date) ||
    asIsoDate(item.date || item.publishedDate || item.createdAt) ||
    "nodate";
  const body = pickBody(item) || "";
  if (!body) return null;
  return `hash:${author}|${date}|${body.slice(0, 80)}|${index}`;
}

function pickReviewedAt(item: Record<string, unknown>): string | null {
  const dates = isPlainObject(item.dates) ? item.dates : null;
  return asIsoDate(
    dates?.published_date ||
      dates?.experienced_date ||
      item.publishedDate ||
      item.date ||
      item.createdAt ||
      item.reviewedAt ||
      item.datetime ||
      item.time,
  );
}

function pickVerified(item: Record<string, unknown>): boolean {
  const verification = isPlainObject(item.verification) ? item.verification : null;
  return Boolean(
    verification?.is_verified ||
      item.isVerified ||
      item.verified ||
      item.isVerifiedPurchase ||
      item.verifiedPurchase ||
      (item.labels as unknown[] | undefined)?.length,
  );
}

function mapItem(item: Record<string, unknown>, index: number): MappedReview | null {
  if (isCompanyProfileRow(item)) return null;

  const rating =
    asRating(item.rating) ||
    asRating(item.stars) ||
    asRating(item.starRating) ||
    asRating((item.rating as Record<string, unknown> | undefined)?.value) ||
    asRating((item.stars as Record<string, unknown> | undefined)?.rating);

  const body = pickBody(item);
  const title = pickTitle(item);
  const external_id = pickExternalId(item, index);

  if (!external_id || rating == null) return null;
  if (!body && !title) return null;

  const businessUnit = asString(item.business_unit);
  const source_url =
    asString(item.url) ||
    asString(item.reviewUrl) ||
    asString(item.link) ||
    (businessUnit && external_id
      ? `https://www.trustpilot.com/reviews/${external_id}`
      : null);

  return {
    external_id,
    author_name: pickAuthor(item),
    rating,
    title,
    body,
    reviewed_at: pickReviewedAt(item),
    is_verified: pickVerified(item),
    source_url,
    raw: item,
  };
}

function extractStats(items: Record<string, unknown>[]): {
  trust_score: number | null;
  review_count: number;
} {
  let trust_score: number | null = null;
  let review_count = 0;

  for (const item of items) {
    const score =
      asTrustScore(item.trust_score) ||
      asTrustScore(item.trustScore) ||
      asTrustScore(item.score) ||
      asTrustScore((item.company as Record<string, unknown> | undefined)?.trustScore) ||
      asTrustScore((item.businessUnit as Record<string, unknown> | undefined)?.trustScore) ||
      asTrustScore((item.entity as Record<string, unknown> | undefined)?.score);
    if (score != null) trust_score = score;

    const count =
      Number(item.total_reviews) ||
      Number(item.numberOfReviews) ||
      Number(item.reviewCount) ||
      Number(item.totalReviews) ||
      Number(item.totalNumberOfReviews) ||
      Number((item.company as Record<string, unknown> | undefined)?.numberOfReviews) ||
      Number((item.entity as Record<string, unknown> | undefined)?.totalNumberOfReviews) ||
      Number(
        (item.review_statistics as Record<string, unknown> | undefined)
          ?.total_reviews_all_languages,
      );
    if (Number.isFinite(count) && count > review_count) review_count = count;
  }

  return { trust_score, review_count };
}

function buildApifyInputs(actorId: string, cleanProfileUrl: string, domain: string): Record<string, unknown>[] {
  const residentialProxy = {
    useApifyProxy: true,
    apifyProxyGroups: ["RESIDENTIAL"],
  };

  // reviewly — browser WAF solve + startUrls (recommended)
  if (/reviewly/i.test(actorId)) {
    return [
      {
        startUrls: [{ url: cleanProfileUrl }],
        maxNumberOfReviews: 100,
        proxyConfiguration: residentialProxy,
      },
    ];
  }

  // themineworks — companyDomain + residential
  if (/themineworks/i.test(actorId)) {
    return [
      {
        companyDomain: domain,
        maxResults: 100,
        proxyConfiguration: residentialProxy,
      },
    ];
  }

  // dami_studio — companyDomains + browser
  if (/dami_studio/i.test(actorId)) {
    return [
      {
        companyDomains: [domain],
        maxReviews: 100,
        proxyConfiguration: residentialProxy,
      },
    ];
  }

  // spiders/trustpilot-scraper — company_urls / business_units ONLY (often WAF-blocked)
  if (/spiders\//i.test(actorId) || actorId === "spiders/trustpilot-scraper") {
    return [
      {
        company_urls: [cleanProfileUrl],
        max_pages: 10,
        include_company_info: true,
      },
      {
        business_units: [domain],
        max_pages: 10,
        include_company_info: true,
      },
    ];
  }

  // Generic fallbacks for other actors
  return [
    {
      startUrls: [{ url: cleanProfileUrl }],
      maxNumberOfReviews: 100,
      maxReviews: 100,
      proxyConfiguration: residentialProxy,
    },
    {
      companyDomains: [domain],
      companyDomain: domain,
      maxResults: 100,
      proxyConfiguration: residentialProxy,
    },
  ];
}

async function runApifyActor(
  token: string,
  actorId: string,
  profileUrl: string,
): Promise<{ items: Record<string, unknown>[]; runId: string | null }> {
  const domain = profileUrl
    .replace(/^https?:\/\/(www\.)?trustpilot\.com\/review\//i, "")
    .replace(/\/$/, "");
  const actorPath = actorIdForUrl(actorId);
  const cleanProfileUrl = profileUrl.replace(/\/$/, "");
  const inputCandidates = buildApifyInputs(actorId, cleanProfileUrl, domain);
  const isSpidersActor = /spiders\//i.test(actorId);

  let lastError = "Apify actor failed";
  let bestItems: Record<string, unknown>[] = [];
  let bestRunId: string | null = null;

  for (const input of inputCandidates) {
    console.log("[sync-trustpilot] Apify input", JSON.stringify(input));

    // WAF solve + residential can take several minutes
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${actorPath}/runs?waitForFinish=300&token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      },
    );

    if (!runRes.ok) {
      const text = await runRes.text();
      lastError = `Apify run HTTP ${runRes.status}: ${text.slice(0, 400)}`;
      if (runRes.status === 400 || runRes.status === 422) continue;
      throw new Error(lastError);
    }

    const runJson = (await runRes.json()) as {
      data?: { id?: string; status?: string; defaultDatasetId?: string };
    };
    const status = runJson.data?.status;
    const datasetId = runJson.data?.defaultDatasetId;
    const runId = runJson.data?.id ?? null;
    if (!datasetId) {
      lastError = `Apify run finished without dataset (status=${status})`;
      continue;
    }

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?format=json&clean=true&token=${encodeURIComponent(token)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!itemsRes.ok) {
      lastError = `Apify dataset HTTP ${itemsRes.status}`;
      continue;
    }
    const items = (await itemsRes.json()) as unknown;
    if (!Array.isArray(items)) {
      lastError = "Apify dataset was not an array";
      continue;
    }

    const flat = flattenItems(items);
    const reviewish = flat.filter(
      (i) =>
        !isCompanyProfileRow(i) &&
        (i.review_id ||
          i.reviewId ||
          i.content ||
          i.reviewBody ||
          i.text ||
          i.body ||
          i.rating != null),
    );
    if (reviewish.length > 0) {
      return { items: flat, runId };
    }
    if (flat.length > bestItems.length) {
      bestItems = flat;
      bestRunId = runId;
    }
    if (flat.length > 0 && reviewish.length === 0) {
      lastError =
        `Apify returned ${flat.length} item(s) but no review rows for ${cleanProfileUrl}. ` +
        `Confirm published reviews exist, and check run ${runId ?? "?"} in Apify console.`;
      // For spiders actor, don't burn more runs if we already got company-only data
      if (isSpidersActor) break;
      continue;
    }
    if (flat.length === 0) {
      lastError =
        `Apify dataset empty (run ${runId ?? "?"}, status=${status}). ` +
        `Input was ${JSON.stringify(input)}. Actor may have rejected the input — check run logs.`;
    }
  }

  if (bestItems.length > 0) return { items: bestItems, runId: bestRunId };
  throw new Error(lastError);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY")?.trim() || Deno.env.get("SB_PUBLISHABLE_KEY")?.trim();
  const apifyToken = Deno.env.get("APIFY_TOKEN")?.trim();
  const actorId =
    Deno.env.get("APIFY_TRUSTPILOT_ACTOR_ID")?.trim() ||
    "reviewly/trustpilot-review-scraper";
  const profileUrl =
    Deno.env.get("TRUSTPILOT_PROFILE_URL")?.trim() ||
    "https://www.trustpilot.com/review/peplab.com.au";

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }
  if (!apifyToken) {
    return jsonResponse({
      error: "Missing APIFY_TOKEN. Add it under Edge Function secrets.",
    }, 500);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, anonKey || serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) return jsonResponse({ error: "Unauthorized" }, 401);

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileErr } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr || !profile?.is_admin) {
      return jsonResponse({ error: "Admin only" }, 403);
    }

    let items: Record<string, unknown>[] = [];
    let runId: string | null = null;
    try {
      const result = await runApifyActor(apifyToken, actorId, profileUrl);
      items = result.items;
      runId = result.runId;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await adminClient.from("trustpilot_stats").upsert({
        id: 1,
        last_sync_error: message,
        updated_at: new Date().toISOString(),
      });
      return jsonResponse({ error: message }, 502);
    }

    const mapped = items
      .map((item, i) => mapItem(item, i))
      .filter((r): r is MappedReview => r != null);

    const byId = new Map<string, MappedReview>();
    for (const row of mapped) {
      if (!byId.has(row.external_id)) byId.set(row.external_id, row);
    }
    const unique = [...byId.values()];

    const sampleKeys = items.slice(0, 3).map((item) => Object.keys(item).slice(0, 12));
    const debug = {
      runId,
      rawItemCount: items.length,
      mappedCount: unique.length,
      sampleKeys,
      profileUrl,
      actorId,
    };

    const { data: existingRows, error: existingErr } = await adminClient
      .from("trustpilot_reviews")
      .select("external_id, admin_edited, is_visible");
    if (existingErr) throw existingErr;

    const existingMap = new Map(
      (existingRows || []).map((r) => [
        r.external_id as string,
        { admin_edited: Boolean(r.admin_edited), is_visible: r.is_visible !== false },
      ]),
    );

    let imported = 0;
    let updated = 0;
    let skippedEdited = 0;

    for (const row of unique) {
      const existing = existingMap.get(row.external_id);
      if (!existing) {
        const { error } = await adminClient.from("trustpilot_reviews").insert({
          external_id: row.external_id,
          author_name: row.author_name,
          rating: row.rating,
          title: row.title,
          body: row.body,
          reviewed_at: row.reviewed_at,
          is_verified: row.is_verified,
          source_url: row.source_url,
          is_visible: !reviewMentionsGhkCu(row),
          admin_edited: false,
          raw: row.raw,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        imported += 1;
        continue;
      }

      if (existing.admin_edited) {
        const { error } = await adminClient
          .from("trustpilot_reviews")
          .update({
            source_url: row.source_url ?? undefined,
            raw: row.raw,
            updated_at: new Date().toISOString(),
          })
          .eq("external_id", row.external_id);
        if (error) throw error;
        skippedEdited += 1;
        continue;
      }

      const { error } = await adminClient
        .from("trustpilot_reviews")
        .update({
          author_name: row.author_name,
          rating: row.rating,
          title: row.title,
          body: row.body,
          reviewed_at: row.reviewed_at,
          is_verified: row.is_verified,
          source_url: row.source_url,
          is_visible: reviewMentionsGhkCu(row) ? false : existing.is_visible,
          raw: row.raw,
          updated_at: new Date().toISOString(),
        })
        .eq("external_id", row.external_id);
      if (error) throw error;
      updated += 1;
    }

    const publicReviews = unique.filter((row) => !reviewMentionsGhkCu(row));
    const stars_breakdown: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const row of publicReviews) {
      stars_breakdown[String(row.rating)] = (stars_breakdown[String(row.rating)] || 0) + 1;
    }

    const avg =
      publicReviews.length > 0
        ? Math.round((publicReviews.reduce((s, r) => s + r.rating, 0) / publicReviews.length) * 10) / 10
        : null;

    const emptyHint =
      unique.length === 0
        ? items.length === 0
          ? `Apify returned 0 items for ${profileUrl}. Open the actor run in Apify and confirm reviews exist on the profile.`
          : `Apify returned ${items.length} item(s) but 0 looked like reviews (keys: ${JSON.stringify(sampleKeys)}). Profile may have 0 published reviews, or reviews are only in another dataset.`
        : null;

    const statsPayload = {
      id: 1,
      trust_score: avg,
      review_count: publicReviews.length,
      stars_breakdown,
      last_synced_at: new Date().toISOString(),
      last_sync_error: emptyHint,
      updated_at: new Date().toISOString(),
    };

    const { error: statsErr } = await adminClient.from("trustpilot_stats").upsert(statsPayload);
    if (statsErr) throw statsErr;

    return jsonResponse({
      ok: true,
      imported,
      updated,
      skippedEdited,
      totalMapped: unique.length,
      stats: statsPayload,
      debug,
      warning: emptyHint,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sync-trustpilot]", message);
    return jsonResponse({ error: message }, 500);
  }
});
