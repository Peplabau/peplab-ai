import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { getUserPointsBalance, getUserTransactions, addUserPoints, getReferrals } from '@/lib/supabase-db';
import type { PointsEvent } from '@/lib/supabase-db';
import {
  SIGNUP_BONUS,
  FIRST_ORDER_BONUS,
  calculatePurchasePoints,
  type CalculatePurchasePointsOptions,
  type PointType,
} from '@/utils/points';

// Re-export constants so existing consumers (Dashboard, AdminDashboard) don't break
export { SIGNUP_BONUS, FIRST_ORDER_BONUS, calculatePurchasePoints };

/** Single redemption option. */
export type RedemptionTier = {
  points: number;
  value: number;
  label: string;
};

// Redemption tiers — no level gate, no minimum order subtotal, no minimum
// lifetime spend. The points balance is the only gate. If the tier's $-value
// exceeds the cart total at checkout the unused portion is refunded as
// points (see `redeemPoints`) so customers never "waste" points.
export const REDEMPTION_TIERS: RedemptionTier[] = [
  { points: 100,   value: 5,   label: '$5 Off'   },
  { points: 500,   value: 25,  label: '$25 Off'  },
  { points: 1000,  value: 50,  label: '$50 Off'  },
  { points: 2500,  value: 125, label: '$125 Off' },
  { points: 5000,  value: 250, label: '$250 Off' },
  { points: 10000, value: 500, label: '$500 Off' },
];

/**
 * One-stop predicate for "can the user actually pick this tier on this order
 * right now?". The points balance is the only gate — there is no minimum
 * order subtotal and no lifetime-spend requirement.
 */
export function isRedemptionTierAvailable(
  tier: RedemptionTier,
  opts: { balance: number },
): { available: boolean; reason?: string } {
  if (opts.balance < tier.points) {
    return {
      available: false,
      reason: `Need ${(tier.points - opts.balance).toLocaleString()} more points.`,
    };
  }
  return { available: true };
}

// Legacy alias so existing imports of BONUS_POINTS still compile
export const BONUS_POINTS = {
  ACCOUNT_CREATION: SIGNUP_BONUS,
  FIRST_PURCHASE: FIRST_ORDER_BONUS,
  REFERRAL: 100,
};

export const POINTS_EXPIRY_MONTHS = 12;

// PointsTransaction shape exposed to UI components
export interface PointsTransaction {
  id: string;
  type: PointType;
  points: number;
  description: string;
  date: string;
  orderId?: string | null;
}

export interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'completed';
  date: string;
  pointsEarned: number;
}

interface RewardsContextType {
  balance: number;
  /** Lifetime points earned (positive events only). */
  lifetimePoints: number;
  /** Lifetime spend in dollars, derived from 'purchase' type rows. */
  lifetimeSpend: number;
  transactions: PointsTransaction[];
  referrals: Referral[];
  earnPoints: (
    amount: number,
    description: string,
    orderId?: string,
    purchaseOpts?: CalculatePurchasePointsOptions,
  ) => Promise<void>;
  /**
   * Redeem a tier's worth of points.
   *
   * @param points  Tier point cost (must match a tier in {@link REDEMPTION_TIERS}).
   * @param description  Free-form transaction description for the user's history.
   * @param appliedDiscount  Dollar value of the discount that was actually
   *   applied at checkout. If the cart was smaller than the tier value the
   *   caller passes the capped figure (e.g. tier $50, cart $30 → pass 30) and
   *   the unused portion is automatically converted back into points at the
   *   tier's rate. Defaults to the full tier value (no refund).
   *
   * The result reports `refundedPoints` when an unused portion was refunded
   * so the caller can show a confirmation chip ("+200 pts refunded").
   */
  redeemPoints: (
    points: number,
    description: string,
    appliedDiscount?: number,
  ) => Promise<{ success: boolean; error?: string; refundedPoints?: number }>;
  addBonusPoints: (type: 'account_creation' | 'first_purchase', description: string) => Promise<void>;
  createReferral: (email: string, referrerEmail?: string) => { success: boolean; error?: string };
  completeReferral: (referralId: string) => Promise<void>;
  /** Tiers the user can redeem right now (points balance ≥ tier cost). */
  getAvailableRedemptions: () => typeof REDEMPTION_TIERS;
  getPointsValue: (points: number) => number;
  isLoading: boolean;
  refreshPoints: (overrideUserId?: string) => Promise<void>;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance]           = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [lifetimeSpend, setLifetimeSpend]   = useState(0);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [referrals, setReferrals]       = useState<Referral[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [userId, setUserId]             = useState<string | null>(null);

  // Clear referral metadata stored during signup flow
  const processReferralFromMetadata = async (user: { id: string; user_metadata?: Record<string, unknown> }) => {
    const hasRef = user.user_metadata?.referrer_id != null ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('peplab_ref'));
    if (!hasRef) return;
    try { sessionStorage.removeItem('peplab_ref'); } catch (_) {}
    await supabase.auth.updateUser({ data: { referrer_id: null } }).catch(() => {});
  };

  /**
   * Wipe all rewards state back to defaults. Used whenever the active user
   * changes (sign in, sign out, account switch) so that one user's data can
   * never bleed into another user's session on the same browser.
   */
  const resetRewardsState = useCallback(() => {
    setBalance(0);
    setLifetimePoints(0);
    setLifetimeSpend(0);
    setTransactions([]);
    setReferrals([]);
  }, []);

  // Keep the latest userId in a ref so the auth listener (which captures the
  // initial closure) can compare against the *current* user without needing
  // to re-subscribe on every state change.
  const userIdRef = useRef<string | null>(null);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();
        if (user) {
          // Always start from a clean slate before pulling this user's data.
          resetRewardsState();
          setUserId(user.id);
          userIdRef.current = user.id;
          await processReferralFromMetadata(user);
          await refreshPoints(user.id);
        } else {
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const nextUserId = session?.user?.id ?? null;
      const prevUserId = userIdRef.current;

      if (!nextUserId) {
        // Sign-out: clear everything. Don't fall back to localStorage here,
        // because that cache could contain stale data from a previously
        // signed-in user.
        resetRewardsState();
        setUserId(null);
        userIdRef.current = null;
        return;
      }

      // Only do a full reset + reload when the *user* actually changes. For
      // USER_UPDATED, TOKEN_REFRESHED and INITIAL_SESSION on the same user
      // we deliberately keep the existing in-memory state to avoid optimistic
      // updates flickering back to defaults.
      if (prevUserId !== nextUserId) {
        resetRewardsState();
        setUserId(nextUserId);
        userIdRef.current = nextUserId;
        await processReferralFromMetadata(session!.user);
        await refreshPoints(nextUserId);
        return;
      }

      if (event === 'USER_UPDATED') {
        await refreshPoints(nextUserId);
      }
    });

    return () => subscription.unsubscribe();
  }, [resetRewardsState]);

  /**
   * Refresh points and referrals from Supabase.
   * Balance is derived dynamically from SUM(points) — never stored as a column.
   */
  const refreshPoints = useCallback(async (overrideUserId?: string) => {
    const uid = overrideUserId ?? userId;
    if (!uid) return;

    try {
      const [events, bal, dbReferrals] = await Promise.all([
        getUserTransactions(uid),
        getUserPointsBalance(uid),
        getReferrals(uid),
      ]);

      setBalance(bal);

      // Derive lifetime figures from event rows
      const earned = (events || []).reduce((s, e) => s + (e.points > 0 ? e.points : 0), 0);
      const spent  = (events || [])
        .filter(e => e.type === 'purchase')
        .reduce((s, e) => s + e.points, 0);
      setLifetimePoints(earned);
      setLifetimeSpend(spent);

      setTransactions((events || []).map((e: PointsEvent) => ({
        id:          e.id,
        type:        e.type,
        points:      e.points,
        description: e.description,
        date:        e.created_at,
        orderId:     e.order_id,
      })));

      const mappedDb = (dbReferrals || []).map(r => ({
        id:           r.id,
        email:        r.referred_email,
        status:       (r.status === 'completed' ? 'completed' : 'pending') as 'pending' | 'completed',
        date:         r.created_at,
        pointsEarned: r.status === 'completed' ? BONUS_POINTS.REFERRAL : 0,
      }));
      let localPending: Referral[] = [];
      try {
        const saved = localStorage.getItem('peplab_rewards');
        if (saved) {
          const parsed = JSON.parse(saved);
          const pending = (parsed.referrals || []).filter((r: Referral) => r.status === 'pending');
          const dbEmails = new Set(mappedDb.map(r => r.email.toLowerCase()));
          localPending = pending.filter((r: Referral) => !dbEmails.has((r.email || '').toLowerCase()));
        }
      } catch (_) {}
      setReferrals([...mappedDb, ...localPending]);
    } catch (error) {
      console.error('Error refreshing points:', error);
    }
  }, [userId]);

  /**
   * Guest/anonymous fallback only. We deliberately do NOT pull the redemption
   * level or balance out of localStorage anymore — those values are
   * authoritative on the server (per user) and pulling them from a shared
   * browser cache caused state from one user to leak into another user's
   * session on the same machine.
   */
  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem('peplab_rewards');
    if (!savedData) return;
    try {
      const parsed = JSON.parse(savedData);
      // Only restore data that's safe for an anonymous browser session.
      // Pending referrals are kept so guests can resume signup flows.
      setReferrals(
        (parsed.referrals || []).filter((r: Referral) => r.status === 'pending'),
      );
    } catch (e) {
      console.error('Failed to load rewards data:', e);
    }
  };

  /**
   * Guest-mode persistence. We never persist level/balance/lifetime values
   * here — they're per-user server state and must not be shared via this
   * browser-wide cache.
   */
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        'peplab_rewards',
        JSON.stringify({
          referrals: referrals.filter(r => r.status === 'pending'),
        }),
      );
    } catch (_) {
      // ignore quota / disabled-storage errors
    }
  };

  /** Award purchase points (1pt per $1 spent). Called by admin when marking order paid. */
  const earnPoints = useCallback(async (
    amount: number,
    description: string,
    orderId?: string,
    purchaseOpts?: CalculatePurchasePointsOptions,
  ) => {
    const points = calculatePurchasePoints(amount, purchaseOpts);

    if (userId) {
      await addUserPoints(userId, points, 'purchase', description, orderId);
      await refreshPoints();
    } else {
      const transaction: PointsTransaction = {
        id: generateId(),
        type: 'purchase',
        points,
        description,
        date: new Date().toISOString(),
      };
      setTransactions(prev => [transaction, ...prev]);
      setBalance(prev => prev + points);
      setLifetimePoints(prev => prev + points);
      setLifetimeSpend(prev => prev + amount);
      saveToLocalStorage();
    }
  }, [userId, refreshPoints]);

  const redeemPoints = useCallback(async (
    points: number,
    description: string,
    appliedDiscount?: number,
  ): Promise<{ success: boolean; error?: string; refundedPoints?: number }> => {
    if (balance < points) {
      return { success: false, error: 'Insufficient points balance' };
    }

    const tier = REDEMPTION_TIERS.find((t) => t.points === points);
    if (!tier) {
      return { success: false, error: 'Invalid redemption tier' };
    }

    // Compute how much of the tier's $-value was actually used by this order
    // and refund the unused portion as points at the tier's native rate
    // (tier.points / tier.value, which is a flat 20 pts per $1 in the current
    // schedule but derived per-tier so the math survives future re-pricing).
    //
    // Refund cases:
    //   tier $50 / cart $30  →  applied 30, refund $20 → +400 pts back
    //   tier $50 / cart $50+ →  applied 50, no refund
    //   appliedDiscount omitted → assume full value, no refund (legacy callers)
    const requestedDiscount = appliedDiscount ?? tier.value;
    const cappedDiscount = Math.max(0, Math.min(tier.value, requestedDiscount));
    const unusedValue = tier.value - cappedDiscount;
    const refundedPoints =
      unusedValue > 0
        ? Math.round((unusedValue * tier.points) / tier.value)
        : 0;

    const refundDescription =
      refundedPoints > 0
        ? `${tier.label} refund — used $${cappedDiscount.toFixed(2)} of $${tier.value} (cart smaller than tier value)`
        : '';

    if (userId) {
      await addUserPoints(userId, -points, 'redeemed', description);
      if (refundedPoints > 0) {
        // Use 'admin_adjustment' because there's no dedicated 'refund' point
        // type in the DB enum. The description makes the intent explicit.
        await addUserPoints(userId, refundedPoints, 'admin_adjustment', refundDescription);
      }
      await refreshPoints();
    } else {
      const spent: PointsTransaction = {
        id: generateId(),
        type: 'redeemed',
        points: -points,
        description,
        date: new Date().toISOString(),
      };
      const txns: PointsTransaction[] = [spent];
      if (refundedPoints > 0) {
        txns.unshift({
          id: generateId(),
          type: 'admin_adjustment',
          points: refundedPoints,
          description: refundDescription,
          date: new Date().toISOString(),
        });
      }
      setTransactions(prev => [...txns, ...prev]);
      setBalance(prev => prev - points + refundedPoints);
      saveToLocalStorage();
    }

    return { success: true, refundedPoints };
  }, [balance, userId, refreshPoints]);

  /**
   * Add a bonus event (first_purchase or account_creation).
   * Note: signup bonus is now awarded automatically by a DB trigger.
   * This is retained for first_purchase and manual admin use.
   */
  const addBonusPoints = useCallback(async (
    type: 'account_creation' | 'first_purchase',
    description: string
  ) => {
    const points = type === 'account_creation' ? BONUS_POINTS.ACCOUNT_CREATION : BONUS_POINTS.FIRST_PURCHASE;
    const pointType: PointType = type === 'first_purchase' ? 'first_order' : 'signup';

    if (userId) {
      await addUserPoints(userId, points, pointType, description);
      await refreshPoints();
    } else {
      const transaction: PointsTransaction = {
        id: generateId(),
        type: pointType,
        points,
        description,
        date: new Date().toISOString(),
      };
      setTransactions(prev => [transaction, ...prev]);
      setBalance(prev => prev + points);
      setLifetimePoints(prev => prev + points);
      saveToLocalStorage();
    }
  }, [userId, refreshPoints]);

  const createReferral = useCallback((
    email: string,
    referrerEmail?: string
  ): { success: boolean; error?: string } => {
    if (referrerEmail && email.toLowerCase() === referrerEmail.toLowerCase()) {
      return { success: false, error: 'Self-referrals are not allowed' };
    }

    const existingReferral = referrals.find(r => r.email.toLowerCase() === email.toLowerCase());
    if (existingReferral) {
      return { success: false, error: 'This email has already been referred' };
    }

    const referral: Referral = {
      id: generateId(),
      email,
      status: 'pending',
      date: new Date().toISOString(),
      pointsEarned: 0,
    };
    setReferrals(prev => [referral, ...prev]);
    saveToLocalStorage();
    return { success: true };
  }, [referrals]);

  const completeReferral = useCallback(async (referralId: string) => {
    setReferrals(prev => prev.map(ref => {
      if (ref.id === referralId && ref.status === 'pending') {
        if (userId) {
          addUserPoints(userId, BONUS_POINTS.REFERRAL, 'admin_adjustment', `Referral bonus - ${ref.email}`);
          refreshPoints();
        }
        return { ...ref, status: 'completed', pointsEarned: BONUS_POINTS.REFERRAL };
      }
      return ref;
    }));
  }, [userId, refreshPoints]);

  const getAvailableRedemptions = useCallback(() => {
    return REDEMPTION_TIERS.filter((tier) => balance >= tier.points);
  }, [balance]);

  const getPointsValue = useCallback((points: number) => {
    const sortedTiers = [...REDEMPTION_TIERS].sort((a, b) => b.points - a.points);
    for (const tier of sortedTiers) {
      if (points >= tier.points) {
        const multiplier = Math.floor(points / tier.points);
        return tier.value * multiplier;
      }
    }
    return 0;
  }, []);

  return (
    <RewardsContext.Provider
      value={{
        balance,
        lifetimePoints,
        lifetimeSpend,
        transactions,
        referrals,
        earnPoints,
        redeemPoints,
        addBonusPoints,
        createReferral,
        completeReferral,
        getAvailableRedemptions,
        getPointsValue,
        isLoading,
        refreshPoints,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}
