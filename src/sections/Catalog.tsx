import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Truck, Gift, Beaker, Award, TrendingUp, MessageCircle } from 'lucide-react';
import ProductCard, { ProductCardStyles } from '@/components/ProductCard';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS, DEFAULT_SUPPORT_LINKS, DEFAULT_RESEARCH_DISCLAIMER_SETTINGS, type DiscountSettings } from '@/lib/settings';
import { getCache } from '@/lib/cache';
import { preloadProductImages } from '@/lib/product-image';
import type { Product } from '@/products';
import { Skeleton } from '@/components/ui/skeleton';
import ResearchMarquee from '@/components/ResearchMarquee';

gsap.registerPlugin(ScrollTrigger);

const cachedCatalogProducts = getCache<Product[]>('products:all', true);

export default function Catalog() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRenderIndex = useRef(0);
  const [searchQuery, setSearchQuery] = useState('');
  const initialProducts = cachedCatalogProducts ?? [];
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>(DEFAULT_DISCOUNT_SETTINGS);
  const [telegramLink, setTelegramLink] = useState(DEFAULT_SUPPORT_LINKS.telegram_link);
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
      getSiteSetting('discount_settings', DEFAULT_DISCOUNT_SETTINGS),
      getSiteSetting<{ url: string }>('telegram_link', { url: DEFAULT_SUPPORT_LINKS.telegram_link }),
      getSiteSetting<{ url: string }>('whatsapp_link', { url: DEFAULT_SUPPORT_LINKS.whatsapp_link }),
      getSiteSetting('research_disclaimer_settings', DEFAULT_RESEARCH_DISCLAIMER_SETTINGS),
    ])
      .then(([data, discount, telegram, whatsapp, researchDisclaimerSettings]) => {
        if (!cancelled) {
          setProducts(data);
          setDiscountSettings(discount);
          setTelegramLink(telegram?.url || DEFAULT_SUPPORT_LINKS.telegram_link);
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const essentials = filteredProducts.filter((p) => p.category === 'essentials');
  const bestSellers = filteredProducts.filter((p) => p.category === 'best-seller');
  const highPopularity = filteredProducts.filter((p) => p.category === 'high-popularity');
  const popular = filteredProducts.filter((p) => p.category === 'popular');
  const otherCategories = filteredProducts.filter(
    (p) => !['best-seller', 'high-popularity', 'popular', 'essentials'].includes(p.category)
  );

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
                <Beaker className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#EC4899]" />
              </div>
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-[#F4F6FA]">HPLC-Verified</p>
                <p className="text-[8px] sm:text-xs text-[#A9B3C7]">≥99% Pure</p>
              </div>
            </div>
          </div>
        </div>

        {/* PEPLAB Rewards Banner - Compact on mobile */}
        <a
          href="/login"
          className="block mb-3 sm:mb-4 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1b1634] to-[#0d282a] border border-[rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.5)] transition-colors"
        >
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#2ED1B4]">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-lg font-semibold text-[#F4F6FA]">PEPLAB Rewards</p>
                <p className="hidden sm:block text-sm text-[#A9B3C7]">Earn points with every purchase and redeem for discounts</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-6 text-[10px] sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#22C55E]" />
                <span className="text-[#A9B3C7]">1pt/$1</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B5CF6]" />
                <span className="text-[#A9B3C7]">Redeem $150+</span>
              </div>
            </div>
          </div>
        </a>

        {/* Support chips — forced single row on mobile (no wrap); abbreviated labels below sm */}
        <div className="flex flex-nowrap items-stretch gap-2 sm:gap-3 mb-4 sm:mb-6 w-full">
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg bg-[#011d2e] border border-[rgba(0,136,204,0.3)] px-2 py-2 sm:px-3 hover:bg-[#022940] hover:border-[rgba(0,136,204,0.5)] transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#0088CC]" />
            <span className="text-[11px] sm:text-xs font-medium text-[#F4F6FA]">
              <span className="sm:hidden">Telegram</span>
              <span className="hidden sm:inline">Telegram Support</span>
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
                <span className="sm:hidden">WhatsApp</span>
                <span className="hidden sm:inline">WhatsApp Support</span>
              </span>
            </a>
          ) : null}
        </div>

        {/* Header */}
        <div ref={headerRef} className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F6FA] mb-4">
            Shop <span className="gradient-text">peptides</span>
          </h2>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B3C7]" />
            <input
              type="text"
              placeholder="Search peptides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-[#0d121f] border border-[rgba(244,246,250,0.08)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors"
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

              {/* No Results (search filtered empty) */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-[#A9B3C7] text-lg">No products found matching your criteria.</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-[#2ED1B4] hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
    </>
  );
}
