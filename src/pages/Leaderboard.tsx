import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  Gift,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
import { useAffiliate } from '@/context/AffiliateContext';
import {
  getLeaderboard,
  formatPoints,
  POINTS_PER_REFERRAL,
  type LeaderboardRow,
} from '@/lib/leaderboard';

const TIER_STYLES: Record<string, { ring: string; chipBg: string; chipText: string }> = {
  platinum: {
    ring: 'ring-2 ring-[#E5E7EB]/40',
    chipBg: 'bg-[rgba(229,231,235,0.1)] border-[rgba(229,231,235,0.25)]',
    chipText: 'text-[#E5E7EB]',
  },
  gold: {
    ring: 'ring-2 ring-amber-400/40',
    chipBg: 'bg-amber-500/10 border-amber-500/25',
    chipText: 'text-amber-300',
  },
  silver: {
    ring: 'ring-2 ring-slate-300/30',
    chipBg: 'bg-slate-400/10 border-slate-400/25',
    chipText: 'text-slate-200',
  },
  standard: {
    ring: 'ring-1 ring-white/10',
    chipBg: 'bg-white/5 border-white/10',
    chipText: 'text-[#A9B3C7]',
  },
};

const PODIUM_ACCENTS = [
  // 1st — gold
  { wrap: 'bg-gradient-to-br from-amber-400/20 to-amber-600/10 border-amber-400/40', label: 'text-amber-300', icon: 'text-amber-300' },
  // 2nd — silver
  { wrap: 'bg-gradient-to-br from-slate-300/20 to-slate-500/10 border-slate-300/30', label: 'text-slate-200', icon: 'text-slate-200' },
  // 3rd — bronze
  { wrap: 'bg-gradient-to-br from-orange-500/20 to-orange-700/10 border-orange-500/30', label: 'text-orange-300', icon: 'text-orange-300' },
];

function tierStyles(tier: string) {
  return TIER_STYLES[tier] ?? TIER_STYLES.standard;
}

export default function Leaderboard() {
  const { myPromoter } = useAffiliate();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLeaderboard(50)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        console.error('Leaderboard load failed:', err);
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);
  const rest = useMemo(() => rows.slice(3), [rows]);

  const myRowInList = useMemo(
    () => (myPromoter ? rows.find((r) => r.promoterId === myPromoter.id) : null),
    [rows, myPromoter],
  );

  return (
    <>
      <SEO
        title="Rewards Leaderboard | PEPLAB"
        description="See top PEPLAB rewards members and referral points. Earn points on every research peptide order."
      />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Header */}
      <nav className="relative z-50 sticky top-0 bg-[rgba(7,10,18,0.95)] backdrop-blur-sm border-b border-[rgba(244,246,250,0.06)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 lg:px-6 py-3">
          <a
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
            aria-label="Back to shop"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="flex flex-col items-center">
            <span className="text-xl lg:text-2xl font-bold tracking-[0.12em] gradient-text leading-none">
              PEPLAB
            </span>
            <span className="text-[10px] lg:text-xs font-mono uppercase tracking-[0.3em] text-[#F59E0B] mt-0.5">
              LEADERBOARD
            </span>
          </div>
          <div className="w-9 h-9" />
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 lg:px-6 py-6 lg:py-10 space-y-6 lg:space-y-8">
        {/* Hero */}
        <section className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Promoter League
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F4F6FA]">
            Top PEPLAB Promoters
          </h1>
          <p className="text-sm text-[#A9B3C7] max-w-xl mx-auto">
            Ranked by reward points earned. Every paid order placed with your
            promo code adds <span className="text-[#F4F6FA] font-medium">{POINTS_PER_REFERRAL} points</span> to
            your total — climb the board and unlock bigger checkout discounts.
          </p>
        </section>

        {/* Podium */}
        <section>
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 sm:h-48 rounded-2xl" />
              ))}
            </div>
          ) : podium.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
              {/* Reorder visually as 2-1-3 on >=sm screens for the classic podium look. */}
              {[1, 0, 2].map((podiumIdx, slot) => {
                const row = podium[podiumIdx];
                if (!row) return <div key={`empty-${slot}`} />;
                return (
                  <PodiumCard
                    key={row.promoterId}
                    row={row}
                    placement={(podiumIdx + 1) as 1 | 2 | 3}
                    isYou={!!myPromoter && row.promoterId === myPromoter.id}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* My rank chip — visible to logged-in promoters */}
        {myPromoter && !loading && (
          <YouChip myInTop={myRowInList} promoterId={myPromoter.id} />
        )}

        {/* Rest of the table */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A9B3C7] mb-3">
            Rankings
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : rest.length === 0 && podium.length === 0 ? null : (
            <div className="rounded-2xl border border-white/10 bg-[rgba(17,24,39,0.5)] overflow-hidden">
              <div className="hidden sm:grid grid-cols-[60px_1fr_auto_auto] gap-3 px-4 py-2.5 text-[10px] uppercase tracking-wider text-[#A9B3C7] border-b border-white/5">
                <div>Rank</div>
                <div>Promoter</div>
                <div className="text-right">Referrals</div>
                <div className="text-right pr-1">Points</div>
              </div>
              <ul className="divide-y divide-white/5">
                {rest.map((row) => (
                  <RowItem
                    key={row.promoterId}
                    row={row}
                    isYou={!!myPromoter && row.promoterId === myPromoter.id}
                  />
                ))}
                {rest.length === 0 && (
                  <li className="px-4 py-6 text-center text-xs text-[#A9B3C7]">
                    Only the podium so far — be the next on the board.
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-[#2ED1B4]/25 bg-gradient-to-br from-[#2ED1B4]/10 to-[#8B5CF6]/10 p-5 sm:p-6 text-center space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-[#F4F6FA]">
            Want to see your name here?
          </h3>
          <p className="text-xs sm:text-sm text-[#A9B3C7] max-w-md mx-auto">
            Generate your personal promo code from the Dashboard and share it with friends.
            Every paid order earns you {POINTS_PER_REFERRAL} reward points — climb the board and unlock bigger checkout discounts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] text-sm font-semibold hover:bg-[#26b89e] active:scale-[0.97] transition-all"
            >
              <Award className="w-4 h-4" />
              Go to Dashboard
            </a>
            {myPromoter && (
              <a
                href="/promoter"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-[#F4F6FA] text-sm font-medium hover:bg-white/15 active:scale-[0.97] transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                Promoter Panel
              </a>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-4 lg:px-12 py-6 mt-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs text-[#A9B3C7]">
            Names shown as first name + initial to protect privacy. © {new Date().getFullYear()} PEPLAB.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}

function PodiumCard({
  row,
  placement,
  isYou,
}: {
  row: LeaderboardRow;
  placement: 1 | 2 | 3;
  isYou: boolean;
}) {
  const accent = PODIUM_ACCENTS[placement - 1];
  const tier = tierStyles(row.tier);
  const heightClass = placement === 1 ? 'sm:pt-8 sm:pb-7' : placement === 2 ? 'sm:pt-6 sm:pb-5' : 'sm:pt-5 sm:pb-4';
  return (
    <div
      className={`relative rounded-2xl border ${accent.wrap} ${tier.ring} px-2.5 sm:px-4 pt-4 pb-3 ${heightClass} text-center transition-transform hover:-translate-y-0.5`}
    >
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#070A12] border ${accent.wrap} flex items-center justify-center`}>
        {placement === 1 ? (
          <Crown className={`w-4 h-4 ${accent.icon}`} />
        ) : (
          <Medal className={`w-4 h-4 ${accent.icon}`} />
        )}
      </div>
      <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${accent.label} mt-1`}>
        #{placement}
      </p>
      <p className="mt-1.5 text-sm sm:text-base font-semibold text-[#F4F6FA] truncate">
        {isYou ? 'You' : row.displayName}
      </p>
      <span
        className={`inline-block mt-1 px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-medium uppercase tracking-wider ${tier.chipBg} ${tier.chipText}`}
      >
        {row.tierLabel}
      </span>
      <p className="mt-2 inline-flex items-center gap-1 text-base sm:text-xl font-bold text-[#2ED1B4] tabular-nums">
        <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden />
        {formatPoints(row.totalPoints)}
      </p>
      <p className="text-[9px] sm:text-[10px] text-[#A9B3C7] mt-0.5">
        {row.totalOrders.toLocaleString()} {row.totalOrders === 1 ? 'referral' : 'referrals'}
      </p>
    </div>
  );
}

function RowItem({
  row,
  isYou,
}: {
  row: LeaderboardRow;
  isYou: boolean;
}) {
  const tier = tierStyles(row.tier);
  return (
    <li
      className={`grid grid-cols-[60px_1fr_auto] sm:grid-cols-[60px_1fr_auto_auto] gap-3 px-4 py-3 items-center ${
        isYou ? 'bg-gradient-to-r from-[#2ED1B4]/10 to-[#8B5CF6]/10' : ''
      }`}
    >
      <div className="text-sm font-semibold text-[#A9B3C7] tabular-nums">#{row.rank}</div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-[#F4F6FA]">
            {isYou ? 'You' : row.displayName}
          </span>
          {isYou && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#2ED1B4]/15 border border-[#2ED1B4]/30 text-[9px] font-bold text-[#2ED1B4] uppercase tracking-wider">
              You
            </span>
          )}
          <span
            className={`hidden sm:inline px-1.5 py-0.5 rounded-md border text-[9px] font-medium uppercase tracking-wider ${tier.chipBg} ${tier.chipText}`}
          >
            {row.tierLabel}
          </span>
        </div>
        <p className="text-[10px] text-[#A9B3C7] sm:hidden mt-0.5">
          {row.tierLabel} · {row.totalOrders} {row.totalOrders === 1 ? 'referral' : 'referrals'}
        </p>
      </div>
      <div className="hidden sm:block text-right text-sm text-[#A9B3C7] tabular-nums">
        {row.totalOrders.toLocaleString()}
      </div>
      <div className="text-right text-sm font-bold text-[#2ED1B4] tabular-nums">
        {formatPoints(row.totalPoints)}
      </div>
    </li>
  );
}

function YouChip({
  myInTop,
  promoterId,
}: {
  myInTop: LeaderboardRow | null | undefined;
  promoterId: string;
}) {
  const [rank, setRank] = useState<number | null>(myInTop?.rank ?? null);
  const [points, setPoints] = useState<number | null>(myInTop?.totalPoints ?? null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (myInTop) {
      setRank(myInTop.rank);
      setPoints(myInTop.totalPoints);
    }
    let cancelled = false;
    import('@/lib/leaderboard').then(({ getMyRank }) => {
      getMyRank(promoterId).then((res) => {
        if (cancelled || !res) return;
        // If we're already in the top list, prefer that rank (it's authoritative).
        // Otherwise use the count-based rank.
        if (!myInTop) {
          setRank(res.rank);
          setPoints(res.row?.totalPoints ?? null);
        }
        setTotal(res.totalPromoters);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [promoterId, myInTop]);

  if (!rank) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#2ED1B4]/25 bg-[rgba(46,209,180,0.08)] px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#2ED1B4]/15 border border-[#2ED1B4]/30 flex items-center justify-center shrink-0">
          <Trophy className="w-4 h-4 text-[#2ED1B4]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-[#A9B3C7]">Your rank</p>
          <p className="text-base font-semibold text-[#F4F6FA] tabular-nums">
            #{rank}
            {total ? <span className="text-xs font-normal text-[#A9B3C7]"> of {total.toLocaleString()}</span> : null}
            {points !== null && (
              <span className="ml-2 text-xs font-medium text-[#2ED1B4]">
                · {formatPoints(points)}
              </span>
            )}
          </p>
        </div>
      </div>
      <a
        href="/promoter"
        className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
      >
        <TrendingUp className="w-3.5 h-3.5" />
        My promoter panel
      </a>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(17,24,39,0.5)] p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
        <Users className="w-6 h-6 text-[#A9B3C7]" />
      </div>
      <h3 className="text-base font-semibold text-[#F4F6FA] mb-1">No rankings yet</h3>
      <p className="text-xs text-[#A9B3C7] max-w-sm mx-auto">
        The board is fresh — be the first promoter to land a referral and claim the #1 spot.
      </p>
    </div>
  );
}
