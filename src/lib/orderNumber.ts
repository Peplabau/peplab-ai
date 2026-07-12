import { supabase } from '@/lib/supabase';

const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Random order reference (8 chars) — used if DB RPC is unavailable. */
function randomOrderSuffix(): string {
  let s = '';
  for (let i = 0; i < 8; i += 1) {
    s += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return s;
}

/**
 * Prefer server-generated unique order numbers; fall back to a random code if RPC fails.
 */
export async function generateOrderNumberForCheckout(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_order_number');
  if (!error && data != null) {
    const s = String(data).trim();
    if (s.length > 0) return s;
  }
  return randomOrderSuffix();
}

/** Server sequence PRE-1, PRE-2, … — requires `generate_preorder_order_number` in Supabase. */
export async function generatePreorderOrderNumberForCheckout(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_preorder_order_number');
  if (!error && data != null) {
    const s = String(data).trim();
    if (s.length > 0) return s;
  }
  return `PRE-${randomOrderSuffix()}`;
}
