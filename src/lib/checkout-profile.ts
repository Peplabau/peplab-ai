import { supabase } from '@/lib/supabase';

/** Checkout delivery fields — mirrors Checkout.tsx shippingAddress shape. */
export interface CheckoutShippingDetails {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
}

export const EMPTY_CHECKOUT_SHIPPING: CheckoutShippingDetails = {
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  suburb: '',
  state: '',
  postcode: '',
  phone: '',
};

function trimStr(v: unknown): string {
  return String(v ?? '').trim();
}

export function hasUsableShipping(details: CheckoutShippingDetails | null | undefined): boolean {
  if (!details) return false;
  return Boolean(
    details.firstName ||
      details.lastName ||
      details.address ||
      details.suburb ||
      details.postcode ||
      details.phone,
  );
}

function applyFullNameFallback(details: CheckoutShippingDetails, fullName: string): void {
  if (details.firstName || details.lastName) return;
  const full = trimStr(fullName);
  if (!full) return;
  const parts = full.split(/\s+/);
  details.firstName = parts[0] || '';
  details.lastName = parts.slice(1).join(' ');
}

function fromProfileRow(row: Record<string, unknown> | null | undefined): CheckoutShippingDetails | null {
  if (!row) return null;
  const details: CheckoutShippingDetails = {
    firstName: trimStr(row.shipping_first_name),
    lastName: trimStr(row.shipping_last_name),
    address: trimStr(row.shipping_address_line1),
    apartment: trimStr(row.shipping_address_line2),
    suburb: trimStr(row.shipping_suburb),
    state: trimStr(row.shipping_state).toUpperCase(),
    postcode: trimStr(row.shipping_postcode),
    phone: trimStr(row.phone),
  };
  applyFullNameFallback(details, trimStr(row.full_name));
  return hasUsableShipping(details) ? details : null;
}

function fromOrderRow(order: {
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  shipping_suburb?: string | null;
  shipping_state?: string | null;
  shipping_postcode?: string | null;
} | null): CheckoutShippingDetails | null {
  if (!order) return null;
  const street = trimStr(order.shipping_address);
  let address = street;
  let apartment = '';
  const comma = street.lastIndexOf(', ');
  if (comma > 0 && street.length - comma < 40) {
    address = street.slice(0, comma).trim();
    apartment = street.slice(comma + 2).trim();
  }

  const details: CheckoutShippingDetails = {
    firstName: trimStr(order.customer_first_name),
    lastName: trimStr(order.customer_last_name),
    address,
    apartment,
    suburb: trimStr(order.shipping_suburb),
    state: trimStr(order.shipping_state).toUpperCase(),
    postcode: trimStr(order.shipping_postcode),
    phone: trimStr(order.customer_phone),
  };
  return hasUsableShipping(details) ? details : null;
}

async function fetchLastOrderShipping(userId: string): Promise<CheckoutShippingDetails | null> {
  const { data: lastOrder, error } = await supabase
    .from('orders')
    .select(
      'customer_first_name, customer_last_name, customer_phone, shipping_address, shipping_suburb, shipping_state, shipping_postcode',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('loadCheckoutDefaults order:', error.message);
    return null;
  }
  return fromOrderRow(lastOrder);
}

/**
 * Load saved checkout details for a logged-in member.
 * Prefer profile shipping columns; fill gaps from their most recent order.
 * Never throws — returns null shipping on any failure (safe for checkout).
 */
export async function loadCheckoutDefaults(
  userId: string,
): Promise<{ email?: string; shipping: CheckoutShippingDetails | null; source: 'profile' | 'order' | 'mixed' | null }> {
  try {
    let email: string | undefined;
    let profileShipping: CheckoutShippingDetails | null = null;

    const fullSelect =
      'email, full_name, phone, shipping_first_name, shipping_last_name, shipping_address_line1, shipping_address_line2, shipping_suburb, shipping_state, shipping_postcode';

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select(fullSelect)
      .eq('id', userId)
      .maybeSingle();

    if (!profileErr && profile) {
      email = trimStr(profile.email) || undefined;
      profileShipping = fromProfileRow(profile as Record<string, unknown>);
    } else if (profileErr?.message?.includes('does not exist') || profileErr?.code === '42703') {
      const { data: basic } = await supabase
        .from('profiles')
        .select('email, full_name, phone')
        .eq('id', userId)
        .maybeSingle();
      if (basic) {
        email = trimStr(basic.email) || undefined;
        profileShipping = fromProfileRow(basic as Record<string, unknown>);
      }
    } else if (profileErr) {
      console.warn('loadCheckoutDefaults profile:', profileErr.message);
    }

    const orderShipping = await fetchLastOrderShipping(userId);

    if (profileShipping?.address && profileShipping.suburb) {
      return { email, shipping: profileShipping, source: 'profile' };
    }

    if (profileShipping && orderShipping) {
      return {
        email,
        shipping: mergeShippingDefaults(profileShipping, orderShipping),
        source: 'mixed',
      };
    }

    if (profileShipping) return { email, shipping: profileShipping, source: 'profile' };
    if (orderShipping) return { email, shipping: orderShipping, source: 'order' };
    return { email, shipping: null, source: null };
  } catch (err) {
    console.warn('loadCheckoutDefaults failed:', err);
    return { shipping: null, source: null };
  }
}

/**
 * Persist shipping details onto the member profile after checkout / Settings save.
 * Best-effort only — never throws; missing columns (pre-migration) fall back to phone/name.
 */
export async function saveCheckoutProfile(
  userId: string,
  shipping: CheckoutShippingDetails,
  opts?: { alsoUpdateFullName?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const firstName = trimStr(shipping.firstName);
    const lastName = trimStr(shipping.lastName);
    const patch: Record<string, string | null> = {
      phone: trimStr(shipping.phone) || null,
      shipping_first_name: firstName || null,
      shipping_last_name: lastName || null,
      shipping_address_line1: trimStr(shipping.address) || null,
      shipping_address_line2: trimStr(shipping.apartment) || null,
      shipping_suburb: trimStr(shipping.suburb) || null,
      shipping_state: trimStr(shipping.state).toUpperCase() || null,
      shipping_postcode: trimStr(shipping.postcode) || null,
    };

    if (opts?.alsoUpdateFullName !== false) {
      const full = [firstName, lastName].filter(Boolean).join(' ');
      if (full) patch.full_name = full;
    }

    const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42703') {
        const minimal: Record<string, string | null> = { phone: patch.phone };
        if (patch.full_name) minimal.full_name = patch.full_name;
        const { error: minErr } = await supabase.from('profiles').update(minimal).eq('id', userId);
        if (minErr) {
          console.warn('saveCheckoutProfile minimal failed:', minErr.message);
          return { ok: false, error: minErr.message };
        }
        return { ok: true };
      }
      console.warn('saveCheckoutProfile failed:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    console.warn('saveCheckoutProfile exception:', err);
    return { ok: false, error: err?.message || 'unknown' };
  }
}

/** Merge saved defaults into empty checkout fields only (never overwrite typed values). */
export function mergeShippingDefaults(
  current: CheckoutShippingDetails,
  saved: CheckoutShippingDetails | null,
): CheckoutShippingDetails {
  if (!saved) return current;
  return {
    firstName: current.firstName || saved.firstName,
    lastName: current.lastName || saved.lastName,
    address: current.address || saved.address,
    apartment: current.apartment || saved.apartment,
    suburb: current.suburb || saved.suburb,
    state: current.state || saved.state,
    postcode: current.postcode || saved.postcode,
    phone: current.phone || saved.phone,
  };
}
