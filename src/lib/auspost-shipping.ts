/**
 * Australia Post Shipping — create shipment + label via Edge Function.
 * Secrets live on the function (never in VITE_* client env).
 */
import { supabase } from './supabase';

export type AusPostCreateLabelInput = {
  order_number: string;
  shipping_method?: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address: string;
  shipping_suburb: string;
  shipping_state: string;
  shipping_postcode: string;
  /** Optional parcel overrides (defaults applied server-side). */
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
};

export type AusPostCreateLabelResult = {
  success: boolean;
  tracking_number?: string;
  shipment_id?: string;
  label_url?: string | null;
  product_id?: string;
  warning?: string;
  error?: string;
};

function splitAddressLines(address: string): string[] {
  const trimmed = (address || "").trim();
  if (!trimmed) return [];
  // Prefer newline-separated lines; otherwise keep as a single AusPost address line
  // (do not split on commas — "Unit 1, 22 Main St" is one line).
  if (trimmed.includes("\n")) {
    return trimmed
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return [trimmed];
}

export async function createAusPostLabel(
  input: AusPostCreateLabelInput,
): Promise<AusPostCreateLabelResult> {
  const name = `${input.customer_first_name || ''} ${input.customer_last_name || ''}`.trim();
  const lines = splitAddressLines(input.shipping_address || '');
  if (!name) return { success: false, error: 'Customer name is required for AusPost.' };
  if (!lines.length) return { success: false, error: 'Shipping street address is required.' };
  if (!input.shipping_suburb?.trim() || !input.shipping_state?.trim() || !input.shipping_postcode?.trim()) {
    return { success: false, error: 'Suburb, state, and postcode are required.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('auspost-create-label', {
      body: {
        order_number: input.order_number,
        shipping_method: input.shipping_method || 'standard',
        weight_kg: input.weight_kg,
        length_cm: input.length_cm,
        width_cm: input.width_cm,
        height_cm: input.height_cm,
        to: {
          name,
          lines,
          suburb: input.shipping_suburb.trim(),
          state: input.shipping_state.trim(),
          postcode: input.shipping_postcode.trim(),
          phone: input.customer_phone?.trim() || undefined,
          email: input.customer_email?.trim() || undefined,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message || 'AusPost edge function failed' };
    }

    const res = (data || {}) as AusPostCreateLabelResult & { error?: string };
    if (res.error) {
      return { success: false, error: String(res.error) };
    }
    if (!res.tracking_number) {
      return { success: false, error: 'AusPost did not return a tracking number.' };
    }
    return {
      success: true,
      tracking_number: res.tracking_number,
      shipment_id: res.shipment_id,
      label_url: res.label_url ?? null,
      product_id: res.product_id,
      warning: res.warning,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
