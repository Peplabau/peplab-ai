-- Admin hard-delete a member account (bypasses RLS; removes auth.users + app data).
-- Keeps order history when possible by nulling orders.user_id.
-- Re-run this file in Supabase SQL Editor if the function was already created.

CREATE OR REPLACE FUNCTION public.admin_delete_rows_for_user(
  p_table text,
  p_column text,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_regclass(format('public.%I', p_table)) IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table
      AND column_name = p_column
  ) THEN
    RETURN;
  END IF;

  EXECUTE format(
    'DELETE FROM public.%I WHERE %I = $1',
    p_table,
    p_column
  ) USING p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_null_user_col(
  p_table text,
  p_column text,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_regclass(format('public.%I', p_table)) IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table
      AND column_name = p_column
  ) THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE format(
      'UPDATE public.%I SET %I = NULL WHERE %I = $1',
      p_table,
      p_column,
      p_column
    ) USING p_user_id;
  EXCEPTION
    WHEN not_null_violation THEN
      NULL;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_target_email text;
  v_target_is_admin boolean;
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

  IF p_user_id = v_admin_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_delete_self');
  END IF;

  SELECT email, COALESCE(is_admin, false)
  INTO v_target_email, v_target_is_admin
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    DELETE FROM auth.users WHERE id = p_user_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'profile_not_found');
    END IF;
    RETURN jsonb_build_object('ok', true, 'user_id', p_user_id, 'email', NULL);
  END IF;

  IF v_target_is_admin THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_delete_admin');
  END IF;

  -- App data cleanup (skip missing tables/columns)
  PERFORM public.admin_delete_rows_for_user('user_points', 'user_id', p_user_id);
  PERFORM public.admin_delete_rows_for_user('user_carts', 'user_id', p_user_id);
  PERFORM public.admin_delete_rows_for_user('product_waitlist', 'user_id', p_user_id);
  PERFORM public.admin_delete_rows_for_user('reviews', 'user_id', p_user_id);
  PERFORM public.admin_delete_rows_for_user('referrals', 'referred_user_id', p_user_id);
  PERFORM public.admin_delete_rows_for_user('referrals', 'referrer_id', p_user_id);

  -- Keep commercial history; detach account when schema allows
  PERFORM public.admin_null_user_col('orders', 'user_id', p_user_id);
  PERFORM public.admin_null_user_col('promoters', 'user_id', p_user_id);

  DELETE FROM public.profiles WHERE id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'user_id', p_user_id,
    'email', v_target_email
  );
EXCEPTION
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'foreign_key_violation',
      'message', SQLERRM
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'failed',
      'message', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- Helpers are internal to admin_delete_user only.
REVOKE ALL ON FUNCTION public.admin_delete_rows_for_user(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_null_user_col(text, text, uuid) FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.admin_delete_user(uuid) IS
  'Admin-only: permanently delete a non-admin member (auth.users + profile + related app data). Preserves orders when user_id can be nulled.';
