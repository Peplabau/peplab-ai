-- Cluched Orchestration: link payment intents to orders + de-dupe webhooks.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_intent text,
  ADD COLUMN IF NOT EXISTS payment_method text;

COMMENT ON COLUMN public.orders.payment_intent IS
  'Cluched payment intent id (pi_…).';
COMMENT ON COLUMN public.orders.payment_method IS
  'Checkout payment channel: payid | cluched.';

CREATE INDEX IF NOT EXISTS orders_payment_intent_idx
  ON public.orders (payment_intent)
  WHERE payment_intent IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.cluched_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE public.cluched_webhook_events ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only.
