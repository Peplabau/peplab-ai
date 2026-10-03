import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart2,
  CalendarDays,
  CreditCard,
  DollarSign,
  FlaskConical,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { cached, invalidateCache, TTL_ADMIN_OVERVIEW } from '@/lib/cache';
import {
  aggregateBestSellers,
  aggregateWeeklyRevenue,
  type BestSellerItem,
  type BsTimeFilter,
  type WeeklyRevenueRow,
} from '@/lib/admin-analytics';
import { formatOrderNumberDisplay } from '@/utils/order-number';
import { CONFIG } from '@/lib/config';

const LOW_STOCK_THRESHOLD = 10;

type BsSortBy = 'units' | 'revenue';
type StockFilter = 'needs' | 'all' | 'out';

interface OverviewOrder {
  id: string;
  order_number: string;
  customer_email: string;
  customer_first_name?: string;
  customer_last_name?: string;
  total: number;
  status: string;
  created_at: string;
  is_preorder?: boolean;
}

interface StockWatchRow {
  key: string;
  productName: string;
  dosageLabel: string;
  inStock: boolean;
  stockQuantity: number;
  level: 'out' | 'low' | 'ok';
}

async function fetchSupabasePages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message?: string } | null }>,
): Promise<T[]> {
  const PAGE = 1000;
  const all: T[] = [];
  let from = 0;
  while (true) {
    const to = from + PAGE - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw error;
    const page = data ?? [];
    all.push(...page);
    if (page.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function sumOrdersRevenue(orderList: Array<{ total?: number | string | null }>): number {
  return orderList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
}

async function fetchOrdersCount(): Promise<number> {
  const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

/** Admin Overview user count — must bypass profiles RLS (direct count returns 1). */
async function fetchUsersCount(): Promise<number> {
  const { data, error } = await supabase.rpc('admin_count_profiles');
  if (!error && data != null) {
    const n = Number(data);
    if (Number.isFinite(n)) return n;
  }
  const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  return count ?? 0;
}

function dosageDisplayLabel(d: { mg?: unknown; unit?: string | null }): string {
  const mg = d.mg;
  const unit = (d.unit || 'MG').toString().trim();
  if (mg == null || mg === '') return '—';
  return `${mg}${unit ? ` ${unit}` : ''}`.trim();
}

function orderIsPreorderRow(o: Pick<OverviewOrder, 'is_preorder' | 'order_number'>): boolean {
  if (o.is_preorder === true) return true;
  return /^PRE-/i.test(String(o.order_number ?? ''));
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingCart;
  color: string;
}) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#F4F6FA] leading-tight">{value}</p>
      <p className="text-[11px] sm:text-xs text-[#A9B3C7] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending_payment':
      return 'bg-[#F59E0B] text-white';
    case 'payment_received':
      return 'bg-[#3B82F6] text-white';
    case 'processing':
      return 'bg-[#8B5CF6] text-white';
    case 'finalised':
      return 'bg-[#1D4ED8] text-white';
    case 'shipped':
      return 'bg-[#2ED1B4] text-white';
    case 'delivered':
      return 'bg-[#22C55E] text-white';
    case 'cancelled':
      return 'bg-[#EF4444] text-white';
    case 'refunded':
      return 'bg-[#6B7280] text-white';
    default:
      return 'bg-[#A9B3C7] text-white';
  }
}

export default function AdminOverviewSection({ onNavigate: _onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayment: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<OverviewOrder[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<Array<{ items: any[]; created_at: string; status: string }>>([]);
  const [stockRows, setStockRows] = useState<StockWatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bsTime, setBsTime] = useState<BsTimeFilter>('30d');
  const [bsSort, setBsSort] = useState<BsSortBy>('units');
  const [stockFilter, setStockFilter] = useState<StockFilter>('needs');
  const [stockExpanded, setStockExpanded] = useState(false);
  const [sellersExpanded, setSellersExpanded] = useState(false);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenueRow[]>([]);

  const PREVIEW_ROWS = 12;

  useEffect(() => {
    loadStats();
    const onOrdersUpdated = () => {
      void loadStats(true);
    };
    window.addEventListener('peplab:orders-updated', onOrdersUpdated);
    return () => window.removeEventListener('peplab:orders-updated', onOrdersUpdated);
  }, []);

  const loadStats = async (bust = false) => {
    if (bust) invalidateCache('admin:overview:v9');
    setLoading(true);
    try {
      const result = await cached('admin:overview:v9', async () => {
        const [
          orderStatusTotals,
          { data: recent },
          orderCount,
          userCount,
          { count: productCount },
          itemOrders,
          { data: productsWithStock },
        ] = await Promise.all([
          fetchSupabasePages((from, to) =>
            supabase.from('orders').select('status, total, created_at').order('id', { ascending: true }).range(from, to),
          ),
          supabase.from('orders').select('id, order_number, customer_email, customer_first_name, customer_last_name, total, status, created_at, is_preorder').order('created_at', { ascending: false }).limit(5),
          fetchOrdersCount(),
          fetchUsersCount(),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          fetchSupabasePages((from, to) =>
            supabase
              .from('orders')
              .select('items, created_at, status')
              .neq('status', 'cancelled')
              .order('created_at', { ascending: false })
              .range(from, to),
          ),
          supabase
            .from('products')
            .select('id, name, slug, product_dosages(id, mg, unit, in_stock, stock_quantity)')
            .order('name', { ascending: true }),
        ]);
        return {
          orderStatusTotals,
          recent: recent || [],
          orderCount,
          userCount,
          productCount: productCount || 0,
          itemOrders,
          productsWithStock: productsWithStock || [],
        };
      }, TTL_ADMIN_OVERVIEW);

      setStats({
        totalOrders: result.orderCount,
        pendingPayment: result.orderStatusTotals.filter((o) => o.status === 'pending_payment').length,
        totalRevenue: sumOrdersRevenue(result.orderStatusTotals),
        totalUsers: result.userCount,
        totalProducts: result.productCount,
      });
      setRecentOrders(result.recent);
      setAllOrderItems(result.itemOrders as Array<{ items: any[]; created_at: string; status: string }>);
      setWeeklyRevenue(aggregateWeeklyRevenue(result.orderStatusTotals, 8));

      const rows: StockWatchRow[] = [];
      for (const product of result.productsWithStock as Array<{
        id: string;
        name: string;
        slug?: string;
        product_dosages?: Array<{
          id: string;
          mg?: unknown;
          unit?: string | null;
          in_stock?: boolean | null;
          stock_quantity?: number | null;
        }>;
      }>) {
        const dosages = product.product_dosages ?? [];
        if (dosages.length === 0) {
          rows.push({
            key: `${product.id}-none`,
            productName: product.name,
            dosageLabel: 'No sizes',
            inStock: false,
            stockQuantity: 0,
            level: 'out',
          });
          continue;
        }
        for (const d of dosages) {
          const rawQty = d.stock_quantity;
          const qty =
            rawQty == null || Number.isNaN(Number(rawQty)) ? null : Number(rawQty);
          const markedInStock = d.in_stock !== false;
          const level: StockWatchRow['level'] =
            !markedInStock || qty === 0
              ? 'out'
              : qty != null && qty <= LOW_STOCK_THRESHOLD
                ? 'low'
                : 'ok';
          rows.push({
            key: d.id || `${product.id}-${dosageDisplayLabel(d)}`,
            productName: product.name,
            dosageLabel: dosageDisplayLabel(d),
            inStock: markedInStock && qty !== 0,
            stockQuantity: qty ?? 0,
            level,
          });
        }
      }
      const levelRank = { out: 0, low: 1, ok: 2 } as const;
      rows.sort((a, b) => {
        const byLevel = levelRank[a.level] - levelRank[b.level];
        if (byLevel !== 0) return byLevel;
        if (a.stockQuantity !== b.stockQuantity) return a.stockQuantity - b.stockQuantity;
        return a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' });
      });
      setStockRows(rows);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hooks must always be called unconditionally — these must come before any early return.
  const bestSellers = useMemo<BestSellerItem[]>(() => {
    const all = aggregateBestSellers(allOrderItems, bsTime);
    return all.sort((a, b) =>
      bsSort === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold,
    );
  }, [allOrderItems, bsTime, bsSort]);

  const bsMax = useMemo(
    () => (bestSellers.length ? (bsSort === 'revenue' ? bestSellers[0].revenue : bestSellers[0].unitsSold) : 1),
    [bestSellers, bsSort],
  );

  const filteredStockRows = useMemo(() => {
    if (stockFilter === 'all') return stockRows;
    if (stockFilter === 'out') return stockRows.filter((r) => r.level === 'out');
    return stockRows.filter((r) => r.level === 'out' || r.level === 'low');
  }, [stockRows, stockFilter]);

  const stockCounts = useMemo(() => {
    let out = 0;
    let low = 0;
    for (const r of stockRows) {
      if (r.level === 'out') out += 1;
      else if (r.level === 'low') low += 1;
    }
    return { out, low, ok: stockRows.length - out - low, total: stockRows.length, needs: out + low };
  }, [stockRows]);

  useEffect(() => {
    setStockExpanded(false);
  }, [stockFilter]);

  useEffect(() => {
    setSellersExpanded(false);
  }, [bsTime, bsSort]);

  const visibleBestSellers = sellersExpanded ? bestSellers : bestSellers.slice(0, PREVIEW_ROWS);
  const visibleStockRows = stockExpanded ? filteredStockRows : filteredStockRows.slice(0, PREVIEW_ROWS);

  const thisWeek = weeklyRevenue[0];
  const lastWeek = weeklyRevenue[1];
  const weeklyMax = Math.max(...weeklyRevenue.map((row) => row.revenue), 1);
  const weekChange =
    thisWeek && lastWeek && lastWeek.revenue > 0
      ? ((thisWeek.revenue - lastWeek.revenue) / lastWeek.revenue) * 100
      : null;
  const formatAud = (value: number) => `$${Math.round(value).toLocaleString('en-AU')}`;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(245,158,11,0.25)] space-y-3">
          <Skeleton className="h-6 w-48 rounded" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {thisWeek && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[rgba(34,197,94,0.12)] to-[rgba(46,209,180,0.08)] border border-[rgba(34,197,94,0.28)]">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#F4F6FA] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#22C55E]" />
                Weekly earnings
              </h3>
              <p className="text-[11px] text-[#6B7280] mt-1">
                Paid orders · Monday–Sunday · Australia/Sydney
              </p>
            </div>
            {weekChange != null && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  weekChange >= 0
                    ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
                    : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
                }`}
              >
                {weekChange >= 0 ? '+' : ''}
                {weekChange.toFixed(0)}% vs last week
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-[rgba(7,10,18,0.45)]">
              <p className="text-[11px] text-[#A9B3C7]">This week</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#F4F6FA] leading-tight mt-0.5">
                {formatAud(thisWeek.revenue)}
              </p>
              <p className="text-[11px] text-[#6B7280] mt-1">
                {thisWeek.orders} order{thisWeek.orders === 1 ? '' : 's'} · {thisWeek.label}
              </p>
            </div>
            {lastWeek && (
              <div className="p-3 rounded-xl bg-[rgba(7,10,18,0.45)]">
                <p className="text-[11px] text-[#A9B3C7]">Last week</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#F4F6FA] leading-tight mt-0.5">
                  {formatAud(lastWeek.revenue)}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  {lastWeek.orders} order{lastWeek.orders === 1 ? '' : 's'} · {lastWeek.label}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {weeklyRevenue.map((row) => (
              <div key={row.weekStart} className="flex items-center gap-3">
                <p className={`w-[7.5rem] sm:w-44 shrink-0 text-[11px] sm:text-xs ${row.isCurrent ? 'text-[#F4F6FA] font-medium' : 'text-[#A9B3C7]'}`}>
                  {row.isCurrent ? 'This week' : row.label}
                </p>
                <div className="flex-1 h-2 rounded-full bg-[rgba(244,246,250,0.08)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#22C55E]"
                    style={{ width: `${Math.max((row.revenue / weeklyMax) * 100, row.revenue > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <p className="w-16 sm:w-20 text-right text-xs font-semibold text-[#F4F6FA] tabular-nums">
                  {formatAud(row.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders.toString()} icon={ShoppingCart} color="#8B5CF6" />
        <StatCard label="Awaiting Payment" value={stats.pendingPayment.toString()} icon={CreditCard} color="#F59E0B" />
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon={DollarSign} color="#22C55E" />
        <StatCard label="Users" value={stats.totalUsers.toString()} icon={Users} color="#3B82F6" />
        <StatCard label="Products" value={stats.totalProducts.toString()} icon={Package} color="#2ED1B4" />
      </div>

      {/* Stock to Restock — preview first, expand for full list */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(245,158,11,0.25)]">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#F4F6FA] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              Stock to Restock
            </h3>
            <p className="text-[11px] text-[#6B7280] mt-1">
              {stockCounts.out} out · {stockCounts.low} low (≤{LOW_STOCK_THRESHOLD}) · {stockCounts.ok} OK
            </p>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-[rgba(244,246,250,0.08)]">
            {(
              [
                { id: 'needs' as const, label: 'Needs restock' },
                { id: 'out' as const, label: 'Out' },
                { id: 'all' as const, label: 'All' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStockFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  stockFilter === opt.id
                    ? 'bg-[rgba(245,158,11,0.2)] text-[#F59E0B]'
                    : 'text-[#6B7280] hover:text-[#A9B3C7]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredStockRows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-[#5A667E]">
            <Package className="w-8 h-8 opacity-40" />
            <p className="text-sm">
              {stockFilter === 'all'
                ? 'No product dosages found.'
                : stockFilter === 'out'
                  ? 'Nothing is out of stock.'
                  : 'Everything looks stocked — nothing urgent to restock.'}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-[rgba(244,246,250,0.06)] overflow-x-auto">
              <table className="w-full text-left min-w-[320px]">
                <thead className="bg-[rgba(7,10,18,0.65)] border-b border-[rgba(244,246,250,0.08)]">
                  <tr className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                    <th className="px-3 py-2 font-semibold">Product</th>
                    <th className="px-3 py-2 font-semibold">Size</th>
                    <th className="px-3 py-2 font-semibold text-right">Qty</th>
                    <th className="px-3 py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStockRows.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-[rgba(244,246,250,0.04)] last:border-0 hover:bg-[rgba(244,246,250,0.02)]"
                    >
                      <td className="px-3 py-2 text-sm font-semibold text-[#F4F6FA] max-w-[12rem] sm:max-w-none truncate">
                        {row.productName}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono text-[#A9B3C7] whitespace-nowrap">
                        {row.dosageLabel}
                      </td>
                      <td className="px-3 py-2 text-sm font-bold text-right tabular-nums text-[#F4F6FA]">
                        {row.stockQuantity}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                            row.level === 'out'
                              ? 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
                              : row.level === 'low'
                                ? 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]'
                                : 'bg-[rgba(34,197,94,0.12)] text-[#4ADE80]'
                          }`}
                        >
                          {row.level === 'out' ? 'Out' : row.level === 'low' ? 'Low' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStockRows.length > PREVIEW_ROWS && (
              <button
                type="button"
                onClick={() => setStockExpanded((v) => !v)}
                className="mt-3 w-full py-2.5 rounded-xl border border-[rgba(244,246,250,0.08)] text-xs font-semibold text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.04)] transition-colors"
              >
                {stockExpanded
                  ? 'Show less'
                  : `Show all ${filteredStockRows.length} sizes`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Best Sellers */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-[#F4F6FA] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2ED1B4]" />
            Best Sellers
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl overflow-hidden border border-[rgba(244,246,250,0.08)]">
              {(['7d', '30d', '90d', 'all'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBsTime(t)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    bsTime === t
                      ? 'bg-[rgba(46,209,180,0.2)] text-[#2ED1B4]'
                      : 'text-[#6B7280] hover:text-[#A9B3C7]'
                  }`}
                >
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
            <div className="flex rounded-xl overflow-hidden border border-[rgba(244,246,250,0.08)]">
              <button
                type="button"
                onClick={() => setBsSort('units')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                  bsSort === 'units'
                    ? 'bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]'
                    : 'text-[#6B7280] hover:text-[#A9B3C7]'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Units
              </button>
              <button
                type="button"
                onClick={() => setBsSort('revenue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                  bsSort === 'revenue'
                    ? 'bg-[rgba(34,197,94,0.2)] text-[#22C55E]'
                    : 'text-[#6B7280] hover:text-[#A9B3C7]'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                $
              </button>
            </div>
          </div>
        </div>

        {bestSellers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-[#5A667E]">
            <FlaskConical className="w-8 h-8 opacity-40" />
            <p className="text-sm">No sales data for this period yet.</p>
          </div>
        ) : (
          <>
            <ol className="space-y-2.5">
              {visibleBestSellers.map((item, idx) => {
                const barPct = bsMax > 0 ? (bsSort === 'revenue' ? item.revenue : item.unitsSold) / bsMax : 0;
                const rankColors = ['#2ED1B4', '#8B5CF6', '#3B82F6', '#F59E0B', '#22C55E'];
                const rankColor = rankColors[idx] ?? '#6B7280';

                return (
                  <li key={item.key} className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `${rankColor}18`, color: rankColor, border: `1px solid ${rankColor}30` }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-[#F4F6FA] truncate block leading-tight">
                            {item.name}
                          </span>
                          {item.dosage && (
                            <span className="text-[11px] text-[#6B7280] font-mono">{item.dosage}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <span className="text-xs text-[#A9B3C7] whitespace-nowrap">
                            {item.unitsSold}u
                          </span>
                          <span className="text-sm font-bold whitespace-nowrap" style={{ color: rankColor }}>
                            ${item.revenue.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgba(244,246,250,0.06)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(barPct * 100).toFixed(1)}%`, background: rankColor, opacity: 0.75 }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {bestSellers.length > PREVIEW_ROWS && (
              <button
                type="button"
                onClick={() => setSellersExpanded((v) => !v)}
                className="mt-3 w-full py-2.5 rounded-xl border border-[rgba(244,246,250,0.08)] text-xs font-semibold text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.04)] transition-colors"
              >
                {sellersExpanded ? 'Show less' : `Show all ${bestSellers.length} SKUs`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Bank Details */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[rgba(46,209,180,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(46,209,180,0.2)]">
        <h3 className="text-base font-semibold text-[#F4F6FA] mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#2ED1B4]" />
          Bank Account Details
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">Mobile PAYID</p>
            <p className="text-sm font-mono text-[#F4F6FA]">{CONFIG.BANK_DETAILS.PAYID_MOBILE}</p>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">ABN PAYID</p>
            <p className="text-sm font-mono text-[#F4F6FA]">{CONFIG.BANK_DETAILS.PAYID}</p>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">BSB</p>
            <p className="text-sm font-mono text-[#F4F6FA]">{CONFIG.BANK_DETAILS.BSB}</p>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">Account</p>
            <p className="text-sm font-mono text-[#F4F6FA]">{CONFIG.BANK_DETAILS.ACCOUNT_NUMBER}</p>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">Account Name</p>
            <p className="text-sm text-[#F4F6FA]">{CONFIG.BANK_DETAILS.ACCOUNT_NAME}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
        <h3 className="text-base font-semibold text-[#F4F6FA] mb-3">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-[#A9B3C7] text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(7,10,18,0.5)]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#F4F6FA] font-mono leading-tight">
                      #{formatOrderNumberDisplay(order.order_number)}
                    </p>
                    {orderIsPreorderRow(order) && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-[#7F1D1D] text-[#FECACA] border border-[#EF4444]/45">
                        Preorder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A9B3C7] truncate mt-0.5">{order.customer_email}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold leading-tight whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-[#2ED1B4]">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

