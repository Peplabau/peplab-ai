import { supabase } from './supabase';
import { getPromoterByCode } from './affiliates';

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  use_count: number;
  is_active: boolean;
  label: string | null;
  expires_at: string | null;
  last_redeemed_order_id: string | null;
  last_redeemed_email: string | null;
  last_redeemed_at: string | null;
  created_at: string;
  updated_at: string;
}

const PROMO_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const PROMO_CODE_LENGTH = 8;

export function normalizePromoCodeInput(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validatePromoCodeCandidate(code: string): { ok: boolean; error?: string } {
  const normalized = normalizePromoCodeInput(code);
  if (!normalized) return { ok: false, error: 'Enter a code' };
  if (normalized.length < 4) return { ok: false, error: 'Code must be at least 4 characters' };
  if (normalized.length > 20) return { ok: false, error: 'Code must be at most 20 characters' };
  if (!/^[A-Z0-9-]+$/.test(normalized)) {
    return { ok: false, error: 'Use only letters, numbers, and hyphens' };
  }
  return { ok: true };
}

export function generateRandomPromoCode(length = PROMO_CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += PROMO_CODE_CHARS[Math.floor(Math.random() * PROMO_CODE_CHARS.length)];
  }
  return code;
}

async function isCodeTaken(code: string): Promise<boolean> {
  const normalized = normalizePromoCodeInput(code);
  const [promoter, promo] = await Promise.all([
    getPromoterByCode(normalized),
    supabase.from('promo_codes').select('id').ilike('code', normalized).maybeSingle(),
  ]);
  if (promoter) return true;
  if (promo.data) return true;
  return false;
}

export async function generateUniqueRandomPromoCode(maxAttempts = 12): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateRandomPromoCode();
    if (!(await isCodeTaken(candidate))) return candidate;
  }
  throw new Error('Could not generate a unique code — try again');
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getAllPromoCodes error:', error);
    return [];
  }
  return (data || []) as PromoCode[];
}

export async function createPromoCode(input: {
  code: string;
  discount_percent: number;
  max_uses?: number | null;
  label?: string | null;
  expires_at?: string | null;
}): Promise<{ ok: boolean; error?: string; promoCode?: PromoCode }> {
  const code = normalizePromoCodeInput(input.code);
  const format = validatePromoCodeCandidate(code);
  if (!format.ok) return { ok: false, error: format.error };

  const discount = Number(input.discount_percent);
  if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
    return { ok: false, error: 'Discount must be between 1 and 100%' };
  }

  if (await isCodeTaken(code)) {
    return { ok: false, error: 'This code is already in use' };
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .insert({
      code,
      discount_percent: discount,
      max_uses: input.max_uses ?? null,
      label: input.label?.trim() || null,
      expires_at: input.expires_at || null,
    })
    .select()
    .single();

  if (error) {
    console.error('createPromoCode error:', error);
    return { ok: false, error: error.message || 'Failed to create promo code' };
  }
  return { ok: true, promoCode: data as PromoCode };
}

export async function createOneTimePromoCode(
  discount_percent: number,
  label?: string,
): Promise<{ ok: boolean; error?: string; promoCode?: PromoCode }> {
  try {
    const code = await generateUniqueRandomPromoCode();
    return createPromoCode({
      code,
      discount_percent,
      max_uses: 1,
      label: label?.trim() || 'One-time code',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to generate code';
    return { ok: false, error: message };
  }
}

export async function updatePromoCode(
  id: string,
  updates: Partial<Pick<PromoCode, 'discount_percent' | 'max_uses' | 'is_active' | 'label' | 'expires_at'>>,
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.discount_percent != null) payload.discount_percent = updates.discount_percent;
  if (updates.max_uses !== undefined) payload.max_uses = updates.max_uses;
  if (updates.is_active !== undefined) payload.is_active = updates.is_active;
  if (updates.label !== undefined) payload.label = updates.label;
  if (updates.expires_at !== undefined) payload.expires_at = updates.expires_at;

  const { error } = await supabase.from('promo_codes').update(payload).eq('id', id);
  if (error) {
    console.error('updatePromoCode error:', error);
    return { ok: false, error: error.message || 'Failed to update promo code' };
  }
  return { ok: true };
}

export async function deletePromoCode(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('promo_codes').delete().eq('id', id);
  if (error) {
    console.error('deletePromoCode error:', error);
    return { ok: false, error: error.message || 'Failed to delete promo code' };
  }
  return { ok: true };
}

export async function validatePromoCodeRpc(code: string): Promise<{
  valid: boolean;
  error?: string;
  discount_percent?: number;
  promo_code_id?: string;
  code_type?: 'admin';
  max_uses?: number | null;
  use_count?: number;
}> {
  try {
    const { data, error } = await supabase.rpc('validate_promo_code', { p_code: code });
    if (error) {
      console.error('validate_promo_code RPC error:', error);
      return { valid: false, error: 'Unable to validate code' };
    }
    return (data || { valid: false, error: 'Invalid promo code' }) as {
      valid: boolean;
      error?: string;
      discount_percent?: number;
      promo_code_id?: string;
      code_type?: 'admin';
      max_uses?: number | null;
      use_count?: number;
    };
  } catch (e) {
    console.error('validatePromoCodeRpc exception:', e);
    return { valid: false, error: 'Unable to validate code' };
  }
}

export async function redeemPromoCode(
  code: string,
  orderId: string,
  email?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('redeem_promo_code', {
      p_code: code,
      p_order_id: orderId,
      p_email: email ?? null,
    });
    if (error) {
      console.error('redeem_promo_code RPC error:', error);
      return { ok: false, error: error.message || 'Failed to redeem code' };
    }
    const result = (data || { ok: false }) as { ok: boolean; error?: string };
    return result.ok ? { ok: true } : { ok: false, error: result.error || 'Failed to redeem code' };
  } catch (e) {
    console.error('redeemPromoCode exception:', e);
    return { ok: false, error: 'Failed to redeem code' };
  }
}

export function promoCodeUsesLabel(row: PromoCode): string {
  if (row.max_uses == null) return `${row.use_count} uses (unlimited)`;
  return `${row.use_count} / ${row.max_uses}`;
}

export function promoCodeTypeLabel(row: PromoCode): string {
  if (row.max_uses === 1) return 'One-time';
  if (row.max_uses == null) return 'Custom';
  return `Limited (${row.max_uses})`;
}
