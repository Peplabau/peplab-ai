-- Idempotent stock deduction flag for paid/shipped orders.
-- Prevents double-decrement if admin marks paid then shipped.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_deducted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_deducted_at timestamptz;

COMMENT ON COLUMN public.orders.stock_deducted IS
  'True after inventory was reduced for this order (paid/shipped). Used to avoid double deduction.';
COMMENT ON COLUMN public.orders.stock_deducted_at IS
  'When stock was deducted for this order.';

CREATE INDEX IF NOT EXISTS orders_stock_deducted_idx
  ON public.orders (stock_deducted)
  WHERE stock_deducted = false;
