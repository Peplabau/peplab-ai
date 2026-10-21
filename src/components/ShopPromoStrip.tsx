import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Gift, Tag, MessageCircle, Award } from 'lucide-react';
import LoyaltyProgressBar from '@/components/LoyaltyProgressBar';
import { getSiteSetting, DEFAULT_SUPPORT_LINKS } from '@/lib/settings';
import { useRewards } from '@/context/RewardsContext';

/** Catalog / home community invite with admin approval. */
export const SHOP_TELEGRAM_COMMUNITY = 'https://t.me/+lG6-bsBkKD0xMzY9';

/** Pumpkin mark for the Halloween Treat banner and the drifting promo pumpkin. */
export function HalloweenPumpkinIcon({ className }: { className?: string }) {
  // Gradient/filter ids must stay unique — the icon renders several times per page.
  const uid = useId().replace(/:/g, '');
  const bodyId = `pk-body-${uid}`;
  const stemId = `pk-stem-${uid}`;
  const faceId = `pk-face-${uid}`;
  const glowId = `pk-glow-${uid}`;
  const carveId = `pk-carve-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bodyId} cx="38%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="45%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#B03C06" />
        </radialGradient>
        <linearGradient id={stemId} x1="29" y1="9" x2="35" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <radialGradient id={faceId} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#FACC15" />
        </radialGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <g id={carveId}>
          <path d="M19.5 29.5 27 30.5 22.8 37.5Z" />
          <path d="M44.5 29.5 37 30.5 41.2 37.5Z" />
          <path d="M32 33.5 34.8 38.2 29.2 38.2Z" />
          <path d="M20.5 41.5c1.3-.3 2.6-.2 3.9.2l1.1 2.6 2.5-2.2c2.7-.3 5.3-.3 8 0l2.5 2.2 1.1-2.6c1.3-.4 2.6-.5 3.9-.2-2.4 6.4-7 9.6-11.5 9.6s-9.1-3.2-11.5-9.6Z" />
        </g>
      </defs>

      <path
        d="M29.6 21.4c-.8-4.1.2-8.3 2.6-10.7 1.5 1 2.3 2.7 2.3 4.7 0 2.2-.6 4.2-.6 6.2Z"
        fill={`url(#${stemId})`}
      />
      <path
        d="M31.7 11.6c-.6 3-.8 6.3-.6 9.3"
        stroke="#14532D"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.5"
      />

      <ellipse cx="32" cy="39" rx="24" ry="19.5" fill={`url(#${bodyId})`} />
      <ellipse cx="19.5" cy="39" rx="8" ry="17.5" fill="#EA580C" opacity="0.28" />
      <ellipse cx="44.5" cy="39" rx="8" ry="17.5" fill="#FDBA74" opacity="0.18" />
      <path
        d="M21.5 22.6C17.6 27.6 16 33.1 16 39c0 5.7 1.5 11 5 15.9"
        stroke="#B03C06"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M42.5 22.6C46.4 27.6 48 33.1 48 39c0 5.7-1.5 11-5 15.9"
        stroke="#B03C06"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />
      <ellipse
        cx="23"
        cy="28"
        rx="6.5"
        ry="3.8"
        fill="#FFFFFF"
        opacity="0.22"
        transform="rotate(-22 23 28)"
      />

      <use href={`#${carveId}`} fill="#FDE047" opacity="0.9" filter={`url(#${glowId})`} />
      <use href={`#${carveId}`} fill={`url(#${faceId})`} />
    </svg>
  );
}

type ShopPromoStripProps = {
  className?: string;
};

export default function ShopPromoStrip({ className = '' }: ShopPromoStripProps) {
  const { lifetimeSpend, isLoggedIn } = useRewards();
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_SUPPORT_LINKS.whatsapp_link);

  useEffect(() => {
    let cancelled = false;
    getSiteSetting('whatsapp_link', { url: DEFAULT_SUPPORT_LINKS.whatsapp_link })
      .then((whatsapp) => {
        if (!cancelled) {
          const url = (whatsapp as { url?: string } | null)?.url || '';
          setWhatsappLink(url);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={className || undefined}>
      {/* Promo chips + Rewards / Halloween Treat strip */}
      <div className="catalog-halloween-strip mb-3 sm:mb-4">
        {/* Drift pumpkin — rotates across the strip like the old promo animation */}
        <div className="catalog-halloween-pumpkin" aria-hidden="true">
          <HalloweenPumpkinIcon className="w-full h-full" />
        </div>

        {/* Promotional Banner - Compact on mobile */}
        <div className="mb-3 sm:mb-4 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0b1e22] via-[#141229] to-[#1e101f] border border-[rgba(244,246,250,0.08)]">
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center sm:text-left">
              <div className="p-1.5 sm:p-2 rounded-full bg-[#134a42] flex-shrink-0">
                <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2ED1B4]" />
              </div>
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-[#F4F6FA]">Free Shipping</p>
                <p className="text-[8px] sm:text-xs text-[#A9B3C7]">Over $250</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center sm:text-left">
              <div className="p-1.5 sm:p-2 rounded-full bg-[#2a2050] flex-shrink-0">
                <Gift className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-[#F4F6FA]">Special Offer</p>
                <p className="text-[8px] sm:text-xs text-[#A9B3C7]">$300 = Free BAC</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center sm:text-left">
              <div className="p-1.5 sm:p-2 rounded-full bg-[#3d1a30] flex-shrink-0">
                <Tag className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#EC4899]" />
              </div>
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-[#F4F6FA]">PRICE MATCH</p>
                <p className="text-[8px] sm:text-xs text-[#A9B3C7]">Find it cheaper? We&apos;ll match it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards + Halloween Treat — single tap target, no hover states */}
        <Link
          to={isLoggedIn ? '/dashboard#rewards' : '/login?redirect=/dashboard'}
          aria-label={
            isLoggedIn
              ? 'PEPLAB Rewards — Halloween Treat, free BAC water on all orders'
              : 'Sign in to view PEPLAB Rewards — Halloween Treat, free BAC water on all orders'
          }
          className="catalog-halloween-promo relative block overflow-hidden rounded-xl sm:rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0c0a14] shadow-[0_0_24px_rgba(139,92,246,0.18)] no-underline text-inherit hover:bg-[#0c0a14] hover:opacity-100 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/60"
        >
          <div className="catalog-halloween-jacks" aria-hidden="true">
            <span className="catalog-halloween-jack catalog-halloween-jack--a">
              <HalloweenPumpkinIcon className="w-full h-full" />
            </span>
            <span className="catalog-halloween-jack catalog-halloween-jack--b">
              <HalloweenPumpkinIcon className="w-full h-full" />
            </span>
          </div>

          <div className="grid grid-cols-2 items-start">
            <div className="relative z-10 flex items-center gap-2 sm:gap-3 px-3 pt-3 sm:px-5 sm:pt-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-[rgba(139,92,246,0.2)] flex-shrink-0">
                <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#A78BFA]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white leading-tight tracking-tight text-[11px] sm:text-base">
                  PEPLAB Rewards
                </p>
                <p className="leading-snug text-[#C8CDD8] text-[8px] sm:text-[11px] mt-0.5">
                  1pt/$1
                </p>
                <p className="leading-snug text-[#C8CDD8] text-[8px] sm:text-[11px]">
                  Store credit back on every order, by tier
                </p>
              </div>
            </div>

            <div className="catalog-halloween-treat relative overflow-hidden px-2 pt-2.5 pb-0 sm:px-4 sm:pt-4">
              <div className="catalog-halloween-web" aria-hidden="true" />
              <div className="catalog-halloween-copy">
                <p className="catalog-halloween-title">HALLOWEEN TREAT</p>
                <p className="catalog-halloween-offer">FREE BAC WATER</p>
                <p className="catalog-halloween-note">ON ALL ORDERS</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 block px-3 pb-3 pt-1 pr-10 sm:px-5 sm:pb-4 sm:pr-14 pointer-events-none">
            <LoyaltyProgressBar
              compact
              hideTitle
              loggedIn={isLoggedIn}
              lifetimeSpend={lifetimeSpend}
              className="w-full"
            />
          </div>
        </Link>
      </div>

      {/* Support chips — forced single row on mobile (no wrap); abbreviated labels below sm */}
      <div className="flex flex-nowrap items-stretch gap-2 sm:gap-3 mb-4 sm:mb-6 w-full">
        <a
          href={SHOP_TELEGRAM_COMMUNITY}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg bg-[#011d2e] border border-[rgba(0,136,204,0.3)] px-2 py-2 sm:px-3 hover:bg-[#022940] hover:border-[rgba(0,136,204,0.5)] transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#0088CC]" />
          <span className="text-[11px] sm:text-xs font-medium text-[#F4F6FA]">
            <span className="sm:hidden">Telegram Community</span>
            <span className="hidden sm:inline">Telegram Community</span>
          </span>
        </a>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg bg-[#0b261d] border border-[rgba(34,197,94,0.3)] px-2 py-2 sm:px-3 hover:bg-[#0e3925] hover:border-[rgba(34,197,94,0.5)] transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#22C55E]" />
            <span className="text-[11px] sm:text-xs font-medium text-[#F4F6FA]">
              <span className="sm:hidden">WhatsApp Support</span>
              <span className="hidden sm:inline">WhatsApp Support</span>
            </span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
