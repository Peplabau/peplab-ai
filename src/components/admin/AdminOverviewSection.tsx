import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Box,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Package,
  ShoppingCart,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { cached, invalidateCache, TTL_ADMIN_OVERVIEW } from '@/lib/cache';
import {
  aggregateBestSellers,
  aggregateDailyRevenue,
  aggregateVariantSales,
  aggregateWeeklyRevenue,
  buildInventoryLedger,
  overviewCompareWindows,
  summarizeOverviewPeriod,
  type BsTimeFilter,
  type InventoryLedgerRow,
  type OverviewPeriodStats,
  type WeeklyRevenueRow,
} from '@/lib/admin-analytics';
import { formatOrderNumberDisplay } from '@/utils/order-number';

const LOW_STOCK_THRESHOLD = 10;
const OVERVIEW_CACHE_KEY = 'admin:overview:v8';

type BsSortBy = 'units' | 'revenue';
type SalesPeriod = Extract<BsTimeFilter, '7d' | '30d'>;

type OrderItemRow = {
  items: unknown;
  created_at: string;
  status: string;
  payment_status?: string | null;
};

interface OverviewOrder {
  id: string;
  order_number: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface StockWatchRow {
  key: string;
  productName: string;
  dosageLabel: string;
  stockQuantity: number;
  /** oos = qty 0; paused = marked unavailable but qty remains; low = live & ≤ threshold */
  level: 'oos' | 'paused' | 'low' | 'ok';
}

type InventoryTab = 'not_selling' | 'restock';

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

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function formatAud(value: number): string {
  return `$${Math.round(value).toLocaleString('en-AU')}`;
}

function RevenueChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: {
      label?: string;
      revenue?: number;
      orders?: number;
      shortLabel?: string;
    };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const amount = Number(payload[0]?.value ?? row.revenue ?? 0);
  return (
    <div className="rounded-xl border border-[rgba(244,246,250,0.16)] bg-[#0B1220] px-3.5 py-2.5 shadow-xl">
      <p className="text-[11px] text-[#A9B3C7]">{row.label || row.shortLabel}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-[#F4F6FA]">{formatAud(amount)}</p>
    </div>
  );
}

function formatStatusLabel(status: string): string {
  if (status === 'processing') return 'Processing';
  if (status === 'shipped') return 'Shipped';
  if (status === 'delivered') return 'Delivered';
  if (status === 'pending_payment') return 'Awaiting payment';
  if (status === 'finalised') return 'Finalised';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusPillClass(status: string): string {
  switch (status) {
    case 'shipped':
    case 'delivered':
      return 'bg-[rgba(46,209,180,0.15)] text-[#2ED1B4]';
    case 'processing':
    case 'finalised':
    case 'payment_received':
      return 'bg-[rgba(139,92,246,0.18)] text-[#A78BFA]';
    case 'pending_payment':
      return 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]';
    case 'cancelled':
    case 'refunded':
      return 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]';
    default:
      return 'bg-[rgba(244,246,250,0.08)] text-[#A9B3C7]';
  }
}

function TrendBadge({ change }: { change: number | null }) {
  if (change == null) {
    return <span className="text-[11px] text-[#6B7280]">No prior period data</span>;
  }
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        up ? 'text-[#2ED1B4]' : 'text-[#F87171]'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(change).toFixed(0)}% vs previous 7 days
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  change,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingCart;
  iconBg: string;
  iconColor: string;
  change: number | null;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.72)] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#A9B3C7]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[#F4F6FA] sm:text-3xl">{value}</p>
      <div className="mt-2">
        <TrendBadge change={change} />
      </div>
    </div>
  );
}

export default function AdminOverviewSection({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [current, setCurrent] = useState<OverviewPeriodStats>({
    revenue: 0,
    paidOrders: 0,
    awaitingPayment: 0,
    ordersToShip: 0,
  });
  const [previous, setPrevious] = useState<OverviewPeriodStats>({
    revenue: 0,
    paidOrders: 0,
    awaitingPayment: 0,
    ordersToShip: 0,
  });
  const [dailyRevenue, setDailyRevenue] = useState<
    Array<{ day: string; label: string; revenue: number; orders: number }>
  >([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenueRow[]>([]);
  const [recentOrders, setRecentOrders] = useState<OverviewOrder[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<OrderItemRow[]>([]);
  const [ledgerRows, setLedgerRows] = useState<InventoryLedgerRow[]>([]);
  const [stockRows, setStockRows] = useState<StockWatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bsSort, setBsSort] = useState<BsSortBy>('units');
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('7d');
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>('not_selling');
  const [focusedWeekStart, setFocusedWeekStart] = useState<string | null>(null);

  const loadStats = useCallback(async (bust = false) => {
    if (bust) invalidateCache(OVERVIEW_CACHE_KEY);
    setLoading(true);
    try {
      const result = await cached(
        OVERVIEW_CACHE_KEY,
        async () => {
          const [orderStatusTotals, recentRes, itemOrders, productsRes] =
            await Promise.all([
              fetchSupabasePages((from, to) =>
                supabase
                  .from('orders')
                  .select('status, total, created_at')
                  .order('id', { ascending: true })
                  .range(from, to),
              ),
              supabase
                .from('orders')
                .select(
                  'id, order_number, customer_email, customer_first_name, customer_last_name, total, status, created_at',
                )
                .order('created_at', { ascending: false })
                .limit(5),
              fetchSupabasePages((from, to) =>
                supabase
                  .from('orders')
                  .select('items, created_at, status, payment_status')
                  .neq('status', 'cancelled')
                  .order('created_at', { ascending: false })
                  .range(from, to),
              ),
              // Use product_dosages(*) — live DB uses camelCase originalPrice; explicit
              // original_price columns can make PostgREST return null for the whole embed.
              supabase
                .from('products')
                .select('id, name, slug, category, is_active, product_dosages(*)')
                .order('name', { ascending: true }),
            ]);

          if (productsRes.error) {
            console.error('Overview products load failed:', productsRes.error);
            throw productsRes.error;
          }
          if (recentRes.error) {
            console.warn('Overview recent orders load failed:', recentRes.error);
          }

          return {
            orderStatusTotals,
            recent: (recentRes.data || []) as OverviewOrder[],
            itemOrders: itemOrders as OrderItemRow[],
            productsWithStock: productsRes.data || [],
          };
        },
        TTL_ADMIN_OVERVIEW,
      );

      const windows = overviewCompareWindows(7);
      setCurrent(
        summarizeOverviewPeriod(
          result.orderStatusTotals,
          windows.currentStart,
          windows.currentEnd,
        ),
      );
      setPrevious(
        summarizeOverviewPeriod(
          result.orderStatusTotals,
          windows.previousStart,
          windows.previousEnd,
        ),
      );
      setDailyRevenue(aggregateDailyRevenue(result.orderStatusTotals, 7));
      setWeeklyRevenue(aggregateWeeklyRevenue(result.orderStatusTotals, 8));
      setRecentOrders(result.recent);
      setAllOrderItems(result.itemOrders);

      const sales7d = aggregateVariantSales(result.itemOrders, 7);
      const sales30d = aggregateVariantSales(result.itemOrders, 30);
      const ledger = buildInventoryLedger(result.productsWithStock, sales7d, sales30d);
      setLedgerRows(ledger);

      const rows: StockWatchRow[] = ledger.map((r) => {
        let level: StockWatchRow['level'] = 'ok';
        if (r.stockQuantity <= 0) level = 'oos';
        else if (!r.inStock) level = 'paused';
        else if (r.stockQuantity <= LOW_STOCK_THRESHOLD) level = 'low';
        return {
          key: r.dosageId,
          productName: r.productName,
          dosageLabel: r.dosageLabel,
          stockQuantity: r.stockQuantity,
          level,
        };
      });
      const levelRank = { oos: 0, paused: 1, low: 2, ok: 3 } as const;
      rows.sort((a, b) => {
        const byLevel = levelRank[a.level] - levelRank[b.level];
        if (byLevel !== 0) return byLevel;
        if (a.stockQuantity !== b.stockQuantity) return a.stockQuantity - b.stockQuantity;
        return a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' });
      });
      setStockRows(rows);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
    const onOrdersUpdated = () => {
      void loadStats(true);
    };
    window.addEventListener('peplab:orders-updated', onOrdersUpdated);
    return () => window.removeEventListener('peplab:orders-updated', onOrdersUpdated);
  }, [loadStats]);

  const bestSellers = useMemo(() => {
    const all = aggregateBestSellers(allOrderItems, salesPeriod, 'variant');
    return all
      .sort((a, b) => (bsSort === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold))
      .slice(0, 5);
  }, [allOrderItems, bsSort, salesPeriod]);

  const bsMax = useMemo(
    () =>
      bestSellers.length
        ? bsSort === 'revenue'
          ? bestSellers[0].revenue
          : bestSellers[0].unitsSold
        : 1,
    [bestSellers, bsSort],
  );

  const notSelling = useMemo(() => {
    const soldKey = salesPeriod === '7d' ? 'unitsSold7d' : 'unitsSold30d';
    return ledgerRows
      .filter(
        (r) =>
          r.isActive &&
          r.inStock &&
          r.stockQuantity > 0 &&
          r[soldKey] === 0,
      )
      .sort((a, b) => {
        if (b.stockQuantity !== a.stockQuantity) return b.stockQuantity - a.stockQuantity;
        return a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' });
      })
      .slice(0, 8);
  }, [ledgerRows, salesPeriod]);

  const notSellingCount = useMemo(() => {
    const soldKey = salesPeriod === '7d' ? 'unitsSold7d' : 'unitsSold30d';
    return ledgerRows.filter(
      (r) =>
        r.isActive &&
        r.inStock &&
        r.stockQuantity > 0 &&
        r[soldKey] === 0,
    ).length;
  }, [ledgerRows, salesPeriod]);

  const alertStock = useMemo(
    () =>
      stockRows
        .filter((r) => r.level === 'oos' || r.level === 'paused' || r.level === 'low')
        .slice(0, 8),
    [stockRows],
  );
  const stockNeedsCount = useMemo(
    () => stockRows.filter((r) => r.level === 'oos' || r.level === 'paused' || r.level === 'low').length,
    [stockRows],
  );

  const chartData = useMemo(
    () =>
      dailyRevenue.map((row) => ({
        ...row,
        shortLabel: row.label.slice(0, 3),
      })),
    [dailyRevenue],
  );

  const thisWeek = weeklyRevenue.find((w) => w.isCurrent) ?? null;
  const lastWeek = weeklyRevenue.find((w) => !w.isCurrent) ?? null;
  const thisWeekChange =
    thisWeek && lastWeek ? pctChange(thisWeek.revenue, lastWeek.revenue) : null;
  const weekMax = useMemo(
    () => Math.max(1, ...weeklyRevenue.map((w) => w.revenue)),
    [weeklyRevenue],
  );
  const weeklyChartData = useMemo(
    () =>
      [...weeklyRevenue].reverse().map((row) => ({
        ...row,
        shortLabel: row.isCurrent
          ? 'Now'
          : row.label.replace(/\s*2026\s*/g, ' ').split('–')[0]?.trim() || row.label,
      })),
    [weeklyRevenue],
  );
  const focusedWeek =
    weeklyRevenue.find((w) => w.weekStart === focusedWeekStart) ?? thisWeek ?? null;
  const focusedPrior = useMemo(() => {
    if (!focusedWeek) return null;
    const idx = weeklyRevenue.findIndex((w) => w.weekStart === focusedWeek.weekStart);
    return idx >= 0 ? weeklyRevenue[idx + 1] ?? null : null;
  }, [focusedWeek, weeklyRevenue]);
  const focusedChange =
    focusedWeek && focusedPrior
      ? pctChange(focusedWeek.revenue, focusedPrior.revenue)
      : null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-4 w-52 rounded" />
          </div>
          <Skeleton className="h-10 w-56 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Skeleton className="h-72 rounded-2xl lg:col-span-3" />
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F6FA] lg:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-[#A9B3C7]">Your store at a glance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[rgba(244,246,250,0.1)] bg-[rgba(17,24,39,0.8)] px-3 py-2 text-xs font-medium text-[#F4F6FA]">
            <CalendarDays className="h-3.5 w-3.5 text-[#2ED1B4]" />
            {thisWeek ? `This week · ${thisWeek.label}` : 'This week'}
          </div>
          <div className="rounded-xl border border-[rgba(244,246,250,0.08)] px-3 py-2 text-[11px] text-[#A9B3C7]">
            AUD · Sydney time
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Revenue (7 days)"
          value={formatAud(current.revenue)}
          icon={BarChart3}
          iconBg="rgba(46,209,180,0.12)"
          iconColor="#2ED1B4"
          change={pctChange(current.revenue, previous.revenue)}
        />
        <KpiCard
          label="Paid orders"
          value={String(current.paidOrders)}
          icon={ShoppingCart}
          iconBg="rgba(139,92,246,0.14)"
          iconColor="#A78BFA"
          change={pctChange(current.paidOrders, previous.paidOrders)}
        />
        <KpiCard
          label="Awaiting payment"
          value={String(current.awaitingPayment)}
          icon={CreditCard}
          iconBg="rgba(245,158,11,0.14)"
          iconColor="#F59E0B"
          change={pctChange(current.awaitingPayment, previous.awaitingPayment)}
        />
        <KpiCard
          label="Orders to ship"
          value={String(current.ordersToShip)}
          icon={Box}
          iconBg="rgba(59,130,246,0.14)"
          iconColor="#60A5FA"
          change={pctChange(current.ordersToShip, previous.ordersToShip)}
        />
      </div>

      {/* Weekly revenue — graphical */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[linear-gradient(165deg,rgba(17,24,39,0.95)_0%,rgba(12,18,32,0.98)_55%,rgba(8,14,26,1)_100%)]">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5 pb-2">
          <div>
            <p className="text-xs font-medium text-[#A9B3C7]">Weekly revenue</p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-[#F4F6FA] sm:text-4xl">
              {formatAud(thisWeek?.revenue ?? 0)}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              This week · {thisWeek?.label ?? '—'} · {thisWeek?.orders ?? 0} orders
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(244,246,250,0.08)] bg-[rgba(244,246,250,0.03)] px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">vs last week</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#F4F6FA]">
              {formatAud(lastWeek?.revenue ?? 0)}
            </p>
            {thisWeekChange != null && (
              <p
                className={`mt-0.5 inline-flex items-center gap-0.5 text-xs font-semibold ${
                  thisWeekChange >= 0 ? 'text-[#2ED1B4]' : 'text-[#F87171]'
                }`}
              >
                {thisWeekChange >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(thisWeekChange).toFixed(0)}%
              </p>
            )}
          </div>
        </div>

        <div className="h-52 w-full px-2 sm:h-60 sm:px-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyChartData}
              margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
              onMouseMove={(state) => {
                const weekStart = (
                  state as { activePayload?: Array<{ payload?: { weekStart?: string } }> }
                )?.activePayload?.[0]?.payload?.weekStart;
                if (weekStart) setFocusedWeekStart(weekStart);
              }}
            >
              <defs>
                <linearGradient id="weekBarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5EEAD4" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#2ED1B4" stopOpacity={0.55} />
                </linearGradient>
                <linearGradient id="weekBarMuted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ED1B4" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#2ED1B4" stopOpacity={0.18} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(244,246,250,0.05)" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#8B95A8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={42}
                tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(244,246,250,0.04)', radius: 8 }}
                content={<RevenueChartTooltip />}
                wrapperStyle={{ outline: 'none', zIndex: 30 }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 4, 4]} maxBarSize={44}>
                {weeklyChartData.map((row) => {
                  const focused =
                    (focusedWeekStart ?? thisWeek?.weekStart) === row.weekStart;
                  return (
                    <Cell
                      key={row.weekStart}
                      fill={
                        row.isCurrent || focused
                          ? 'url(#weekBarFill)'
                          : 'url(#weekBarMuted)'
                      }
                      stroke={focused ? 'rgba(94,234,212,0.5)' : 'transparent'}
                      strokeWidth={focused ? 1.5 : 0}
                      cursor="pointer"
                      onClick={() => setFocusedWeekStart(row.weekStart)}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {focusedWeek && (
          <div className="mx-5 mb-5 mt-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(46,209,180,0.22)] bg-[rgba(46,209,180,0.08)] px-4 py-3.5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2ED1B4]">
                {focusedWeek.isCurrent ? 'This week' : 'Highlighted week'}
              </p>
              <p className="mt-0.5 text-sm text-[#A9B3C7]">{focusedWeek.label}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-[#F4F6FA]">
                {formatAud(focusedWeek.revenue)}
              </p>
              <p className="text-xs text-[#6B7280]">
                {focusedWeek.orders} orders
                {focusedChange != null && (
                  <span
                    className={`ml-2 font-semibold ${
                      focusedChange >= 0 ? 'text-[#2ED1B4]' : 'text-[#F87171]'
                    }`}
                  >
                    {focusedChange >= 0 ? '+' : ''}
                    {focusedChange.toFixed(0)}% vs prior
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Compact graphical strip */}
        <div className="space-y-2.5 border-t border-[rgba(244,246,250,0.06)] px-5 py-4">
          {weeklyRevenue.slice(0, 6).map((row) => {
            const pct = (row.revenue / weekMax) * 100;
            const focused = focusedWeek?.weekStart === row.weekStart;
            return (
              <button
                key={row.weekStart}
                type="button"
                onClick={() => setFocusedWeekStart(row.weekStart)}
                className="group flex w-full items-center gap-3 text-left"
              >
                <span
                  className={`w-28 shrink-0 truncate text-xs sm:w-36 ${
                    focused || row.isCurrent ? 'font-semibold text-[#2ED1B4]' : 'text-[#8B95A8]'
                  }`}
                >
                  {row.isCurrent
                    ? 'This week'
                    : row.label.replace(/\s*\d{4}\s*/g, ' ').split('–')[0]?.trim() || row.label}
                </span>
                <div className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(244,246,250,0.06)]">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                      focused || row.isCurrent
                        ? 'bg-gradient-to-r from-[#2ED1B4] to-[#5EEAD4]'
                        : 'bg-[rgba(46,209,180,0.35)] group-hover:bg-[rgba(46,209,180,0.55)]'
                    }`}
                    style={{ width: `${Math.max(pct, row.revenue > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span
                  className={`w-20 shrink-0 text-right text-sm font-bold tabular-nums sm:w-24 ${
                    focused || row.isCurrent ? 'text-[#F4F6FA]' : 'text-[#A9B3C7]'
                  }`}
                >
                  {formatAud(row.revenue)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily chart + Needs attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.72)] p-4 sm:p-5 lg:col-span-3">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#F4F6FA]">Daily revenue</h2>
            <p className="mt-0.5 text-xs text-[#A9B3C7]">Paid revenue · last 7 days</p>
          </div>
          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2ED1B4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2ED1B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(244,246,250,0.06)" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`)}
                />
                <Tooltip
                  content={<RevenueChartTooltip />}
                  wrapperStyle={{ outline: 'none', zIndex: 20 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2ED1B4"
                  strokeWidth={2.5}
                  fill="url(#overviewRevenueFill)"
                  dot={{ r: 4, fill: '#2ED1B4', stroke: '#070A12', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.72)] p-4 sm:p-5 lg:col-span-2">
          <h2 className="mb-1 text-base font-semibold text-[#F4F6FA]">Needs Attention</h2>
          <p className="mb-4 text-xs text-[#A9B3C7]">Tap to jump to the right place</p>
          <div className="space-y-2">
            {[
              {
                id: 'awaiting',
                title: `${current.awaitingPayment} awaiting payment`,
                sub: 'Confirm or follow up',
                tab: 'orders',
                tone: 'amber' as const,
              },
              {
                id: 'ship',
                title: `${current.ordersToShip} ready to ship`,
                sub: 'Paid and waiting dispatch',
                tab: 'orders',
                tone: 'blue' as const,
              },
              {
                id: 'stock',
                title: `${stockNeedsCount} stock issues`,
                sub: 'Out of stock, paused, or low',
                tab: 'products',
                tone: 'red' as const,
              },
            ].map((item) => {
              const styles =
                item.tone === 'amber'
                  ? {
                      border: 'border-[rgba(245,158,11,0.2)]',
                      bg: 'bg-[rgba(245,158,11,0.06)] hover:bg-[rgba(245,158,11,0.1)]',
                      iconBg: 'bg-[rgba(245,158,11,0.15)]',
                      icon: 'text-[#F59E0B]',
                    }
                  : item.tone === 'blue'
                    ? {
                        border: 'border-[rgba(96,165,250,0.2)]',
                        bg: 'bg-[rgba(96,165,250,0.06)] hover:bg-[rgba(96,165,250,0.1)]',
                        iconBg: 'bg-[rgba(96,165,250,0.15)]',
                        icon: 'text-[#60A5FA]',
                      }
                    : {
                        border: 'border-[rgba(239,68,68,0.2)]',
                        bg: 'bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.1)]',
                        iconBg: 'bg-[rgba(239,68,68,0.15)]',
                        icon: 'text-[#EF4444]',
                      };
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(item.tab)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${styles.border} ${styles.bg}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}
                  >
                    <AlertTriangle className={`h-4 w-4 ${styles.icon}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#F4F6FA]">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#A9B3C7]">{item.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#6B7280]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent orders + Top sellers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.72)] p-4 sm:p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[#F4F6FA]">Recent Orders</h2>
            <button
              type="button"
              onClick={() => onNavigate?.('orders')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2ED1B4] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#6B7280]">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead>
                  <tr className="border-b border-[rgba(244,246,250,0.08)] text-[10px] uppercase tracking-wide text-[#6B7280]">
                    <th className="pb-2 pr-3 font-semibold">Order</th>
                    <th className="pb-2 pr-3 font-semibold">Customer</th>
                    <th className="pb-2 pr-3 font-semibold text-right">Total</th>
                    <th className="pb-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const name = [order.customer_first_name, order.customer_last_name]
                      .filter(Boolean)
                      .join(' ')
                      .trim();
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-[rgba(244,246,250,0.04)] last:border-0"
                      >
                        <td className="py-3 pr-3 font-mono text-sm font-semibold text-[#F4F6FA]">
                          #{formatOrderNumberDisplay(order.order_number)}
                        </td>
                        <td className="py-3 pr-3 text-sm text-[#A9B3C7]">
                          <span className="block truncate text-[#F4F6FA]">
                            {name || '—'}
                          </span>
                          <span className="block truncate text-[11px] text-[#6B7280]">
                            {order.customer_email}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-right text-sm font-semibold tabular-nums text-[#F4F6FA]">
                          ${Number(order.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusPillClass(order.status)}`}
                          >
                            {formatStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.72)] p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#F4F6FA]">Top 5 Best Sellers</h2>
              <p className="text-[11px] text-[#6B7280]">Paid units only · last {salesPeriod === '7d' ? '7' : '30'} days</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex rounded-lg border border-[rgba(244,246,250,0.1)] p-0.5">
                {(['7d', '30d'] as SalesPeriod[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSalesPeriod(p)}
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                      salesPeriod === p
                        ? 'bg-[rgba(46,209,180,0.18)] text-[#2ED1B4]'
                        : 'text-[#6B7280] hover:text-[#A9B3C7]'
                    }`}
                  >
                    {p === '7d' ? '7d' : '30d'}
                  </button>
                ))}
              </div>
              <select
                value={bsSort}
                onChange={(e) => setBsSort(e.target.value as BsSortBy)}
                className="rounded-lg border border-[rgba(244,246,250,0.1)] bg-[#0d121f] px-2 py-1 text-[11px] font-medium text-[#A9B3C7] outline-none"
              >
                <option value="units">By units</option>
                <option value="revenue">By revenue</option>
              </select>
            </div>
          </div>
          {bestSellers.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#6B7280]">
              No paid sales in the last {salesPeriod === '7d' ? '7' : '30'} days
            </p>
          ) : (
            <ol className="space-y-3">
              {bestSellers.map((item, idx) => {
                const value = bsSort === 'revenue' ? item.revenue : item.unitsSold;
                const pct = bsMax > 0 ? (value / bsMax) * 100 : 0;
                return (
                  <li key={item.key} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-xs font-bold text-[#6B7280]">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#F4F6FA]">
                          {item.name}
                          {item.dosage ? ` ${item.dosage}` : ''}
                        </p>
                        <p className="text-[10px] text-[#6B7280]">
                          {item.unitsSold} {item.unitsSold === 1 ? 'unit' : 'units'}
                          {' · '}
                          {formatAud(item.revenue)}
                          {' · '}
                          {item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'}
                        </p>
                      </div>
                      <span className="shrink-0 text-right text-xs font-bold tabular-nums text-[#F4F6FA]">
                        {bsSort === 'revenue' ? (
                          formatAud(item.revenue)
                        ) : (
                          <>
                            {item.unitsSold}
                            <span className="ml-0.5 text-[10px] font-medium text-[#6B7280]">
                              units
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-[rgba(244,246,250,0.08)]">
                      <div
                        className="h-full rounded-full bg-[#2ED1B4]"
                        style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      {/* Inventory insights — single clear panel */}
      <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.72)] p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#F4F6FA]">Inventory</h2>
            <p className="mt-1 text-xs text-[#A9B3C7]">
              What needs restocking, and what is sitting with no paid sales
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-[rgba(244,246,250,0.1)] p-0.5">
              {(['7d', '30d'] as SalesPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSalesPeriod(p)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    salesPeriod === p
                      ? 'bg-[rgba(46,209,180,0.18)] text-[#2ED1B4]'
                      : 'text-[#6B7280] hover:text-[#A9B3C7]'
                  }`}
                >
                  {p === '7d' ? 'Last 7 days' : 'Last 30 days'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('products')}
              className="inline-flex items-center gap-1 rounded-lg border border-[rgba(46,209,180,0.25)] bg-[rgba(46,209,180,0.08)] px-3 py-1.5 text-xs font-semibold text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.14)]"
            >
              Open stock room <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setInventoryTab('not_selling')}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              inventoryTab === 'not_selling'
                ? 'bg-[rgba(248,113,113,0.15)] text-[#F87171]'
                : 'bg-[rgba(244,246,250,0.04)] text-[#A9B3C7] hover:text-[#F4F6FA]'
            }`}
          >
            Not selling
            <span className="ml-2 tabular-nums opacity-80">{notSellingCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setInventoryTab('restock')}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
              inventoryTab === 'restock'
                ? 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]'
                : 'bg-[rgba(244,246,250,0.04)] text-[#A9B3C7] hover:text-[#F4F6FA]'
            }`}
          >
            Need restock
            <span className="ml-2 tabular-nums opacity-80">{stockNeedsCount}</span>
          </button>
        </div>

        {inventoryTab === 'not_selling' ? (
          notSelling.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-[#6B7280]">
              <Package className="h-8 w-8 opacity-40" />
              <p className="text-sm">Everything live on the shelf has sold in this period</p>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(244,246,250,0.06)]">
              {notSelling.map((row) => (
                <li
                  key={row.dosageId}
                  className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#F4F6FA]">
                      {row.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-[#A9B3C7]">
                      {row.dosageLabel}
                      <span className="mx-1.5 text-[#4B5563]">·</span>
                      {row.stockQuantity} on hand
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums text-[#F87171]">0 sold</p>
                    <p className="text-[11px] text-[#6B7280]">
                      last {salesPeriod === '7d' ? '7' : '30'} days
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : alertStock.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-[#6B7280]">
            <Package className="h-8 w-8 opacity-40" />
            <p className="text-sm">No low or out-of-stock items right now</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(244,246,250,0.06)]">
            {alertStock.map((row) => {
              const badge =
                row.level === 'oos'
                  ? {
                      label: 'Out of stock',
                      className: 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]',
                    }
                  : row.level === 'paused'
                    ? {
                        label: 'Paused on store',
                        className: 'bg-[rgba(148,163,184,0.18)] text-[#CBD5E1]',
                      }
                    : {
                        label: 'Low stock',
                        className: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]',
                      };
              return (
                <li
                  key={row.key}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#F4F6FA]">
                      {row.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-[#A9B3C7]">
                      {row.dosageLabel}
                      <span className="mx-1.5 text-[#4B5563]">·</span>
                      <span className="tabular-nums">{row.stockQuantity} in warehouse</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('products')}
                      className="text-xs font-semibold text-[#2ED1B4] hover:underline"
                    >
                      Fix
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {((inventoryTab === 'not_selling' && notSellingCount > notSelling.length) ||
          (inventoryTab === 'restock' && stockNeedsCount > alertStock.length)) && (
          <div className="mt-4 border-t border-[rgba(244,246,250,0.06)] pt-3 text-center">
            <button
              type="button"
              onClick={() => onNavigate?.('products')}
              className="text-xs font-semibold text-[#2ED1B4] hover:underline"
            >
              View all{' '}
              {inventoryTab === 'not_selling'
                ? `${notSellingCount} not selling`
                : `${stockNeedsCount} stock issues`}{' '}
              in Products →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
