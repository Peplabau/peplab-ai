import { cn } from '@/lib/utils';

export const OZCANIUM_ANALYTICS_LAB_NAME = 'Ozcanium Analytics';

/** Ozcanium (white) + Analytics (cyan) — matches Ozcanium Analytics brand colours. */
export default function OzcaniumAnalyticsName({
  className,
  ozcaniumClassName,
  analyticsClassName,
  compact = false,
}: {
  className?: string;
  ozcaniumClassName?: string;
  analyticsClassName?: string;
  /** Two-line layout for narrow grid cells (COA cards, hero stats). */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span className={cn('inline-flex min-w-0 flex-col leading-tight', className)}>
        <span className={cn('truncate text-white', ozcaniumClassName)}>Ozcanium</span>
        <span className={cn('truncate text-[#00C4CC] font-[inherit]', analyticsClassName)}>Analytics</span>
      </span>
    );
  }

  return (
    <span className={cn('inline-flex min-w-0 flex-wrap items-baseline gap-x-1', className)}>
      <span className={cn('text-white', ozcaniumClassName)}>Ozcanium</span>
      <span className={cn('text-[#00C4CC] font-[inherit]', analyticsClassName)}>Analytics</span>
    </span>
  );
}
