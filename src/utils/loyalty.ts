/**
 * PEPLAB Rewards loyalty levels.
 *
 * Level is based on lifetime purchase spend ($1 ≈ 1 pt display).
 * Cashback % is the rewards-back rate on every order (via points earn rate).
 * Redeeming points never lowers the level — only lifetime spend matters.
 */

export type LoyaltyTierId =
  | 'member'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'elite';

export type LoyaltyTier = {
  id: LoyaltyTierId;
  name: string;
  /** Minimum lifetime spend (AUD / display-pts) to be on this level. */
  minSpend: number;
  /** Exclusive upper bound; Infinity for Elite. */
  maxSpend: number;
  /** Rewards-back percent on every order (5–10). */
  cashbackPercent: number;
};

/** Ordered lowest → highest. Thresholds match the client's level table. */
export const LOYALTY_TIERS: readonly LoyaltyTier[] = [
  { id: 'member',   name: 'Member',   minSpend: 0,    maxSpend: 500,    cashbackPercent: 5  },
  { id: 'silver',   name: 'Silver',   minSpend: 500,  maxSpend: 1200,   cashbackPercent: 6  },
  { id: 'gold',     name: 'Gold',     minSpend: 1200, maxSpend: 2500,   cashbackPercent: 7  },
  { id: 'platinum', name: 'Platinum', minSpend: 2500, maxSpend: 4500,   cashbackPercent: 8  },
  { id: 'diamond',  name: 'Diamond',  minSpend: 4500, maxSpend: 7000,   cashbackPercent: 9  },
  { id: 'elite',    name: 'Elite',    minSpend: 7000, maxSpend: Infinity, cashbackPercent: 10 },
] as const;

/** Cashback % labels shown under the progress bar. */
export const LOYALTY_CASHBACK_MARKS = LOYALTY_TIERS.map((t) => t.cashbackPercent);

/**
 * Base earn rate is 1 pt / $1 at 5% cashback (points redeem at ~$0.05 each).
 * Higher tiers scale the earn rate so effective cashback matches the tier %.
 */
export const BASE_CASHBACK_PERCENT = 5;

export function getLoyaltyTier(lifetimeSpend: number): LoyaltyTier {
  const spend = Math.max(0, Number(lifetimeSpend) || 0);
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i -= 1) {
    if (spend >= LOYALTY_TIERS[i].minSpend) return LOYALTY_TIERS[i];
  }
  return LOYALTY_TIERS[0];
}

export function getLoyaltyTierIndex(tier: LoyaltyTier): number {
  return LOYALTY_TIERS.findIndex((t) => t.id === tier.id);
}

export type LoyaltyProgress = {
  tier: LoyaltyTier;
  tierIndex: number;
  /** Lifetime spend used for leveling (display as points). */
  lifetimeSpend: number;
  /** Next tier, or null when Elite. */
  nextTier: LoyaltyTier | null;
  /** Points (spend) still needed to unlock the next level. */
  pointsToNext: number;
  /** 0–1 progress within the current tier toward the next. */
  progressInTier: number;
  /**
   * 0–100 position on the multi-stop bar (5% … 10%).
   * Guests / forced Member sit at the first mark.
   */
  barPercent: number;
};

/**
 * Build progress for the homepage / dashboard level bar.
 * Pass `forceMember` for logged-out visitors (always show 5%).
 */
export function getLoyaltyProgress(
  lifetimeSpend: number,
  opts?: { forceMember?: boolean },
): LoyaltyProgress {
  if (opts?.forceMember) {
    const tier = LOYALTY_TIERS[0];
    return {
      tier,
      tierIndex: 0,
      lifetimeSpend: 0,
      nextTier: LOYALTY_TIERS[1],
      pointsToNext: LOYALTY_TIERS[1].minSpend,
      progressInTier: 0,
      barPercent: 0,
    };
  }

  const spend = Math.max(0, Number(lifetimeSpend) || 0);
  const tier = getLoyaltyTier(spend);
  const tierIndex = getLoyaltyTierIndex(tier);
  const nextTier = tierIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[tierIndex + 1] : null;

  let progressInTier = 1;
  let pointsToNext = 0;
  if (nextTier) {
    const span = nextTier.minSpend - tier.minSpend;
    const into = spend - tier.minSpend;
    progressInTier = span > 0 ? Math.min(1, Math.max(0, into / span)) : 1;
    pointsToNext = Math.max(0, Math.ceil(nextTier.minSpend - spend));
  }

  const segment = 100 / (LOYALTY_TIERS.length - 1);
  const barPercent = Math.min(100, tierIndex * segment + progressInTier * segment);

  return {
    tier,
    tierIndex,
    lifetimeSpend: spend,
    nextTier,
    pointsToNext,
    progressInTier,
    barPercent,
  };
}

/**
 * Convert a cashback % into points-per-dollar relative to the 5% base rate.
 * 5% → 1.0, 6% → 1.2, …, 10% → 2.0
 */
export function pointsPerDollarForCashback(cashbackPercent: number): number {
  const pct = Number(cashbackPercent) || BASE_CASHBACK_PERCENT;
  return pct / BASE_CASHBACK_PERCENT;
}
