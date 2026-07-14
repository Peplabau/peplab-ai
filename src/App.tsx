import { Suspense, lazy, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LANDING_PATH } from '@/lib/routes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CartProvider } from '@/context/CartContext';
import { RewardsProvider } from '@/context/RewardsContext';
import { AffiliateProvider } from '@/context/AffiliateContext';
// `DEFAULT_LANDING_PAGE_SETTINGS` was used by the ShopRoute homepage-gate check
// (now commented out below). Import kept out of the tree until re-enabled.
import { getSiteSetting, DEFAULT_AFFILIATE_PROGRAM_SETTINGS } from '@/lib/settings';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import SignupWelcomeModal from '@/components/SignupWelcomeModal';
import { CONFIG } from '@/lib/config';
import { SEO } from '@/components/SEO';
import { SITE_SEO_DESCRIPTION, SITE_SEO_KEYWORDS, SITE_SEO_TITLE } from '@/lib/seo-keywords';
import { isLoginOnlyDomain } from '@/lib/domain';

import Catalog from '@/sections/Catalog';
import BulkSales from '@/sections/BulkSales';
import Quality from '@/sections/Quality';
import Reviews from '@/sections/Reviews';
import LeaderboardTop3 from '@/sections/LeaderboardTop3';
import Footer from '@/sections/Footer';

// Route-level code-splitting: keeps initial bundle smaller (faster deploy + faster first load).
const Contact = lazy(() => import('@/pages/Contact'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Refund = lazy(() => import('@/pages/Refund'));
const Legal = lazy(() => import('@/pages/Legal'));
const Shipping = lazy(() => import('@/pages/Shipping'));
const ContactInfo = lazy(() => import('@/pages/ContactInfo'));
const Standards = lazy(() => import('@/pages/Standards'));
const Login = lazy(() => import('@/pages/Login'));
const LoginGateway = lazy(() => import('@/pages/LoginGateway'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const RewardsTerms = lazy(() => import('@/pages/RewardsTerms'));
const Settings = lazy(() => import('@/pages/Settings'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ProductPage = lazy(() => import('@/pages/Product'));
const PromoterDashboard = lazy(() => import('@/pages/PromoterDashboard'));
const TrackOrder = lazy(() => import('@/pages/TrackOrder'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const Calculator = lazy(() => import('@/pages/Calculator'));
const CoaArchive = lazy(() => import('@/pages/CoaArchive'));
const PeplabLandingRoute = lazy(() => import('@/pages/PeplabLandingRoute'));

gsap.registerPlugin(ScrollTrigger);

/** Inline shell styles — work before Tailwind CSS finishes loading on slow mobile networks. */
const PAGE_SHELL_STYLE = { background: '#070A12', minHeight: '100dvh' } as const;

function HomePage() {
  useEffect(() => {
    // Wait for all ScrollTriggers to be created
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);

      if (!maxScroll || pinned.length === 0) return;

      // Build ranges and snap targets from pinned sections
      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Create global snap
      ScrollTrigger.create({
        snap: {
          snapTo: (value) => {
            // Check if within any pinned range (allow small buffer)
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.02 && value <= r.end + 0.02
            );

            // If not in a pinned section, allow free scroll
            if (!inPinned) return value;

            // Find nearest pinned center
            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );

            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
      <SEO
        title={SITE_SEO_TITLE}
        description={SITE_SEO_DESCRIPTION}
        keywords={SITE_SEO_KEYWORDS}
      />
      <div className="relative min-h-screen page-grid-bg">

        {/* Navigation */}
        <Navigation />

        {/* Cart Drawer */}
        <CartDrawer />

        {/* Main Content */}
        <main className="relative z-10">
        {/* Shop - Catalog */}
        <Catalog />

        {/* Bulk sales / wholesale */}
        <BulkSales />
        
        {/* Quality Section (merged purity/standards/quality/trust) */}
        <Quality />

        {/* Customer reviews */}
        <Reviews />
        
        {/* Promoter Leaderboard — Top 3 podium with CTA to full /leaderboard */}
        <LeaderboardTop3 />

        {/* Footer */}
        <Footer />
      </main>
      </div>
    </>
  );
}

// The homepage / shop is always publicly viewable on peplab.ai.
//
// The `landing_page_settings.enabled` toggle in the admin panel used to gate
// this route (redirecting anonymous visitors to /login when disabled). We
// intentionally bypass that check now — the setting is still writable from
// admin so nothing there breaks, but it no longer affects the storefront.
//
// The original gating logic is preserved below (commented out) so it can be
// restored quickly if the requirement changes.
//
// type ShopRouteGate = 'loading' | 'public' | 'authed' | 'login';
//
// function ShopRouteLoading() {
//   return (
//     <div style={PAGE_SHELL_STYLE} className="flex items-center justify-center">
//       <div className="w-8 h-8 border-2 border-[#2ED1B4] border-t-transparent rounded-full animate-spin" />
//     </div>
//   );
// }
//
// function ShopRoute() {
//   const [gate, setGate] = useState<ShopRouteGate>('loading');
//
//   useEffect(() => {
//     let cancelled = false;
//     const loadGate = async () => {
//       try {
//         const [settings, { data: { session } }] = await Promise.all([
//           getSiteSetting('landing_page_settings', DEFAULT_LANDING_PAGE_SETTINGS),
//           supabase.auth.getSession(),
//         ]);
//         if (cancelled) return;
//
//         const landingEnabled = settings.enabled !== false;
//         const isLoggedIn = Boolean(session?.user);
//
//         if (landingEnabled) {
//           setGate('public');
//         } else if (isLoggedIn) {
//           setGate('authed');
//         } else {
//           setGate('login');
//         }
//       } catch (error) {
//         console.error('Failed to load shop route gate:', error);
//         if (!cancelled) setGate('public');
//       }
//     };
//     loadGate();
//     return () => {
//       cancelled = true;
//     };
//   }, []);
//
//   if (gate === 'loading') return <ShopRouteLoading />;
//   if (gate === 'login') {
//     return <Navigate to={`/login?redirect=${encodeURIComponent(SHOP_PATH)}`} replace />;
//   }
//   return <HomePage />;
// }

function ShopRoute() {
  return <HomePage />;
}

/** Persist referral ref and affiliate code from URL to sessionStorage. */
function PersistReferralRef() {
  const location = useLocation();
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const params = new URLSearchParams(location.search || '');
      const ref = params.get('ref');
      if (ref && /^[0-9a-f-]{36}$/i.test(ref)) {
        try {
          sessionStorage.setItem('peplab_ref', ref);
        } catch (_) {}
      }
      // Affiliate code auto-apply: ?aff=MIKE10 or ?code=MIKE10 (only when program is enabled)
      const affCode = params.get('aff') || params.get('code');
      if (!affCode || !/^[A-Za-z0-9_-]{2,30}$/.test(affCode)) return;
      const program = await getSiteSetting('affiliate_program_settings', DEFAULT_AFFILIATE_PROGRAM_SETTINGS);
      if (cancelled || program.codes_enabled === false) return;
      try {
        sessionStorage.setItem(
          'peplab_affiliate_code',
          JSON.stringify({ code: affCode.toUpperCase(), promotion: null, autoApply: true }),
        );
      } catch (_) {}
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [location.search]);
  return null;
}

/**
 * After a long backgrounded period (e.g. user spent the day on Facebook), the browser's
 * HTTP connections, the Supabase auth client's internal lock queue, and the cached access
 * token can all end up in a degraded state where every Supabase call hangs forever.
 * Symptoms: app stays on a loading skeleton until a manual hard-refresh.
 *
 * The persisted Supabase session in localStorage survives a reload, so the user stays
 * logged in. We use *three* independent detectors because no single one is reliable
 * across all browsers, OSes and window-management setups:
 *
 *   1. visibilitychange — fires on tab switches inside the same window.
 *   2. window focus/blur — fires when switching between OS windows.
 *   3. setInterval heartbeat — browsers throttle or pause timers in background tabs;
 *      a "missed heartbeat" gap is a reliable signal that the tab was sleeping, even
 *      when 1 and 2 don't fire.
 *
 * We deliberately skip the reload on /checkout to avoid wiping a half-filled order form,
 * and skip if a form input is focused so we never destroy data the user is typing.
 */
function StaleTabReloader() {
  useEffect(() => {
    const STALE_RELOAD_MS = 90 * 1000;
    const HEARTBEAT_MS = 15 * 1000;
    let lastSeenAt = Date.now();
    let reloading = false;

    const isUserActivelyEditing = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const isOnSensitiveRoute = () => {
      return window.location.pathname.includes('/checkout');
    };

    const maybeReload = (gap: number) => {
      if (reloading) return;
      if (gap < STALE_RELOAD_MS) return;
      if (isOnSensitiveRoute() || isUserActivelyEditing()) return;
      reloading = true;
      window.location.reload();
    };

    const checkGap = () => {
      const now = Date.now();
      const gap = now - lastSeenAt;
      lastSeenAt = now;
      maybeReload(gap);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkGap();
      else lastSeenAt = Date.now();
    };

    const onFocus = () => checkGap();
    const onPageShow = (e: PageTransitionEvent) => {
      // bfcache restore — also a strong signal the tab was paused
      if (e.persisted) checkGap();
    };

    const interval = window.setInterval(() => {
      const now = Date.now();
      const gap = now - lastSeenAt;
      lastSeenAt = now;
      // Heartbeat catches throttled/paused timers when no visibility/focus event fires.
      if (gap > HEARTBEAT_MS * 2) maybeReload(gap);
    }, HEARTBEAT_MS);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }, [pathname]);

  return null;
}

/**
 * Login-only shell mounted on peplab.com.au (and any host in
 * `VITE_LOGIN_ONLY_HOSTS`).
 *
 * peplab.com.au is under threat of takedown — we deliberately expose the
 * smallest possible surface (auth flow only) and hand successful sessions
 * off to peplab.ai. Every unknown route hard-redirects to /login so no
 * shop content is ever rendered on that host.
 *
 * The `/login` and `/signup` routes render `LoginGateway` — sign-in for
 * returning members and referral-gated sign-up on this host only. After auth,
 * users are handed off to peplab.ai already logged in.
 */
function LoginOnlyApp() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div style={PAGE_SHELL_STYLE} />}>
        <Routes>
          <Route path="/login" element={<LoginGateway />} />
          <Route path="/signup" element={<LoginGateway />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function App() {
  useEffect(() => {
    const el = document.getElementById('app-loading');
    if (!el) return;
    // useEffect fires after the browser has painted the first frame with CSS applied.
    // Fade the overlay out so the styled app is never exposed without computed styles.
    el.style.transition = 'opacity 0.15s ease';
    el.style.opacity = '0';
    const t = setTimeout(() => el.remove(), 200);
    return () => clearTimeout(t);
  }, []);

  // peplab.com.au → serve nothing but the auth flow. See `src/lib/domain.ts`.
  if (isLoginOnlyDomain()) {
    return <LoginOnlyApp />;
  }

  return (
    <CartProvider>
      <RewardsProvider>
        <AffiliateProvider>
        <BrowserRouter>
          <ScrollToTop />
          {CONFIG.FEATURES.ENABLE_SIGNUP_WELCOME_MODAL && <SignupWelcomeModal />}
          <PersistReferralRef />
          <StaleTabReloader />
          <Suspense fallback={<div style={PAGE_SHELL_STYLE} />}>
            <Routes>
              <Route path="/" element={<ShopRoute />} />
              <Route path="/shop" element={<ShopRoute />} />
              <Route path="/landing" element={<PeplabLandingRoute />} />
              <Route path="/new-landing" element={<Navigate to={LANDING_PATH} replace />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/contact-info" element={<ContactInfo />} />
              <Route path="/standards" element={<Standards />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/rewards-terms" element={<RewardsTerms />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/promoter" element={<PromoterDashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/coa" element={<CoaArchive />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </AffiliateProvider>
      </RewardsProvider>
    </CartProvider>
  );
}

export default App;
