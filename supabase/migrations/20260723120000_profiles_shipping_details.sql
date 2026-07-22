-- Saved shipping details for faster checkout autofill.
-- Nullable so existing profiles stay valid; members can edit in Settings
-- and checkout updates these after a successful logged-in order.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_first_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_last_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_suburb TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state TEXT,
  ADD COLUMN IF NOT EXISTS shipping_postcode TEXT;

COMMENT ON COLUMN public.profiles.phone IS
  'Primary contact phone used for checkout autofill.';
COMMENT ON COLUMN public.profiles.shipping_first_name IS
  'Saved shipping first name for checkout autofill.';
COMMENT ON COLUMN public.profiles.shipping_last_name IS
  'Saved shipping last name for checkout autofill.';
COMMENT ON COLUMN public.profiles.shipping_address_line1 IS
  'Saved street address for checkout autofill.';
COMMENT ON COLUMN public.profiles.shipping_address_line2 IS
  'Saved apartment / unit for checkout autofill.';
COMMENT ON COLUMN public.profiles.shipping_suburb IS
  'Saved suburb for checkout autofill.';
COMMENT ON COLUMN public.profiles.shipping_state IS
  'Saved AU state code for checkout autofill.';
COMMENT ON COLUMN public.profiles.shipping_postcode IS
  'Saved postcode for checkout autofill.';
