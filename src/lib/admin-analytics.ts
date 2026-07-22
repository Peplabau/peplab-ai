/**
 * Admin inventory + best-seller helpers.
 * Read-only aggregations over existing orders / product_dosages — no checkout side effects.
 */

export const LOW_STOCK_THRESHOLD = 5;
export const CRITICAL_STOCK_THRESHOLD = 2;

/** Orders that reflect real demand (paid / in fulfilment). */
export const BEST_SELLER_COUNTED_STATUSES = new Set([
  'processing',
  'finalised',
  'shipped',
  'delivered',
]);

export function normalizeAdminDosageKey(label: string): string {
  return String(label ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function orderCountsTowardBestSellers(order: {
  status?: string | null;
  payment_status?: string | null;
}): boolean {
  const status = (order.status || '').toLowerCase();
  if (
    status === 'cancelled' ||
    status === 'refunded' ||
    status === 'pending_payment'
  ) {
    return false;
  }
  if ((order.payment_status || '').toLowerCase() === 'confirmed') return true;
  return BEST_SELLER_COUNTED_STATUSES.has(status);
}

export interface BestSellerItem {
  key: string;
  productId: string;
  name: string;
  dosage: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

export type BsTimeFilter = '7d' | '30d' | '90d' | 'all';
export type BsGroupBy = 'variant' | 'product';

export function aggregateBestSellers(
  ordersWithItems: Array<{
    items: unknown;
    created_at: string;
    status: string;
    payment_status?: string | null;
  }>,
  timeFilter: BsTimeFilter,
  groupBy: BsGroupBy = 'variant',
): BestSellerItem[] {
  const now = Date.now();
  const cutoffs: Record<BsTimeFilter, number> = {
    '7d': now - 7 * 86400_000,
    '30d': now - 30 * 86400_000,
    '90d': now - 90 * 86400_000,
    all: 0,
  };
  const cutoff = cutoffs[timeFilter];
  const map = new Map<string, BestSellerItem>();

  for (const order of ordersWithItems) {
    if (!orderCountsTowardBestSellers(order)) continue;
    if (cutoff > 0 && new Date(order.created_at).getTime() < cutoff) continue;

    const items: any[] = Array.isArray(order.items) ? order.items : [];
    const seenInOrder = new Set<string>();

    for (const item of items) {
      if (item?.is_free) continue;

      const name = String(item?.name ?? '').trim();
      const dosage = String(item?.dosage ?? '').trim();
      const productId = String(item?.product_id ?? '').trim();
      if (!name && !productId) continue;

      const dosageKey = normalizeAdminDosageKey(dosage);
      const productKey = (productId || normalizeAdminDosageKey(name)).toLowerCase();
      const key =
        groupBy === 'product'
          ? `p:${productKey}`
          : `v:${productKey}||${dosageKey || normalizeAdminDosageKey(name)}`;

      const qty = Number(item?.quantity);
      const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
      const price = Number(item?.price);
      const safePrice = Number.isFinite(price) ? price : 0;

      const existing = map.get(key);
      if (existing) {
        existing.unitsSold += safeQty;
        existing.revenue += safePrice * safeQty;
        if (!seenInOrder.has(key)) {
          existing.orderCount += 1;
          seenInOrder.add(key);
        }
        if (!existing.name && name) existing.name = name;
        if (groupBy === 'variant' && !existing.dosage && dosage) existing.dosage = dosage;
      } else {
        map.set(key, {
          key,
          productId,
          name: name || productId || 'Unknown',
          dosage: groupBy === 'product' ? '' : dosage,
          unitsSold: safeQty,
          revenue: safePrice * safeQty,
          orderCount: 1,
        });
        seenInOrder.add(key);
      }
    }
  }

  return Array.from(map.values());
}

export interface InventoryVariantRow {
  productId: string;
  productName: string;
  dosageId: string;
  dosageLabel: string;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
}

export interface InventorySummary {
  totalProducts: number;
  activeProducts: number;
  totalVariants: number;
  inStockVariants: number;
  outOfStockVariants: number;
  unitsOnHand: number;
  lowStockVariants: number;
  fullyOutOfStockProducts: number;
  mismatchedVariants: number;
  inventoryValue: number;
  lowStockRows: InventoryVariantRow[];
  outOfStockRows: InventoryVariantRow[];
}

export type StockStatus = 'healthy' | 'low' | 'critical' | 'oos' | 'mismatch' | 'inactive';

export interface InventoryLedgerRow {
  productId: string;
  productName: string;
  productSlug: string;
  category: string;
  dosageId: string;
  dosageLabel: string;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  unitPrice: number;
  status: StockStatus;
  unitsSold7d: number;
  unitsSold30d: number;
  /** Rough days of cover at 30d average daily rate; null if no recent sales. */
  daysOfCover: number | null;
  inventoryValue: number;
}

function dosageLabel(d: { mg?: unknown; unit?: string | null }): string {
  const mg = d.mg ?? '';
  const unit = (d.unit ?? 'MG').toString();
  return `${mg} ${unit}`.trim();
}

export function getStockStatus(
  inStock: boolean,
  qty: number,
  isActive: boolean,
  lowStockThreshold = LOW_STOCK_THRESHOLD,
  criticalThreshold = CRITICAL_STOCK_THRESHOLD,
): StockStatus {
  if (!isActive) return 'inactive';
  if (!inStock) return 'oos';
  if (qty <= 0) return 'mismatch';
  if (qty <= criticalThreshold) return 'critical';
  if (qty <= lowStockThreshold) return 'low';
  return 'healthy';
}

export const STOCK_STATUS_META: Record<
  StockStatus,
  { label: string; color: string; bg: string; hint: string }
> = {
  healthy: {
    label: 'In stock',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
    hint: 'Healthy quantity',
  },
  low: {
    label: 'Low stock',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    hint: `≤ ${LOW_STOCK_THRESHOLD} units left`,
  },
  critical: {
    label: 'Critical',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.18)',
    hint: `≤ ${CRITICAL_STOCK_THRESHOLD} units — restock soon`,
  },
  oos: {
    label: 'Out of stock',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.15)',
    hint: 'Storefront shows OOS / preorder',
  },
  mismatch: {
    label: 'Qty 0 (live)',
    color: '#EAB308',
    bg: 'rgba(234,179,8,0.15)',
    hint: 'Marked in stock but quantity is 0',
  },
  inactive: {
    label: 'Inactive',
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.2)',
    hint: 'Product hidden from storefront',
  },
};

/** Aggregate paid units sold per product_id/slug + dosage within a day window. */
export function aggregateVariantSales(
  ordersWithItems: Array<{
    items: unknown;
    created_at: string;
    status: string;
    payment_status?: string | null;
  }>,
  windowDays: number,
): Map<string, number> {
  const cutoff = Date.now() - windowDays * 86400_000;
  const map = new Map<string, number>();

  for (const order of ordersWithItems) {
    if (!orderCountsTowardBestSellers(order)) continue;
    if (new Date(order.created_at).getTime() < cutoff) continue;

    const items: any[] = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      if (item?.is_free) continue;
      const productId = String(item?.product_id ?? '').trim().toLowerCase();
      const name = String(item?.name ?? '').trim();
      const dosage = normalizeAdminDosageKey(String(item?.dosage ?? ''));
      const qty = Number(item?.quantity);
      const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
      if (!productId && !name) continue;

      const keys = [
        productId ? `${productId}||${dosage}` : '',
        name ? `${normalizeAdminDosageKey(name)}||${dosage}` : '',
      ].filter(Boolean);

      for (const key of keys) {
        map.set(key, (map.get(key) || 0) + safeQty);
      }
    }
  }

  return map;
}

type ProductInput = {
  id: string;
  name?: string | null;
  slug?: string | null;
  category?: string | null;
  is_active?: boolean | null;
  product_dosages?: Array<{
    id: string;
    mg?: unknown;
    unit?: string | null;
    in_stock?: boolean | null;
    stock_quantity?: number | null;
    original_price?: number | null;
    originalPrice?: number | null;
    price?: number | null;
  }> | null;
};

function lookupSales(
  sales: Map<string, number>,
  slug: string,
  name: string,
  dosage: string,
): number {
  const d = normalizeAdminDosageKey(dosage);
  const keys = [
    `${slug.toLowerCase()}||${d}`,
    `${normalizeAdminDosageKey(name)}||${d}`,
  ];
  for (const key of keys) {
    const n = sales.get(key);
    if (n) return n;
  }
  return 0;
}

export function buildInventoryLedger(
  products: ProductInput[],
  sales7d: Map<string, number> = new Map(),
  sales30d: Map<string, number> = new Map(),
  lowStockThreshold = LOW_STOCK_THRESHOLD,
): InventoryLedgerRow[] {
  const rows: InventoryLedgerRow[] = [];

  for (const product of products) {
    const active = product.is_active !== false;
    const slug = String(product.slug || '').trim();
    const name = product.name || 'Untitled';
    const dosages = Array.isArray(product.product_dosages) ? product.product_dosages : [];

    for (const d of dosages) {
      const qty = Math.max(0, Number(d.stock_quantity) || 0);
      const inStock = d.in_stock !== false;
      const label = dosageLabel(d);
      const unitPrice = Number(d.original_price ?? d.originalPrice ?? d.price ?? 0) || 0;
      const sold7 = lookupSales(sales7d, slug, name, label);
      const sold30 = lookupSales(sales30d, slug, name, label);
      const daily = sold30 > 0 ? sold30 / 30 : 0;
      const daysOfCover = daily > 0 ? Math.round((qty / daily) * 10) / 10 : null;

      rows.push({
        productId: product.id,
        productName: name,
        productSlug: slug,
        category: product.category || '',
        dosageId: d.id,
        dosageLabel: label,
        stockQuantity: qty,
        inStock,
        isActive: active,
        unitPrice,
        status: getStockStatus(inStock, qty, active, lowStockThreshold),
        unitsSold7d: sold7,
        unitsSold30d: sold30,
        daysOfCover,
        inventoryValue: inStock ? qty * unitPrice : 0,
      });
    }
  }

  const statusRank: Record<StockStatus, number> = {
    mismatch: 0,
    critical: 1,
    oos: 2,
    low: 3,
    healthy: 4,
    inactive: 5,
  };

  rows.sort((a, b) => {
    const sr = statusRank[a.status] - statusRank[b.status];
    if (sr !== 0) return sr;
    if (a.stockQuantity !== b.stockQuantity) return a.stockQuantity - b.stockQuantity;
    return a.productName.localeCompare(b.productName) || a.dosageLabel.localeCompare(b.dosageLabel);
  });

  return rows;
}

export function summarizeInventory(
  products: ProductInput[],
  lowStockThreshold = LOW_STOCK_THRESHOLD,
): InventorySummary {
  const lowStockRows: InventoryVariantRow[] = [];
  const outOfStockRows: InventoryVariantRow[] = [];
  let totalVariants = 0;
  let inStockVariants = 0;
  let outOfStockVariants = 0;
  let unitsOnHand = 0;
  let mismatchedVariants = 0;
  let fullyOutOfStockProducts = 0;
  let activeProducts = 0;
  let inventoryValue = 0;

  for (const product of products) {
    const active = product.is_active !== false;
    if (active) activeProducts += 1;

    const dosages = Array.isArray(product.product_dosages) ? product.product_dosages : [];
    if (dosages.length === 0) {
      if (active) fullyOutOfStockProducts += 1;
      continue;
    }

    let anyInStock = false;
    for (const d of dosages) {
      totalVariants += 1;
      const qty = Math.max(0, Number(d.stock_quantity) || 0);
      const inStock = d.in_stock !== false;
      const unitPrice = Number(d.original_price ?? d.originalPrice ?? d.price ?? 0) || 0;
      const row: InventoryVariantRow = {
        productId: product.id,
        productName: product.name || 'Untitled',
        dosageId: d.id,
        dosageLabel: dosageLabel(d),
        stockQuantity: qty,
        inStock,
        isActive: active,
      };

      if (inStock) {
        anyInStock = true;
        inStockVariants += 1;
        unitsOnHand += qty;
        inventoryValue += qty * unitPrice;
        if (qty <= 0) {
          mismatchedVariants += 1;
          lowStockRows.push(row);
        } else if (qty <= lowStockThreshold) {
          lowStockRows.push(row);
        }
      } else {
        outOfStockVariants += 1;
        outOfStockRows.push(row);
      }
    }

    if (active && !anyInStock) fullyOutOfStockProducts += 1;
  }

  lowStockRows.sort((a, b) => a.stockQuantity - b.stockQuantity || a.productName.localeCompare(b.productName));
  outOfStockRows.sort((a, b) => a.productName.localeCompare(b.productName) || a.dosageLabel.localeCompare(b.dosageLabel));

  return {
    totalProducts: products.length,
    activeProducts,
    totalVariants,
    inStockVariants,
    outOfStockVariants,
    unitsOnHand,
    lowStockVariants: lowStockRows.length,
    fullyOutOfStockProducts,
    mismatchedVariants,
    inventoryValue,
    lowStockRows,
    outOfStockRows,
  };
}

export function inventoryLedgerToCsv(rows: InventoryLedgerRow[]): string {
  const header = [
    'Product',
    'Slug',
    'Dosage',
    'Category',
    'Status',
    'In stock flag',
    'Quantity',
    'Unit price',
    'Inventory value',
    'Sold 7d',
    'Sold 30d',
    'Days of cover',
    'Active',
  ];
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [
      r.productName,
      r.productSlug,
      r.dosageLabel,
      r.category,
      STOCK_STATUS_META[r.status].label,
      r.inStock ? 'yes' : 'no',
      r.stockQuantity,
      r.unitPrice,
      r.inventoryValue,
      r.unitsSold7d,
      r.unitsSold30d,
      r.daysOfCover ?? '',
      r.isActive ? 'yes' : 'no',
    ]
      .map(escape)
      .join(','),
  );
  return [header.join(','), ...lines].join('\n');
}
