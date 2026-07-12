import { supabase } from './supabase';
import { cached, TTL_USER_SHORT } from './cache';
import { COMMISSION_TIERS, getTierForSales } from './affiliates';
import { BONUS_POINTS } from '@/context/RewardsContext';

/**
 * Public-facing leaderboard for promoter performance.
 *
 * Data source: the `promoters` table (already maintained by `record_affiliate_order`
 * RPC and `credit_affiliate_commission` RPC). We only expose anonymised data so
 * this view is safe to ship publicly — no email addresses, no full names, no PII
 * beyond what a friend would already see.
 *
 * Ranking metric: **reward points earned** (= credited referral orders ×
 * {@link BONUS_POINTS.REFERRAL}). Dollars are deliberately *not* surfaced —
 * the program awards points, so the public scoreboard speaks in points.
 *
 * Because points = orders × constant, ordering by points is identical to
 * ordering by `total_orders` at the SQL layer, so we still sort the table by
 * `total_orders` (cheap, indexed, no math in SQL needed).
 */

/** Constant published as part of the row so callers don't have to import the
 *  rewards context just to render "X pts" labels. */
export const POINTS_PER_REFERRAL = BONUS_POINTS.REFERRAL;

export interface LeaderboardRow {
  /** Stable promoter id — used to highlight the current user's row. */
  promoterId: string;
  /** Linked auth user id (may be null for admin-created promoters that haven't claimed). */
  userId: string | null;
  /** Anonymised display name (e.g. "John D."). */
  displayName: string;
  /** Tier slug ("standard" | "silver" | "gold" | "platinum"). */
  tier: string;
  /** Tier label for display. */
  tierLabel: string;
  /** Number of credited referral orders. */
  totalOrders: number;
  /** Reward points earned (= totalOrders × POINTS_PER_REFERRAL). */
  totalPoints: number;
  /** 1-based rank by reward points. */
  rank: number;
}

/** Format a points value for display: `1,200 pts`. */
export function formatPoints(points: number): string {
  return `${Math.max(0, Math.round(points)).toLocaleString()} pts`;
}

/**
 * Mask a promoter's name to "John D." so the leaderboard can be public without
 * leaking PII. Empty / single-word names fall back to a generic "Promoter".
 */
function anonymiseName(name: string | null | undefined): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Promoter';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  if (!first) return 'Promoter';
  // First name + last initial. Keep first name short (15 chars max).
  const firstClean = first.length > 15 ? first.slice(0, 15) : first;
  if (!last) return firstClean;
  const initial = last[0].toUpperCase();
  return `${firstClean} ${initial}.`;
}

/**
 * Fetch the top N active promoters ranked by reward points earned.
 * Cached per `limit` for 1 minute — short enough that a fresh referral
 * shows up quickly, long enough to absorb crowd traffic on the page.
 */
export async function getLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  return cached(
    `leaderboard:points:${limit}`,
    () => loadLeaderboard(limit),
    TTL_USER_SHORT,
    false,
  );
}

async function loadLeaderboard(limit: number): Promise<LeaderboardRow[]> {
  // We rank by `total_orders` because points = total_orders × POINTS_PER_REFERRAL,
  // so the order is identical and SQL doesn't have to compute the multiplication.
  // `total_sales` is still selected (cheap) so we can derive the tier honestly
  // when the row's stored `tier` column is empty.
  const { data, error } = await supabase
    .from('promoters')
    .select('id, user_id, name, tier, total_sales, total_orders')
    .eq('is_active', true)
    // Hide accounts with zero activity — keeps the board lively, not a roster.
    .gt('total_orders', 0)
    .order('total_orders', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getLeaderboard error:', error);
    return [];
  }

  return (data || []).map((row, idx) => {
    const totalOrders = Number(row.total_orders ?? 0);
    const totalSales = Number(row.total_sales ?? 0);
    const tierSlug = row.tier || getTierForSales(totalSales).name;
    const tierLabel =
      COMMISSION_TIERS.find((t) => t.name === tierSlug)?.label ?? 'Standard';
    return {
      promoterId: row.id,
      userId: row.user_id,
      displayName: anonymiseName(row.name),
      tier: tierSlug,
      tierLabel,
      totalOrders,
      totalPoints: totalOrders * POINTS_PER_REFERRAL,
      rank: idx + 1,
    };
  });
}

export interface MyRank {
  /** 1-based rank across ALL active promoters (not just the top N). */
  rank: number;
  /** Number of active promoters considered for ranking. */
  totalPromoters: number;
  /** The current user's row data. */
  row: LeaderboardRow | null;
}

/**
 * Compute the current user's rank using only their own row + a single COUNT
 * query — never downloads the full table. Safe under RLS because the user
 * always has read access to their own promoter row, and `count: 'exact'`
 * does not return any other rows' data.
 */
export async function getMyRank(promoterId: string): Promise<MyRank | null> {
  // 1. Fetch the user's own row (used for the metric we'll compare against
  //    everyone else, and for un-masked display in the widget).
  const { data: selfRow, error: selfErr } = await supabase
    .from('promoters')
    .select('id, user_id, name, tier, total_sales, total_orders, is_active')
    .eq('id', promoterId)
    .maybeSingle();

  if (selfErr || !selfRow) {
    if (selfErr) console.error('getMyRank self-fetch error:', selfErr);
    return null;
  }

  const myOrders = Number(selfRow.total_orders ?? 0);

  // 2. Count active promoters strictly ahead of us on this metric. RLS allows
  //    the count without exposing names — the response is just an integer.
  const { count: aheadCount, error: aheadErr } = await supabase
    .from('promoters')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .gt('total_orders', myOrders);

  if (aheadErr) {
    console.error('getMyRank ahead-count error:', aheadErr);
    return null;
  }

  // 3. Total active promoters (so we can show "rank X of Y").
  const { count: totalCount, error: totalErr } = await supabase
    .from('promoters')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (totalErr) {
    console.error('getMyRank total-count error:', totalErr);
    return null;
  }

  const totalSales = Number(selfRow.total_sales ?? 0);
  const tierSlug = selfRow.tier || getTierForSales(totalSales).name;
  const tierLabel =
    COMMISSION_TIERS.find((t) => t.name === tierSlug)?.label ?? 'Standard';

  // Inactive promoters or zero-metric promoters appear at the bottom — give
  // them an honest "unranked" rank past the end of the active list.
  const isRanked = (selfRow.is_active ?? true) && myOrders > 0;
  const rank = isRanked ? (aheadCount ?? 0) + 1 : (totalCount ?? 0) + 1;

  const row: LeaderboardRow = {
    promoterId: selfRow.id,
    userId: selfRow.user_id,
    displayName: anonymiseName(selfRow.name),
    tier: tierSlug,
    tierLabel,
    totalOrders: myOrders,
    totalPoints: myOrders * POINTS_PER_REFERRAL,
    rank,
  };

  return { rank, totalPromoters: totalCount ?? 0, row };
}
