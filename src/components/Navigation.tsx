import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LayoutDashboard,
  Award,
  Settings,
  Package,
  TrendingUp,
  Trophy,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRewards } from '@/context/RewardsContext';
import { useAffiliate } from '@/context/AffiliateContext';
import { supabase, getCurrentUser, signOut } from '@/lib/supabase';
import { checkIsAdmin } from '@/lib/supabase-db';
import SearchBar from './SearchBar';
import { HOME_PATH, SHOP_PATH, CALCULATOR_PATH, COA_ARCHIVE_PATH, RESEARCH_PATH, BLOG_PATH } from '@/lib/routes';

type NavigationProps = {
  /** Render inside a parent fixed header (e.g. below announce bar on /landing). */
  embedded?: boolean;
  /** Optional local destination for the brand mark. */
  logoHref?: string;
};

export default function Navigation({ embedded = false, logoHref }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { totalItems, setIsCartOpen } = useCart();
  const { balance } = useRewards();
  const { myPromoter } = useAffiliate();

  useEffect(() => {
    const syncAuthState = async () => {
      const user = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem('peplab_logged_in', 'true');
        const admin = await checkIsAdmin(user.id);
        setIsAdminUser(admin);
        localStorage.setItem('peplab_is_admin', admin ? 'true' : 'false');
      } else {
        setIsLoggedIn(false);
        setIsAdminUser(false);
        localStorage.removeItem('peplab_logged_in');
        localStorage.removeItem('peplab_is_admin');
      }
    };

    syncAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        localStorage.setItem('peplab_logged_in', 'true');
        const admin = await checkIsAdmin(session.user.id);
        setIsAdminUser(admin);
        localStorage.setItem('peplab_is_admin', admin ? 'true' : 'false');
      } else {
        setIsLoggedIn(false);
        setIsAdminUser(false);
        localStorage.removeItem('peplab_logged_in');
        localStorage.removeItem('peplab_is_admin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isAccountOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAccountOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isAccountOpen]);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
    await signOut();
    localStorage.removeItem('peplab_logged_in');
    localStorage.removeItem('peplab_is_admin');
    window.location.href = HOME_PATH;
  };

  const navClassDesktop =
    'text-sm font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300';
  const navClassMobile =
    'block w-full text-left text-lg font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300 py-2';
  const menuItemClass =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.06)] hover:text-[#F4F6FA] transition-colors';

  type NavAnchor = { label: string; href: string };
  const navEntries: ReadonlyArray<NavAnchor> = [
    { label: 'Shop', href: SHOP_PATH },
    { label: 'Research', href: RESEARCH_PATH },
    { label: 'Blog', href: BLOG_PATH },
    { label: 'COA', href: COA_ARCHIVE_PATH },
    { label: 'Calculator', href: CALCULATOR_PATH },
    { label: 'About', href: '/standards' },
    { label: 'Contact', href: '/contact-info' },
  ];

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className={`${embedded ? 'relative w-full' : 'fixed top-0 left-0 right-0'} z-50 transition-all duration-300 ${
          embedded
            ? 'bg-transparent'
            : isScrolled
              ? 'bg-[#070A12] border-b border-[rgba(244,246,250,0.08)]'
              : 'bg-[#070A12]'
        }`}
      >
        <div className={embedded ? 'nl-container' : 'w-full px-4 sm:px-6 lg:px-10 xl:px-12'}>
          <div
            className={`nl-nav-bar flex items-center justify-between gap-4 ${
              embedded ? '' : 'h-16 sm:h-20 lg:h-[5.5rem]'
            }`}
          >
            <a
              href={logoHref ?? HOME_PATH}
              className="flex shrink-0 flex-col items-start"
              aria-label="PEPLAB Australia home"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span
                className={`font-bold tracking-[0.12em] gradient-text leading-none ${
                  embedded ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-2xl sm:text-3xl lg:text-4xl'
                }`}
              >
                PEPLAB
              </span>
              <span
                className={`nl-nav-tagline font-mono uppercase text-[#8B5CF6] mt-0.5 ${
                  embedded
                    ? 'text-[9px] sm:text-[10px] tracking-[0.35em]'
                    : 'text-[9px] sm:text-[10px] lg:text-xs tracking-[0.4em] sm:tracking-[0.45em]'
                }`}
              >
                PEPTIDES AUSTRALIA
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navEntries.map((entry) => (
                <a key={entry.label} href={entry.href} className={navClassDesktop}>
                  {entry.label}
                </a>
              ))}
            </div>

            {/* Right Side — cart + account only */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {!isLoggedIn && (
                <a
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.25)] transition-colors duration-300"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </a>
              )}

              {isLoggedIn && (
                <div className="relative hidden sm:block" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => setIsAccountOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(244,246,250,0.12)] bg-[rgba(244,246,250,0.04)] px-3 py-2 text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.08)] transition-colors"
                    aria-expanded={isAccountOpen}
                    aria-haspopup="menu"
                  >
                    <User className="w-4 h-4 text-[#A78BFA]" />
                    <span className="text-sm font-medium tabular-nums text-[#A78BFA]">
                      {balance.toLocaleString()}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#A9B3C7] transition-transform ${
                        isAccountOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isAccountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[rgba(244,246,250,0.1)] bg-[#111827] p-1.5 shadow-xl shadow-black/40"
                    >
                      <div className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#6B7280]">
                        <Award className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>
                          <span className="font-semibold text-[#A78BFA]">
                            {balance.toLocaleString()}
                          </span>{' '}
                          reward points
                        </span>
                      </div>
                      <div className="my-1 h-px bg-[rgba(244,246,250,0.08)]" />
                      <a
                        href="/dashboard"
                        className={menuItemClass}
                        role="menuitem"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#2ED1B4]" />
                        Dashboard
                      </a>
                      {myPromoter && (
                        <a
                          href="/promoter"
                          className={menuItemClass}
                          role="menuitem"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                          Promoter
                        </a>
                      )}
                      {isAdminUser && (
                        <a
                          href="/admin/dashboard"
                          className={menuItemClass}
                          role="menuitem"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-[#EF4444]" />
                          Admin
                        </a>
                      )}
                      <a
                        href="/settings"
                        className={menuItemClass}
                        role="menuitem"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </a>
                      <a
                        href="/track-order"
                        className={menuItemClass}
                        role="menuitem"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        Track order
                      </a>
                      <a
                        href="/leaderboard"
                        className={menuItemClass}
                        role="menuitem"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <Trophy className="w-4 h-4 text-amber-300" />
                        Leaderboard
                      </a>
                      <div className="my-1 h-px bg-[rgba(244,246,250,0.08)]" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`${menuItemClass} hover:text-[#EF4444]`}
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-6 h-6 text-[#F4F6FA]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2ED1B4] px-1 text-[11px] font-bold text-[#070A12]">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#F4F6FA]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#F4F6FA]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-[#070A12] border-b border-[rgba(244,246,250,0.08)] transition-all duration-300 ${
            isMobileMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="px-6 py-6 space-y-1">
            {isLoggedIn && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] w-fit">
                <Award className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-sm font-medium text-[#8B5CF6]">
                  {balance.toLocaleString()} pts
                </span>
              </div>
            )}

            {navEntries.map((entry) => (
              <a
                key={entry.label}
                href={entry.href}
                className={navClassMobile}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {entry.label}
              </a>
            ))}

            <div className="my-3 h-px bg-[rgba(244,246,250,0.08)]" />

            <a
              href="/track-order"
              className="flex items-center gap-2 text-base font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="w-5 h-5" />
              Track Order
            </a>
            <a
              href="/leaderboard"
              className="flex items-center gap-2 text-base font-medium text-amber-300 hover:text-amber-200 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </a>

            {isLoggedIn ? (
              <>
                {myPromoter && (
                  <a
                    href="/promoter"
                    className="flex items-center gap-2 text-base font-medium text-[#22C55E] hover:text-[#4ADE80] transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Promoter
                  </a>
                )}
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 text-base font-medium text-[#2ED1B4] hover:text-[#5EEAD4] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </a>
                {isAdminUser && (
                  <a
                    href="/admin/dashboard"
                    className="flex items-center gap-2 text-base font-medium text-[#EF4444] hover:text-[#F87171] transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Admin
                  </a>
                )}
                <a
                  href="/settings"
                  className="flex items-center gap-2 text-base font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-base font-medium text-[#A9B3C7] hover:text-[#EF4444] transition-colors py-2"
                >
                  <LogOut className="w-5 h-5" />
                  Log out
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-2 text-base font-medium text-[#8B5CF6] hover:text-[#A78BFA] transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                Login
              </a>
            )}
          </div>
        </div>
      </nav>

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
