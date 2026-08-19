import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Loader2, RefreshCw, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { orderCountsTowardBestSellers } from '@/lib/admin-analytics';

/**
 * Order-timing analytics — heatmap of when orders come in, so admin
 * can pick ad windows off real placement times (Australia/Sydney).
 */

type TimeRange = '7d' | '30d' | '90d' | 'all';
type OrderMode = 'paid' | 'all';

interface RawOrderRow {
  created_at: string;
  status: string | null;
  payment_status: string | null;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_LABELS_LONG = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TZ = 'Australia/Sydney';

const TIME_RANGE_OPTIONS: Array<{ id: TimeRange; label: string; days: number | null }> = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90 },
  { id: 'all', label: 'All time', days: null },
];

const ORDER_MODE_OPTIONS: Array<{ id: OrderMode; label: string; hint: string }> = [
  { id: 'paid', label: 'Paid / fulfilled', hint: 'Excludes unpaid, cancelled, refunded' },
  { id: 'all', label: 'All submitted', hint: 'Includes pending / cancelled' },
];

/** Return {dayIdx (0=Mon..6=Sun), hour (0..23)} for a UTC ISO string, in Australia/Sydney time. */
function toSydneyDayHour(iso: string): { dayIdx: number; hour: number } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      weekday: 'short',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
    const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '0';
    const weekdayIdx: Record<string, number> = {
      Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
    };
    const dayIdx = weekdayIdx[weekday];
    const hour = parseInt(hourStr, 10);
    if (dayIdx === undefined || Number.isNaN(hour)) return null;
    return { dayIdx, hour };
  } catch {
    return null;
  }
}

function formatHourLabel(h: number): string {
  const period = h < 12 ? 'am' : 'pm';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}${period}`;
}

/** Rank cell intensity 0–1 by percentile so colour scale is stable even when one cell dominates. */
function buildColorMap(matrix: number[][]): (v: number) => string {
  const values = matrix.flat().filter((v) => v > 0);
  if (values.length === 0) return () => 'rgba(139,92,246,0.06)';
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (v: number): number => {
    if (v <= 0) return 0;
    let lo = 0;
    let hi = sorted.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    return (lo + 1) / sorted.length;
  };
  return (v: number) => {
    if (v <= 0) return 'rgba(139,92,246,0.06)';
    const p = percentile(v);
    // Blue → purple → pink gradient — matches PEPLAB brand.
    const alpha = 0.18 + p * 0.72;
    if (p < 0.34) return `rgba(59, 130, 246, ${alpha})`;
    if (p < 0.67) return `rgba(139, 92, 246, ${alpha})`;
    return `rgba(236, 72, 153, ${alpha})`;
  };
}

export default function OrderTimingSection() {
  const [range, setRange] = useState<TimeRange>('30d');
  const [mode, setMode] = useState<OrderMode>('paid');
  const [orders, setOrders] = useState<RawOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rangeOpt = TIME_RANGE_OPTIONS.find((r) => r.id === range);
      let query = supabase
        .from('orders')
        .select('created_at, status, payment_status')
        .order('created_at', { ascending: false });
      if (rangeOpt?.days) {
        const cutoff = new Date(Date.now() - rangeOpt.days * 86_400_000).toISOString();
        query = query.gte('created_at', cutoff);
      }
      const rows: RawOrderRow[] = [];
      const PAGE = 1000;
      for (let page = 0; page < 20; page++) {
        const from = page * PAGE;
        const to = from + PAGE - 1;
        const { data, error: queryError } = await query.range(from, to);
        if (queryError) throw queryError;
        if (!data || data.length === 0) break;
        rows.push(...(data as RawOrderRow[]));
        if (data.length < PAGE) break;
      }
      setOrders(rows);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders, refreshTick]);

  const filteredOrders = useMemo(() => {
    if (mode === 'all') return orders;
    return orders.filter((o) => orderCountsTowardBestSellers(o));
  }, [orders, mode]);

  const { matrix, dayTotals, hourTotals, total, peakCell, peakDay, peakHour, bestWindow } =
    useMemo(() => {
      const m: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
      const dTotals = Array(7).fill(0) as number[];
      const hTotals = Array(24).fill(0) as number[];
      let count = 0;
      for (const row of filteredOrders) {
        const parsed = toSydneyDayHour(row.created_at);
        if (!parsed) continue;
        m[parsed.dayIdx][parsed.hour] += 1;
        dTotals[parsed.dayIdx] += 1;
        hTotals[parsed.hour] += 1;
        count += 1;
      }
      // Peak cell
      let bestCell = { day: 0, hour: 0, value: 0 };
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          if (m[d][h] > bestCell.value) bestCell = { day: d, hour: h, value: m[d][h] };
        }
      }
      // Peak day
      let bestDay = 0;
      for (let d = 1; d < 7; d++) if (dTotals[d] > dTotals[bestDay]) bestDay = d;
      // Peak hour
      let bestHour = 0;
      for (let h = 1; h < 24; h++) if (hTotals[h] > hTotals[bestHour]) bestHour = h;
      // Best 3-hour window (sliding, across whole week)
      let bestWinStart = 0;
      let bestWinCount = 0;
      for (let h = 0; h < 24; h++) {
        const winCount = hTotals[h] + hTotals[(h + 1) % 24] + hTotals[(h + 2) % 24];
        if (winCount > bestWinCount) {
          bestWinCount = winCount;
          bestWinStart = h;
        }
      }
      return {
        matrix: m,
        dayTotals: dTotals,
        hourTotals: hTotals,
        total: count,
        peakCell: bestCell,
        peakDay: bestDay,
        peakHour: bestHour,
        bestWindow: { start: bestWinStart, count: bestWinCount },
      };
    }, [filteredOrders]);

  const colorFor = useMemo(() => buildColorMap(matrix), [matrix]);
  const maxDayTotal = Math.max(1, ...dayTotals);
  const maxHourTotal = Math.max(1, ...hourTotals);

  const rangeLabel = TIME_RANGE_OPTIONS.find((r) => r.id === range)?.label ?? '';

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {TIME_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                range === opt.id
                  ? 'bg-[rgba(46,209,180,0.15)] text-[#2ED1B4] border border-[rgba(46,209,180,0.4)]'
                  : 'bg-[rgba(17,24,39,0.6)] text-[#A9B3C7] border border-[rgba(244,246,250,0.08)] hover:text-[#F4F6FA]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-[rgba(244,246,250,0.08)] overflow-hidden">
            {ORDER_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                title={opt.hint}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mode === opt.id
                    ? 'bg-[rgba(139,92,246,0.2)] text-[#C4B5FD]'
                    : 'bg-[rgba(17,24,39,0.6)] text-[#A9B3C7] hover:text-[#F4F6FA]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setRefreshTick((n) => n + 1)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#F4F6FA] text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <p className="text-xs text-[#6B7280] -mt-3">
        All times shown in <span className="text-[#A9B3C7] font-semibold">Australia/Sydney (AEST/AEDT)</span>.
        Use this to decide when to run ads — schedule your ad delivery times to match the peaks below.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-[#2ED1B4]" />}
          label="Orders"
          value={total.toLocaleString()}
          hint={rangeLabel}
        />
        <StatCard
          icon={<CalendarDays className="w-4 h-4 text-[#8B5CF6]" />}
          label="Peak day"
          value={total > 0 ? DAY_LABELS_LONG[peakDay] : '—'}
          hint={total > 0 ? `${dayTotals[peakDay]} orders` : ''}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-[#EC4899]" />}
          label="Peak hour"
          value={total > 0 ? `${formatHourLabel(peakHour)}` : '—'}
          hint={total > 0 ? `${hourTotals[peakHour]} orders` : ''}
        />
        <StatCard
          icon={<Target className="w-4 h-4 text-[#3B82F6]" />}
          label="Best 3-hour window"
          value={
            total > 0
              ? `${formatHourLabel(bestWindow.start)}–${formatHourLabel((bestWindow.start + 3) % 24)}`
              : '—'
          }
          hint={total > 0 ? `${bestWindow.count} orders` : ''}
        />
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#F4F6FA]">Orders by day &times; hour</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Darker cells = more orders. Peak: {total > 0
                ? `${DAY_LABELS_LONG[peakCell.day]} ${formatHourLabel(peakCell.hour)} (${peakCell.value})`
                : 'no data yet'}
              .
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6B7280]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading orders…</span>
          </div>
        ) : error ? (
          <p className="text-sm text-[#EF4444]">Failed to load: {error}</p>
        ) : total === 0 ? (
          <p className="text-sm text-[#6B7280] py-8 text-center">
            No orders in this range for the selected mode.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 lg:mx-0 px-4 lg:px-0">
            <div className="min-w-[720px]">
              {/* Hour header */}
              <div className="flex items-center gap-1 mb-1 pl-10">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="flex-1 text-center text-[9px] font-mono text-[#6B7280]"
                    title={formatHourLabel(h)}
                  >
                    {h % 3 === 0 ? formatHourLabel(h) : ''}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {DAY_LABELS.map((day, d) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <div className="w-9 text-right text-[10px] font-mono uppercase tracking-wider text-[#A9B3C7]">
                    {day}
                  </div>
                  {HOURS.map((h) => {
                    const value = matrix[d][h];
                    return (
                      <div
                        key={h}
                        className="flex-1 aspect-square rounded-[3px] border border-[rgba(244,246,250,0.04)] flex items-center justify-center text-[9px] font-semibold"
                        style={{
                          background: colorFor(value),
                          color: value > 0 ? '#F4F6FA' : 'transparent',
                          textShadow: value > 0 ? '0 1px 2px rgba(0,0,0,0.55)' : 'none',
                        }}
                        title={`${DAY_LABELS_LONG[d]} · ${formatHourLabel(h)} — ${value} order${
                          value === 1 ? '' : 's'
                        }`}
                      >
                        {value > 0 ? value : ''}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 pl-10 text-[10px] text-[#6B7280]">
                <span>Less</span>
                <div className="flex gap-0.5">
                  {[0.05, 0.2, 0.45, 0.7, 0.95].map((p) => (
                    <div
                      key={p}
                      className="w-4 h-3 rounded-[2px]"
                      style={{
                        background:
                          p < 0.34
                            ? `rgba(59, 130, 246, ${0.18 + p * 0.72})`
                            : p < 0.67
                            ? `rgba(139, 92, 246, ${0.18 + p * 0.72})`
                            : `rgba(236, 72, 153, ${0.18 + p * 0.72})`,
                      }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-side bar breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day-of-week */}
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-4 lg:p-6">
          <h3 className="text-sm font-bold text-[#F4F6FA] mb-4">By day of week</h3>
          <div className="space-y-2">
            {DAY_LABELS_LONG.map((day, d) => {
              const count = dayTotals[d];
              const pct = total > 0 ? (count / total) * 100 : 0;
              const width = (count / maxDayTotal) * 100;
              return (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-[#A9B3C7]">{day}</div>
                  <div className="flex-1 h-6 rounded-md bg-[rgba(244,246,250,0.04)] overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{
                        width: `${width}%`,
                        background:
                          d === peakDay
                            ? 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'
                            : 'rgba(139,92,246,0.35)',
                      }}
                    />
                  </div>
                  <div className="w-24 text-right text-xs font-mono text-[#F4F6FA]">
                    {count} · {pct.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hour-of-day */}
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-4 lg:p-6">
          <h3 className="text-sm font-bold text-[#F4F6FA] mb-4">By hour of day</h3>
          <div className="flex items-end gap-0.5 h-40 border-b border-[rgba(244,246,250,0.08)]">
            {HOURS.map((h) => {
              const count = hourTotals[h];
              const heightPct = Math.max(count > 0 ? 4 : 0, (count / maxHourTotal) * 100);
              const isPeak = count > 0 && h === peakHour;
              return (
                <div
                  key={h}
                  className="flex-1 rounded-t-sm transition-all"
                  title={`${formatHourLabel(h)} — ${count} order${count === 1 ? '' : 's'}`}
                  style={{
                    height: `${heightPct}%`,
                    background: isPeak
                      ? 'linear-gradient(180deg, #ec4899 0%, #8b5cf6 100%)'
                      : 'rgba(139,92,246,0.35)',
                  }}
                />
              );
            })}
          </div>
          <div className="flex mt-1 gap-0.5">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[9px] font-mono text-[#6B7280]"
              >
                {h % 3 === 0 ? formatHourLabel(h) : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad-timing recommendation */}
      {total > 0 && (
        <div className="rounded-2xl border border-[rgba(46,209,180,0.25)] bg-[rgba(46,209,180,0.05)] p-4 lg:p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(46,209,180,0.15)] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-[#2ED1B4]" />
            </div>
            <div className="text-sm text-[#A9B3C7] leading-relaxed">
              <p className="text-[#F4F6FA] font-semibold mb-1">Ad-timing suggestion</p>
              <p>
                Your busiest window is <span className="text-[#2ED1B4] font-semibold">
                  {formatHourLabel(bestWindow.start)}–{formatHourLabel((bestWindow.start + 3) % 24)}
                </span>{' '}
                (AEST/AEDT), and{' '}
                <span className="text-[#2ED1B4] font-semibold">{DAY_LABELS_LONG[peakDay]}</span> is your
                strongest day{' '}
                ({dayTotals[peakDay]} of {total} orders,{' '}
                {total > 0 ? Math.round((dayTotals[peakDay] / total) * 100) : 0}%). Consider setting Meta /
                Google ad delivery to concentrate around these times.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A9B3C7]">
          {label}
        </span>
      </div>
      <p className="text-xl lg:text-2xl font-bold text-[#F4F6FA] leading-tight">{value}</p>
      {hint && <p className="text-[10px] text-[#6B7280] mt-1">{hint}</p>}
    </div>
  );
}
