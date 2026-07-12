-- Allow "finalised" for preorder packing workflow (admin marks packed preorders).
-- Run in Supabase: Dashboard → SQL → New query → paste & Run
-- Or: supabase db push (if CLI is linked to the project)

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'pending_payment',
    'payment_received',
    'processing',
    'finalised',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ));
