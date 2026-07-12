import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bitcoin, FlaskConical, Tag, Zap, Lock } from 'lucide-react';
import ProductCard, { ProductCardStyles } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/auspost';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS, type DiscountSettings } from '@/lib/settings';
import type { Product } from '@/products';
import { SHOP_PATH } from '@/lib/routes';

const FEATURED_IDS = [
  'ghk-cu',
  'retatrutide',
  'bpc-157',
  'tb-500',
  'semaglutide',
  'tirzepatide',
] as const;

function pickFeaturedSix(all: Product[]): Product[] {
  const picked: Product[] = [];
  for (const id of FEATURED_IDS) {
    const p = all.find((x) => x.id === id || x.id?.toLowerCase() === id);
    if (p && !picked.some((x) => x.id === p.id)) picked.push(p);
  }
  for (const p of all) {
    if (picked.length >= 6) break;
    if (!p.hidden && !picked.some((x) => x.id === p.id)) picked.push(p);
  }
  return picked.slice(0, 6);
}

const PERKS = [
  {
    icon: Zap,
    title: 'Same-Day Dispatch',
    subtitle: 'Monday to Friday from Australia',
  },
  {
    icon: Lock,
    title: 'Secure Checkout',
    subtitle: 'Credit Cards · Apple Pay · Google Pay',
  },
  {
    icon: Bitcoin,
    title: 'Crypto Saves 10%',
    subtitle: 'Auto-applied at checkout',
  },
  {
    icon: Tag,
    title: `Free Shipping Over $${FREE_SHIPPING_THRESHOLD}`,
    subtitle: 'AusPost Express included',
  },
] as const;

export default function NewLandingFeaturedCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>(DEFAULT_DISCOUNT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadProductsFromSupabase(),
      getSiteSetting('discount_settings', DEFAULT_DISCOUNT_SETTINGS),
    ])
      .then(([data, discount]) => {
        if (!cancelled) {
          setProducts(data);
          setDiscountSettings(discount);
        }
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => pickFeaturedSix(products), [products]);

  return (
    <>
    <ProductCardStyles />
    <section
      id="catalog"
      className="nl-featured-catalog relative z-10 scroll-mt-24"
      aria-labelledby="nl-featured-heading"
    >
      {/* Row 1 — service highlights (reference: 4 centered columns) */}
      <div className="nl-featured-perks">
        <div className="nl-featured-container py-8 sm:py-12 lg:py-14">
          <div className="nl-perks-grid">
            {PERKS.map((perk) => (
              <div key={perk.title} className="nl-perk-item">
                <div className="nl-featured-perk-icon">
                  <perk.icon className="w-5 h-5 text-[var(--nl-accent)]" strokeWidth={1.75} />
                </div>
                <p className="nl-perk-title">{perk.title}</p>
                <p className="nl-perk-subtitle">{perk.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nl-featured-disclaimer">
        <div className="nl-featured-container py-6 sm:py-8">
          <div className="flex items-start gap-4 sm:gap-5 max-w-3xl mx-auto">
            <div className="nl-featured-disclaimer-icon shrink-0">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--nl-bg)]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-base sm:text-lg font-semibold text-[var(--nl-text)]">Research Use Only</p>
              <p className="nl-lead mt-2">
                All products are intended strictly for in-vitro laboratory and research purposes. Not for
                human or animal consumption.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="nl-featured-main">
        <div className="nl-featured-container pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-12 lg:pb-14">
          <header className="nl-section-header">
            <p className="nl-eyebrow">Featured</p>
            <h2 id="nl-featured-heading" className="nl-heading">
              Premium Peptides
            </h2>
            <p className="nl-lead">
              Lab-verified, batch by batch. Free express shipping on orders over ${FREE_SHIPPING_THRESHOLD}{' '}
              AUD.
            </p>
          </header>

          {loading ? (
            <div className="nl-featured-grid-wrap">
              <div className="nl-featured-product-grid">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[var(--nl-bg-panel)] border border-[var(--nl-border)] overflow-hidden shadow-[var(--nl-shadow)]"
                >
                  <Skeleton className="w-full aspect-square rounded-none" />
                  <div className="px-3.5 py-3 space-y-2">
                    <Skeleton className="h-4 w-4/5 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded-full mt-2" />
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : featured.length === 0 ? (
            <p className="text-center text-[#A9B3C7] py-12">No products available.</p>
          ) : (
            <div className="nl-featured-grid-wrap">
              <div className="nl-featured-product-grid">
                {featured.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    discountSettings={discountSettings}
                    variant="landing"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 sm:mt-14 text-center space-y-6">
            <p className="text-sm text-[var(--nl-text-muted)] leading-relaxed flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
              <span>Free express shipping over ${FREE_SHIPPING_THRESHOLD} AUD</span>
              <span className="text-[var(--nl-accent)]" aria-hidden>·</span>
              <span>10% off crypto orders</span>
              <span className="text-[var(--nl-accent)]" aria-hidden>·</span>
              <span>CoA published per batch</span>
            </p>

            <Link to={SHOP_PATH} className="nl-featured-cta">
              View all research compounds
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
