-- Order source / referral promo tracking on checkout (admin reporting).
-- Backfill from affiliate_orders where historical rows exist.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_source text DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS affiliate_code text,
  ADD COLUMN IF NOT EXISTS affiliate_discount numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_promoter_id uuid,
  ADD COLUMN IF NOT EXISTS referral_promoter_name text,
  ADD COLUMN IF NOT EXISTS referral_promoter_email text,
  ADD COLUMN IF NOT EXISTS referral_campaign_type text,
  ADD COLUMN IF NOT EXISTS referral_recorded_at timestamptz;

UPDATE public.orders
SET order_source = 'direct'
WHERE order_source IS NULL OR trim(order_source) = '';

-- Backfill referral metadata from affiliate_orders + promoters
UPDATE public.orders o
SET
  order_source = 'referral',
  affiliate_code = COALESCE(NULLIF(trim(o.affiliate_code), ''), upper(trim(p.referral_code))),
  affiliate_discount = COALESCE(o.affiliate_discount, ao.customer_discount, 0),
  referral_promoter_id = COALESCE(o.referral_promoter_id, ao.promoter_id),
  referral_promoter_name = COALESCE(NULLIF(trim(o.referral_promoter_name), ''), p.name),
  referral_promoter_email = COALESCE(NULLIF(trim(o.referral_promoter_email), ''), p.email),
  referral_campaign_type = COALESCE(o.referral_campaign_type, 'promo_code'),
  referral_recorded_at = COALESCE(o.referral_recorded_at, ao.created_at)
FROM public.affiliate_orders ao
JOIN public.promoters p ON p.id = ao.promoter_id
WHERE ao.order_id = o.id;

CREATE INDEX IF NOT EXISTS orders_order_source_idx ON public.orders (order_source);
CREATE INDEX IF NOT EXISTS orders_affiliate_code_idx ON public.orders (affiliate_code);
