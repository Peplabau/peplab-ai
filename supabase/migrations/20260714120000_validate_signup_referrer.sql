-- Validate a referral code before allowing account signup.
-- Accepts either a member link UUID (profiles.id) or an active promoter referral_code.

CREATE OR REPLACE FUNCTION public.validate_signup_referrer(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := trim(p_code);
  v_user_id uuid;
BEGIN
  IF v_code IS NULL OR v_code = '' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Enter a referral code');
  END IF;

  -- Member referral link (?ref=<user-uuid>)
  IF v_code ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE id = v_code::uuid
    LIMIT 1;

    IF v_user_id IS NULL THEN
      RETURN jsonb_build_object('valid', false, 'error', 'That referral link is not valid');
    END IF;

    RETURN jsonb_build_object('valid', true, 'referrer_id', v_user_id);
  END IF;

  -- Promoter / member referral code (e.g. JOHN12)
  SELECT user_id INTO v_user_id
  FROM public.promoters
  WHERE upper(trim(referral_code)) = upper(v_code)
    AND is_active = true
    AND user_id IS NOT NULL
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Referral code not found or inactive');
  END IF;

  RETURN jsonb_build_object('valid', true, 'referrer_id', v_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.validate_signup_referrer(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_signup_referrer(text) TO anon, authenticated;
