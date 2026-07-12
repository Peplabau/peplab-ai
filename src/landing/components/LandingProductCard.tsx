import { useState, useRef, useEffect } from "react";
import {
  Flame,
  Star,
  ChevronDown,
  AlertCircle,
  Zap,
  FileText,
  Shield,
  Beaker,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { shopUrl, coaArchiveUrl } from "@/landing/lib/site";
import { productExcludesVolumeBundle } from "@/landing/utils/pricing";
import { normalizeImageUrl } from "@/landing/lib/static-data";

/*
  Replace these stubs with your actual imports:
  import type { Product } from '@/landing/products';
  import { useCart } from '@/landing/context/CartContext';
  import { getStorefrontPrice, ... } from '@/landing/utils/pricing';
  import { formatDosageLabel, getDefaultStorefrontDosage } from '@/landing/products';
*/
const formatDosageLabel = (mg, unit) => `${mg}${unit ?? "mg"}`;
const getStorefrontPrice = (o, e, p) => (e ? +(o * (1 - p / 100)).toFixed(2) : o);
const getStorefrontSavings = (o, e, p) => (e ? +(o * (p / 100)).toFixed(2) : 0);
const getBundleLabel = (q) => `Buy ${q}`;
const getStorefrontBundleUnitPrice = (o, e, m, b) => {
  const base = e ? o * (1 - m / 100) : o;
  return +(base * (1 - b / 100)).toFixed(2);
};
const getStorefrontBundleTotal = (o, q, e, m, b) =>
  +(getStorefrontBundleUnitPrice(o, e, m, b) * q).toFixed(2);
// Default variant shown on the card:
//   1. 5mg in-stock if available
//   2. otherwise the smallest in-stock dosage
//   3. otherwise the smallest overall dosage
const getDefaultStorefrontDosage = (p) => {
  const dosages = p.dosages ?? [];
  if (dosages.length === 0) return null;
  const toNum = (d) => {
    const n = typeof d.mg === "number" ? d.mg : parseFloat(String(d.mg));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };
  const isMgUnit = (d) => (d.unit ?? "MG") === "MG";
  const fiveMg = dosages.find((d) => d.inStock && isMgUnit(d) && toNum(d) === 5);
  if (fiveMg) return fiveMg;
  const inStockSorted = dosages.filter((d) => d.inStock).sort((a, b) => toNum(a) - toNum(b));
  if (inStockSorted.length > 0) return inStockSorted[0];
  return [...dosages].sort((a, b) => toNum(a) - toNum(b))[0] ?? null;
};

export default function LandingProductCard({
  product,
  discountSettings = {},
  linkToDetail = true,
}) {
  const isLanding = true;
  const dosageToNum = (d) => {
    const n = typeof d?.mg === "number" ? d.mg : parseFloat(String(d?.mg));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };
  const dosages = [...(product.dosages ?? [])].sort((a, b) => dosageToNum(a) - dosageToNum(b));
  const defaultDosage = getDefaultStorefrontDosage(product);
  const [sel, setSel] = useState(defaultDosage);
  const [adding, setAdding] = useState(false);
  const [preorderAdding, setPreorderAdding] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [imgOk, setImgOk] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ddRef = useRef(null);
  const addItem = () => {};

  const goToDetail = () => {
    if (!linkToDetail) return;
    window.location.href = shopUrl(`/product/${product.id}`);
  };

  const handleCardClick = (e) => {
    if (!linkToDetail) return;
    const target = e.target;
    if (target?.closest?.('button, a, input, select, textarea, [data-no-navigate]')) return;
    goToDetail();
  };

  useEffect(() => {
    const h = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!sel) return null;

  const anyIn = dosages.some((d) => d.inStock);
  const oos = !anyIn;

  const dEn = discountSettings.discount_enabled ?? true;
  const dP = discountSettings.discount_percentage ?? 20;
  const b2 = discountSettings.buy2_percentage ?? 5;
  const b3 = discountSettings.buy3_percentage ?? 10;

  const price = getStorefrontPrice(sel.originalPrice, dEn, dP);
  const save = getStorefrontSavings(sel.originalPrice, dEn, dP);

  const doAdd = (e?: React.MouseEvent, qty = 1) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!sel?.inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      dosage: formatDosageLabel(sel.mg, sel.unit),
      basePrice: sel.originalPrice,
      price,
      originalPrice: sel.originalPrice,
      quantity: qty,
      image: product.image ?? '',
    });
    setAdding(true);
    setTimeout(() => setAdding(false), 1500);
  };

  const doPreorder = (e?: React.MouseEvent, qty = 1) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!sel || sel.inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      dosage: formatDosageLabel(sel.mg, sel.unit),
      basePrice: sel.originalPrice,
      price,
      originalPrice: sel.originalPrice,
      quantity: qty,
      image: product.image ?? '',
      isPreorder: true,
    });
    setPreorderAdding(true);
    setTimeout(() => setPreorderAdding(false), 1500);
  };

  const tiers = [
    { q: 2, l: getBundleLabel(2), pct: b2, u: getStorefrontBundleUnitPrice(sel.originalPrice, dEn, dP, b2), t: getStorefrontBundleTotal(sel.originalPrice, 2, dEn, dP, b2) },
    { q: 3, l: getBundleLabel(3), pct: b3, u: getStorefrontBundleUnitPrice(sel.originalPrice, dEn, dP, b3), t: getStorefrontBundleTotal(sel.originalPrice, 3, dEn, dP, b3) },
  ];

  const noVolBundle = productExcludesVolumeBundle(product.id, product.name);
  const showB = !noVolBundle && (product.bundlePricing?.length ?? 0) > 0;

  const bdg = (() => {
    if (product.badge?.includes("OUT OF STOCK"))
      return { c: "#EF4444", ic: <AlertCircle size={8} />, label: "Out of Stock" };
    if (product.category === "best-seller")
      return { c: "#F59E0B", ic: <Flame size={8} />, label: "Bestseller" };
    if (product.category === "high-popularity")
      return { c: "#A78BFA", ic: <Star size={8} />, label: "Trending" };
    return null;
  })();

  const handleOpenCoa = (e: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    window.location.href = coaArchiveUrl();
  };

  return (
    <>
      <style>{STYLES}</style>

      <div
        className={`pc ${isLanding ? 'pc-landing' : ''} ${oos ? "pc-oos" : ""} ${ddOpen ? "pc-dd-open" : ""} ${linkToDetail ? "pc-clickable" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (!linkToDetail) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToDetail();
          }
        }}
        role={linkToDetail ? 'link' : undefined}
        tabIndex={linkToDetail ? 0 : undefined}
      >
        {/* Accent line on hover — desktop only */}
        <div className={`pc-accent-line ${hovered ? "visible" : ""}`} />

        {/* ══════ IMAGE AREA ══════ */}
        <div className="pc-img-area">
          <div className="pc-img-inner">
            <img
              src={product.image}
              alt={product.name}
              className={imgOk ? "ok" : ""}
              onLoad={() => setImgOk(true)}
            />
          </div>

          {/* Bottom gradient — desktop */}
          <div className="pc-img-grad-bot" />
          {/* Top gradient — desktop */}
          <div className="pc-img-grad-top" />

          {/* Discount badge */}
          {dEn && (
            <span className="pc-sale-badge">-{dP}%</span>
          )}

          {/* Category badge */}
          {bdg && (
            <span className={`pc-cat-badge ${isLanding ? 'pc-landing-promo' : ''}`}>{bdg.label}</span>
          )}

          {isLanding && (
            <span className={`pc-landing-stock ${sel.inStock ? 'in' : 'out'}`}>
              <span className="pc-landing-stock-dot" aria-hidden />
              {sel.inStock ? 'In stock' : 'Out of stock'}
            </span>
          )}

          {isLanding && product.categoryName && (
            <span className="pc-landing-cat">{product.categoryName}</span>
          )}

          {/* Desktop hover overlay with quick-add */}
          {!isLanding && (
          <div className={`pc-hover-overlay ${hovered ? "show" : ""}`}>
            {!oos && (
              <button className="pc-quick-add" onClick={doAdd} disabled={adding}>
                <Plus size={13} strokeWidth={3} />
                {adding ? "Adding…" : "Quick Add"}
              </button>
            )}
            <span className="pc-view-link" onClick={(e) => { e.stopPropagation(); goToDetail(); }}>
              View Details <ArrowUpRight size={11} strokeWidth={2.5} />
            </span>
          </div>
          )}
        </div>

        {/* ══════ BODY ══════ */}
        {isLanding ? (
          <div className="pc-body pc-body-landing">
            <div className="pc-landing-head">
              <h3 className="pc-landing-name">{product.name}</h3>
              <span className="pc-landing-hplc">99%+ HPLC</span>
            </div>
            <p className="pc-landing-specs">
              {formatDosageLabel(sel.mg, sel.unit)}
              <span className="pc-landing-spec-sep">/</span>
              Lyophilised
              <span className="pc-landing-spec-sep">/</span>
              {product.coaUrl?.trim() ? 'COA on file' : 'Batch tested'}
            </p>
            <div className="pc-landing-sep" aria-hidden />
            <div className="pc-landing-foot">
              <div className="pc-landing-price-block">
                {dEn && !noVolBundle && (
                  <span className="pc-landing-price-was">${sel.originalPrice.toFixed(2)}</span>
                )}
                <div className="pc-landing-price-row">
                  <span className="pc-landing-price">${price.toFixed(2)}</span>
                  <span className="pc-landing-per">per vial</span>
                </div>
              </div>
              <button
                type="button"
                className="pc-landing-view"
                data-no-navigate
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToDetail();
                }}
              >
                <span>View</span>
                <span className="pc-landing-view-icon" aria-hidden>
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>
        ) : (
        <div className="pc-body">

          {/* Category + stock — desktop layout */}
          <div className="pc-meta-top">
            {product.categoryName && (
              <span className="pc-cat-label">{product.categoryName}</span>
            )}
            <span className="pc-spacer" />
            <span className={`pc-stock-inline ${sel.inStock ? "in" : "out"}`}>
              <span className="pc-stock-dot-sm" />
              {sel.inStock ? "In stock" : "Out of stock"}
            </span>
          </div>

          {/* Name */}
          <h3 className={`pc-name ${hovered ? "pc-name-hover" : ""}`}>{product.name}</h3>

          {/* Mobile: research tag */}
          <p className="pc-ruo-mobile">Research Use Only</p>

          {/* Stars + COA */}
          <div className="pc-rating-row">
            <div className="pc-stars-group">
              <div className="pc-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span className="pc-review-ct">({product.reviewCount})</span>
            </div>
            <div className="pc-links-group">
              {product.coaUrl?.trim() ? (
                <button className="pc-meta-link" onClick={handleOpenCoa}>
                  <FileText size={10} /> COA
                </button>
              ) : (
                // Awaiting Lab Results hidden per request
                // <span className="pc-meta-awaiting">
                //   <Clock size={10} /> Awaiting Lab Results
                // </span>
                null
              )}
            </div>
          </div>

          {/* Divider — desktop */}
          <div className="pc-divider" />

          {/* Mobile stock indicator */}
          <div className="pc-stock-mobile">
            <span className={`pc-stk-dot ${sel.inStock ? "in" : "out"}`} />
            <span style={{ fontSize: 8, fontWeight: 600, color: sel.inStock ? "#22C55E" : "#EF4444" }}>
              {sel.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Dosage: mobile = dropdown, desktop = chips */}
          {/* Desktop chips */}
          <div className="pc-dosage-desktop">
            <span className="pc-dosage-label">Size</span>
            <div className="pc-dosage-chips">
              {dosages.map((d) => {
                const ac = String(sel.mg) === String(d.mg) && (sel.unit ?? "MG") === (d.unit ?? "MG");
                return (
                  <button
                    key={`${d.mg}-${d.unit ?? "MG"}`}
                    type="button"
                    className={`pc-chip ${ac ? "active" : ""} ${!d.inStock ? "oos" : ""}`}
                    onClick={(e) => { e.preventDefault(); setSel(d); }}
                  >
                    {formatDosageLabel(d.mg, d.unit)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile dropdown */}
          <div className="pc-dosage-mobile" ref={ddRef}>
            <button type="button" className="pc-dd-btn" onClick={() => setDdOpen(!ddOpen)}>
              <span>{formatDosageLabel(sel.mg, sel.unit)}</span>
              <ChevronDown size={11} style={{ color: "rgba(255,255,255,0.3)", transition: "transform .2s", transform: ddOpen ? "rotate(180deg)" : "none", flexShrink: 0 }} />
            </button>
            {ddOpen && (
              <div className="pc-dd-menu">
                {dosages.map((d) => {
                  const ac = String(sel.mg) === String(d.mg) && (sel.unit ?? "MG") === (d.unit ?? "MG");
                  return (
                    <button
                      type="button"
                      key={`${d.mg}-${d.unit ?? "MG"}`}
                      className={`pc-dd-opt ${ac ? "ac" : ""} ${!d.inStock ? "oos" : ""}`}
                      onClick={() => { setSel(d); setDdOpen(false); }}
                    >
                      <span>{formatDosageLabel(d.mg, d.unit)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: d.inStock ? "#22C55E" : "#EF4444" }}>
                        {d.inStock ? "✓" : "✕"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="pc-price">
            <div className="pc-price-main-row">
              {dEn && !noVolBundle && <span className="pc-price-strike">${sel.originalPrice.toFixed(2)}</span>}
              <span className={`pc-price-now ${dEn && !noVolBundle ? "accent" : ""}`}>${price.toFixed(2)}</span>
              {dEn && save > 0 && !noVolBundle && (
                <span className="pc-price-save-pill">{dP}% off</span>
              )}
            </div>
            {sel && <span className="pc-price-per">per vial · {formatDosageLabel(sel.mg, sel.unit)}</span>}
          </div>

          {/* Trust badges — desktop */}
          <div className="pc-trust">
            <div className="pc-trust-item">
              <Shield size={11} /> Lab Verified
            </div>
            <div className="pc-trust-item dim">
              <Beaker size={11} /> HPLC Tested
            </div>
          </div>

          {/* Bundle */}
          {showB && (
            <div className="pc-bun">
              <div className="pc-bun-h"><Zap size={9} color="#C4B5FD" /><span>Bundle & Save</span></div>
              <div className="pc-bun-list">
                {tiers.map((tr) => {
                  const sv = (sel.originalPrice - tr.u) * tr.q;
                  return (
                    <button
                      type="button"
                      key={tr.q}
                      className="pc-bun-r"
                      onClick={(e) => (sel.inStock ? doAdd(e, tr.q) : doPreorder(e, tr.q))}
                    >
                      <span className="pc-bun-q">{tr.q}x</span>
                      <div className="pc-bun-m">
                        <span className="pc-bun-l">{tr.l}</span>
                        <span className="pc-bun-u">${tr.u.toFixed(2)}/ea</span>
                      </div>
                      <div className="pc-bun-e">
                        <span className="pc-bun-t">${tr.t.toFixed(2)}</span>
                        <span className="pc-bun-s">Save ${sv.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fully OOS: preorder only */}
          {oos && (
            <div className="pc-oos-actions">
              <button
                type="button"
                className={`pc-cta pre ${preorderAdding ? "done" : ""}`}
                onClick={doPreorder}
                disabled={preorderAdding}
              >
                {preorderAdding ? (
                  <><Check size={13} /> Added to cart</>
                ) : (
                  <><Clock size={14} strokeWidth={2.2} /> Preorder</>
                )}
              </button>
            </div>
          )}

          {/* CTA — in-stock add to cart; partial OOS preorder selected size */}
          {!oos && sel.inStock && (
            <button
              type="button"
              className={`pc-cta ${adding ? "done" : "go"}`}
              onClick={doAdd}
              disabled={adding}
            >
              {adding ? (
                <><Check size={13} /> Added!</>
              ) : (
                <><Plus size={14} strokeWidth={2.5} /> Add to Cart</>
              )}
            </button>
          )}
          {!oos && !sel.inStock && (
            <button
              type="button"
              className={`pc-cta pre ${preorderAdding ? "done" : ""}`}
              onClick={doPreorder}
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
        )}
      </div>

    </>
  );
}

/* ═════════════════════════════════════
   STYLES
   ═════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

/* ── CARD ── */
.pc {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Outfit', system-ui, sans-serif;
  color: #EDF0F7;
  height: 100%;
  background: #0C0C10;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s, box-shadow 0.4s;
}
.pc *, .pc *::before, .pc *::after { box-sizing: border-box; margin: 0; padding: 0; }
.pc:hover {
  transform: translateY(-4px);
  border-color: rgba(46,209,180,0.12);
  box-shadow: 0 16px 48px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(46,209,180,0.06), inset 0 1px 0 0 rgba(46,209,180,0.06);
}
.pc.pc-clickable { cursor: pointer; }
.pc.pc-oos { border-color: rgba(248,113,113,0.12); }
.pc.pc-oos .pc-img-inner img.ok { opacity: 0.72; }

/* Accent line */
.pc-accent-line {
  position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 20; pointer-events: none;
  background: linear-gradient(90deg, transparent, #2ED1B4, transparent);
  opacity: 0; transition: opacity 0.4s;
}
.pc-accent-line.visible { opacity: 1; }

/* ══════ IMAGE ══════ */
.pc-img-area {
  position: relative;
  overflow: hidden;
  /* Mobile: square */
  aspect-ratio: 1/1;
  background: #08080B;
}
.pc-img-inner {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.pc-img-inner img {
  width: 85%; height: 85%; object-fit: contain;
  opacity: 0;
  transition: opacity 0.35s, transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.pc-img-inner img.ok { opacity: 1; }
.pc:hover .pc-img-inner img.ok { transform: scale(1.05); }

/* Gradient overlays — hidden mobile, shown desktop */
.pc-img-grad-bot, .pc-img-grad-top { display: none; }

/* Sale badge */
.pc-sale-badge {
  position: absolute; top: 8px; right: 8px; z-index: 10;
  padding: 3px 8px; border-radius: 6px;
  background: #DC2626; color: white;
  font-size: 10px; font-weight: 800; letter-spacing: 0.02em;
}

/* Category badge */
.pc-cat-badge {
  position: absolute; top: 8px; left: 8px; z-index: 10;
  padding: 2px 8px; border-radius: 6px;
  font-size: 8px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.8);
  background: rgba(0,0,0,0.5); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
}

/* Hover overlay — hidden on mobile */
.pc-hover-overlay {
  display: none;
}

/* ══════ BODY ══════ */
.pc-body { flex: 1; display: flex; flex-direction: column; padding: 8px; }

/* Desktop meta top row — hidden mobile */
.pc-meta-top { display: none; }

.pc-name {
  font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.92);
  line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.25s;
}
.pc-name-hover { color: #2ED1B4; }

.pc-ruo-mobile {
  font-size: 6.5px; font-weight: 600; color: #EF4444;
  letter-spacing: 0.8px; text-transform: uppercase;
  margin: 1px 0 5px; opacity: 0.8;
}

/* Stars + links */
.pc-rating-row {
  display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 5px;
}
.pc-stars-group { display: flex; align-items: center; gap: 4px; }
.pc-stars { display: flex; gap: 0.5px; }
.pc-review-ct { font-size: 8px; color: rgba(255,255,255,0.25); }
.pc-links-group { display: flex; gap: 4px; margin-left: auto; }
.pc-meta-link {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 8px; font-weight: 500; color: rgba(255,255,255,0.25);
  background: none; border: none; cursor: pointer; padding: 2px 4px; border-radius: 4px;
  transition: color 0.2s; font-family: 'Outfit', sans-serif;
}
.pc-meta-link:hover { color: #2ED1B4; }
.pc-meta-awaiting {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 7px; font-weight: 600; color: rgba(251,191,36,0.55);
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 2px 4px; border-radius: 4px;
  font-family: 'Outfit', sans-serif;
}

/* Divider — desktop only */
.pc-divider { display: none; }

/* Mobile stock */
.pc-stock-mobile {
  display: flex; align-items: center; gap: 4px; margin-bottom: 6px;
}
.pc-stk-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.pc-stk-dot.in { background: #22C55E; box-shadow: 0 0 6px rgba(34,197,94,0.4); animation: pcP 2s infinite; }
.pc-stk-dot.out { background: #EF4444; }
@keyframes pcP { 0%,100%{box-shadow:0 0 3px rgba(34,197,94,0.2)} 50%{box-shadow:0 0 9px rgba(34,197,94,0.5)} }

/* ── DOSAGE ── */
/* Desktop chips — hidden mobile */
.pc-dosage-desktop { display: none; }
.pc-dosage-label {
  display: block; margin-bottom: 6px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.2);
}
.pc-dosage-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.pc-chip {
  padding: 6px 14px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.45);
  cursor: pointer; transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
}
.pc-chip:hover { border-color: rgba(46,209,180,0.3); color: rgba(255,255,255,0.6); }
.pc-chip.active {
  background: rgba(46,209,180,0.1); border-color: rgba(46,209,180,0.35);
  color: #5EEAD4; box-shadow: 0 0 12px rgba(46,209,180,0.1);
}
.pc-chip.oos {
  border-style: dashed;
  border-color: rgba(251,191,36,0.22);
  color: rgba(255,255,255,0.45);
}
.pc-chip.oos:hover { border-color: rgba(251,191,36,0.4); color: rgba(253,230,138,0.85); }
.pc-chip.oos.active {
  border-style: solid;
  border-color: rgba(251,191,36,0.55);
  background: rgba(251,191,36,0.1);
  color: #FBBF24;
  box-shadow: 0 0 12px rgba(245,158,11,0.12);
}

/* Mobile dropdown */
.pc-dosage-mobile { position: relative; margin-bottom: 8px; }
.pc-dd-btn {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 6px 8px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: #EDF0F7; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600;
  cursor: pointer; transition: border-color 0.2s;
}
.pc-dd-btn:hover { border-color: rgba(46,209,180,0.3); }
.pc-dd-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.pc-dd-menu {
  position: absolute; top: calc(100% + 3px); left: 0; right: 0; z-index: 60;
  border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(10,14,28,0.96); backdrop-filter: blur(24px);
  box-shadow: 0 14px 40px rgba(0,0,0,0.55); overflow: hidden;
}

/* ── Mobile-only dropdown fixes ── */
/* When dropdown is open, let the card overflow so the menu isn't clipped. */
@media (max-width: 767px) {
  .pc.pc-dd-open { overflow: visible; }
  /* Keep the non-dropdown parts of the card clipped (image, accent line, etc.)
     by re-hiding the inner content wrapper – only the dropdown escapes. */
  .pc.pc-dd-open .pc-inner { overflow: visible; }
  .pc-dd-menu {
    z-index: 9999;
    /* Scroll within the menu itself so it never needs to escape the viewport. */
    max-height: 220px;
    overflow-y: auto;
    overflow-x: hidden;
    /* Slim scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(46,209,180,0.35) transparent;
  }
  .pc-dd-menu::-webkit-scrollbar { width: 3px; }
  .pc-dd-menu::-webkit-scrollbar-track { background: transparent; }
  .pc-dd-menu::-webkit-scrollbar-thumb { background: rgba(46,209,180,0.35); border-radius: 3px; }
}
.pc-dd-opt {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 10px; border: none; background: none;
  color: #EDF0F7; font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  cursor: pointer; transition: background 0.15s;
}
.pc-dd-opt:hover { background: rgba(46,209,180,0.08); }
.pc-dd-opt.ac { background: rgba(46,209,180,0.1); color: #2ED1B4; }
.pc-dd-opt.oos { background: rgba(251,191,36,0.04); }
.pc-dd-opt + .pc-dd-opt { border-top: 1px solid rgba(255,255,255,0.05); }

/* ── PRICE ── */
.pc-price { margin-bottom: 8px; }
.pc-price-main-row { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.pc-price-strike { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.2); text-decoration: line-through; text-decoration-color: rgba(255,255,255,0.1); }
.pc-price-now { font-size: 20px; font-weight: 800; color: white; letter-spacing: -0.025em; line-height: 1; }
.pc-price-now.accent { color: #2ED1B4; }
.pc-price-save-pill {
  font-size: 10px; font-weight: 600; color: #34D399;
  padding: 2px 7px; border-radius: 5px;
  background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.1);
}
.pc-price-per { display: block; font-size: 10px; color: rgba(255,255,255,0.18); margin-top: 2px; }

/* Trust badges — desktop only */
.pc-trust { display: none; }

/* ── BUNDLE ── */
.pc-bun {
  border-radius: 10px; border: 1px solid rgba(139,92,246,0.1);
  background: rgba(139,92,246,0.04); overflow: hidden; margin-bottom: 8px;
}
.pc-bun-h {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 8px; border-bottom: 1px solid rgba(139,92,246,0.08);
  font-size: 8px; font-weight: 700; color: #C4B5FD;
  letter-spacing: 0.8px; text-transform: uppercase;
}
.pc-bun-list { padding: 4px; display: flex; flex-direction: column; gap: 3px; }
.pc-bun-r {
  display: flex; align-items: center; gap: 6px; width: 100%;
  padding: 6px; border-radius: 7px; border: 1px solid transparent;
  background: rgba(255,255,255,0.02);
  cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;
}
.pc-bun-r:hover { background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.15); }
.pc-bun-q {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 5px;
  background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.06));
  color: #C4B5FD; font-size: 8px; font-weight: 700; flex-shrink: 0;
}
.pc-bun-m { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pc-bun-l { font-size: 10px; font-weight: 600; color: #EDF0F7; }
.pc-bun-u { font-size: 7px; color: rgba(255,255,255,0.3); font-family: 'IBM Plex Mono', monospace; }
.pc-bun-e { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.pc-bun-t { font-size: 12px; font-weight: 700; color: #EDF0F7; line-height: 1.1; }
.pc-bun-s { font-size: 7px; font-weight: 700; color: #22C55E; padding: 1px 3px; border-radius: 3px; background: rgba(34,197,94,0.08); }

/* ── CTA ── */
.pc-cta {
  margin-top: auto; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  border: none; font-family: 'Outfit', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: 0.01em;
  cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
  padding: 10px; border-radius: 10px;
}
.pc-cta.go { background: #2ED1B4; color: #060910; }
.pc-cta.go:hover { background: #38DCC0; box-shadow: 0 6px 24px rgba(46,209,180,0.3); transform: translateY(-1px); }
.pc-cta.go:active { transform: translateY(0); }
.pc-cta.done { background: rgba(46,209,180,0.1); color: rgba(255,255,255,0.35); }
.pc-cta.pre {
  background: linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08));
  color: #FDE68A;
  border: 1px solid rgba(251,191,36,0.35);
}
.pc-cta.pre:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(251,191,36,0.28), rgba(245,158,11,0.12));
  border-color: rgba(251,191,36,0.5);
  box-shadow: 0 6px 20px rgba(245,158,11,0.15);
}
.pc-cta.pre:disabled { opacity: 0.55; cursor: wait; }
.pc-cta.pre.done {
  background: rgba(245,158,11,0.1);
  color: rgba(253,230,138,0.45);
  border-color: rgba(245,158,11,0.15);
}

/* Fully OOS: preorder button only */
.pc-oos-actions {
  margin-top: auto;
  width: 100%;
}

/* ═══════════════════════════════════
   DESKTOP (≥640px) — match production card style
   ═══════════════════════════════════ */
@media (min-width: 640px) {
  .pc { border-radius: 16px; }

  /* Image: taller 4:5 ratio */
  .pc-img-area { aspect-ratio: 4/5; }

  /* Show gradient overlays */
  .pc-img-grad-bot {
    display: block; position: absolute; inset: auto 0 0 0; z-index: 1; pointer-events: none;
    height: 100px; background: linear-gradient(to top, #0C0C10, transparent);
  }
  .pc-img-grad-top {
    display: block; position: absolute; inset: 0 0 auto 0; z-index: 1; pointer-events: none;
    height: 60px; background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
  }

  /* Show hover overlay */
  .pc-hover-overlay {
    display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
    position: absolute; inset: 0; z-index: 3;
    padding-bottom: 16px; gap: 8px; pointer-events: none;
    background: transparent; opacity: 0;
    transition: opacity 0.35s, background 0.35s;
  }
  .pc-hover-overlay.show {
    opacity: 1;
    background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 40%, transparent 60%);
  }
  .pc-quick-add {
    pointer-events: auto;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 22px; border-radius: 100px; border: none;
    background: #2ED1B4; color: #060910;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 0.02em; cursor: pointer;
    box-shadow: 0 4px 16px rgba(46,209,180,0.3);
    transform: translateY(8px);
    transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s;
  }
  .pc-hover-overlay.show .pc-quick-add { transform: translateY(0); }
  .pc-quick-add:hover { box-shadow: 0 6px 24px rgba(46,209,180,0.4); }

  .pc-view-link {
    pointer-events: auto;
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.7);
    cursor: pointer; transition: color 0.2s, transform 0.35s cubic-bezier(0.16,1,0.3,1) 0.04s;
    transform: translateY(6px);
  }
  .pc-hover-overlay.show .pc-view-link { transform: translateY(0); }
  .pc-view-link:hover { color: white; }

  .pc-sale-badge { top: 12px; right: 12px; padding: 4px 10px; font-size: 11px; border-radius: 8px; }
  .pc-cat-badge { top: 12px; left: 12px; font-size: 9px; padding: 3px 10px; }

  /* Body */
  .pc-body { padding: 16px 16px 20px; }

  /* Show desktop meta row */
  .pc-meta-top {
    display: flex; align-items: center; margin-bottom: 8px;
  }
  .pc-cat-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
  }
  .pc-spacer { flex: 1; }
  .pc-stock-inline {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 550;
  }
  .pc-stock-inline.in { color: rgba(52,211,153,0.7); }
  .pc-stock-inline.out { color: rgba(248,113,113,0.7); }
  .pc-stock-dot-sm {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
    box-shadow: 0 0 6px currentColor;
  }

  /* Hide mobile-only elements */
  .pc-ruo-mobile { display: none; }
  .pc-stock-mobile { display: none; }
  .pc-dosage-mobile { display: none; }

  /* Show desktop elements */
  .pc-dosage-desktop { display: block; margin-bottom: 14px; }
  .pc-divider {
    display: block; height: 1px; margin-bottom: 12px;
    background: linear-gradient(90deg, rgba(46,209,180,0.1), rgba(255,255,255,0.04), transparent);
  }
  .pc-trust {
    display: flex; align-items: center; gap: 16px; margin-bottom: 14px;
  }
  .pc-trust-item {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 500; color: rgba(52,211,153,0.6);
  }
  .pc-trust-item.dim { color: rgba(255,255,255,0.25); }

  .pc-name { font-size: 16px; font-weight: 660; line-height: 1.3; margin-bottom: 4px; }
  .pc-rating-row { margin-bottom: 10px; gap: 6px; }
  .pc-review-ct { font-size: 11px; color: rgba(255,255,255,0.3); }
  .pc-meta-link { font-size: 11px; padding: 3px 5px; }
  .pc-meta-awaiting { font-size: 9px; }

  .pc-price { margin-bottom: 14px; }
  .pc-price-strike { font-size: 14px; }
  .pc-price-now { font-size: 24px; }
  .pc-price-save-pill { font-size: 11px; }
  .pc-price-per { font-size: 11px; }

  .pc-cta { padding: 13px; font-size: 13px; font-weight: 680; }

  .pc-bun { border-radius: 12px; margin-bottom: 14px; }
  .pc-bun-h { padding: 8px 12px; font-size: 9px; }
  .pc-bun-list { padding: 6px; gap: 4px; }
  .pc-bun-r { padding: 8px 10px; gap: 8px; border-radius: 8px; }
  .pc-bun-q { width: 28px; height: 28px; border-radius: 6px; font-size: 10px; }
  .pc-bun-l { font-size: 12px; }
  .pc-bun-u { font-size: 8px; }
  .pc-bun-t { font-size: 15px; }
  .pc-bun-s { font-size: 8px; }

}

/* ═══════ LANDING VARIANT — compact showcase card (theme-aligned base) ═══════ */
.pc.pc-landing {
  border-radius: 12px;
  background: #111827;
  border: 1px solid rgba(244, 246, 250, 0.08);
  box-shadow: var(--nl-shadow, 0 8px 32px rgba(0, 0, 0, 0.2));
}
.pc.pc-landing:hover {
  transform: translateY(-2px);
  border-color: rgba(244, 246, 250, 0.14);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
}
.pc.pc-landing .pc-accent-line { display: none; }
.pc.pc-landing .pc-sale-badge { display: none; }
.pc.pc-landing .pc-img-grad-bot,
.pc.pc-landing .pc-img-grad-top { display: none !important; }

.pc.pc-landing .pc-img-area {
  aspect-ratio: 1/1;
  background:
    radial-gradient(ellipse 75% 65% at 50% 40%, rgba(46, 209, 180, 0.04) 0%, transparent 65%),
    #0a0e18;
  box-shadow: inset 0 -1px 0 rgba(244, 246, 250, 0.05);
}
.pc.pc-landing .pc-img-inner img {
  width: 94%;
  height: 94%;
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.35));
}
.pc.pc-landing:hover .pc-img-inner img.ok { transform: scale(1.03); }

.pc.pc-landing .pc-cat-badge.pc-landing-promo {
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 8px;
  letter-spacing: 0.1em;
  background: rgba(17, 24, 39, 0.88);
  border-color: rgba(245, 158, 11, 0.28);
  color: #FCD34D;
  backdrop-filter: blur(10px);
}

.pc-landing-cat {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(244, 246, 250, 0.82);
  background: rgba(17, 24, 39, 0.82);
  border: 1px solid rgba(244, 246, 250, 0.08);
  backdrop-filter: blur(10px);
  max-width: calc(100% - 20px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pc-landing-cat::before {
  content: '';
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8B5CF6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

.pc-landing-stock {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 100px;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(17, 24, 39, 0.82);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(244, 246, 250, 0.08);
}
.pc-landing-stock.in { color: #2ED1B4; }
.pc-landing-stock.out { color: #F87171; }
.pc-landing-stock-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
}

.pc-body-landing {
  padding: 12px 14px 14px;
  background: #111827;
  border-top: 1px solid rgba(244, 246, 250, 0.06);
}

.pc-landing-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.pc-landing-name {
  font-size: 14px;
  font-weight: 700;
  color: #F4F6FA;
  line-height: 1.25;
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pc-landing-hplc {
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #2ED1B4;
  padding: 3px 7px;
  border-radius: 5px;
  border: 1px solid rgba(46, 209, 180, 0.25);
  background: rgba(46, 209, 180, 0.08);
}

.pc-landing-specs {
  font-size: 9px;
  font-weight: 500;
  color: #A9B3C7;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-family: 'IBM Plex Mono', monospace;
  line-height: 1.4;
}
.pc-landing-spec-sep { margin: 0 5px; opacity: 0.45; }

.pc-landing-sep {
  height: 0;
  border: none;
  border-top: 1px dashed rgba(244, 246, 250, 0.1);
  margin: 10px 0;
}

.pc-landing-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.pc-landing-price-block { min-width: 0; }
.pc-landing-price-was {
  display: block;
  font-size: 10px;
  color: rgba(169, 179, 199, 0.55);
  text-decoration: line-through;
  margin-bottom: 2px;
}
.pc-landing-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}
.pc-landing-price {
  font-size: 18px;
  font-weight: 800;
  color: #F4F6FA;
  letter-spacing: -0.02em;
  line-height: 1;
}
.pc-landing-per {
  font-size: 8px;
  font-weight: 600;
  color: #6B7280;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pc-landing-view {
  flex-shrink: 0;
  display: inline-flex;
  align-items: stretch;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 100px;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
.pc-landing-view > span:first-child {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #0a0e18;
  color: #F4F6FA;
  border: 1px solid rgba(244, 246, 250, 0.08);
  border-right: none;
}
.pc-landing-view-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  background: linear-gradient(135deg, #2ED1B4 0%, #1FA896 100%);
  color: #070A12;
}
.pc-landing-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 18px rgba(46, 209, 180, 0.22);
}
.pc-landing-view:hover .pc-landing-view-icon {
  background: linear-gradient(135deg, #38DCC0 0%, #2ED1B4 100%);
}

@media (min-width: 640px) {
  .pc-body-landing { padding: 14px 16px 16px; }
  .pc-landing-name { font-size: 15px; }
  .pc-landing-price { font-size: 20px; }
  .pc.pc-landing .pc-img-area { aspect-ratio: 1/1; }
}

/* ═══════ MODAL ═══════ */
.pc-mo {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);
  animation: pcFd 0.2s ease;
  font-family: 'Outfit', system-ui, sans-serif; color: #EDF0F7;
}
@media (min-width: 640px) { .pc-mo { align-items: center; padding: 20px; } }
@keyframes pcFd { from{opacity:0}to{opacity:1} }

.pc-mo-box {
  position: relative; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto;
  border-radius: 16px 16px 0 0;
  background: rgba(12,12,16,0.96); backdrop-filter: blur(32px) saturate(1.3);
  border: 1px solid rgba(255,255,255,0.06); border-bottom: none;
  box-shadow: 0 -6px 40px rgba(0,0,0,0.4);
  animation: pcSU 0.3s cubic-bezier(0.16,1,0.3,1);
}
@media (min-width: 640px) {
  .pc-mo-box { border-radius: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 60px rgba(0,0,0,0.45); animation-name: pcSC; }
}
@keyframes pcSU { from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)} }
@keyframes pcSC { from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)} }
.pc-mo-box::-webkit-scrollbar { width: 3px; }
.pc-mo-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }
.pc-mo-box::before { content: ''; display: block; width: 32px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.1); margin: 8px auto 0; }
@media (min-width: 640px) { .pc-mo-box::before { display: none; } }

.pc-mo-x {
  position: sticky; top: 6px; float: right; margin: 6px 10px 0 0;
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4); cursor: pointer; z-index: 10; transition: background 0.2s;
}
.pc-mo-x:hover { background: rgba(255,255,255,0.08); }

.pc-mo-in { padding: 14px; padding-top: 4px; }
.pc-mo-nm { font-size: 18px; font-weight: 700; color: #EDF0F7; margin-bottom: 3px; }

.pc-mo-pills { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
.pc-mo-pill { padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 1px; }
.pc-mo-pl { font-size: 8px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.4px; }
.pc-mo-pv { font-size: 10px; font-weight: 600; color: #EDF0F7; }

.pc-mo-comp { padding: 8px 10px; border-radius: 8px; background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.08); font-size: 10px; color: #EDF0F7; margin-bottom: 12px; }

.pc-mo-sec { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #EDF0F7; margin: 14px 0 7px; }

.pc-sp-tbl { border-radius: 10px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
.pc-sp-r { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 10px; font-size: 10px; gap: 8px; }
.pc-sp-r + .pc-sp-r { border-top: 1px solid rgba(255,255,255,0.04); }
.pc-sp-l { color: rgba(255,255,255,0.35); flex-shrink: 0; }
.pc-sp-v { color: #EDF0F7; text-align: right; word-break: break-word; }

.pc-mo-cls {
  width: 100%; padding: 11px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03);
  color: #EDF0F7; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
  cursor: pointer; margin-top: 14px; transition: background 0.2s;
}
.pc-mo-cls:hover { background: rgba(255,255,255,0.06); }
`;