import { useEffect, useState } from 'react';
import { Trophy, ArrowRight, Crown, Medal, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAffiliate } from '@/context/AffiliateContext';
import {
  getLeaderboard,
  getMyRank,
  formatPoints,
  type LeaderboardRow,
} from '@/lib/leaderboard';

/**
 * Compact promoter-leaderboard preview for the user dashboard.
 *
 * - Shows the top 3 to spark curiosity ("can I beat them?").
 * - Shows the user's own rank if they've activated their promo code.
 * - Has a clear CTA to the full /leaderboard page.
 *
 * Public data only — names are anonymised (e.g. "John D.") by `getLeaderboard`.
 */
export default function LeaderboardWidget() {
  const { myPromoter } = useAffiliate();
  const [top, setTop] = useState<LeaderboardRow[] | null>(null);
  const [myRank, setMyRank] = useState<{ rank: number; total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(3)
      .then((rows) => {
        if (!cancelled) setTop(rows);
      })
      .catch((err) => {
        console.error('LeaderboardWidget top fetch failed:', err);
        if (!cancelled) setTop([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!myPromoter) {
      setMyRank(null);
      return;
    }
    let cancelled = false;
    getMyRank(myPromoter.id)
      .then((res) => {
        if (cancelled || !res) return;
        setMyRank({ rank: res.rank, total: res.totalPromoters });
      })
      .catch((err) => {
        console.error('LeaderboardWidget rank fetch failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [myPromoter]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-[rgba(17,24,39,0.6)] to-[rgba(139,92,246,0.1)] border border-amber-500/20 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-[#F4F6FA] flex items-center gap-1.5">
              Promoter Leaderboard
              <Sparkles className="w-3.5 h-3.5 text-amber-300/80" />
            </h3>
            <p className="text-[10px] sm:text-xs text-[#A9B3C7]">
              Top promoters by reward points earned
            </p>
          </div>
        </div>
        <a
          href="/leaderboard"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-[#F4F6FA] hover:bg-white/10 active:scale-[0.97] transition-all"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* My rank chip — only when the user has a promoter row */}
      {myPromoter && myRank && (
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[rgba(46,209,180,0.1)] border border-[#2ED1B4]/25">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#2ED1B4]/20 border border-[#2ED1B4]/30 flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-[#2ED1B4]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[#A9B3C7]">Your rank</p>
              <p className="text-sm font-semibold text-[#F4F6FA] tabular-nums">
                #{myRank.rank}
                <span className="text-[10px] font-normal text-[#A9B3C7] ml-1">
                  of {myRank.total.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
          <a
            href="/leaderboard"
            className="text-[10px] sm:text-xs font-medium text-[#2ED1B4] hover:text-[#26b89e] whitespace-nowrap"
          >
            Climb up →
          </a>
        </div>
      )}

      {/* Top 3 mini-list */}
      {top === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-11 rounded-xl" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-[#A9B3C7]">
            The board is fresh — be the first to land a referral.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {top.map((row, idx) => {
            const isYou = !!myPromoter && row.promoterId === myPromoter.id;
            return (
              <li
                key={row.promoterId}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl ${
                  isYou
                    ? 'bg-[rgba(46,209,180,0.12)] border border-[#2ED1B4]/30'
                    : 'bg-[rgba(7,10,18,0.45)] border border-white/5'
                }`}
              >
                <PlacementIcon placement={(idx + 1) as 1 | 2 | 3} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-[#F4F6FA] truncate">
                    {isYou ? 'You' : row.displayName}
                  </p>
                  <p className="text-[10px] text-[#A9B3C7]">
                    {row.tierLabel} · {row.totalOrders} {row.totalOrders === 1 ? 'referral' : 'referrals'}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#2ED1B4] tabular-nums shrink-0">
                  {formatPoints(row.totalPoints)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Mobile CTA */}
      <a
        href="/leaderboard"
        className="mt-3 sm:hidden w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-[#F4F6FA] hover:bg-white/10 active:scale-[0.97] transition-all"
      >
        View full leaderboard
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

function PlacementIcon({ placement }: { placement: 1 | 2 | 3 }) {
  if (placement === 1) {
    return (
      <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
        <Crown className="w-3.5 h-3.5 text-amber-300" />
      </div>
    );
  }
  const accent =
    placement === 2
      ? 'bg-slate-400/15 border-slate-400/30 text-slate-200'
      : 'bg-orange-500/15 border-orange-500/30 text-orange-300';
  return (
    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${accent}`}>
      <Medal className="w-3.5 h-3.5" />
    </div>
  );
}
