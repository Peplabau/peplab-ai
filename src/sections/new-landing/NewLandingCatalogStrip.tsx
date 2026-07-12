import { useEffect, useMemo, useState } from 'react';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import type { Product } from '@/products';
import { SHOP_PATH } from '@/lib/routes';

function categoryLabel(product: Product): string | null {
  const raw = (product.category || product.type || '').replace(/-/g, ' ').trim();
  if (!raw) return null;
  return raw.toUpperCase();
}

function CatalogPill({ product }: { product: Product }) {
  const tag = categoryLabel(product);

  return (
    <a href={SHOP_PATH} className="nl-catalog-pill">
      {tag && <span className="nl-catalog-pill-tag">{tag}</span>}
      <span>{product.name}</span>
    </a>
  );
}

export default function NewLandingCatalogStrip() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProductsFromSupabase().then(setProducts).catch(() => setProducts([]));
  }, []);

  const marqueeProducts = useMemo(() => {
    if (products.length === 0) return [];
    const minItems = 12;
    const repeated: Product[] = [];
    while (repeated.length < minItems) {
      repeated.push(...products);
    }
    return [...repeated, ...repeated];
  }, [products]);

  return (
    <section className="nl-catalog-strip relative z-20" aria-label="Live catalog">
      <div className="nl-featured-container">
        <div className="nl-catalog-strip-layout">
          <div className="nl-catalog-strip-left">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--nl-accent)] opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--nl-accent)]" />
            </span>
            <span className="text-xs font-mono uppercase tracking-[0.14em] text-[var(--nl-accent)] font-semibold whitespace-nowrap">
              Live catalog
            </span>
          </div>

          <div className="nl-catalog-marquee nl-catalog-strip-scroll">
            {marqueeProducts.length > 0 ? (
              <div className="nl-catalog-marquee-track">
                {marqueeProducts.map((product, i) => (
                  <CatalogPill key={`${product.id}-${i}`} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--nl-text-muted)] font-mono">Loading catalog…</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
