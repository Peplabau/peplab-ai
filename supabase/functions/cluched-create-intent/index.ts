/**
 * Edge Function: cluched-create-intent
 *
 * Creates a Cluched payment intent for an existing PEPLAB order.
 * Amount is always taken from the order row (never from the browser).
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   CLUCHED_SECRET_KEY       = orch_sk_…
 *   CLUCHED_WEBHOOK_SECRET   = long random hex (openssl rand -hex 32)
 *   CLUCHED_API_BASE         = https://api-eu1.orchestrapay.com  (optional)
 *   CLUCHED_API_VERSION      = v202607                           (optional)
 *   CLUCHED_APP_URL          = https://peplab.ai                 (optional)
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto on hosted)
 *
 * Body: { order_number, email }
 * Returns: { paymentIntent, checkoutUrl, publicKey? }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { cluched, cluchedConfig, CluchedError } from "../_shared/cluched.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    const body = (await req.json().catch(() => ({}))) as {
      order_number?: string;
      email?: string;
    };
    const orderNumber = String(body.order_number || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!orderNumber || !email) {
      return json({ error: "order_number and email are required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select(
        "id, order_number, customer_email, customer_first_name, customer_last_name, customer_phone, user_id, total, payment_status, payment_intent, status",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderErr || !order) {
      return json({ error: "Order not found" }, 404);
    }

    const orderEmail = String(order.customer_email || "").trim().toLowerCase();
    if (!orderEmail || orderEmail !== email) {
      return json({ error: "Order not found" }, 404);
    }

    const paymentStatus = String(order.payment_status || "").toLowerCase();
    if (paymentStatus === "confirmed") {
      return json({ error: "Order is already paid" }, 409);
    }

    const totalCents = Math.round(Number(order.total) * 100);
    if (!Number.isFinite(totalCents) || totalCents < 1) {
      return json({ error: "Invalid order total" }, 400);
    }

    const { appUrl, webhookSecret } = cluchedConfig();
    const webhookUrl = `${supabaseUrl}/functions/v1/cluched-webhook`;

    const intent = await cluched("POST", "/payment-intents", {
      amount: totalCents,
      currency: "aud",
      idempotency_key: `order-${order.order_number}`,
      timeout: 1800,
      return_url: `${appUrl}/checkout/complete?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(email)}`,
      metadata: {
        order_id: String(order.id),
        order_number: String(order.order_number),
      },
      customer: {
        reference: String(order.user_id || order.customer_email || order.id),
        email: orderEmail,
        first_name: String(order.customer_first_name || "").trim() || undefined,
        last_name: String(order.customer_last_name || "").trim() || undefined,
        phone_number: String(order.customer_phone || "").trim() || undefined,
      },
      webhooks: webhookSecret
        ? [{
          url: webhookUrl,
          secret: webhookSecret,
          events: ["payment.success", "payment.canceled", "payment.attempt_failed"],
        }]
        : [{ url: webhookUrl }],
    });

    const paymentIntent = String(intent.payment_intent || "");
    const checkoutUrl = String(intent.url || "");
    if (!paymentIntent || !checkoutUrl) {
      return json({ error: "Payment provider returned an incomplete response" }, 502);
    }

    const { error: updateErr } = await admin
      .from("orders")
      .update({
        payment_intent: paymentIntent,
        payment_method: "cluched",
        payment_status: paymentStatus === "confirmed" ? "confirmed" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateErr) {
      console.error("[cluched-create-intent] order update failed", updateErr);
      return json({ error: "Could not save payment intent on order" }, 500);
    }

    return json({
      orderId: order.id,
      orderNumber: order.order_number,
      paymentIntent,
      checkoutUrl,
      amount: totalCents,
      currency: "aud",
    });
  } catch (err) {
    if (err instanceof CluchedError) {
      console.error("[cluched-create-intent]", err.status, err.apiErrorCode, err.message);
      return json({ error: "We could not start the payment. Please try again." }, 502);
    }
    console.error("[cluched-create-intent]", err);
    return json({ error: "We could not start the payment. Please try again." }, 502);
  }
});
