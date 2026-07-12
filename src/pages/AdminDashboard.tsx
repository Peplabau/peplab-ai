import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Package, ShoppingCart, Truck, Shield, LogOut,
  Search, Plus, CheckCircle, XCircle, Eye, DollarSign,
  Settings, Mail,
  CreditCard, Box, Send, Ban, Save, Tag, Gift, X, Pencil, Trash2,
  ChevronUp, ChevronDown, Star, MessageSquare, Upload, Image as ImageIcon,
  Printer, ArrowUp, ArrowDown, MinusCircle, PlusCircle, Link2, Copy, Check,
  TrendingUp, BarChart2, FlaskConical, Cake
} from 'lucide-react';
import { supabase, getCurrentUser, signOut } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { cached, invalidateCache, setCache, TTL_ADMIN_OVERVIEW, TTL_ADMIN_ORDERS, TTL_ADMIN_PRODUCTS, TTL_ADMIN_USERS, TTL_ADMIN_REVIEWS } from '@/lib/cache';
import { CONFIG } from '@/lib/config';
import { fetchAllSiteSettings, updateSiteSetting, DEFAULT_BANK_DETAILS, DEFAULT_DISCOUNT_SETTINGS, DEFAULT_FREE_GIFT_SETTINGS, DEFAULT_SUPPORT_LINKS, DEFAULT_LANDING_PAGE_SETTINGS, DEFAULT_AFFILIATE_PROGRAM_SETTINGS, DEFAULT_RESEARCH_DISCLAIMER_SETTINGS } from '@/lib/settings';
import { getEarnedTransactionsCount, getOrderPointsAwarded, getOrderEarnedPointsSum, addUserPoints, normalizeImageUrl, getUserTransactions, getUserPointsBalance, logAdminAction, fetchAdminProductWaitlistCounts, syncProductDetailFieldsToSupabase, uploadReviewImage, resetUserBirthday, type PointsEvent } from '@/lib/supabase-db';
import ReviewImageUpload, { ReviewPhoto, revokePreviewUrl } from '@/components/ReviewImageUpload';
import ResearchMarquee from '@/components/ResearchMarquee';
import { DEFAULT_MORE_INFO_TEXT } from '@/lib/defaultMoreInfo';
import { BONUS_POINTS } from '@/context/RewardsContext';
import { getBundlePricing, getEffectiveListDiscountPercent, getStackedBundleUnitPrice } from '@/utils/pricing';
import { calculatePurchasePoints, POINT_TYPE_LABELS } from '@/utils/points';
import {
  getAllPromoters, createPromoter, updatePromoter, deletePromoter,
  getAllAffiliateOrders, getAffiliateOrderByOrderId, adjustStoreCredit, creditAffiliateCommission,
  COMMISSION_TIERS, type Promoter, type AffiliateOrder, type AffiliateOrderWithPromoter,
} from '@/lib/affiliates';
import {
  getAllPromoCodes,
  createPromoCode,
  createOneTimePromoCode,
  updatePromoCode,
  deletePromoCode,
  promoCodeUsesLabel,
  promoCodeTypeLabel,
  type PromoCode,
} from '@/lib/promo-codes';
import { formatOrderNumberDisplay } from '@/utils/order-number';
import { sendPaymentReceived, sendOrderShipped, sendReplacementTrackingEmail, sendOrderDeliveredReviewEmail } from '@/lib/email';
import { copyTextToClipboard } from '@/lib/clipboard';
import { SEO } from '@/components/SEO';

// Types
interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  items: any[];
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  points_redeemed?: number | null;
  total: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  shipping_suburb: string;
  shipping_state: string;
  shipping_postcode: string;
  shipping_method: string;
  tracking_number: string;
  additional_tracking_numbers?: string[] | null;
  notes: string;
  created_at: string;
  paid_at: string;
  payment_email_sent?: boolean;
  shipped_email_sent?: boolean;
  confirmation_email_sent?: boolean;
  /** Trustpilot review request sent (on deliver or bulk catch-up). */
  review_request_email_sent?: boolean;
  /** True when the order includes preorder line(s); also identifiable by PRE- order_number. */
  is_preorder?: boolean;
  order_source?: 'direct' | 'referral' | string | null;
  affiliate_code?: string | null;
  affiliate_discount?: number | null;
  referral_promoter_id?: string | null;
  referral_promoter_name?: string | null;
  referral_promoter_email?: string | null;
  referral_campaign_type?: string | null;
  referral_recorded_at?: string | null;
}

/** PostgREST returns at most 1000 rows per request unless paginated. */
const SUPABASE_PAGE_SIZE = 1000;

/** Sum order totals as numbers — avoids JS string concat bugs (e.g. 275041 + "32" → "27504132"). */
function sumOrdersRevenue(orderList: Array<{ total?: number | string | null }>): number {
  return orderList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
}

async function fetchSupabasePages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message?: string } | null }>,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw error;
    const page = data ?? [];
    all.push(...page);
    if (page.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }
  return all;
}

async function fetchAllOrdersFromDb(): Promise<Order[]> {
  return fetchSupabasePages((from, to) =>
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to),
  );
}

async function fetchOrdersCount(): Promise<number> {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  image_url: string;
  review_count?: number;
  more_info?: string | null;
  coa_url?: string | null;
  is_active: boolean;
  product_dosages?: any[];
  display_order?: number | null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users' | 'reviews' | 'affiliates' | 'promo-codes' | 'settings'>('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }

        setAdminEmail(user.email || '');

        if (user.user_metadata?.role === 'admin') {
          setIsAdmin(true);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profile?.is_admin) {
          setIsAdmin(true);
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('[Admin] Auth check failed:', error);
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('peplab_logged_in');
    localStorage.removeItem('peplab_is_admin');
    try { await signOut(); } catch { /* always navigate, even on failure */ }
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#070A12' }}>
        {/* Mobile loading skeleton */}
        <div className="lg:hidden">
          <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[rgba(17,24,39,0.95)] border-b border-[rgba(244,246,250,0.08)]">
            <Skeleton className="h-7 w-28 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-6 w-14 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full shrink-0" />
              </div>
            ))}
          </div>
          {/* Bottom nav skeleton */}
          <div className="fixed bottom-0 left-0 right-0 bg-[rgba(17,24,39,0.95)] border-t border-[rgba(244,246,250,0.08)] px-2 py-2 flex justify-around">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-2.5 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop loading skeleton */}
        <div className="hidden lg:flex min-h-screen">
          <div className="w-64 shrink-0 border-r border-[rgba(244,246,250,0.08)] p-6 space-y-4">
            <Skeleton className="h-8 w-36 rounded-lg mb-8" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-8 space-y-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              ))}
            </div>
            <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-4">
              <Skeleton className="h-6 w-32 rounded" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-[rgba(244,246,250,0.06)]">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-20 rounded ml-auto" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    // Affiliates tab is hidden — promoters earn 100 reward points per order
    // instead of a commission $, so the commission/store-credit admin UI is
    // not relevant for now. The full <AffiliatesSection /> + helpers below
    // are kept in place so the panel can be turned back on by re-adding this
    // entry and the route below if a commission program is reintroduced.
    // { id: 'affiliates', label: 'Affiliates', icon: Link2 },
    { id: 'promo-codes', label: 'Promo Codes', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <SEO title="Admin | PEPLAB" noIndex />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" aria-hidden />

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[rgba(17,24,39,0.95)] border-r border-[rgba(244,246,250,0.08)] z-50 hidden lg:block">
        <div className="p-6 border-b border-[rgba(244,246,250,0.08)]">
          <a href="/" className="flex flex-col items-start">
            <span className="text-2xl font-bold tracking-[0.12em] gradient-text leading-none">PEPLAB</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#8B5CF6] mt-0.5">ADMIN</span>
          </a>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-[rgba(46,209,180,0.15)] text-[#2ED1B4]'
                  : 'text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.05)] hover:text-[#F4F6FA]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(244,246,250,0.08)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[rgba(46,209,180,0.2)] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-[#2ED1B4]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#F4F6FA] truncate">{adminEmail.split('@')[0]}</p>
              <p className="text-xs text-[#2ED1B4]">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[rgba(17,24,39,0.97)] border-b border-[rgba(244,246,250,0.08)] backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[rgba(46,209,180,0.15)] flex items-center justify-center shrink-0">
              {(() => { const n = navItems.find(n => n.id === activeTab); return n ? <n.icon className="w-4 h-4 text-[#2ED1B4]" /> : null; })()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#F4F6FA] truncate">
                {navItems.find(n => n.id === activeTab)?.label}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#2ED1B4]">PEPLAB ADMIN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] text-xs font-medium active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(17,24,39,0.97)] border-t border-[rgba(244,246,250,0.08)] backdrop-blur-sm safe-area-bottom">
        <div className="flex justify-around px-1 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl min-w-[52px] transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[rgba(46,209,180,0.12)] text-[#2ED1B4]'
                    : 'text-[#6B7280] hover:text-[#A9B3C7]'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-[#2ED1B4]' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#2ED1B4]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 lg:ml-64 pt-[60px] lg:pt-0 pb-[72px] lg:pb-0 min-h-screen">
        <div className="p-4 lg:p-8">
          <div className="flex items-center justify-between mb-5 lg:mb-6">
            <h1 className="text-xl lg:text-3xl font-bold text-[#F4F6FA]">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <div className="hidden sm:block text-sm text-[#A9B3C7]">
              {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="sm:hidden text-xs text-[#A9B3C7]">
              {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
            </div>
          </div>

          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'orders' && <OrdersSection />}
          {activeTab === 'products' && <ProductsSection />}
          {activeTab === 'users' && <UsersSection />}
          {activeTab === 'reviews' && <ReviewsAdminSection />}
          {/* Affiliates tab disabled — see navItems comment above. */}
          {/* {activeTab === 'affiliates' && <AffiliatesSection />} */}
          {activeTab === 'promo-codes' && <PromoCodesSection />}
          {activeTab === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
    </>
  );
}

// ─── Best-sellers aggregation ──────────────────────────────────────────────
interface BestSellerItem {
  key: string;        // "name||dosage" composite
  name: string;
  dosage: string;
  unitsSold: number;
  revenue: number;
}

type BsTimeFilter = '7d' | '30d' | '90d' | 'all';
type BsSortBy = 'units' | 'revenue';

function aggregateBestSellers(
  ordersWithItems: Array<{ items: any[]; created_at: string; status: string }>,
  timeFilter: BsTimeFilter,
): BestSellerItem[] {
  const now = Date.now();
  const cutoffs: Record<BsTimeFilter, number> = {
    '7d': now - 7 * 86400_000,
    '30d': now - 30 * 86400_000,
    '90d': now - 90 * 86400_000,
    all: 0,
  };
  const cutoff = cutoffs[timeFilter];

  const map = new Map<string, BestSellerItem>();

  for (const order of ordersWithItems) {
    // Exclude cancelled orders from the tally.
    if ((order.status || '').toLowerCase() === 'cancelled') continue;
    if (cutoff > 0 && new Date(order.created_at).getTime() < cutoff) continue;

    const items: any[] = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      // Skip free gifts / $0 items from the revenue tally but still count units.
      const name = String(item.name ?? '').trim();
      const dosage = String(item.dosage ?? '').trim();
      if (!name) continue;
      const key = `${name}||${dosage}`;
      const qty = Number(item.quantity) || 1;
      const price = item.is_free ? 0 : Number(item.price) || 0;

      const existing = map.get(key);
      if (existing) {
        existing.unitsSold += qty;
        existing.revenue += price * qty;
      } else {
        map.set(key, { key, name, dosage, unitsSold: qty, revenue: price * qty });
      }
    }
  }

  return Array.from(map.values());
}

// Overview Section
function OverviewSection() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayment: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<Array<{ items: any[]; created_at: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [bsTime, setBsTime] = useState<BsTimeFilter>('30d');
  const [bsSort, setBsSort] = useState<BsSortBy>('units');

  useEffect(() => {
    loadStats();
    const onOrdersUpdated = () => {
      void loadStats(true);
    };
    window.addEventListener('peplab:orders-updated', onOrdersUpdated);
    return () => window.removeEventListener('peplab:orders-updated', onOrdersUpdated);
  }, []);

  const loadStats = async (bust = false) => {
    if (bust) invalidateCache('admin:overview');
    setLoading(true);
    try {
      const result = await cached('admin:overview', async () => {
        const [
          orderStatusTotals,
          { data: recent },
          orderCount,
          { count: userCount },
          { count: productCount },
          itemOrders,
        ] = await Promise.all([
          fetchSupabasePages((from, to) =>
            supabase.from('orders').select('status, total').order('id', { ascending: true }).range(from, to),
          ),
          supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
          fetchOrdersCount(),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          fetchSupabasePages((from, to) =>
            supabase
              .from('orders')
              .select('items, created_at, status')
              .neq('status', 'cancelled')
              .order('created_at', { ascending: false })
              .range(from, to),
          ),
        ]);
        return {
          orderStatusTotals,
          recent: recent || [],
          orderCount,
          userCount: userCount || 0,
          productCount: productCount || 0,
          itemOrders,
        };
      }, TTL_ADMIN_OVERVIEW);

      setStats({
        totalOrders: result.orderCount,
        pendingPayment: result.orderStatusTotals.filter((o) => o.status === 'pending_payment').length,
        totalRevenue: sumOrdersRevenue(result.orderStatusTotals),
        totalUsers: result.userCount,
        totalProducts: result.productCount,
      });
      setRecentOrders(result.recent);
      setAllOrderItems(result.itemOrders as Array<{ items: any[]; created_at: string; status: string }>);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hooks must always be called unconditionally — these must come before any early return.
  const bestSellers = useMemo<BestSellerItem[]>(() => {
    const all = aggregateBestSellers(allOrderItems, bsTime);
    return all.sort((a, b) =>
      bsSort === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold,
    ).slice(0, 10);
  }, [allOrderItems, bsTime, bsSort]);

  const bsMax = useMemo(
    () => (bestSellers.length ? (bsSort === 'revenue' ? bestSellers[0].revenue : bestSellers[0].unitsSold) : 1),
    [bestSellers, bsSort],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          ))}
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(46,209,180,0.2)] space-y-3">
          <Skeleton className="h-6 w-56 rounded" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
          <Skeleton className="h-6 w-40 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
          <Skeleton className="h-6 w-36 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-36 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-5 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders.toString()} icon={ShoppingCart} color="#8B5CF6" />
        <StatCard label="Awaiting Payment" value={stats.pendingPayment.toString()} icon={CreditCard} color="#F59E0B" />
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon={DollarSign} color="#22C55E" />
        <StatCard label="Users" value={stats.totalUsers.toString()} icon={Users} color="#3B82F6" />
        <StatCard label="Products" value={stats.totalProducts.toString()} icon={Package} color="#2ED1B4" />
      </div>

      {/* Best Sellers */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
        {/* Header row */}
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-base sm:text-lg font-semibold text-[#F4F6FA] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2ED1B4]" />
            Best Sellers
          </h3>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time period */}
            <div className="flex rounded-xl overflow-hidden border border-[rgba(244,246,250,0.08)]">
              {(['7d', '30d', '90d', 'all'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBsTime(t)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    bsTime === t
                      ? 'bg-[rgba(46,209,180,0.2)] text-[#2ED1B4]'
                      : 'text-[#6B7280] hover:text-[#A9B3C7]'
                  }`}
                >
                  {t === 'all' ? 'All time' : t === '7d' ? '7 days' : t === '30d' ? '30 days' : '90 days'}
                </button>
              ))}
            </div>

            {/* Sort toggle */}
            <div className="flex rounded-xl overflow-hidden border border-[rgba(244,246,250,0.08)]">
              <button
                type="button"
                onClick={() => setBsSort('units')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                  bsSort === 'units'
                    ? 'bg-[rgba(139,92,246,0.2)] text-[#8B5CF6]'
                    : 'text-[#6B7280] hover:text-[#A9B3C7]'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Units
              </button>
              <button
                type="button"
                onClick={() => setBsSort('revenue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                  bsSort === 'revenue'
                    ? 'bg-[rgba(34,197,94,0.2)] text-[#22C55E]'
                    : 'text-[#6B7280] hover:text-[#A9B3C7]'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Revenue
              </button>
            </div>
          </div>
        </div>

        {bestSellers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-[#5A667E]">
            <FlaskConical className="w-8 h-8 opacity-40" />
            <p className="text-sm">No sales data for this period yet.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {bestSellers.map((item, idx) => {
              const barPct = bsMax > 0 ? (bsSort === 'revenue' ? item.revenue : item.unitsSold) / bsMax : 0;
              const rankColors = ['#2ED1B4', '#8B5CF6', '#3B82F6', '#F59E0B', '#22C55E'];
              const rankColor = rankColors[idx] ?? '#6B7280';

              return (
                <li key={item.key} className="flex items-center gap-3 group">
                  {/* Rank badge */}
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${rankColor}18`, color: rankColor, border: `1px solid ${rankColor}30` }}
                  >
                    {idx + 1}
                  </span>

                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-[#F4F6FA] truncate block leading-tight">
                          {item.name}
                        </span>
                        {item.dosage && (
                          <span className="text-[11px] text-[#6B7280] font-mono">{item.dosage}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-xs text-[#A9B3C7] whitespace-nowrap">
                          {item.unitsSold} {item.unitsSold === 1 ? 'unit' : 'units'}
                        </span>
                        <span className="text-sm font-bold whitespace-nowrap" style={{ color: rankColor }}>
                          ${item.revenue.toFixed(0)}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-[rgba(244,246,250,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(barPct * 100).toFixed(1)}%`, background: rankColor, opacity: 0.75 }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <p className="mt-5 text-[11px] text-[#5A667E]">
          Excludes cancelled orders and free-gift items from revenue.
          Counts all confirmed, processing, shipped, and delivered orders.
        </p>
      </div>

      {/* Bank Details Quick Reference */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(46,209,180,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(46,209,180,0.2)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#2ED1B4]" />
          Bank Account Details (For Customer Payments)
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">PAYID</p>
            <p className="text-sm font-mono text-[#F4F6FA]">{CONFIG.BANK_DETAILS.PAYID}</p>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">BSB</p>
            <p className="text-sm font-mono text-[#F4F6FA]">{CONFIG.BANK_DETAILS.BSB}</p>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">Account</p>
            <p className="text-sm font-mono text-[#F4F6FA]">{CONFIG.BANK_DETAILS.ACCOUNT_NUMBER}</p>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
            <p className="text-[10px] text-[#A9B3C7] uppercase">Account Name</p>
            <p className="text-sm text-[#F4F6FA]">{CONFIG.BANK_DETAILS.ACCOUNT_NAME}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
        <h3 className="text-base sm:text-lg font-semibold text-[#F4F6FA] mb-3">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-[#A9B3C7] text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(7,10,18,0.5)]">
                {/* Left: order # + email */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#F4F6FA] font-mono leading-tight">
                      #{formatOrderNumberDisplay(order.order_number)}
                    </p>
                    {orderIsPreorderRow(order) && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-[#7F1D1D] text-[#FECACA] border border-[#EF4444]/45">
                        Preorder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A9B3C7] truncate mt-0.5">
                    {order.customer_email}
                  </p>
                </div>
                {/* Right: status badge + total */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold leading-tight whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-[#2ED1B4]">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function isLikelyNetworkFailure(err: unknown): boolean {
  const m =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : typeof err === 'string'
        ? err
        : '';
  return /failed to fetch|networkerror|internet disconnected|load failed|network request failed|err_internet_disconnected|fetcherror/i.test(
    m
  );
}

function orderIsPreorderRow(o: Pick<Order, 'is_preorder' | 'order_number'>): boolean {
  if (o.is_preorder === true) return true;
  return /^PRE-/i.test(String(o.order_number ?? ''));
}

function orderIsReferralRow(o: Pick<Order, 'order_source' | 'affiliate_code'>): boolean {
  if ((o.order_source || '').toLowerCase() === 'referral') return true;
  return !!(o.affiliate_code && o.affiliate_code.trim());
}

type OrderTrackingInfo = {
  isReferral: boolean;
  sourceLabel: string;
  promoCode: string | null;
  promoDiscount: number;
  pointsDiscount: number;
  referrerName: string | null;
  referrerEmail: string | null;
  referrerId: string | null;
  campaignType: string | null;
  recordedAt: string | null;
};

function getOrderTrackingInfo(order: Order): OrderTrackingInfo {
  const isReferral = orderIsReferralRow(order);
  const promoDiscount = Number(order.affiliate_discount) || 0;
  const totalDiscount = Number(order.discount_amount) || 0;
  const pointsDiscount = Math.max(0, totalDiscount - promoDiscount);

  return {
    isReferral,
    sourceLabel: isReferral ? 'Referral / Promo' : 'Direct',
    promoCode: order.affiliate_code?.trim() || null,
    promoDiscount,
    pointsDiscount,
    referrerName: order.referral_promoter_name?.trim() || null,
    referrerEmail: order.referral_promoter_email?.trim() || null,
    referrerId: order.referral_promoter_id || null,
    campaignType: order.referral_campaign_type?.trim() || (isReferral ? 'promo_code' : null),
    recordedAt: order.referral_recorded_at || null,
  };
}

function mergeAffiliateOrderIntoOrder(order: Order, affiliate: AffiliateOrderWithPromoter): Order {
  const promoter = affiliate.promoters;
  return {
    ...order,
    order_source: 'referral',
    affiliate_code: order.affiliate_code?.trim() || promoter?.referral_code || null,
    affiliate_discount: Number(order.affiliate_discount) || Number(affiliate.customer_discount) || 0,
    referral_promoter_id: order.referral_promoter_id || affiliate.promoter_id,
    referral_promoter_name: order.referral_promoter_name || promoter?.name || null,
    referral_promoter_email: order.referral_promoter_email || promoter?.email || null,
    referral_campaign_type: order.referral_campaign_type || 'promo_code',
    referral_recorded_at: order.referral_recorded_at || affiliate.created_at || null,
  };
}

/** Return address shown on admin shipping labels (print + order detail preview). */
const ADMIN_SHIPPING_LABEL_FROM = {
  line1: 'PEPLAB Australia',
  line2: 'Sydney, NSW 2000',
} as const;

function escapeAdminLabelHtml(s: string | null | undefined): string {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatOrderShippingAddressOneLine(
  order: Pick<Order, 'shipping_address' | 'shipping_suburb' | 'shipping_state' | 'shipping_postcode'>,
): string {
  const street = order.shipping_address.trim();
  const suburbLine = [order.shipping_suburb, order.shipping_state, order.shipping_postcode]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
  if (!street) return suburbLine;
  if (!suburbLine) return street;
  return `${street}, ${suburbLine}`;
}

/**
 * Opens a printable shipping label in a new window.
 * - `print: true` — after load, the popup runs `print()` (system dialog). The
 *   popup also has a **Print Label** button if the browser blocks auto-print.
 * - `edit: true` — label is `contentEditable` for quick fixes before printing.
 */
function openAdminShippingLabelWindow(
  order: Order,
  options?: { print?: boolean; edit?: boolean },
): void {
  const labelWindow = window.open('', '_blank', 'width=420,height=640');
  if (!labelWindow) {
    alert('Please allow pop‑ups to print labels');
    return;
  }
  const o = order;
  const ordDisplay = escapeAdminLabelHtml(formatOrderNumberDisplay(o.order_number));
  const toName = escapeAdminLabelHtml(`${o.customer_first_name} ${o.customer_last_name}`.trim());
  const fullAddress = escapeAdminLabelHtml(formatOrderShippingAddressOneLine(o));
  const phoneLine = o.customer_phone ? `Ph: ${escapeAdminLabelHtml(o.customer_phone)}` : '';
  const method = escapeAdminLabelHtml((o.shipping_method || 'standard').toLowerCase());
  const trackingHtml = o.tracking_number
    ? escapeAdminLabelHtml(o.tracking_number)
    : '—';

  const autoPrintScript =
    options?.print === true
      ? `<script>(function(){var done=false;function go(){if(done)return;done=true;setTimeout(function(){try{window.focus();window.print();}catch(e){}},200);}if(document.readyState==="complete")go();else window.addEventListener("load",go);})();<\/script>`
      : '';

  labelWindow.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Shipping Label - ${ordDisplay}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; padding: 20px; max-width: 420px; margin: 0 auto; color: #111; }
  .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
  .toolbar button { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
  .btn-print { background: #2ED1B4; color: #0a0f1a; }
  .btn-edit { background: #8B5CF6; color: #fff; }
  .label { border: 2px solid #000; padding: 16px 18px; }
  .section-title { margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #555; }
  .lines { font-size: 14px; line-height: 1.45; }
  .lines p { margin: 0 0 3px; }
  hr.sep { border: none; border-top: 1px solid #000; margin: 14px 0; }
  .meta { font-size: 13px; line-height: 1.55; color: #333; }
  .meta strong { color: #111; }
  .tracking { font-family: ui-monospace, monospace; font-size: 13px; }
  @media print { body { padding: 0; } .no-print { display: none !important; } }
</style></head><body>
<div class="no-print toolbar">
  <button type="button" class="btn-print" onclick="window.focus();window.print();">Print Label</button>
  <button type="button" class="btn-edit" onclick="(function(){var el=document.querySelector('.label');if(el){el.contentEditable='true';el.focus();}})()">Edit Label</button>
</div>
<div class="label">
  <div class="from-block">
    <p class="section-title">From</p>
    <div class="lines">
      <p>${ADMIN_SHIPPING_LABEL_FROM.line1}</p>
      <p>${ADMIN_SHIPPING_LABEL_FROM.line2}</p>
    </div>
  </div>
  <hr class="sep" />
  <div class="to-block">
    <p class="section-title">To</p>
    <div class="lines">
      <p><strong>${toName}</strong></p>
      <p>${fullAddress}</p>
      ${phoneLine ? `<p>${phoneLine}</p>` : ''}
    </div>
  </div>
  <hr class="sep" />
  <div class="meta">
    <p style="margin:0 0 4px;"><strong>Order:</strong> #${ordDisplay}</p>
    <p style="margin:0 0 4px;"><strong>Method:</strong> ${method}</p>
    <p style="margin:0;"><strong>Tracking:</strong> <span class="tracking">${trackingHtml}</span></p>
  </div>
</div>${autoPrintScript}</body></html>`,
  );
  labelWindow.document.close();

  const labelEl = labelWindow.document.querySelector('.label') as HTMLElement | null;
  if (options?.edit && labelEl) {
    labelEl.contentEditable = 'true';
    labelEl.focus();
  }
}

/** User-facing copy for admin alerts (avoids raw "TypeError: Failed to fetch"). */
function adminRequestErrorMessage(err: unknown): string {
  if (isLikelyNetworkFailure(err)) {
    return 'No internet connection or the browser blocked the request. Check Wi‑Fi/VPN, then try again.';
  }
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.error_description === 'string' && o.error_description.trim()) return o.error_description;
    if (o.error != null) return String(o.error);
  }
  return 'Unknown error';
}

function parseAdditionalTrackingNumbers(raw: unknown): string[] {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function AdminCopyBox({
  label,
  value,
  copyValue,
  copiedKey,
  activeCopiedKey,
  onCopy,
}: {
  label: string;
  value: string;
  copyValue?: string;
  copiedKey: string;
  activeCopiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  if (!value.trim()) return null;
  const textToCopy = copyValue ?? value;
  const copied = activeCopiedKey === copiedKey;

  return (
    <button
      type="button"
      onClick={() => onCopy(copiedKey, textToCopy)}
      className="w-full text-left p-2.5 rounded-lg border border-[rgba(244,246,250,0.12)] bg-[rgba(0,0,0,0.2)] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.08)] transition-colors group cursor-pointer"
      title="Click to copy"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A9B3C7] mb-1 block">{label}</span>
      <span className="flex items-center justify-between gap-2">
        <span className="font-medium text-[#F4F6FA] break-all">{value}</span>
        {copied ? (
          <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
        ) : (
          <Copy className="w-4 h-4 text-[#A9B3C7] opacity-60 group-hover:opacity-100 shrink-0" />
        )}
      </span>
    </button>
  );
}

// Orders Section - Full Order Management
function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [copiedShippingField, setCopiedShippingField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkSendingReviewEmails, setIsBulkSendingReviewEmails] = useState(false);
  const [preorderFilter, setPreorderFilter] = useState<'all' | 'preorder_only'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'direct' | 'referral'>('all');
  const loadOrdersRequestIdRef = useRef(0);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (showOrderModal) {
      setTrackingNumber('');
      setCopiedShippingField(null);
    }
  }, [showOrderModal, selectedOrder?.id]);

  useEffect(() => {
    if (!showOrderModal || !selectedOrder?.id) return;
    let cancelled = false;

    void (async () => {
      if (orderIsReferralRow(selectedOrder) && selectedOrder.affiliate_code?.trim()) return;

      const affiliate = await getAffiliateOrderByOrderId(selectedOrder.id);
      if (cancelled || !affiliate) return;

      const merged = mergeAffiliateOrderIntoOrder(selectedOrder, affiliate);
      setSelectedOrder(merged);
      setOrders((prev) => prev.map((o) => (o.id === merged.id ? merged : o)));
    })();

    return () => {
      cancelled = true;
    };
  }, [showOrderModal, selectedOrder?.id]);

  const loadOrders = async (bust = false) => {
    const requestId = ++loadOrdersRequestIdRef.current;
    if (bust) invalidateCache('admin:orders');
    setLoading(true);
    try {
      // After mutations (delete, mark paid, etc.) always hit the DB — never reuse
      // a stale in-flight cache read that can overwrite the list and bump revenue.
      const data = bust
        ? await (async () => {
            const fresh = await fetchAllOrdersFromDb();
            setCache('admin:orders', fresh, TTL_ADMIN_ORDERS);
            return fresh;
          })()
        : await cached('admin:orders', fetchAllOrdersFromDb, TTL_ADMIN_ORDERS);

      if (requestId === loadOrdersRequestIdRef.current) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      if (requestId === loadOrdersRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, orderHint?: Order | null) => {
    setIsUpdating(true);
    try {
      const orderBeforeUpdate =
        orderHint ??
        selectedOrder ??
        orders.find((o) => o.id === orderId) ??
        null;

      const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString();
      if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();
      if (newStatus === 'cancelled') updates.cancelled_at = new Date().toISOString();

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;

      if (
        newStatus === 'delivered' &&
        orderBeforeUpdate?.customer_email &&
        !orderBeforeUpdate.review_request_email_sent
      ) {
        const sent = await sendOrderDeliveredReviewEmail(orderBeforeUpdate.customer_email, {
          order_number: orderBeforeUpdate.order_number,
          customer_first_name: orderBeforeUpdate.customer_first_name,
        });
        if (sent) {
          await supabase
            .from('orders')
            .update({ review_request_email_sent: true })
            .eq('id', orderId);
        }
      }
      
      await loadOrders(true);
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status: ' + adminRequestErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const finalisePreorder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'finalised');
  };

  const canFinalisePreorder = (order: Order) =>
    orderIsPreorderRow(order) &&
    order.status !== 'finalised' &&
    order.status !== 'cancelled';

  const deliveredReviewBacklogCount = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter((o) => {
      if (o.status !== 'delivered' || !o.customer_email?.trim() || o.review_request_email_sent) return false;
      const key = o.customer_email.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).length;
  }, [orders]);

  const sendBulkDeliveredReviewEmails = async () => {
    const eligible = orders.filter(
      (o) => o.status === 'delivered' && o.customer_email?.trim() && !o.review_request_email_sent,
    );
    if (!eligible.length) {
      alert('No delivered orders are waiting for a review request email.');
      return;
    }

    const byEmail = new Map<string, Order>();
    for (const order of eligible) {
      const key = order.customer_email.trim().toLowerCase();
      const existing = byEmail.get(key);
      const orderAt = new Date(order.delivered_at || order.updated_at || order.created_at).getTime();
      const existingAt = existing
        ? new Date(existing.delivered_at || existing.updated_at || existing.created_at).getTime()
        : 0;
      if (!existing || orderAt >= existingAt) byEmail.set(key, order);
    }

    const targets = [...byEmail.values()];
    const confirmed = window.confirm(
      `Send Trustpilot review request to ${targets.length} customer(s)?\n\nOnly orders already marked Delivered. Shipped orders will get this email when you mark them delivered.`,
    );
    if (!confirmed) return;

    setIsBulkSendingReviewEmails(true);
    let sent = 0;
    let failed = 0;

    for (const order of targets) {
      try {
        const ok = await sendOrderDeliveredReviewEmail(order.customer_email, {
          order_number: order.order_number,
          customer_first_name: order.customer_first_name,
        });
        if (ok) {
          await supabase
            .from('orders')
            .update({ review_request_email_sent: true })
            .eq('status', 'delivered')
            .eq('customer_email', order.customer_email.trim());
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error('Bulk review email failed for order', order.order_number, err);
        failed++;
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    await loadOrders(true);
    setIsBulkSendingReviewEmails(false);
    alert(`Review request emails: ${sent} sent${failed ? `, ${failed} failed` : ''}.`);
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string, order?: Order | null) => {
    try {
      setIsUpdating(true);

      // 1) Update the order FIRST (fast path). UI should stop "Processing..." right after this succeeds.
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          status: paymentStatus === 'confirmed' ? 'processing' : 'pending_payment',
          paid_at: paymentStatus === 'confirmed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // 2) Refresh UI
      await loadOrders(true);
      setSelectedOrder((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        return {
          ...prev,
          payment_status: paymentStatus,
          status: paymentStatus === 'confirmed' ? 'processing' : 'pending_payment',
        };
      });

      if (paymentStatus === 'confirmed' && order?.customer_email && !order.payment_email_sent) {
        void sendPaymentReceived(order.customer_email, {
          order_number: order.order_number,
          total: Number(order.total) || 0,
        });
      }

      // 3) Award points in background so slow/failing points RPC never blocks UI.
      void (async () => {
        try {
          if (paymentStatus === 'confirmed' && order?.user_id != null && order.subtotal != null) {
            const alreadyAwarded = await getOrderPointsAwarded(orderId);
            if (!alreadyAwarded) {
              const earnedCountBefore = await getEarnedTransactionsCount(order.user_id);
              const promoDiscountApplied = Number(order.affiliate_discount) > 0;
              const subtotalPts = calculatePurchasePoints(Number(order.subtotal), {
                promoDiscountApplied,
              });
              if (subtotalPts > 0) {
                await addUserPoints(order.user_id, subtotalPts, 'purchase', `Order ${formatOrderNumberDisplay(order.order_number)}`, orderId);
              }
              if (earnedCountBefore === 0) {
                await addUserPoints(order.user_id, BONUS_POINTS.FIRST_PURCHASE, 'first_order', 'First order bonus', null);
              }
            }
          }
          // Credit affiliate commission when order is marked as paid
          if (paymentStatus === 'confirmed') {
            creditAffiliateCommission(orderId).catch(e =>
              console.error('[updatePaymentStatus] affiliate credit failed', e)
            );
          }
        } catch (pointsErr) {
          console.error('[updatePaymentStatus] points award failed', pointsErr);
        } finally {
          window.dispatchEvent(new Event('peplab:points-updated'));
        }
      })();
    } catch (err: unknown) {
      console.error('Error updating payment:', err);
      alert('Failed to update payment status: ' + adminRequestErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const addTracking = async (
    orderId: string,
    subtotal: number,
    userId: string | null,
    orderNumber: string,
    customerEmail: string,
    shippedEmailSent?: boolean,
    affiliateDiscount?: number | null,
  ) => {
    if (!trackingNumber.trim()) return;
    const trimmedTracking = trackingNumber.trim();
    setIsUpdating(true);
    try {
      // Update order with tracking number
      const { error } = await supabase.from('orders').update({
        tracking_number: trimmedTracking,
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', orderId);

      if (error) throw error;

      if (customerEmail && !shippedEmailSent) {
        void sendOrderShipped(customerEmail, {
          order_number: orderNumber,
          tracking_number: trimmedTracking,
        });
      }

      // Refresh orders in the background so tracking UI never gets stuck
      // if the fetch is slow or temporarily fails.
      void loadOrders(true);
      setTrackingNumber('');
      setSelectedOrder((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        return { ...prev, tracking_number: trimmedTracking, status: 'shipped' };
      });

      // Award points in background so it can't block the UI.
      void (async () => {
        try {
          // Award points only if not already awarded (e.g. already given when admin marked paid)
          const alreadyAwarded = await getOrderPointsAwarded(orderId);
          if (!alreadyAwarded && userId && subtotal > 0) {
            const points = calculatePurchasePoints(subtotal, {
              promoDiscountApplied: Number(affiliateDiscount) > 0,
            });
            const earnedCountBefore = await getEarnedTransactionsCount(userId);
            await addUserPoints(userId, points, 'purchase', `Order ${formatOrderNumberDisplay(orderNumber)}`, orderId);
            if (earnedCountBefore === 0) {
              await addUserPoints(userId, BONUS_POINTS.FIRST_PURCHASE, 'first_order', 'First order bonus', null);
            }
          }
        } catch (pointsErr) {
          console.error('[addTracking] points award failed', pointsErr);
        } finally {
          window.dispatchEvent(new Event('peplab:points-updated'));
        }
      })();

      alert('Tracking added!');
    } catch (error) {
      console.error('Error adding tracking:', error);
      alert('Failed to add tracking number: ' + adminRequestErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const copyShippingField = async (key: string, text: string) => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedShippingField(key);
      window.setTimeout(() => setCopiedShippingField((prev) => (prev === key ? null : prev)), 2000);
    }
  };

  const addAdditionalTracking = async (
    orderId: string,
    orderNumber: string,
    customerEmail: string,
    existingPrimary: string | null | undefined,
    existingAdditional: string[],
  ) => {
    const trimmedTracking = trackingNumber.trim();
    if (!trimmedTracking) return;

    const allExisting = [
      ...(existingPrimary?.trim() ? [existingPrimary.trim()] : []),
      ...existingAdditional,
    ].map((n) => n.toUpperCase());

    if (allExisting.includes(trimmedTracking.toUpperCase())) {
      alert('That tracking number is already on this order.');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedAdditional = [...existingAdditional, trimmedTracking];
      const { error } = await supabase.from('orders').update({
        additional_tracking_numbers: updatedAdditional,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      if (error) throw error;

      let emailSent = false;
      if (customerEmail) {
        emailSent = await sendReplacementTrackingEmail(customerEmail, {
          order_number: orderNumber,
          tracking_number: trimmedTracking,
        });
      }

      void loadOrders(true);
      setTrackingNumber('');
      setSelectedOrder((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        return { ...prev, additional_tracking_numbers: updatedAdditional };
      });

      alert(
        emailSent
          ? 'Replacement tracking added and email sent to customer!'
          : customerEmail
            ? 'Tracking added, but the email could not be sent. Check email settings.'
            : 'Replacement tracking added (no customer email on file).',
      );
    } catch (error) {
      console.error('Error adding replacement tracking:', error);
      alert('Failed to add replacement tracking: ' + adminRequestErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setIsDeleting(true);
    const deletedOrder = orders.find((o) => o.id === orderId);
    try {
      // Remove any points awarded for this order
      if (deletedOrder?.user_id) {
        const sum = await getOrderEarnedPointsSum(orderId);
        if (sum > 0) {
          await addUserPoints(deletedOrder.user_id, -sum, 'revoked', 'Order deleted - points removed', orderId);
        }
      }
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;

      setDeleteOrderId(null);
      setShowOrderModal(false);
      setSelectedOrder(null);

      // Drop the deleted order immediately so revenue cannot flash upward.
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      invalidateCache('admin:overview');
      window.dispatchEvent(new Event('peplab:orders-updated'));

      const requestId = ++loadOrdersRequestIdRef.current;
      invalidateCache('admin:orders');
      const fresh = await fetchAllOrdersFromDb();
      setCache('admin:orders', fresh, TTL_ADMIN_ORDERS);
      if (requestId === loadOrdersRequestIdRef.current) {
        setOrders(fresh);
      }
    } catch (err: any) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order: ' + (err?.message || 'Unknown error'));
      await loadOrders(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const preorderOrderCount = useMemo(() => orders.filter(orderIsPreorderRow).length, [orders]);
  const referralOrders = useMemo(() => orders.filter(orderIsReferralRow), [orders]);
  const directOrders = useMemo(() => orders.filter((o) => !orderIsReferralRow(o)), [orders]);
  const referralRevenue = useMemo(
    () => referralOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    [referralOrders],
  );
  const referralAov = referralOrders.length > 0 ? referralRevenue / referralOrders.length : 0;
  const selectedOrderTracking = useMemo(
    () => (selectedOrder ? getOrderTrackingInfo(selectedOrder) : null),
    [selectedOrder],
  );
  const selectedOrderAdditionalTracking = useMemo(
    () => (selectedOrder ? parseAdditionalTrackingNumbers(selectedOrder.additional_tracking_numbers) : []),
    [selectedOrder],
  );

  const topPromoCodes = useMemo(() => {
    const counts = new Map<string, number>();
    referralOrders.forEach((o) => {
      const code = (o.affiliate_code || '').trim().toUpperCase();
      if (!code) return;
      counts.set(code, (counts.get(code) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [referralOrders]);

  const filteredOrders = orders.filter(order => {
    const orderStatus = (order.status || '').toLowerCase().replace(/\s/g, '_');
    const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter;
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (order.order_number &&
        (order.order_number.toLowerCase().includes(q) ||
          formatOrderNumberDisplay(order.order_number).toLowerCase().includes(q))) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(q)) ||
      (order.customer_first_name && order.customer_first_name.toLowerCase().includes(q)) ||
      (order.customer_last_name && order.customer_last_name.toLowerCase().includes(q)) ||
      (order.affiliate_code && order.affiliate_code.toLowerCase().includes(q)) ||
      (order.referral_promoter_name && order.referral_promoter_name.toLowerCase().includes(q));
    const matchesPreorder =
      preorderFilter === 'all' ||
      (preorderFilter === 'preorder_only' && orderIsPreorderRow(order));
    const isReferral = orderIsReferralRow(order);
    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'referral' && isReferral) ||
      (sourceFilter === 'direct' && !isReferral);
    return matchesStatus && matchesSearch && matchesPreorder && matchesSource;
  });

  const statusLabels: Record<string, string> = {
    all: 'All',
    pending_payment: 'Awaiting payment',
    processing: 'Processing',
    finalised: 'Finalised',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        ))}
      </div>
      <div className="p-5 rounded-2xl bg-[rgba(17,24,39,0.5)] border border-[rgba(244,246,250,0.08)] space-y-3">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(244,246,250,0.08)]">
          <Skeleton className="h-5 w-28 rounded" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[rgba(244,246,250,0.06)]">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-6 w-24 rounded-full ml-auto" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats - status cards clickable to filter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <button type="button" onClick={() => setStatusFilter('all')} className="text-left">
          <StatCard label="All Orders" value={orders.length.toString()} icon={ShoppingCart} color="#8B5CF6" />
        </button>
        <button type="button" onClick={() => setStatusFilter('pending_payment')} className="text-left">
          <StatCard label="Awaiting Payment" value={orders.filter(o => o.status === 'pending_payment').length.toString()} icon={CreditCard} color="#F59E0B" />
        </button>
        <button type="button" onClick={() => setStatusFilter('processing')} className="text-left">
          <StatCard label="Processing" value={orders.filter(o => o.status === 'processing').length.toString()} icon={Box} color="#8B5CF6" />
        </button>
        <button type="button" onClick={() => setStatusFilter('shipped')} className="text-left">
          <StatCard label="Shipped" value={orders.filter(o => o.status === 'shipped').length.toString()} icon={Truck} color="#2ED1B4" />
        </button>
        <StatCard label="Revenue" value={`$${sumOrdersRevenue(orders).toFixed(0)}`} icon={DollarSign} color="#22C55E" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[rgba(17,24,39,0.5)] border border-[rgba(244,246,250,0.08)]">
          <p className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1">Direct Orders</p>
          <p className="text-2xl font-bold text-[#F4F6FA]">{directOrders.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[rgba(17,24,39,0.5)] border border-[rgba(46,209,180,0.25)]">
          <p className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1">Referral / Promo Orders</p>
          <p className="text-2xl font-bold text-[#2ED1B4]">{referralOrders.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[rgba(17,24,39,0.5)] border border-[rgba(139,92,246,0.25)]">
          <p className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1">Referral Revenue</p>
          <p className="text-2xl font-bold text-[#8B5CF6]">${referralRevenue.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[rgba(17,24,39,0.5)] border border-[rgba(59,130,246,0.25)]">
          <p className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1">Referral AOV</p>
          <p className="text-2xl font-bold text-[#3B82F6]">${referralAov.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(17,24,39,0.5)] border border-[rgba(244,246,250,0.08)]">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, email, or customer name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            <span className="text-xs text-[#A9B3C7] mr-1">Status:</span>
            {(['all', 'pending_payment', 'processing', 'finalised', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                type="button"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStatusFilter(status);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setStatusFilter(status);
                  }
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none ${
                  statusFilter === status
                    ? 'bg-[#2ED1B4] text-[#070A12]'
                    : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)] hover:text-[#F4F6FA]'
                }`}
              >
                {statusLabels[status] ?? status.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 mt-1 border-t border-[rgba(244,246,250,0.08)]">
            <p className="text-xs text-[#A9B3C7] leading-relaxed max-w-xl">
              Trustpilot review emails go to <strong className="text-[#F4F6FA]">Delivered</strong> orders only.
              Shipped orders receive the email when you mark them delivered — not before.
            </p>
            <button
              type="button"
              onClick={() => void sendBulkDeliveredReviewEmails()}
              disabled={isBulkSendingReviewEmails || deliveredReviewBacklogCount === 0}
              className="shrink-0 inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              {isBulkSendingReviewEmails
                ? 'Sending review emails…'
                : `Send review emails (${deliveredReviewBacklogCount})`}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-[rgba(244,246,250,0.08)]">
            <span className="text-xs font-medium text-[#A9B3C7] uppercase tracking-wide">Preorder</span>
            <button
              type="button"
              onClick={() => setPreorderFilter('all')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                preorderFilter === 'all'
                  ? 'bg-[#2ED1B4] text-[#070A12]'
                  : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
              }`}
            >
              All types
            </button>
            <button
              type="button"
              onClick={() => setPreorderFilter('preorder_only')}
              disabled={preorderOrderCount === 0}
              title={preorderOrderCount === 0 ? 'No preorder orders yet' : 'Show only PRE- / preorder orders'}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                preorderFilter === 'preorder_only'
                  ? 'bg-[#7F1D1D] text-[#FECACA] border border-[#EF4444]/50'
                  : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
              } ${preorderOrderCount === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Preorder only ({preorderOrderCount})
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-[rgba(244,246,250,0.08)]">
            <span className="text-xs font-medium text-[#A9B3C7] uppercase tracking-wide">Source</span>
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sourceFilter === 'all'
                  ? 'bg-[#2ED1B4] text-[#070A12]'
                  : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('direct')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sourceFilter === 'direct'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
              }`}
            >
              Direct ({directOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('referral')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sourceFilter === 'referral'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
              }`}
            >
              Referral ({referralOrders.length})
            </button>
            {topPromoCodes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <span className="text-[11px] text-[#A9B3C7]">Top codes:</span>
                {topPromoCodes.slice(0, 3).map(([code, count]) => (
                  <span
                    key={code}
                    className="px-2 py-1 rounded-md text-[11px] bg-[rgba(139,92,246,0.16)] text-[#C4B5FD] border border-[rgba(139,92,246,0.28)]"
                  >
                    {code} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-[#A9B3C7]">
            Showing <span className="font-medium text-[#F4F6FA]">{filteredOrders.length}</span>
            {filteredOrders.length !== orders.length && ` of ${orders.length}`} orders
          </p>
        </div>
      </div>

      {/* Orders list - table on desktop, cards on mobile */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-[rgba(17,24,39,0.5)] border border-[rgba(244,246,250,0.08)] text-center">
          <ShoppingCart className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-[rgba(244,246,250,0.2)] mb-4" />
          <p className="text-[#F4F6FA] font-medium mb-1">No orders found</p>
          <p className="text-sm text-[#A9B3C7]">
            {orders.length === 0 ? 'Orders will appear here once customers place them.' : 'Try changing the filter or search.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] overflow-hidden bg-[rgba(17,24,39,0.3)]">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.4)]">
                  <th className="text-left text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider px-4 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-left text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-right text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                    className="border-b border-[rgba(244,246,250,0.05)] hover:bg-[rgba(46,209,180,0.06)] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-semibold text-[#8B5CF6]">#{formatOrderNumberDisplay(order.order_number)}</span>
                        {orderIsPreorderRow(order) && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-[#7F1D1D] text-[#FECACA] border border-[#EF4444]/45">
                            Preorder
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#F4F6FA]">{order.customer_first_name} {order.customer_last_name}</p>
                      <p className="text-xs text-[#A9B3C7]">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#A9B3C7]">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      {orderIsReferralRow(order) ? (
                        <div className="space-y-1">
                          <span className="inline-flex px-2 py-1 rounded-lg text-[11px] font-medium bg-[rgba(139,92,246,0.2)] text-[#C4B5FD] border border-[rgba(139,92,246,0.35)]">
                            Referral
                          </span>
                          {order.affiliate_code && (
                            <p className="text-[11px] text-[#A9B3C7] font-mono">{order.affiliate_code}</p>
                          )}
                          {order.referral_promoter_name && (
                            <p className="text-[11px] text-[#A9B3C7] truncate max-w-[140px]">{order.referral_promoter_name}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-lg text-[11px] font-medium bg-[rgba(59,130,246,0.18)] text-[#93C5FD] border border-[rgba(59,130,246,0.3)]">
                          Direct
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.payment_status === 'pending' && order.status === 'pending_payment' && (
                        <span className="ml-1 inline-flex px-2 py-1 rounded-lg text-[10px] font-medium bg-[#F59E0B] text-white">Unpaid</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-[#2ED1B4]">${order.total?.toFixed(2)}</span>
                      <span className="block text-xs text-[#A9B3C7]">{order.items?.length || 0} items</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {canFinalisePreorder(order) ? (
                          <button
                            type="button"
                            onClick={() => finalisePreorder(order.id)}
                            disabled={isUpdating}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-50 whitespace-nowrap"
                          >
                            Finalised
                          </button>
                        ) : orderIsPreorderRow(order) && order.status === 'finalised' ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1D4ED8] text-white whitespace-nowrap">
                            Finalised
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                          className="p-1 rounded-lg hover:bg-[rgba(244,246,250,0.08)]"
                          aria-label="View order"
                        >
                          <Eye className="w-4 h-4 text-[#A9B3C7]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-[rgba(244,246,250,0.06)]">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                className="p-4 active:bg-[rgba(46,209,180,0.08)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono font-semibold text-[#8B5CF6]">#{formatOrderNumberDisplay(order.order_number)}</p>
                      {orderIsPreorderRow(order) && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#7F1D1D] text-[#FECACA] border border-[#EF4444]/45">
                          Preorder
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#F4F6FA] truncate">{order.customer_first_name} {order.customer_last_name}</p>
                    <p className="text-xs text-[#A9B3C7] truncate">{order.customer_email}</p>
                    <p className="text-xs text-[#A9B3C7] mt-1">{formatDate(order.created_at)}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {orderIsReferralRow(order) ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(139,92,246,0.2)] text-[#C4B5FD] border border-[rgba(139,92,246,0.35)]">
                          Referral {order.affiliate_code ? `(${order.affiliate_code})` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(59,130,246,0.18)] text-[#93C5FD] border border-[rgba(59,130,246,0.3)]">
                          Direct
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.payment_status === 'pending' && order.status === 'pending_payment' && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-[#F59E0B] text-white">Unpaid</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-[#2ED1B4]">${order.total?.toFixed(2)}</p>
                    <p className="text-xs text-[#A9B3C7]">{order.items?.length || 0} items</p>
                    <div className="flex items-center justify-end gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      {canFinalisePreorder(order) ? (
                        <button
                          type="button"
                          onClick={() => finalisePreorder(order.id)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-50"
                        >
                          Finalised
                        </button>
                      ) : orderIsPreorderRow(order) && order.status === 'finalised' ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1D4ED8] text-white">
                          Finalised
                        </span>
                      ) : null}
                      <Eye className="w-4 h-4 text-[#A9B3C7]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
          <div className="relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-[rgba(244,246,250,0.1)] border-b-0 sm:border-b mb-[72px] sm:mb-0">
            {/* Mobile drag handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[rgba(244,246,250,0.2)] mx-auto mb-4" />
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-[#F4F6FA]">Order #{formatOrderNumberDisplay(selectedOrder.order_number)}</h3>
                  {orderIsPreorderRow(selectedOrder) && (
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-[#7F1D1D] text-[#FECACA] border border-[#EF4444]/45">
                      Preorder
                    </span>
                  )}
                  {selectedOrderTracking?.isReferral ? (
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-[rgba(139,92,246,0.25)] text-[#C4B5FD] border border-[rgba(139,92,246,0.4)]">
                      Promo / Referral
                    </span>
                  ) : (
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-[rgba(59,130,246,0.2)] text-[#93C5FD] border border-[rgba(59,130,246,0.35)]">
                      Direct
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#A9B3C7]">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-lg bg-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#F4F6FA]">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                {selectedOrder.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                selectedOrder.payment_status === 'confirmed' ? 'bg-[#22C55E] text-white' : 'bg-[#F59E0B] text-white'
              }`}>
                Payment: {selectedOrder.payment_status}
              </span>
            </div>

            {selectedOrderTracking && (
              <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] mb-6">
                <h4 className="text-sm font-semibold text-[#F4F6FA] mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#22C55E]" />
                  Checkout source &amp; referral
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Order type</dt>
                    <dd className={selectedOrderTracking.isReferral ? 'text-[#C4B5FD] font-medium' : 'text-[#93C5FD] font-medium'}>
                      {selectedOrderTracking.sourceLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Promo code at checkout</dt>
                    <dd className="font-mono text-[#F4F6FA]">
                      {selectedOrderTracking.promoCode || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Promo discount applied</dt>
                    <dd className={selectedOrderTracking.promoDiscount > 0 ? 'text-[#22C55E] font-medium' : 'text-[#F4F6FA]'}>
                      {selectedOrderTracking.promoDiscount > 0
                        ? `−$${selectedOrderTracking.promoDiscount.toFixed(2)}`
                        : 'None'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Referrer</dt>
                    <dd className="text-[#F4F6FA]">
                      {selectedOrderTracking.referrerName || (selectedOrderTracking.isReferral ? 'Unknown' : '—')}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Referrer email</dt>
                    <dd className="text-[#F4F6FA] break-all">
                      {selectedOrderTracking.referrerEmail || '—'}
                    </dd>
                  </div>
                  {selectedOrderTracking.referrerId && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Referrer ID</dt>
                      <dd className="font-mono text-xs text-[#A9B3C7] break-all">{selectedOrderTracking.referrerId}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Campaign</dt>
                    <dd className="text-[#F4F6FA]">{selectedOrderTracking.campaignType || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Recorded at checkout</dt>
                    <dd className="text-[#F4F6FA]">
                      {selectedOrderTracking.recordedAt ? formatDate(selectedOrderTracking.recordedAt) : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] mb-6">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => openAdminShippingLabelWindow(selectedOrder, { print: true })}
                  className="px-4 py-2 rounded-lg bg-[#2ED1B4] text-[#070A12] text-sm font-semibold hover:opacity-90 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Label
                </button>
                <button
                  type="button"
                  onClick={() => openAdminShippingLabelWindow(selectedOrder, { edit: true })}
                  className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Label
                </button>
              </div>

              <div className="text-sm text-[#F4F6FA] space-y-3 rounded-lg border border-[rgba(244,246,250,0.12)] bg-[rgba(0,0,0,0.25)] p-4 font-sans">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A9B3C7] mb-1.5">From</p>
                  <p>{ADMIN_SHIPPING_LABEL_FROM.line1}</p>
                  <p>{ADMIN_SHIPPING_LABEL_FROM.line2}</p>
                </div>
                <hr className="border-0 border-t border-[rgba(244,246,250,0.2)]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A9B3C7] mb-2">To</p>
                  <div className="space-y-2">
                    <AdminCopyBox
                      label="Name"
                      value={`${selectedOrder.customer_first_name} ${selectedOrder.customer_last_name}`.trim()}
                      copiedKey="name"
                      activeCopiedKey={copiedShippingField}
                      onCopy={copyShippingField}
                    />
                    <AdminCopyBox
                      label="Address"
                      value={formatOrderShippingAddressOneLine(selectedOrder)}
                      copiedKey="address"
                      activeCopiedKey={copiedShippingField}
                      onCopy={copyShippingField}
                    />
                    <AdminCopyBox
                      label="Email"
                      value={selectedOrder.customer_email}
                      copiedKey="email"
                      activeCopiedKey={copiedShippingField}
                      onCopy={copyShippingField}
                    />
                  </div>
                </div>
                <hr className="border-0 border-t border-[rgba(244,246,250,0.2)]" />
                <div className="text-sm space-y-1 text-[#A9B3C7]">
                  <p>
                    <span className="text-[#F4F6FA] font-medium">Order:</span>{' '}
                    #{formatOrderNumberDisplay(selectedOrder.order_number)}
                  </p>
                  <p>
                    <span className="text-[#F4F6FA] font-medium">Method:</span>{' '}
                    {(selectedOrder.shipping_method || 'standard').toLowerCase()}
                  </p>
                  <p>
                    <span className="text-[#F4F6FA] font-medium">Tracking:</span>{' '}
                    <span className="font-mono text-[#F4F6FA]">
                      {selectedOrder.tracking_number || '—'}
                    </span>
                  </p>
                  {selectedOrderAdditionalTracking.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {selectedOrderAdditionalTracking.map((num, idx) => (
                        <p key={`${num}-${idx}`}>
                          <span className="text-[#F4F6FA] font-medium">Replacement {idx + 1}:</span>{' '}
                          <span className="font-mono text-[#F4F6FA]">{num}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.customer_phone ? (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <AdminCopyBox
                    label="Phone"
                    value={selectedOrder.customer_phone}
                    copiedKey="phone"
                    activeCopiedKey={copiedShippingField}
                    onCopy={copyShippingField}
                  />
                </div>
              ) : null}
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[#F4F6FA] mb-3 flex items-center gap-2">
                <Box className="w-4 h-4 text-[#8B5CF6]" />
                Items
              </h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-[#F4F6FA]">{item.name} ({item.dosage})</p>
                        {item.is_preorder && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[#FECACA] border border-[#EF4444]/40">Preorder</span>
                        )}
                      </div>
                      <p className="text-xs text-[#A9B3C7]">Qty: {item.quantity} × ${item.price}</p>
                    </div>
                    <p className="text-sm text-[#2ED1B4]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="p-4 rounded-xl bg-[rgba(46,209,180,0.1)] border border-[rgba(46,209,180,0.2)] mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#A9B3C7]">Subtotal</span>
                <span className="text-[#F4F6FA]">${selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#A9B3C7]">Shipping</span>
                <span className="text-[#F4F6FA]">${selectedOrder.shipping_cost?.toFixed(2)}</span>
              </div>
              {selectedOrderTracking && selectedOrderTracking.promoDiscount > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A9B3C7]">
                    Referral promo
                    {selectedOrderTracking.promoCode ? ` (${selectedOrderTracking.promoCode})` : ''}
                  </span>
                  <span className="text-[#22C55E]">−${selectedOrderTracking.promoDiscount.toFixed(2)}</span>
                </div>
              )}
              {selectedOrderTracking && selectedOrderTracking.pointsDiscount > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A9B3C7]">
                    Points discount
                    {selectedOrder.points_redeemed ? ` (${selectedOrder.points_redeemed} pts)` : ''}
                  </span>
                  <span className="text-[#22C55E]">−${selectedOrderTracking.pointsDiscount.toFixed(2)}</span>
                </div>
              )}
              {selectedOrder.discount_amount > 0 &&
                !selectedOrderTracking?.promoDiscount &&
                !selectedOrderTracking?.pointsDiscount && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#A9B3C7]">Discount</span>
                  <span className="text-[#22C55E]">−${selectedOrder.discount_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[rgba(244,246,250,0.1)]">
                <span className="text-[#F4F6FA]">Total</span>
                <span className="text-[#2ED1B4]">${selectedOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Actions - Mark as Paid */}
            {selectedOrder.status === 'pending_payment' && (
              <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] mb-4">
                <p className="text-sm text-[#F59E0B] mb-3">
                  Customer should transfer <span className="font-bold">${selectedOrder.total?.toFixed(2)}</span> with reference: <span className="font-mono font-bold">{formatOrderNumberDisplay(selectedOrder.order_number)}</span>
                </p>
                <button
                  onClick={() => updatePaymentStatus(selectedOrder.id, 'confirmed', selectedOrder)}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 rounded-xl bg-[#22C55E] text-white hover:bg-[#16A34A] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isUpdating ? 'Processing...' : 'I Received Payment - Mark as Paid'}
                </button>
              </div>
            )}

            {/* Tracking Number */}
            {(selectedOrder.status === 'processing' ||
              selectedOrder.status === 'finalised' ||
              selectedOrder.status === 'shipped' ||
              selectedOrder.status === 'delivered') && (
              <div className="p-4 rounded-xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] mb-4">
                <h4 className="text-sm font-semibold text-[#F4F6FA] mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8B5CF6]" />
                  Tracking Information
                </h4>

                {selectedOrder.tracking_number && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(7,10,18,0.5)]">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">Original shipment</p>
                        <p className="text-sm font-mono text-[#F4F6FA]">{selectedOrder.tracking_number}</p>
                      </div>
                      <span className="text-xs text-[#22C55E] flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3 h-3" /> Shipped
                      </span>
                    </div>
                    {selectedOrderAdditionalTracking.map((num, idx) => (
                      <div
                        key={`${num}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(139,92,246,0.15)]"
                      >
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[#A9B3C7] mb-0.5">
                            Replacement {idx + 1}
                          </p>
                          <p className="text-sm font-mono text-[#F4F6FA]">{num}</p>
                        </div>
                        <span className="text-xs text-[#8B5CF6] flex items-center gap-1 shrink-0">
                          <Send className="w-3 h-3" /> Sent
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedOrder.tracking_number ? (
                  <div>
                    <p className="text-xs text-[#A9B3C7] mb-2">
                      Add a replacement tracking number — the customer will receive an email with the new tracking details.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter replacement tracking number"
                        className="flex-1 px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
                      />
                      <button
                        onClick={() =>
                          addAdditionalTracking(
                            selectedOrder.id,
                            selectedOrder.order_number,
                            selectedOrder.customer_email,
                            selectedOrder.tracking_number,
                            selectedOrderAdditionalTracking,
                          )
                        }
                        disabled={isUpdating || !trackingNumber.trim()}
                        className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] disabled:opacity-50 flex items-center gap-2 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        {isUpdating ? 'Sending…' : 'Send & Email'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter Australia Post tracking number"
                      className="flex-1 px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
                    />
                    <button
                      onClick={() =>
                        addTracking(
                          selectedOrder.id,
                          selectedOrder.subtotal,
                          selectedOrder.user_id,
                          selectedOrder.order_number,
                          selectedOrder.customer_email,
                          selectedOrder.shipped_email_sent,
                          selectedOrder.affiliate_discount,
                        )
                      }
                      disabled={isUpdating || !trackingNumber.trim()}
                      className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Add & Award Points
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canFinalisePreorder(selectedOrder) && (
                <button
                  onClick={() => finalisePreorder(selectedOrder.id)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isUpdating ? 'Processing...' : 'Mark as Finalised'}
                </button>
              )}
              {(selectedOrder.status === 'processing' || selectedOrder.status === 'finalised') && !selectedOrder.tracking_number && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#2ED1B4] text-white hover:bg-[#25b89d] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  Mark as Shipped (No Tracking)
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'delivered', selectedOrder)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#22C55E] text-white hover:bg-[#16A34A] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Delivered
                </button>
              )}
              {(selectedOrder.status === 'pending_payment' || selectedOrder.status === 'processing') && (
                <button
                  onClick={async () => {
                    const orderIdToCancel = selectedOrder.id;
                    const userIdToRevoke = selectedOrder.user_id;

                    setIsUpdating(true);
                    try {
                      // Update order status FIRST so UI never hangs
                      const nowIso = new Date().toISOString();
                      const { error } = await supabase
                        .from('orders')
                        .update({
                          status: 'cancelled',
                          updated_at: nowIso,
                          cancelled_at: nowIso,
                        })
                        .eq('id', orderIdToCancel);

                      if (error) throw error;

                      // Refresh UI
                      await loadOrders(true);
                      setSelectedOrder((prev) => (prev && prev.id === orderIdToCancel ? { ...prev, status: 'cancelled' } : prev));
                    } catch (e: any) {
                      console.error('Error cancelling order:', e);
                      alert('Failed to cancel order: ' + (e?.message || 'Unknown error'));
                      return;
                    } finally {
                      setIsUpdating(false);
                    }

                    // Revoke points in background (best-effort)
                    void (async () => {
                      try {
                        if (!userIdToRevoke) return;
                        const sum = await getOrderEarnedPointsSum(orderIdToCancel);
                        if (sum > 0) {
                          await addUserPoints(
                            userIdToRevoke,
                            -sum,
                            'revoked',
                            'Order cancelled - points removed',
                            orderIdToCancel
                          );
                        }
                      } catch (pointsErr) {
                        console.error('[cancelOrder] points revoke failed', pointsErr);
                      } finally {
                        window.dispatchEvent(new Event('peplab:points-updated'));
                      }
                    })();
                  }}
                  disabled={isUpdating}
                  className="px-4 py-3 rounded-xl bg-[#EF4444] text-white hover:bg-[#DC2626] disabled:opacity-50 flex items-center gap-2"
                >
                  <Ban className="w-5 h-5" />
                  Cancel Order
                </button>
              )}
              {/* Delete Order (for fake/test orders) */}
              <button
                onClick={() => setDeleteOrderId(selectedOrder.id)}
                disabled={isUpdating || isDeleting}
                className="px-4 py-3 rounded-xl border border-[#EF4444] text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Order
              </button>
            </div>

            {/* Delete Order Confirmation */}
            {deleteOrderId === selectedOrder.id && (
              <div className="mt-4 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
                <p className="text-sm text-[#EF4444] mb-3">Are you sure? This will permanently delete order #{formatOrderNumberDisplay(selectedOrder.order_number)} and revoke any awarded points. This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteOrderId(null)} className="flex-1 px-3 py-2 rounded-lg border border-[rgba(244,246,250,0.2)] text-[#A9B3C7] text-sm">Cancel</button>
                  <button onClick={() => deleteOrder(selectedOrder.id)} disabled={isDeleting} className="flex-1 px-3 py-2 rounded-lg bg-[#EF4444] text-white text-sm disabled:opacity-50">
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Product image with same normalization as home page + fallback when missing/broken
function ProductImage({ product }: { product: Product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const dosageImage = product.product_dosages?.find((d: any) => d.image_url || d.imageUrl);
  const imgSrc = normalizeImageUrl(dosageImage?.image_url ?? dosageImage?.imageUrl ?? (product as any).image ?? product.image_url);
  if (!imgSrc || imgFailed) {
    return (
      <div className="w-16 h-16 rounded-lg bg-[rgba(7,10,18,0.5)] flex items-center justify-center text-2xl font-bold text-[#2ED1B4] shrink-0">
        {product.name.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={imgSrc}
      alt={product.name}
      className="w-16 h-16 object-contain rounded-lg bg-[rgba(7,10,18,0.5)]"
      onError={() => setImgFailed(true)}
    />
  );
}

async function uploadAdminProductImage(file: File, baseName: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const safeBase = (baseName || 'product')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '');
  const fileName = `${safeBase}-${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
  return urlData.publicUrl;
}

// Add Product modal form
function AddProductModal({
  onClose,
  onSaved,
  setError,
  error,
}: {
  onClose: () => void;
  onSaved: () => void;
  setError: (s: string | null) => void;
  error?: string | null;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [moreInfo, setMoreInfo] = useState(DEFAULT_MORE_INFO_TEXT);
  const [coaUrl, setCoaUrl] = useState<string>('');
  const [reviewCount, setReviewCount] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isCoaUploading, setIsCoaUploading] = useState(false);
  const [dosageMg, setDosageMg] = useState<string>('5');
  const [dosageUnit, setDosageUnit] = useState<string>('MG');
  const [dosageImageUrl, setDosageImageUrl] = useState('');
  const [isDosageImageUploading, setIsDosageImageUploading] = useState(false);
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [inStock, setInStock] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const originalPriceNum = parseFloat(originalPrice) || 0;
  const bundlePreview = originalPriceNum > 0 ? getBundlePricing(originalPriceNum) : null;
  const previewDisc = (qty: number) =>
    originalPriceNum > 0 ? `${getEffectiveListDiscountPercent(originalPriceNum, qty)}%` : '—';

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '')) {
      setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    const productSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
    if (!productSlug || !name.trim()) {
      setError('Name and slug are required.');
      setIsSaving(false);
      return;
    }
    const mgVal = dosageMg.trim();
    const stockQty = parseInt(stockQuantity, 10) || 0;
    try {
      const { data: newProduct, error: insertProductError } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          slug: productSlug,
          category: category.trim() || 'Popular',
          description: description.trim() || 'No description',
          more_info: (moreInfo || '').trim() || DEFAULT_MORE_INFO_TEXT,
          coa_url: coaUrl.trim() || null,
          image: dosageImageUrl.trim() || '/placeholder.png',
          is_active: isActive,
          review_count: Math.max(0, parseInt(reviewCount, 10) || 0),
        })
        .select('id')
        .single();
      if (insertProductError) throw insertProductError;
      const productId = newProduct?.id;
      if (!productId) throw new Error('Product was created but no id returned.');

      const mgNum = parseFloat(String(mgVal).replace(/[^\d.]/g, '')) || 0;
      const { error: insertDosageError } = await supabase.from('product_dosages').insert({
        product_id: productId,
        mg: mgNum,
        unit: dosageUnit,
        originalPrice: originalPriceNum,
        in_stock: inStock,
        stock_quantity: stockQty,
        image_url: dosageImageUrl.trim() || null,
      });
      if (insertDosageError) throw insertDosageError;

      onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to add product.');
    } finally {
      setIsSaving(false);
    }
  };

  const ic = 'w-full px-3 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors placeholder-[#4B5563]';
  const sc = 'w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none';
  const lc = 'block text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider mb-1.5';
  const SelectWrap = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0F172A] border border-[rgba(244,246,250,0.08)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[94vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl mb-[72px] sm:mb-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[rgba(244,246,250,0.2)]" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[rgba(244,246,250,0.08)] sticky top-0 bg-[#0F172A] z-10">
          <div>
            <h3 className="text-base font-bold text-[#F4F6FA]">Add Product</h3>
            <p className="text-xs text-[#A9B3C7] mt-0.5">Fill in the details below</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.12)] hover:text-[#F4F6FA] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="add-product-form" onSubmit={handleSubmit} className="p-5 pb-32 space-y-4">
          {/* Name + Slug side by side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Product Name *</label>
              <input type="text" value={name} onChange={e => handleNameChange(e.target.value)} className={ic} placeholder="e.g. BPC-157" required />
            </div>
            <div>
              <label className={lc}>Slug (URL ID)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className={ic} placeholder="e.g. bpc-157" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={lc}>Category</label>
            <SelectWrap>
              <select value={category} onChange={e => setCategory(e.target.value)} className={sc}>
                <option value="">Select category...</option>
                <option value="Best Seller">Best Seller</option>
                <option value="High Popularity">High Popularity</option>
                <option value="Popular">Popular</option>
                <option value="Essentials">Essentials</option>
              </select>
            </SelectWrap>
          </div>

          {/* Description */}
          <div>
            <label className={lc}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={ic} rows={2} placeholder="Short product description" />
          </div>

          {/* More Info */}
          <div>
            <label className={lc}>More Info <span className="text-[#4B5563] normal-case font-normal">(storefront popup)</span></label>
            <textarea value={moreInfo} onChange={e => setMoreInfo(e.target.value)} className={ic} rows={4} placeholder="Research & regulatory information..." />
          </div>

          {/* Review count + Active toggle on one row */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className={lc}>Review Count</label>
              <input type="number" min={0} value={reviewCount} onChange={e => setReviewCount(e.target.value)} className={ic} placeholder="0" />
            </div>
            <div className="shrink-0 pt-5">
              <button
                type="button"
                onClick={() => setIsActive(v => !v)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(46,209,180,0.12)] border-[rgba(46,209,180,0.3)] text-[#2ED1B4]'
                    : 'bg-[rgba(244,246,250,0.05)] border-[rgba(244,246,250,0.12)] text-[#6B7280]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-[#2ED1B4] bg-[#2ED1B4]' : 'border-[#6B7280]'}`}>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                {isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          {/* COA PDF */}
          <div>
            <label className={lc}>COA PDF <span className="text-[#4B5563] normal-case font-normal">(optional)</span></label>
            <div className="space-y-2">
              <label className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-colors ${
                isCoaUploading ? 'border-[rgba(244,246,250,0.1)] text-[#4B5563]' : 'border-[rgba(46,209,180,0.35)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.06)]'
              }`}>
                <Upload className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{isCoaUploading ? 'Uploading COA...' : 'Upload COA PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={isCoaUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsCoaUploading(true);
                    try {
                      const ext = 'pdf';
                      const base = (slug || name || 'product').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
                      const fileName = `${base}-${Date.now()}.${ext}`;
                      const { data: uploadData, error: uploadErr } = await supabase.storage.from('coa_file').upload(fileName, file, { upsert: true });
                      if (uploadErr) throw uploadErr;
                      const { data: urlData } = supabase.storage.from('coa_file').getPublicUrl(uploadData.path);
                      setCoaUrl(urlData.publicUrl);
                    } catch (err: any) {
                      alert('COA upload failed: ' + (err?.message || 'Unknown error'));
                    } finally {
                      setIsCoaUploading(false);
                    }
                  }}
                />
              </label>
              {coaUrl && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(46,209,180,0.08)] border border-[rgba(46,209,180,0.2)]">
                  <CheckCircle className="w-4 h-4 text-[#2ED1B4] shrink-0" />
                  <span className="text-xs text-[#2ED1B4] truncate flex-1">COA uploaded</span>
                  <button type="button" onClick={() => window.open(coaUrl, '_blank', 'noopener,noreferrer')} className="text-xs text-[#2ED1B4] underline shrink-0">View</button>
                </div>
              )}
            </div>
          </div>

          {/* First Dosage */}
          <div className="pt-3 border-t border-[rgba(244,246,250,0.08)]">
            <p className="text-sm font-bold text-[#F4F6FA] mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#2ED1B4]" />
              First Dosage Variant
            </p>
            <div className="space-y-3">
              {/* Dosage value + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Dosage Value</label>
                  <input type="text" value={dosageMg} onChange={e => setDosageMg(e.target.value)} className={ic} placeholder="e.g. 5" />
                </div>
                <div>
                  <label className={lc}>Unit</label>
                  <SelectWrap>
                    <select value={dosageUnit} onChange={e => setDosageUnit(e.target.value)} className={sc}>
                      <option value="MG">MG</option>
                      <option value="ML">ML</option>
                      <option value="IU">IU</option>
                      <option value="L">L</option>
                      <option value="PCS">PCS</option>
                    </select>
                  </SelectWrap>
                </div>
              </div>
              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Original Price ($) *</label>
                  <input type="number" step="0.01" min={0} value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className={ic} placeholder="e.g. 149.00" required />
                </div>
                <div>
                  <label className={lc}>Stock Quantity</label>
                  <input type="number" min={0} value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className={ic} />
                </div>
              </div>
              {/* Dosage image */}
              <div>
                <label className={lc}>Dosage Image <span className="text-[#4B5563] normal-case font-normal">(optional)</span></label>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    {dosageImageUrl && (
                      <img
                        src={dosageImageUrl.startsWith('http') ? dosageImageUrl : normalizeImageUrl(dosageImageUrl)}
                        alt="Dosage preview"
                        className="w-14 h-14 object-contain rounded-xl bg-[rgba(7,10,18,0.5)] shrink-0 border border-[rgba(244,246,250,0.08)]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <input
                      type="text"
                      value={dosageImageUrl}
                      onChange={e => setDosageImageUrl(e.target.value)}
                      className={ic}
                      placeholder="Paste dosage image URL or upload below"
                    />
                  </div>
                  <label className="w-full px-3 py-3 rounded-xl border border-dashed border-[rgba(46,209,180,0.35)] text-sm font-medium text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.06)] flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    {isDosageImageUploading ? 'Uploading dosage image...' : 'Upload Dosage Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isDosageImageUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsDosageImageUploading(true);
                        try {
                          const base = `${slug || name || 'product'}-${dosageMg || 'dose'}-${dosageUnit || 'mg'}`;
                          const url = await uploadAdminProductImage(file, base);
                          setDosageImageUrl(url);
                        } catch (err: any) {
                          alert('Dosage image upload failed: ' + (err?.message || 'Unknown error'));
                        } finally {
                          setIsDosageImageUploading(false);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              {/* In stock toggle */}
              <button
                type="button"
                onClick={() => setInStock(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  inStock
                    ? 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.25)] text-[#22C55E]'
                    : 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#EF4444]'
                }`}
              >
                <span className="text-sm font-medium">{inStock ? 'In Stock' : 'Out of Stock'}</span>
                <div className={`w-11 h-7 rounded-full inline-flex items-center shrink-0 transition-colors ${inStock ? 'bg-[#22C55E]' : 'bg-[rgba(244,246,250,0.12)]'}`}>
                  <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transition-transform ${inStock ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Bundle preview */}
          {bundlePreview && (
            <div className="p-3 rounded-xl bg-[rgba(46,209,180,0.06)] border border-[rgba(46,209,180,0.2)]">
              <p className="text-xs font-bold text-[#2ED1B4] mb-2 uppercase tracking-wider">Bundle Pricing Preview</p>
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { label: 'Buy 1', price: bundlePreview.buy1, disc: previewDisc(1) },
                  { label: 'Buy 2', price: bundlePreview.buy2, disc: previewDisc(2) },
                  { label: 'Buy 3', price: bundlePreview.buy3, disc: previewDisc(3) },
                  { label: 'Buy 5', price: bundlePreview.buy5, disc: previewDisc(5) },
                  { label: 'Buy 10', price: bundlePreview.buy10, disc: previewDisc(10) },
                ].map(t => (
                  <div key={t.label} className="p-2 rounded-lg bg-[rgba(7,10,18,0.5)]">
                    <p className="text-[10px] text-[#A9B3C7]">{t.label}</p>
                    <p className="text-xs font-bold text-[#2ED1B4]">${t.price.toFixed(2)}</p>
                    <p className="text-[9px] text-[#22C55E]">{t.disc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] text-sm">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

        </form>

        {/* Sticky action footer — always visible above the bottom nav */}
        <div className="sticky bottom-0 left-0 right-0 bg-[#0F172A] border-t border-[rgba(244,246,250,0.08)] px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-[rgba(244,246,250,0.15)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.05)] font-medium transition-colors">
            Cancel
          </button>
          <button
            form="add-product-form"
            type="submit"
            disabled={isSaving}
            className="flex-1 px-5 py-3 rounded-xl bg-[#2ED1B4] text-white hover:bg-[#25b89d] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all"
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Product</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Product modal
interface DosageEditRow {
  id?: string;
  mg: string;
  unit: string;
  imageUrl: string;
  originalPrice: string;
  stockQuantity: string;
  inStock: boolean;
  isNew: boolean;
}

function EditProductModal({
  product,
  onClose,
  onSaved,
  setError,
  error,
}: {
  product: Product & { product_dosages?: any[] };
  onClose: () => void;
  onSaved: () => void;
  setError: (s: string | null) => void;
  error?: string | null;
}) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [category, setCategory] = useState(product.category || '');
  const [description, setDescription] = useState(product.description || '');
  const [longDescription, setLongDescription] = useState((product as any).long_description ?? '');
  const [labPreparation, setLabPreparation] = useState((product as any).lab_preparation ?? '');
  const [reviewCount, setReviewCount] = useState(String(product.review_count ?? 0));
  const [moreInfo, setMoreInfo] = useState((product as any).more_info ?? DEFAULT_MORE_INFO_TEXT);
  const [coaUrl, setCoaUrl] = useState((product as any).coa_url ?? '');
  const [isActive, setIsActive] = useState(product.is_active !== false);
  const [isCoaUploading, setIsCoaUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removedDosageIds, setRemovedDosageIds] = useState<string[]>([]);
  const [dosageImageUploading, setDosageImageUploading] = useState<Record<number, boolean>>({});

  // Initialise all dosage rows from the existing dosages on the product
  const [dosages, setDosages] = useState<DosageEditRow[]>(() => {
    const existing = product.product_dosages ?? [];
    const singleVariantFallbackImage = existing.length === 1
      ? String((product as any).image ?? product.image_url ?? '')
      : '';
    if (existing.length > 0) {
      return existing.map(d => ({
        id: d.id,
        mg: String(d.mg ?? ''),
        unit: String(d.unit ?? 'MG'),
        imageUrl: String(d.image_url ?? d.imageUrl ?? singleVariantFallbackImage),
        originalPrice: String(d.originalPrice ?? d.originalPrice ?? d.price ?? ''),
        stockQuantity: String(d.stock_quantity ?? 100),
        inStock: d.in_stock !== false,
        isNew: false,
      }));
    }
    return [{ mg: '', unit: 'MG', imageUrl: '', originalPrice: '', stockQuantity: '100', inStock: true, isNew: true }];
  });

  const addDosageRow = () => {
    setDosages(prev => [...prev, { mg: '', unit: 'MG', imageUrl: '', originalPrice: '', stockQuantity: '100', inStock: true, isNew: true }]);
  };

  const removeDosageRow = (idx: number) => {
    const row = dosages[idx];
    if (row.id) setRemovedDosageIds(prev => [...prev, row.id!]);
    setDosages(prev => prev.filter((_, i) => i !== idx));
  };

  const updateDosage = (idx: number, field: keyof DosageEditRow, value: string | boolean) => {
    setDosages(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    const productSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
    if (!productSlug || !name.trim()) {
      setError('Name and slug are required.');
      setIsSaving(false);
      return;
    }
    if (dosages.length === 0) {
      setError('At least one dosage is required.');
      setIsSaving(false);
      return;
    }
    try {
      const firstDosageImage = dosages.find((row) => row.imageUrl.trim())?.imageUrl.trim() || '/placeholder.png';
      // Update the product row
      const { error: updateProductError } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          slug: productSlug,
          category: category.trim() || 'Popular',
          description: description.trim() || 'No description',
          long_description: (longDescription || '').trim() || null,
          lab_preparation: (labPreparation || '').trim() || null,
          review_count: Math.max(0, parseInt(reviewCount, 10) || 0),
          more_info: (moreInfo || '').trim() || DEFAULT_MORE_INFO_TEXT,
          coa_url: coaUrl.trim() || null,
          image: firstDosageImage,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);
      if (updateProductError) throw updateProductError;

      // Delete removed dosages
      for (const dosageId of removedDosageIds) {
        await supabase.from('product_dosages').delete().eq('id', dosageId);
      }

      // Update or insert each dosage row
      for (const row of dosages) {
        const mgNum = parseFloat(row.mg.trim().replace(/[^\d.]/g, '')) || 0;
        const price = parseFloat(row.originalPrice) || 0;
        const stockQty = parseInt(row.stockQuantity, 10) || 0;
        const unit = row.unit || 'MG';

        if (row.isNew || !row.id) {
          const { error: insertErr } = await supabase.from('product_dosages').insert({
            product_id: product.id,
            mg: mgNum,
            unit,
            originalPrice: price,
            in_stock: row.inStock,
            stock_quantity: stockQty,
            image_url: row.imageUrl.trim() || null,
          });
          if (insertErr) throw insertErr;
        } else {
          const { error: updateErr } = await supabase
            .from('product_dosages')
            .update({
              mg: mgNum,
              unit,
              originalPrice: price,
              in_stock: row.inStock,
              stock_quantity: stockQty,
              image_url: row.imageUrl.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', row.id);
          if (updateErr) throw updateErr;
        }
      }

      onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to update product.');
    } finally {
      setIsSaving(false);
    }
  };

  const ic = 'w-full px-3 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors placeholder-[#4B5563]';
  const sc = 'w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none';
  const lc = 'block text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider mb-1.5';
  const dic = 'w-full px-3 py-3 rounded-xl bg-[rgba(17,24,39,0.7)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors';
  const dsc = 'w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(17,24,39,0.7)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none';
  const SelectWrap = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0F172A] border border-[rgba(244,246,250,0.08)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl mb-[72px] sm:mb-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[rgba(244,246,250,0.2)]" />
        </div>

        {/* Sticky header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[rgba(244,246,250,0.08)] sticky top-0 bg-[#0F172A] z-10">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#F4F6FA] truncate">Edit: {product.name}</h3>
            <p className="text-xs text-[#A9B3C7] mt-0.5">Update product details below</p>
          </div>
          <button type="button" onClick={onClose} className="ml-3 shrink-0 p-2 rounded-xl bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.12)] hover:text-[#F4F6FA] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="edit-product-form" onSubmit={handleSubmit} className="p-5 pb-32 space-y-4">
          {/* Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Product Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={ic} placeholder="e.g. BPC-157" required />
            </div>
            <div>
              <label className={lc}>Slug (URL ID)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className={ic} placeholder="e.g. bpc-157" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={lc}>Category</label>
            <SelectWrap>
              <select value={category} onChange={e => setCategory(e.target.value)} className={sc}>
                <option value="">Select category...</option>
                <option value="Best Seller">Best Seller</option>
                <option value="High Popularity">High Popularity</option>
                <option value="Popular">Popular</option>
                <option value="Essentials">Essentials</option>
              </select>
            </SelectWrap>
          </div>

          {/* Description */}
          <div>
            <label className={lc}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={ic} rows={2} placeholder="Short product description" />
          </div>

          <div>
            <label className={lc}>Long Description <span className="text-[#4B5563] normal-case font-normal">(product page)</span></label>
            <textarea value={longDescription} onChange={e => setLongDescription(e.target.value)} className={ic} rows={4} placeholder="Extended overview shown on the product detail page" />
          </div>

          <div>
            <label className={lc}>Preparation<span className="text-[#4B5563] normal-case font-normal">(## section headings)</span></label>
            <textarea value={labPreparation} onChange={e => setLabPreparation(e.target.value)} className={ic} rows={6} placeholder="## Preparation Summary&#10;&#10;..." />
          </div>

          {/* Review count + Active toggle */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className={lc}>Review Count</label>
              <input type="number" min={0} value={reviewCount} onChange={e => setReviewCount(e.target.value)} className={ic} placeholder="0" />
            </div>
            <div className="shrink-0 pt-5">
              <button
                type="button"
                onClick={() => setIsActive(v => !v)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(46,209,180,0.12)] border-[rgba(46,209,180,0.3)] text-[#2ED1B4]'
                    : 'bg-[rgba(244,246,250,0.05)] border-[rgba(244,246,250,0.12)] text-[#6B7280]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-[#2ED1B4] bg-[#2ED1B4]' : 'border-[#6B7280]'}`}>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                {isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          {/* More Info */}
          <div>
            <label className={lc}>More Info <span className="text-[#4B5563] normal-case font-normal">(storefront popup)</span></label>
            <textarea value={moreInfo} onChange={e => setMoreInfo(e.target.value)} className={ic} rows={4} placeholder="Research & regulatory information..." />
          </div>

          {/* COA PDF */}
          <div>
            <label className={lc}>COA PDF <span className="text-[#4B5563] normal-case font-normal">(optional)</span></label>
            <div className="space-y-2">
              <label className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-colors ${
                isCoaUploading ? 'border-[rgba(244,246,250,0.1)] text-[#4B5563]' : 'border-[rgba(46,209,180,0.35)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.06)]'
              }`}>
                <Upload className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{isCoaUploading ? 'Uploading COA...' : 'Replace COA PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={isCoaUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsCoaUploading(true);
                    try {
                      const ext = 'pdf';
                      const base = (slug || name || 'product').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
                      const fileName = `${base}-${Date.now()}.${ext}`;
                      const { data: uploadData, error: uploadErr } = await supabase.storage.from('coa_file').upload(fileName, file, { upsert: true });
                      if (uploadErr) throw uploadErr;
                      const { data: urlData } = supabase.storage.from('coa_file').getPublicUrl(uploadData.path);
                      setCoaUrl(urlData.publicUrl);
                    } catch (err: any) {
                      alert('COA upload failed: ' + (err?.message || 'Unknown error'));
                    } finally {
                      setIsCoaUploading(false);
                    }
                  }}
                />
              </label>
              {coaUrl && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(46,209,180,0.08)] border border-[rgba(46,209,180,0.2)]">
                  <CheckCircle className="w-4 h-4 text-[#2ED1B4] shrink-0" />
                  <span className="text-xs text-[#2ED1B4] truncate flex-1">COA uploaded</span>
                  <button type="button" onClick={() => window.open(coaUrl, '_blank', 'noopener,noreferrer')} className="text-xs text-[#2ED1B4] underline shrink-0">View</button>
                </div>
              )}
            </div>
          </div>

          {/* Dosage Variations */}
          <div className="pt-3 border-t border-[rgba(244,246,250,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#F4F6FA] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#2ED1B4]" />
                Dosage Variants ({dosages.length})
              </p>
              <button
                type="button"
                onClick={addDosageRow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(46,209,180,0.12)] border border-[rgba(46,209,180,0.25)] text-[#2ED1B4] text-xs font-semibold hover:bg-[rgba(46,209,180,0.2)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {dosages.map((row, idx) => {
                const priceNum = parseFloat(row.originalPrice) || 0;
                const preview = priceNum > 0 ? getBundlePricing(priceNum) : null;
                const effDisc = (qty: number) =>
                  priceNum > 0 ? `${getEffectiveListDiscountPercent(priceNum, qty)}%` : '—';
                return (
                  <div key={idx} className="rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)] p-3 space-y-3">
                    {/* Row header: dosage # + remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {row.imageUrl ? (
                          <img
                            src={row.imageUrl.startsWith('http') ? row.imageUrl : normalizeImageUrl(row.imageUrl)}
                            alt={`Variant ${idx + 1}`}
                            className="w-9 h-9 object-contain rounded-lg bg-[rgba(17,24,39,0.7)] border border-[rgba(244,246,250,0.08)] shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[rgba(17,24,39,0.7)] border border-[rgba(244,246,250,0.08)] flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-[#4B5563]" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-[#2ED1B4] truncate">Variant {idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDosageRow(idx)}
                        disabled={dosages.length === 1}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#EF4444] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    {/* Dosage value + Unit */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Dosage</label>
                        <input
                          type="text"
                          value={row.mg}
                          onChange={e => updateDosage(idx, 'mg', e.target.value)}
                          placeholder="e.g. 5"
                          className={dic}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Unit</label>
                        <SelectWrap>
                          <select value={row.unit} onChange={(e) => updateDosage(idx, 'unit', e.target.value)} className={dsc}>
                            <option value="MG">MG</option>
                            <option value="ML">ML</option>
                            <option value="IU">IU</option>
                            <option value="L">L</option>
                            <option value="PCS">PCS</option>
                          </select>
                        </SelectWrap>
                      </div>
                    </div>

                    {/* Price + Stock qty */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={row.originalPrice}
                          onChange={e => updateDosage(idx, 'originalPrice', e.target.value)}
                          placeholder="0.00"
                          className={dic}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Stock Qty</label>
                        <input
                          type="number"
                          min={0}
                          value={row.stockQuantity}
                          onChange={e => updateDosage(idx, 'stockQuantity', e.target.value)}
                          className={dic}
                        />
                      </div>
                    </div>

                    {/* Dosage-specific product image */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Dosage Image</label>
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          {row.imageUrl && (
                            <img
                              src={row.imageUrl.startsWith('http') ? row.imageUrl : normalizeImageUrl(row.imageUrl)}
                              alt={`Variant ${idx + 1} preview`}
                              className="w-14 h-14 object-contain rounded-xl bg-[rgba(17,24,39,0.7)] shrink-0 border border-[rgba(244,246,250,0.08)]"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <input
                            type="text"
                            value={row.imageUrl}
                            onChange={e => updateDosage(idx, 'imageUrl', e.target.value)}
                            className={dic}
                            placeholder="Paste image URL or upload below"
                          />
                        </div>
                        <label className="w-full px-3 py-2.5 rounded-xl border border-dashed border-[rgba(46,209,180,0.28)] text-xs font-semibold text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.06)] flex items-center justify-center gap-2 transition-colors cursor-pointer">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {dosageImageUploading[idx] ? 'Uploading...' : 'Upload Variant Image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={Boolean(dosageImageUploading[idx])}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setDosageImageUploading(prev => ({ ...prev, [idx]: true }));
                              try {
                                const base = `${slug || name || 'product'}-${row.mg || 'dose'}-${row.unit || 'mg'}`;
                                const url = await uploadAdminProductImage(file, base);
                                updateDosage(idx, 'imageUrl', url);
                              } catch (err: any) {
                                alert('Variant image upload failed: ' + (err?.message || 'Unknown error'));
                              } finally {
                                setDosageImageUploading(prev => ({ ...prev, [idx]: false }));
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* In stock toggle */}
                    <button
                      type="button"
                      onClick={() => updateDosage(idx, 'inStock', !row.inStock)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                        row.inStock
                          ? 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.25)] text-[#22C55E]'
                          : 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#EF4444]'
                      }`}
                    >
                      <span className="text-sm font-medium">{row.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      <div className={`w-11 h-7 rounded-full inline-flex items-center shrink-0 transition-colors ${row.inStock ? 'bg-[#22C55E]' : 'bg-[rgba(244,246,250,0.12)]'}`}>
                        <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transition-transform ${row.inStock ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                      </div>
                    </button>

                    {/* Bundle pricing preview */}
                    {preview && (
                      <div className="pt-2 border-t border-[rgba(244,246,250,0.06)]">
                        <p className="text-[10px] font-semibold text-[#2ED1B4] uppercase mb-1.5">Bundle preview</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {[
                            { label: 'Buy 1', price: preview.buy1, disc: effDisc(1) },
                            { label: 'Buy 2', price: preview.buy2, disc: effDisc(2) },
                            { label: 'Buy 3', price: preview.buy3, disc: effDisc(3) },
                            { label: 'Buy 5', price: preview.buy5, disc: effDisc(5) },
                            { label: 'Buy 10', price: preview.buy10, disc: effDisc(10) },
                          ].map(t => (
                            <div key={t.label} className="px-2 py-1.5 rounded-lg bg-[rgba(46,209,180,0.08)] text-center min-w-[50px]">
                              <p className="text-[9px] text-[#A9B3C7]">{t.label}</p>
                              <p className="text-xs font-bold text-[#2ED1B4]">${t.price.toFixed(2)}</p>
                              <p className="text-[9px] text-[#22C55E]">{t.disc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {dosages.length === 0 && (
                <p className="text-sm text-[#A9B3C7] text-center py-6">No variants yet. Tap "Add Variant".</p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] text-sm">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

        </form>

        {/* Sticky action footer — always visible above the bottom nav */}
        <div className="sticky bottom-0 left-0 right-0 bg-[#0F172A] border-t border-[rgba(244,246,250,0.08)] px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-[rgba(244,246,250,0.15)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.05)] font-medium transition-colors">
            Cancel
          </button>
          <button
            form="edit-product-form"
            type="submit"
            disabled={isSaving}
            className="flex-1 px-5 py-3 rounded-xl bg-[#2ED1B4] text-white hover:bg-[#25b89d] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all"
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Update</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Products Section
function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [waitlistByProductId, setWaitlistByProductId] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<(Product & { product_dosages?: any[] }) | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [waitlistFilter, setWaitlistFilter] = useState<'all' | 'waitlist_only'>('all');
  const [isReordering, setIsReordering] = useState(false);
  const [isSyncingDetails, setIsSyncingDetails] = useState(false);
  const [syncDetailsMessage, setSyncDetailsMessage] = useState<string | null>(null);
  const loadProductsRequestIdRef = useRef(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (bust = false) => {
    const requestId = ++loadProductsRequestIdRef.current;
    if (bust) invalidateCache('admin:products');
    setLoading(true);
    try {
      const data = await cached('admin:products', async () => {
        const { data, error } = await supabase.from('products').select('*, product_dosages(*)').order('display_order', { ascending: true, nullsFirst: false });
        if (error && error.message?.includes('display_order')) {
          const { data: fallback } = await supabase.from('products').select('*, product_dosages(*)').order('name');
          return fallback || [];
        }
        return data || [];
      }, TTL_ADMIN_PRODUCTS);

      if (requestId === loadProductsRequestIdRef.current) {
        setProducts(data);
        const counts = await fetchAdminProductWaitlistCounts();
        if (requestId !== loadProductsRequestIdRef.current) return;
        const map: Record<string, number> = {};
        for (const row of counts) {
          map[row.product_id] = row.waitlist_count;
        }
        setWaitlistByProductId(map);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      if (requestId === loadProductsRequestIdRef.current) setLoading(false);
    }
  };

  const toggleStock = async (dosageId: string, currentStatus: boolean) => {
    try {
      await supabase.from('product_dosages').update({ in_stock: !currentStatus }).eq('id', dosageId);
      await loadProducts(true);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleSyncProductDetails = async () => {
    setIsSyncingDetails(true);
    setSyncDetailsMessage(null);
    try {
      const result = await syncProductDetailFieldsToSupabase();
      if (result.errors.length > 0) {
        setSyncDetailsMessage(`Updated ${result.updated} products. ${result.errors.length} errors.`);
      } else {
        setSyncDetailsMessage(`Synced detail content for ${result.updated} products.`);
      }
      await loadProducts(true);
    } catch (err: any) {
      setSyncDetailsMessage(err?.message || 'Failed to sync product details.');
    } finally {
      setIsSyncingDetails(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleteProduct.id);
      if (error) throw error;
      setDeleteProduct(null);
      await loadProducts(true);
    } catch (err: any) {
      console.error('Delete product error:', err);
      setEditError(err?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const openEditProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_dosages(*)')
        .eq('id', product.id)
        .single();
      if (error) throw error;
      setEditProduct((data || product) as Product & { product_dosages?: any[] });
    } catch (err: any) {
      console.error('Error loading fresh product for edit:', err);
      setEditProduct(product as Product & { product_dosages?: any[] });
      setEditError(err?.message || null);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => (p.category || '').toLowerCase().replace(/\s+/g, '-'))))];

  const productsInCategory = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter(p => (p.category || '').toLowerCase().replace(/\s+/g, '-') === categoryFilter);
  }, [products, categoryFilter]);

  const waitlistProductCountInScope = useMemo(
    () => productsInCategory.filter(p => (waitlistByProductId[p.id] ?? 0) > 0).length,
    [productsInCategory, waitlistByProductId],
  );

  const filteredProducts = useMemo(() => {
    if (waitlistFilter === 'waitlist_only') {
      return productsInCategory.filter(p => (waitlistByProductId[p.id] ?? 0) > 0);
    }
    return productsInCategory;
  }, [productsInCategory, waitlistFilter, waitlistByProductId]);

  const moveProduct = async (productId: string, direction: 'up' | 'down') => {
    setIsReordering(true);
    try {
      const filteredList = filteredProducts;

      const idx = filteredList.findIndex(p => p.id === productId);
      if (idx < 0) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === filteredList.length - 1) return;

      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      const currentProduct = filteredList[idx];
      const swapProduct = filteredList[swapIdx];

      const rawA = currentProduct.display_order;
      const rawB = swapProduct.display_order;
      const iGlobal = products.findIndex(p => p.id === currentProduct.id);
      const jGlobal = products.findIndex(p => p.id === swapProduct.id);
      const orderA = rawA ?? (iGlobal >= 0 ? iGlobal : idx);
      const orderB = rawB ?? (jGlobal >= 0 ? jGlobal : swapIdx);

      /** Same numeric display_order on both rows: swapping is a no-op in Postgres — renumber after swapping positions. */
      const renumberAllFromSwappedList = async () => {
        const byCurrentSort = [...products].sort((a, b) => {
          const oa = a.display_order ?? Number.MAX_SAFE_INTEGER;
          const ob = b.display_order ?? Number.MAX_SAFE_INTEGER;
          if (oa !== ob) return oa - ob;
          return (a.name || '').localeCompare(b.name || '');
        });
        const ia = byCurrentSort.findIndex(p => p.id === currentProduct.id);
        const ib = byCurrentSort.findIndex(p => p.id === swapProduct.id);
        if (ia < 0 || ib < 0) throw new Error('Could not resolve products for reorder.');
        const next = [...byCurrentSort];
        [next[ia], next[ib]] = [next[ib], next[ia]];
        for (let i = 0; i < next.length; i++) {
          const { error } = await supabase.from('products').update({ display_order: i }).eq('id', next[i].id);
          if (error) throw error;
        }
      };

      const duplicateDbOrder =
        rawA != null && rawB != null && Number(rawA) === Number(rawB);

      if (duplicateDbOrder) {
        await renumberAllFromSwappedList();
      } else {
        const { error: e1 } = await supabase
          .from('products')
          .update({ display_order: orderB })
          .eq('id', currentProduct.id);
        if (e1) throw e1;
        const { error: e2 } = await supabase
          .from('products')
          .update({ display_order: orderA })
          .eq('id', swapProduct.id);
        if (e2) throw e2;
      }

      await loadProducts(true);
    } catch (err) {
      console.error('Error reordering:', err);
      alert(
        err instanceof Error && err.message
          ? `Failed to reorder: ${err.message}`
          : 'Failed to reorder. Ensure the display_order column exists and your admin account can update products.',
      );
    } finally {
      setIsReordering(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32 rounded" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
      </div>
      <div className="rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(244,246,250,0.08)] flex gap-4">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-20 rounded ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[rgba(244,246,250,0.06)]">
            <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-[#F4F6FA] flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span>Products</span>
          {categoryFilter === 'all' && waitlistFilter === 'all' ? (
            <span className="text-sm font-normal text-[#A9B3C7]">({products.length})</span>
          ) : (
            <span className="text-sm font-normal text-[#A9B3C7]">
              Showing {filteredProducts.length} of {products.length}
            </span>
          )}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSyncProductDetails}
            disabled={isSyncingDetails}
            className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.15)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.05)] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSyncingDetails ? 'Syncing…' : 'Sync Product Details'}
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-white hover:bg-[#25b89d] flex items-center gap-2 transition-colors cursor-pointer relative z-10"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {syncDetailsMessage && (
        <p className="text-sm text-[#A9B3C7]">{syncDetailsMessage}</p>
      )}

      {/* Category + waitlist filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#2ED1B4] text-[#070A12]'
                  : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
              }`}
            >
              {cat === 'all' ? 'All' : cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#A9B3C7] uppercase tracking-wide">Waitlist</span>
          <button
            type="button"
            onClick={() => setWaitlistFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              waitlistFilter === 'all'
                ? 'bg-[#2ED1B4] text-[#070A12]'
                : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
            }`}
          >
            All products
          </button>
          <button
            type="button"
            onClick={() => setWaitlistFilter('waitlist_only')}
            disabled={waitlistProductCountInScope === 0}
            title={waitlistProductCountInScope === 0 ? 'No waitlist signups in the current category' : 'Show only products with at least one waitlist signup'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              waitlistFilter === 'waitlist_only'
                ? 'bg-[#A78BFA] text-[#070A12]'
                : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
            } ${waitlistProductCountInScope === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Waitlist only ({waitlistProductCountInScope})
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => { setShowAddModal(false); setAddError(null); }}
          onSaved={() => { setShowAddModal(false); setAddError(null); void loadProducts(true); }}
          setError={setAddError}
          error={addError}
        />
      )}

      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => { setEditProduct(null); setEditError(null); }}
          onSaved={() => { setEditProduct(null); setEditError(null); void loadProducts(true); }}
          setError={setEditError}
          error={editError}
        />
      )}

      {deleteProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => { setDeleteProduct(null); setEditError(null); }}>
          <div className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="text-[#F4F6FA] font-medium mb-2">Delete product?</p>
            <p className="text-sm text-[#A9B3C7] mb-4">“{deleteProduct.name}” will be removed. Dosages will be deleted. This cannot be undone.</p>
            {editError && <p className="text-sm text-[#EF4444] mb-3">{editError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setDeleteProduct(null); setEditError(null); }} className="flex-1 px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.05)]">Cancel</button>
              <button type="button" onClick={handleDeleteProduct} disabled={deleting} className="flex-1 px-4 py-2 rounded-xl bg-[#EF4444] text-white hover:bg-[#DC2626] disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.length === 0 && (
          <div className="rounded-xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)] px-6 py-10 text-center">
            <p className="text-[#F4F6FA] font-medium mb-1">No products match these filters</p>
            <p className="text-sm text-[#A9B3C7] mb-4">
              {waitlistFilter === 'waitlist_only'
                ? 'Try “All products” or another category — or no one has joined a waitlist in this view yet.'
                : 'Try another category.'}
            </p>
            <button
              type="button"
              onClick={() => { setCategoryFilter('all'); setWaitlistFilter('all'); }}
              className="px-4 py-2 rounded-xl bg-[rgba(244,246,250,0.08)] text-[#F4F6FA] text-sm hover:bg-[rgba(244,246,250,0.12)]"
            >
              Clear filters
            </button>
          </div>
        )}
        {filteredProducts.map((product, idx) => (
          <div key={product.id} className={`p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border ${product.is_active ? 'border-[rgba(244,246,250,0.08)]' : 'border-[#EF4444] opacity-60'}`}>
            <div className="flex items-start gap-4 mb-4">
              {/* Move up/down — list is single-column so order matches ↑↓ */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0 || isReordering}
                  onClick={() => moveProduct(product.id, 'up')}
                  className="p-1 rounded text-[#A9B3C7] hover:text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.1)] disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-center text-[#A9B3C7]">{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === filteredProducts.length - 1 || isReordering}
                  onClick={() => moveProduct(product.id, 'down')}
                  className="p-1 rounded text-[#A9B3C7] hover:text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.1)] disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <ProductImage product={product} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-[#F4F6FA]">{product.name}</h4>
                  {!product.is_active && <span className="px-2 py-0.5 rounded bg-[#EF4444] text-white text-[10px]">INACTIVE</span>}
                  <div className="ml-auto flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => void openEditProduct(product)}
                      className="p-2 rounded-lg text-[#A9B3C7] hover:bg-[rgba(46,209,180,0.15)] hover:text-[#2ED1B4]"
                      title="Edit product"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditError(null); setDeleteProduct(product); }}
                      className="p-2 rounded-lg text-[#A9B3C7] hover:bg-[rgba(239,68,68,0.15)] hover:text-[#EF4444]"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#A9B3C7] mt-1">{product.category}</p>
                <p className="text-xs text-[#A9B3C7] mt-1">Displayed reviews: {product.review_count ?? 0}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${product.product_dosages?.some((d: any) => d.in_stock) ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                  <span className="text-xs text-[#A9B3C7]">
                    {product.product_dosages?.filter((d: any) => d.in_stock).length || 0}/{product.product_dosages?.length || 0} in stock
                  </span>
                </div>
                {(waitlistByProductId[product.id] ?? 0) > 0 && (
                  <p className="text-xs font-medium text-[#C4B5FD] mt-1.5">
                    {waitlistByProductId[product.id]} {(waitlistByProductId[product.id] ?? 0) === 1 ? 'person' : 'people'} on waitlist
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {product.product_dosages?.map((dosage: any) => (
                <div key={dosage.id} className="flex items-center justify-between p-2 rounded-lg bg-[rgba(7,10,18,0.5)]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStock(dosage.id, dosage.in_stock)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${dosage.in_stock ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
                    >
                      {dosage.in_stock ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
                    </button>
                    <span className="text-sm text-[#F4F6FA]">{dosage.mg} {dosage.unit ?? 'MG'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#A9B3C7]">Stock: {dosage.stock_quantity}</span>
                    <span className="text-sm text-[#2ED1B4]">${dosage.originalPrice ?? dosage.price ?? '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Users Section
function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pointsModal, setPointsModal] = useState<{ user: any; mode: 'add' | 'deduct' } | null>(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [pointsLoading, setPointsLoading] = useState(false);
  const [banUser, setBanUser] = useState<any>(null);
  const [banning, setBanning] = useState(false);
  // Points history per user (expanded view)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userPointsHistory, setUserPointsHistory] = useState<PointsEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [resettingBirthdayUserId, setResettingBirthdayUserId] = useState<string | null>(null);
  const loadUsersRequestIdRef = useRef(0);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAdminEmail(session?.user?.email || '');
    })();
  }, []);

  useEffect(() => { loadUsers(); }, []);

  // Keep points balances in sync when another tab (Orders) updates points in background.
  useEffect(() => {
    const onPointsUpdated = () => {
      void loadUsers();
    };
    window.addEventListener('peplab:points-updated', onPointsUpdated);
    return () => window.removeEventListener('peplab:points-updated', onPointsUpdated);
  }, []);

  const loadUsers = async (bust = false) => {
    const requestId = ++loadUsersRequestIdRef.current;
    if (bust) invalidateCache('admin:users');
    setLoading(true);
    try {
      const result = await cached('admin:users', async () => {
        const { data, error } = await supabase.rpc('admin_get_all_users');
        const users = error
          ? ((await supabase.from('profiles').select('*').order('created_at', { ascending: false })).data || [])
          : (data || []);
        const { data: balRows, error: balErr } = await supabase.from('user_points_balance').select('user_id, balance');
        const balMap: Record<string, number> = {};
        if (balErr) {
          const { data: rawRows } = await supabase.from('user_points').select('user_id, points');
          (rawRows || []).forEach((r: any) => { balMap[r.user_id] = (balMap[r.user_id] || 0) + (r.points || 0); });
        } else {
          (balRows || []).forEach((r: any) => { balMap[r.user_id] = Number(r.balance || 0); });
        }
        return { users, balMap };
      }, TTL_ADMIN_USERS);
      if (requestId === loadUsersRequestIdRef.current) { setUsers(result.users); setUserBalances(result.balMap); }
    } catch (error) { console.error('Error loading users:', error); }
    finally {
      if (requestId === loadUsersRequestIdRef.current) setLoading(false);
    }
  };

  const handleExpandUser = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setUserPointsHistory([]);
      return;
    }
    setExpandedUserId(userId);
    setHistoryLoading(true);
    try {
      const history = await getUserTransactions(userId);
      setUserPointsHistory(history);
    } catch (err) { console.error('Error loading history:', err); }
    finally { setHistoryLoading(false); }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleting(true); setDeleteError(null);
    try {
      const userId = deleteUser.id;
      // Delete user_points events (the single points table now)
      await supabase.from('user_points').delete().eq('user_id', userId);
      const { error: errProfiles } = await supabase.from('profiles').delete().eq('id', userId);
      if (errProfiles) throw errProfiles;
      setDeleteUser(null); await loadUsers(true);
    } catch (err: any) { setDeleteError(err?.message || 'Failed to delete user.'); }
    finally { setDeleting(false); }
  };

  const handlePointsSubmit = async () => {
    if (!pointsModal || !pointsAmount) return;
    setPointsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const adminId = session?.user?.id ?? 'unknown';

      const amount = parseInt(pointsAmount);
      if (isNaN(amount) || amount <= 0) { alert('Enter a valid positive number'); setPointsLoading(false); return; }
      const pts = pointsModal.mode === 'deduct' ? -amount : amount;
      const desc = pointsReason || (pointsModal.mode === 'add' ? 'Admin adjustment' : 'Admin deduction');
      try {
        await addUserPoints(pointsModal.user.id, pts, 'admin_adjustment', desc, null);
        await logAdminAction(adminId, pointsModal.mode === 'add' ? 'add_points' : 'deduct_points', 'user', String(pointsModal.user.id), {
          points: pts,
          reason: desc,
        });
      } catch (rpcErr: unknown) {
        const msg = (rpcErr as { message?: string } | null)?.message ?? String(rpcErr);
        await logAdminAction(adminId, 'points_update_failed', 'user', String(pointsModal.user.id), {
          attemptedPoints: pts,
          reason: desc,
          error: msg,
        });
        throw new Error(msg);
      }

      setPointsModal(null); setPointsAmount(''); setPointsReason(''); await loadUsers(true);
    } catch (err: any) { alert('Failed: ' + (err?.message || 'Unknown error')); }
    finally { setPointsLoading(false); }
  };

  const handleBanUser = async () => {
    if (!banUser) return;
    setBanning(true);
    try {
      const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('id', banUser.id);
      if (error) throw error;
      setBanUser(null); await loadUsers(true);
    } catch (err: any) { alert('Failed to ban: ' + (err?.message || 'Unknown error')); }
    finally { setBanning(false); }
  };

  const handleUnbanUser = async (userId: string) => {
    try { await supabase.from('profiles').update({ is_banned: false }).eq('id', userId); await loadUsers(true); }
    catch (err: any) { alert('Failed to unban: ' + (err?.message || 'Unknown error')); }
  };

  const handleResetBirthday = async (user: { id: string; email?: string; date_of_birth?: string | null }) => {
    if (!user.date_of_birth) return;
    const label = user.email || user.id;
    if (!window.confirm(`Clear date of birth for ${label}? They will be able to set it themselves in Settings or the Dashboard.`)) {
      return;
    }

    setResettingBirthdayUserId(user.id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const adminId = session?.user?.id ?? 'unknown';

      const result = await resetUserBirthday(user.id);
      if (!result.ok) {
        alert(result.error || 'Could not reset birthday.');
        return;
      }

      await logAdminAction(adminId, 'reset_user_birthday', 'user', String(user.id), {
        email: user.email,
        previous_date_of_birth: user.date_of_birth,
      });
      await loadUsers(true);
    } finally {
      setResettingBirthdayUserId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28 rounded" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(244,246,250,0.08)] flex gap-6">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-20 rounded ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[rgba(244,246,250,0.06)]">
            <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#F4F6FA]">Users ({users.length})</h2>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4]" />
      </div>

      {pointsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => setPointsModal(null)}>
          <div className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-[#F4F6FA] font-medium mb-1">{pointsModal.mode === 'add' ? 'Add Points' : 'Deduct Points'}</h3>
            <p className="text-sm text-[#A9B3C7] mb-4">For: {pointsModal.user.email}</p>
            <div className="space-y-3">
              <input type="number" min="1" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} placeholder="Points amount" className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm" />
              <input type="text" value={pointsReason} onChange={e => setPointsReason(e.target.value)} placeholder="Reason (optional)" className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setPointsModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]">Cancel</button>
              <button onClick={handlePointsSubmit} disabled={pointsLoading || !pointsAmount} className={`flex-1 px-4 py-2 rounded-xl text-white disabled:opacity-50 ${pointsModal.mode === 'add' ? 'bg-[#22C55E] hover:bg-[#16A34A]' : 'bg-[#EF4444] hover:bg-[#DC2626]'}`}>
                {pointsLoading ? 'Processing...' : pointsModal.mode === 'add' ? 'Add Points' : 'Deduct Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {banUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => setBanUser(null)}>
          <div className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="text-[#F4F6FA] font-medium mb-2">Ban user?</p>
            <p className="text-sm text-[#A9B3C7] mb-4">&quot;{banUser.email}&quot; will be banned.</p>
            <div className="flex gap-3">
              <button onClick={() => setBanUser(null)} className="flex-1 px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]">Cancel</button>
              <button onClick={handleBanUser} disabled={banning} className="flex-1 px-4 py-2 rounded-xl bg-[#EF4444] text-white disabled:opacity-50">{banning ? 'Banning...' : 'Ban User'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => { setDeleteUser(null); setDeleteError(null); }}>
          <div className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="text-[#F4F6FA] font-medium mb-2">Delete user?</p>
            <p className="text-sm text-[#A9B3C7] mb-4">&quot;{deleteUser.email}&quot; will be removed permanently.</p>
            {deleteError && <p className="text-sm text-[#EF4444] mb-3">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setDeleteUser(null); setDeleteError(null); }} className="flex-1 px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]">Cancel</button>
              <button onClick={handleDeleteUser} disabled={deleting} className="flex-1 px-4 py-2 rounded-xl bg-[#EF4444] text-white disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const userBalance = userBalances[user.id] ?? 0;
          const isExpanded = expandedUserId === user.id;
          return (
            <div key={user.id} className={`rounded-xl bg-[rgba(17,24,39,0.6)] border overflow-hidden ${user.is_banned ? 'border-[#EF4444] opacity-70' : 'border-[rgba(244,246,250,0.08)]'}`}>
              <div className="p-3 sm:p-4">
                {/* Top row: name + badges + points */}
                <div className="flex items-start justify-between gap-3 mb-2 sm:mb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-[#F4F6FA] text-sm truncate">{user.full_name || user.email}</p>
                      {user.is_banned && <span className="px-1.5 py-0.5 rounded bg-[#EF4444] text-white text-[9px] font-bold">BANNED</span>}
                      {user.is_admin && <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6] text-white text-[9px] font-bold">ADMIN</span>}
                    </div>
                    <p className="text-xs text-[#A9B3C7] truncate mt-0.5">{user.email}</p>
                    {user.date_of_birth && (
                      <p className="text-[10px] text-[#F59E0B] mt-1">DOB set: {String(user.date_of_birth).slice(0, 10)}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-[#8B5CF6] font-bold">{userBalance} pts</p>
                    <button
                      onClick={() => handleExpandUser(user.id)}
                      className="text-[10px] text-[#2ED1B4] hover:underline"
                    >
                      {isExpanded ? 'Hide history' : 'History'}
                    </button>
                  </div>
                </div>
                {/* Action buttons row */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <button type="button" onClick={() => setPointsModal({ user, mode: 'add' })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#22C55E] bg-[rgba(34,197,94,0.08)] hover:bg-[rgba(34,197,94,0.15)] text-xs font-medium transition-colors" title="Add points">
                    <PlusCircle className="w-3.5 h-3.5" /> Add pts
                  </button>
                  <button type="button" onClick={() => setPointsModal({ user, mode: 'deduct' })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#F59E0B] bg-[rgba(245,158,11,0.08)] hover:bg-[rgba(245,158,11,0.15)] text-xs font-medium transition-colors" title="Deduct points">
                    <MinusCircle className="w-3.5 h-3.5" /> Deduct
                  </button>
                  {user.date_of_birth && (
                    <button
                      type="button"
                      onClick={() => void handleResetBirthday(user)}
                      disabled={resettingBirthdayUserId === user.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#F59E0B] bg-[rgba(245,158,11,0.08)] hover:bg-[rgba(245,158,11,0.15)] text-xs font-medium transition-colors disabled:opacity-50"
                      title="Clear date of birth so the user can set their own"
                    >
                      <Cake className="w-3.5 h-3.5" />
                      {resettingBirthdayUserId === user.id ? 'Clearing…' : 'Reset DOB'}
                    </button>
                  )}
                  {user.email !== adminEmail ? (
                    <>
                      {user.is_banned ? (
                        <button type="button" onClick={() => handleUnbanUser(user.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#22C55E] bg-[rgba(34,197,94,0.08)] hover:bg-[rgba(34,197,94,0.15)] text-xs font-medium transition-colors" title="Unban">
                          <CheckCircle className="w-3.5 h-3.5" /> Unban
                        </button>
                      ) : (
                        <button type="button" onClick={() => setBanUser(user)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#F59E0B] bg-[rgba(245,158,11,0.08)] hover:bg-[rgba(245,158,11,0.15)] text-xs font-medium transition-colors" title="Ban">
                          <Ban className="w-3.5 h-3.5" /> Ban
                        </button>
                      )}
                      <button type="button" onClick={() => { setDeleteError(null); setDeleteUser(user); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#EF4444] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] text-xs font-medium transition-colors ml-auto" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </>
                  ) : <span className="text-xs text-[#A9B3C7] px-2 ml-auto">(you)</span>}
                </div>
              </div>
              {/* Expandable Points History */}
              {isExpanded && (
                <div className="border-t border-[rgba(244,246,250,0.06)] bg-[rgba(7,10,18,0.4)] p-4">
                  <p className="text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider mb-3">
                    Points History — Balance: <span className="text-[#8B5CF6]">{userBalance} pts</span>
                  </p>
                  {historyLoading ? (
                    <div className="py-4 text-center text-sm text-[#A9B3C7]">Loading...</div>
                  ) : userPointsHistory.length === 0 ? (
                    <p className="text-sm text-[#A9B3C7]">No points history found.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userPointsHistory.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[rgba(17,24,39,0.5)] text-sm">
                          <div>
                            <span className="text-[#F4F6FA] font-medium">{POINT_TYPE_LABELS[ev.type as keyof typeof POINT_TYPE_LABELS] || ev.type}</span>
                            {ev.description && <span className="ml-2 text-[#A9B3C7] text-xs">· {ev.description}</span>}
                            <p className="text-[10px] text-[rgba(169,179,199,0.6)]">{new Date(ev.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <span className={`font-bold text-sm ml-4 ${ev.points >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {ev.points >= 0 ? '+' : ''}{ev.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Reviews Admin Section
function ReviewsAdminSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [deleteReview, setDeleteReview] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Add review form state
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [editProductId, setEditProductId] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editHelpfulCount, setEditHelpfulCount] = useState('0');
  const [editVerifiedPurchase, setEditVerifiedPurchase] = useState(false);
  const [editApproved, setEditApproved] = useState(true);
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageRemoved, setEditImageRemoved] = useState(false);

  const resetAddReviewImage = () => {
    revokePreviewUrl(reviewImagePreview);
    setReviewImageFile(null);
    setReviewImagePreview(null);
  };

  const resetEditReviewImage = () => {
    revokePreviewUrl(editImagePreview?.startsWith('blob:') ? editImagePreview : null);
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageRemoved(false);
  };

  const handleAddReviewImageSelect = (file: File | null) => {
    revokePreviewUrl(reviewImagePreview);
    if (!file) {
      setReviewImageFile(null);
      setReviewImagePreview(null);
      return;
    }
    setReviewImageFile(file);
    setReviewImagePreview(URL.createObjectURL(file));
  };

  const handleEditReviewImageSelect = (file: File | null) => {
    if (editImagePreview?.startsWith('blob:')) revokePreviewUrl(editImagePreview);
    if (!file) {
      setEditImageFile(null);
      setEditImagePreview(null);
      setEditImageRemoved(true);
      return;
    }
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
    setEditImageRemoved(false);
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async (bust = false) => {
    if (bust) invalidateCache('admin:reviews');
    setLoading(true);
    try {
      const result = await cached('admin:reviews', async () => {
        const [{ data: reviewsData }, { data: productsData }, { data: profilesData }] = await Promise.all([
          supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false }),
          supabase.from('products').select('id, name, slug').order('name'),
          supabase.from('profiles').select('id, full_name, email'),
        ]);
        const map: Record<string, string> = {};
        (profilesData || []).forEach((p: any) => { map[p.id] = p.full_name || p.email || 'User'; });
        return { reviews: reviewsData || [], products: productsData || [], userMap: map };
      }, TTL_ADMIN_REVIEWS);

      setReviews(result.reviews);
      setProducts(result.products);
      setUserMap(result.userMap);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!reviewProductId || !reviewComment.trim()) { setError('Product and comment are required'); return; }
    setIsSaving(true); setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Not authenticated');

      let imageUrl: string | null = null;
      if (reviewImageFile) {
        const uploaded = await uploadReviewImage(reviewImageFile);
        if ('error' in uploaded) throw new Error(uploaded.error);
        imageUrl = uploaded.url;
      }

      const { error: insertErr } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: reviewProductId,
        rating: reviewRating,
        title: reviewTitle.trim() || null,
        comment: reviewComment.trim(),
        image_url: imageUrl,
        is_verified_purchase: true,
        is_approved: true,
        helpful_count: 0,
      });
      if (insertErr) throw insertErr;

      setShowAddModal(false);
      setReviewProductId('');
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
      resetAddReviewImage();
      invalidateCache('reviews:homepage');
      await loadData(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to add review');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReview) return;
    setDeleting(true);
    try {
      const { error: delErr } = await supabase.from('reviews').delete().eq('id', deleteReview.id);
      if (delErr) throw delErr;
      setDeleteReview(null);
      await loadData(true);
    } catch (err: any) {
      alert('Failed to delete: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const openEditReview = (review: any) => {
    resetEditReviewImage();
    setEditingReview(review);
    setEditProductId(review.product_id || '');
    setEditRating(Math.max(1, Math.min(5, Number(review.rating) || 5)));
    setEditTitle(review.title || '');
    setEditComment(review.comment || '');
    setEditHelpfulCount(String(Math.max(0, Number(review.helpful_count) || 0)));
    setEditVerifiedPurchase(Boolean(review.is_verified_purchase));
    setEditApproved(review.is_approved !== false);
    setEditImagePreview(review.image_url || null);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleUpdateReview = async () => {
    if (!editingReview?.id) return;
    if (!editProductId || !editComment.trim()) {
      setEditError('Product and comment are required');
      return;
    }

    setIsUpdating(true);
    setEditError(null);
    try {
      let imageUrl: string | null | undefined = undefined;
      if (editImageFile) {
        const uploaded = await uploadReviewImage(editImageFile);
        if ('error' in uploaded) throw new Error(uploaded.error);
        imageUrl = uploaded.url;
      } else if (editImageRemoved) {
        imageUrl = null;
      }

      const payload: Record<string, unknown> = {
        product_id: editProductId,
        rating: Math.max(1, Math.min(5, Number(editRating) || 5)),
        title: editTitle.trim() || null,
        comment: editComment.trim(),
        is_verified_purchase: editVerifiedPurchase,
        is_approved: editApproved,
        helpful_count: Math.max(0, parseInt(editHelpfulCount, 10) || 0),
      };
      if (imageUrl !== undefined) payload.image_url = imageUrl;

      const { error: updateErr } = await supabase
        .from('reviews')
        .update(payload)
        .eq('id', editingReview.id);
      if (updateErr) throw updateErr;

      setShowEditModal(false);
      setEditingReview(null);
      resetEditReviewImage();
      invalidateCache('reviews:homepage');
      await loadData(true);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update review');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36 rounded" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(244,246,250,0.08)] flex gap-4">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded ml-auto" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 border-b border-[rgba(244,246,250,0.06)]">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-24 rounded-full ml-auto" />
              </div>
              <Skeleton className="h-3 w-full max-w-md rounded" />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#F4F6FA]">Reviews ({reviews.length})</h2>
        <button onClick={() => { resetAddReviewImage(); setShowAddModal(true); }} className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-white hover:bg-[#25b89d] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Write Review
        </button>
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => { resetAddReviewImage(); setShowAddModal(false); }}>
          <div className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center border-b border-[rgba(244,246,250,0.08)]">
              <h3 className="text-lg font-semibold text-[#F4F6FA]">Write a Review</h3>
              <button onClick={() => { resetAddReviewImage(); setShowAddModal(false); }} className="p-2 rounded-lg text-[#A9B3C7] hover:text-[#F4F6FA]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#A9B3C7] mb-1.5">Product *</label>
                <div className="relative">
                  <select value={reviewProductId} onChange={e => setReviewProductId(e.target.value)} className="w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none">
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)} className="p-1">
                      <Star className={`w-6 h-6 ${s <= reviewRating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[rgba(244,246,250,0.2)]'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Title (optional)</label>
                <input type="text" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA]" placeholder="Great product!" />
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Comment *</label>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA]" rows={3} placeholder="Write your review..." />
              </div>
              <ReviewImageUpload
                previewUrl={reviewImagePreview}
                onFileSelect={handleAddReviewImageSelect}
                disabled={isSaving}
                label="Review photo (optional)"
              />
              {error && <p className="text-sm text-[#EF4444]">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => { resetAddReviewImage(); setShowAddModal(false); }} className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]">Cancel</button>
                <button onClick={handleAddReview} disabled={isSaving} className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-white disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Post Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Modal */}
      {deleteReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => setDeleteReview(null)}>
          <div className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="text-[#F4F6FA] font-medium mb-2">Delete review?</p>
            <p className="text-sm text-[#A9B3C7] mb-4">This review will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteReview(null)} className="flex-1 px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]">Cancel</button>
              <button onClick={handleDeleteReview} disabled={deleting} className="flex-1 px-4 py-2 rounded-xl bg-[#EF4444] text-white disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => setShowEditModal(false)}>
          <div className="bg-[#111827] border border-[rgba(244,246,250,0.08)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex justify-between items-center border-b border-[rgba(244,246,250,0.08)]">
              <h3 className="text-lg font-semibold text-[#F4F6FA]">Edit Review</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-lg text-[#A9B3C7] hover:text-[#F4F6FA]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#A9B3C7] mb-1.5">Product *</label>
                <div className="relative">
                  <select value={editProductId} onChange={e => setEditProductId(e.target.value)} className="w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none">
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setEditRating(s)} className="p-1">
                      <Star className={`w-6 h-6 ${s <= editRating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[rgba(244,246,250,0.2)]'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Title (optional)</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA]" placeholder="Great product!" />
              </div>
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Comment *</label>
                <textarea value={editComment} onChange={e => setEditComment(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA]" rows={3} placeholder="Write your review..." />
              </div>
              <ReviewImageUpload
                previewUrl={editImagePreview}
                onFileSelect={handleEditReviewImageSelect}
                disabled={isUpdating}
                label="Review photo (optional)"
              />
              <div>
                <label className="block text-sm text-[#A9B3C7] mb-1">Helpful votes</label>
                <input type="number" min={0} value={editHelpfulCount} onChange={e => setEditHelpfulCount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA]" />
                <p className="text-[11px] text-[#A9B3C7] mt-1">This is the number of users who marked this review as helpful.</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[#A9B3C7]">
                  <input type="checkbox" checked={editVerifiedPurchase} onChange={e => setEditVerifiedPurchase(e.target.checked)} className="rounded accent-[#2ED1B4]" />
                  Verified purchase
                </label>
                <label className="flex items-center gap-2 text-sm text-[#A9B3C7]">
                  <input type="checkbox" checked={editApproved} onChange={e => setEditApproved(e.target.checked)} className="rounded accent-[#2ED1B4]" />
                  Approved for display
                </label>
              </div>
              {editError && <p className="text-sm text-[#EF4444]">{editError}</p>}
              <div className="flex gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7]">Cancel</button>
                <button onClick={handleUpdateReview} disabled={isUpdating} className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white disabled:opacity-50">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-[#A9B3C7]">No reviews yet. Click "Write Review" to add one.</div>
        ) : reviews.map(review => (
          <div key={review.id} className="p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[rgba(244,246,250,0.2)]'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-[#8B5CF6]">{review.products?.name || 'Unknown Product'}</span>
                  {review.is_verified_purchase && <span className="text-[10px] text-[#22C55E] flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Verified</span>}
                </div>
                {review.title && <p className="text-sm font-medium text-[#F4F6FA]">{review.title}</p>}
                {review.image_url && <ReviewPhoto url={review.image_url} className="mt-2 mb-2 max-w-xs" />}
                <p className="text-sm text-[#A9B3C7] mt-1">{review.comment}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#A9B3C7]">
                  <span>{userMap[review.user_id] || 'Anonymous'}</span>
                  <span>{new Date(review.created_at).toLocaleDateString('en-AU')}</span>
                  <span>{review.helpful_count || 0} people found this helpful</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEditReview(review)} className="p-2 rounded-lg text-[#A9B3C7] hover:bg-[rgba(46,209,180,0.15)] hover:text-[#2ED1B4]" title="Edit review">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteReview(review)} className="p-2 rounded-lg text-[#A9B3C7] hover:bg-[rgba(239,68,68,0.15)] hover:text-[#EF4444]" title="Delete review">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings Section
function PromoCodesSection() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [customCode, setCustomCode] = useState('');
  const [customDiscount, setCustomDiscount] = useState('10');
  const [customLabel, setCustomLabel] = useState('');
  const [customUnlimited, setCustomUnlimited] = useState(true);
  const [customMaxUses, setCustomMaxUses] = useState('100');
  const [customError, setCustomError] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  const [oneTimeDiscount, setOneTimeDiscount] = useState('10');
  const [oneTimeLabel, setOneTimeLabel] = useState('');
  const [oneTimeError, setOneTimeError] = useState('');
  const [oneTimeLoading, setOneTimeLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<PromoCode | null>(null);

  const loadCodes = async () => {
    setLoading(true);
    const rows = await getAllPromoCodes();
    setCodes(rows);
    setLoading(false);
  };

  useEffect(() => {
    void loadCodes();
  }, []);

  const handleCopy = async (code: string) => {
    await copyTextToClipboard(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCustom = async () => {
    setCustomError('');
    setCustomLoading(true);
    const result = await createPromoCode({
      code: customCode,
      discount_percent: Number(customDiscount) || 10,
      max_uses: customUnlimited ? null : Math.max(1, Number(customMaxUses) || 1),
      label: customLabel || 'Custom code',
    });
    setCustomLoading(false);
    if (!result.ok) {
      setCustomError(result.error || 'Failed to create code');
      return;
    }
    setCustomCode('');
    setCustomLabel('');
    await loadCodes();
  };

  const handleGenerateOneTime = async () => {
    setOneTimeError('');
    setOneTimeLoading(true);
    const result = await createOneTimePromoCode(
      Number(oneTimeDiscount) || 10,
      oneTimeLabel || 'One-time code',
    );
    setOneTimeLoading(false);
    if (!result.ok || !result.promoCode) {
      setOneTimeError(result.error || 'Failed to generate code');
      return;
    }
    setLastGenerated(result.promoCode);
    await loadCodes();
  };

  const handleToggleActive = async (row: PromoCode) => {
    await updatePromoCode(row.id, { is_active: !row.is_active });
    await loadCodes();
  };

  const handleDelete = async (row: PromoCode) => {
    if (!confirm(`Delete promo code ${row.code}?`)) return;
    const result = await deletePromoCode(row.id);
    if (!result.ok) alert(result.error || 'Failed to delete');
    else await loadCodes();
  };

  const filtered = codes.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      row.code.toLowerCase().includes(q) ||
      (row.label || '').toLowerCase().includes(q) ||
      (row.last_redeemed_email || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#A9B3C7]">
        Create checkout discount codes with a custom percentage. One-time codes are random 8-character codes that deactivate after a single use.
        Customers enter them at checkout like any other promo code.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(139,92,246,0.25)] space-y-4">
          <h3 className="text-lg font-semibold text-[#F4F6FA] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#8B5CF6]" />
            Custom promo code
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1 block">Code</label>
              <input
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER25"
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA] uppercase"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1 block">Discount %</label>
              <input
                type="number"
                min={1}
                max={100}
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1 block">Label (optional)</label>
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. Summer campaign"
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#A9B3C7]">
              <input
                type="checkbox"
                checked={customUnlimited}
                onChange={(e) => setCustomUnlimited(e.target.checked)}
                className="rounded"
              />
              Unlimited uses
            </label>
            {!customUnlimited && (
              <div>
                <label className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1 block">Max uses</label>
                <input
                  type="number"
                  min={1}
                  value={customMaxUses}
                  onChange={(e) => setCustomMaxUses(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA]"
                />
              </div>
            )}
            {customError && <p className="text-sm text-[#EF4444]">{customError}</p>}
            <button
              type="button"
              onClick={() => void handleCreateCustom()}
              disabled={customLoading || !customCode.trim()}
              className="w-full px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white font-medium disabled:opacity-50"
            >
              {customLoading ? 'Creating...' : 'Create code'}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(46,209,180,0.25)] space-y-4">
          <h3 className="text-lg font-semibold text-[#F4F6FA] flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#2ED1B4]" />
            One-time random code
          </h3>
          <p className="text-sm text-[#A9B3C7]">
            Generates a random 8-character code that works once, then deactivates automatically.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1 block">Discount %</label>
              <input
                type="number"
                min={1}
                max={100}
                value={oneTimeDiscount}
                onChange={(e) => setOneTimeDiscount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-1 block">Label (optional)</label>
              <input
                value={oneTimeLabel}
                onChange={(e) => setOneTimeLabel(e.target.value)}
                placeholder="e.g. VIP customer"
                className="w-full px-3 py-2.5 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA]"
              />
            </div>
            {oneTimeError && <p className="text-sm text-[#EF4444]">{oneTimeError}</p>}
            <button
              type="button"
              onClick={() => void handleGenerateOneTime()}
              disabled={oneTimeLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-[#2ED1B4] text-[#070A12] font-medium disabled:opacity-50"
            >
              {oneTimeLoading ? 'Generating...' : 'Generate one-time code'}
            </button>
            {lastGenerated && (
              <div className="p-4 rounded-xl bg-[rgba(46,209,180,0.12)] border border-[rgba(46,209,180,0.3)]">
                <p className="text-xs uppercase tracking-wide text-[#A9B3C7] mb-2">New code — copy and send to customer</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-bold tracking-widest text-[#F4F6FA]">{lastGenerated.code}</span>
                  <button
                    type="button"
                    onClick={() => void handleCopy(lastGenerated.code)}
                    className="px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.3)] text-[#2ED1B4] text-sm flex items-center gap-1.5"
                  >
                    {copiedCode === lastGenerated.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy
                  </button>
                </div>
                <p className="text-sm text-[#A9B3C7] mt-2">{lastGenerated.discount_percent}% off · single use</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-[#F4F6FA]">All promo codes ({filtered.length})</h3>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search codes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[rgba(244,246,250,0.12)] text-[#F4F6FA] text-sm"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-[#A9B3C7] py-8 text-center">No promo codes yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#A9B3C7] border-b border-[rgba(244,246,250,0.08)]">
                  <th className="py-3 pr-4 font-medium">Code</th>
                  <th className="py-3 pr-4 font-medium">Discount</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Uses</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Redeemed</th>
                  <th className="py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-[rgba(244,246,250,0.06)]">
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => void handleCopy(row.code)}
                        className="font-mono font-semibold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1.5"
                      >
                        {row.code}
                        {copiedCode === row.code ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 opacity-50" />}
                      </button>
                      {row.label && <p className="text-xs text-[#A9B3C7] mt-0.5">{row.label}</p>}
                    </td>
                    <td className="py-3 pr-4 text-[#F4F6FA]">{row.discount_percent}%</td>
                    <td className="py-3 pr-4 text-[#A9B3C7]">{promoCodeTypeLabel(row)}</td>
                    <td className="py-3 pr-4 text-[#A9B3C7]">{promoCodeUsesLabel(row)}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${row.is_active ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'}`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#A9B3C7]">
                      {row.last_redeemed_at ? (
                        <>
                          {row.last_redeemed_email || '—'}
                          <br />
                          {new Date(row.last_redeemed_at).toLocaleDateString('en-AU')}
                        </>
                      ) : '—'}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(row)}
                        className="px-2 py-1 rounded-lg text-xs text-[#A9B3C7] hover:text-[#F4F6FA] mr-2"
                      >
                        {row.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(row)}
                        className="px-2 py-1 rounded-lg text-xs text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsSection() {
  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK_DETAILS);
  const [discountSettings, setDiscountSettings] = useState(DEFAULT_DISCOUNT_SETTINGS);
  const [freeGiftSettings, setFreeGiftSettings] = useState(DEFAULT_FREE_GIFT_SETTINGS);
  const [supportLinks, setSupportLinks] = useState(DEFAULT_SUPPORT_LINKS);
  const [landingPageSettings, setLandingPageSettings] = useState(DEFAULT_LANDING_PAGE_SETTINGS);
  const [affiliateProgramSettings, setAffiliateProgramSettings] = useState(DEFAULT_AFFILIATE_PROGRAM_SETTINGS);
  const [researchDisclaimerSettings, setResearchDisclaimerSettings] = useState(DEFAULT_RESEARCH_DISCLAIMER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const loadSettings = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      console.log('[Settings] Loading settings...');
      const {
        bankDetails: bank,
        discountSettings: discount,
        freeGiftSettings: gift,
        supportLinks: support,
        landingPageSettings: landingPage,
        affiliateProgramSettings: affiliateProgram,
        researchDisclaimerSettings: researchDisclaimer,
      } = await fetchAllSiteSettings();
      console.log('[Settings] Settings loaded OK');
      setBankDetails(bank);
      setDiscountSettings(discount);
      setFreeGiftSettings(gift);
      setSupportLinks(support);
      setLandingPageSettings(landingPage);
      setAffiliateProgramSettings(affiliateProgram);
      setResearchDisclaimerSettings(researchDisclaimer);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSettings(true);
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await Promise.all([
        updateSiteSetting('bank_details', bankDetails),
        updateSiteSetting('discount_settings', discountSettings),
        updateSiteSetting('free_gift_settings', freeGiftSettings),
        updateSiteSetting('telegram_link', { url: supportLinks.telegram_link }),
        updateSiteSetting('whatsapp_link', { url: supportLinks.whatsapp_link }),
        updateSiteSetting('landing_page_settings', landingPageSettings),
        updateSiteSetting('affiliate_program_settings', affiliateProgramSettings),
        updateSiteSetting('research_disclaimer_settings', researchDisclaimerSettings),
      ]);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-4">
          <Skeleton className="h-6 w-48 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((__, j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => loadSettings(false)}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl border border-[rgba(244,246,250,0.2)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.05)] hover:text-[#F4F6FA] text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh from database'}
        </button>
      </div>
      {/* Bank Transfer Details */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(46,209,180,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(46,209,180,0.2)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#2ED1B4]" />
          Bank Transfer Details
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">PAYID</label>
            <input
              type="text"
              value={bankDetails.payid}
              onChange={(e) => setBankDetails({ ...bankDetails, payid: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Account Name</label>
            <input
              type="text"
              value={bankDetails.account_name}
              onChange={(e) => setBankDetails({ ...bankDetails, account_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">BSB</label>
            <input
              type="text"
              value={bankDetails.bsb}
              onChange={(e) => setBankDetails({ ...bankDetails, bsb: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Account Number</label>
            <input
              type="text"
              value={bankDetails.account_number}
              onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Landing Page Control */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(59,130,246,0.2)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-1 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#3B82F6]" />
          Landing Page Control
        </h3>
        <p className="text-xs text-[#A9B3C7] mb-5">
          Turn the homepage on or off. When off, visitors must log in to access the shop homepage.
        </p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
          <div>
            <p className="text-sm font-medium text-[#F4F6FA]">Landing Page Enabled</p>
            <p className="text-xs text-[#A9B3C7] mt-0.5">
              {landingPageSettings.enabled
                ? 'Active — homepage is visible to everyone'
                : 'Disabled — homepage requires customer login'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLandingPageSettings({ ...landingPageSettings, enabled: !landingPageSettings.enabled })}
            className={`relative inline-flex items-center w-11 h-7 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
              landingPageSettings.enabled ? 'bg-[#22C55E]' : 'bg-[rgba(244,246,250,0.15)]'
            }`}
          >
            <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              landingPageSettings.enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
            }`} />
          </button>
        </div>
      </div>

      {/* Shop research disclaimer banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(239,68,68,0.1)] to-[rgba(17,24,39,0.6)] border border-[rgba(239,68,68,0.25)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#EF4444]" />
          Shop disclaimer banner
        </h3>
        <p className="text-xs text-[#A9B3C7] mb-5">
          The scrolling red message shown above the product grid on the shop page. Leave blank to hide the banner.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Banner message</label>
            <input
              type="text"
              value={researchDisclaimerSettings.message}
              onChange={(e) =>
                setResearchDisclaimerSettings({ ...researchDisclaimerSettings, message: e.target.value })
              }
              placeholder="For Research Purposes Only — Not For Human Consumption"
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
            />
          </div>
          {researchDisclaimerSettings.message.trim() && (
            <ResearchMarquee
              text={researchDisclaimerSettings.message}
              className="rounded-lg border border-[rgba(239,68,68,0.2)] bg-[#1e1019] py-2"
              decorative
            />
          )}
        </div>
      </div>

      {/* Affiliate / referral codes (checkout) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(34,197,94,0.08)] to-[rgba(139,92,246,0.1)] border border-[rgba(34,197,94,0.25)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-1 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#22C55E]" />
          Referral promo codes
        </h3>
        <p className="text-xs text-[#A9B3C7] mb-5">
          When off, customers cannot apply referral codes at checkout and links with <span className="font-mono text-[#A9B3C7]">?aff=</span> are ignored. Individual promoters can still be managed in Affiliates.
        </p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
          <div>
            <p className="text-sm font-medium text-[#F4F6FA]">Codes accepted at checkout</p>
            <p className="text-xs text-[#A9B3C7] mt-0.5">
              {affiliateProgramSettings.codes_enabled
                ? 'On — referral discounts can be applied'
                : 'Paused — no referral codes until you turn this back on'}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setAffiliateProgramSettings({
                ...affiliateProgramSettings,
                codes_enabled: !affiliateProgramSettings.codes_enabled,
              })
            }
            className={`relative inline-flex items-center w-11 h-7 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
              affiliateProgramSettings.codes_enabled ? 'bg-[#22C55E]' : 'bg-[rgba(244,246,250,0.15)]'
            }`}
          >
            <span
              className={`inline-block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                affiliateProgramSettings.codes_enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Discount Settings */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(245,158,11,0.1)] to-[rgba(239,68,68,0.1)] border border-[rgba(245,158,11,0.2)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-1 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#F59E0B]" />
          Discount Settings
        </h3>
        <p className="text-xs text-[#A9B3C7] mb-5">
          Control whether storefront prices show a discount and what percentage is applied globally.
        </p>

        {/* Master toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)] mb-4">
          <div>
            <p className="text-sm font-medium text-[#F4F6FA]">Discounts Enabled</p>
            <p className="text-xs text-[#A9B3C7] mt-0.5">
              {discountSettings.discount_enabled
                ? `Active — Buy 1: ${discountSettings.discount_percentage ?? 20}% off list · Buy 2: extra ${discountSettings.buy2_percentage ?? 5}% off the 2× Buy 1 subtotal · Buy 3+: extra ${discountSettings.buy3_percentage ?? 10}% off the subtotal`
                : 'Disabled — original list prices shown (no Buy 1 discount).'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDiscountSettings({ ...discountSettings, discount_enabled: !discountSettings.discount_enabled })}
            className={`relative inline-flex items-center w-11 h-7 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
              discountSettings.discount_enabled ? 'bg-[#22C55E]' : 'bg-[rgba(244,246,250,0.15)]'
            }`}
          >
            <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              discountSettings.discount_enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
            }`} />
          </button>
        </div>

        {/* Per-tier percentage controls */}
        <div className={`space-y-3 transition-opacity duration-200 ${discountSettings.discount_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

          {/* Helper: reusable tier row */}
          {(
            [
              {
                key: 'discount_percentage' as const,
                label: 'Buy 1',
                sub: '% off original list (per unit)',
                default: 20,
                color: '#F59E0B',
                presets: [5, 10, 15, 20, 25, 30],
              },
              {
                key: 'buy2_percentage' as const,
                label: 'Buy 2',
                sub: 'extra % off (after Buy 1 price × 2)',
                default: 5,
                color: '#8B5CF6',
                presets: [3, 5, 8, 10, 15, 20],
              },
              {
                key: 'buy3_percentage' as const,
                label: 'Buy 3+',
                sub: 'extra % off (after Buy 1 price × qty)',
                default: 10,
                color: '#2ED1B4',
                presets: [5, 8, 10, 12, 15, 20],
              },
            ] as const
          ).map(({ key, label, sub, default: def, color, presets }) => {
            const current = (discountSettings[key] as number) ?? def;
            return (
              <div key={key} className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.06)]">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold w-fit" style={{ background: `${color}22`, color }}>{label}</span>
                    <span className="text-[10px] text-[#A9B3C7] leading-snug">{sub}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ color }}>{current}%</span>
                </div>

                {/* Slider + number input */}
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="range"
                    min={1}
                    max={70}
                    step={1}
                    value={current}
                    onChange={(e) => setDiscountSettings({ ...discountSettings, [key]: parseInt(e.target.value) })}
                    className="flex-1"
                    style={{ accentColor: color }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={70}
                    value={current}
                    onChange={(e) => setDiscountSettings({ ...discountSettings, [key]: Math.min(70, Math.max(1, parseInt(e.target.value) || 1)) })}
                    className="w-14 px-2 py-1 rounded-lg bg-[rgba(17,24,39,0.8)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm text-center"
                  />
                  <span className="text-sm text-[#A9B3C7]">%</span>
                </div>

                {/* Preset buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {presets.map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountSettings({ ...discountSettings, [key]: pct })}
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                      style={
                        current === pct
                          ? { background: color, color: '#070A12' }
                          : { background: 'rgba(244,246,250,0.06)', color: '#A9B3C7' }
                      }
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Live preview table */}
          <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.4)] border border-[rgba(245,158,11,0.1)]">
            <p className="text-xs text-[#A9B3C7] mb-3 uppercase tracking-wide">Live preview — $200 original price</p>
            <div className="space-y-2">
              {(
                [
                  { label: 'Buy 1', qty: 1, color: '#F59E0B' },
                  { label: 'Buy 2', qty: 2, color: '#8B5CF6' },
                  { label: 'Buy 3', qty: 3, color: '#2ED1B4' },
                ] as const
              ).map(({ label, qty, color }) => {
                const unit = getStackedBundleUnitPrice(200, qty, discountSettings);
                const total = +(unit * qty).toFixed(2);
                const listTotal = 200 * qty;
                const save = +(listTotal - total).toFixed(2);
                const effPct = getEffectiveListDiscountPercent(200, qty, discountSettings);
                return (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <span className="w-12 text-xs font-bold" style={{ color }}>{label}</span>
                    <span className="text-[#A9B3C7] line-through text-xs">${listTotal.toFixed(2)}</span>
                    <span className="font-bold text-[#F4F6FA]">${total.toFixed(2)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${color}22`, color }}>~{effPct}% vs list</span>
                    <span className="text-[10px] text-[#22C55E] ml-auto">Save ${save.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Badge display options */}
        <div className="mt-4 pt-4 border-t border-[rgba(244,246,250,0.06)]">
          <p className="text-xs font-medium text-[#A9B3C7] uppercase mb-3">Badge Display Options</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-[#A9B3C7] uppercase">Badge Text</label>
              <input
                type="text"
                value={discountSettings.badge_text}
                onChange={(e) => setDiscountSettings({ ...discountSettings, badge_text: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#A9B3C7] uppercase tracking-wider mb-1.5">Show Percentage</label>
              <div className="relative">
                <select
                  value={discountSettings.show_percentage ? 'true' : 'false'}
                  onChange={(e) => setDiscountSettings({ ...discountSettings, show_percentage: e.target.value === 'true' })}
                  className="w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#A9B3C7] uppercase tracking-wider mb-1.5">Badge Enabled</label>
              <div className="relative">
                <select
                  value={discountSettings.enabled ? 'true' : 'false'}
                  onChange={(e) => setDiscountSettings({ ...discountSettings, enabled: e.target.value === 'true' })}
                  className="w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold text-[#A9B3C7] uppercase tracking-wider mb-1.5">Badge Position</label>
              <div className="relative">
                <select
                  value={discountSettings.badge_position || 'top-right'}
                  onChange={(e) => setDiscountSettings({ ...discountSettings, badge_position: e.target.value })}
                  className="w-full px-3 py-3 pr-9 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-base focus:outline-none focus:border-[#2ED1B4] transition-colors appearance-none"
                >
                  <option value="top-right">Top right</option>
                  <option value="top-left">Top left</option>
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Gift Settings */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(46,209,180,0.1)] border border-[rgba(139,92,246,0.2)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#8B5CF6]" />
          Free Gift Settings
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="free-gift-enabled"
              checked={freeGiftSettings.enabled !== false}
              onChange={(e) => setFreeGiftSettings({ ...freeGiftSettings, enabled: e.target.checked })}
              className="rounded accent-[#8B5CF6] w-4 h-4"
            />
            <label htmlFor="free-gift-enabled" className="text-sm text-[#A9B3C7]">Free gift enabled (add to cart when threshold met)</label>
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Gift name</label>
            <input
              type="text"
              value={freeGiftSettings.name || ''}
              onChange={(e) => setFreeGiftSettings({ ...freeGiftSettings, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
              placeholder="e.g. BAC Water"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Threshold ($)</label>
            <input
              type="number"
              value={freeGiftSettings.threshold}
              onChange={(e) => setFreeGiftSettings({ ...freeGiftSettings, threshold: parseInt(e.target.value) || 300 })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Product ID</label>
            <input
              type="text"
              value={freeGiftSettings.product_id}
              onChange={(e) => setFreeGiftSettings({ ...freeGiftSettings, product_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
              placeholder="e.g. bac-water or product UUID"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Dosage</label>
            <input
              type="text"
              value={freeGiftSettings.dosage}
              onChange={(e) => setFreeGiftSettings({ ...freeGiftSettings, dosage: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
              placeholder="e.g. 3 mL"
            />
          </div>
        </div>
        <p className="text-xs text-[#A9B3C7] mt-3">
          When enabled, the free gift is added to cart when customer spends ${freeGiftSettings.threshold} or more.
        </p>
      </div>

      {/* Support Links */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(46,209,180,0.1)] border border-[rgba(139,92,246,0.2)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#8B5CF6]" />
          Support Links
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">Telegram Link</label>
            <input
              type="url"
              value={supportLinks.telegram_link || ''}
              onChange={(e) => setSupportLinks({ ...supportLinks, telegram_link: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
              placeholder="https://t.me/YourLink"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#A9B3C7] uppercase">WhatsApp Link</label>
            <input
              type="url"
              value={supportLinks.whatsapp_link || ''}
              onChange={(e) => setSupportLinks({ ...supportLinks, whatsapp_link: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] text-sm"
              placeholder="https://wa.me/YourNumber"
            />
          </div>
          <p className="text-xs text-[#A9B3C7]">
            WhatsApp appears in the shop and footer only when its link is set.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="space-y-3">
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            saveMessage.includes('Error')
              ? 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#EF4444]'
              : 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22C55E]'
          }`}>
            {saveMessage.includes('Error') ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            {saveMessage}
          </div>
        )}
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2ED1B4] text-white hover:bg-[#25b89d] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Order Processing Guide */}
      <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
        <h3 className="text-lg font-semibold text-[#F4F6FA] mb-4">How Order Processing Works</h3>
        <div className="space-y-3 text-sm text-[#A9B3C7]">
          <p className="flex items-start gap-2">
            <span className="text-[#2ED1B4] font-bold">1.</span>
            Customer places order → Status: "Awaiting Payment"
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#2ED1B4] font-bold">2.</span>
            Customer pays via bank transfer with order number as reference
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#2ED1B4] font-bold">3.</span>
            You check your bank and click "I Received Payment" in admin
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#2ED1B4] font-bold">4.</span>
            Pack order and add tracking number → Status: "Shipped"
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#2ED1B4] font-bold">5.</span>
            Mark as "Delivered" when customer receives it
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#F4F6FA] leading-tight">{value}</p>
      <p className="text-[11px] sm:text-xs text-[#A9B3C7] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending_payment': return 'bg-[#F59E0B] text-white';
    case 'payment_received': return 'bg-[#3B82F6] text-white';
    case 'processing': return 'bg-[#8B5CF6] text-white';
    case 'finalised': return 'bg-[#1D4ED8] text-white';
    case 'shipped': return 'bg-[#2ED1B4] text-white';
    case 'delivered': return 'bg-[#22C55E] text-white';
    case 'cancelled': return 'bg-[#EF4444] text-white';
    case 'refunded': return 'bg-[#6B7280] text-white';
    default: return 'bg-[#A9B3C7] text-white';
  }
}

// ============================================
// AFFILIATES SECTION
// ============================================
// NOTE: This section is currently unreachable from the UI — the "Affiliates"
// nav entry is commented out (see `navItems` near the top of this file)
// because promoters are now rewarded with reward points (100 pts per order)
// instead of a $ commission, so the commission/store-credit admin workflow
// is not in active use.
//
// The component, helpers and DB-layer functions are intentionally kept in
// place so that re-enabling the panel is a one-line change: just uncomment
// the `affiliates` entry in `navItems` and the `{activeTab === 'affiliates'
// && <AffiliatesSection />}` line in the route table.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AffiliatesSection() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [affOrders, setAffOrders] = useState<(AffiliateOrder & { promoter_name?: string; promoter_code?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'promoters' | 'orders'>('promoters');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', referral_code: '', commission_percent: '10', customer_discount_percent: '10' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  // Adjust credit
  const [creditPromoId, setCreditPromoId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDesc, setCreditDesc] = useState('');

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [p, o] = await Promise.all([getAllPromoters(), getAllAffiliateOrders()]);
    setPromoters(p);
    setAffOrders(o);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    setCreateError('');
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.referral_code.trim()) {
      setCreateError('Name, email, and referral code are required');
      return;
    }
    setCreateLoading(true);
    const result = await createPromoter({
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      referral_code: createForm.referral_code.trim(),
      commission_percent: Number(createForm.commission_percent) || 10,
      customer_discount_percent: Number(createForm.customer_discount_percent) || 10,
    });
    setCreateLoading(false);
    if (!result.ok) {
      setCreateError(result.error || 'Failed to create promoter');
      return;
    }
    setShowCreate(false);
    setCreateForm({ name: '', email: '', referral_code: '', commission_percent: '10', customer_discount_percent: '10' });
    loadData();
  };

  const handleSaveEdit = async (id: string) => {
    const updates: Record<string, unknown> = {};
    if (editForm.name) updates.name = editForm.name;
    if (editForm.email) updates.email = editForm.email;
    if (editForm.commission_percent) updates.commission_percent = Number(editForm.commission_percent);
    if (editForm.customer_discount_percent) updates.customer_discount_percent = Number(editForm.customer_discount_percent);
    if (editForm.is_active !== undefined) updates.is_active = editForm.is_active === 'true';
    await updatePromoter(id, updates);
    setEditId(null);
    setEditForm({});
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promoter? This cannot be undone.')) return;
    await deletePromoter(id);
    loadData();
  };

  const handleAdjustCredit = async () => {
    if (!creditPromoId || !creditAmount) return;
    await adjustStoreCredit(creditPromoId, Number(creditAmount), creditDesc || 'Admin adjustment');
    setCreditPromoId(null);
    setCreditAmount('');
    setCreditDesc('');
    loadData();
  };

  const handleCreditOrder = async (orderId: string) => {
    const result = await creditAffiliateCommission(orderId);
    if (result.ok) loadData();
    else alert(result.error || 'Failed to credit');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filtered = promoters.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.referral_code.toLowerCase().includes(search.toLowerCase())
  );

  const totalCommission = promoters.reduce((s, p) => s + Number(p.total_commission || 0), 0);
  const totalSales = promoters.reduce((s, p) => s + Number(p.total_sales || 0), 0);
  const activePromoters = promoters.filter(p => p.is_active).length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} value={promoters.length.toString()} label="Total Promoters" color="#8B5CF6" />
        <StatCard icon={CheckCircle} value={activePromoters.toString()} label="Active" color="#22C55E" />
        <StatCard icon={DollarSign} value={`$${totalSales.toFixed(0)}`} label="Total Sales" color="#2ED1B4" />
        <StatCard icon={CreditCard} value={`$${totalCommission.toFixed(0)}`} label="Total Commission" color="#F59E0B" />
      </div>

      {/* View Tabs + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setView('promoters')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${view === 'promoters' ? 'bg-[rgba(46,209,180,0.15)] text-[#2ED1B4]' : 'bg-[rgba(244,246,250,0.05)] text-[#A9B3C7] hover:text-[#F4F6FA]'}`}
          >
            Promoters
          </button>
          <button
            onClick={() => setView('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${view === 'orders' ? 'bg-[rgba(46,209,180,0.15)] text-[#2ED1B4]' : 'bg-[rgba(244,246,250,0.05)] text-[#A9B3C7] hover:text-[#F4F6FA]'}`}
          >
            Referral Orders
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A9B3C7]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] text-xs text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] w-40 sm:w-56"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22C55E] text-[#070A12] text-xs font-semibold hover:bg-[#16A34A] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Promoter
          </button>
        </div>
      </div>

      {/* Create Promoter Modal */}
      {showCreate && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.9)] border border-[rgba(34,197,94,0.3)]">
          <h3 className="text-sm font-semibold text-[#F4F6FA] mb-3">New Promoter</h3>
          {createError && (
            <p className="text-xs text-[#EF4444] mb-2 p-2 rounded-lg bg-[rgba(239,68,68,0.1)]">{createError}</p>
          )}
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <input
              value={createForm.name}
              onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Name"
              className="px-3 py-2.5 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4]"
            />
            <input
              value={createForm.email}
              onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              type="email"
              className="px-3 py-2.5 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4]"
            />
            <input
              value={createForm.referral_code}
              onChange={e => setCreateForm(f => ({ ...f, referral_code: e.target.value.toUpperCase() }))}
              placeholder="Referral Code (e.g. MIKE10)"
              className="px-3 py-2.5 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] uppercase"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#A9B3C7] block mb-1">Commission %</label>
                <input
                  value={createForm.commission_percent}
                  onChange={e => setCreateForm(f => ({ ...f, commission_percent: e.target.value }))}
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2.5 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#2ED1B4]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#A9B3C7] block mb-1">Customer Discount %</label>
                <input
                  value={createForm.customer_discount_percent}
                  onChange={e => setCreateForm(f => ({ ...f, customer_discount_percent: e.target.value }))}
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2.5 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#2ED1B4]"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createLoading}
              className="px-6 py-2.5 rounded-xl bg-[#22C55E] text-[#070A12] text-xs font-semibold disabled:opacity-50"
            >
              {createLoading ? 'Creating...' : 'Create Promoter'}
            </button>
            <button onClick={() => { setShowCreate(false); setCreateError(''); }} className="px-4 py-2.5 rounded-xl border border-[rgba(244,246,250,0.15)] text-xs text-[#A9B3C7]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Promoters List */}
      {view === 'promoters' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#A9B3C7]">
              <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm">No promoters found</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              {editId === p.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      value={editForm.name ?? p.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#2ED1B4]"
                      placeholder="Name"
                    />
                    <input
                      value={editForm.commission_percent ?? String(p.commission_percent)}
                      onChange={e => setEditForm(f => ({ ...f, commission_percent: e.target.value }))}
                      type="number"
                      className="px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#2ED1B4]"
                      placeholder="Commission %"
                    />
                    <input
                      value={editForm.customer_discount_percent ?? String(p.customer_discount_percent)}
                      onChange={e => setEditForm(f => ({ ...f, customer_discount_percent: e.target.value }))}
                      type="number"
                      className="px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#2ED1B4]"
                      placeholder="Discount %"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-[#A9B3C7]">
                      <input
                        type="checkbox"
                        checked={(editForm.is_active ?? String(p.is_active)) === 'true'}
                        onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked ? 'true' : 'false' }))}
                        className="w-3.5 h-3.5 accent-[#22C55E]"
                      />
                      Active
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(p.id)} className="px-4 py-1.5 rounded-lg bg-[#22C55E] text-[#070A12] text-xs font-semibold">Save</button>
                    <button onClick={() => { setEditId(null); setEditForm({}); }} className="px-4 py-1.5 rounded-lg border border-[rgba(244,246,250,0.15)] text-xs text-[#A9B3C7]">Cancel</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#F4F6FA]">{p.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.is_active ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(245,158,11,0.15)] text-[#F59E0B]">{p.tier}</span>
                      </div>
                      <p className="text-xs text-[#A9B3C7] truncate">{p.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleCopy(p.referral_code)} className="p-1.5 rounded-lg bg-[rgba(34,197,94,0.1)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] transition-colors" title="Copy code">
                        {copiedCode === p.referral_code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { setEditId(p.id); setEditForm({}); }} className="p-1.5 rounded-lg bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.2)] transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setCreditPromoId(p.id)} className="p-1.5 rounded-lg bg-[rgba(245,158,11,0.1)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.2)] transition-colors" title="Adjust credit">
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-2">
                    <span className="font-mono text-[#22C55E] font-semibold">{p.referral_code}</span>
                    <span className="text-[#A9B3C7]">{p.commission_percent}% commission</span>
                    <span className="text-[#A9B3C7]">{p.customer_discount_percent}% customer discount</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[rgba(7,10,18,0.5)]">
                      <p className="text-sm font-bold text-[#F4F6FA]">{p.total_orders}</p>
                      <p className="text-[10px] text-[#A9B3C7]">Orders</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[rgba(7,10,18,0.5)]">
                      <p className="text-sm font-bold text-[#F4F6FA]">${Number(p.total_sales || 0).toFixed(0)}</p>
                      <p className="text-[10px] text-[#A9B3C7]">Sales</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[rgba(7,10,18,0.5)]">
                      <p className="text-sm font-bold text-[#F59E0B]">${Number(p.total_commission || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-[#A9B3C7]">Earned</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                      <p className="text-sm font-bold text-[#22C55E]">${Number(p.store_credit || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-[#22C55E]">Credit</p>
                    </div>
                  </div>

                  {/* Inline credit adjustment */}
                  {creditPromoId === p.id && (
                    <div className="mt-3 p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(245,158,11,0.2)]">
                      <p className="text-xs font-semibold text-[#F4F6FA] mb-2">Adjust Store Credit</p>
                      <div className="flex gap-2">
                        <input
                          value={creditAmount}
                          onChange={e => setCreditAmount(e.target.value)}
                          type="number"
                          placeholder="Amount (negative to deduct)"
                          className="flex-1 px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#F59E0B]"
                        />
                        <input
                          value={creditDesc}
                          onChange={e => setCreditDesc(e.target.value)}
                          placeholder="Reason"
                          className="flex-1 px-3 py-2 rounded-lg bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] focus:outline-none focus:border-[#F59E0B]"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleAdjustCredit} className="px-4 py-1.5 rounded-lg bg-[#F59E0B] text-[#070A12] text-xs font-semibold">Apply</button>
                        <button onClick={() => { setCreditPromoId(null); setCreditAmount(''); setCreditDesc(''); }} className="px-4 py-1.5 rounded-lg border border-[rgba(244,246,250,0.15)] text-xs text-[#A9B3C7]">Cancel</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Affiliate Orders View */}
      {view === 'orders' && (
        <div className="space-y-3">
          {affOrders.length === 0 ? (
            <div className="text-center py-12 text-[#A9B3C7]">
              <ShoppingCart className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm">No affiliate orders yet</p>
            </div>
          ) : affOrders.map(o => (
            <div key={o.id} className="p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-mono font-semibold text-[#F4F6FA]">{o.order_number}</span>
                  <span className="text-xs text-[#A9B3C7] ml-2">{new Date(o.created_at).toLocaleDateString('en-AU')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    o.status === 'credited' ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' : 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]'
                  }`}>{o.status}</span>
                  {o.status === 'pending' && (
                    <button
                      onClick={() => handleCreditOrder(o.order_id)}
                      className="px-3 py-1 rounded-lg bg-[#22C55E] text-[#070A12] text-[10px] font-semibold hover:bg-[#16A34A] transition-colors"
                    >
                      Credit Now
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#A9B3C7]">
                <span>Promoter: <strong className="text-[#F4F6FA]">{o.promoter_name || '—'}</strong> ({o.promoter_code})</span>
                <span>Customer: {o.customer_email}</span>
                <span>Order: ${Number(o.order_total).toFixed(2)}</span>
                <span className="text-[#22C55E] font-semibold">Commission: ${Number(o.commission_amount).toFixed(2)} ({o.commission_percent}%)</span>
                {o.customer_discount > 0 && (
                  <span className="text-[#8B5CF6]">Customer Discount: ${Number(o.customer_discount).toFixed(2)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}