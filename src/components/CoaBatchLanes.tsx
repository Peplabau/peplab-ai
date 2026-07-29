import { COA_BATCH_LANES } from '@/lib/coa-utils';
import { cn } from '@/lib/utils';

type CoaBatchLanesProps = {
  /** Count of certificates on the active batch lane. */
  activeCount: number;
  loading?: boolean;
  className?: string;
};

/**
 * Professional batch lane strip:
 *   15 ACTIVE     SOON         SOON
 *   BN88LAB  —  BB77LAB  —  BB66LAB
 */
export default function CoaBatchLanes({ activeCount, loading = false, className }: CoaBatchLanesProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.55)] px-3 py-4 sm:px-5 sm:py-5',
        className,
      )}
      role="group"
      aria-label="COA batch lanes"
    >
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {COA_BATCH_LANES.map((lane, index) => {
          const isActive = lane.status === 'active';
          const statusLabel = isActive
            ? loading
              ? '—'
              : `${activeCount} ACTIVE`
            : 'SOON';

          return (
            <div key={lane.id} className="flex min-w-0 items-end gap-2 sm:gap-4">
              {index > 0 ? (
                <span
                  className="mb-1.5 hidden text-[#5A667E] sm:inline select-none"
                  aria-hidden
                >
                  —
                </span>
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:min-w-[7.5rem]">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[0.14em] sm:text-[11px]',
                    isActive ? 'text-[#36ea51]' : 'text-[#8b93a8]',
                  )}
                >
                  {statusLabel}
                </span>
                <span
                  className={cn(
                    'mt-1.5 font-mono text-xs font-semibold tracking-[0.08em] sm:text-sm',
                    isActive ? 'text-[#F4F6FA]' : 'text-[#6B7280]',
                  )}
                >
                  {lane.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
