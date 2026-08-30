import { useEffect, useState } from 'react';
import { Menu, Package, Trophy, User, X } from 'lucide-react';
import { shopPageUrl, shopUrl } from '@/lib/site';

const navClassDesktop =
  'text-sm font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300';
const navClassMobile =
  'block w-full text-left text-lg font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300 py-2';

export default function LandingNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navEntries = [
    { label: 'Shop', href: shopPageUrl() },
    { label: 'Protocols', href: shopUrl('/protocols') },
    { label: 'COA', href: shopUrl('/coa') },
    { label: 'Calculator', href: shopUrl('/calculator') },
    { label: 'About', href: shopUrl('/standards') },
    { label: 'Contact', href: shopUrl('/contact-info') },
  ] as const;

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#070A12] border-b border-[rgba(244,246,250,0.08)]' : 'bg-[#070A12]'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="nl-nav-bar flex items-center justify-between h-16 sm:h-20 lg:h-24">
          <a href="/" className="flex flex-col items-start" aria-label="PEPLAB landing home">
            <span className="font-bold tracking-[0.12em] gradient-text leading-none text-3xl sm:text-4xl lg:text-5xl">
              PEPLAB
            </span>
            <span className="nl-nav-tagline font-mono uppercase text-[#8B5CF6] mt-0.5 text-[10px] sm:text-xs lg:text-sm tracking-[0.45em] sm:tracking-[0.5em]">
              PEPTIDES AUSTRALIA
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-10">
            {navEntries.map((entry) => (
              <a key={entry.label} href={entry.href} className={navClassDesktop}>
                {entry.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={shopUrl('/leaderboard')}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
              title="Promoter Leaderboard"
            >
              <Trophy className="w-5 h-5 text-amber-300" />
            </a>
            <a
              href={shopUrl('/track-order')}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors duration-300"
              title="Track Order"
            >
              <Package className="w-5 h-5 text-[#F4F6FA]" />
            </a>
            <a
              href={shopUrl('/login')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.25)] transition-colors duration-300"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Login</span>
            </a>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
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

      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-[#070A12] border-b border-[rgba(244,246,250,0.08)] transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-6 py-6 space-y-4">
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
          <a
            href={shopUrl('/track-order')}
            className="flex items-center gap-2 text-lg font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors duration-300 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Package className="w-5 h-5" />
            Track Order
          </a>
          <a
            href={shopUrl('/leaderboard')}
            className="flex items-center gap-2 text-lg font-medium text-amber-300 hover:text-amber-200 transition-colors duration-300 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </a>
          <a
            href={shopUrl('/login')}
            className="flex items-center gap-2 text-lg font-medium text-[#8B5CF6] hover:text-[#A78BFA] transition-colors duration-300 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <User className="w-5 h-5" />
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}
