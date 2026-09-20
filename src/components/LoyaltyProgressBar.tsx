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
  /** Hide the PEPLAB Rewards title block (catalog uses a separate header row). */
  hideTitle?: boolean;
  /** Show “pts to next level” under the bar (dashboard). */
  showHint?: boolean;
  className?: string;
};

/**
 * PEPLAB Rewards level bar — full-width purple→pink→cyan neon fill,
 * tick dots + 5%…10% labels (no thumb).
 */
export default function LoyaltyProgressBar({
  lifetimeSpend = 0,
  loggedIn = false,
  compact = false,
  hideTitle = false,
  showHint = false,
  className = '',
}: LoyaltyProgressBarProps) {
  const progress: LoyaltyProgress = getLoyaltyProgress(lifetimeSpend, {
    forceMember: !loggedIn,
  });
  const { tier, nextTier, pointsToNext, progressInTier, tierIndex } = progress;

  const segments = LOYALTY_TIERS.length - 1;
  const segmentPct = 100 / segments;
  const markerPct = tierIndex * segmentPct;
  /** Fill from left through current level, into progress toward the next. */
  const fillPct = nextTier
    ? Math.max(markerPct + segmentPct * 0.35, markerPct + progressInTier * segmentPct)
    : 100;
  const clampedFill = Math.max(8, Math.min(100, fillPct));

  return (
    <div className={`min-w-0 w-full ${className}`}>
      {!hideTitle && (
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
      )}

      <div className="relative">
        <div
          className={`relative w-full ${compact ? 'h-2.5 sm:h-3' : 'h-3 sm:h-3.5'}`}
          role="progressbar"
          aria-valuemin={5}
          aria-valuemax={10}
          aria-valuenow={tier.cashbackPercent}
          aria-label={`${tier.name} — ${tier.cashbackPercent}% rewards back`}
        >
          {/* Thin grey track — flush left with rewards icon */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-[rgba(244,246,250,0.2)]" />

          {/* Tick dots */}
          {LOYALTY_CASHBACK_MARKS.map((pct, i) => {
            const isFirst = i === 0;
            const isLast = i === segments;
            return (
              <span
                key={`dot-${pct}`}
                className={`absolute top-1/2 z-[1] -translate-y-1/2 rounded-full bg-[#9CA3AF] ${
                  isFirst ? 'translate-x-0' : isLast ? '-translate-x-full' : '-translate-x-1/2'
                } ${compact ? 'w-1 h-1 sm:w-1.5 sm:h-1.5' : 'w-1.5 h-1.5'}`}
                style={{ left: `${(i / segments) * 100}%` }}
                aria-hidden="true"
              />
            );
          })}

          {/* Neon fill — flush left (square), rounded cyan tip */}
          <div
            className={`absolute left-0 top-1/2 z-[2] -translate-y-1/2 rounded-r-full transition-[width] duration-500 ease-out ${
              compact ? 'h-2 sm:h-2.5' : 'h-2.5 sm:h-3'
            }`}
            style={{
              width: `${clampedFill}%`,
              background:
                'linear-gradient(90deg, #7B2FF7 0%, #C084FC 32%, #F0ABFC 55%, #67E8F9 82%, #22D3EE 100%)',
              boxShadow:
                '0 0 6px rgba(168,85,247,0.45), 0 0 14px rgba(34,211,238,0.75), 0 0 22px rgba(34,211,238,0.35)',
            }}
          />
        </div>

        {/* Percentage labels — first flush left under icon */}
        <div className={`relative w-full ${compact ? 'mt-1.5 h-3' : 'mt-2 h-4'}`}>
          {LOYALTY_CASHBACK_MARKS.map((pct, i) => {
            const active = pct === tier.cashbackPercent;
            const isFirst = i === 0;
            const isLast = i === segments;
            return (
              <span
                key={`label-${pct}`}
                className={`absolute tabular-nums leading-none ${
                  isFirst ? 'translate-x-0' : isLast ? '-translate-x-full' : '-translate-x-1/2'
                } ${active ? 'font-semibold text-white' : 'font-medium text-[#9CA3AF]'} ${
                  compact ? 'text-[8px] sm:text-[11px]' : 'text-[10px] sm:text-xs'
                }`}
                style={{ left: `${(i / segments) * 100}%` }}
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
