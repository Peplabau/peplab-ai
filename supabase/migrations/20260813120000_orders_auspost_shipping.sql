-- AusPost Shipping API: store shipment id + printable label URL on orders.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS auspost_shipment_id text,
  ADD COLUMN IF NOT EXISTS auspost_label_url text;

COMMENT ON COLUMN public.orders.auspost_shipment_id IS
  'Australia Post shipment_id returned by Shipping API create shipments.';
COMMENT ON COLUMN public.orders.auspost_label_url IS
  'Australia Post label PDF URL from create labels (wait_for_label_url).';
