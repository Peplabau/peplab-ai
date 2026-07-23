import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Beaker,
  Clock,
  CreditCard,
  MapPin,
  Shield,
  Truck,
} from 'lucide-react';
import { CONFIG } from '@/lib/config';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/auspost';
import { getSiteSetting, DEFAULT_SUPPORT_LINKS } from '@/lib/settings';
import { HOME_PATH, SHOP_PATH, PROTOCOLS_PATH, CALCULATOR_PATH } from '@/lib/routes';

const HIGHLIGHTS = [
  {
    icon: Beaker,
    iconClass: 'nl-footer-highlight-icon--teal',
    title: 'HPLC-verified',
    description: '≥99% purity on every batch.',
  },
  {
    icon: Shield,
    iconClass: 'nl-footer-highlight-icon--purple',
    title: 'Lab tested',
    description: 'Independent 3rd-party analysis.',
  },
  {
    icon: Truck,
    iconClass: 'nl-footer-highlight-icon--blue',
    title: 'Fast shipping',
    description: `Free express over $${FREE_SHIPPING_THRESHOLD} Australia-wide.`,
  },
  {
    icon: CreditCard,
    iconClass: 'nl-footer-highlight-icon--pink',
    title: 'Secure payment',
    description: 'Encrypted checkout — cards, wallets & crypto.',
  },
] as const;

export default function Footer() {
  const [telegramLink, setTelegramLink] = useState(DEFAULT_SUPPORT_LINKS.telegram_link);
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_SUPPORT_LINKS.whatsapp_link);

  useEffect(() => {
    (async () => {
      try {
        const telegramVal = await getSiteSetting('telegram_link', {
          url: DEFAULT_SUPPORT_LINKS.telegram_link,
        });
        setTelegramLink((telegramVal as { url?: string })?.url || DEFAULT_SUPPORT_LINKS.telegram_link);

        const whatsappVal = await getSiteSetting('whatsapp_link', {
          url: DEFAULT_SUPPORT_LINKS.whatsapp_link,
        });
        setWhatsappLink((whatsappVal as { url?: string })?.url || '');
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  return (
    <footer id="footer" className="nl-footer relative z-10">
      <div className="nl-footer-glow pointer-events-none" aria-hidden />

      <div className="nl-footer-container">
        <div className="nl-footer-highlights">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="nl-footer-highlight">
                <div className={`nl-footer-highlight-icon ${item.iconClass}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="nl-footer-highlight-title">{item.title}</p>
                  <p className="nl-footer-highlight-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="nl-footer-highlights-tag">
          Australian compliant • Lab-grade peptides • Research use only
        </p>

        <div className="nl-footer-disclaimer-box">
          <p className="nl-footer-disclaimer-heading">Research use only</p>
          <p className="nl-footer-disclaimer-text">
            All products sold by PEPLAB are intended strictly for laboratory and research use only. They
            are not medicines, supplements, or therapeutic goods and are not intended for human or animal
            consumption.
          </p>
        </div>

        <div className="nl-footer-grid">
          <div className="nl-footer-brand">
            <Link to={HOME_PATH} className="nl-footer-logo-block">
              <span className="text-2xl font-bold tracking-[0.12em] gradient-text">PEPLAB</span>
              <span className="nl-footer-logo-sub">Peptides Australia</span>
            </Link>
            <p className="nl-footer-tagline">{CONFIG.SITE_DESCRIPTION}</p>
          </div>

          <div className="nl-footer-col">
            <h4 className="nl-footer-col-heading">Shop</h4>
            <ul className="nl-footer-links">
              <li>
                <a href={SHOP_PATH}>All products</a>
              </li>
              <li>
                <Link to={SHOP_PATH}>Best sellers</Link>
              </li>
              <li>
                <Link to={SHOP_PATH}>New arrivals</Link>
              </li>
            </ul>
          </div>

          <div className="nl-footer-col">
            <h4 className="nl-footer-col-heading">Quality</h4>
            <ul className="nl-footer-links">
              <li>
                <Link to="/standards">Our standards</Link>
              </li>
              <li>
                <Link to={PROTOCOLS_PATH}>Dosage chart</Link>
              </li>
              <li>
                <Link to={CALCULATOR_PATH}>Calculator</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
            </ul>
          </div>

          <div className="nl-footer-col">
            <h4 className="nl-footer-col-heading">Support</h4>
            <ul className="nl-footer-links">
              <li>
                <Link to="/track-order">Track order</Link>
              </li>
              <li>
                <Link to="/contact-info">Contact us</Link>
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

          <div className="nl-footer-col">
            <h4 className="nl-footer-col-heading">Business details</h4>
            <ul className="nl-footer-contact-detail">
              <li>
                <MapPin className="w-4 h-4 shrink-0 text-[#2ED1B4]" aria-hidden />
                <div>
                  <span className="nl-footer-contact-label">Registered address</span>
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
                <Clock className="w-4 h-4 shrink-0 text-[#2ED1B4]" aria-hidden />
                <div>
                  <span className="nl-footer-contact-label">Business hours</span>
                  <span className="nl-footer-contact-text">{CONFIG.BUSINESS.BUSINESS_HOURS}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="nl-footer-col">
            <h4 className="nl-footer-col-heading">Legal policies</h4>
            <ul className="nl-footer-links">
              <li>
                <Link to="/shipping">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/refund">Return & Refund Policy</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/legal">Legal & compliance</Link>
              </li>
              <li>
                <Link to="/rewards-terms">Rewards terms</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="nl-footer-bottom">
          <div className="nl-footer-bottom-inner">
            <div className="nl-footer-bottom-brand">
              <span className="text-xl font-bold tracking-[0.12em] gradient-text">PEPLAB</span>
              <span className="nl-footer-logo-sub">Peptides Australia</span>
            </div>
            <p className="nl-footer-bottom-notice">
              For research use only. Not for human consumption. All products are intended for laboratory
              research purposes only.
            </p>
            <p className="nl-footer-bottom-copy">
              © {new Date().getFullYear()} PEPLAB. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
