import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Clock,
  FileText,
  Plus,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Dosage, Product } from '@/products';
import { formatDosageLabel, getDefaultStorefrontDosage } from '@/products';
import {
  getBuy1UnitPrice,
  getStackedBundleUnitPrice,
  getBundleTotal,
  productExcludesVolumeBundle,
} from '@/utils/pricing';
import type { DiscountSettings } from '@/lib/settings';
import CoaDialog from '@/components/CoaDialog';
import { getCoaDisplayData } from '@/lib/coa-utils';
import { ProductCardStyles } from '@/components/ProductCard';

interface ProductPurchasePanelProps {
  product: Product;
  discountSettings?: Partial<DiscountSettings>;
  variant?: 'default' | 'landing';
  onDosageChange?: (dosage: Dosage) => void;
}

import { CONFIG } from '@/lib/config';

const STOREFRONT_COA_ENABLED = CONFIG.FEATURES.ENABLE_STOREFRONT_COA;

export default function ProductPurchasePanel({
  product,
  discountSettings = {},
  variant = 'default',
  onDosageChange,
}: ProductPurchasePanelProps) {
  const dosageToNum = (d: { mg: number | string }) => {
    const n = typeof d?.mg === 'number' ? d.mg : parseFloat(String(d?.mg));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };

  const dosages = [...(product.dosages ?? [])].sort((a, b) => dosageToNum(a) - dosageToNum(b));
  const defaultDosage = getDefaultStorefrontDosage(product);
  const [sel, setSel] = useState(defaultDosage);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [preorderAdding, setPreorderAdding] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [coaOpen, setCoaOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const purchaseInnerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const selectDosage = (dosage: Dosage) => {
    setSel(dosage);
    onDosageChange?.(dosage);
  };

  useEffect(() => {
    const nextDefault = getDefaultStorefrontDosage(product);
    setSel(nextDefault);
    if (nextDefault) onDosageChange?.(nextDefault);
    setQty(1);
    if (purchaseInnerRef.current) {
      purchaseInnerRef.current.scrollTop = 0;
    }
  }, [product.id, onDosageChange]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (!sel) return null;

  const anyIn = dosages.some((d) => d.inStock);
  const oos = !anyIn;
  const noVolBundle = productExcludesVolumeBundle(product.id, product.name);
  const dEn = discountSettings.discount_enabled ?? true;
  const dP = discountSettings.discount_percentage ?? 20;
  const b2 = discountSettings.buy2_percentage ?? 5;
  const b3 = discountSettings.buy3_percentage ?? 10;

  const unitPrice = getBuy1UnitPrice(sel.originalPrice, discountSettings);
  const save = dEn && !noVolBundle ? sel.originalPrice - unitPrice : 0;

  const addToCart = (quantity = qty, preorder = false) => {
    if (!sel) return;
    if (!preorder && !sel.inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      dosage: formatDosageLabel(sel.mg, sel.unit),
      basePrice: sel.originalPrice,
      price: unitPrice,
      originalPrice: sel.originalPrice,
      quantity,
      image: sel.imageUrl || product.image || '',
      isPreorder: preorder || undefined,
    });
    if (preorder) {
      setPreorderAdding(true);
      setTimeout(() => setPreorderAdding(false), 1500);
    } else {
      setAdding(true);
      setTimeout(() => setAdding(false), 1500);
    }
  };

  const tiers = [
    {
      q: 2,
      pct: b2,
      u: getStackedBundleUnitPrice(sel.originalPrice, 2, discountSettings),
      t: getBundleTotal(sel.originalPrice, 2, discountSettings),
      l: 'Save 5%',
    },
    {
      q: 3,
      pct: b3,
      u: getStackedBundleUnitPrice(sel.originalPrice, 3, discountSettings),
      t: getBundleTotal(sel.originalPrice, 3, discountSettings),
      l: 'Save 10%',
    },
  ];

  const showBundles = !noVolBundle && (product.bundlePricing?.length ?? 0) > 0;
  const coaData = STOREFRONT_COA_ENABLED
    ? getCoaDisplayData(product, formatDosageLabel(sel.mg, sel.unit))
    : null;
  const isLanding = variant === 'landing';

  if (isLanding) {
    return (
      <div className="pdp-purchase-panel">
        <ProductCardStyles />
        <div className="pdp-purchase-inner" ref={purchaseInnerRef}>
          <p className="pdp-ruo-tag">Research Use Only</p>

          <div className="pc-meta-top">
            {product.categoryName && (
              <span className="pc-cat-label">{product.categoryName}</span>
            )}
            <span className="pc-spacer" />
            <span className={`pc-stock-inline ${sel.inStock ? 'in' : 'out'}`}>
              <span className="pc-stock-dot-sm" />
              {sel.inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          <h1 className="pdp-purchase-title">{product.name}</h1>

          {STOREFRONT_COA_ENABLED && (
            <div className="pc-rating-row">
              <div className="pc-links-group">
                <button type="button" className="pc-meta-link pc-meta-link--coa" onClick={() => setCoaOpen(true)}>
                  <FileText size={10} /> COA
                </button>
              </div>
            </div>
          )}

          <div className="pc-divider" />

          <div className="pc-dosage-desktop">
            <span className="pc-dosage-label">Size</span>
            <div className="pc-dosage-chips">
              {dosages.map((d) => {
                const active = String(sel.mg) === String(d.mg) && (sel.unit ?? 'MG') === (d.unit ?? 'MG');
                return (
                  <button
                    key={`${d.mg}-${d.unit ?? 'MG'}`}
                    type="button"
                    className={`pc-chip ${active ? 'active' : ''} ${!d.inStock ? 'oos' : ''}`}
                    onClick={() => selectDosage(d)}
                  >
                    {formatDosageLabel(d.mg, d.unit)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pc-dosage-mobile" ref={ddRef}>
            <button type="button" className="pc-dd-btn" onClick={() => setDdOpen(!ddOpen)}>
              <span>{formatDosageLabel(sel.mg, sel.unit)}</span>
              <ChevronDown
                size={11}
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  transition: 'transform .2s',
                  transform: ddOpen ? 'rotate(180deg)' : 'none',
                  flexShrink: 0,
                }}
              />
            </button>
            {ddOpen && (
              <div className="pc-dd-menu">
                {dosages.map((d) => {
                  const active = String(sel.mg) === String(d.mg) && (sel.unit ?? 'MG') === (d.unit ?? 'MG');
                  return (
                    <button
                      type="button"
                      key={`${d.mg}-${d.unit ?? 'MG'}`}
                      className={`pc-dd-opt ${active ? 'ac' : ''} ${!d.inStock ? 'oos' : ''}`}
                      onClick={() => {
                        selectDosage(d);
                        setDdOpen(false);
                      }}
                    >
                      <span>{formatDosageLabel(d.mg, d.unit)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: d.inStock ? '#22C55E' : '#EF4444' }}>
                        {d.inStock ? '✓' : '✕'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pc-price">
            <div className="pc-price-main-row">
              {dEn && !noVolBundle && <span className="pc-price-strike">${sel.originalPrice.toFixed(2)}</span>}
              <span className={`pc-price-now ${dEn && !noVolBundle ? 'accent' : ''}`}>${unitPrice.toFixed(2)}</span>
              {dEn && save > 0 && !noVolBundle && (
                <span className="pc-price-save-pill">{dP}% off</span>
              )}
            </div>
            {sel && <span className="pc-price-per">per vial · {formatDosageLabel(sel.mg, sel.unit)}</span>}
          </div>

          {showBundles && (
            <div className="pc-bun">
              <div className="pc-bun-h">
                <Zap size={9} color="#C4B5FD" />
                <span>Bundle & Save</span>
              </div>
              <div className="pc-bun-list">
                {tiers.map((tr) => (
                  <button
                    type="button"
                    key={tr.q}
                    className="pc-bun-r"
                    onClick={() => addToCart(tr.q, !sel.inStock)}
                  >
                    <span className="pc-bun-q">{tr.q}x</span>
                    <div className="pc-bun-m">
                      <span className="pc-bun-l">{tr.l}</span>
                      <span className="pc-bun-u">${tr.u.toFixed(2)}/ea</span>
                    </div>
                    <div className="pc-bun-e">
                      <span className="pc-bun-t">${tr.t.toFixed(2)}</span>
                      <span className="pc-bun-s">extra {tr.pct}% off</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pdp-qty-row">
            <span className="pc-dosage-label">Quantity</span>
            <div className="pdp-qty-control">
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((v) => v + 1)}>+</button>
            </div>
          </div>

          {oos ? (
            <button
              type="button"
              className={`pc-cta pre ${preorderAdding ? 'done' : ''}`}
              onClick={() => addToCart(qty, true)}
              disabled={preorderAdding}
            >
              {preorderAdding ? (
                <><Check size={13} /> Added to cart</>
              ) : (
                <><Clock size={14} strokeWidth={2.2} /> Preorder</>
              )}
            </button>
          ) : sel.inStock ? (
            <button
              type="button"
              className={`pc-cta ${adding ? 'done' : 'go'}`}
              onClick={() => addToCart(qty)}
              disabled={adding}
            >
              {adding ? (
                <><Check size={13} /> Added!</>
              ) : (
                <><Plus size={14} strokeWidth={2.5} /> Add to Cart</>
              )}
            </button>
          ) : (
            <button
              type="button"
              className={`pc-cta pre ${preorderAdding ? 'done' : ''}`}
              onClick={() => addToCart(qty, true)}
              disabled={preorderAdding}
            >
              {preorderAdding ? (
                <><Check size={13} /> Added to cart</>
              ) : (
                <><Clock size={14} strokeWidth={2.2} /> Preorder this size</>
              )}
            </button>
          )}
        </div>

        {STOREFRONT_COA_ENABLED && (
          <CoaDialog open={coaOpen} onOpenChange={setCoaOpen} data={coaData} />
        )}
      </div>
    );
  }

  const shellClass = 'rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[#111827] p-6';

  return (
    <div className={shellClass}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#EF4444] mb-2">
            Research Use Only
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F4F6FA]">{product.name}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className={`inline-flex items-center gap-2 text-xs font-semibold ${sel.inStock ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          <span className={`w-2 h-2 rounded-full ${sel.inStock ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
          {sel.inStock ? 'In stock' : 'Out of stock'}
        </span>
        {STOREFRONT_COA_ENABLED && (
          <button
            type="button"
            onClick={() => setCoaOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.12)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] text-[#4ADE80] transition-colors hover:bg-[rgba(34,197,94,0.2)]"
          >
            <FileText size={12} />
            COA
          </button>
        )}
      </div>

      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A9B3C7] mb-2">Size</p>
        <div className="hidden md:flex flex-wrap gap-2">
          {dosages.map((d) => {
            const active = String(sel.mg) === String(d.mg) && (sel.unit ?? 'MG') === (d.unit ?? 'MG');
            return (
              <button
                key={`${d.mg}-${d.unit ?? 'MG'}`}
                type="button"
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  active
                    ? 'border-[rgba(46,209,180,0.45)] bg-[rgba(46,209,180,0.12)] text-[#5EEAD4]'
                    : 'border-[rgba(244,246,250,0.08)] bg-[rgba(255,255,255,0.02)] text-[#A9B3C7] hover:border-[rgba(46,209,180,0.25)]'
                } ${!d.inStock ? 'opacity-70' : ''}`}
                onClick={() => selectDosage(d)}
              >
                {formatDosageLabel(d.mg, d.unit)}
              </button>
            );
          })}
        </div>

        <div className="md:hidden relative" ref={ddRef}>
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[rgba(244,246,250,0.08)] bg-[rgba(255,255,255,0.03)] text-[#F4F6FA]"
            onClick={() => setDdOpen((v) => !v)}
          >
            <span>{formatDosageLabel(sel.mg, sel.unit)}</span>
            <ChevronDown size={14} className={`transition-transform ${ddOpen ? 'rotate-180' : ''}`} />
          </button>
          {ddOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-2 rounded-xl border border-[rgba(244,246,250,0.1)] bg-[#0C1018] overflow-hidden shadow-xl">
              {dosages.map((d) => {
                const active = String(sel.mg) === String(d.mg) && (sel.unit ?? 'MG') === (d.unit ?? 'MG');
                return (
                  <button
                    key={`${d.mg}-${d.unit ?? 'MG'}-mobile`}
                    type="button"
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm ${active ? 'bg-[rgba(46,209,180,0.08)] text-[#2ED1B4]' : 'text-[#F4F6FA]'}`}
                    onClick={() => {
                      selectDosage(d);
                      setDdOpen(false);
                    }}
                  >
                    <span>{formatDosageLabel(d.mg, d.unit)}</span>
                    <span className={d.inStock ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                      {d.inStock ? 'In stock' : 'Out of stock'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-end gap-3 flex-wrap">
          {dEn && !noVolBundle && (
            <span className="text-sm text-[#A9B3C7] line-through">${sel.originalPrice.toFixed(2)}</span>
          )}
          <span className="text-3xl font-bold text-[#2ED1B4]">${unitPrice.toFixed(2)}</span>
          {save > 0 && (
            <span className="text-xs font-semibold text-[#34D399] px-2 py-1 rounded-md bg-[rgba(52,211,153,0.1)]">
              {dP}% off
            </span>
          )}
        </div>
        <p className="text-xs text-[#A9B3C7] mt-1">
          per vial · {formatDosageLabel(sel.mg, sel.unit)}
        </p>
      </div>

      {showBundles && (
        <div className="mb-5 rounded-xl border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.05)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[rgba(139,92,246,0.1)] text-[11px] font-bold uppercase tracking-[0.12em] text-[#C4B5FD]">
            <Zap size={12} />
            Bundle & Save
          </div>
          <div className="p-2 space-y-1">
            {tiers.map((tier) => (
              <button
                key={tier.q}
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[rgba(139,92,246,0.08)] transition-colors text-left"
                onClick={() => addToCart(tier.q, !sel.inStock)}
              >
                <span className="text-sm text-[#F4F6FA]">Buy {tier.q}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#F4F6FA]">${tier.t.toFixed(2)}</div>
                  <div className="text-[11px] text-[#A9B3C7]">${tier.u.toFixed(2)}/ea · extra {tier.pct}% off</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center rounded-xl border border-[rgba(244,246,250,0.08)] overflow-hidden">
          <button
            type="button"
            className="px-3 py-2 text-[#F4F6FA] hover:bg-[rgba(255,255,255,0.04)]"
            onClick={() => setQty((v) => Math.max(1, v - 1))}
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-[#F4F6FA] min-w-[3rem] text-center">{qty}</span>
          <button
            type="button"
            className="px-3 py-2 text-[#F4F6FA] hover:bg-[rgba(255,255,255,0.04)]"
            onClick={() => setQty((v) => v + 1)}
          >
            +
          </button>
        </div>
      </div>

      {oos ? (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-[rgba(251,191,36,0.15)] text-[#FDE68A] border border-[rgba(251,191,36,0.35)]"
          onClick={() => addToCart(qty, true)}
          disabled={preorderAdding}
        >
          {preorderAdding ? <><Check size={16} /> Added to cart</> : <><Clock size={16} /> Preorder</>}
        </button>
      ) : sel.inStock ? (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-[#0B1220] text-[#F4F6FA] border border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.16)] hover:border-[rgba(139,92,246,0.58)] hover:shadow-[0_16px_48px_-20px_rgba(139,92,246,0.7)] active:translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-[#0B1220] disabled:hover:border-[rgba(139,92,246,0.28)]"
          onClick={() => addToCart(qty)}
          disabled={adding}
        >
          {adding ? <><Check size={16} /> Added!</> : <><Plus size={16} /> Add to Cart</>}
        </button>
      ) : (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-[rgba(251,191,36,0.15)] text-[#FDE68A] border border-[rgba(251,191,36,0.35)]"
          onClick={() => addToCart(qty, true)}
          disabled={preorderAdding}
        >
          {preorderAdding ? <><Check size={16} /> Added to cart</> : <><Clock size={16} /> Preorder this size</>}
        </button>
      )}

      {STOREFRONT_COA_ENABLED && (
        <>
          <button
            type="button"
            onClick={() => setCoaOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-[rgba(46,209,180,0.25)] bg-[rgba(46,209,180,0.06)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.12)] transition-colors"
          >
            <FileText size={16} />
            View Certificate of Analysis
          </button>

          <CoaDialog open={coaOpen} onOpenChange={setCoaOpen} data={coaData} />
        </>
      )}
    </div>
  );
}
