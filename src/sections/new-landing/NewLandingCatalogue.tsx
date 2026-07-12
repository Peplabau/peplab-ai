import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import type { Product } from '@/products';
import { SHOP_PATH } from '@/lib/routes';

type CategoryKey = 'repair' | 'copper' | 'longevity' | 'neuro' | 'cellular' | 'gh';

type CategoryDef = {
  key: CategoryKey;
  title: string;
  label: string;
  description: string;
  accent: string;
  match: (p: Product) => boolean;
};

const CATEGORY_DEFS: CategoryDef[] = [
  {
    key: 'copper',
    title: 'Copper',
    label: 'GHK & copper',
    description: 'Copper peptides for skin, hair & cellular repair research.',
    accent: '#38BDF8',
    match: (p) => /ghk|copper/i.test(p.id) || /ghk|copper/i.test(p.name),
  },
  {
    key: 'repair',
    title: 'Repair',
    label: 'Tissue & healing',
    description: 'Regeneration, recovery & wound-healing research peptides.',
    accent: '#F87171',
    match: (p) => p.type === 'recovery',
  },
  {
    key: 'longevity',
    title: 'Longevity',
    label: 'Metabolic research',
    description: 'Metabolic signalling & age-related pathway research compounds.',
    accent: '#A78BFA',
    match: (p) => p.type === 'metabolic',
  },
  {
    key: 'neuro',
    title: 'Neuro',
    label: 'Cognitive & neuro',
    description: 'Neuropeptides for cognitive and neurological research models.',
    accent: '#60A5FA',
    match: (p) => p.type === 'cognitive',
  },
  {
    key: 'cellular',
    title: 'Cellular',
    label: 'Support & essentials',
    description: 'Cellular support compounds, solvents & research essentials.',
    accent: '#4ADE80',
    match: (p) => p.type === 'support' || p.category === 'essentials',
  },
  {
    key: 'gh',
    title: 'GH',
    label: 'Growth & secretagogues',
    description: 'Growth hormone secretagogues & related signalling peptides.',
    accent: '#2ED1B4',
    match: (p) => p.type === 'growth',
  },
];

const MAX_LIST = 3;

function assignProducts(products: Product[]): Map<CategoryKey, Product[]> {
  const map = new Map<CategoryKey, Product[]>();
  const used = new Set<string>();

  for (const def of CATEGORY_DEFS) {
    const list: Product[] = [];
    for (const p of products) {
      if (p.hidden || used.has(p.id)) continue;
      if (def.match(p)) {
        list.push(p);
        used.add(p.id);
      }
    }
    map.set(def.key, list);
  }

  return map;
}

function CategoryCard({
  def,
  products,
}: {
  def: CategoryDef;
  products: Product[];
}) {
  const count = products.length;
  const listed = products.slice(0, MAX_LIST);
  const browseLabel = `Browse ${def.title}`;

  return (
    <article
      className="nl-cat-card"
      style={{ '--cat-accent': def.accent } as React.CSSProperties}
    >
      <span className="nl-cat-count font-mono text-[10px] text-[#A9B3C7] tabular-nums">
        {String(count).padStart(2, '0')}
      </span>

      <div className="nl-cat-card-head">
        <h3 className="text-xl font-bold text-[#F4F6FA] leading-tight pr-8">{def.title}</h3>
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] mt-1.5 nl-cat-label">
          {def.label}
        </p>
        <p className="text-xs text-[#A9B3C7] mt-2 leading-snug line-clamp-2">{def.description}</p>
      </div>

      <ul className="nl-cat-list">
        {listed.length > 0 ? (
          listed.map((p) => (
            <li key={p.id}>
              <Link to={`/product/${p.id}`} className="nl-cat-product-link">
                {p.name}
              </Link>
            </li>
          ))
        ) : (
          <li className="text-xs text-[#A9B3C7] py-1">Coming soon</li>
        )}
        {count > MAX_LIST && (
          <li className="text-[10px] text-[#A9B3C7] py-1">+{count - MAX_LIST} more</li>
        )}
      </ul>

      <Link to={SHOP_PATH} className="nl-cat-browse inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.12em]">
        {browseLabel}
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
      </Link>
    </article>
  );
}

export default function NewLandingCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductsFromSupabase()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const byCategory = useMemo(() => assignProducts(products.filter((p) => !p.hidden)), [products]);

  return (
    <section className="nl-section" aria-labelledby="nl-catalogue-heading">
      <div className="nl-featured-container">
        <header className="nl-section-header">
          <p className="nl-eyebrow">Catalogue</p>
          <h2 id="nl-catalogue-heading" className="nl-heading">
            Six Categories. One Standard.
          </h2>
          <p className="nl-lead">
            Every compound we stock is grouped by research domain. Each category passes the same ≥99%
            HPLC purity standard before release.
          </p>
        </header>

        {loading ? (
          <div className="nl-catalogue-grid-wrap">
            <div className="nl-catalogue-grid">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="nl-cat-card nl-cat-card--skeleton animate-pulse rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="nl-catalogue-grid-wrap">
            <div className="nl-catalogue-grid">
              {CATEGORY_DEFS.map((def) => (
                <CategoryCard key={def.key} def={def} products={byCategory.get(def.key) ?? []} />
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-10 sm:mt-12">
          <Link to={SHOP_PATH} className="nl-featured-cta">
            View full shop
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
