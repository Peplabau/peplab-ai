/**
 * Edge Function: cluched-webhook
 *
 * Receives Cluched Orchestration webhooks. Verifies Orchestrapay-Webhook-Secret,
 * de-duplicates by event id, and marks matching orders paid on payment.success.
 *
 * Secrets:
 *   CLUCHED_WEBHOOK_SECRET
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY / RESEND_FROM_EMAIL (optional — payment received email)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { timingSafeEqual } from "../_shared/cluched.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, orchestrapay-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type WebhookEvent = {
  id?: string;
  type?: string;
  created_at?: string;
  data?: Record<string, unknown>;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const expected = Deno.env.get("CLUCHED_WEBHOOK_SECRET")?.trim() || "";
  const received = req.headers.get("Orchestrapay-Webhook-Secret") || "";
  if (!expected || !timingSafeEqual(received, expected)) {
    return new Response("Invalid webhook secret", { status: 401, headers: corsHeaders });
  }

  const event = (await req.json().catch(() => null)) as WebhookEvent | null;
  if (!event?.id || !event?.type) {
    return new Response("Bad payload", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceKey) {
    return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  // De-dupe: insert once. If conflict, acknowledge and stop.
  const { error: insertErr } = await admin.from("cluched_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    payload: event,
  });

  if (insertErr) {
    // Unique violation → duplicate delivery
    if (String(insertErr.code) === "23505" || /duplicate|unique/i.test(insertErr.message || "")) {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }
    console.error("[cluched-webhook] store failed", insertErr);
    return new Response("Store failed", { status: 500, headers: corsHeaders });
  }

  // Acknowledge fast, then process (Edge may still finish work in same request).
  try {
    await handleEvent(admin, event, supabaseUrl, serviceKey);
    await admin
      .from("cluched_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_id", event.id);
  } catch (err) {
    console.error("[cluched-webhook] process failed", event.id, err);
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});

async function handleEvent(
  admin: ReturnType<typeof createClient>,
  event: WebhookEvent,
  supabaseUrl: string,
  serviceKey: string,
) {
  const d = event.data || {};
  const intentId = String(d.payment_intent || "");
  if (!intentId) return;

  switch (event.type) {
    case "payment.success":
      await fulfilOrderByIntent(admin, intentId, d, supabaseUrl, serviceKey);
      break;
    case "payment.canceled": {
      const { data: order } = await admin
        .from("orders")
        .select("id, payment_status")
        .eq("payment_intent", intentId)
        .maybeSingle();
      if (!order) return;
      if (String(order.payment_status || "").toLowerCase() === "confirmed") return;
      await admin
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
      break;
    }
    case "payment.attempt_failed":
      // Intent stays pending — customer can retry. No order cancel.
      break;
    default:
      break;
  }
}

async function fulfilOrderByIntent(
  admin: ReturnType<typeof createClient>,
  intentId: string,
  data: Record<string, unknown>,
  supabaseUrl: string,
  serviceKey: string,
) {
  const { data: order, error } = await admin
    .from("orders")
    .select(
      "id, order_number, customer_email, total, payment_status, payment_email_sent, currency",
    )
    .eq("payment_intent", intentId)
    .maybeSingle();

  if (error || !order) {
    console.error("[cluched-webhook] no order for intent", intentId, error);
    return;
  }

  if (String(order.payment_status || "").toLowerCase() === "confirmed") {
    return; // already fulfilled
  }

  const paidCents = Number(data.amount);
  const orderCents = Math.round(Number(order.total) * 100);
  const currency = String(data.currency || "").toLowerCase();
  // Require a valid matching amount/currency — never fulfil when amount is missing.
  if (
    !Number.isFinite(paidCents) ||
    !Number.isFinite(orderCents) ||
    paidCents < 1 ||
    paidCents !== orderCents ||
    currency !== "aud"
  ) {
    console.error("[cluched-webhook] amount mismatch or missing", {
      intentId,
      paidCents,
      orderCents,
      currency,
    });
    return;
  }

  const { error: updErr } = await admin
    .from("orders")
    .update({
      payment_status: "confirmed",
      status: "processing",
      paid_at: new Date().toISOString(),
      payment_method: "cluched",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .neq("payment_status", "confirmed");

  if (updErr) {
    console.error("[cluched-webhook] fulfil update failed", updErr);
    return;
  }

  // Best-effort payment-received email (does not block webhook ACK path above).
  if (order.customer_email && !order.payment_email_sent) {
    try {
      const displayNo = String(order.order_number || "");
      const total = Number(order.total) || 0;
      const html = `
        <p>Hi,</p>
        <p>We received your payment for order <strong>${displayNo}</strong>.</p>
        <p>Amount: <strong>$${total.toFixed(2)} AUD</strong></p>
        <p>Your order is now being prepared for dispatch.</p>
        <p>— PEPLAB</p>
      `;
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          to: order.customer_email,
          subject: `Payment Received - Order ${displayNo}`,
          html,
        }),
      });
      await admin
        .from("orders")
        .update({ payment_email_sent: true })
        .eq("id", order.id);
    } catch (emailErr) {
      console.error("[cluched-webhook] payment email failed", emailErr);
    }
  }
}
