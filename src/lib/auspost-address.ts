import { supabase } from './supabase';

export type CheckoutAddressType = 'street' | 'po_box' | 'parcel_locker';

const AUSPOST_LINE_MAX = 40;

export function inferCheckoutAddressType(address: string): CheckoutAddressType {
  const line = address.trim().toLowerCase();
  if (line.includes('parcel locker') || line.includes('parcel collect')) return 'parcel_locker';
  if (/\b(?:gpo\s+box|p\.?\s*o\.?\s*box|po\s*box)\b/.test(line)) return 'po_box';
  return 'street';
}

/** AusPost locker/collect emails — checkout Contact already collects this. */
function isLockerRecipientEmailError(message?: string): boolean {
  const t = (message || '').toLowerCase();
  return t.includes('email') && (t.includes('parcel locker') || t.includes('parcel collect'));
}

/** AusPost allows 1–3 lines, each max 40 characters. */
export function validateCheckoutAddressFormat(address: string, apartment = ''): string | null {
  const line1 = address.trim();
  const line2 = apartment.trim();
  if (!line1) return 'Enter a delivery address.';
  if (line1.length > AUSPOST_LINE_MAX) {
    return `Address line must be ${AUSPOST_LINE_MAX} characters or less.`;
  }
  if (line2.length > AUSPOST_LINE_MAX) {
    return `Extra address line must be ${AUSPOST_LINE_MAX} characters or less.`;
  }
  return null;
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
  const suburb = input.suburb.trim();
  const state = input.state.trim();
  const postcode = input.postcode.replace(/\D/g, '').slice(0, 4);
  if (!/^\d{4}$/.test(postcode)) {
    return { valid: false, error: 'Enter a valid 4-digit postcode.' };
  }
  if (!state) return { valid: false, error: 'Select a state.' };
  if (suburb.length < 2) {
    return { valid: false, error: 'Enter a suburb.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('auspost-validate-address', {
      body: {
        suburb,
        state,
        postcode,
        address: input.address?.trim() || undefined,
        apartment: input.apartment?.trim() || undefined,
        address_type: input.addressType || inferCheckoutAddressType(input.address || ''),
        shipping_method: input.shippingMethod,
        name: input.name,
        email: input.email?.trim() || undefined,
      },
    });
    if (error) {
      return {
        valid: false,
        error: error.message || 'Could not check this address with Australia Post.',
      };
    }
    const res = (data || {}) as AusPostLocalityResult & { error?: string };
    if (res.valid || isLockerRecipientEmailError(res.error)) {
      return {
        valid: true,
        suburb: res.suburb,
        state: res.state,
        postcode: res.postcode,
        suggestions: res.suggestions,
      };
    }
    return {
      valid: false,
      error: res.error || 'Australia Post could not verify this address.',
      suggestions: res.suggestions,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Could not check this address with Australia Post.',
    };
  }
}
