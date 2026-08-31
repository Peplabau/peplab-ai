/**
 * Edge Function: auspost-sync-delivered
 *
 * Polls Australia Post Track Items for shipped orders and marks them delivered
 * when AusPost reports delivery. Optionally sends the Trustpilot review email.
 *
 * Auth (either):
 *   1. Cron: header `x-cron-secret: <AUSPOST_SYNC_CRON_SECRET>` (or Authorization: Bearer <secret>)
 *   2. Admin JWT: logged-in admin (same pattern as sync-trustpilot)
 *
 * Secrets (reuse label secrets +):
 *   AUSPOST_API_KEY / AUSPOST_API_PASSWORD / AUSPOST_ACCOUNT_NUMBER / AUSPOST_BASE_URL
 *   AUSPOST_SYNC_CRON_SECRET     = long random string for scheduled calls
 *   TRUSTPILOT_REVIEW_URL        = optional (default evaluate/peplab.com.au)
 *   RESEND_API_KEY / RESEND_FROM_EMAIL / RESEND_REVIEW_FROM_EMAIL — via send-email function
 *
 * Deploy:
 *   supabase functions deploy auspost-sync-delivered
 *
 * Schedule (every 3 hours) — Supabase Dashboard → Edge Functions → Schedules,
 * or call with cron secret:
 *   curl -X POST "$SUPABASE_URL/functions/v1/auspost-sync-delivered" \
 *     -H "x-cron-secret: $AUSPOST_SYNC_CRON_SECRET"
 */
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** AusPost allows ≤10 tracking IDs per Track Items request. */
const TRACK_BATCH_SIZE = 10;
/** Only poll shipped orders updated/created within this window. */
const LOOKBACK_DAYS = 45;

type ShippedOrder = {
  id: string;
  order_number: string;
  tracking_number: string | null;
  additional_tracking_numbers: unknown;
  customer_email: string | null;
  customer_first_name: string | null;
  review_request_email_sent: boolean | null;
  status: string;
};

type TrackResult = {
  tracking_id?: string;
  status?: string;
  trackable_items?: Array<{
    article_id?: string;
    product_type?: string;
    events?: Array<{ description?: string; date?: string }>;
    status?: string;
  }>;
  consignment?: {
    status?: string;
    events?: Array<{ description?: string }>;
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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function collectTrackingIds(order: ShippedOrder): string[] {
  const ids: string[] = [];
  const primary = (order.tracking_number || "").trim();
  if (primary) ids.push(primary);

  const extra = order.additional_tracking_numbers;
  if (Array.isArray(extra)) {
    for (const item of extra) {
      if (typeof item === "string" && item.trim()) ids.push(item.trim());
    }
  }
  return [...new Set(ids)];
}

/** True when AusPost status/events indicate the parcel was delivered. */
function isDeliveredStatus(raw: string | null | undefined): boolean {
  const s = (raw || "").trim().toLowerCase();
  if (!s) return false;
  if (s.includes("undelivered") || s.includes("unable to deliver") || s.includes("return to sender")) {
    return false;
  }
  return (
    s.includes("delivered") ||
    s.includes("left in a safe place") ||
    s.includes("delivered in full") ||
    s.includes("item delivered")
  );
}

function trackResultIsDelivered(result: TrackResult): boolean {
  if (isDeliveredStatus(result.status)) return true;
  if (isDeliveredStatus(result.consignment?.status)) return true;
  for (const item of result.trackable_items || []) {
    if (isDeliveredStatus(item.status)) return true;
    for (const ev of item.events || []) {
      if (isDeliveredStatus(ev.description)) return true;
    }
  }
  for (const ev of result.consignment?.events || []) {
    if (isDeliveredStatus(ev.description)) return true;
  }
  return false;
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
    return { ok: false, status: res.status, results: [], error: text.slice(0, 400) || res.statusText };
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

function formatOrderDisplay(orderNumber: string): string {
  const raw = (orderNumber || "").trim();
  if (!raw) return raw;
  return raw.toUpperCase().startsWith("PEP-") ? raw.toUpperCase() : `PEP-${raw.toUpperCase()}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendReviewEmail(opts: {
  to: string;
  orderNumber: string;
  firstName: string | null;
  supabaseUrl: string;
  serviceKey: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const reviewUrl =
    Deno.env.get("TRUSTPILOT_REVIEW_URL")?.trim() ||
    "https://www.trustpilot.com/evaluate/peplab.com.au";
  const display = formatOrderDisplay(opts.orderNumber);
  const greeting = opts.firstName?.trim()
    ? `Hi, ${escapeHtml(opts.firstName.trim())}`
    : "Hi";

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <p style="font-size:15px;line-height:1.65;">${greeting},</p>
      <p style="font-size:15px;line-height:1.65;color:#444;">
        Your PEPLAB order <strong>${escapeHtml(display)}</strong> has been marked as delivered.
        If you've had a great experience, we'd really appreciate a quick review on Trustpilot.
      </p>
      <p style="margin:28px 0;">
        <a href="${escapeHtml(reviewUrl)}"
           style="display:inline-block;background:#2ED1B4;color:#070A12;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">
          Leave a review on Trustpilot
        </a>
      </p>
      <p style="font-size:14px;color:#666;">Kind regards,<br><strong>The PEPLAB Team</strong></p>
    </div>
  `;

  const res = await fetch(`${opts.supabaseUrl}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.serviceKey}`,
      apikey: opts.serviceKey,
    },
    body: JSON.stringify({
      to: opts.to,
      subject: `We'd love your feedback — PEPLAB order ${display}`,
      html,
      from: Deno.env.get("RESEND_REVIEW_FROM_EMAIL")?.trim() || undefined,
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    return {
      success: false,
      error: String(json.error || text.slice(0, 300) || res.statusText),
    };
  }
  return { success: true, id: typeof json.id === "string" ? json.id : undefined };
}

async function authorize(
  req: Request,
  supabaseUrl: string,
  anonKey: string,
  serviceKey: string,
): Promise<{ ok: true; adminClient: SupabaseClient } | { ok: false; response: Response }> {
  const cronSecret = Deno.env.get("AUSPOST_SYNC_CRON_SECRET")?.trim();
  const headerSecret =
    req.headers.get("x-cron-secret")?.trim() ||
    (() => {
      const auth = req.headers.get("Authorization") || "";
      const m = /^Bearer\s+(.+)$/i.exec(auth);
      return m?.[1]?.trim() || "";
    })();

  if (cronSecret && headerSecret && headerSecret === cronSecret) {
    return { ok: true, adminClient: createClient(supabaseUrl, serviceKey) };
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      ok: false,
      response: jsonResponse(
        { error: "Unauthorized — provide admin JWT or x-cron-secret" },
        401,
      ),
    };
  }

  const userClient = createClient(supabaseUrl, anonKey || serviceKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return { ok: false, response: jsonResponse({ error: "Invalid session" }, 401) };
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: profile, error: profileErr } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr || !profile?.is_admin) {
    return { ok: false, response: jsonResponse({ error: "Admin only" }, 403) };
  }

  return { ok: true, adminClient };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, 500);
    }

    const auth = await authorize(req, supabaseUrl, anonKey, serviceKey);
    if (!auth.ok) return auth.response;
    const { adminClient } = auth;

    const apiKey = Deno.env.get("AUSPOST_API_KEY")?.trim();
    const password = Deno.env.get("AUSPOST_API_PASSWORD")?.trim();
    const accountNumber = Deno.env.get("AUSPOST_ACCOUNT_NUMBER")?.trim();
    const base = (Deno.env.get("AUSPOST_BASE_URL") || "").replace(/\/$/, "");
    if (!apiKey || !password || !accountNumber || !base) {
      return jsonResponse(
        {
          error:
            "Missing AUSPOST_API_KEY, AUSPOST_API_PASSWORD, AUSPOST_ACCOUNT_NUMBER, or AUSPOST_BASE_URL",
        },
        500,
      );
    }

    let sendReviewEmails = true;
    try {
      const body = await req.json();
      if (body && typeof body === "object" && body.send_review_emails === false) {
        sendReviewEmails = false;
      }
    } catch {
      /* empty body ok */
    }

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - LOOKBACK_DAYS);

    const { data: rows, error: listErr } = await adminClient
      .from("orders")
      .select(
        "id, order_number, tracking_number, additional_tracking_numbers, customer_email, customer_first_name, review_request_email_sent, status",
      )
      .eq("status", "shipped")
      .not("tracking_number", "is", null)
      .neq("tracking_number", "")
      .gte("updated_at", since.toISOString())
      .order("updated_at", { ascending: true })
      .limit(200);

    if (listErr) {
      return jsonResponse({ error: `Failed to load shipped orders: ${listErr.message}` }, 500);
    }

    const orders = (rows || []) as ShippedOrder[];
    if (!orders.length) {
      return jsonResponse({
        ok: true,
        checked: 0,
        delivered: 0,
        review_emails_sent: 0,
        message: "No shipped orders with tracking in lookback window",
      });
    }

    /** tracking_id → order ids that use it */
    const trackingToOrders = new Map<string, string[]>();
    const orderById = new Map<string, ShippedOrder>();
    for (const order of orders) {
      orderById.set(order.id, order);
      for (const tid of collectTrackingIds(order)) {
        const list = trackingToOrders.get(tid) || [];
        list.push(order.id);
        trackingToOrders.set(tid, list);
      }
    }

    const allTrackingIds = [...trackingToOrders.keys()];
    const deliveredTrackingIds = new Set<string>();
    const trackErrors: string[] = [];

    for (const batch of chunk(allTrackingIds, TRACK_BATCH_SIZE)) {
      const tracked = await auspostTrack(batch, {
        base,
        apiKey,
        password,
        accountNumber,
      });
      if (!tracked.ok) {
        trackErrors.push(`batch ${batch.join(",")}: ${tracked.error || tracked.status}`);
        continue;
      }
      for (const result of tracked.results) {
        const id = (result.tracking_id || "").trim();
        if (!id) continue;
        if (trackResultIsDelivered(result)) {
          deliveredTrackingIds.add(id);
        }
      }
    }

    const orderIdsToDeliver = new Set<string>();
    for (const tid of deliveredTrackingIds) {
      for (const oid of trackingToOrders.get(tid) || []) {
        orderIdsToDeliver.add(oid);
      }
    }

    let delivered = 0;
    let reviewEmailsSent = 0;
    let reviewEmailFailed = 0;
    const deliveredOrders: string[] = [];

    for (const orderId of orderIdsToDeliver) {
      const order = orderById.get(orderId);
      if (!order) continue;

      const nowIso = new Date().toISOString();
      const { error: updErr } = await adminClient
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", order.id)
        .eq("status", "shipped");

      if (updErr) {
        trackErrors.push(`update ${order.order_number}: ${updErr.message}`);
        continue;
      }

      delivered += 1;
      deliveredOrders.push(order.order_number);

      if (
        sendReviewEmails &&
        order.customer_email?.trim() &&
        !order.review_request_email_sent
      ) {
        const mail = await sendReviewEmail({
          to: order.customer_email.trim(),
          orderNumber: order.order_number,
          firstName: order.customer_first_name,
          supabaseUrl,
          serviceKey,
        });
        if (mail.success) {
          reviewEmailsSent += 1;
          await adminClient
            .from("orders")
            .update({ review_request_email_sent: true })
            .eq("id", order.id);
        } else {
          reviewEmailFailed += 1;
          trackErrors.push(
            `review email ${order.order_number}: ${mail.error || "failed"}`,
          );
        }
      }
    }

    return jsonResponse({
      ok: true,
      checked: orders.length,
      tracking_ids_queried: allTrackingIds.length,
      delivered,
      delivered_orders: deliveredOrders,
      review_emails_sent: reviewEmailsSent,
      review_email_failed: reviewEmailFailed,
      track_errors: trackErrors.length ? trackErrors.slice(0, 20) : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auspost-sync-delivered]", message);
    return jsonResponse({ error: message }, 500);
  }
});
