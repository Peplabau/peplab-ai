import { supabase } from './supabase';

export type CheckoutAddressType = 'street' | 'po_box' | 'parcel_locker';

export function inferCheckoutAddressType(address: string): CheckoutAddressType {
  const line = address.trim().toLowerCase();
  if (line.includes('parcel locker') || line.includes('parcel collect')) return 'parcel_locker';
  if (/\b(?:gpo\s+box|p\.?\s*o\.?\s*box|po\s*box)\b/.test(line)) return 'po_box';
  return 'street';
}

export type AusPostLocalityResult = {
  valid: boolean;
  error?: string;
  suggestions?: string[];
  suburb?: string;
  state?: string;
  postcode?: string;
};

export async function validateAusPostLocality(input: {
  suburb: string;
  state: string;
  postcode: string;
}): Promise<AusPostLocalityResult> {
  return validateAusPostAddress({
    suburb: input.suburb,
    state: input.state,
    postcode: input.postcode,
  });
}

/** Soft-pass — checkout no longer blocks on AusPost locality checks. */
export async function validateAusPostAddress(input: {
  suburb: string;
  state: string;
  postcode: string;
  address?: string;
  apartment?: string;
  addressType?: CheckoutAddressType;
  shippingMethod?: string;
  name?: string;
  email?: string;
}): Promise<AusPostLocalityResult> {
  return {
    valid: true,
    suburb: input.suburb.trim(),
    state: input.state.trim(),
    postcode: input.postcode.trim(),
    suggestions: [],
  };
}

export type AusPostLocalitySuggestion = {
  suburb: string;
  state: string;
  postcode: string;
  label: string;
};

/** Australia Post PAC suburb/postcode autocomplete (server-side AUTH-KEY). */
export async function suggestAusPostLocalities(query: string): Promise<AusPostLocalitySuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const { data, error } = await supabase.functions.invoke('auspost-validate-address', {
      body: { q },
    });
    if (error) {
      console.warn('[suggestAusPostLocalities]', error.message);
      return [];
    }
    const rows = (data as { suggestions?: unknown } | null)?.suggestions;
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const r = row as { suburb?: string; state?: string; postcode?: string; label?: string };
        const suburb = String(r.suburb || '').trim();
        const state = String(r.state || '').trim().toUpperCase();
        const postcode = String(r.postcode || '').replace(/\D/g, '').slice(0, 4);
        if (!suburb || !state || postcode.length !== 4) return null;
        return {
          suburb,
          state,
          postcode,
          label: r.label?.trim() || `${suburb}, ${state} ${postcode}`,
        };
      })
      .filter((row): row is AusPostLocalitySuggestion => row != null)
      .slice(0, 8);
  } catch (err) {
    console.warn('[suggestAusPostLocalities]', err);
    return [];
  }
}
