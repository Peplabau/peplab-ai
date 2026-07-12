import { supabase } from '@/lib/supabase';

/**
 * Canonical order statuses used across checkout + admin.
 * Any status the DB returns that isn't in this list falls back to
 * `OrderStage.Placed` in the timeline.
 */
export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | (string & {});

export interface TrackOrderItem {
  name: string;
  dosage: string;
  quantity: number;
  is_free: boolean;
}

export interface TrackOrderResult {
  order_number: string;
  status: OrderStatus;
  payment_status: string | null;
  created_at: string;
  paid_at: string | null;
  tracking_number: string | null;
  shipping_method: string | null;
  shipping_state: string | null;
  shipping_postcode: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  items: TrackOrderItem[];
}

/**
 * Normalises the user-entered order reference:
 *   * upper-cases
 *   * strips surrounding whitespace
 *   * strips a leading "PEP-" or "PEP" prefix
 *   * strips a leading "#" if the user pasted the full display (e.g. "#ABCD1234")
 * The RPC on the server accepts either raw or PEP-prefixed form so this is
 * purely a tidy-up for the client-side validator.
 */
export function normalizeOrderNumberInput(raw: string): string {
  const trimmed = (raw || '').trim().toUpperCase();
  return trimmed.replace(/^#/, '').replace(/^PEP-?/, '');
}

/**
 * Look up a single order by (order_number, email).
 *
 * Uses the `track_order` SECURITY DEFINER RPC (see
 * `supabase/sql/rpc_track_order.sql`). Returns `null` when the pair doesn't
 * match any order — the RPC deliberately collapses "not found" and "wrong
 * email" into the same NULL response to avoid enabling enumeration.
 */
export async function lookupOrderTracking(
  orderNumber: string,
  email: string,
): Promise<{ data: TrackOrderResult | null; error: string | null }> {
  const normalized = normalizeOrderNumberInput(orderNumber);
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!normalized) return { data: null, error: 'Please enter an order number.' };
  if (!cleanEmail) return { data: null, error: 'Please enter the email you used at checkout.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return { data: null, error: 'That email address doesn’t look right.' };
  }

  try {
    const { data, error } = await supabase.rpc('track_order', {
      p_order_number: normalized,
      p_email: cleanEmail,
    });

    if (error) {
      console.error('[trackOrder] RPC error:', error);
      return { data: null, error: 'We couldn’t reach our servers. Please try again in a moment.' };
    }

    if (!data) {
      return {
        data: null,
        error: 'We couldn’t find an order matching that number and email. Double-check both and try again.',
      };
    }

    return { data: data as TrackOrderResult, error: null };
  } catch (err) {
    console.error('[trackOrder] unexpected error:', err);
    return { data: null, error: 'Something went wrong. Please try again.' };
  }
}

/**
 * The ordered list of stages we show in the timeline. `cancelled` is a
 * terminal side-branch — the UI renders it separately and bypasses the
 * normal progression.
 */
export const TRACKING_STAGES = [
  { key: 'placed',     label: 'Order Placed',     description: 'We’ve received your order.' },
  { key: 'paid',       label: 'Payment Received', description: 'Funds confirmed — preparing your items.' },
  { key: 'processing', label: 'Processing',       description: 'We’re packing your order for dispatch.' },
  { key: 'shipped',    label: 'Shipped',          description: 'Out for delivery.' },
  { key: 'delivered',  label: 'Delivered',        description: 'Your order has arrived.' },
] as const;

export type TrackingStageKey = (typeof TRACKING_STAGES)[number]['key'];

/**
 * Map the raw DB status + payment_status onto the timeline — the index of the
 * furthest reached stage. Anything we don't recognise is conservatively
 * treated as just-placed.
 */
export function resolveCurrentStageIndex(order: TrackOrderResult): number {
  const status = (order.status || '').toLowerCase();
  const payment = (order.payment_status || '').toLowerCase();

  if (status === 'delivered') return 4;
  if (status === 'shipped') return 3;
  if (status === 'processing' || status === 'finalised') return 2;

  // Pending payment but payment has been confirmed → show "Payment Received".
  if (payment === 'confirmed' || payment === 'paid' || order.paid_at) return 1;

  return 0;
}

export function isCancelled(order: TrackOrderResult): boolean {
  return (order.status || '').toLowerCase() === 'cancelled';
}
