import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Search } from 'lucide-react';
import ProductCard, { ProductCardStyles } from '@/components/ProductCard';
import ShopPromoStrip from '@/components/ShopPromoStrip';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import { loadHomepageProductSales, rankCatalogBySales } from '@/lib/product-sales';
import {
  ALL_CATEGORIES_ACCENT,
  ALL_CATEGORIES_ICON,
  getResearchCategoryById,
  productMatchesCategory,
  RESEARCH_CATEGORIES,
  type ResearchCategory,
} from '@/lib/research-categories';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS, DEFAULT_RESEARCH_DISCLAIMER_SETTINGS, type DiscountSettings } from '@/lib/settings';
import { getCache } from '@/lib/cache';
import { preloadProductImages } from '@/lib/product-image';
import type { Product } from '@/products';
import { Skeleton } from '@/components/ui/skeleton';
import ResearchMarquee from '@/components/ResearchMarquee';

gsap.registerPlugin(ScrollTrigger);

const cachedCatalogProducts = getCache<Product[]>('products:all', true);
const cachedCatalogSales = getCache<Record<string, number>>('products:homepage-sales', true);


function CatalogCategoryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    openUp: boolean;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected: ResearchCategory | undefined = value
    ? getResearchCategoryById(value)
    : undefined;
  const TriggerIcon = selected?.icon ?? ALL_CATEGORIES_ICON;
  const triggerAccent = selected?.accent ?? ALL_CATEGORIES_ACCENT;

  const updateMenuPos = () => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const bar = el.closest('.catalog-search')?.getBoundingClientRect();
    const narrow = window.innerWidth < 720;
    const anchor = narrow && bar ? bar : r;
    const width = narrow ? Math.min(anchor.width, window.innerWidth - 24) : r.width;
    const gap = 8;
    const spaceBelow = window.innerHeight - r.bottom - gap - 12;
    const spaceAbove = r.top - gap - 12;
    // Prefer opening down; flip up only when below is clearly tighter.
    const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(openUp ? spaceAbove : spaceBelow, 520);
    const left = Math.min(anchor.left, window.innerWidth - width - 12);
    setMenuPos({
      top: openUp ? r.top - gap : r.bottom + gap,
      left: Math.max(12, left),
      width,
      maxHeight: Math.max(180, maxHeight),
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Positioning depends on post-layout viewport measurements.
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
      'catalog-cat-item',
      active ? 'is-active' : '',
    ].join(' ');

  const AllIcon = ALL_CATEGORIES_ICON;

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
              top: menuPos.openUp ? undefined : menuPos.top,
              bottom: menuPos.openUp ? window.innerHeight - menuPos.top : undefined,
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
              zIndex: 9999,
            }}
            className="catalog-cat-menu"
          >
            <li role="option" aria-selected={!value}>
              <button type="button" className={itemClass(!value)} onClick={() => pick('')}>
                <span className="catalog-cat-icon" aria-hidden>
                  <AllIcon
                    className="h-3.5 w-3.5"
                    style={{ color: ALL_CATEGORIES_ACCENT }}
                    strokeWidth={2}
                  />
                </span>
                <span className="truncate">All Categories</span>
              </button>
            </li>
            <li aria-hidden className="catalog-cat-rule" />
            {RESEARCH_CATEGORIES.map((cat) => {
              const active = value === cat.id;
              const Icon = cat.icon;
              return (
                <li key={cat.id} role="option" aria-selected={active}>
                  <button type="button" className={itemClass(active)} onClick={() => pick(cat.id)}>
                    <span className="catalog-cat-icon" aria-hidden>
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: cat.accent }}
                        strokeWidth={2}
                      />
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
    <div ref={rootRef} className="catalog-cat">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={`catalog-cat-trigger${open ? ' is-open' : ''}`}
      >
        <span className="catalog-cat-trigger-label">
          <span className="catalog-cat-icon" aria-hidden>
            <TriggerIcon className="h-3.5 w-3.5" style={{ color: triggerAccent }} strokeWidth={2} />
          </span>
          <span className="truncate">{selected ? selected.label : 'All Categories'}</span>
        </span>
        <ChevronDown className="catalog-cat-chevron" />
      </button>
      {menu}
    </div>
  );
}

type SectionKind = 'hot' | 'trend' | 'popular' | 'essential' | 'more';

/** Two-tone marks for the shop headings. Color sits on the symbol only. */
function SectionGlyph({ kind }: { kind: SectionKind }) {
  const uid = useId().replace(/:/g, '');
  const fill = `sgf-${uid}`;
  const tone: Record<SectionKind, [string, string]> = {
    hot: ['#FDE68A', '#F43F5E'],
    trend: ['#E9D5FF', '#7C3AED'],
    popular: ['#DBEAFE', '#3B82F6'],
    essential: ['#A7F3D0', '#10B981'],
    more: ['#99F6E4', '#14B8A6'],
  };
  const [light, deep] = tone[kind];

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={fill} x1="4" y1="20" x2="20" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={deep} />
          <stop offset="100%" stopColor={light} />
        </linearGradient>
      </defs>
      {kind === 'hot' && (
        <>
          <path
            fill={`url(#${fill})`}
            d="M12 1.6c.3 2.5-1.1 4-2.2 5 1.9-.3 3.4-1.7 3.8-3.6.7 1.9 3 3.2 3 6 0 4.8-2.9 8.6-6.6 8.6S3.4 13.8 3.4 9c0-2.3 1.4-4 2.5-5.4.6 1.6 1.7 2.6 3.1 2.8C8 4.6 9.7 2.6 12 1.6Z"
          />
          <path
            fill="#fff"
            opacity="0.72"
            d="M12 9.4c.4 1.1 0 2-.6 2.5.7-.2 1.2-.8 1.4-1.6.3.7 1.1 1.3 1.1 2.4 0 1.9-1.3 3.4-2.9 3.4s-2.9-1.5-2.9-3.4c0-1 .5-1.8 1-2.4.3.6.8 1 1.2 1.2-.4-.7.2-1.8 1.7-2.1Z"
          />
        </>
      )}
      {kind === 'trend' && (
        <>
          <path
            d="M3 16.8c2.4-.2 3.4-4.6 6-4.6 2.4 0 2.8 3.2 5.2 3.2 2.6 0 3.4-6.6 6.8-7.8"
            stroke={`url(#${fill})`}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M16.6 6.1h4.6V10.7"
            stroke={light}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20.9" cy="6.4" r="1.15" fill={light} />
        </>
      )}
      {kind === 'popular' && (
        <>
          <path
            fill={`url(#${fill})`}
            d="m12 1.8 2.15 5.05 5.45.5-4.15 3.55 1.28 5.3L12 13.4 7.27 16.2l1.28-5.3L4.4 7.35l5.45-.5L12 1.8Z"
          />
          <path fill="#fff" opacity="0.55" d="M12 1.8 13.1 4.4 12 8.6 10.9 4.4 12 1.8Z" />
        </>
      )}
      {kind === 'essential' && (
        <>
          <path
            fill={`url(#${fill})`}
            d="M9.1 2.4h5.8v1.5h1.1v1.5H8V3.9h1.1V2.4Z"
          />
          <path
            stroke={`url(#${fill})`}
            strokeWidth="1.45"
            d="M8.2 6.2h7.6v10.2a2.2 2.2 0 0 1-2.2 2.2H10.4a2.2 2.2 0 0 1-2.2-2.2V6.2Z"
          />
          <path fill={`url(#${fill})`} d="M8.7 12.6h6.6v3.5a1.7 1.7 0 0 1-1.7 1.7h-3.2a1.7 1.7 0 0 1-1.7-1.7v-3.5Z" />
          <path d="M10.1 8.1v4.4" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" strokeLinecap="round" />
        </>
      )}
      {kind === 'more' && (
        <>
          <path fill={`url(#${fill})`} d="M12 3.2 20.2 7.1 12 11 3.8 7.1 12 3.2Z" />
          <path
            d="M4.2 10.2 12 14l7.8-3.8"
            stroke={`url(#${fill})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.2 14.2 12 18 19.8 14.2"
            stroke={light}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        </>
      )}
    </svg>
  );
}

export default function Catalog() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const initialProducts = rankCatalogBySales(cachedCatalogProducts ?? [], cachedCatalogSales ?? {});
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>(DEFAULT_DISCOUNT_SETTINGS);
  const [researchDisclaimer, setResearchDisclaimer] = useState(DEFAULT_RESEARCH_DISCLAIMER_SETTINGS.message);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadProductsFromSupabase(),
      loadHomepageProductSales(),
      getSiteSetting('discount_settings', DEFAULT_DISCOUNT_SETTINGS),
      getSiteSetting('research_disclaimer_settings', DEFAULT_RESEARCH_DISCLAIMER_SETTINGS),
    ])
      .then(([data, sales, discount, researchDisclaimerSettings]) => {
        if (!cancelled) {
          setProducts(rankCatalogBySales(data, sales));
          setDiscountSettings(discount);
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
  const SelectedCatIcon = selectedCategory?.icon;

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
  const priorityProductIds = new Set(filteredProducts.slice(0, 6).map((product) => product.id));

  const renderProductCard = (product: Product) => {
    return (
      <ProductCard
        key={product.id}
        product={product}
        discountSettings={discountSettings}
        imagePriority={priorityProductIds.has(product.id)}
      />
    );
  };

  return (
    <>
    <ProductCardStyles />
    <section
      ref={sectionRef}
      id="catalog"
      className="relative z-60 pt-16 sm:pt-20 lg:pt-24 pb-16 lg:pb-24"
    >
      <div className="relative z-10 px-4 sm:px-6 lg:px-12">
        <ShopPromoStrip />

        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F6FA]">
            Shop{' '}
            <span className="tabular-nums">{shopPeptideHeadlineCount}+</span>{' '}
            <span className="gradient-text">peptides</span>
          </h1>

          {/* Search + research category filter — full content width */}
          <div className="catalog-search">
            <label className="catalog-search-field">
              <Search aria-hidden />
              <input
                type="text"
                placeholder="Search peptides, e.g. Tirzepatide, BPC-157, GHK-Cu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search peptides"
              />
            </label>
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
                    {SelectedCatIcon ? (
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(244,246,250,0.06)]"
                        aria-hidden
                      >
                        <SelectedCatIcon
                          className="h-4 w-4"
                          style={{ color: selectedCategory!.accent }}
                          strokeWidth={2}
                        />
                      </span>
                    ) : null}
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
                        <span className="catalog-section-mark" aria-hidden>
                          <SectionGlyph kind="hot" />
                        </span>
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
                        <span className="catalog-section-mark" aria-hidden>
                          <SectionGlyph kind="trend" />
                        </span>
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
                        <span className="catalog-section-mark" aria-hidden>
                          <SectionGlyph kind="popular" />
                        </span>
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
                        <span className="catalog-section-mark" aria-hidden>
                          <SectionGlyph kind="essential" />
                        </span>
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
                        <span className="catalog-section-mark" aria-hidden>
                          <SectionGlyph kind="more" />
                        </span>
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
