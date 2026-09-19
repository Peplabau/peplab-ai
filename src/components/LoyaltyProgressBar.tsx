import {
  LOYALTY_CASHBACK_MARKS,
  LOYALTY_TIERS,
  getLoyaltyProgress,
  type LoyaltyProgress,
} from '@/utils/loyalty';

type LoyaltyProgressBarProps = {
  /** Lifetime purchase spend (AUD). Ignored when `loggedIn` is false. */
  lifetimeSpend?: number;
  /** When false, bar stays locked at Member / 5%. */
  loggedIn?: boolean;
  /** Compact layout for the catalog strip. */
  compact?: boolean;
  /** Show “pts to next level” under the bar (dashboard). Hidden on catalog to match mock. */
  showHint?: boolean;
  className?: string;
};

/**
 * PEPLAB Rewards level bar — matches the client mock:
 * title + subtitle, tick marks, purple→pink completed fill,
 * cyan progress toward next level, white glowing pill at current level.
 */
export default function LoyaltyProgressBar({
  lifetimeSpend = 0,
  loggedIn = false,
  compact = false,
  showHint = false,
  className = '',
}: LoyaltyProgressBarProps) {
  const progress: LoyaltyProgress = getLoyaltyProgress(lifetimeSpend, {
    forceMember: !loggedIn,
  });
  const { tier, nextTier, pointsToNext, progressInTier, tierIndex } = progress;

  const segments = LOYALTY_TIERS.length - 1; // 5 gaps between 6 marks
  const segmentPct = 100 / segments;
  /** White pill sits on the current level’s tick (5% / 6% / …). */
  const markerPct = tierIndex * segmentPct;
  /** Cyan fill ends between current and next tick based on progress. */
  const progressEndPct = nextTier
    ? markerPct + progressInTier * segmentPct
    : 100;
  /** Completed purple fill reaches the current tick (full bar at Elite). */
  const completedPct = nextTier ? markerPct : 100;

  return (
    <div className={`min-w-0 w-full ${className}`}>
      <div className={compact ? 'mb-2 sm:mb-2.5' : 'mb-3 sm:mb-4'}>
        <p
          className={`font-bold text-white leading-tight tracking-tight ${
            compact ? 'text-[11px] sm:text-base' : 'text-base sm:text-lg'
          }`}
        >
          PEPLAB Rewards
        </p>
        <p
          className={`leading-snug text-[#C8CDD8] ${
            compact ? 'text-[8px] sm:text-[11px] mt-0.5' : 'text-xs sm:text-sm mt-1'
          }`}
        >
          Unlock cashback &amp; discounts
        </p>
      </div>

      <div className={`relative ${compact ? 'px-0.5' : 'px-1'}`}>
        {/* Tick marks above the track */}
        <div
          className={`relative w-full ${compact ? 'h-2 mb-0.5' : 'h-2.5 mb-1'}`}
          aria-hidden="true"
        >
          {LOYALTY_CASHBACK_MARKS.map((pct, i) => {
            const left = (i / segments) * 100;
            const reached = i <= tierIndex;
            return (
              <span
                key={pct}
                className={`absolute bottom-0 w-px -translate-x-1/2 ${
                  reached ? 'bg-[#C4B5FD]' : 'bg-[rgba(244,246,250,0.22)]'
                } ${compact ? 'h-1.5' : 'h-2'}`}
                style={{ left: `${left}%` }}
              />
            );
          })}
        </div>

        {/* Track */}
        <div
          className={`relative w-full ${compact ? 'h-[6px] sm:h-2' : 'h-2 sm:h-2.5'}`}
          role="progressbar"
          aria-valuemin={5}
          aria-valuemax={10}
          aria-valuenow={tier.cashbackPercent}
          aria-label={`${tier.name} — ${tier.cashbackPercent}% rewards back`}
        >
          {/* Base thin grey line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-[rgba(244,246,250,0.18)]" />

          {/* Completed stretch (purple → pink), thick */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#E879F9] shadow-[0_0_10px_rgba(168,85,247,0.65)] transition-[width] duration-500 ease-out ${
              compact ? 'h-[6px] sm:h-2' : 'h-2 sm:h-2.5'
            }`}
            style={{ width: `${Math.max(0, completedPct)}%` }}
          />

          {/* In-level progress (cyan glow) toward next tick */}
          {nextTier && progressEndPct > markerPct && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#67E8F9] to-[#22D3EE] shadow-[0_0_14px_rgba(34,211,238,0.85)] transition-[left,width] duration-500 ease-out ${
                compact ? 'h-[6px] sm:h-2' : 'h-2 sm:h-2.5'
              }`}
              style={{
                left: `${markerPct}%`,
                width: `${Math.max(0, progressEndPct - markerPct)}%`,
              }}
            />
          )}

          {/* Stop dots on the track */}
          {LOYALTY_CASHBACK_MARKS.map((pct, i) => {
            const left = (i / segments) * 100;
            const reached = i <= tierIndex;
            return (
              <span
                key={`dot-${pct}`}
                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  reached
                    ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                    : 'bg-[#4B5563]'
                } ${compact ? 'w-1 h-1 sm:w-1.5 sm:h-1.5' : 'w-1.5 h-1.5'}`}
                style={{ left: `${left}%` }}
                aria-hidden="true"
              />
            );
          })}

          {/* White glowing pill at current level */}
          <div
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-[left] duration-500 ease-out ${
              compact
                ? 'w-[5px] h-3.5 sm:w-1.5 sm:h-4 shadow-[0_0_10px_2px_rgba(255,255,255,0.95),0_0_18px_rgba(167,139,250,0.7)]'
                : 'w-1.5 h-5 sm:w-2 sm:h-6 shadow-[0_0_12px_3px_rgba(255,255,255,0.95),0_0_22px_rgba(167,139,250,0.75)]'
            }`}
            style={{ left: `${Math.max(0, Math.min(100, markerPct))}%` }}
            aria-hidden="true"
          />
        </div>

        {/* Percentage labels */}
        <div className={`relative w-full ${compact ? 'mt-1.5 h-3' : 'mt-2 h-4'}`}>
          {LOYALTY_CASHBACK_MARKS.map((pct, i) => {
            const left = (i / segments) * 100;
            const active = pct === tier.cashbackPercent;
            return (
              <span
                key={`label-${pct}`}
                className={`absolute -translate-x-1/2 font-medium tabular-nums leading-none ${
                  active ? 'text-white' : 'text-[#6B7280]'
                } ${compact ? 'text-[7px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}
                style={{ left: `${left}%` }}
              >
                {pct}%
              </span>
            );
          })}
        </div>
      </div>

      {showHint && (
        <p
          className={`text-[#A9B3C7] leading-snug ${
            compact ? 'text-[8px] sm:text-[11px] mt-1.5' : 'text-[11px] sm:text-xs mt-2'
          }`}
        >
          {!loggedIn ? (
            <>Log in to track your level · Members start at 5%</>
          ) : nextTier ? (
            <>
              {pointsToNext.toLocaleString()} pts to {nextTier.name} ({nextTier.cashbackPercent}%
              back)
            </>
          ) : (
            <>Max level · {tier.cashbackPercent}% back on every order</>
          )}
        </p>
      )}
    </div>
  );
}
