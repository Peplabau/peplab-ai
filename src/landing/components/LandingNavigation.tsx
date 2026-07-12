import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { LANDING_SITE_URL, shopPageUrl } from '@/landing/lib/site';

type LandingNavigationProps = {
  embedded?: boolean;
};

const NAV_LINKS = [
  { label: 'Verification', href: '#verification' },
  { label: 'Process', href: '#process' },
  { label: 'FAQ', href: '#faq' },
] as const;

export default function LandingNavigation({ embedded = false }: LandingNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen, closeMenu]);

  return (
    <nav
      aria-label="Primary navigation"
      className={`nl-nav ${isMobileMenuOpen ? 'nl-nav--menu-open' : ''} ${embedded ? 'relative w-full' : 'fixed top-0 left-0 right-0 z-[500]'}`}
    >
      <div className={embedded ? 'nl-container' : 'w-full px-4 sm:px-6 lg:px-12'}>
        <div className={`nl-nav-bar flex items-center justify-between ${embedded ? '' : 'h-16 sm:h-20'}`}>
          <a
            href={LANDING_SITE_URL}
            className="flex flex-col items-start relative z-[2]"
            onClick={closeMenu}
          >
            <span
              className={`font-bold tracking-[0.12em] gradient-text leading-none ${embedded ? 'text-xl sm:text-2xl lg:text-4xl' : 'text-3xl sm:text-4xl lg:text-5xl'}`}
            >
              PEPLAB
            </span>
            <span
              className={`nl-nav-tagline font-mono uppercase text-[#8B5CF6] mt-0.5 ${embedded ? 'text-[9px] sm:text-[10px] tracking-[0.35em]' : 'text-[10px] sm:text-xs lg:text-sm tracking-[0.45em] sm:tracking-[0.5em]'}`}
            >
              PEPTIDES AUSTRALIA
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href={shopPageUrl()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide uppercase text-white bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 transition-opacity shadow-[0_8px_24px_rgba(139,92,246,0.35)]"
            >
              Shop now
            </a>
          </div>

          <button
            type="button"
            className="nl-nav-menu-btn lg:hidden relative z-[2]"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="nl-mobile-nav-panel"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {portalReady &&
        createPortal(
          <div
            className={`nl-mobile-nav lg:hidden ${isMobileMenuOpen ? 'nl-mobile-nav--open' : ''}`}
            aria-hidden={!isMobileMenuOpen}
          >
            <button
              type="button"
              className="nl-mobile-nav__backdrop"
              aria-label="Close menu"
              tabIndex={isMobileMenuOpen ? 0 : -1}
              onClick={closeMenu}
            />

            <aside
              id="nl-mobile-nav-panel"
              className="nl-mobile-nav__panel"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
            >
              <div className="nl-mobile-nav__head">
                <div>
                  <p className="nl-mobile-nav__eyebrow">Navigation</p>
                  <p className="nl-mobile-nav__brand gradient-text">PEPLAB</p>
                </div>
                <button
                  type="button"
                  className="nl-mobile-nav__close"
                  aria-label="Close menu"
                  onClick={closeMenu}
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <nav className="nl-mobile-nav__links" aria-label="Mobile">
                <ul>
                  {NAV_LINKS.map((item, index) => (
                    <li key={item.href}>
                      <a href={item.href} className="nl-mobile-nav__link" onClick={closeMenu}>
                        <span className="nl-mobile-nav__link-index">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="nl-mobile-nav__link-label">{item.label}</span>
                        <ArrowRight className="nl-mobile-nav__link-arrow" strokeWidth={2} aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="nl-mobile-nav__footer">
                <a href={shopPageUrl()} className="nl-mobile-nav__cta" onClick={closeMenu}>
                  Shop now
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} aria-hidden />
                </a>
                <p className="nl-mobile-nav__note">Research use only · Australia-wide dispatch</p>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </nav>
  );
}
