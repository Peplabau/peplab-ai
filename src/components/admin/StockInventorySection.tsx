import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  CheckCircle,
  Download,
  MinusCircle,
  Package,
  Percent,
  PlusCircle,
  RefreshCw,
  Search,
  Tag,
  X,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { cached, invalidateCache, TTL_ADMIN_PRODUCTS } from '@/lib/cache';
import {
  aggregateVariantSales,
  buildInventoryLedger,
  inventoryLedgerToCsv,
  LOW_STOCK_THRESHOLD,
  STOCK_STATUS_META,
  summarizeInventory,
  type InventoryLedgerRow,
  type StockStatus,
} from '@/lib/admin-analytics';

const SUPABASE_PAGE_SIZE = 1000;
const MIN_PRICE = 1;

type DropMode = 'percent' | 'amount';

function isNotSellingRow(row: InventoryLedgerRow): boolean {
  return (
    row.isActive &&
    row.unitsSold30d === 0 &&
    (row.inStock || row.stockQuantity > 0) &&
    row.status !== 'inactive'
  );
}

function computeDroppedPrice(current: number, mode: DropMode, value: number): number {
  if (!Number.isFinite(current) || current <= 0) return current;
  if (!Number.isFinite(value) || value <= 0) return current;
  const next = mode === 'percent' ? current * (1 - value / 100) : current - value;
  return Math.max(MIN_PRICE, Math.round(next * 100) / 100);
}

async function fetchSupabasePages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message?: string } | null }>,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw error;
    const page = data ?? [];
    all.push(...page);
    if (page.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }
  return all;
}

type StockFilter = 'all' | 'needs_attention' | 'not_selling' | StockStatus;
type SortKey = 'priority' | 'qty_asc' | 'qty_desc' | 'sold30' | 'sold30_asc' | 'not_selling_first' | 'name';

export default function StockInventorySection() {
  const [products, setProducts] = useState<any[]>([]);
  const [sales7d, setSales7d] = useState<Map<string, number>>(new Map());
  const [sales30d, setSales30d] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StockFilter>('not_selling');
  const [sortKey, setSortKey] = useState<SortKey>('not_selling_first');
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPriceDrop, setShowPriceDrop] = useState(false);
  const [dropMode, setDropMode] = useState<DropMode>('percent');
  const [dropValue, setDropValue] = useState('10');
  const [applyingPrices, setApplyingPrices] = useState(false);
  const requestIdRef = useRef(0);

  const load = useCallback(async (bust = false) => {
    const requestId = ++requestIdRef.current;
    if (bust) {
      invalidateCache('admin:stock');
      invalidateCache('admin:products');
      invalidateCache('admin:overview');
      invalidateCache('products:');
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await cached(
        'admin:stock',
        async () => {
          // Use product_dosages(*) — live DB uses camelCase "originalPrice", not original_price.
          const loadProducts = async () => {
            const { data, error } = await supabase
              .from('products')
              .select('id, name, slug, category, is_active, product_dosages(*)')
              .order('display_order', { ascending: true, nullsFirst: false });
            if (error && error.message?.includes('display_order')) {
              const { data: fallback, error: fallbackErr } = await supabase
                .from('products')
                .select('id, name, slug, category, is_active, product_dosages(*)')
                .order('name');
              if (fallbackErr) throw fallbackErr;
              return fallback || [];
            }
            if (error) throw error;
            return data || [];
          };

          const loadOrders = async () => {
            try {
              return await fetchSupabasePages((from, to) =>
                supabase
                  .from('orders')
                  .select('items, created_at, status, payment_status')
                  .neq('status', 'cancelled')
                  .order('created_at', { ascending: false })
                  .range(from, to),
              );
            } catch (orderErr) {
              // Inventory must still load if sales aggregation fails.
              console.warn('Stock sales load failed (inventory still shown):', orderErr);
              return [] as Array<{
                items: unknown;
                created_at: string;
                status: string;
                payment_status?: string | null;
              }>;
            }
          };

          const [productRows, itemOrders] = await Promise.all([loadProducts(), loadOrders()]);
          return { productRows, itemOrders };
        },
        TTL_ADMIN_PRODUCTS,
      );

      if (requestId !== requestIdRef.current) return;
      setProducts(result.productRows);
      setSales7d(aggregateVariantSales(result.itemOrders, 7));
      setSales30d(aggregateVariantSales(result.itemOrders, 30));
    } catch (err: any) {
      console.error('Stock inventory load failed:', err);
      if (requestId === requestIdRef.current) {
        const detail = err?.message || err?.error_description || '';
        setMessage(
          detail
            ? `Failed to load inventory: ${detail}`
            : 'Failed to load inventory. Please refresh.',
        );
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => summarizeInventory(products), [products]);
  const ledger = useMemo(
    () => buildInventoryLedger(products, sales7d, sales30d),
    [products, sales7d, sales30d],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StockStatus | 'needs_attention' | 'not_selling', number> = {
      needs_attention: 0,
      not_selling: 0,
      healthy: 0,
      low: 0,
      critical: 0,
      oos: 0,
      mismatch: 0,
      inactive: 0,
    };
    for (const row of ledger) {
      counts[row.status] += 1;
      if (row.status === 'critical' || row.status === 'low' || row.status === 'oos' || row.status === 'mismatch') {
        counts.needs_attention += 1;
      }
      if (
        isNotSellingRow(row)
      ) {
        counts.not_selling += 1;
      }
    }
    return counts;
  }, [ledger]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = ledger.filter((row) => {
      if (filter === 'needs_attention') {
        if (!['critical', 'low', 'oos', 'mismatch'].includes(row.status)) return false;
      } else if (filter === 'not_selling') {
        if (!isNotSellingRow(row)) {
          return false;
        }
      } else if (filter !== 'all' && row.status !== filter) {
        return false;
      }
      if (!q) return true;
      return (
        row.productName.toLowerCase().includes(q) ||
        row.productSlug.toLowerCase().includes(q) ||
        row.dosageLabel.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      );
    });

    rows = [...rows];
    if (sortKey === 'qty_asc') rows.sort((a, b) => a.stockQuantity - b.stockQuantity);
    else if (sortKey === 'qty_desc') rows.sort((a, b) => b.stockQuantity - a.stockQuantity);
    else if (sortKey === 'sold30') rows.sort((a, b) => b.unitsSold30d - a.unitsSold30d);
    else if (sortKey === 'sold30_asc') {
      rows.sort(
        (a, b) =>
          a.unitsSold30d - b.unitsSold30d ||
          b.stockQuantity - a.stockQuantity ||
          a.productName.localeCompare(b.productName),
      );
    } else if (sortKey === 'not_selling_first') {
      rows.sort((a, b) => {
        const aDead = isNotSellingRow(a) ? 0 : 1;
        const bDead = isNotSellingRow(b) ? 0 : 1;
        if (aDead !== bDead) return aDead - bDead;
        return (
          a.unitsSold30d - b.unitsSold30d ||
          b.stockQuantity - a.stockQuantity ||
          a.productName.localeCompare(b.productName)
        );
      });
    } else if (sortKey === 'name') {
      rows.sort((a, b) => a.productName.localeCompare(b.productName) || a.dosageLabel.localeCompare(b.dosageLabel));
    }
    // priority = buildInventoryLedger default order
    return rows;
  }, [ledger, filter, query, sortKey]);

  const selectedRows = useMemo(
    () => ledger.filter((r) => selectedIds.has(r.dosageId)),
    [ledger, selectedIds],
  );

  const dropAmount = Number(dropValue);
  const pricePreview = useMemo(() => {
    const value = Number.isFinite(dropAmount) ? dropAmount : 0;
    return selectedRows
      .filter((r) => r.unitPrice > 0)
      .map((r) => ({
        ...r,
        newPrice: computeDroppedPrice(r.unitPrice, dropMode, value),
      }))
      .filter((r) => r.newPrice < r.unitPrice - 0.001);
  }, [selectedRows, dropMode, dropAmount]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((r) => selectedIds.has(r.dosageId));

  const toggleSelect = (dosageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(dosageId)) next.delete(dosageId);
      else next.add(dosageId);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const row of filtered) next.delete(row.dosageId);
      } else {
        for (const row of filtered) next.add(row.dosageId);
      }
      return next;
    });
  };

  const selectAllNotSelling = () => {
    setFilter('not_selling');
    setSortKey('not_selling_first');
    setSelectedIds(new Set(ledger.filter(isNotSellingRow).map((r) => r.dosageId)));
  };

  const applyBulkPriceDrop = async () => {
    if (pricePreview.length === 0) {
      setMessage('No prices would change. Check the amount and selected items.');
      return;
    }
    setApplyingPrices(true);
    setMessage(null);
    try {
      const chunkSize = 8;
      for (let i = 0; i < pricePreview.length; i += chunkSize) {
        const chunk = pricePreview.slice(i, i + chunkSize);
        const results = await Promise.all(
          chunk.map(async (row) => {
            const { error } = await supabase
              .from('product_dosages')
              .update({
                originalPrice: row.newPrice,
                updated_at: new Date().toISOString(),
              })
              .eq('id', row.dosageId);
            if (error) throw error;
          }),
        );
        void results;
      }
      invalidateCache('admin:stock');
      invalidateCache('admin:products');
      invalidateCache('admin:overview');
      invalidateCache('products:');
      setShowPriceDrop(false);
      setSelectedIds(new Set());
      setMessage(
        `Updated ${pricePreview.length} price${pricePreview.length === 1 ? '' : 's'} (${
          dropMode === 'percent' ? `−${dropAmount}%` : `−$${dropAmount}`
        }).`,
      );
      await load(true);
    } catch (err) {
      console.error('Bulk price drop failed:', err);
      setMessage('Could not update some prices. Refresh and try again.');
    } finally {
      setApplyingPrices(false);
    }
  };

  const persistStock = async (
    dosageId: string,
    qty: number,
    currentlyInStock: boolean,
    opts?: { forceInStock?: boolean },
  ) => {
    const safeQty = Math.max(0, Math.floor(qty));
    setSavingId(dosageId);
    setMessage(null);
    try {
      const patch: { stock_quantity: number; in_stock?: boolean } = { stock_quantity: safeQty };
      if (opts?.forceInStock === true) patch.in_stock = true;
      else if (opts?.forceInStock === false) patch.in_stock = false;
      else if (safeQty === 0 && currentlyInStock) patch.in_stock = false;

      const { error } = await supabase.from('product_dosages').update(patch).eq('id', dosageId);
      if (error) throw error;

      invalidateCache('admin:stock');
      invalidateCache('admin:products');
      invalidateCache('admin:overview');
      invalidateCache('products:');

      setDrafts((prev) => {
        const next = { ...prev };
        delete next[dosageId];
        return next;
      });
      await load(true);
    } catch (err) {
      console.error('Stock update failed:', err);
      setMessage('Could not save stock change. Try again.');
    } finally {
      setSavingId(null);
    }
  };

  const toggleInStock = async (row: InventoryLedgerRow) => {
    setSavingId(row.dosageId);
    setMessage(null);
    try {
      const next = !row.inStock;
      const patch: { in_stock: boolean; stock_quantity?: number } = { in_stock: next };
      // Opening stock with qty 0 is confusing — keep qty as-is; closing stock leaves qty for restock planning.
      const { error } = await supabase.from('product_dosages').update(patch).eq('id', row.dosageId);
      if (error) throw error;
      invalidateCache('admin:stock');
      invalidateCache('admin:products');
      invalidateCache('admin:overview');
      invalidateCache('products:');
      await load(true);
    } catch (err) {
      console.error('Stock toggle failed:', err);
      setMessage('Could not update availability. Try again.');
    } finally {
      setSavingId(null);
    }
  };

  const exportCsv = () => {
    const csv = inventoryLedgerToCsv(filtered.length ? filtered : ledger);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peplab-stock-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F4F6FA] flex items-center gap-2">
            <Box className="w-5 h-5 text-[#2ED1B4]" />
            Stock Room
          </h2>
          <p className="text-sm text-[#A9B3C7] mt-1 max-w-xl">
            Exact quantity per dosage, what is out of stock, and what is selling — update qty here without touching checkout.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={selectAllNotSelling}
            className="px-3 py-2 rounded-xl border border-[rgba(248,113,113,0.3)] text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] flex items-center gap-2 text-sm font-semibold"
          >
            <Tag className="w-4 h-4" />
            Select not selling
          </button>
          <button
            type="button"
            onClick={() => void load(true)}
            className="px-3 py-2 rounded-xl border border-[rgba(244,246,250,0.12)] text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.05)] flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="px-3 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] font-semibold hover:bg-[#25b89d] flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`text-sm px-3 py-2 rounded-xl border ${
            message.startsWith('Updated')
              ? 'text-[#86EFAC] bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.25)]'
              : 'text-[#FCA5A5] bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.25)]'
          }`}
        >
          {message}
        </p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Units on hand" value={summary.unitsOnHand.toLocaleString()} color="#22C55E" icon={Package} />
        <Kpi label="Inventory value" value={`$${Math.round(summary.inventoryValue).toLocaleString()}`} color="#2ED1B4" icon={Box} />
        <Kpi label="In stock" value={`${summary.inStockVariants}/${summary.totalVariants}`} color="#8B5CF6" icon={CheckCircle} />
        <Kpi label="Out of stock" value={String(summary.outOfStockVariants)} color="#EF4444" icon={XCircle} />
        <Kpi label="Needs attention" value={String(statusCounts.needs_attention)} color="#F59E0B" icon={MinusCircle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
          <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">Fully OOS products</p>
          <p className="text-lg font-bold text-[#F4F6FA] mt-1">{summary.fullyOutOfStockProducts}</p>
          <p className="text-[11px] text-[#5A667E]">Active products with no live dosage</p>
        </div>
        <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
          <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">Not selling (30d)</p>
          <p className="text-lg font-bold text-[#F87171] mt-1">{statusCounts.not_selling}</p>
          <p className="text-[11px] text-[#5A667E]">Active stock with 0 paid units</p>
        </div>
        <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
          <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">Qty 0 but still live</p>
          <p className="text-lg font-bold text-[#EAB308] mt-1">{summary.mismatchedVariants}</p>
          <p className="text-[11px] text-[#5A667E]">Fix qty or mark out of stock</p>
        </div>
        <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
          <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">Low / critical</p>
          <p className="text-lg font-bold text-[#F59E0B] mt-1">
            {statusCounts.low + statusCounts.critical}
          </p>
          <p className="text-[11px] text-[#5A667E]">≤ {LOW_STOCK_THRESHOLD} units (critical ≤ 2)</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, dosage, slug…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] placeholder:text-[#5A667E] focus:outline-none focus:border-[#2ED1B4]"
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2.5 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#2ED1B4]"
        >
          <option value="not_selling_first">Sort: Not selling first</option>
          <option value="priority">Sort: Needs attention first</option>
          <option value="qty_asc">Sort: Qty low → high</option>
          <option value="qty_desc">Sort: Qty high → low</option>
          <option value="sold30">Sort: Best sellers (30d)</option>
          <option value="sold30_asc">Sort: Least sold (30d)</option>
          <option value="name">Sort: Product name</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['needs_attention', `Needs attention (${statusCounts.needs_attention})`],
            ['not_selling', `Not selling (${statusCounts.not_selling})`],
            ['all', `All variants (${ledger.length})`],
            ['critical', `Critical (${statusCounts.critical})`],
            ['low', `Low (${statusCounts.low})`],
            ['oos', `Out of stock (${statusCounts.oos})`],
            ['mismatch', `Qty 0 live (${statusCounts.mismatch})`],
            ['healthy', `Healthy (${statusCounts.healthy})`],
            ['inactive', `Inactive (${statusCounts.inactive})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === key
                ? 'bg-[#2ED1B4] text-[#070A12]'
                : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#6B7280]">
        Showing {filtered.length} of {ledger.length} dosage variants · sold counts from paid orders only
      </p>

      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(46,209,180,0.35)] bg-[rgba(7,10,18,0.95)] px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm text-[#F4F6FA]">
            <strong className="text-[#2ED1B4]">{selectedIds.size}</strong> selected
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-3 text-xs font-semibold text-[#A9B3C7] hover:text-[#F4F6FA]"
            >
              Clear
            </button>
          </p>
          <button
            type="button"
            onClick={() => {
              setDropMode('percent');
              setDropValue('10');
              setShowPriceDrop(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2ED1B4] px-4 py-2 text-sm font-semibold text-[#070A12] hover:bg-[#25b89d]"
          >
            <Percent className="h-4 w-4" />
            Drop prices
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-[rgba(244,246,250,0.08)] overflow-hidden bg-[rgba(17,24,39,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead>
              <tr className="border-b border-[rgba(244,246,250,0.08)] text-[10px] uppercase tracking-wide text-[#6B7280]">
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    className="h-4 w-4 rounded border-[rgba(244,246,250,0.3)] accent-[#2ED1B4]"
                    title="Select all visible"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Product / Dosage</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Price</th>
                <th className="px-3 py-3 font-semibold">Qty</th>
                <th className="px-3 py-3 font-semibold">Sold 7d</th>
                <th className="px-3 py-3 font-semibold">Sold 30d</th>
                <th className="px-3 py-3 font-semibold">Cover</th>
                <th className="px-3 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-[#5A667E]">
                    No variants match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <LedgerRowDesktop
                    key={row.dosageId}
                    row={row}
                    selected={selectedIds.has(row.dosageId)}
                    onSelect={() => toggleSelect(row.dosageId)}
                    draft={drafts[row.dosageId]}
                    saving={savingId === row.dosageId}
                    onDraft={(v) => setDrafts((p) => ({ ...p, [row.dosageId]: v }))}
                    onSaveDraft={() => {
                      const raw = drafts[row.dosageId];
                      if (raw === undefined) return;
                      void persistStock(row.dosageId, parseInt(raw, 10) || 0, row.inStock);
                    }}
                    onAdjust={(delta) =>
                      void persistStock(row.dosageId, row.stockQuantity + delta, row.inStock, {
                        forceInStock: row.stockQuantity + delta > 0 ? undefined : false,
                      })
                    }
                    onToggle={() => void toggleInStock(row)}
                    onClearDraft={() =>
                      setDrafts((p) => {
                        const n = { ...p };
                        delete n[row.dosageId];
                        return n;
                      })
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#5A667E] text-center py-10">No variants match this filter.</p>
        ) : (
          filtered.map((row) => (
            <LedgerRowMobile
              key={row.dosageId}
              row={row}
              selected={selectedIds.has(row.dosageId)}
              onSelect={() => toggleSelect(row.dosageId)}
              draft={drafts[row.dosageId]}
              saving={savingId === row.dosageId}
              onDraft={(v) => setDrafts((p) => ({ ...p, [row.dosageId]: v }))}
              onSaveDraft={() => {
                const raw = drafts[row.dosageId];
                if (raw === undefined) return;
                void persistStock(row.dosageId, parseInt(raw, 10) || 0, row.inStock);
              }}
              onAdjust={(delta) =>
                void persistStock(row.dosageId, row.stockQuantity + delta, row.inStock, {
                  forceInStock: row.stockQuantity + delta > 0 ? undefined : false,
                })
              }
              onToggle={() => void toggleInStock(row)}
              onClearDraft={() =>
                setDrafts((p) => {
                  const n = { ...p };
                  delete n[row.dosageId];
                  return n;
                })
              }
            />
          ))
        )}
      </div>

      <p className="text-[11px] text-[#5A667E]">
        {`Setting qty to 0 auto-marks that dosage out of stock. Turning stock back on is always manual so preorders stay under your control. Days of cover ≈ current qty ÷ (30-day paid units ÷ 30). Select variants then use Drop prices for a % or $ cut (never below $${MIN_PRICE.toFixed(2)}).`}
      </p>

      {showPriceDrop && (
        <BulkPriceDropModal
          rows={pricePreview}
          selectedCount={selectedIds.size}
          mode={dropMode}
          value={dropValue}
          applying={applyingPrices}
          onModeChange={setDropMode}
          onValueChange={setDropValue}
          onClose={() => !applyingPrices && setShowPriceDrop(false)}
          onApply={() => void applyBulkPriceDrop()}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: typeof Package;
}) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#F4F6FA] leading-tight">{value}</p>
      <p className="text-[11px] text-[#A9B3C7] mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: StockStatus }) {
  const meta = STOCK_STATUS_META[status];
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={{ color: meta.color, background: meta.bg }}
      title={meta.hint}
    >
      {meta.label}
    </span>
  );
}

type RowActions = {
  row: InventoryLedgerRow;
  selected: boolean;
  onSelect: () => void;
  draft?: string;
  saving: boolean;
  onDraft: (v: string) => void;
  onSaveDraft: () => void;
  onClearDraft: () => void;
  onAdjust: (delta: number) => void;
  onToggle: () => void;
};

function QtyControls({ row, draft, saving, onDraft, onSaveDraft, onClearDraft, onAdjust }: Omit<RowActions, 'onToggle' | 'selected' | 'onSelect'>) {
  const display = draft !== undefined ? draft : String(row.stockQuantity);
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={saving || row.stockQuantity <= 0}
        onClick={() => onAdjust(-1)}
        className="p-1 rounded-md text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.08)] disabled:opacity-30"
        title="−1"
      >
        <MinusCircle className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={0}
        step={1}
        disabled={saving}
        value={display}
        onChange={(e) => onDraft(e.target.value)}
        onBlur={() => {
          if (draft === undefined) return;
          const next = String(parseInt(draft, 10) || 0);
          if (next === String(row.stockQuantity)) {
            onClearDraft();
            return;
          }
          onSaveDraft();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="w-14 px-1.5 py-1 rounded-lg text-sm text-center bg-[rgba(244,246,250,0.06)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] focus:outline-none focus:border-[#2ED1B4] disabled:opacity-50"
      />
      <button
        type="button"
        disabled={saving}
        onClick={() => onAdjust(1)}
        className="p-1 rounded-md text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.08)] disabled:opacity-30"
        title="+1"
      >
        <PlusCircle className="w-4 h-4" />
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={() => onAdjust(5)}
        className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.12)] disabled:opacity-30"
        title="+5"
      >
        +5
      </button>
    </div>
  );
}

function LedgerRowDesktop(props: RowActions) {
  const { row, saving, onToggle, selected, onSelect } = props;
  return (
    <tr
      className={`border-b border-[rgba(244,246,250,0.05)] hover:bg-[rgba(244,246,250,0.02)] ${
        selected ? 'bg-[rgba(46,209,180,0.06)]' : ''
      }`}
    >
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-[rgba(244,246,250,0.3)] accent-[#2ED1B4]"
        />
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-[#F4F6FA]">
          {row.productName}
          {isNotSellingRow(row) && (
            <span className="ml-2 inline-flex rounded-md bg-[rgba(248,113,113,0.15)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#F87171]">
              Not selling
            </span>
          )}
        </p>
        <p className="text-[11px] text-[#6B7280]">{row.dosageLabel}</p>
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-3 py-3 text-sm font-semibold tabular-nums text-[#F4F6FA]">
        {row.unitPrice > 0 ? `$${row.unitPrice.toFixed(2)}` : '—'}
      </td>
      <td className="px-3 py-3">
        <QtyControls {...props} />
      </td>
      <td className="px-3 py-3 text-sm text-[#A9B3C7]">{row.unitsSold7d}</td>
      <td className="px-3 py-3 text-sm font-medium text-[#F4F6FA]">{row.unitsSold30d}</td>
      <td className="px-3 py-3 text-sm text-[#A9B3C7]">
        {row.daysOfCover == null ? '—' : `${row.daysOfCover}d`}
      </td>
      <td className="px-3 py-3 text-sm text-[#2ED1B4]">
        {row.inventoryValue > 0 ? `$${row.inventoryValue.toFixed(0)}` : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={saving}
          onClick={onToggle}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 ${
            row.inStock
              ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.25)]'
              : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.25)]'
          }`}
        >
          {row.inStock ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {row.inStock ? 'Mark OOS' : 'Mark in stock'}
        </button>
      </td>
    </tr>
  );
}

function LedgerRowMobile(props: RowActions) {
  const { row, saving, onToggle, selected, onSelect } = props;
  return (
    <div
      className={`p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border space-y-3 ${
        selected ? 'border-[#2ED1B4]' : 'border-[rgba(244,246,250,0.08)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="mt-1 h-4 w-4 rounded border-[rgba(244,246,250,0.3)] accent-[#2ED1B4]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F4F6FA]">{row.productName}</p>
              <p className="text-[11px] text-[#6B7280]">{row.dosageLabel}</p>
            </div>
            <StatusBadge status={row.status} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-[#A9B3C7]">
        <span>
          Price:{' '}
          <strong className="text-[#F4F6FA]">
            {row.unitPrice > 0 ? `$${row.unitPrice.toFixed(2)}` : '—'}
          </strong>
        </span>
        <span>
          7d: <strong className="text-[#F4F6FA]">{row.unitsSold7d}</strong>
        </span>
        <span>
          30d: <strong className="text-[#F4F6FA]">{row.unitsSold30d}</strong>
        </span>
        {isNotSellingRow(row) && (
          <span className="font-semibold text-[#F87171]">Not selling</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <QtyControls {...props} />
        <button
          type="button"
          disabled={saving}
          onClick={onToggle}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 ${
            row.inStock
              ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
              : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
          }`}
        >
          {row.inStock ? 'Mark OOS' : 'Mark in stock'}
        </button>
      </div>
    </div>
  );
}

function BulkPriceDropModal({
  rows,
  selectedCount,
  mode,
  value,
  applying,
  onModeChange,
  onValueChange,
  onClose,
  onApply,
}: {
  rows: Array<InventoryLedgerRow & { newPrice: number }>;
  selectedCount: number;
  mode: DropMode;
  value: string;
  applying: boolean;
  onModeChange: (m: DropMode) => void;
  onValueChange: (v: string) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const skipped = selectedCount - rows.length;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-[rgba(244,246,250,0.12)] bg-[#0F172A] shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(244,246,250,0.08)] px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#F4F6FA]">Drop prices</h3>
            <p className="mt-1 text-xs text-[#A9B3C7]">
              Permanently lowers original price on selected dosages. Storefront bundles update from this.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="rounded-lg p-1.5 text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.08)] hover:text-[#F4F6FA] disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onModeChange('percent')}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                mode === 'percent'
                  ? 'bg-[rgba(46,209,180,0.18)] text-[#2ED1B4]'
                  : 'bg-[rgba(244,246,250,0.05)] text-[#A9B3C7]'
              }`}
            >
              % off
            </button>
            <button
              type="button"
              onClick={() => onModeChange('amount')}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                mode === 'amount'
                  ? 'bg-[rgba(46,209,180,0.18)] text-[#2ED1B4]'
                  : 'bg-[rgba(244,246,250,0.05)] text-[#A9B3C7]'
              }`}
            >
              $ off
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#A9B3C7]">
              {mode === 'percent' ? 'Percent to drop' : 'Amount to drop (AUD)'}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                {mode === 'percent' ? '%' : '$'}
              </span>
              <input
                type="number"
                min={0}
                step={mode === 'percent' ? 1 : 0.01}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-full rounded-xl border border-[rgba(244,246,250,0.12)] bg-[rgba(7,10,18,0.6)] py-3 pl-8 pr-3 text-base text-[#F4F6FA] focus:border-[#2ED1B4] focus:outline-none"
                placeholder={mode === 'percent' ? '10' : '20'}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#6B7280]">
              Prices never go below ${MIN_PRICE.toFixed(2)}.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#A9B3C7]">
              Preview · {rows.length} will change
              {skipped > 0 ? ` · ${skipped} skipped (no price / no change)` : ''}
            </p>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[rgba(244,246,250,0.08)]">
              {rows.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-[#6B7280]">
                  Enter a value above 0 to see the new prices.
                </p>
              ) : (
                <ul className="divide-y divide-[rgba(244,246,250,0.06)]">
                  {rows.slice(0, 40).map((row) => (
                    <li
                      key={row.dosageId}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#F4F6FA]">{row.productName}</p>
                        <p className="text-[11px] text-[#6B7280]">{row.dosageLabel}</p>
                      </div>
                      <p className="shrink-0 tabular-nums text-[#A9B3C7]">
                        <span className="line-through">${row.unitPrice.toFixed(2)}</span>
                        <span className="mx-1.5 text-[#6B7280]">→</span>
                        <span className="font-bold text-[#2ED1B4]">${row.newPrice.toFixed(2)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {rows.length > 40 && (
                <p className="border-t border-[rgba(244,246,250,0.06)] px-3 py-2 text-center text-[11px] text-[#6B7280]">
                  +{rows.length - 40} more
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-[rgba(244,246,250,0.08)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="flex-1 rounded-xl border border-[rgba(244,246,250,0.15)] px-4 py-3 text-sm font-medium text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.05)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={applying || rows.length === 0}
            className="flex-1 rounded-xl bg-[#2ED1B4] px-4 py-3 text-sm font-semibold text-[#070A12] hover:bg-[#25b89d] disabled:opacity-50"
          >
            {applying ? 'Updating…' : `Apply to ${rows.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}
