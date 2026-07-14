import { supabase } from '@/lib/supabase';
import { normalizeReferralCodeInput, validateReferralCodeCandidate } from '@/lib/affiliates';

const MEMBER_REF_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SignupReferralValidation =
  | { valid: true; referrerId: string }
  | { valid: false; error: string };

/**
 * Resolve a signup referral code to a referrer user id.
 *
 * Accepts:
 *   - Member link UUIDs (`?ref=<uuid>` from an existing member)
 *   - Alphanumeric promoter / member codes (dashboard referral codes)
 *
 * Backed by the `validate_signup_referrer` Supabase RPC (security definer).
 */
export async function validateSignupReferralCode(
  raw: string | null | undefined,
): Promise<SignupReferralValidation> {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Enter a referral code from an existing member' };
  }

  if (!MEMBER_REF_UUID_RE.test(trimmed)) {
    const normalized = normalizeReferralCodeInput(trimmed);
    const format = validateReferralCodeCandidate(normalized);
    if (!format.ok) {
      return { valid: false, error: format.error ?? 'Invalid referral code format' };
    }
  }

  try {
    const { data, error } = await supabase.rpc('validate_signup_referrer', {
      p_code: trimmed,
    });

    if (error) {
      console.error('[signup-referral] validate_signup_referrer RPC error:', error);
      return { valid: false, error: 'Unable to verify referral code. Please try again.' };
    }

    const payload = data as { valid?: boolean; referrer_id?: string; error?: string } | null;
    if (!payload?.valid || !payload.referrer_id) {
      return {
        valid: false,
        error: payload?.error ?? 'Referral code not found or inactive',
      };
    }

    return { valid: true, referrerId: payload.referrer_id };
  } catch (err) {
    console.error('[signup-referral] validateSignupReferralCode exception:', err);
    return { valid: false, error: 'Unable to verify referral code. Please try again.' };
  }
}
