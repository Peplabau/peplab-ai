import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, FlaskConical, Search } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import ProductImage from '@/components/ProductImage';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import { RESEARCH_PATH, RESEARCH_COMPOUNDS_PATH, COA_ARCHIVE_PATH } from '@/lib/routes';
import { loadResearchCompounds, type ResearchCompound } from '@/lib/research-compounds';
import { resolveProductSlug } from '@/lib/product-slug-aliases';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import type { Product } from '@/products';
import Footer from '@/sections/Footer';
import { ResearchSectionNav } from '@/components/ResearchSectionNav';

function resolveCompoundImage(
  productSlug: string,
  productsById: Map<string, Product>,
): string {
  const canonical = resolveProductSlug(productSlug).toLowerCase();
  const product =
    productsById.get(canonical) ||
    productsById.get(productSlug.toLowerCase()) ||
    [...productsById.values()].find(
      (p) =>
        p.id.toLowerCase() === canonical ||
        p.id.toLowerCase() === productSlug.toLowerCase() ||
        p.name.toLowerCase() === productSlug.toLowerCase(),
    );

  if (!product) return '';
  const dosageImage = product.dosages?.find((d) => d.imageUrl)?.imageUrl;
  return dosageImage || product.image || '';
}

export default function ResearchCompounds() {
  const [query, setQuery] = useState('');
  const [browseOpen, setBrowseOpen] = useState(true);
  const [compounds, setCompounds] = useState<ResearchCompound[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageBySlug, setImageBySlug] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await loadResearchCompounds();
      if (cancelled) return;
      setCompounds(list);
      setLoading(false);

      try {
        const products = await loadProductsFromSupabase();
        if (cancelled) return;
        const byId = new Map(products.map((p) => [p.id.toLowerCase(), p]));
        const next: Record<string, string> = {};
        for (const compound of list) {
          next[compound.slug] = resolveCompoundImage(compound.productSlug, byId);
        }
        setImageBySlug(next);
      } catch {
        /* keep empty images */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return compounds;
    return compounds.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.cardDescription.toLowerCase().includes(q),
    );
  }, [query, compounds]);

  return (
    <>
      <SEO
        title={PAGE_SEO.researchCompounds.title}
        description={PAGE_SEO.researchCompounds.description}
      />
      <JsonLd
        id="research-compounds-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
        ])}
      />

      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />

        <ContentPageHeader />

        <main className="relative z-10 px-6 lg:px-12 py-10 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex justify-center lg:justify-start">
              <ResearchSectionNav active="compounds" />
            </div>

            {/* Library header */}
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.35em] text-[#A78BFA]">
                  The Research Library
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#F4F6FA]">
                  Find Your <span className="text-[#A78BFA]">Compound.</span>
                </h1>
              </div>
              <div className="flex items-start gap-4 lg:max-w-xs lg:border-l lg:border-[rgba(244,246,250,0.12)] lg:pl-5">
                <div>
                  <p className="text-sm text-[#A9B3C7]">Looking for a batch report?</p>
                  <Link
                    to={COA_ARCHIVE_PATH}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#A78BFA] hover:underline"
                  >
                    View the COA library
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* A–Z browse panel */}
            <div className="mb-10 rounded-2xl border border-[rgba(167,139,250,0.28)] bg-[rgba(17,24,39,0.65)] overflow-hidden">
              <button
                type="button"
                onClick={() => setBrowseOpen((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm sm:text-base font-semibold text-[#F4F6FA]">
                  Browse compounds A–Z
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#A78BFA] transition-transform ${browseOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {browseOpen && (
                <div className="border-t border-[rgba(244,246,250,0.06)] px-4 pb-5 pt-3 sm:px-5">
                  <label className="relative mb-4 block max-w-md">
                    <span className="sr-only">Search compounds</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name…"
                      className="w-full rounded-xl border border-[rgba(244,246,250,0.08)] bg-[#070A12] py-2.5 pl-10 pr-3 text-sm text-[#F4F6FA] placeholder:text-[#6B7280] outline-none focus:border-[rgba(167,139,250,0.4)]"
                    />
                  </label>

                  {loading ? (
                    <p className="text-sm text-[#A9B3C7] py-4">Loading compounds…</p>
                  ) : filtered.length === 0 ? (
                    <p className="text-sm text-[#A9B3C7] py-4">
                      {query.trim()
                        ? `No compounds matched “${query.trim()}”.`
                        : 'No published research compounds yet.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {filtered.map((compound) =>
                        compound.overviewPath ? (
                          <Link
                            key={compound.slug}
                            to={compound.overviewPath}
                            className="rounded-xl border border-[rgba(244,246,250,0.1)] bg-[rgba(7,10,18,0.7)] px-3 py-2.5 text-left text-sm text-[#F4F6FA] hover:border-[rgba(167,139,250,0.4)] hover:text-[#A78BFA] transition-colors"
                          >
                            {compound.name}
                          </Link>
                        ) : (
                          <span
                            key={compound.slug}
                            className="rounded-xl border border-[rgba(244,246,250,0.06)] bg-[rgba(7,10,18,0.45)] px-3 py-2.5 text-left text-sm text-[#6B7280]"
                          >
                            {compound.name}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Overview cards — 2-column Lazarus layout */}
            <div className="grid gap-5 md:grid-cols-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.06)]"
                    />
                  ))
                : filtered.map((compound) => {
                    const imageSrc = imageBySlug[compound.slug] || '';
                    const inner = (
                      <>
                        {/* Teal border draws around the card from top-left on hover */}
                        <span className="research-card-edge research-card-edge--top" aria-hidden />
                        <span className="research-card-edge research-card-edge--left" aria-hidden />
                        <div className="relative flex gap-4 p-5 sm:p-6">
                          <div className="h-24 w-20 sm:h-28 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-[rgba(7,10,18,0.85)] border border-[rgba(244,246,250,0.06)] flex items-center justify-center">
                            {imageSrc ? (
                              <ProductImage
                                src={imageSrc}
                                alt={`${compound.name} vial`}
                                className="h-full w-full object-contain p-1.5"
                                variant="card"
                              />
                            ) : (
                              <FlaskConical className="w-8 h-8 text-[#8B5CF6] opacity-60" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col">
                            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#A78BFA] mb-2">
                              {compound.category}
                            </p>
                            <h2 className="text-lg sm:text-xl font-bold text-[#F4F6FA] mb-2 leading-snug">
                              {compound.cardTitle}
                            </h2>
                            <p className="text-sm text-[#A9B3C7] leading-relaxed flex-1">
                              {compound.cardDescription}
                            </p>
                            <span className="mt-4 pt-3 border-t border-[rgba(244,246,250,0.08)] inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
                              Read overview
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </>
                    );

                    if (compound.overviewPath) {
                      return (
                        <Link
                          key={compound.slug}
                          id={`compound-${compound.slug}`}
                          to={compound.overviewPath}
                          className="research-compound-card group relative block overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.7)] transition-colors hover:bg-[rgba(17,24,39,0.92)]"
                        >
                          {inner}
                        </Link>
                      );
                    }

                    return (
                      <div
                        key={compound.slug}
                        id={`compound-${compound.slug}`}
                        className="relative rounded-2xl border border-[rgba(244,246,250,0.06)] bg-[rgba(17,24,39,0.45)] opacity-80"
                      >
                        <div className="relative flex gap-4 p-5 sm:p-6">
                          <div className="h-24 w-20 sm:h-28 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-[rgba(7,10,18,0.85)] border border-[rgba(244,246,250,0.06)] flex items-center justify-center">
                            {imageSrc ? (
                              <ProductImage
                                src={imageSrc}
                                alt={`${compound.name} vial`}
                                className="h-full w-full object-contain p-1.5"
                                variant="card"
                              />
                            ) : (
                              <FlaskConical className="w-8 h-8 text-[#8B5CF6] opacity-60" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col">
                            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#A78BFA] mb-2">
                              {compound.category}
                            </p>
                            <h2 className="text-lg sm:text-xl font-bold text-[#F4F6FA] mb-2 leading-snug">
                              {compound.cardTitle}
                            </h2>
                            <p className="text-sm text-[#A9B3C7] leading-relaxed flex-1">
                              {compound.cardDescription}
                            </p>
                            <span className="mt-4 text-sm text-[#6B7280]">Overview coming soon</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>

            {!loading && filtered.length === 0 && (
              <p className="mt-6 text-center text-sm text-[#A9B3C7]">
                No compounds to display.
              </p>
            )}

            <p className="mt-12 text-center text-sm text-[#6B7280]">
              More compound overviews will be added over time. Research use only.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
