-- Admin set/clear member DOB (bypasses profiles RLS; does not auto-award birthday points).

CREATE OR REPLACE FUNCTION public.admin_update_user_birthday(
  p_user_id uuid,
  p_date_of_birth date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_admin_id
      AND is_admin = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;

  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_user');
  END IF;

  IF p_date_of_birth IS NOT NULL AND p_date_of_birth > current_date THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_date');
  END IF;

  IF p_date_of_birth IS NULL THEN
    UPDATE public.profiles
    SET date_of_birth = NULL,
        last_birthday_reward_year = NULL
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles
    SET date_of_birth = p_date_of_birth
    WHERE id = p_user_id;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'profile_not_found');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'user_id', p_user_id,
    'date_of_birth', p_date_of_birth
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_birthday(uuid, date) TO authenticated;

COMMENT ON FUNCTION public.admin_update_user_birthday(uuid, date) IS
  'Admin-only: set or clear a member date_of_birth. Pass NULL to clear DOB + birthday claim year.';
