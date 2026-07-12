import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ShoppingBag, History, Star, Tag, Gift, TrendingUp, Users, Copy, Check,
  Award, X, Cake,
} from 'lucide-react';
import BirthdayRewardCard from '@/components/BirthdayRewardCard';
import { Skeleton } from '@/components/ui/skeleton';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import PromoCodeEditor from '@/components/PromoCodeEditor';
import DashboardTrustpilot from '@/components/DashboardTrustpilot';
import ReviewImageUpload, { ReviewPhoto, revokePreviewUrl } from '@/components/ReviewImageUpload';
import {
  useRewards,
  REDEMPTION_TIERS,
  BONUS_POINTS,
} from '@/context/RewardsContext';
import { supabase, signOut, getCurrentUser } from '@/lib/supabase';
import { getUserOrders, getUserReviews, createReview, uploadReviewImage, getProductUuidBySlug, getUserReviewCount, checkIsAdmin, type OrderFromDB, type UserReview } from '@/lib/supabase-db';
import { useAffiliate } from '@/context/AffiliateContext';
import { createOrUpdatePromoterForUser } from '@/lib/affiliates';
import { invalidateCache } from '@/lib/cache';
import { POINT_TYPE_LABELS, BIRTHDAY_BONUS } from '@/utils/points';
import { formatOrderNumberDisplay } from '@/utils/order-number';
import { orderUnlocksTrustpilot } from '@/utils/trustpilot-access';
import {
  getReviewableProductsForOrder,
  getReviewableProductsFromOrders,
} from '@/utils/review-eligibility';
import { SEO } from '@/components/SEO';

// Reviews are temporarily disabled for GMC compliance. Keep the implementation
// intact so moderation/submission can be re-enabled later.
const REVIEWS_ENABLED = false;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [copiedPromoCode, setCopiedPromoCode] = useState(false);
  const [isGeneratingPromoCode, setIsGeneratingPromoCode] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderFromDB[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [userReviewsLoading, setUserReviewsLoading] = useState(false);

  const {
    balance,
    lifetimePoints,
    transactions,
    getAvailableRedemptions,
    getPointsValue,
    refreshPoints,
  } = useRewards();

  const { myPromoter, refreshPromoterData } = useAffiliate();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (!nextUser) navigate('/login');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const admin = await checkIsAdmin(currentUser.id);
    setIsAdminUser(admin);
    if (admin) localStorage.setItem('peplab_is_admin', 'true');
    else localStorage.removeItem('peplab_is_admin');
    setIsLoading(false);
  };

  // Note: Signup bonus (50 pts) is awarded automatically by a DB trigger on auth.users INSERT.
  // No client-side bonus award needed here.

  useEffect(() => {
    if (!REVIEWS_ENABLED) return;
    if (reviewModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [reviewModalOpen]);

  useEffect(() => {
    if (!user?.id) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    let cancelled = false;
    setOrdersLoading(true);
    getUserOrders(user.id)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!REVIEWS_ENABLED) {
      setReviewCount(0);
      return;
    }
    if (!user?.id) {
      setReviewCount(0);
      return;
    }
    let cancelled = false;
    getUserReviewCount(user.id).then((count) => {
      if (!cancelled) setReviewCount(count);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!REVIEWS_ENABLED) {
      setUserReviews([]);
      setUserReviewsLoading(false);
      return;
    }
    if (!user?.id) {
      setUserReviews([]);
      return;
    }
    let cancelled = false;
    setUserReviewsLoading(true);
    getUserReviews(user.id)
      .then((data) => { if (!cancelled) setUserReviews(data); })
      .catch(() => { if (!cancelled) setUserReviews([]); })
      .finally(() => { if (!cancelled) setUserReviewsLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, reviewSuccess]);

  const handleLogout = async () => {
    // 1. Wipe local UI state immediately so the click feels instant.
    setUser(null);
    localStorage.removeItem('peplab_logged_in');
    localStorage.removeItem('peplab_is_admin');
    // 2. Await the local sign-out so /login won't see a stale session and
    //    bounce the user back here. Our signOut helper does only a local
    //    clear synchronously and fires the slow server-side revoke in the
    //    background, so this resolves in milliseconds.
    try { await signOut(); } catch { /* always navigate, even on failure */ }
    navigate('/login', { replace: true });
  };

  const promoCode = myPromoter?.referral_code ?? '';

  const handleCopyPromoCode = () => {
    if (!promoCode) return;
    navigator.clipboard.writeText(promoCode);
    setCopiedPromoCode(true);
    setTimeout(() => setCopiedPromoCode(false), 2000);
  };

  const handleGeneratePromoCode = async () => {
    if (!user?.id || !user.email) {
      setPromoCodeError('Unable to generate a promo code without a logged-in account.');
      return;
    }
    setPromoCodeError(null);
    setIsGeneratingPromoCode(true);
    try {
      const name = user.user_metadata?.name || user.email.split('@')[0] || 'PEPLAB Member';
      const result = await createOrUpdatePromoterForUser(user.id, user.email, name);
      if (!result.ok) {
        setPromoCodeError(result.error || 'Could not generate promo code.');
        return;
      }
      await refreshPromoterData();
    } finally {
      setIsGeneratingPromoCode(false);
    }
  };

  const handleRedeem = (tier: (typeof REDEMPTION_TIERS)[0]) => {
    if (balance < tier.points) {
      alert('Insufficient points balance');
      return;
    }
    try {
      sessionStorage.setItem('peplab_pending_redemption', JSON.stringify({
        points: tier.points,
        value: tier.value,
        label: tier.label,
      }));
    } catch (error) {
      console.error('Failed to save pending redemption:', error);
    }
    navigate('/checkout');
  };

  // Products user can review (from paid/shipped orders)
  const reviewableProducts = REVIEWS_ENABLED ? getReviewableProductsFromOrders(orders) : [];

  const reviewedProductSlugs = new Set(
    userReviews
      .map((review) => review.products?.slug?.trim())
      .filter((slug): slug is string => Boolean(slug)),
  );

  const isProductReviewed = (productSlug: string) => reviewedProductSlugs.has(productSlug);

  const pendingReviewProducts = reviewableProducts.filter((p) => !isProductReviewed(p.product_id));

  const openReviewModal = (productSlug?: string) => {
    const fallbackSlug = productSlug && pendingReviewProducts.some((p) => p.product_id === productSlug)
      ? productSlug
      : pendingReviewProducts[0]?.product_id ?? '';

    setReviewModalOpen(true);
    setReviewError(null);
    setReviewSuccess(false);
    setReviewProductId(fallbackSlug);
    setReviewRating(0);
    setReviewTitle('');
    setReviewComment('');
    revokePreviewUrl(reviewImagePreview);
    setReviewImageFile(null);
    setReviewImagePreview(null);
  };

  const closeReviewModal = () => {
    revokePreviewUrl(reviewImagePreview);
    setReviewImageFile(null);
    setReviewImagePreview(null);
    setReviewModalOpen(false);
    setReviewError(null);
    setReviewSubmitting(false);
  };

  const handleReviewImageSelect = (file: File | null) => {
    revokePreviewUrl(reviewImagePreview);
    if (!file) {
      setReviewImageFile(null);
      setReviewImagePreview(null);
      return;
    }
    setReviewImageFile(file);
    setReviewImagePreview(URL.createObjectURL(file));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !reviewProductId.trim() || reviewRating < 1 || !reviewComment.trim()) {
      setReviewError('Please select a product, give a rating (1–5 stars), and write a comment.');
      return;
    }
    if (isProductReviewed(reviewProductId.trim())) {
      setReviewError('You have already reviewed this product.');
      return;
    }
    setReviewError(null);
    setReviewSubmitting(true);
    try {
      const productUuid = await getProductUuidBySlug(reviewProductId.trim());
      if (!productUuid) {
        setReviewError('Product not found. Please try again or choose another product.');
        return;
      }

      const isVerified = reviewableProducts.some((p) => p.product_id === reviewProductId);

      let imageUrl: string | null = null;
      if (reviewImageFile) {
        const uploaded = await uploadReviewImage(reviewImageFile);
        if ('error' in uploaded) {
          setReviewError(uploaded.error);
          return;
        }
        imageUrl = uploaded.url;
      }

      const result = await createReview({
        user_id: user.id,
        product_id: productUuid,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        is_verified_purchase: isVerified,
        image_url: imageUrl,
      });

      if ('id' in result) {
        invalidateCache(`user_reviews:${user.id}`);
        invalidateCache(`review_count:${user.id}`);
        invalidateCache('reviews:homepage');
        setReviewCount((c) => c + 1);
        setReviewSuccess(true);
        setTimeout(() => closeReviewModal(), 1500);
      } else {
        setReviewError(result.error || 'Could not submit review. Please try again.');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <TrendingUp className="w-4 h-4 text-[#22C55E]" />;
      case 'signup': return <User className="w-4 h-4 text-[#2ED1B4]" />;
      case 'first_order': return <Award className="w-4 h-4 text-[#F59E0B]" />;
      case 'birthday': return <Cake className="w-4 h-4 text-[#F59E0B]" />;
      case 'admin_adjustment': return <Tag className="w-4 h-4 text-[#8B5CF6]" />;
      case 'redeemed': return <Gift className="w-4 h-4 text-[#8B5CF6]" />;
      case 'revoked': return <History className="w-4 h-4 text-[#EF4444]" />;
      default: return <Tag className="w-4 h-4 text-[#A9B3C7]" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'signup':
      case 'first_order':
      case 'birthday':
      case 'admin_adjustment': return 'text-[#22C55E]';
      case 'redeemed':
      case 'revoked': return 'text-[#EF4444]';
      default: return 'text-[#A9B3C7]';
    }
  };

  const getTransactionLabel = (type: string, description: string) => {
    return POINT_TYPE_LABELS[type as keyof typeof POINT_TYPE_LABELS] || description;
  };

  // Only count orders that are paid/shipped for dashboard stats
  const paidOrders = orders.filter((o) => orderUnlocksTrustpilot(o));
  const trustpilotUnlocked = paidOrders.length > 0;
  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const paidOrderCount = paidOrders.length;

  // Points history comes directly from the database (new user_points event table).
  // No client-side computation needed — balance = SUM from DB via RewardsContext.
  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60" />
        {/* Nav skeleton — mobile */}
        <nav className="lg:hidden relative z-50 px-4 py-3 border-b border-[rgba(244,246,250,0.06)]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </nav>
        {/* Nav skeleton — desktop */}
        <nav className="hidden lg:block relative z-50 px-12 py-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-36 rounded-lg" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        </nav>
        <main className="relative z-10 px-4 lg:px-12 py-5 lg:py-16">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
            {/* Profile card — mobile */}
            <div className="lg:hidden p-4 rounded-2xl bg-[rgba(17,24,39,0.7)] border border-[rgba(244,246,250,0.08)] flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            {/* Header — desktop */}
            <div className="hidden lg:block space-y-2">
              <Skeleton className="h-9 w-72 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-2 sm:space-y-3">
                  <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                  <Skeleton className="h-5 sm:h-7 w-10 sm:w-14 rounded" />
                  <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-20 rounded" />
                </div>
              ))}
            </div>
            {/* Rewards + referral row */}
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 sm:h-5 w-28 sm:w-36 rounded" />
                      <Skeleton className="h-3 w-24 sm:w-48 rounded hidden sm:block" />
                    </div>
                  </div>
                  <Skeleton className="h-7 sm:h-10 w-16 sm:w-20 rounded" />
                </div>
                <Skeleton className="h-12 sm:h-14 w-full rounded-xl" />
              </div>
              <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              </div>
            </div>
            {/* History section */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3 sm:space-y-4">
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-36 rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[rgba(7,10,18,0.5)]">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 rounded" />
                      <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-5 sm:h-6 w-10 sm:w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Member';
  const joinDate = new Date(user.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  const availableRedemptions = getAvailableRedemptions();
  const upcomingRedemptions = REDEMPTION_TIERS.filter((tier) => tier.points > balance);

  return (
    <>
      <SEO title="My account | PEPLAB" noIndex />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Mobile header */}
      <nav className="lg:hidden relative z-50 sticky top-0 bg-[rgba(7,10,18,0.95)] backdrop-blur-sm border-b border-[rgba(244,246,250,0.06)]">
        <div className="flex items-start justify-between gap-2 px-4 py-3">
          <a
            href="/"
            className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-[rgba(46,209,180,0.12)] border border-[rgba(46,209,180,0.28)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.18)] transition-colors text-center leading-tight"
          >
            Shop now
          </a>
          <a href="/" className="flex flex-col items-center min-w-0 flex-1 pt-0.5">
            <span className="text-xl font-bold tracking-[0.12em] gradient-text leading-none">PEPLAB</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8B5CF6] mt-0.5">DASHBOARD</span>
          </a>
          <div className="shrink-0 flex flex-col items-end gap-1 min-w-[4.5rem]">
            {myPromoter && (
              <a
                href="/promoter"
                className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.25)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] transition-colors w-full text-center"
              >
                Promoter
              </a>
            )}
            {isAdminUser && (
              <a
                href="/admin/dashboard"
                className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.25)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-colors w-full text-center"
              >
                Admin
              </a>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-[rgba(244,246,250,0.06)] border border-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#EF4444] hover:border-[rgba(239,68,68,0.25)] transition-colors w-full text-center"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop header */}
      <nav className="hidden lg:block relative z-50 px-12 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex flex-col items-start">
            <span className="text-4xl font-bold tracking-[0.12em] gradient-text leading-none">PEPLAB</span>
            <span className="text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">PEPTIDES AUSTRALIA</span>
          </a>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <a
              href="/"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-[rgba(46,209,180,0.12)] border border-[rgba(46,209,180,0.28)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.18)] transition-colors"
            >
              Shop now
            </a>
            {myPromoter && (
              <a href="/promoter" className="text-sm font-semibold px-4 py-2 rounded-full bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.25)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] transition-colors">
                Promoter panel
              </a>
            )}
            {isAdminUser && (
              <a href="/admin/dashboard" className="text-sm font-semibold px-4 py-2 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.25)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-colors">
                Admin panel
              </a>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold px-4 py-2 rounded-full bg-[rgba(244,246,250,0.06)] border border-[rgba(244,246,250,0.1)] text-[#A9B3C7] hover:text-[#EF4444] hover:border-[rgba(239,68,68,0.25)] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 lg:px-12 py-5 lg:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Profile hero — mobile */}
          <div className="lg:hidden mb-4 p-4 rounded-2xl bg-[rgba(17,24,39,0.7)] border border-[rgba(244,246,250,0.08)] flex items-center gap-3">
            <div className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg select-none" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #2ED1B4 100%)' }}>
              {userName ? userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : <User className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#F4F6FA] truncate">{userName}</p>
              <p className="text-xs text-[#A9B3C7]">Member since {joinDate}</p>
            </div>
            <a
              href="/settings"
              className="ml-auto shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-[rgba(244,246,250,0.06)] border border-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.1)] transition-colors"
            >
              Settings
            </a>
          </div>
          {/* Desktop welcome */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-4xl font-bold text-[#F4F6FA] mb-2">
              Welcome back, <span className="gradient-text">{userName}</span>
            </h1>
            <p className="text-[#A9B3C7]">Member since {joinDate}</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-5 lg:mb-8">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#2ED1B4] mb-1.5 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-[#F4F6FA]">{paidOrderCount}</p>
              <p className="text-[10px] sm:text-xs text-[#A9B3C7]">Orders</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B5CF6] mb-1.5 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-[#F4F6FA]">${totalSpent.toFixed(0)}</p>
              <p className="text-[10px] sm:text-xs text-[#A9B3C7]">Spent</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
              <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-[#22C55E] mb-1.5 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-[#22C55E]">$0</p>
              <p className="text-[10px] sm:text-xs text-[#22C55E]">Saved</p>
            </div>
            {REVIEWS_ENABLED && (
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#F59E0B] mb-1.5 sm:mb-2" />
                <p className="text-lg sm:text-2xl font-bold text-[#F4F6FA]">{reviewCount}</p>
                <p className="text-[10px] sm:text-xs text-[#A9B3C7]">Reviews</p>
              </div>
            )}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.2)] to-[rgba(46,209,180,0.2)] border border-[rgba(139,92,246,0.3)]">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B5CF6] mb-1.5 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-[#F4F6FA]">{balance.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-[#A9B3C7]">Points</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E] flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-[8px] sm:text-[10px] text-[#070A12] font-bold">✓</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-[#F4F6FA]">Active</p>
              <p className="text-[10px] sm:text-xs text-[#A9B3C7]">Status</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 mb-5 lg:mb-8">
            <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(46,209,180,0.15)] border border-[rgba(139,92,246,0.3)]">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#2ED1B4] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-semibold text-[#F4F6FA]">PEPLAB Rewards</h2>
                    <p className="text-xs sm:text-sm text-[#A9B3C7] hidden sm:block">Earn points with every purchase</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl sm:text-3xl font-bold text-[#F4F6FA]">{balance.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-sm text-[#A9B3C7]">Points</p>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-[rgba(7,10,18,0.5)] mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-[#A9B3C7]">Points value:</span>
                  <span className="text-lg sm:text-2xl font-bold text-[#22C55E]">${getPointsValue(balance).toFixed(2)} AUD</span>
                </div>
              </div>
              {(availableRedemptions.length > 0 || upcomingRedemptions.length > 0) && (
                <div className="p-3 sm:p-4 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                  {availableRedemptions.length > 0 && (
                    <>
                      <p className="text-xs sm:text-sm text-[#22C55E] mb-2 sm:mb-3">You can redeem:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableRedemptions.map((tier) => (
                          <button key={tier.points} onClick={() => handleRedeem(tier)} className="px-3 sm:px-4 py-2 rounded-lg bg-[#22C55E] text-[#070A12] text-xs sm:text-sm font-medium hover:bg-[#16A34A] active:scale-[0.97] transition-all">
                            {tier.label} ({tier.points} pts)
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {upcomingRedemptions.length > 0 && (
                    <div className={availableRedemptions.length > 0 ? 'mt-4 pt-4 border-t border-[rgba(34,197,94,0.15)]' : ''}>
                      <p className="text-xs sm:text-sm text-[#A9B3C7] mb-2 sm:mb-3">Almost there:</p>
                      <div className="flex flex-wrap gap-2">
                        {upcomingRedemptions.map((tier) => {
                          const ptsNeeded = tier.points - balance;
                          return (
                            <div
                              key={tier.points}
                              className="px-3 sm:px-4 py-2 rounded-lg bg-[rgba(7,10,18,0.45)] border border-[rgba(244,246,250,0.1)] text-xs sm:text-sm"
                            >
                              <span className="text-[#F4F6FA] font-medium">{tier.label}</span>
                              <span className="text-[#A9B3C7]"> · {tier.points.toLocaleString()} pts</span>
                              <span className="block text-[10px] sm:text-xs text-[#F59E0B] mt-0.5">
                                {ptsNeeded.toLocaleString()} pts to go
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[rgba(244,246,250,0.08)]">
                <p className="text-xs sm:text-sm font-medium text-[#F4F6FA] mb-2 sm:mb-3">How to Earn Points:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A9B3C7]">
                    <TrendingUp className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>1 point per $1 spent</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A9B3C7]">
                    <User className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                    <span>{BONUS_POINTS.ACCOUNT_CREATION} pts for signup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A9B3C7]">
                    <ShoppingBag className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span>{BONUS_POINTS.FIRST_PURCHASE} pts first order</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A9B3C7]">
                    <Cake className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span>{BIRTHDAY_BONUS} pts on your birthday</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-[#2ED1B4]" />
                <h3 className="text-base sm:text-lg font-semibold text-[#F4F6FA]">Your Promo Code</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#A9B3C7] mb-3 sm:mb-4">
                Share this code with friends. They get 10% off, and you earn 100 points when it is used.
              </p>
              {promoCode ? (
                <div className="mb-3 sm:mb-4 space-y-0">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                    <div className="flex items-center gap-2">
                      <input type="text" value={promoCode} readOnly className="flex-1 bg-transparent text-xs sm:text-sm text-[#A9B3C7] outline-none min-w-0 truncate" />
                      <button onClick={handleCopyPromoCode} className="p-2 rounded-lg bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.3)] active:scale-95 transition-all shrink-0">
                        {copiedPromoCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <PromoCodeEditor />
                </div>
              ) : (
                <div className="space-y-2 mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-[#A9B3C7]">You do not have a promo code yet. Generate one now to start earning points on referred purchases.</p>
                  <button onClick={handleGeneratePromoCode} disabled={isGeneratingPromoCode} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] text-sm font-medium hover:bg-[#26b89e] active:scale-95 transition-all disabled:opacity-50">
                    {isGeneratingPromoCode ? 'Generating...' : 'Generate Promo Code'}
                  </button>
                  {promoCodeError && <p className="text-xs text-rose-300">{promoCodeError}</p>}
                </div>
              )}
            </div>
          </div>

          {user?.id && (
            <div className="mb-5 lg:mb-8">
              <BirthdayRewardCard userId={user.id} onPointsClaimed={() => void refreshPoints()} />
            </div>
          )}

          {/* Promoter leaderboard preview — drives competitive engagement around
              the affiliate program. Full board lives at /leaderboard. */}
          <div className="mb-5 lg:mb-8">
            <LeaderboardWidget />
          </div>

          {transactions.length > 0 && (
            <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] mb-5 lg:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <History className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6]" />
                  <h2 className="text-base sm:text-xl font-semibold text-[#F4F6FA]">Points History</h2>
                </div>
                <div className="text-xs sm:text-sm text-[#A9B3C7]">Lifetime: <span className="text-[#F4F6FA] font-medium">{lifetimePoints.toLocaleString()}</span></div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {displayedTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.05)]">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[rgba(17,24,39,0.8)] flex items-center justify-center shrink-0">{getTransactionIcon(t.type)}</div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#F4F6FA] truncate">{getTransactionLabel(t.type, t.description)}</p>
                        <p className="text-[10px] sm:text-xs text-[#A9B3C7] truncate">{t.description !== getTransactionLabel(t.type, t.description) ? t.description + ' · ' : ''}{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <span className={`text-sm sm:text-lg font-bold shrink-0 ${getTransactionColor(t.type)}`}>{t.points > 0 ? '+' : ''}{t.points}</span>
                  </div>
                ))}
              </div>
              {transactions.length > 5 && (
                <button onClick={() => setShowAllTransactions(!showAllTransactions)} className="w-full mt-3 sm:mt-4 py-3 text-xs sm:text-sm text-[#A9B3C7] hover:text-[#F4F6FA] active:scale-[0.98] transition-all rounded-xl">
                  {showAllTransactions ? 'Show Less' : `Show All (${transactions.length})`}
                </button>
              )}
            </div>
          )}

          <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6]" />
              <h2 className="text-base sm:text-xl font-semibold text-[#F4F6FA]">Purchase History</h2>
            </div>
            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-20 rounded-md" />
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(244,246,250,0.08)]">
                      <Skeleton className="h-3 w-8 rounded" />
                      <Skeleton className="h-5 w-14 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-[rgba(244,246,250,0.2)] mb-3" />
                <p className="text-sm text-[#A9B3C7]">No orders yet</p>
                <a href="/" className="text-[#2ED1B4] hover:underline text-sm mt-2 inline-block">Start Shopping</a>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  const itemLabels = items.map((item: any) =>
                    typeof item === 'string' ? item : [item.name, item.quantity].filter(Boolean).join(' × ')
                  );
                  const orderReviewables = REVIEWS_ENABLED ? getReviewableProductsForOrder(order) : [];
                  const canReviewOrder = orderReviewables.length > 0;
                  const pendingReviewCount = orderReviewables.filter((p) => !isProductReviewed(p.product_id)).length;

                  return (
                    <div key={order.id} className="p-3 sm:p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-[#F4F6FA] font-mono truncate">{formatOrderNumberDisplay(order.order_number) || order.id}</p>
                          <p className="text-[10px] sm:text-xs text-[#A9B3C7]">{new Date(order.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 ml-2 ${order.status === 'Delivered' || order.status === 'delivered' ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' : 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]'}`}>{order.status || 'Processing'}</span>
                      </div>
                      <div className="mb-2 sm:mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {itemLabels.length > 0 ? itemLabels.map((label, idx) => (
                            <span key={idx} className="px-2 py-0.5 sm:py-1 rounded-md bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] text-[10px] sm:text-xs">{label}</span>
                          )) : (
                            <span className="text-[10px] sm:text-xs text-[#A9B3C7]">—</span>
                          )}
                        </div>
                      </div>

                      {REVIEWS_ENABLED && canReviewOrder ? (
                        <div className="mb-2 sm:mb-3 space-y-2">
                          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#A9B3C7]">
                            Review your purchase
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {orderReviewables.map((product) => {
                              const reviewed = isProductReviewed(product.product_id);
                              return reviewed ? (
                                <span
                                  key={product.product_id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[10px] sm:text-xs text-[#22C55E]"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  {product.name} reviewed
                                </span>
                              ) : (
                                <button
                                  key={product.product_id}
                                  type="button"
                                  onClick={() => openReviewModal(product.product_id)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(46,209,180,0.12)] border border-[rgba(46,209,180,0.28)] text-[10px] sm:text-xs font-semibold text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.18)] active:scale-[0.98] transition-all"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  Review {product.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : REVIEWS_ENABLED && !orderUnlocksTrustpilot(order) ? (
                        <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs text-[#6B7280]">
                          You can leave a review once payment is confirmed.
                        </p>
                      ) : null}

                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-[rgba(244,246,250,0.08)]">
                        <span className="text-xs text-[#A9B3C7]">
                          {pendingReviewCount > 0
                            ? `${pendingReviewCount} product${pendingReviewCount === 1 ? '' : 's'} awaiting review`
                            : 'Total'}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-[#2ED1B4]">${Number(order.total ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {REVIEWS_ENABLED && (
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
              <h3 className="text-base sm:text-xl font-semibold text-[#F4F6FA]">Your Reviews</h3>
            </div>

            {userReviewsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)] space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-28 sm:w-36 rounded" />
                        <Skeleton className="h-3 w-20 sm:w-28 rounded" />
                      </div>
                      <div className="text-right space-y-1.5">
                        <Skeleton className="h-4 w-8 rounded ml-auto" />
                        <Skeleton className="h-3 w-14 rounded ml-auto" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : userReviews.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-[rgba(244,246,250,0.15)] mb-2" />
                <p className="text-sm text-[#A9B3C7]">No reviews yet. Write your first one below.</p>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-4">
                {userReviews.slice(0, 5).map((r: UserReview) => (
                  <div key={r.id} className="p-3 sm:p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                    <div className="flex items-center justify-between gap-3 mb-1.5 sm:mb-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#F4F6FA] truncate">{r.title || 'Review'}</p>
                        <p className="text-[10px] sm:text-xs text-[#A9B3C7] truncate">
                          {r.products?.name || 'Unknown product'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[#F59E0B] font-medium">{r.rating}★</p>
                        <p className="text-[10px] text-[#A9B3C7]">{new Date(r.created_at).toLocaleDateString('en-AU')}</p>
                      </div>
                    </div>
                    {r.image_url && <ReviewPhoto url={r.image_url} className="mb-2" />}
                    <p className="text-xs sm:text-sm text-[#A9B3C7] whitespace-pre-wrap line-clamp-3">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {!ordersLoading && (
            <DashboardTrustpilot unlocked={trustpilotUnlocked} />
          )}

          {REVIEWS_ENABLED && (
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[rgba(46,209,180,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(46,209,180,0.2)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#F4F6FA] mb-1">Share Your Experience</h3>
                <p className="text-xs sm:text-sm text-[#A9B3C7]">Leave a verified review for products in your purchase history above.</p>
              </div>
              <button
                type="button"
                onClick={() => openReviewModal()}
                disabled={pendingReviewProducts.length === 0}
                className="w-full sm:w-auto btn-primary whitespace-nowrap flex items-center justify-center gap-2 py-3 sm:py-2.5 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Star className="w-4 h-4" /> Write a Review
              </button>
            </div>
          </div>
          )}

          {REVIEWS_ENABLED && reviewModalOpen && (
            <div
              className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
              onClick={closeReviewModal}
            >
              <div
                className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-[rgba(244,246,250,0.12)] border-b-0 sm:border-b shadow-xl flex flex-col max-h-[85vh] sm:max-h-[min(90vh,32rem)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 rounded-full bg-[rgba(244,246,250,0.15)] mx-auto mt-2 sm:hidden" />
                <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 sm:px-5 sm:py-4 border-b border-[rgba(244,246,250,0.08)]">
                  <h3 className="text-base sm:text-lg font-semibold text-[#F4F6FA]">Write a Review</h3>
                  <button type="button" onClick={closeReviewModal} className="p-1.5 sm:p-2 rounded-lg text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.08)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmitReview} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 space-y-3">
                    {reviewSuccess ? (
                      <div className="py-6 text-center">
                        <Check className="w-10 h-10 mx-auto text-[#22C55E] mb-2" />
                        <p className="text-sm text-[#F4F6FA] font-medium">Thank you! Your review has been submitted.</p>
                      </div>
                    ) : reviewableProducts.length === 0 ? (
                      <div className="py-6 text-center">
                        <ShoppingBag className="w-10 h-10 mx-auto text-[rgba(244,246,250,0.2)] mb-2" />
                        <p className="text-xs sm:text-sm text-[#A9B3C7]">Complete a purchase to leave a verified review.</p>
                      </div>
                    ) : pendingReviewProducts.length === 0 ? (
                      <div className="py-6 text-center">
                        <Check className="w-10 h-10 mx-auto text-[#22C55E] mb-2" />
                        <p className="text-xs sm:text-sm text-[#A9B3C7]">You&apos;ve reviewed all products from your purchases.</p>
                      </div>
                    ) : (
                      <>
                        {reviewError && (
                          <div className="p-2.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                            <p className="text-xs text-[#EF4444]">{reviewError}</p>
                          </div>
                        )}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-[#A9B3C7] mb-1.5">Product</label>
                            <select
                              value={reviewProductId}
                              onChange={(e) => setReviewProductId(e.target.value)}
                              className="w-full px-3 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none"
                            >
                              {pendingReviewProducts.map((p) => (
                                <option key={p.product_id} value={p.product_id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-[#A9B3C7] mb-1.5">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1 rounded-lg focus:outline-none focus:ring-2 ring-[#2ED1B4] active:scale-90 transition-transform"
                                >
                                  <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[rgba(244,246,250,0.15)]'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-[#A9B3C7] mb-1.5">Title (optional)</label>
                            <input
                              type="text"
                              value={reviewTitle}
                              onChange={(e) => setReviewTitle(e.target.value)}
                              placeholder="e.g. Great quality"
                              className="w-full px-3 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-[#A9B3C7] mb-1.5">Your review *</label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              required
                              rows={3}
                              placeholder="Share your experience..."
                              className="w-full px-3 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors resize-none"
                            />
                          </div>
                          <ReviewImageUpload
                            previewUrl={reviewImagePreview}
                            onFileSelect={handleReviewImageSelect}
                            disabled={reviewSubmitting}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex gap-2 p-4 sm:p-5 pt-3 border-t border-[rgba(244,246,250,0.08)] bg-[#111827] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
                    <button type="button" onClick={closeReviewModal} className="flex-1 py-3 rounded-xl border border-[rgba(244,246,250,0.2)] text-sm text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.06)] active:scale-[0.97] transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={reviewSubmitting} className="flex-1 py-3 rounded-xl bg-[#2ED1B4] text-[#070A12] text-sm font-semibold hover:bg-[#26b89e] disabled:opacity-50 active:scale-[0.97] transition-all">
                      {reviewSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-0 px-4 lg:px-12 py-6 lg:py-8 border-t border-[rgba(244,246,250,0.08)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs text-[#A9B3C7]">© 2026 PEPLAB. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </>
  );
}