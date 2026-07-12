import { useId } from 'react';
import { cn } from '@/lib/utils';

type CoaHplcChartProps = {
  purityLabel: string;
  compact?: boolean;
  className?: string;
};

export default function CoaHplcChart({ purityLabel, compact = false, className }: CoaHplcChartProps) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <div
      className={cn(
        'coa-rg-chart relative shrink-0 rounded-lg p-1.5',
        compact ? 'h-[6.5rem]' : 'h-[9rem] sm:h-[11rem]',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 360 110" className="relative z-[1] h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="55%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <text x="4" y="12" fill="#6B7280" fontSize="7" fontWeight="600">
          MAU
        </text>
        <text x="320" y="108" fill="#6B7280" fontSize="7" fontWeight="600">
          RT (MIN)
        </text>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <line
            key={n}
            x1={(n - 1) * 40 + 20}
            y1="18"
            x2={(n - 1) * 40 + 20}
            y2="92"
            stroke="rgba(244,246,250,0.05)"
            strokeWidth="1"
          />
        ))}
        <line x1="0" y1="92" x2="360" y2="92" stroke="rgba(244,246,250,0.1)" strokeWidth="1" />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <text
            key={`x-${n}`}
            x={(n - 1) * 40 + 20}
            y="104"
            textAnchor="middle"
            fill="#6B7280"
            fontSize="6"
          >
            {n}
          </text>
        ))}
        <path
          data-coa-chart-path
          d="M0,92 L52,92 L68,24 L82,92 L320,92"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect x="158" y="14" width="34" height="15" rx="3" fill="rgba(244,246,250,0.08)" />
        <text x="175" y="25" textAnchor="middle" fill="#F4F6FA" fontSize="7" fontWeight="700">
          MAIN
        </text>
        <rect
          x="188"
          y="32"
          width="96"
          height="18"
          rx="4"
          fill="rgba(139,92,246,0.18)"
          stroke="rgba(139,92,246,0.45)"
          strokeWidth="1"
        />
        <text x="236" y="44" textAnchor="middle" fill="#C4B5FD" fontSize="7" fontWeight="600">
          Peak 1 · RT 5.63 · {purityLabel}
        </text>
      </svg>
    </div>
  );
}
