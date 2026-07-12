import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, Crown, Medal, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getLeaderboard,
  formatPoints,
  type LeaderboardRow,
} from '@/lib/leaderboard';

gsap.registerPlugin(ScrollTrigger);

/**
 * Compact landing-page section showing the top 3 promoters.
 *
 * Goals:
 *   - Social proof for the affiliate program ("real people are earning here").
 *   - Soft competitive hook for visitors who could become promoters.
 *   - Privacy-respecting: names are masked at the data layer (`John D.`).
 *
 * The section gracefully self-hides if there are no ranked promoters yet so
 * the landing page never shows an awkward empty state to first-time visitors.
 */
export default function LeaderboardTop3() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const podiumRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(3)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        console.error('LeaderboardTop3 fetch failed:', err);
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
          },
        },
      );

      if (podiumRef.current) {
        gsap.fromTo(
          podiumRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: podiumRef.current,
              start: 'top 85%',
              end: 'top 55%',
              scrub: true,
            },
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, [rows]);

  // Hide the entire section gracefully on first render until we know if there
  // are any ranked promoters. Avoid laying out a placeholder block on a fresh
  // store with zero promoters.
  if (rows !== null && rows.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="leaderboard-top3"
      className="relative z-30 py-20 lg:py-28"
    >
      <div className="relative z-10 px-6 lg:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-10 lg:mb-12">
          <span className="eyebrow mb-4 block">PROMOTER LEAGUE</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-3">
            This month's <span className="gradient-text">top promoters</span>
          </h2>
          <p className="text-sm sm:text-base text-[#A9B3C7] max-w-xl mx-auto">
            Real members racking up reward points by referring friends. Share your promo code and your
            name could be next on the board.
          </p>
        </div>

        {/* Podium */}
        <div className="max-w-4xl mx-auto">
          {rows === null ? (
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-44 sm:h-56 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div ref={podiumRef} className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
              {/* Visual order: 2 — 1 — 3 (classic podium). */}
              {[1, 0, 2].map((podiumIdx, slot) => {
                const row = rows[podiumIdx];
                if (!row) return <div key={`empty-${slot}`} />;
                return (
                  <PodiumCard
                    key={row.promoterId}
                    row={row}
                    placement={(podiumIdx + 1) as 1 | 2 | 3}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/leaderboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#2ED1B4] text-[#070A12] text-sm font-semibold hover:opacity-95 active:scale-[0.97] transition-all"
          >
            <Trophy className="w-4 h-4" />
            View full leaderboard
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-[#F4F6FA] hover:bg-white/10 active:scale-[0.97] transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Get my promo code
          </a>
        </div>
      </div>
    </section>
  );
}

const PODIUM_ACCENTS = [
  // 1st — gold
  { wrap: 'bg-[#111827] border-amber-400/40', label: 'text-amber-300', icon: 'text-amber-300' },
  // 2nd — silver
  { wrap: 'bg-[#111827] border-slate-300/30', label: 'text-slate-200', icon: 'text-slate-200' },
  // 3rd — bronze
  { wrap: 'bg-[#111827] border-orange-500/30', label: 'text-orange-300', icon: 'text-orange-300' },
];

const TIER_CHIP: Record<string, string> = {
  platinum: 'bg-[rgba(229,231,235,0.1)] border-[rgba(229,231,235,0.25)] text-[#E5E7EB]',
  gold: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
  silver: 'bg-slate-400/10 border-slate-400/25 text-slate-200',
  standard: 'bg-white/5 border-white/10 text-[#A9B3C7]',
};

function PodiumCard({ row, placement }: { row: LeaderboardRow; placement: 1 | 2 | 3 }) {
  const accent = PODIUM_ACCENTS[placement - 1];
  const tierChip = TIER_CHIP[row.tier] ?? TIER_CHIP.standard;
  // Make the #1 card visibly taller — classic podium silhouette.
  const heightClass = placement === 1 ? 'sm:pt-10 sm:pb-9' : placement === 2 ? 'sm:pt-7 sm:pb-6' : 'sm:pt-5 sm:pb-4';
  return (
    <div
      className={`relative rounded-2xl border ${accent.wrap} px-3 sm:px-5 pt-5 pb-4 ${heightClass} text-center transition-transform duration-300 hover:-translate-y-1`}
    >
      <div
        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#070A12] border ${accent.wrap} flex items-center justify-center`}
      >
        {placement === 1 ? (
          <Crown className={`w-4 h-4 ${accent.icon}`} />
        ) : (
          <Medal className={`w-4 h-4 ${accent.icon}`} />
        )}
      </div>
      <p
        className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${accent.label} mt-1`}
      >
        #{placement}
      </p>
      <p className="mt-2 text-sm sm:text-lg font-semibold text-[#F4F6FA] truncate">
        {row.displayName}
      </p>
      <span
        className={`inline-block mt-1.5 px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-medium uppercase tracking-wider ${tierChip}`}
      >
        {row.tierLabel}
      </span>
      <p className="mt-3 inline-flex items-center gap-1.5 text-lg sm:text-2xl font-bold text-[#2ED1B4] tabular-nums">
        <Gift className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
        {formatPoints(row.totalPoints)}
      </p>
      <p className="text-[9px] sm:text-[11px] text-[#A9B3C7] mt-0.5">
        {row.totalOrders.toLocaleString()} {row.totalOrders === 1 ? 'referral' : 'referrals'}
      </p>
    </div>
  );
}
