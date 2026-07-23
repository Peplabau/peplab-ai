import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LayoutDashboard, Award, Settings, Search, Package, TrendingUp, Trophy } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRewards } from '@/context/RewardsContext';
import { useAffiliate } from '@/context/AffiliateContext';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { checkIsAdmin } from '@/lib/supabase-db';
import SearchBar from './SearchBar';
import { HOME_PATH, SHOP_PATH, CALCULATOR_PATH, COA_ARCHIVE_PATH, PROTOCOLS_PATH } from '@/lib/routes';

type NavigationProps = {
  /** Render inside a parent fixed header (e.g. below announce bar on /landing). */
  embedded?: boolean;
};

export default function Navigation({ embedded = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { balance } = useRewards();
  const { myPromoter } = useAffiliate();

  // Check login + admin state — read from Supabase session directly
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

    // Re-sync whenever auth changes (login / logout in another tab etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

  const navClassDesktop =
    'text-sm font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300';
  const navClassMobile =
    'block w-full text-left text-lg font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300 py-2';

  type NavAnchor = { label: string; href: string };
  /** Crawlable anchors where possible; Google sitelinks are still automated. */
  const navEntries: ReadonlyArray<NavAnchor> = [
    { label: 'Shop', href: SHOP_PATH },
    { label: 'Protocols', href: PROTOCOLS_PATH },
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
        <div className={embedded ? 'nl-container' : 'w-full px-4 sm:px-6 lg:px-12'}>
          <div className={`nl-nav-bar flex items-center justify-between ${embedded ? '' : 'h-16 sm:h-20 lg:h-24'}`}>
            <a href={HOME_PATH} className="flex flex-col items-start" onClick={() => setIsMobileMenuOpen(false)}>
              <span className={`font-bold tracking-[0.12em] gradient-text leading-none ${embedded ? 'text-xl sm:text-2xl lg:text-4xl' : 'text-3xl sm:text-4xl lg:text-5xl'}`}>
                PEPLAB
              </span>
              <span className={`nl-nav-tagline font-mono uppercase text-[#8B5CF6] mt-0.5 ${embedded ? 'text-[9px] sm:text-[10px] tracking-[0.35em]' : 'text-[10px] sm:text-xs lg:text-sm tracking-[0.45em] sm:tracking-[0.5em]'}`}>
                PEPTIDES AUSTRALIA
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navEntries.map((entry) => (
                <a key={entry.label} href={entry.href} className={navClassDesktop}>
                  {entry.label}
                </a>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Button */}
              {/* <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex p-2.5 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
                title="Search products"
              >
                <Search className="w-5 h-5 text-[#F4F6FA]" />
              </button> */}

              {/* Leaderboard Link - Desktop */}
              <a
                href="/leaderboard"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
                title="Promoter Leaderboard"
              >
                <Trophy className="w-5 h-5 text-amber-300" />
              </a>
              {/* Track Order Link - Desktop */}
              <a
                href="/track-order"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
                title="Track Order"
              >
                <Package className="w-5 h-5 text-[#F4F6FA]" />
              </a>
              {/* Points Display - When Logged In */}
              {isLoggedIn && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]">
                  <Award className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-sm font-medium text-[#8B5CF6]">{balance.toLocaleString()} pts</span>
                </div>
              )}

              {/* Dashboard/Login Button - Desktop */}
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-2">
                  {myPromoter && (
                    <a
                      href="/promoter"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.25)] transition-colors duration-300"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Promoter</span>
                    </a>
                  )}
                  <a
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(46,209,180,0.15)] border border-[rgba(46,209,180,0.3)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.25)] transition-colors duration-300"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(244,246,250,0.08)] border border-[rgba(244,246,250,0.15)] text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.12)] transition-colors duration-300"
                    title="Account Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <a
                  href="/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.25)] transition-colors duration-300"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </a>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 sm:p-3 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
              >
                <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-[#F4F6FA]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#2ED1B4] text-[#070A12] text-xs sm:text-sm font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
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
          <div className="px-6 py-6 space-y-4">
            {/* Points Display - Mobile */}
            {isLoggedIn && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] w-fit">
                <Award className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-sm font-medium text-[#8B5CF6]">{balance.toLocaleString()} pts</span>
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
            
            {/* Mobile Track Order Link — above Leaderboard */}
            <a
              href="/track-order"
              className="flex items-center gap-2 text-lg font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="w-5 h-5" />
              Track Order
            </a>

            {/* Mobile Leaderboard Link */}
            <a
              href="/leaderboard"
              className="flex items-center gap-2 text-lg font-medium text-amber-300 hover:text-amber-200 transition-colors duration-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </a>

            {/* Mobile Login/Dashboard Button */}
            {isLoggedIn ? (
              <>
                {myPromoter && (
                  <a
                    href="/promoter"
                    className="flex items-center gap-2 text-lg font-medium text-[#22C55E] hover:text-[#4ADE80] transition-colors duration-300 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Promoter Dashboard
                  </a>
                )}
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-medium text-[#2ED1B4] hover:text-[#5EEAD4] transition-colors duration-300 py-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-2 text-lg font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300 py-2"
                >
                  <Settings className="w-5 h-5" />
                  Account Settings
                </a>
              </>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-2 text-lg font-medium text-[#8B5CF6] hover:text-[#A78BFA] transition-colors duration-300 py-2"
              >
                <User className="w-5 h-5" />
                Login
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Search Bar Modal */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
