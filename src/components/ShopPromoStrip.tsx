import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Gift, Tag, MessageCircle, Award, Snowflake } from 'lucide-react';
import LoyaltyProgressBar from '@/components/LoyaltyProgressBar';
import { getSiteSetting, DEFAULT_SUPPORT_LINKS, type SeasonalTheme } from '@/lib/settings';
import { useRewards } from '@/context/RewardsContext';
import { SEASONAL_PROMO_COPY, useSeasonalTheme } from '@/hooks/use-seasonal-theme';

/** Catalog / home community invite with admin approval. */
export const SHOP_TELEGRAM_COMMUNITY = 'https://t.me/+QhHqp9rVqPw2ZGJl';

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

export function SantaHatIcon({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const redId = `sh-red-${uid}`;
  const furId = `sh-fur-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={redId} x1="14" y1="14" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="55%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id={furId} x1="0" y1="40" x2="0" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D1D5DB" />
        </linearGradient>
      </defs>
      <path
        d="M10 46C12 29 25 13 41 12c8-.5 13.5 5 13 14-3.6-3.4-8.6-3-10.6 2.2C41.6 33 45 40 52 46Z"
        fill={`url(#${redId})`}
      />
      <path
        d="M20 30c4-7 10-12 17-14"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.28"
      />
      <rect x="6" y="41" width="52" height="13" rx="6.5" fill={`url(#${furId})`} />
      <circle cx="54" cy="27" r="6.5" fill={`url(#${furId})`} />
    </svg>
  );
}

export function ChristmasGiftIcon({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const boxId = `cg-box-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={boxId} x1="10" y1="26" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      <path d="M32 19c-4-9-15-10-15-3.5 0 4.5 7.5 4.5 15 3.5Z" fill="#EF4444" />
      <path d="M32 19c4-9 15-10 15-3.5 0 4.5-7.5 4.5-15 3.5Z" fill="#DC2626" />
      <rect x="11" y="29" width="42" height="27" rx="3" fill={`url(#${boxId})`} />
      <rect x="8" y="20" width="48" height="11" rx="3" fill="#16A34A" />
      <rect x="28.5" y="20" width="7" height="36" fill="#EF4444" />
      <rect x="8" y="23" width="48" height="5" fill="#EF4444" opacity="0.9" />
      <circle cx="32" cy="19.5" r="3.2" fill="#FCA5A5" />
    </svg>
  );
}

export function ChristmasTreeIcon({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const treeId = `ct-tree-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={treeId} x1="32" y1="10" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      <path d="M32 12 18 30h7L14 44h9L10 56h44L41 44h9L39 30h7Z" fill={`url(#${treeId})`} />
      <rect x="28.5" y="54" width="7" height="6" rx="1" fill="#92400E" />
      <path
        d="m32 3 2.1 4.3 4.7.7-3.4 3.3.8 4.7L32 13.8 27.8 16l.8-4.7-3.4-3.3 4.7-.7Z"
        fill="#FACC15"
      />
      <circle cx="26" cy="34" r="2" fill="#EF4444" />
      <circle cx="38" cy="40" r="2" fill="#FACC15" />
      <circle cx="30" cy="47" r="2" fill="#60A5FA" />
      <circle cx="41" cy="51" r="2" fill="#EF4444" />
      <circle cx="21" cy="51" r="2" fill="#FACC15" />
      <path d="M22 40c6 3 14 3 21-1" stroke="#FDE68A" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function ChristmasStockingIcon({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const redId = `cs-red-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={redId} x1="20" y1="14" x2="44" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      <path
        d="M24 16h20v24c0 9-6 17-16 17-6 0-10-4-10-9 0-4 3-7 6-8.5V16Z"
        fill={`url(#${redId})`}
      />
      <path d="M18.5 48c0 4.5 4 7.5 9 7.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <rect x="21" y="7" width="26" height="11" rx="4" fill="#F4F6FA" />
      <circle cx="44" cy="6.5" r="3.2" fill="#FACC15" />
    </svg>
  );
}

const XMAS_FLAKES = [
  { left: '3%', top: '24%', size: 15 },
  { left: '47%', top: '60%', size: 13 },
  { left: '27%', top: '70%', size: 13 },
  { left: '57%', top: '72%', size: 15 },
  { left: '78%', top: '70%', size: 14 },
  { left: '95%', top: '38%', size: 15 },
];

const XMAS_STARS = [
  { left: '2%', top: '50%', delay: '0s' },
  { left: '18%', top: '12%', delay: '0.8s' },
  { left: '38%', top: '52%', delay: '1.6s' },
  { left: '52%', top: '22%', delay: '0.4s' },
  { left: '66%', top: '58%', delay: '1.2s' },
  { left: '88%', top: '20%', delay: '2s' },
  { left: '97%', top: '66%', delay: '0.6s' },
];

/** Christmas backdrop: hanging string lights, gold sparkles, snowflakes and a snow bank. */
export function ChristmasScene() {
  return (
    <div className="catalog-xmas-scene" aria-hidden="true">
      {XMAS_STARS.map((star) => (
        <span
          key={`${star.left}-${star.top}`}
          className="catalog-xmas-star"
          style={{ left: star.left, top: star.top, animationDelay: star.delay }}
        />
      ))}
      {XMAS_FLAKES.map((flake) => (
        <Snowflake
          key={`${flake.left}-${flake.top}`}
          className="catalog-xmas-scene-flake"
          style={{ left: flake.left, top: flake.top, width: flake.size, height: flake.size }}
          strokeWidth={1.6}
        />
      ))}
      <div className="catalog-xmas-lights" />
      <div className="catalog-xmas-snowbank" />
    </div>
  );
}

/** Background decor for a seasonal promo panel (pumpkin + web or the Christmas scene). */
export function SeasonalStripDecor({ theme }: { theme: SeasonalTheme }) {
  if (theme === 'halloween') {
    return (
      <>
        <div className="catalog-halloween-pumpkin" aria-hidden="true">
          <HalloweenPumpkinIcon className="h-full w-full" />
        </div>
        <div className="catalog-halloween-web" aria-hidden="true" />
      </>
    );
  }

  return <ChristmasScene />;
}

/** Bottom-right seasonal icons (pumpkins or Santa hats). */
export function SeasonalCornerIcons({ theme }: { theme: SeasonalTheme }) {
  const Icon = theme === 'halloween' ? HalloweenPumpkinIcon : SantaHatIcon;
  return (
    <div className="catalog-halloween-jacks" aria-hidden="true">
      <span className="catalog-halloween-jack catalog-halloween-jack--a">
        <Icon className="h-full w-full" />
      </span>
      <span className="catalog-halloween-jack catalog-halloween-jack--b">
        <Icon className="h-full w-full" />
      </span>
    </div>
  );
}

type ShopPromoStripProps = {
  className?: string;
};

export default function ShopPromoStrip({ className = '' }: ShopPromoStripProps) {
  const { lifetimeSpend, isLoggedIn } = useRewards();
  const theme = useSeasonalTheme();
  const promoCopy = SEASONAL_PROMO_COPY[theme];
  const isChristmas = theme === 'christmas';
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
      {/* Promo chips + Rewards / seasonal treat strip */}
      <div className={`catalog-halloween-strip catalog-season--${theme} mb-3 sm:mb-4`}>
        {/* Drift icon — rotates across the strip like the old promo animation */}
        <div
          className={`catalog-halloween-pumpkin${isChristmas ? ' catalog-xmas-flake' : ''}`}
          aria-hidden="true"
        >
          {isChristmas ? (
            <Snowflake className="w-full h-full text-white" strokeWidth={1.6} />
          ) : (
            <HalloweenPumpkinIcon className="w-full h-full" />
          )}
        </div>

        {/* Promotional Banner - Compact on mobile */}
        <div className="mb-3 sm:mb-4 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0b1e22] via-[#141229] to-[#1e101f] border border-[rgba(244,246,250,0.08)]">
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center sm:text-left">
              {isChristmas ? (
                <ChristmasGiftIcon className="catalog-xmas-chip-icon" />
              ) : (
                <div className="p-1.5 sm:p-2 rounded-full bg-[#134a42] flex-shrink-0">
                  <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2ED1B4]" />
                </div>
              )}
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-[#F4F6FA]">Free Shipping</p>
                <p className="text-[8px] sm:text-xs text-[#A9B3C7]">Over $250</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center sm:text-left">
              {isChristmas ? (
                <ChristmasTreeIcon className="catalog-xmas-chip-icon" />
              ) : (
                <div className="p-1.5 sm:p-2 rounded-full bg-[#2a2050] flex-shrink-0">
                  <Gift className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#8B5CF6]" />
                </div>
              )}
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-[#F4F6FA]">Special Offer</p>
                <p className="text-[8px] sm:text-xs text-[#A9B3C7]">$300 = Free BAC</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center sm:text-left">
              {isChristmas ? (
                <ChristmasStockingIcon className="catalog-xmas-chip-icon" />
              ) : (
                <div className="p-1.5 sm:p-2 rounded-full bg-[#3d1a30] flex-shrink-0">
                  <Tag className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#EC4899]" />
                </div>
              )}
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-[#F4F6FA]">PRICE MATCH</p>
                <p className="text-[8px] sm:text-xs text-[#A9B3C7]">Find it cheaper? We&apos;ll match it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards + seasonal treat — single tap target, no hover states */}
        <Link
          to={isLoggedIn ? '/dashboard#rewards' : '/login?redirect=/dashboard'}
          aria-label={
            isLoggedIn
              ? `PEPLAB Rewards — ${promoCopy.label}, free BAC water on all orders`
              : `Sign in to view PEPLAB Rewards — ${promoCopy.label}, free BAC water on all orders`
          }
          className="catalog-halloween-promo relative block overflow-hidden rounded-xl sm:rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0c0a14] shadow-[0_0_24px_rgba(139,92,246,0.18)] no-underline text-inherit hover:bg-[#0c0a14] hover:opacity-100 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/60"
        >
          {isChristmas ? <ChristmasScene /> : null}
          <SeasonalCornerIcons theme={theme} />

          <div className="grid grid-cols-2 items-start gap-2 sm:gap-4">
            <div className="relative z-10 flex items-center gap-2 sm:gap-3 pl-4 pr-1 pt-6 sm:pl-6 sm:pt-7">
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

            <div className="catalog-halloween-treat relative overflow-hidden pl-1 pr-4 pt-5 pb-0 sm:pr-6 sm:pt-6">
              {isChristmas ? null : <div className="catalog-halloween-web" aria-hidden="true" />}
              <div className="catalog-halloween-copy">
                <p className="catalog-halloween-title">
                  {promoCopy.title}
                  {isChristmas ? <ChristmasGiftIcon className="catalog-xmas-gift" /> : null}
                </p>
                <p className="catalog-halloween-offer">FREE BAC WATER</p>
                <p className="catalog-halloween-note">ON ALL ORDERS</p>
              </div>
            </div>
          </div>

          <div
            className={`relative z-10 block pl-4 pt-3 pr-14 sm:pl-6 sm:pr-20 pointer-events-none ${
              isChristmas ? 'pb-8 sm:pb-10' : 'pb-4 sm:pb-5'
            }`}
          >
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
