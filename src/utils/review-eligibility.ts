import type { OrderFromDB } from '@/lib/supabase-db';
import { orderUnlocksTrustpilot } from '@/utils/trustpilot-access';

export type ReviewableProduct = {
  product_id: string;
  name: string;
};

export function slugifyProductId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '');
}

export function extractOrderItemProduct(item: unknown): ReviewableProduct | null {
  if (!item || typeof item !== 'object') return null;

  const raw = item as Record<string, unknown>;
  const rawProductId = raw.product_id;
  const rawName = raw.name;

  const idCandidate =
    rawProductId != null && String(rawProductId).trim() !== ''
      ? String(rawProductId).trim()
      : rawName != null
        ? slugifyProductId(String(rawName))
        : '';

  if (!idCandidate) return null;

  return {
    product_id: idCandidate,
    name: String(rawName ?? rawProductId ?? idCandidate),
  };
}

/** Unique purchasable products the user can review (paid/shipped orders only). */
export function getReviewableProductsFromOrders(orders: OrderFromDB[]): ReviewableProduct[] {
  const seen = new Set<string>();
  const out: ReviewableProduct[] = [];

  for (const order of orders) {
    if (!orderUnlocksTrustpilot(order)) continue;
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const parsed = extractOrderItemProduct(item);
      if (!parsed || seen.has(parsed.product_id)) continue;
      seen.add(parsed.product_id);
      out.push(parsed);
    }
  }

  return out;
}

/** Reviewable line items for a single order (may include duplicates collapsed by product_id). */
export function getReviewableProductsForOrder(order: OrderFromDB): ReviewableProduct[] {
  if (!orderUnlocksTrustpilot(order)) return [];

  const seen = new Set<string>();
  const out: ReviewableProduct[] = [];
  const items = Array.isArray(order.items) ? order.items : [];

  for (const item of items) {
    const parsed = extractOrderItemProduct(item);
    if (!parsed || seen.has(parsed.product_id)) continue;
    seen.add(parsed.product_id);
    out.push(parsed);
  }

  return out;
}
