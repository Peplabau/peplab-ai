-- Admin-managed promo codes: custom reusable codes and one-time random codes.

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  discount_percent numeric(5, 2) NOT NULL DEFAULT 10
    CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses integer CHECK (max_uses IS NULL OR max_uses >= 1),
  use_count integer NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  label text,
  expires_at timestamptz,
  last_redeemed_order_id uuid,
  last_redeemed_email text,
  last_redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_code_upper_idx
  ON public.promo_codes (upper(trim(code)));

CREATE INDEX IF NOT EXISTS promo_codes_active_idx
  ON public.promo_codes (is_active)
  WHERE is_active = true;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_codes_admin_all ON public.promo_codes;
CREATE POLICY promo_codes_admin_all ON public.promo_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE OR REPLACE FUNCTION public.validate_promo_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_code));
  v_row public.promo_codes%ROWTYPE;
BEGIN
  IF v_code IS NULL OR v_code = '' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Please enter a code');
  END IF;

  SELECT * INTO v_row
  FROM public.promo_codes
  WHERE upper(trim(code)) = v_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid promo code');
  END IF;

  IF NOT v_row.is_active THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This code is no longer active');
  END IF;

  IF v_row.expires_at IS NOT NULL AND v_row.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This code has expired');
  END IF;

  IF v_row.max_uses IS NOT NULL AND v_row.use_count >= v_row.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This code has already been used');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'discount_percent', v_row.discount_percent,
    'promo_code_id', v_row.id,
    'code_type', 'admin',
    'max_uses', v_row.max_uses,
    'use_count', v_row.use_count
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_promo_code(
  p_code text,
  p_order_id uuid,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_code));
  v_row public.promo_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.promo_codes
  WHERE upper(trim(code)) = v_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid promo code');
  END IF;

  IF NOT v_row.is_active
    OR (v_row.expires_at IS NOT NULL AND v_row.expires_at < now()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Code is not redeemable');
  END IF;

  IF v_row.max_uses IS NOT NULL AND v_row.use_count >= v_row.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Code already fully used');
  END IF;

  UPDATE public.promo_codes
  SET
    use_count = use_count + 1,
    last_redeemed_order_id = p_order_id,
    last_redeemed_email = NULLIF(trim(p_email), ''),
    last_redeemed_at = now(),
    updated_at = now(),
    is_active = CASE
      WHEN max_uses IS NOT NULL AND use_count + 1 >= max_uses THEN false
      ELSE is_active
    END
  WHERE id = v_row.id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_promo_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(text, uuid, text) TO anon, authenticated;
