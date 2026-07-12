import { supabase } from './supabase';
import { addUserPoints } from './supabase-db';
import { getSiteSetting, DEFAULT_AFFILIATE_PROGRAM_SETTINGS } from './settings';
import { validatePromoCodeRpc } from './promo-codes';

// ============================================
// TYPES
// ============================================

export interface Promoter {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  referral_code: string;
  commission_percent: number;
  customer_discount_percent: number;
  tier: string;
  is_active: boolean;
  total_sales: number;
  total_orders: number;
  total_commission: number;
  store_credit: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateOrder {
  id: string;
  promoter_id: string;
  order_id: string;
  order_number: string;
  customer_email: string;
  order_total: number;
  commission_percent: number;
  commission_amount: number;
  customer_discount: number;
  status: string;
  credited_at: string | null;
  created_at: string;
}

export interface StoreCreditTransaction {
  id: string;
  promoter_id: string;
  amount: number;
  type: string;
  description: string;
  order_id: string | null;
  created_at: string;
}

export interface AffiliateValidation {
  valid: boolean;
  error?: string;
  promoter_id?: string;
  promoter_name?: string;
  discount_percent?: number;
  /** `promoter` = member referral code; `admin` = admin-managed promo code */
  code_type?: 'promoter' | 'admin';
  promo_code_id?: string;
}

// Commission tiers — admin can override per-promoter
export const COMMISSION_TIERS = [
  { name: 'standard', label: 'Standard', minSales: 0, commission: 10 },
  { name: 'silver', label: 'Silver', minSales: 1000, commission: 12 },
  { name: 'gold', label: 'Gold', minSales: 5000, commission: 15 },
  { name: 'platinum', label: 'Platinum', minSales: 15000, commission: 20 },
];

export function getTierForSales(totalSales: number): typeof COMMISSION_TIERS[0] {
  const sorted = [...COMMISSION_TIERS].sort((a, b) => b.minSales - a.minSales);
  return sorted.find(t => totalSales >= t.minSales) || COMMISSION_TIERS[0];
}

/**
 * Minimum paid-item subtotal (same as checkout `paidItemsTotal`: before referral discount, excludes free lines)
 * required for referral code benefits: customer discount and referrer bonus points.
 */
export const REFERRAL_MIN_ORDER_SUBTOTAL_USD = 100;

/** Min/max length for user-chosen referral codes (auto-generated codes use 8 chars). */
export const REFERRAL_CODE_MIN_LEN = 4;
export const REFERRAL_CODE_MAX_LEN = 20;

/** Block obvious impersonation / system-style codes (case-insensitive). */
const RESERVED_REFERRAL_CODES = new Set([
  'ADMIN', 'PEPLAB', 'ROOT', 'SYSTEM', 'SUPPORT', 'HELP', 'TEST', 'NULL', 'NONE',
  'AFFILIATE', 'PROMO', 'DISCOUNT', 'CODE', 'REFERRAL', 'OFFICIAL', 'STAFF',
]);

// ============================================
// VALIDATION
// ============================================

/**
 * Normalize raw user input: trim and uppercase (call before format validation).
 */
export function normalizeReferralCodeInput(raw: string): string {
  return raw.trim().toUpperCase();
}

/**
 * Client-side rules for a custom referral code. Enforces uniqueness separately
 * via {@link getPromoterByCode}.
 */
export function validateReferralCodeCandidate(code: string): { ok: boolean; error?: string } {
  if (!code) {
    return { ok: false, error: 'Enter a code' };
  }
  if (code.length < REFERRAL_CODE_MIN_LEN) {
    return { ok: false, error: `Code must be at least ${REFERRAL_CODE_MIN_LEN} characters` };
  }
  if (code.length > REFERRAL_CODE_MAX_LEN) {
    return { ok: false, error: `Code must be at most ${REFERRAL_CODE_MAX_LEN} characters` };
  }
  if (!/^[A-Z0-9]+$/.test(code)) {
    return { ok: false, error: 'Use only letters and numbers (A–Z, 0–9)' };
  }
  if (RESERVED_REFERRAL_CODES.has(code)) {
    return { ok: false, error: 'This code is reserved. Please choose another.' };
  }
  return { ok: true };
}

export async function validateAffiliateCode(code: string): Promise<AffiliateValidation> {
  try {
    const program = await getSiteSetting('affiliate_program_settings', DEFAULT_AFFILIATE_PROGRAM_SETTINGS);
    let promoterResult: AffiliateValidation = { valid: false, error: 'Invalid code' };

    if (program.codes_enabled !== false) {
      const { data, error } = await supabase.rpc('validate_affiliate_code', { p_code: code });
      if (error) {
        console.error('validate_affiliate_code error:', error);
      } else {
        promoterResult = data as AffiliateValidation;

        if (promoterResult.valid && !promoterResult.promoter_id && code) {
          const promoter = await getPromoterByCode(code);
          if (promoter) {
            promoterResult.promoter_id = promoter.id;
            promoterResult.promoter_name = promoter.name;
            promoterResult.discount_percent =
              promoterResult.discount_percent ?? promoter.customer_discount_percent;
            promoterResult.code_type = 'promoter';
          }
        }

        if (promoterResult.valid && !promoterResult.code_type) {
          promoterResult.code_type = promoterResult.promoter_id ? 'promoter' : undefined;
        }

        if (promoterResult.valid) {
          return promoterResult;
        }
      }
    }

    const adminPromo = await validatePromoCodeRpc(code);
    if (adminPromo.valid) {
      return {
        valid: true,
        discount_percent: adminPromo.discount_percent,
        promo_code_id: adminPromo.promo_code_id,
        code_type: 'admin',
      };
    }

    if (program.codes_enabled === false) {
      return { valid: false, error: 'Referral codes are not available at this time' };
    }

    return promoterResult;
  } catch (e) {
    console.error('validateAffiliateCode exception:', e);
    return { valid: false, error: 'Unable to validate code' };
  }
}

// ============================================
// PROMOTER CRUD (Admin)
// ============================================

export async function getAllPromoters(): Promise<Promoter[]> {
  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getAllPromoters error:', error);
    return [];
  }
  return data || [];
}

export async function getPromoterByCode(code: string): Promise<Promoter | null> {
  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .ilike('referral_code', code)
    .maybeSingle();
  if (error) {
    console.error('getPromoterByCode error:', error);
    return null;
  }
  return data;
}

export async function getPromoterByUserId(userId: string): Promise<Promoter | null> {
  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('getPromoterByUserId error:', error);
    return null;
  }
  return data;
}

export async function getPromoterById(promoterId: string): Promise<Promoter | null> {
  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .eq('id', promoterId)
    .maybeSingle();
  if (error) {
    console.error('getPromoterById error:', error);
    return null;
  }
  return data;
}

export async function awardPromoterReferralPoints(
  promoterId: string,
  orderId: string,
  orderNumber: string,
  points: number = 100
): Promise<{ ok: boolean; error?: string }> {
  try {
    const promoter = await getPromoterById(promoterId);
    if (!promoter) {
      return { ok: false, error: 'Promo code owner not found' };
    }
    if (!promoter.user_id) {
      return { ok: false, error: 'Promo code owner is not linked to a user account' };
    }

    await addUserPoints(
      promoter.user_id,
      points,
      'referral',
      `Promo code used - ${orderNumber}`,
      orderId,
    );

    return { ok: true };
  } catch (e: unknown) {
    const message = (e as { message?: string } | null)?.message || 'Failed to award promo code points';
    console.error('awardPromoterReferralPoints error:', e);
    return { ok: false, error: message };
  }
}

/** Match promoter row by account email (case-insensitive). Used when `user_id` was not set on insert. */
export async function getPromoterByEmail(email: string): Promise<Promoter | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .ilike('email', normalized)
    .maybeSingle();
  if (error) {
    console.error('getPromoterByEmail error:', error);
    return null;
  }
  return data;
}

/**
 * Resolve the promoter row for whoever is logged in.
 * 1) `promoters.user_id` = auth user id (same id as `public.profiles.id` — no separate profiles FK)
 * 2) else `promoters.email` matches auth email (admin can create promoter before user exists)
 */
export async function getPromoterForSessionUser(): Promise<Promoter | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const byId = await getPromoterByUserId(user.id);
  if (byId) return byId;
  if (user.email) return getPromoterByEmail(user.email);
  return null;
}

const PROMO_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const PROMO_CODE_LENGTH = 8;

function generateRandomPromoCode(length = PROMO_CODE_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += PROMO_CODE_CHARS[Math.floor(Math.random() * PROMO_CODE_CHARS.length)];
  }
  return code;
}

export async function createPromoter(input: {
  name: string;
  email: string;
  referral_code: string;
  commission_percent?: number;
  customer_discount_percent?: number;
  user_id?: string | null;
}): Promise<{ ok: boolean; error?: string; promoter?: Promoter }> {
  const { data, error } = await supabase
    .from('promoters')
    .insert({
      name: input.name,
      email: input.email,
      referral_code: input.referral_code.toUpperCase(),
      commission_percent: input.commission_percent ?? 10,
      customer_discount_percent: input.customer_discount_percent ?? 10,
      user_id: input.user_id ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.message?.includes('duplicate')) {
      return { ok: false, error: 'Referral code or email already exists' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, promoter: data };
}

export async function createOrUpdatePromoterForUser(userId: string, email: string, name: string): Promise<{ ok: boolean; error?: string; promoter?: Promoter }> {
  try {
    const payload = {
      user_id: userId,
      email: email.trim().toLowerCase(),
      name,
    };

    const { data, error } = await supabase.functions.invoke('create-promoter', {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (error) {
      console.error('createOrUpdatePromoterForUser invoke error:', error);
      return { ok: false, error: error.message };
    }

    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'Unexpected response from promo creation service' };
    }

    const casted = data as Promoter | { error?: string };
    if ('error' in casted && casted.error) {
      return { ok: false, error: casted.error };
    }

    return { ok: true, promoter: casted as Promoter };
  } catch (e: unknown) {
    const message = (e as { message?: string } | null)?.message || 'Failed to create promo code';
    console.error('createOrUpdatePromoterForUser error:', e);
    return { ok: false, error: message };
  }
}

export async function updatePromoter(
  id: string,
  updates: Partial<Pick<Promoter, 'name' | 'email' | 'referral_code' | 'commission_percent' | 'customer_discount_percent' | 'is_active' | 'tier' | 'user_id'>>
): Promise<{ ok: boolean; error?: string; errorCode?: string }> {
  const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  if (updates.referral_code) payload.referral_code = updates.referral_code.toUpperCase();

  const { data, error } = await supabase
    .from('promoters')
    .update(payload)
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: error.message,
      errorCode: (error as { code?: string }).code,
    };
  }
  if (!data) {
    return {
      ok: false,
      error: 'No matching promoter was updated. It may not exist or your role may not allow this change.',
    };
  }
  return { ok: true };
}

/**
 * Change the signed-in user's referral code via DB RPC {@link update_my_referral_code}.
 * That function runs with definer rights so promoters are not blocked by table UPDATE RLS
 * (which typically allows admins only, yielding a silent 0-row update from PostgREST).
 */
export async function updateSessionUserReferralCode(
  desiredRaw: string,
): Promise<{ ok: boolean; error?: string; promoter?: Promoter }> {
  const normalized = normalizeReferralCodeInput(desiredRaw);
  const format = validateReferralCodeCandidate(normalized);
  if (!format.ok) {
    return { ok: false, error: format.error };
  }

  const { data: rpcRaw, error: rpcError } = await supabase.rpc('update_my_referral_code', {
    p_code: normalized,
  });

  if (rpcError) {
    const msg = rpcError.message || '';
    const missingFn =
      /update_my_referral_code/i.test(msg) &&
      (/could not find/i.test(msg) || /does not exist/i.test(msg) || rpcError.code === '42883');
    if (missingFn) {
      console.error(
        'update_my_referral_code RPC missing — apply supabase/migrations/20260517120000_update_my_referral_code_rpc.sql',
        rpcError,
      );
      return {
        ok: false,
        error:
          'Promo code changes are temporarily unavailable. Please contact support — the database function update_my_referral_code needs to be installed.',
      };
    }
    console.error('update_my_referral_code error:', rpcError);
    return { ok: false, error: msg || 'Could not update referral code' };
  }

  const rpc = rpcRaw as { ok?: boolean; error?: string; promoter_id?: string } | null;
  if (!rpc || rpc.ok !== true) {
    return {
      ok: false,
      error: rpc?.error || 'Could not update referral code',
    };
  }

  const pid = rpc.promoter_id;
  const fresh = pid ? await getPromoterById(pid) : await getPromoterForSessionUser();
  return {
    ok: true,
    promoter: fresh ?? undefined,
  };
}

export async function deletePromoter(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('promoters').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ============================================
// AFFILIATE ORDERS
// ============================================

export async function recordAffiliateOrder(params: {
  promoter_id: string;
  order_id: string;
  order_number: string;
  customer_email: string;
  order_total: number;
  customer_discount?: number;
}): Promise<{ ok: boolean; commission?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('record_affiliate_order', {
      p_promoter_id: params.promoter_id,
      p_order_id: params.order_id,
      p_order_number: params.order_number,
      p_customer_email: params.customer_email,
      p_order_total: params.order_total,
      p_customer_discount: params.customer_discount ?? 0,
    });
    if (error) return { ok: false, error: error.message };
    const result = data as { ok: boolean; commission?: number; error?: string };
    return result;
  } catch (e) {
    console.error('recordAffiliateOrder exception:', e);
    return { ok: false, error: 'Failed to record affiliate order' };
  }
}

export async function creditAffiliateCommission(orderId: string): Promise<{ ok: boolean; credited?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('credit_affiliate_commission', { p_order_id: orderId });
    if (error) return { ok: false, error: error.message };
    return data as { ok: boolean; credited?: number; error?: string };
  } catch (e) {
    console.error('creditAffiliateCommission exception:', e);
    return { ok: false, error: 'Failed to credit commission' };
  }
}

export async function getAffiliateOrdersForPromoter(promoterId: string): Promise<AffiliateOrder[]> {
  const { data, error } = await supabase
    .from('affiliate_orders')
    .select('*')
    .eq('promoter_id', promoterId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getAffiliateOrdersForPromoter error:', error);
    return [];
  }
  return data || [];
}

export type AffiliateOrderWithPromoter = AffiliateOrder & {
  promoters?: { id: string; name: string; email: string; referral_code: string } | null;
};

/** Lookup referral row for admin order detail (fallback when orders.* columns were not saved). */
export async function getAffiliateOrderByOrderId(
  orderId: string,
): Promise<AffiliateOrderWithPromoter | null> {
  const { data, error } = await supabase
    .from('affiliate_orders')
    .select('*, promoters(id, name, email, referral_code)')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) {
    console.error('getAffiliateOrderByOrderId error:', error);
    return null;
  }
  return (data as AffiliateOrderWithPromoter) || null;
}

export async function getAllAffiliateOrders(): Promise<(AffiliateOrder & { promoter_name?: string; promoter_code?: string })[]> {
  const { data, error } = await supabase
    .from('affiliate_orders')
    .select('*, promoters(name, referral_code)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getAllAffiliateOrders error:', error);
    return [];
  }
  return (data || []).map((row: any) => ({
    ...row,
    promoter_name: row.promoters?.name,
    promoter_code: row.promoters?.referral_code,
  }));
}

// ============================================
// STORE CREDIT
// ============================================

export async function getStoreCreditTransactions(promoterId: string): Promise<StoreCreditTransaction[]> {
  const { data, error } = await supabase
    .from('store_credit_transactions')
    .select('*')
    .eq('promoter_id', promoterId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getStoreCreditTransactions error:', error);
    return [];
  }
  return data || [];
}

export async function adjustStoreCredit(
  promoterId: string,
  amount: number,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('adjust_store_credit', {
      p_promoter_id: promoterId,
      p_amount: amount,
      p_description: description,
    });
    if (error) return { ok: false, error: error.message };
    return data as { ok: boolean; error?: string };
  } catch (e) {
    console.error('adjustStoreCredit exception:', e);
    return { ok: false, error: 'Failed to adjust credit' };
  }
}

export async function useStoreCredit(
  promoterId: string,
  amount: number,
  description?: string
): Promise<{ ok: boolean; remaining?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('use_store_credit', {
      p_promoter_id: promoterId,
      p_amount: amount,
      p_description: description ?? 'Store credit used at checkout',
    });
    if (error) return { ok: false, error: error.message };
    return data as { ok: boolean; remaining?: number; error?: string };
  } catch (e) {
    console.error('useStoreCredit exception:', e);
    return { ok: false, error: 'Failed to use store credit' };
  }
}

// Fraud: prevent self-referral
export function isSelfReferral(promoterEmail: string, customerEmail: string): boolean {
  return promoterEmail.toLowerCase().trim() === customerEmail.toLowerCase().trim();
}

/** True if the logged-in customer is the same person as the promoter (by auth id or email). */
export async function isPromoterSelfOrder(
  userId: string | null,
  code: string,
  customerEmail?: string
): Promise<boolean> {
  const promoter = await getPromoterByCode(code);
  if (!promoter) return false;
  if (userId && promoter.user_id === userId) return true;
  if (customerEmail && isSelfReferral(promoter.email, customerEmail)) return true;
  return false;
}