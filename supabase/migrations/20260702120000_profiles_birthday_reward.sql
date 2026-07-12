-- Birthday reward: store DOB on profile and award 200 pts once per calendar year.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS last_birthday_reward_year INTEGER;

COMMENT ON COLUMN public.profiles.date_of_birth IS
  'Member date of birth (YYYY-MM-DD) for annual birthday points.';
COMMENT ON COLUMN public.profiles.last_birthday_reward_year IS
  'Calendar year the member last received the birthday points gift.';

CREATE OR REPLACE FUNCTION public.claim_birthday_reward()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_dob date;
  v_year int := extract(year from current_date)::int;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT date_of_birth INTO v_dob
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_dob IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_dob');
  END IF;

  IF to_char(v_dob, 'MM-DD') <> to_char(current_date, 'MM-DD') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_birthday');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_user_id
      AND last_birthday_reward_year = v_year
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed', 'year', v_year);
  END IF;

  PERFORM public.update_user_points(
    v_user_id,
    200,
    'birthday',
    'Birthday gift ' || v_year::text,
    NULL
  );

  UPDATE public.profiles
  SET last_birthday_reward_year = v_year
  WHERE id = v_user_id;

  RETURN jsonb_build_object('ok', true, 'points', 200, 'year', v_year);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_date_of_birth(p_date_of_birth date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_claim jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_date_of_birth IS NULL OR p_date_of_birth > current_date THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_date');
  END IF;

  UPDATE public.profiles
  SET date_of_birth = p_date_of_birth
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'profile_not_found');
  END IF;

  v_claim := public.claim_birthday_reward();

  RETURN jsonb_build_object(
    'ok', true,
    'date_of_birth', p_date_of_birth,
    'claim', v_claim
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_birthday_reward() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_date_of_birth(date) TO authenticated;
