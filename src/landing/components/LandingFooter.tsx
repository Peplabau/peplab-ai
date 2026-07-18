import {
  ArrowRight,
  Beaker,
  Clock,
  CreditCard,
  MapPin,
  Shield,
  Truck,
  Zap,
} from 'lucide-react';
import { CONFIG } from '@/landing/lib/config';
import { FREE_SHIPPING_THRESHOLD } from '@/landing/lib/auspost';
import { DEFAULT_SUPPORT_LINKS } from '@/landing/lib/settings';
import { LANDING_SITE_URL, shopUrl, coaArchiveUrl, shopPageUrl } from '@/landing/lib/site';

const HIGHLIGHTS = [
  {
    icon: Beaker,
    iconClass: 'rg-footer-highlight-icon--purple',
    title: 'HPLC-verified',
    description: '≥99% purity on every batch.',
  },
  {
    icon: Shield,
    iconClass: 'rg-footer-highlight-icon--pink',
    title: 'Lab tested',
    description: 'Independent 3rd-party analysis.',
  },
  {
    icon: Truck,
    iconClass: 'rg-footer-highlight-icon--blue',
    title: 'Fast shipping',
    description: `Free express over $${FREE_SHIPPING_THRESHOLD} Australia-wide.`,
  },
  {
    icon: CreditCard,
    iconClass: 'rg-footer-highlight-icon--violet',
    title: 'Secure payment',
    description: 'Encrypted checkout — cards, wallets & crypto.',
  },
] as const;

type LandingFooterProps = {
  hideCta?: boolean;
};

export default function LandingFooter({ hideCta = false }: LandingFooterProps) {
  const telegramLink = CONFIG.SOCIAL.TELEGRAM || DEFAULT_SUPPORT_LINKS.telegram_link;
  const whatsappLink = DEFAULT_SUPPORT_LINKS.whatsapp_link;

  return (
    <footer id="footer" className="rg-footer">
      <div className="rg-cta-grid" aria-hidden />
      <div className="rg-cta-glow" aria-hidden />
      <div className="rg-footer-glow" aria-hidden />
      <div className="rg-footer-grid-bg" aria-hidden />

      <div className="rg-container">
        {!hideCta && (
          <>
            <div className="rg-cta-inner rg-footer-cta">
              <p className="rg-cta-badge">
                <span className="rg-hero-badge-dot" aria-hidden />
                Ready to order
              </p>
              <h2 className="rg-cta-title">
                Verify before you order.
                <br />
                <span className="rg-hero-accent">Every. Single. Batch.</span>
              </h2>
              <p className="rg-cta-lead">
                Every COA is public. Every order ships with the batch number you can audit. No guessing. No
                generic certificates.
              </p>
              <div className="rg-hero-actions rg-hero-actions--center">
                <a href={shopPageUrl()} className="rg-btn rg-btn--primary">
                  Browse research materials
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a href={coaArchiveUrl()} className="rg-btn rg-btn--outline">
                  Review the evidence first
                </a>
              </div>
              <p className="rg-cta-trust">
                Secure checkout · Card · Apple Pay · Google Pay · Crypto · Dispatched from Australia
              </p>
            </div>
            <div className="rg-footer-divider" aria-hidden />
          </>
        )}

        <div className="rg-footer-highlights">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rg-footer-highlight">
                <div className={`rg-footer-highlight-icon ${item.iconClass}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="rg-footer-highlight-title">{item.title}</p>
                  <p className="rg-footer-highlight-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="rg-footer-trust">
          Australian compliant • Lab-grade peptides • Research use only
        </p>

        <div className="rg-footer-ruo">
          <p className="rg-footer-ruo-title">Research use only</p>
          <p className="rg-footer-ruo-text">
            All products sold by PEPLAB are intended strictly for laboratory and research use only. They
            are not medicines, supplements, or therapeutic goods and are not intended for human or animal
            consumption.
          </p>
        </div>

        <div className="rg-footer-grid">
          <div className="rg-footer-brand">
            <a href={LANDING_SITE_URL} className="rg-footer-logo">
              <span className="text-2xl font-bold tracking-[0.12em] gradient-text">PEPLAB</span>
            </a>
            <p className="rg-footer-logo-sub">Peptides Australia</p>
            <p className="rg-footer-tagline">{CONFIG.SITE_DESCRIPTION}</p>
            <p className="rg-footer-promo">
              <Zap className="w-3.5 h-3.5 text-[#EC4899]" strokeWidth={2} aria-hidden />
              10% off crypto checkout
            </p>
          </div>

          <div className="rg-footer-col">
            <h4 className="rg-footer-col-heading">Shop</h4>
            <ul className="rg-footer-links">
              <li>
                <a href={shopPageUrl()}>All products</a>
              </li>
              <li>
                <a href={shopPageUrl()}>Best sellers</a>
              </li>
              <li>
                <a href={shopPageUrl()}>New arrivals</a>
              </li>
            </ul>
          </div>

          <div className="rg-footer-col">
            <h4 className="rg-footer-col-heading">Quality</h4>
            <ul className="rg-footer-links">
              <li>
                <a href={shopUrl('/standards')}>Our standards</a>
              </li>
              <li>
                <a href={`${shopUrl('/')}#tutorial`}>Reconstitution guide</a>
              </li>
              <li>
                <a href={shopUrl('/faq')}>FAQ</a>
              </li>
            </ul>
          </div>

          <div className="rg-footer-col">
            <h4 className="rg-footer-col-heading">Support</h4>
            <ul className="rg-footer-links">
              <li>
                <a href={shopUrl('/track-order')}>Track order</a>
              </li>
              <li>
                <a href={shopUrl('/contact-info')}>Contact us</a>
              </li>
              <li>
                <a href={telegramLink} target="_blank" rel="noopener noreferrer">
                  Telegram support
                </a>
              </li>
              {whatsappLink ? (
                <li>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    WhatsApp support
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rg-footer-col">
            <h4 className="rg-footer-col-heading">Business details</h4>
            <ul className="rg-footer-contact-detail">
              <li>
                <MapPin className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
                <div>
                  <span className="rg-footer-contact-label">Registered address</span>
                  <address>
                    {CONFIG.BUSINESS.ADDRESS_LINES.map((line, i) => (
                      <span key={line}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              </li>
              <li>
                <Clock className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
                <div>
                  <span className="rg-footer-contact-label">Business hours</span>
                  <span className="rg-footer-contact-text">{CONFIG.BUSINESS.BUSINESS_HOURS}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="rg-footer-col">
            <h4 className="rg-footer-col-heading">Legal policies</h4>
            <ul className="rg-footer-links">
              <li>
                <a href={shopUrl('/shipping')}>Shipping Policy</a>
              </li>
              <li>
                <a href={shopUrl('/refund')}>Return & Refund Policy</a>
              </li>
              <li>
                <a href={shopUrl('/privacy')}>Privacy Policy</a>
              </li>
              <li>
                <a href={shopUrl('/terms')}>Terms of Service</a>
              </li>
              <li>
                <a href={shopUrl('/legal')}>Legal & compliance</a>
              </li>
              <li>
                <a href={shopUrl('/rewards-terms')}>Rewards terms</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="rg-footer-meta">
          <p className="rg-footer-meta-copy">
            © {new Date().getFullYear()} PEPLAB. All rights reserved. · Research use only ·{' '}
            <a href={shopPageUrl()} className="rg-footer-domain-link">
              peplab.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
