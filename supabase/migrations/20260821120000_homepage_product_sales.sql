-- Public homepage ranking: aggregated units sold per product, no order PII.
-- Counts paid / in-fulfilment orders only (skips cancelled, refunded, unpaid, free gifts).

CREATE OR REPLACE FUNCTION public.get_homepage_product_sales()
RETURNS TABLE(product_key text, units_sold bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lower(trim(item.product_id)) AS product_key,
    SUM(item.qty)::bigint AS units_sold
  FROM public.orders o
  CROSS JOIN LATERAL (
    SELECT
      COALESCE(NULLIF(trim(elem->>'product_id'), ''), '') AS product_id,
      CASE
        WHEN lower(COALESCE(elem->>'is_free', 'false')) IN ('true', 't', '1') THEN true
        ELSE false
      END AS is_free,
      CASE
        WHEN (elem->>'quantity') ~ '^[0-9]+(\.[0-9]+)?$'
          THEN GREATEST((elem->>'quantity')::numeric, 1)
        ELSE 1
      END AS qty
    FROM jsonb_array_elements(
      CASE
        WHEN o.items IS NULL THEN '[]'::jsonb
        WHEN jsonb_typeof(o.items::jsonb) = 'array' THEN o.items::jsonb
        ELSE '[]'::jsonb
      END
    ) elem
  ) item
  WHERE item.product_id <> ''
    AND item.is_free = false
    AND lower(COALESCE(o.status, '')) NOT IN ('cancelled', 'refunded')
    AND (
      lower(COALESCE(o.payment_status, '')) = 'confirmed'
      OR lower(COALESCE(o.status, '')) IN ('processing', 'finalised', 'shipped', 'delivered')
    )
  GROUP BY 1
  HAVING SUM(item.qty) > 0;
$$;

REVOKE ALL ON FUNCTION public.get_homepage_product_sales() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_homepage_product_sales() TO anon, authenticated;

COMMENT ON FUNCTION public.get_homepage_product_sales() IS
  'Aggregated units sold per product slug for homepage ranking. No customer or order details.';
