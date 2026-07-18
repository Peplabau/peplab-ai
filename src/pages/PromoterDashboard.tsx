import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Copy, Check, ShoppingBag,
  Users, Link2, LogOut, Award, Gift, Trophy,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase, getCurrentUser, signOut } from '@/lib/supabase';
import { useAffiliate } from '@/context/AffiliateContext';
import { BONUS_POINTS } from '@/context/RewardsContext';
import PromoCodeEditor from '@/components/PromoCodeEditor';
import { SEO } from '@/components/SEO';
import { mainAppUrl } from '@/lib/domain';

/**
 * Promoter dashboard.
 *
 * Reward model: when someone places a paid order with this promoter's code,
 * the promoter earns {@link BONUS_POINTS.REFERRAL} reward points (currently
 * 100 pts) — *not* a $ commission. The commission/store-credit fields on the
 * `promoters` row are still maintained at the DB level for historical reasons,
 * but they are not surfaced here so the UX matches the actual rewards.
 */
export default function PromoterDashboard() {
  const navigate = useNavigate();
  const {
    myPromoter,
    myAffiliateOrders,
    isPromoterLoading,
  } = useAffiliate();

  const [, setUser] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) { navigate('/login'); return; }
      setUser(u);
      setIsLoading(false);
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s?.user) navigate('/login');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try { await signOut(); } catch { /* always navigate, even on failure */ }
    navigate('/login', { replace: true });
  };

  const referralLink = myPromoter
    ? mainAppUrl(`/?aff=${myPromoter.referral_code}`)
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!myPromoter) return;
    navigator.clipboard.writeText(myPromoter.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatCurrency = (n: number) => `$${Number(n || 0).toFixed(2)}`;
  const formatPoints = (n: number) => `${Math.round(Number(n || 0)).toLocaleString()}`;

  if (isLoading || isPromoterLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <nav className="relative z-50 px-4 py-3 border-b border-[rgba(244,246,250,0.06)]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-7 w-32 rounded" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </nav>
        <main className="relative z-10 px-4 py-5">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!myPromoter) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="relative z-10 text-center px-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#8B5CF6]" />
          </div>
          <h1 className="text-xl font-bold text-[#F4F6FA] mb-2">Not a Promoter Yet</h1>
          <p className="text-sm text-[#A9B3C7] mb-6">
            You don't have a promoter account. Contact us to become a PEPLAB referrer and earn {BONUS_POINTS.REFERRAL} reward points for every paid order placed with your code.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2ED1B4] to-[#8B5CF6] text-white font-semibold text-sm text-center"
            >
              Go to My Dashboard
            </a>
            <a href="/" className="text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors">
              Back to Shop
            </a>
          </div>
        </div>
      </div>
    );
  }

  const creditedOrders = myAffiliateOrders.filter(o => o.status === 'credited');
  const pendingOrders = myAffiliateOrders.filter(o => o.status === 'pending');
  const displayedOrders = showAllOrders ? myAffiliateOrders : myAffiliateOrders.slice(0, 5);

  // Promoter rewards = number of *credited* referral orders × points-per-referral.
  // Pending orders (not yet paid) don't count yet but we surface the projection
  // so promoters see what's coming once those orders settle.
  const pointsPerReferral = BONUS_POINTS.REFERRAL;
  const pointsEarned = creditedOrders.length * pointsPerReferral;
  const pointsPending = pendingOrders.length * pointsPerReferral;

  return (
    <>
      <SEO title="Promoter dashboard | PEPLAB" noIndex />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Header */}
      <nav className="lg:hidden relative z-50 sticky top-0 bg-[rgba(7,10,18,0.95)] backdrop-blur-sm border-b border-[rgba(244,246,250,0.06)]">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tracking-[0.12em] gradient-text leading-none">PEPLAB</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#22C55E] mt-0.5">PROMOTER</span>
          </div>
          <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-[rgba(244,246,250,0.06)] flex items-center justify-center text-[#A9B3C7] hover:text-[#EF4444] transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <nav className="hidden lg:block relative z-50 px-12 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex flex-col items-start">
            <span className="text-4xl font-bold tracking-[0.12em] gradient-text leading-none">PEPLAB</span>
            <span className="text-sm font-mono uppercase tracking-[0.5em] text-[#22C55E] mt-0.5">PROMOTER PANEL</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors">
              My Account
            </a>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#EF4444] transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 lg:px-12 py-5 lg:py-12">
        <div className="max-w-5xl mx-auto">

          {/* Welcome */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-[#F4F6FA] mb-1">
              Welcome, <span className="text-[#22C55E]">{myPromoter.name}</span>
            </h1>
            <p className="text-[#A9B3C7]">Share your code, send customers a discount, and earn reward points on every paid order.</p>
          </div>

          {/* Referral Code & Link */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[rgba(34,197,94,0.15)] to-[rgba(139,92,246,0.1)] border border-[rgba(34,197,94,0.3)] mb-4 lg:mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#F4F6FA]">Your Referral</h2>
                <p className="text-xs text-[#A9B3C7]">Share your code or link to earn reward points</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Code */}
              <div className="p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                <p className="text-[10px] uppercase tracking-wider text-[#A9B3C7] mb-1.5">Your Code</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#22C55E] font-mono tracking-wider">{myPromoter.referral_code}</span>
                  <button onClick={handleCopyCode} className="p-2 rounded-lg bg-[rgba(34,197,94,0.2)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.3)] transition-colors">
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <PromoCodeEditor />
              </div>
              {/* Link */}
              <div className="p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                <p className="text-[10px] uppercase tracking-wider text-[#A9B3C7] mb-1.5">Your Link</p>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={referralLink} className="flex-1 bg-transparent text-xs text-[#A9B3C7] outline-none min-w-0 truncate" />
                  <button onClick={handleCopyLink} className="p-2 rounded-lg bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)] transition-colors shrink-0">
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#A9B3C7]">
              <Gift className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>
                Customers get <strong className="text-[#F4F6FA]">{myPromoter.customer_discount_percent}% off</strong>
                {' '}— you earn <strong className="text-[#22C55E]">{pointsPerReferral} reward points</strong> per paid order.
              </span>
            </div>
          </div>

          {/* Stats Grid — points-first */}
          <div className="grid grid-cols-2 gap-3 mb-4 lg:mb-6">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[rgba(46,209,180,0.15)] to-[rgba(46,209,180,0.05)] border border-[rgba(46,209,180,0.3)]">
              <Gift className="w-5 h-5 text-[#2ED1B4] mb-1.5" />
              <p className="text-xl sm:text-2xl font-bold text-[#2ED1B4]">{formatPoints(pointsEarned)}</p>
              <p className="text-[10px] sm:text-xs text-[#2ED1B4]">Reward Points Earned</p>
              {pointsPending > 0 && (
                <p className="text-[10px] text-[#F59E0B] mt-0.5">+{formatPoints(pointsPending)} pending</p>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <ShoppingBag className="w-5 h-5 text-[#8B5CF6] mb-1.5" />
              <p className="text-xl sm:text-2xl font-bold text-[#F4F6FA]">{creditedOrders.length}</p>
              <p className="text-[10px] sm:text-xs text-[#A9B3C7]">Paid Referrals</p>
            </div>
          </div>

          {/* How it works */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] mb-4 lg:mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="text-sm sm:text-base font-semibold text-[#F4F6FA]">How your rewards work</h3>
            </div>
            <ul className="text-xs sm:text-sm text-[#A9B3C7] space-y-1.5 list-disc pl-5">
              <li>Customers save <span className="text-[#F4F6FA] font-medium">{myPromoter.customer_discount_percent}%</span> when they use your code at checkout.</li>
              <li>You earn <span className="text-[#22C55E] font-medium">{pointsPerReferral} points</span> the moment their order is marked paid.</li>
              <li>Points show up in your customer rewards balance and unlock store discounts.</li>
              <li>No commission, no payout paperwork — just keep referring.</li>
            </ul>
          </div>

          {/* Recent Referral Orders */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] mb-4 lg:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#8B5CF6]" />
                <h3 className="text-sm sm:text-base font-semibold text-[#F4F6FA]">Referral Orders</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#22C55E]">{creditedOrders.length} paid</span>
                {pendingOrders.length > 0 && (
                  <span className="text-[#F59E0B]">{pendingOrders.length} pending</span>
                )}
              </div>
            </div>
            {myAffiliateOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-10 h-10 mx-auto text-[rgba(244,246,250,0.15)] mb-2" />
                <p className="text-sm text-[#A9B3C7]">No referral orders yet. Share your code to start earning points!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {displayedOrders.map(order => (
                    <div key={order.id} className="p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.05)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-mono font-semibold text-[#F4F6FA]">{order.order_number}</span>
                          <span className="text-[10px] text-[#A9B3C7] ml-2">{formatDate(order.created_at)}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          order.status === 'credited'
                            ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
                            : 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]'
                        }`}>{order.status === 'credited' ? 'paid' : order.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A9B3C7]">Order: {formatCurrency(order.order_total)}</span>
                        <span className="text-[#2ED1B4] font-semibold">
                          {order.status === 'credited' ? '+' : '~'}{pointsPerReferral} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {myAffiliateOrders.length > 5 && (
                  <button
                    onClick={() => setShowAllOrders(!showAllOrders)}
                    className="w-full mt-3 py-2.5 text-xs text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors rounded-xl"
                  >
                    {showAllOrders ? 'Show Less' : `Show All (${myAffiliateOrders.length})`}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[rgba(46,209,180,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(46,209,180,0.2)]">
            <h3 className="text-sm font-semibold text-[#F4F6FA] mb-3">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleCopyLink}
                className="p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)] text-center hover:border-[rgba(34,197,94,0.3)] transition-colors"
              >
                <Link2 className="w-5 h-5 mx-auto mb-1 text-[#22C55E]" />
                <p className="text-xs text-[#F4F6FA]">Copy Link</p>
              </button>
              <a
                href="/dashboard"
                className="p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)] text-center hover:border-[rgba(46,209,180,0.3)] transition-colors block"
              >
                <Gift className="w-5 h-5 mx-auto mb-1 text-[#2ED1B4]" />
                <p className="text-xs text-[#F4F6FA]">My Points</p>
              </a>
              <a
                href="/leaderboard"
                className="p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)] text-center hover:border-[rgba(245,158,11,0.3)] transition-colors block"
              >
                <Trophy className="w-5 h-5 mx-auto mb-1 text-[#F59E0B]" />
                <p className="text-xs text-[#F4F6FA]">Leaderboard</p>
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-0 px-4 lg:px-12 py-6 border-t border-[rgba(244,246,250,0.08)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] text-[#A9B3C7]">© 2026 PEPLAB. Promoter Dashboard.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
