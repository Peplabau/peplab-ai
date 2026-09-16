-- 50% off email campaign code. Run once in the shared Supabase SQL Editor.
-- Starts INACTIVE — turn it on from Admin → Promo Codes (any storefront).

INSERT INTO public.promo_codes (
  code,
  discount_percent,
  max_uses,
  is_active,
  label
)
SELECT
  'SALE50',
  50,
  NULL,
  false,
  '50% off email campaign'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.promo_codes
  WHERE upper(trim(code)) = 'SALE50'
);

UPDATE public.promo_codes
SET
  discount_percent = 50,
  max_uses = NULL,
  label = COALESCE(NULLIF(trim(label), ''), '50% off email campaign'),
  updated_at = now()
WHERE upper(trim(code)) = 'SALE50';

SELECT id, code, discount_percent, is_active, max_uses, use_count, label
FROM public.promo_codes
WHERE upper(trim(code)) = 'SALE50';
