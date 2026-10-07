import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  AlertTriangle,
  ExternalLink,
  FlaskConical,
  HelpCircle,
  Microscope,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import ProductImage from '@/components/ProductImage';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import {
  COA_ARCHIVE_PATH,
  RESEARCH_PATH,
  RESEARCH_COMPOUNDS_PATH,
} from '@/lib/routes';
import {
  getPublishedResearchArticleBySlug,
  researchCompoundPath,
  type ResearchArticle,
} from '@/lib/research-articles';
import { RESEARCH_SEED_ARTICLES } from '@/lib/research-seed-data';
import { resolveProductSlug } from '@/lib/product-slug-aliases';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import { CONFIG } from '@/lib/config';
import Footer from '@/sections/Footer';

const STOREFRONT_HOME_URL = `${CONFIG.SITE_URL.replace(/\/$/, '')}/`;

/** Product related links always go to the peplab.ai homepage (not a product slug). */
function resolveRelatedHref(
  href: string | undefined,
  kind: 'PRODUCT' | 'CATEGORY' | 'RESEARCH',
): string {
  if (kind === 'PRODUCT') return STOREFRONT_HOME_URL;
  const raw = (href || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

const sectionClass =
  'p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]';
const bodyClass = 'text-[#A9B3C7] leading-relaxed';
const linkClass = 'text-[#A78BFA] hover:underline';
const h2Class = 'text-xl font-bold text-[#F4F6FA]';
const h3Class = 'text-lg font-semibold text-[#F4F6FA] mb-2';

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

/** Render light markdown: [label](url), **bold**, and plain text. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    if (match[2] && match[3]) {
      nodes.push(
        <ExtLink key={`l-${key++}`} href={match[3]}>
          {match[2]}
        </ExtLink>,
      );
    } else if (match[4]) {
      nodes.push(
        <strong key={`b-${key++}`} className="text-[#F4F6FA]">
          {match[4]}
        </strong>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function Paragraphs({ text, className = bodyClass }: { text: string; className?: string }) {
  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (!blocks.length) return null;
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const isList = lines.every((l) => l.startsWith('•') || l.startsWith('-'));
        if (isList) {
          return (
            <ul key={i} className="space-y-2 text-[#A9B3C7]">
              {lines.map((line, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="text-[#A78BFA] mt-1">•</span>
                  <span>{renderInline(line.replace(/^[•\-]\s*/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={className}>
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function resolveFromSeed(slug: string): ResearchArticle | null {
  const seed = RESEARCH_SEED_ARTICLES.find(
    (a) => a.slug.toLowerCase() === slug.toLowerCase() && a.status === 'published',
  );
  if (!seed) return null;
  return {
    ...seed,
    id: `seed-${seed.slug}`,
    product_slug: seed.product_slug || null,
    author_name: seed.author_name || null,
    published_at: seed.published_at || null,
    created_at: seed.published_at || '',
    updated_at: seed.published_at || '',
  };
}

function splitH1(h1: string): { lead: string; accent: string } {
  const trimmed = h1.trim();
  if (/\sOverview$/i.test(trimmed)) {
    return {
      lead: trimmed.replace(/\sOverview$/i, ''),
      accent: 'Overview',
    };
  }
  return { lead: trimmed, accent: '' };
}

type RelatedCard = {
  kind: 'PRODUCT' | 'CATEGORY' | 'RESEARCH';
  title: string;
  to: string;
};

function buildRelatedCards(article: ResearchArticle): RelatedCard[] {
  const cards: RelatedCard[] = [];
  const seen = new Set<string>();

  const push = (card: RelatedCard) => {
    const key = `${card.kind}:${card.to}:${card.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    cards.push(card);
  };

  const productSlug = (article.product_slug || article.slug || '').trim();
  if (productSlug) {
    push({
      kind: 'PRODUCT',
      title: `${article.name} reference material`,
      to: STOREFRONT_HOME_URL,
    });
  }

  if (article.category.trim()) {
    push({
      kind: 'CATEGORY',
      title: /research/i.test(article.category)
        ? article.category
        : `${article.category} Research Peptides`,
      to: RESEARCH_COMPOUNDS_PATH,
    });
  }

  for (const item of article.related) {
    const kind = (
      item.kind || (item.slug ? 'research' : item.href ? 'product' : 'research')
    ).toUpperCase() as 'PRODUCT' | 'CATEGORY' | 'RESEARCH';
    const to =
      resolveRelatedHref(item.href, kind) ||
      (item.slug && kind !== 'PRODUCT' ? researchCompoundPath(item.slug) : '') ||
      (kind === 'CATEGORY' ? RESEARCH_COMPOUNDS_PATH : '');
    if (!to || !item.label.trim()) continue;
    push({ kind, title: item.label.trim(), to });
  }

  push({
    kind: 'RESEARCH',
    title: 'All research overviews',
    to: RESEARCH_PATH,
  });

  return cards;
}

export default function ResearchCompoundPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ResearchArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setArticle(null);
    setImageSrc('');

    (async () => {
      const fromDb = await getPublishedResearchArticleBySlug(slug);
      if (cancelled) return;
      const resolved = fromDb || resolveFromSeed(slug);
      if (!resolved) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setArticle(resolved);
      setLoading(false);

      const productSlug = resolved.product_slug || resolved.slug;
      try {
        const products = await loadProductsFromSupabase();
        if (cancelled) return;
        const canonical = resolveProductSlug(productSlug).toLowerCase();
        const product = products.find(
          (p) =>
            p.id.toLowerCase() === canonical ||
            p.id.toLowerCase() === productSlug.toLowerCase() ||
            p.name.toLowerCase().includes(resolved.name.toLowerCase().split(' ')[0]),
        );
        if (!product) return;
        const dosageImage = product.dosages?.find((d) => d.imageUrl)?.imageUrl;
        setImageSrc(dosageImage || product.image || '');
      } catch {
        /* keep placeholder */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070A12' }}>
        <p className="text-[#A9B3C7]">Loading research…</p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <>
        <SEO title="Research Not Found | PEPLAB" description="This research page is not available." />
        <div className="min-h-screen" style={{ background: '#070A12' }}>
          <ContentPageHeader />
          <main className="relative z-10 px-6 py-20 text-center">
            <h1 className="text-2xl font-bold text-[#F4F6FA] mb-4">Research page not found</h1>
            <p className={`${bodyClass} mb-6`}>This compound overview is not published yet.</p>
            <Link to={RESEARCH_COMPOUNDS_PATH} className={linkClass}>
              Find Your Compound
            </Link>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const path = researchCompoundPath(article.slug);
  const { lead, accent } = splitH1(article.h1 || `${article.name} Research Overview`);
  const eyebrow = article.eyebrow || article.category;
  const relatedCards = buildRelatedCards(article);

  return (
    <>
      <SEO
        title={article.seo_title || `${article.name} Research | PEPLAB`}
        description={article.seo_description || article.card_description}
      />
      <JsonLd
        id={`research-${article.slug}-breadcrumbs`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Find Your Compound', path: RESEARCH_COMPOUNDS_PATH },
          { name: article.name, path },
        ])}
      />

      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <ContentPageHeader />

        <main className="relative z-10">
          <section className="relative border-b border-[rgba(244,246,250,0.06)]">
            <div className="mx-auto max-w-4xl px-6 py-12 text-center lg:px-12 lg:py-16">
              <div className="mx-auto mb-6 flex h-28 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.6)]">
                {imageSrc ? (
                  <ProductImage
                    src={imageSrc}
                    alt={`${article.name} research vial`}
                    className="h-full w-full object-contain p-2"
                    variant="card"
                  />
                ) : (
                  <FlaskConical className="h-10 w-10 text-[#8B5CF6] opacity-60" />
                )}
              </div>
              {eyebrow && (
                <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.35em] text-[#A78BFA]">
                  {eyebrow}
                </p>
              )}
              <h1 className="mb-4 text-3xl font-bold text-[#F4F6FA] sm:text-4xl md:text-5xl">
                {lead}
                {accent ? (
                  <>
                    {' '}
                    <span className="gradient-text">{accent}</span>
                  </>
                ) : null}
              </h1>
              {article.subtitle && (
                <p className={`${bodyClass} mx-auto max-w-2xl text-base sm:text-lg`}>
                  {article.subtitle}
                </p>
              )}
              {article.author_name && (
                <p className="mt-3 text-xs text-[#6B7280]">By {article.author_name}</p>
              )}
            </div>
          </section>

          <div className="px-6 py-12 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-6">
              {article.intro && (
                <section className={sectionClass}>
                  <Paragraphs
                    text={article.intro
                      .replace(
                        /\n*\s*For guidance on[^\n]*Research Overview\.?\s*$/i,
                        '',
                      )
                      .trim()}
                  />
                  <p className={`${bodyClass} mt-4`}>
                    For guidance on study design and analytical evidence, visit PEPLAB’s{' '}
                    <Link to={RESEARCH_PATH} className={linkClass}>
                      Research Overview
                    </Link>
                    .
                  </p>
                </section>
              )}

              {(article.what_is_heading ||
                article.what_is_body ||
                article.feature_rows.length > 0) && (
                <section className={sectionClass}>
                  {article.what_is_heading && (
                    <h2 className={`${h2Class} mb-4`}>{article.what_is_heading}</h2>
                  )}
                  {article.what_is_body && (
                    <div className="mb-6">
                      <Paragraphs text={article.what_is_body} />
                    </div>
                  )}
                  {article.feature_rows.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-[rgba(244,246,250,0.08)]">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.5)]">
                            <th className="px-4 py-3 font-semibold text-[#F4F6FA]">Feature</th>
                            <th className="px-4 py-3 font-semibold text-[#F4F6FA]">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {article.feature_rows.map((row) => (
                            <tr
                              key={row.feature}
                              className="border-b border-[rgba(244,246,250,0.06)] last:border-0"
                            >
                              <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-[#F4F6FA]">
                                {row.feature}
                              </td>
                              <td className="px-4 py-3 text-[#A9B3C7]">{row.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {(article.mechanism_heading || article.mechanism_sections.length > 0) && (
                <section className={sectionClass}>
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.1)]">
                      <Microscope className="h-6 w-6 text-[#8B5CF6]" />
                    </div>
                    {article.mechanism_heading && (
                      <h2 className={`${h2Class} pt-2`}>{article.mechanism_heading}</h2>
                    )}
                  </div>
                  {article.mechanism_intro && (
                    <div className="mb-6">
                      <Paragraphs text={article.mechanism_intro} />
                    </div>
                  )}
                  <div className="space-y-5">
                    {article.mechanism_sections.map((section) => (
                      <div key={section.title}>
                        {section.title && <h3 className={h3Class}>{section.title}</h3>}
                        <Paragraphs text={section.body} />
                      </div>
                    ))}
                  </div>
                  {article.mechanism_footer && (
                    <div className="mt-6">
                      <Paragraphs text={article.mechanism_footer} />
                    </div>
                  )}
                </section>
              )}

              {(article.findings_heading || article.findings_sections.length > 0) && (
                <section className={sectionClass}>
                  {article.findings_heading && (
                    <h2 className={`${h2Class} mb-6`}>{article.findings_heading}</h2>
                  )}
                  <div className="space-y-8">
                    {article.findings_sections.map((section) => (
                      <div key={section.title}>
                        {section.title && <h3 className={h3Class}>{section.title}</h3>}
                        <div className="space-y-3">
                          <Paragraphs text={section.body} />
                          {section.link_url && section.link_label && (
                            <p className={bodyClass}>
                              <ExtLink href={section.link_url}>{section.link_label}</ExtLink>.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {article.glance_rows.length > 0 && (
                <section className={sectionClass}>
                  <h2 className={`${h2Class} mb-4`}>Research Findings at a Glance</h2>
                  <div className="overflow-x-auto rounded-xl border border-[rgba(244,246,250,0.08)]">
                    <table className="w-full min-w-[36rem] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.5)]">
                          <th className="px-4 py-3 font-semibold text-[#F4F6FA]">Research area</th>
                          <th className="px-4 py-3 font-semibold text-[#F4F6FA]">
                            What studies have investigated
                          </th>
                          <th className="px-4 py-3 font-semibold text-[#F4F6FA]">
                            Important distinction
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {article.glance_rows.map((row) => (
                          <tr
                            key={row.area}
                            className="border-b border-[rgba(244,246,250,0.06)] last:border-0"
                          >
                            <td className="px-4 py-3 align-top font-medium text-[#F4F6FA]">
                              {row.area}
                            </td>
                            <td className="px-4 py-3 align-top text-[#A9B3C7]">
                              {row.investigated}
                            </td>
                            <td className="px-4 py-3 align-top text-[#A9B3C7]">
                              {row.distinction}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {article.safety_body && (
                <section className={sectionClass}>
                  <h2 className={`${h2Class} mb-4`}>Safety and Research Limitations</h2>
                  <Paragraphs text={article.safety_body} />
                </section>
              )}

              {(article.coa_heading || article.coa_body) && (
                <section className={sectionClass}>
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(167,139,250,0.1)]">
                      <FlaskConical className="h-6 w-6 text-[#A78BFA]" />
                    </div>
                    {article.coa_heading && (
                      <h2 className={`${h2Class} pt-2`}>{article.coa_heading}</h2>
                    )}
                  </div>
                  {article.coa_body && (
                    <Paragraphs
                      text={article.coa_body
                        .replace(
                          /\n*\s*Purity does not establish[^\n]*assessed\.?\s*$/i,
                          '',
                        )
                        .replace(
                          /\n*\s*Explore PEPLAB[^\n]*Results[^\n]*\.?\s*$/i,
                          '',
                        )
                        .trim()}
                    />
                  )}
                  <p className={`${bodyClass} mt-4`}>
                    Purity does not establish sterility, endotoxin status or clinical effectiveness.
                    Explore PEPLAB’s{' '}
                    <Link to="/standards" className={linkClass}>
                      Quality &amp; Testing
                    </Link>{' '}
                    information and available{' '}
                    <Link to={COA_ARCHIVE_PATH} className={linkClass}>
                      COA Results
                    </Link>
                    , checking whether a report covers the material and batch being assessed.
                  </p>
                </section>
              )}

              {article.faqs.length > 0 && (
                <section className={sectionClass}>
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(236,72,153,0.1)]">
                      <HelpCircle className="h-6 w-6 text-[#EC4899]" />
                    </div>
                    <h2 className={`${h2Class} pt-2`}>Frequently Asked Questions</h2>
                  </div>
                  <div className="space-y-5">
                    {article.faqs.map((faq) => (
                      <div key={faq.q}>
                        <h3 className={h3Class}>{faq.q}</h3>
                        <p className={bodyClass}>{renderInline(faq.a)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* RELATED — Lazarus-style link grid */}
              {relatedCards.length > 0 && (
                <section className="pt-4">
                  <h2 className="mb-5 text-xl font-bold uppercase tracking-wide text-[#F4F6FA] sm:text-2xl">
                    Related
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedCards.map((card) => {
                      const className =
                        'group rounded-xl border border-[rgba(167,139,250,0.28)] bg-[rgba(17,24,39,0.75)] px-5 py-4 transition-colors hover:border-[rgba(167,139,250,0.55)] hover:bg-[rgba(17,24,39,0.95)]';
                      const inner = (
                        <>
                          <p className="mb-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-[#6B7280]">
                            {card.kind}
                          </p>
                          <p className="flex items-start justify-between gap-3 text-sm font-semibold text-[#F4F6FA] sm:text-base">
                            <span>{card.title}</span>
                            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#A78BFA] transition-transform group-hover:translate-x-0.5" />
                          </p>
                        </>
                      );
                      const key = `${card.kind}-${card.to}-${card.title}`;
                      const isExternal = /^https?:\/\//i.test(card.to);
                      if (isExternal) {
                        return (
                          <a key={key} href={card.to} className={className}>
                            {inner}
                          </a>
                        );
                      }
                      return (
                        <Link key={key} to={card.to} className={className}>
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] p-6 sm:p-8">
                <div className="mb-3 flex items-start gap-4">
                  <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#EF4444]" />
                  <h2 className={h2Class}>Research use only</h2>
                </div>
                <p className={bodyClass}>
                  This page provides scientific information, not medical advice, dosing instructions
                  or recommendations for human or veterinary use. References to external studies do
                  not imply endorsement of PEPLAB or its products.
                </p>
              </section>
            </div>
          </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
