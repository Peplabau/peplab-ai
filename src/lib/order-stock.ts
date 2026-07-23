/**
 * Order → inventory sync.
 * Industry practice for bank-transfer shops: commit stock when payment is confirmed.
 * Safety net: also ensure deduction when marking shipped (no double-count via stock_deducted).
 * Preorder / free-gift lines are skipped. Cancel restores previously deducted stock.
 */

import { supabase } from '@/lib/supabase';
import { invalidateCache } from '@/lib/cache';
import { formatDosageLabel } from '@/products';
import { normalizeAdminDosageKey } from '@/lib/admin-analytics';

export type OrderStockLine = {
  product_id?: string;
  name?: string;
  dosage?: string | number;
  quantity?: number;
  is_free?: boolean;
  is_preorder?: boolean;
};

export type OrderStockResult = {
  ok: boolean;
  alreadyDone?: boolean;
  linesChanged: number;
  linesSkipped: number;
  unmatched: string[];
  error?: string;
  /** True when orders.stock_deducted column is missing (pre-migration). */
  flagUnavailable?: boolean;
};

type DosageMatch = {
  id: string;
  stock_quantity: number;
  in_stock: boolean;
  productSlug: string;
  labelKey: string;
};

function lineQty(item: OrderStockLine): number {
  const q = Number(item.quantity);
  return Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
}

function shouldAffectStock(item: OrderStockLine): boolean {
  if (item?.is_free) return false;
  if (item?.is_preorder) return false;
  return true;
}

async function loadDosageIndex(): Promise<DosageMatch[]> {
  const { data, error } = await supabase
    .from('products')
    .select('slug, product_dosages(id, mg, unit, stock_quantity, in_stock)');
  if (error) throw error;

  const rows: DosageMatch[] = [];
  for (const product of data || []) {
    const slug = String(product.slug || '').trim().toLowerCase();
    for (const d of product.product_dosages || []) {
      const label = formatDosageLabel(d.mg, d.unit ?? 'MG');
      rows.push({
        id: d.id,
        stock_quantity: Math.max(0, Number(d.stock_quantity) || 0),
        in_stock: d.in_stock !== false,
        productSlug: slug,
        labelKey: normalizeAdminDosageKey(label),
      });
    }
  }
  return rows;
}

function findDosage(index: DosageMatch[], item: OrderStockLine): DosageMatch | null {
  const productKey = String(item.product_id || '').trim().toLowerCase();
  const dosageKey = normalizeAdminDosageKey(String(item.dosage ?? ''));
  if (!productKey || !dosageKey) return null;

  const exact = index.find((r) => r.productSlug === productKey && r.labelKey === dosageKey);
  if (exact) return exact;

  // Fallback: same product, dosage key contains / equals numeric prefix (e.g. "10" vs "10 mg")
  const candidates = index.filter((r) => r.productSlug === productKey);
  if (candidates.length === 1) return candidates[0];

  const compact = dosageKey.replace(/\s+/g, '');
  return (
    candidates.find((r) => r.labelKey.replace(/\s+/g, '') === compact) ||
    candidates.find((r) => r.labelKey.startsWith(dosageKey) || dosageKey.startsWith(r.labelKey.split(' ')[0])) ||
    null
  );
}

async function claimDeductionFlag(orderId: string): Promise<{
  claimed: boolean;
  alreadyDone: boolean;
  flagUnavailable: boolean;
  items: OrderStockLine[] | null;
}> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('orders')
    .update({ stock_deducted: true, stock_deducted_at: now })
    .eq('id', orderId)
    .eq('stock_deducted', false)
    .select('id, items')
    .maybeSingle();

  if (!error && data) {
    return {
      claimed: true,
      alreadyDone: false,
      flagUnavailable: false,
      items: Array.isArray(data.items) ? (data.items as OrderStockLine[]) : [],
    };
  }

  if (error && (error.message?.includes('stock_deducted') || error.code === '42703')) {
    // Migration not applied — caller must only deduct from the paid path (not shipped)
    // to avoid double-counting without an idempotency flag.
    const { data: order } = await supabase.from('orders').select('items').eq('id', orderId).maybeSingle();
    return {
      claimed: true,
      alreadyDone: false,
      flagUnavailable: true,
      items: Array.isArray(order?.items) ? (order!.items as OrderStockLine[]) : [],
    };
  }

  // No row updated → already deducted, or order missing.
  const { data: existing } = await supabase
    .from('orders')
    .select('stock_deducted, items')
    .eq('id', orderId)
    .maybeSingle();

  if (existing?.stock_deducted) {
    return { claimed: false, alreadyDone: true, flagUnavailable: false, items: null };
  }

  return {
    claimed: false,
    alreadyDone: false,
    flagUnavailable: false,
    items: Array.isArray(existing?.items) ? (existing.items as OrderStockLine[]) : null,
  };
}

async function clearDeductionFlag(orderId: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ stock_deducted: false, stock_deducted_at: null })
    .eq('id', orderId)
    .eq('stock_deducted', true);
  if (error && (error.message?.includes('stock_deducted') || error.code === '42703')) {
    return true; // treat as ok without flag
  }
  return !error;
}

async function adjustLines(
  items: OrderStockLine[],
  direction: 'deduct' | 'restore',
): Promise<{ linesChanged: number; linesSkipped: number; unmatched: string[] }> {
  const index = await loadDosageIndex();
  let linesChanged = 0;
  let linesSkipped = 0;
  const unmatched: string[] = [];

  for (const item of items) {
    if (!shouldAffectStock(item)) {
      linesSkipped += 1;
      continue;
    }
    const match = findDosage(index, item);
    const qty = lineQty(item);
    if (!match) {
      unmatched.push(`${item.product_id || item.name || '?'} ${item.dosage || ''}`.trim());
      linesSkipped += 1;
      continue;
    }

    const nextQty =
      direction === 'deduct'
        ? Math.max(0, match.stock_quantity - qty)
        : match.stock_quantity + qty;

    const patch: { stock_quantity: number; in_stock?: boolean } = { stock_quantity: nextQty };
    if (direction === 'deduct' && nextQty <= 0) {
      patch.in_stock = false;
    }
    // Restore does not auto-flip in_stock true — admin controls storefront availability.

    const { error } = await supabase.from('product_dosages').update(patch).eq('id', match.id);
    if (error) {
      console.warn('order-stock adjust failed:', match.id, error.message);
      unmatched.push(`${item.product_id} ${item.dosage}`);
      linesSkipped += 1;
      continue;
    }

    // Keep local index in sync for multi-line same SKU.
    match.stock_quantity = nextQty;
    if (patch.in_stock === false) match.in_stock = false;
    linesChanged += 1;
  }

  if (linesChanged > 0) {
    invalidateCache('products:');
    invalidateCache('admin:products');
    invalidateCache('admin:stock');
    invalidateCache('admin:overview');
  }

  return { linesChanged, linesSkipped, unmatched };
}

/**
 * Deduct stock once for an order.
 * @param source `paid` = primary industry trigger; `shipped` = safety net (skipped if flag column missing).
 */
export async function ensureOrderStockDeducted(
  orderId: string,
  itemsHint?: OrderStockLine[] | null,
  source: 'paid' | 'shipped' = 'paid',
): Promise<OrderStockResult> {
  try {
    const claim = await claimDeductionFlag(orderId);
    if (claim.alreadyDone) {
      return { ok: true, alreadyDone: true, linesChanged: 0, linesSkipped: 0, unmatched: [] };
    }

    // Without stock_deducted column, only deduct on paid — shipped would double-count.
    if (claim.flagUnavailable && source === 'shipped') {
      return {
        ok: true,
        alreadyDone: true,
        linesChanged: 0,
        linesSkipped: 0,
        unmatched: [],
        flagUnavailable: true,
      };
    }

    if (!claim.claimed) {
      return { ok: false, linesChanged: 0, linesSkipped: 0, unmatched: [], error: 'could_not_claim' };
    }

    const items = (claim.items && claim.items.length > 0 ? claim.items : itemsHint) ?? [];
    const result = await adjustLines(items, 'deduct');

    if (result.linesChanged === 0 && result.unmatched.length > 0 && !claim.flagUnavailable) {
      // Keep flag true so we don't retry forever on bad line data; admin can fix qty manually.
      console.warn('Order stock deduction: unmatched lines', orderId, result.unmatched);
    }

    return {
      ok: true,
      linesChanged: result.linesChanged,
      linesSkipped: result.linesSkipped,
      unmatched: result.unmatched,
      flagUnavailable: claim.flagUnavailable,
    };
  } catch (err: any) {
    console.error('ensureOrderStockDeducted:', err);
    return {
      ok: false,
      linesChanged: 0,
      linesSkipped: 0,
      unmatched: [],
      error: err?.message || 'unknown',
    };
  }
}

/**
 * Restore stock when a previously deducted order is cancelled.
 */
export async function restoreOrderStock(
  orderId: string,
  itemsHint?: OrderStockLine[] | null,
  alreadyDeducted?: boolean | null,
): Promise<OrderStockResult> {
  try {
    let deducted = alreadyDeducted;
    let items = itemsHint ?? null;

    if (deducted == null || items == null) {
      const { data, error } = await supabase
        .from('orders')
        .select('stock_deducted, items')
        .eq('id', orderId)
        .maybeSingle();

      if (error && (error.message?.includes('stock_deducted') || error.code === '42703')) {
        // Without flag we cannot safely know — skip restore to avoid inventing stock.
        return {
          ok: true,
          alreadyDone: true,
          linesChanged: 0,
          linesSkipped: 0,
          unmatched: [],
          flagUnavailable: true,
        };
      }
      if (error) throw error;
      deducted = Boolean(data?.stock_deducted);
      items = Array.isArray(data?.items) ? (data.items as OrderStockLine[]) : [];
    }

    if (!deducted) {
      return { ok: true, alreadyDone: true, linesChanged: 0, linesSkipped: 0, unmatched: [] };
    }

    const result = await adjustLines(items || [], 'restore');
    await clearDeductionFlag(orderId);

    return {
      ok: true,
      linesChanged: result.linesChanged,
      linesSkipped: result.linesSkipped,
      unmatched: result.unmatched,
    };
  } catch (err: any) {
    console.error('restoreOrderStock:', err);
    return {
      ok: false,
      linesChanged: 0,
      linesSkipped: 0,
      unmatched: [],
      error: err?.message || 'unknown',
    };
  }
}
