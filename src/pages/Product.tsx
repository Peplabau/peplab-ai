import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Beaker, FileText, FlaskConical, Shield } from 'lucide-react';
import ProductCard, { ProductCardStyles } from '@/components/ProductCard';
import StorefrontLayout from '@/components/StorefrontLayout';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { buildProductJsonLd, buildProductSeo } from '@/lib/product-seo';
import { SHOP_PATH } from '@/lib/routes';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/products';
import { getProductBySlug } from '@/lib/supabase-db';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS, type DiscountSettings } from '@/lib/settings';
import {
  getTechnicalPropertyRows,
  isStepByStepSection,
  parseLabPreparationSections,
  parseLabPreparationSteps,
} from '@/lib/product-detail-content';
import { getPeptidexProductDetail } from '@/lib/peptidex-product-details';
import CoaDialog from '@/components/CoaDialog';
import { getCoaDisplayData } from '@/lib/coa-utils';
import { cn } from '@/lib/utils';

type DetailTab = 'description' | 'technical' | 'lab';

import { CONFIG } from '@/lib/config';

const STOREFRONT_COA_ENABLED = CONFIG.FEATURES.ENABLE_STOREFRONT_COA;

export default function ProductPage() {
  const navigate = useNavigate();
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>(DEFAULT_DISCOUNT_SETTINGS);
  const [activeTab, setActiveTab] = useState<DetailTab>('description');
  const [coaOpen, setCoaOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug, loading]);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setLoading(false);
      setError('Missing product slug.');
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
  }, [slug]);

  const seo = useMemo(() => {
    if (!product || !slug) return null;
    return buildProductSeo(product, slug);
  }, [product, slug]);

  const productJsonLd = useMemo(() => {
    if (!product || !slug) return null;
    return buildProductJsonLd(product, slug);
  }, [product, slug]);

  const peptidexDetail = useMemo(
    () => (product ? getPeptidexProductDetail(product.id) : undefined),
    [product],
  );

  const technicalRows = useMemo(() => {
    if (!product) return [];
    if (peptidexDetail?.technicalProperties?.length) return peptidexDetail.technicalProperties;
    return getTechnicalPropertyRows(product);
  }, [product, peptidexDetail]);

  const labSections = useMemo(
    () => (product?.labPreparation ? parseLabPreparationSections(product.labPreparation) : []),
    [product?.labPreparation],
  );

  const coaData = STOREFRONT_COA_ENABLED && product ? getCoaDisplayData(product) : null;

  const tabs: Array<{ id: DetailTab; label: string }> = [
    { id: 'description', label: 'Description' },
    { id: 'technical', label: 'Properties' },
    { id: 'lab', label: 'Preparation' },
  ];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SHOP_PATH);
  };

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
          <button
            type="button"
            onClick={handleBack}
            className="pdp-back"
          >
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

          <section className="pdp-details-panel">
            <div className="pdp-tabs" role="tablist" aria-label="Product information">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pdp-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pdp-tab-body">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <p className="nl-eyebrow mb-2">Overview</p>
                    <h2 className="nl-heading text-xl sm:text-2xl mb-1">
                      {peptidexDetail?.overviewTitle ?? product.name}
                    </h2>
                    {peptidexDetail?.overviewSubtitle && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--nl-purple)] mb-3">
                        {peptidexDetail.overviewSubtitle}
                      </p>
                    )}
                    <p className="nl-lead whitespace-pre-wrap">
                      {product.longDescription || product.description}
                    </p>
                  </div>

                  {peptidexDetail?.keyFeatures && peptidexDetail.keyFeatures.length > 0 && (
                    <div>
                      {peptidexDetail.keyFeaturesTitle && (
                        <h3 className="rg-card-title mb-3">
                          {peptidexDetail.keyFeaturesTitle}
                        </h3>
                      )}
                      <div className="rg-approach-grid">
                        {peptidexDetail.keyFeatures.map((feature) => (
                          <div key={feature.title} className="rg-approach-card">
                            <h4 className="rg-card-title text-xs uppercase tracking-wider text-[var(--nl-purple)]">
                              {feature.title}
                            </h4>
                            <p className="rg-card-text">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="nl-featured-disclaimer rounded-[var(--nl-radius-lg,1.25rem)] overflow-hidden">
                    <div className="py-5 px-5 sm:py-6 sm:px-6">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="nl-featured-disclaimer-icon shrink-0">
                          <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--nl-bg)]" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-base sm:text-lg font-semibold text-[var(--nl-text)]">
                            {peptidexDetail?.researchNoticeTitle ?? 'Research use only'}
                          </p>
                          <p className="nl-lead mt-2">
                            {peptidexDetail?.researchNotice
                              ?? 'This product is intended for laboratory research purposes only and is not for human or animal consumption. Not intended to diagnose, treat, cure, or prevent any disease.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {product.moreInfo?.trim() && (
                    <div className="space-y-3">
                      <h3 className="rg-card-title">Important Information</h3>
                      <p className="rg-card-text whitespace-pre-wrap">{product.moreInfo}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'technical' && (
                <div>
                  <p className="nl-eyebrow mb-2">Specifications</p>
                  <h2 className="nl-heading text-xl sm:text-2xl mb-4">Properties</h2>
                  <div className="pdp-props-table">
                    {technicalRows.map((row) => (
                      <div key={row.label} className="pdp-props-row">
                        <span className="text-[#A9B3C7] shrink-0">{row.label}</span>
                        <span className="text-[#F4F6FA] sm:text-right break-words">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'lab' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Beaker size={18} className="text-[var(--nl-purple)]" />
                    <h2 className="nl-heading text-xl sm:text-2xl mb-0">
                      {peptidexDetail?.labPreparationTitle ?? 'Lab Preparation'}
                    </h2>
                  </div>

                  {labSections.length > 0 ? (
                    labSections.map((section) => {
                      const steps = isStepByStepSection(section.title)
                        ? parseLabPreparationSteps(section.body)
                        : [];

                      return (
                        <div key={section.title}>
                          <h3 className="rg-card-title mb-2">{section.title}</h3>
                          {steps.length > 0 ? (
                            <ol className="space-y-3">
                              {steps.map((step) => (
                                <li
                                  key={step.number}
                                  className="flex items-start gap-3 text-sm leading-relaxed text-[#A9B3C7]"
                                >
                                  <span className="shrink-0 min-w-[1.75rem] font-mono text-xs font-bold tabular-nums text-[var(--nl-purple)] pt-0.5">
                                    {step.number}
                                  </span>
                                  <span className="min-w-0 flex-1">{step.text}</span>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="nl-lead whitespace-pre-wrap">{section.body}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="nl-lead">Lab preparation details are not available for this product.</p>
                  )}
                </div>
              )}
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
                  <FileText size={16} className={coaData?.hasCoaPdf ? 'text-[var(--nl-purple)]' : 'text-[rgba(251,191,36,0.85)]'} />
                </div>
                <h3 className="rg-card-title">Certificate of Analysis</h3>
                <p className="rg-card-text">
                  {coaData?.hasCoaPdf
                    ? 'View third-party HPLC certificate for this batch'
                    : 'Certificate pending — check back soon for this batch'}
                </p>
              </button>
            )}
            <TrustCard icon={<AlertTriangle size={14} />} title="Research Only" text="Not for therapeutic or cosmetic use" />
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
