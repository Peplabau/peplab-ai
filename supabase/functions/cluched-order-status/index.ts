/**
 * Edge Function: cluched-order-status
 *
 * Public (email + order_number gated) status for the card-pay return page.
 * Optionally refreshes from Cluched GET /payment-intents/{pi} when still pending.
 *
 * Body/query: order_number, email
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { cluched, CluchedError } from "../_shared/cluched.ts";

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
    if (!supabaseUrl || !serviceKey) return json({ error: "Server misconfigured" }, 500);

    const body = (await req.json().catch(() => ({}))) as {
      order_number?: string;
      email?: string;
    };
    const orderNumber = String(body.order_number || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!orderNumber || !email) return json({ error: "order_number and email are required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: order, error } = await admin
      .from("orders")
      .select(
        "id, order_number, customer_email, total, payment_status, payment_intent, payment_method, status, paid_at",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error || !order) return json({ error: "Order not found" }, 404);
    if (String(order.customer_email || "").trim().toLowerCase() !== email) {
      return json({ error: "Order not found" }, 404);
    }

    let paymentStatus = String(order.payment_status || "pending").toLowerCase();
    let providerStatus: string | null = null;

    // If webhook is slow, confirm via Cluched API and fulfil once.
    if (
      paymentStatus !== "confirmed" &&
      order.payment_intent &&
      String(order.payment_method || "") === "cluched"
    ) {
      try {
        const intent = await cluched("GET", `/payment-intents/${order.payment_intent}`);
        providerStatus = String(intent.status || "");
        if (providerStatus === "success") {
          const paidCents = Number(intent.amount);
          const orderCents = Math.round(Number(order.total) * 100);
          if (Number.isFinite(paidCents) && paidCents === orderCents) {
            await admin
              .from("orders")
              .update({
                payment_status: "confirmed",
                status: "processing",
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id)
              .neq("payment_status", "confirmed");
            paymentStatus = "confirmed";
          }
        } else if (providerStatus === "canceled") {
          providerStatus = "canceled";
        }
      } catch (err) {
        if (!(err instanceof CluchedError)) {
          console.error("[cluched-order-status] provider lookup failed", err);
        }
      }
    }

    return json({
      orderNumber: order.order_number,
      paymentStatus,
      status: order.status,
      paidAt: order.paid_at,
      providerStatus,
      total: Number(order.total) || 0,
    });
  } catch (err) {
    console.error("[cluched-order-status]", err);
    return json({ error: "Could not load payment status" }, 500);
  }
});
