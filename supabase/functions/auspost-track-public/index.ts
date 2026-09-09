/**
 * Edge Function: auspost-track-public
 *
 * Public Track Order page: after verifying (order_number + email) via
 * `track_order` RPC, fetches live Australia Post Track Items events.
 *
 * Auth: none (anon). Ownership is proved by the same RPC used by /track.
 * Secrets: AUSPOST_API_KEY, AUSPOST_API_PASSWORD, AUSPOST_ACCOUNT_NUMBER,
 *          AUSPOST_BASE_URL (optional), SUPABASE_SERVICE_ROLE_KEY
 *
 * Deploy:
 *   supabase functions deploy auspost-track-public
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TrackEvent = {
  description: string;
  date: string | null;
  location: string | null;
};

type TrackResult = {
  tracking_id?: string;
  status?: string;
  trackable_items?: Array<{
    article_id?: string;
    product_type?: string;
    status?: string;
    events?: Array<{
      description?: string;
      date?: string;
      location?: string;
      location_description?: string;
    }>;
  }>;
  consignment?: {
    status?: string;
    events?: Array<{ description?: string; date?: string; location?: string }>;
  };
  errors?: Array<{ code?: string; name?: string; message?: string }>;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function basicAuthHeader(apiKey: string, password: string): string {
  return `Basic ${btoa(`${apiKey}:${password}`)}`;
}

function normalizeOrderNumber(raw: string): string {
  return (raw || "")
    .trim()
    .toUpperCase()
    .replace(/^#/, "")
    .replace(/^PEP-?/, "");
}

function collectTrackingIds(
  primary: string | null | undefined,
  extra: unknown,
): string[] {
  const ids: string[] = [];
  const p = (primary || "").trim();
  if (p) ids.push(p);
  if (Array.isArray(extra)) {
    for (const item of extra) {
      if (typeof item === "string" && item.trim()) ids.push(item.trim());
    }
  }
  return [...new Set(ids)];
}

function extractEvents(result: TrackResult): TrackEvent[] {
  const out: TrackEvent[] = [];
  const push = (description?: string, date?: string, location?: string) => {
    const d = (description || "").trim();
    if (!d) return;
    out.push({
      description: d,
      date: date?.trim() || null,
      location: (location || "").trim() || null,
    });
  };

  for (const item of result.trackable_items || []) {
    for (const ev of item.events || []) {
      push(
        ev.description,
        ev.date,
        ev.location || ev.location_description,
      );
    }
  }
  for (const ev of result.consignment?.events || []) {
    push(ev.description, ev.date, ev.location);
  }

  // Newest first when dates parse
  out.sort((a, b) => {
    const ta = a.date ? Date.parse(a.date) : 0;
    const tb = b.date ? Date.parse(b.date) : 0;
    return tb - ta;
  });

  // Dedupe identical consecutive rows
  const deduped: TrackEvent[] = [];
  for (const ev of out) {
    const prev = deduped[deduped.length - 1];
    if (
      prev &&
      prev.description === ev.description &&
      prev.date === ev.date
    ) {
      continue;
    }
    deduped.push(ev);
  }
  return deduped;
}

function summaryStatus(result: TrackResult): string | null {
  const candidates = [
    result.status,
    result.consignment?.status,
    ...(result.trackable_items || []).map((t) => t.status),
  ];
  for (const c of candidates) {
    const s = (c || "").trim();
    if (s) return s;
  }
  return null;
}

async function auspostTrack(
  trackingIds: string[],
  creds: { base: string; apiKey: string; password: string; accountNumber: string },
): Promise<{ ok: boolean; status: number; results: TrackResult[]; error?: string }> {
  const qs = encodeURIComponent(trackingIds.join(","));
  const url = `${creds.base}/track?tracking_ids=${qs}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Account-Number": creds.accountNumber,
      Authorization: basicAuthHeader(creds.apiKey, creds.password),
    },
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return {
      ok: false,
      status: res.status,
      results: [],
      error: text.slice(0, 400) || res.statusText,
    };
  }
  const results = Array.isArray(json.tracking_results)
    ? (json.tracking_results as TrackResult[])
    : [];
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      results,
      error: JSON.stringify(json).slice(0, 500),
    };
  }
  return { ok: true, status: res.status, results };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    const apiKey = Deno.env.get("AUSPOST_API_KEY")?.trim();
    const password = Deno.env.get("AUSPOST_API_PASSWORD")?.trim();
    const accountNumber = Deno.env.get("AUSPOST_ACCOUNT_NUMBER")?.trim();
    const base = (
      Deno.env.get("AUSPOST_BASE_URL")?.trim() ||
      "https://digitalapi.auspost.com.au/shipping/v1"
    ).replace(/\/$/, "");

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }
    if (!apiKey || !password || !accountNumber) {
      return jsonResponse({ error: "Australia Post is not configured" }, 503);
    }

    const body = (await req.json().catch(() => ({}))) as {
      order_number?: string;
      email?: string;
    };
    const orderNumber = normalizeOrderNumber(body.order_number || "");
    const email = (body.email || "").trim().toLowerCase();

    if (!orderNumber) {
      return jsonResponse({ error: "Please enter an order number." }, 400);
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return jsonResponse({ error: "Please enter a valid email." }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: tracked, error: rpcError } = await admin.rpc("track_order", {
      p_order_number: orderNumber,
      p_email: email,
    });

    if (rpcError) {
      console.error("[auspost-track-public] track_order RPC:", rpcError.message);
      return jsonResponse({ error: "We couldn’t look up this order right now." }, 502);
    }
    if (!tracked) {
      // Same collapse as public track page — don't reveal which field failed.
      return jsonResponse({
        ok: false,
        error:
          "We couldn’t find an order matching that number and email. Double-check both and try again.",
      }, 404);
    }

    const row = tracked as {
      order_number?: string;
      tracking_number?: string | null;
      status?: string;
    };

    // Load extra tracking IDs if present (RPC may not return them).
    let extra: unknown = null;
    const { data: orderRow } = await admin
      .from("orders")
      .select("additional_tracking_numbers")
      .ilike("order_number", orderNumber)
      .maybeSingle();
    if (orderRow) extra = orderRow.additional_tracking_numbers;

    const trackingIds = collectTrackingIds(row.tracking_number, extra);
    if (trackingIds.length === 0) {
      return jsonResponse({
        ok: true,
        has_tracking: false,
        order_number: row.order_number || orderNumber,
        status: row.status || null,
        message: "This order does not have an Australia Post tracking number yet.",
        parcels: [],
      });
    }

    const track = await auspostTrack(trackingIds, {
      base,
      apiKey,
      password,
      accountNumber,
    });

    if (!track.ok) {
      console.error("[auspost-track-public] AusPost track failed:", track.error);
      return jsonResponse({
        ok: false,
        has_tracking: true,
        tracking_numbers: trackingIds,
        error:
          "Australia Post tracking is temporarily unavailable. You can still use your tracking number on auspost.com.au.",
        auspost_url: `https://auspost.com.au/mypost/track/details/${encodeURIComponent(trackingIds[0])}`,
      }, 502);
    }

    const parcels = trackingIds.map((id) => {
      const match =
        track.results.find(
          (r) =>
            (r.tracking_id || "").toUpperCase() === id.toUpperCase() ||
            (r.trackable_items || []).some(
              (t) => (t.article_id || "").toUpperCase() === id.toUpperCase(),
            ),
        ) ||
        track.results.find((r) => !(r.errors && r.errors.length));

      const errors = match?.errors?.map((e) => e.message || e.name || e.code || "Unknown").filter(Boolean) || [];
      const events = match ? extractEvents(match) : [];
      const status = match ? summaryStatus(match) : null;

      return {
        tracking_number: id,
        status,
        events,
        errors,
        auspost_url: `https://auspost.com.au/mypost/track/details/${encodeURIComponent(id)}`,
      };
    });

    return jsonResponse({
      ok: true,
      has_tracking: true,
      order_number: row.order_number || orderNumber,
      order_status: row.status || null,
      parcels,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auspost-track-public]", message);
    return jsonResponse({ error: "Unexpected error loading tracking." }, 500);
  }
});
