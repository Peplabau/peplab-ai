-- Support replacement / follow-up shipments with extra tracking numbers.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS additional_tracking_numbers jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.orders.additional_tracking_numbers IS
  'Extra shipment tracking numbers (e.g. replacements). Stored as a JSON array of strings, newest last.';
