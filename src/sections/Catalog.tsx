import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, Truck, Gift, Tag, MessageCircle, Award } from 'lucide-react';
import ProductCard, { ProductCardStyles } from '@/components/ProductCard';
import LoyaltyProgressBar from '@/components/LoyaltyProgressBar';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import { loadHomepageProductSales, rankCatalogBySales } from '@/lib/product-sales';
import {
  getResearchCategoryById,
  productMatchesCategory,
  RESEARCH_CATEGORIES,
  type ResearchCategory,
} from '@/lib/research-categories';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS, DEFAULT_SUPPORT_LINKS, DEFAULT_RESEARCH_DISCLAIMER_SETTINGS, type DiscountSettings } from '@/lib/settings';
import { getCache } from '@/lib/cache';
import { preloadProductImages } from '@/lib/product-image';
import type { Product } from '@/products';
import { Skeleton } from '@/components/ui/skeleton';
import ResearchMarquee from '@/components/ResearchMarquee';
import { useRewards } from '@/context/RewardsContext';

gsap.registerPlugin(ScrollTrigger);

const cachedCatalogProducts = getCache<Product[]>('products:all', true);
const cachedCatalogSales = getCache<Record<string, number>>('products:homepage-sales', true);

/** Catalog-only community invite with admin approval (not the site-wide support Telegram setting). */
const CATALOG_TELEGRAM_COMMUNITY = 'https://t.me/+lG6-bsBkKD0xMzY9';

function CatalogCategoryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected: ResearchCategory | undefined = value
    ? getResearchCategoryById(value)
    : undefined;
  const triggerLabel = selected
    ? `${selected.emoji} ${selected.label}`
    : 'All Categories';

  const updateMenuPos = () => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({
      top: r.bottom + 6,
      left: r.left,
      width: Math.max(r.width, 240),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    updateMenuPos();
    const onReposition = () => updateMenuPos();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const itemClass = (active: boolean) =>
    [
      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
      active
        ? 'bg-[#7DD3FC] text-[#0B1220] font-medium'
        : 'text-[#F4F6FA] hover:bg-[#1a2234]',
    ].join(' ');

  const menu =
    open && menuPos
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label="Research category"
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              zIndex: 9999,
            }}
            className="max-h-[min(360px,50vh)] overflow-y-auto rounded-xl border border-[rgba(173,198,230,0.35)] bg-[#111827] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)]"
          >
            <li role="option" aria-selected={!value}>
              <button type="button" className={itemClass(!value)} onClick={() => pick('')}>
                All Categories
              </button>
            </li>
            {RESEARCH_CATEGORIES.map((cat) => {
              const active = value === cat.id;
              return (
                <li key={cat.id} role="option" aria-selected={active}>
                  <button type="button" className={itemClass(active)} onClick={() => pick(cat.id)}>
                    <span className="text-base leading-none" aria-hidden>
                      {cat.emoji}
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative w-[148px] sm:w-[220px] shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-full border border-[rgba(173,198,230,0.4)] bg-[#111827] px-5 py-3 text-sm text-[#F4F6FA] transition-colors hover:border-[rgba(173,198,230,0.65)] focus:outline-none focus-visible:border-[#7DD3FC]"
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#C8D4E8] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {menu}
    </div>
  );
}

/** Pumpkin mark for the Halloween Treat banner and the drifting promo pumpkin. */
function HalloweenPumpkinIcon({ className }: { className?: string }) {
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

export default function Catalog() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRenderIndex = useRef(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const { lifetimeSpend, isLoggedIn } = useRewards();
  const initialProducts = rankCatalogBySales(cachedCatalogProducts ?? [], cachedCatalogSales ?? {});
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>(DEFAULT_DISCOUNT_SETTINGS);
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_SUPPORT_LINKS.whatsapp_link);
  const [researchDisclaimer, setResearchDisclaimer] = useState(DEFAULT_RESEARCH_DISCLAIMER_SETTINGS.message);

  useEffect(() => {
    let cancelled = false;
    if (products.length === 0) {
      setLoading(true);
      setError(null);
    }

    Promise.all([
      loadProductsFromSupabase(),
      loadHomepageProductSales(),
      getSiteSetting('discount_settings', DEFAULT_DISCOUNT_SETTINGS),
      getSiteSetting<{ url: string }>('whatsapp_link', { url: DEFAULT_SUPPORT_LINKS.whatsapp_link }),
      getSiteSetting('research_disclaimer_settings', DEFAULT_RESEARCH_DISCLAIMER_SETTINGS),
    ])
      .then(([data, sales, discount, whatsapp, researchDisclaimerSettings]) => {
        if (!cancelled) {
          setProducts(rankCatalogBySales(data, sales));
          setDiscountSettings(discount);
          setWhatsappLink(whatsapp?.url || '');
          setResearchDisclaimer(
            researchDisclaimerSettings.message?.trim() || DEFAULT_RESEARCH_DISCLAIMER_SETTINGS.message,
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error loading products:', err);
          setError('Failed to load products.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!products.length) return;
    preloadProductImages(products.map((p) => p.image), 6);
  }, [products]);

  useEffect(() => {
    if (loading || products.length === 0) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      const section = sectionRef.current;
      const header = headerRef.current;
      const grid = gridRef.current;
      if (!section || !header || !grid) return;

      const cards = grid.querySelectorAll('.pc');
      if (cards.length === 0) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          header,
          { y: '6vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: header,
              start: 'top 80%',
              end: 'top 55%',
              scrub: true,
            },
          }
        );

        gsap.fromTo(
          cards,
          { y: '10vh', opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: grid,
              start: 'top 85%',
              end: 'top 50%',
              scrub: true,
            },
          }
        );
      }, section);
    };

    const id = requestAnimationFrame(start);

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      ctx?.revert();
    };
  }, [products.length, loading]);

  const selectedCategory = selectedCategoryId
    ? getResearchCategoryById(selectedCategoryId)
    : undefined;

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || productMatchesCategory(product.name, selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const essentials = filteredProducts.filter((p) => p.category === 'essentials');
  const bestSellers = filteredProducts.filter((p) => p.category === 'best-seller');
  const highPopularity = filteredProducts.filter((p) => p.category === 'high-popularity');
  const popular = filteredProducts.filter((p) => p.category === 'popular');
  const otherCategories = filteredProducts.filter(
    (p) => !['best-seller', 'high-popularity', 'popular', 'essentials'].includes(p.category)
  );
  /** Marketing headline count (client: show 60+, not live catalogue total). */
  const shopPeptideHeadlineCount = 60;

  const renderProductCard = (product: Product) => {
    const priority = cardRenderIndex.current < 6;
    cardRenderIndex.current += 1;
    return (
      <ProductCard
        key={product.id}
        product={product}
        discountSettings={discountSettings}
        imagePriority={priority}
      />
    );
  };

  cardRenderIndex.current = 0;

  return (
    <>
    <ProductCardStyles />
    <section
      ref={sectionRef}
      id="catalog"
      className="relative z-60 pt-16 sm:pt-20 lg:pt-24 pb-16 lg:pb-24"
    >
      <div className="relative z-10 px-4 sm:px-6 lg:px-12">
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

          {/* Rewards level bar + Halloween Treat — bar spans full card width */}
          <div className="catalog-halloween-promo relative overflow-hidden rounded-xl sm:rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0c0a14] shadow-[0_0_24px_rgba(139,92,246,0.18)]">
            <div className="catalog-halloween-jacks" aria-hidden="true">
              <span className="catalog-halloween-jack catalog-halloween-jack--a">
                <HalloweenPumpkinIcon className="w-full h-full" />
              </span>
              <span className="catalog-halloween-jack catalog-halloween-jack--b">
                <HalloweenPumpkinIcon className="w-full h-full" />
              </span>
            </div>

            <div className="grid grid-cols-2 items-start">
              <Link
                to={isLoggedIn ? '/dashboard#rewards' : '/login?redirect=/dashboard'}
                className="relative z-10 flex items-center gap-2 sm:gap-3 px-3 pt-3 sm:px-5 sm:pt-4 hover:bg-[rgba(139,92,246,0.06)] transition-colors"
              >
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
              </Link>

              <div
                className="catalog-halloween-treat relative overflow-hidden px-2 pt-2.5 pb-0 sm:px-4 sm:pt-4"
                role="region"
                aria-label="Halloween Treat — Free BAC Water on all orders"
              >
                <div className="catalog-halloween-web" aria-hidden="true" />
                <div className="catalog-halloween-copy">
                  <p className="catalog-halloween-title">HALLOWEEN TREAT</p>
                  <p className="catalog-halloween-offer">FREE BAC WATER</p>
                  <p className="catalog-halloween-note">ON ALL ORDERS</p>
                </div>
              </div>
            </div>

            <Link
              to={isLoggedIn ? '/dashboard#rewards' : '/login?redirect=/dashboard'}
              className="relative z-10 block px-3 pb-3 pt-1 pr-10 sm:px-5 sm:pb-4 sm:pr-14 hover:bg-[rgba(139,92,246,0.04)] transition-colors"
            >
              <LoyaltyProgressBar
                compact
                hideTitle
                loggedIn={isLoggedIn}
                lifetimeSpend={lifetimeSpend}
                className="w-full"
              />
            </Link>
          </div>
        </div>

        {/* Support chips — forced single row on mobile (no wrap); abbreviated labels below sm */}
        <div className="flex flex-nowrap items-stretch gap-2 sm:gap-3 mb-4 sm:mb-6 w-full">
          <a
            href={CATALOG_TELEGRAM_COMMUNITY}
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

        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F6FA]">
            Shop{' '}
            <span className="tabular-nums">{shopPeptideHeadlineCount}+</span>{' '}
            <span className="gradient-text">peptides</span>
          </h1>

          {/* Search + research category filter */}
          <div className="flex flex-row items-center gap-2 sm:gap-3 max-w-2xl">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7] pointer-events-none" />
              <input
                type="text"
                placeholder="Search peptides, e.g. Tirzepatide, BPC-157, GHK-Cu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-[#0d121f] border border-[rgba(244,246,250,0.08)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors"
              />
            </div>
            <CatalogCategoryDropdown
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
            />
          </div>

          {/* Research Disclaimer Banner — infinite marquee */}
          {researchDisclaimer.trim() && (
            <ResearchMarquee
              text={researchDisclaimer}
              className="mt-3 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[#1e1019] py-2"
            />
          )}
        </div>

        {/* Products Grid */}
        <div ref={gridRef} className="space-y-12">
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-[#111827] border border-[rgba(244,246,250,0.08)] overflow-hidden flex flex-col">
                  {/* Square image area — matches ProductCard aspect-ratio: 1/1 */}
                  <div className="p-1.5 sm:p-2.5">
                    <Skeleton className="w-full aspect-square rounded-xl" />
                  </div>
                  {/* Body */}
                  <div className="px-2 pb-2 pt-1 sm:px-3 sm:pb-3 sm:pt-1.5 space-y-2 flex flex-col flex-1">
                    {/* Name */}
                    <Skeleton className="h-3.5 sm:h-5 w-4/5 rounded" />
                    {/* Stars row */}
                    <Skeleton className="h-2.5 sm:h-3 w-1/2 rounded" />
                    {/* Stock + dosage pill */}
                    <Skeleton className="h-7 sm:h-8 w-full rounded-lg" />
                    {/* Price */}
                    <Skeleton className="h-5 sm:h-7 w-1/3 rounded" />
                    {/* CTA button */}
                    <Skeleton className="h-8 sm:h-9 w-full rounded-xl mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="text-center py-16">
              <p className="text-[#EF4444] mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[#2ED1B4] hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#A9B3C7] text-lg">No products available.</p>
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#A9B3C7] text-lg">No products found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId('');
                    }}
                    className="mt-4 text-[#2ED1B4] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : selectedCategory ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl" aria-hidden>
                      {selectedCategory.emoji}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#F4F6FA]">
                      {selectedCategory.label}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(46,209,180,0.12)] text-[#2ED1B4] text-[10px] font-mono uppercase">
                      {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredProducts.map(renderProductCard)}
                  </div>
                </div>
              ) : (
                <>
                  {/* Best Sellers */}
                  {bestSellers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">🔥</span>
                        <h3 className="text-lg sm:text-xl font-bold text-[#F4F6FA]">Best Sellers</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#EF4444] text-[10px] font-mono uppercase">
                          Very High Demand
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {bestSellers.map(renderProductCard)}
                      </div>
                    </div>
                  )}

                  {/* High Popularity */}
                  {highPopularity.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">⭐</span>
                        <h3 className="text-lg sm:text-xl font-bold text-[#F4F6FA]">High Popularity</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#8B5CF6] text-[10px] font-mono uppercase">
                          Trending Now
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {highPopularity.map(renderProductCard)}
                      </div>
                    </div>
                  )}

                  {/* Popular */}
                  {popular.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-[#F4F6FA]">Popular</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.15)] text-[#3B82F6] text-[10px] font-mono uppercase">
                          Research Favourites
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {popular.map(renderProductCard)}
                      </div>
                    </div>
                  )}

                  {/* Essentials */}
                  {essentials.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">🧪</span>
                        <h3 className="text-lg sm:text-xl font-bold text-[#F4F6FA]">Essentials</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[rgba(34,197,94,0.15)] text-[#22C55E] text-[10px] font-mono uppercase">
                          Must Haves
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {essentials.map(renderProductCard)}
                      </div>
                    </div>
                  )}

                  {/* Other categories from DB */}
                  {otherCategories.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-[#F4F6FA]">More Products</h3>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {otherCategories.map(renderProductCard)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
    </>
  );
}
