import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, FileText, FlaskConical, Shield } from 'lucide-react';
import ProductCard, { ProductCardStyles } from '@/components/ProductCard';
import StorefrontLayout from '@/components/StorefrontLayout';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { buildProductJsonLd, buildProductSeo } from '@/lib/product-seo';
import { SHOP_PATH } from '@/lib/routes';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/products';
import { getProductBySlug } from '@/lib/supabase-db';
import { resolveProductSlug } from '@/lib/product-slug-aliases';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS, type DiscountSettings } from '@/lib/settings';
import {
  getTechnicalPropertyRows,
  parseLabPreparationSections,
} from '@/lib/product-detail-content';
import { getShortProductCopy } from '@/lib/peplab-short-product-copy';
import CoaDialog from '@/components/CoaDialog';
import { getCoaDisplayData } from '@/lib/coa-utils';
import { cn } from '@/lib/utils';
import { CONFIG } from '@/lib/config';

const STOREFRONT_COA_ENABLED = CONFIG.FEATURES.ENABLE_STOREFRONT_COA;

export default function ProductPage() {
  const navigate = useNavigate();
  const params = useParams();
  const rawSlug = params.slug;
  const slug = rawSlug ? resolveProductSlug(rawSlug) : undefined;
  const needsAliasRedirect = Boolean(rawSlug && slug && rawSlug !== slug);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>(DEFAULT_DISCOUNT_SETTINGS);
  const [coaOpen, setCoaOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug, loading]);

  useEffect(() => {
    let cancelled = false;
    if (needsAliasRedirect || !slug) {
      if (!slug && !needsAliasRedirect) {
        setLoading(false);
        setError('Missing product slug.');
      }
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      getProductBySlug(slug),
      getSiteSetting('discount_settings', DEFAULT_DISCOUNT_SETTINGS),
    ])
      .then(([p, discount]) => {
        if (cancelled) return;
        if (!p) {
          setProduct(null);
          setError('Product not found.');
          return;
        }
        setProduct(p);
        setDiscountSettings(discount);
      })
      .catch((e) => {
        console.error('Product load failed:', e);
        if (!cancelled) setError('Failed to load product.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, needsAliasRedirect]);

  const seo = useMemo(() => {
    if (!product || !slug) return null;
    return buildProductSeo(product, slug);
  }, [product, slug]);

  const productJsonLd = useMemo(() => {
    if (!product || !slug) return null;
    return buildProductJsonLd(product, slug);
  }, [product, slug]);

  const shortCopy = useMemo(
    () => (product ? getShortProductCopy(product.id) : undefined),
    [product],
  );

  const descriptionText = shortCopy?.description
    || product?.longDescription
    || product?.description
    || '';

  const propertyRows = useMemo(() => {
    if (!product) return [];
    if (shortCopy?.properties?.length) {
      const verified = getTechnicalPropertyRows(product).filter((row) =>
        /^(Purity|Batch|Form|Vial Size|Testing Method|Quality Verification)$/i.test(row.label),
      );
      return [...shortCopy.properties, ...verified];
    }
    return getTechnicalPropertyRows(product);
  }, [product, shortCopy]);

  const labSections = useMemo(() => {
    if (shortCopy?.labPreparation) return parseLabPreparationSections(shortCopy.labPreparation);
    if (product?.labPreparation) return parseLabPreparationSections(product.labPreparation);
    return [];
  }, [product?.labPreparation, shortCopy?.labPreparation]);

  const overviewText = shortCopy?.overview?.trim() || '';
  const researchHref = shortCopy?.researchHref || null;

  const coaData = STOREFRONT_COA_ENABLED && product ? getCoaDisplayData(product) : null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SHOP_PATH);
  };

  if (needsAliasRedirect && slug) {
    return <Navigate to={`/product/${slug}`} replace />;
  }

  if (loading) {
    return (
      <StorefrontLayout surface="clean">
        <main className="pdp-page nl-new-landing page-grid-bg min-h-screen pt-24 pb-16">
          <section className="pdp-section">
            <div className="max-w-6xl mx-auto px-6">
              <Skeleton className="h-10 w-28 rounded-lg mb-8" />
              <div className="pdp-hero-grid">
                <Skeleton className="aspect-[4/3] rounded-[1.25rem]" />
              </div>
            </div>
          </section>
        </main>
      </StorefrontLayout>
    );
  }

  if (!product || error) {
    return (
      <StorefrontLayout surface="clean">
        <main className="pdp-page nl-new-landing page-grid-bg min-h-screen pt-24 pb-16">
          <section className="pdp-section">
            <div className="max-w-6xl mx-auto px-6 flex min-h-[50vh] flex-col items-center justify-center text-center">
              <p className="text-[#EF4444] text-sm mb-4">{error || 'Product not found.'}</p>
              <button
                className="px-4 py-2 rounded-xl bg-[#2ED1B4] text-[#070A12] font-semibold hover:bg-[#25b89d]"
                type="button"
                onClick={() => navigate(SHOP_PATH)}
              >
                Back to shop
              </button>
            </div>
          </section>
        </main>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout surface="clean">
      <ProductCardStyles />
      {seo && <SEO title={seo.title} description={seo.description} keywords={seo.keywords} />}
      {productJsonLd && <JsonLd data={productJsonLd} id={`product-jsonld-${slug}`} />}

      <main className="pdp-page nl-new-landing page-grid-bg min-h-screen pt-24 pb-16">
        <section className="pdp-section">
          <div className="max-w-6xl mx-auto px-6">
            <button type="button" onClick={handleBack} className="pdp-back">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="pdp-hero-grid">
              <ProductCard
                product={product}
                discountSettings={discountSettings}
                layout="pdp"
                linkToDetail={false}
                imagePriority
              />
            </div>

            <section className="pdp-details-stack space-y-3" aria-label="Product information">
              {/* Description — always visible and concise */}
              <div className="pdp-short-panel">
                <h2 className="pdp-short-panel__label">Description</h2>
                <p className="nl-lead whitespace-pre-wrap">{descriptionText}</p>
              </div>

              {/* Properties / Preparation / Overview — crawlable <details> accordions */}
              <details className="pdp-short-accordion">
                <summary className="pdp-short-accordion__summary">
                  <span>Properties</span>
                </summary>
                <div className="pdp-short-accordion__body">
                  <div className="pdp-props-table">
                    {propertyRows.map((row) => (
                      <div key={row.label} className="pdp-props-row">
                        <span className="text-[#A9B3C7] shrink-0">{row.label}</span>
                        <span className="text-[#F4F6FA] sm:text-right break-words">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>

              <details className="pdp-short-accordion">
                <summary className="pdp-short-accordion__summary">
                  <span>Preparation</span>
                </summary>
                <div className="pdp-short-accordion__body space-y-4">
                  {labSections.length > 0 ? (
                    labSections.map((section) => (
                      <div key={section.title}>
                        <h3 className="rg-card-title mb-2">{section.title}</h3>
                        <p className="nl-lead whitespace-pre-wrap">{section.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="nl-lead">
                      Follow the product-specific laboratory preparation instructions. Confirm diluent
                      compatibility before mixing.
                    </p>
                  )}
                </div>
              </details>

              <details className="pdp-short-accordion">
                <summary className="pdp-short-accordion__summary">
                  <span>Overview</span>
                </summary>
                <div className="pdp-short-accordion__body space-y-4">
                  {overviewText ? (
                    <p className="nl-lead whitespace-pre-wrap">{overviewText}</p>
                  ) : (
                    <p className="nl-lead">
                      Research findings depend on the preparation, study design and population. This
                      material is supplied for laboratory research only.
                    </p>
                  )}

                  {researchHref ? (
                    <Link
                      to={researchHref}
                      className="pdp-research-overview-btn"
                      aria-label={`Research overview for ${product.name}`}
                    >
                      RESEARCH OVERVIEW
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : null}
                </div>
              </details>

              <div className="nl-featured-disclaimer rounded-[var(--nl-radius-lg,1.25rem)] overflow-hidden">
                <div className="py-5 px-5 sm:py-6 sm:px-6">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="nl-featured-disclaimer-icon shrink-0">
                      <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--nl-bg)]" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-base sm:text-lg font-semibold text-[var(--nl-text)]">
                        Research use only
                      </p>
                      <p className="nl-lead mt-2">
                        This product is intended for laboratory research purposes only and is not for
                        human or animal consumption. Not intended to diagnose, treat, cure, or prevent
                        any disease.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="rg-approach-grid rg-approach-grid--coa pdp-trust-row">
              <TrustCard icon={<Shield size={14} />} title="Lab Verified" text="Batch-tested research material" />
              {STOREFRONT_COA_ENABLED && (
                <button
                  type="button"
                  onClick={() => setCoaOpen(true)}
                  className={cn(
                    'rg-approach-card pdp-trust-card--coa text-left',
                    !coaData?.hasCoaPdf && 'pdp-trust-card--pending',
                  )}
                >
                  <div className="rg-approach-icon">
                    <FileText
                      size={16}
                      className={
                        coaData?.hasCoaPdf
                          ? 'text-[var(--nl-purple)]'
                          : 'text-[rgba(251,191,36,0.85)]'
                      }
                    />
                  </div>
                  <h3 className="rg-card-title">Certificate of Analysis</h3>
                  <p className="rg-card-text">
                    {coaData?.hasCoaPdf
                      ? 'View third-party HPLC certificate for this batch'
                      : 'Certificate pending — check back soon for this batch'}
                  </p>
                </button>
              )}
              <TrustCard
                icon={<AlertTriangle size={14} />}
                title="Research Only"
                text="Not for therapeutic or cosmetic use"
              />
            </div>
          </div>
        </section>
      </main>

      {STOREFRONT_COA_ENABLED && (
        <CoaDialog open={coaOpen} onOpenChange={setCoaOpen} data={coaData} />
      )}
    </StorefrontLayout>
  );
}

function TrustCard({
  icon,
  title,
  text,
  variant = 'default',
}: {
  icon: ReactNode;
  title: string;
  text: string;
  variant?: 'default' | 'pending';
}) {
  const isPending = variant === 'pending';
  return (
    <div className={`rg-approach-card ${isPending ? 'pdp-trust-card--pending' : ''}`}>
      <div className="rg-approach-icon">
        <span className={isPending ? 'text-[rgba(251,191,36,0.85)]' : 'text-[var(--nl-purple)]'}>
          {icon}
        </span>
      </div>
      <h3 className="rg-card-title">{title}</h3>
      <p className="rg-card-text">{text}</p>
    </div>
  );
}
