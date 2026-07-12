import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, Beaker, FlaskConical, Layers, Shield, Truck } from 'lucide-react';
import { loadProductsFromSupabase, normalizeImageUrl } from '@/lib/supabase-db';
import { getOriginalProductImageUrl } from '@/lib/product-image';
import type { Product } from '@/products';
import { formatDosageLabel, products as catalogSeed } from '@/products';
import { SHOP_PATH } from '@/lib/routes';

const TRIO_IDS = ['bpc-157', 'tb-500', 'ghk-cu'] as const;
const SLIDE_MS = 4500;
const CAROUSEL_DURATION = 0.72;

type VialRole = 'left' | 'center' | 'right';

function batchLabel(product: Product): string {
  const key = (product.id || product.name || '').trim();
  if (!key) return '—';
  return key.slice(0, 8).toUpperCase();
}

function findProduct(pool: Product[], id: string): Product | undefined {
  return pool.find((x) => x.id === id || x.id?.toLowerCase() === id);
}

function pickHeroTrio(all: Product[]): Product[] {
  const pool = all.length > 0 ? all : catalogSeed.filter((p) => !p.hidden);
  const seed = catalogSeed.filter((p) => !p.hidden);
  const trio: Product[] = [];

  for (const id of TRIO_IDS) {
    const p = findProduct(pool, id) ?? findProduct(seed, id);
    if (p) trio.push(p);
  }

  for (const p of pool) {
    if (trio.length >= 3) break;
    if (!trio.some((x) => x.id === p.id)) trio.push(p);
  }

  return trio.slice(0, 3);
}

function roleForIndex(productIndex: number, activeIndex: number): VialRole {
  const diff = (productIndex - activeIndex + 3) % 3;
  if (diff === 0) return 'center';
  if (diff === 1) return 'right';
  return 'left';
}

function slotTween(role: VialRole): gsap.TweenVars {
  const side = {
    left: role === 'left' ? '18%' : '82%',
    xPercent: -50,
    scale: 0.84,
    zIndex: 10,
    opacity: 1,
    filter: 'none',
  };
  const center = {
    left: '50%',
    xPercent: -50,
    scale: 1.2,
    zIndex: 30,
    opacity: 1,
    filter: 'none',
  };
  return role === 'center' ? center : side;
}

function primaryDoseLabel(product: Product): string {
  const d = product.dosages?.find((x) => x.inStock) ?? product.dosages?.[0];
  if (!d) return '—';
  return formatDosageLabel(d.mg, d.unit);
}

function specMw(product: Product): string {
  const mw = product.technicalSpecs?.molecularWeight;
  return mw?.trim() || '—';
}

function HeroVial({
  product,
  onSelect,
}: {
  product: Product;
  onSelect?: () => void;
}) {
  const imageSrc = product.image
    ? getOriginalProductImageUrl(normalizeImageUrl(product.image))
    : '';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="nl-vial-slot w-full nl-vial-side cursor-pointer"
      aria-label={`Show ${product.name}`}
    >
      <div className="nl-vial-shadow-wrap">
        <div className="nl-vial-floor-shadow" aria-hidden />
        {imageSrc ? (
          <img src={imageSrc} alt={product.name} className="nl-vial-img" loading="eager" fetchPriority="high" decoding="async" />
        ) : (
          <div className="nl-vial-placeholder">
            <FlaskConical className="w-16 h-16 text-[#2ED1B4] opacity-50" />
          </div>
        )}
      </div>
    </button>
  );
}

export default function NewLandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const vialTrackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const carouselInitRef = useRef(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const trio = useMemo(() => pickHeroTrio(products), [products]);
  const ready = trio.length === 3;
  const activeProduct = ready ? trio[active] : null;

  useEffect(() => {
    loadProductsFromSupabase().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!ready || paused) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % 3), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [ready, paused]);

  const goTo = useCallback((index: number) => {
    setActive(((index % 3) + 3) % 3);
  }, []);

  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);
  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);

  /* Animate each bottle to its slot — center→right, right→left, left→center on next */
  useLayoutEffect(() => {
    if (!ready) {
      carouselInitRef.current = false;
      return;
    }

    const immediate = !carouselInitRef.current;

    trio.forEach((_, i) => {
      const el = vialTrackRefs.current[i];
      if (!el) return;

      const role = roleForIndex(i, active);
      el.dataset.role = role;
      const vars = slotTween(role);

      if (immediate) {
        gsap.set(el, { ...vars, force3D: true });
      } else {
        gsap.to(el, {
          ...vars,
          duration: CAROUSEL_DURATION,
          ease: 'power2.inOut',
          overwrite: 'auto',
          force3D: true,
        });
      }

      const btn = el.querySelector('button');
      if (btn) {
        (btn as HTMLButtonElement).disabled = role === 'center';
        btn.classList.toggle('nl-vial-center', role === 'center');
        btn.classList.toggle('pointer-events-none', role === 'center');
        btn.classList.toggle('cursor-pointer', role !== 'center');
      }
    });

    carouselInitRef.current = true;
  }, [active, ready, trio]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const targets = section.querySelectorAll('.nl-hero-reveal');
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
          stagger: 0.08,
          clearProps: 'transform',
        },
      );
    }, section);

    return () => {
      ctx.revert();
      gsap.set(targets, { opacity: 1, y: 0, clearProps: 'transform' });
    };
  }, []);

  const catalogCount = products.length > 0 ? products.length : 60;
  const centerDose = activeProduct ? primaryDoseLabel(activeProduct) : '—';

  return (
    <section
      ref={sectionRef}
      className="nl-hero relative overflow-x-hidden overflow-y-visible"
    >
      <div className="nl-hero-vignette pointer-events-none" />
      <div className="nl-hero-glow pointer-events-none" />
      <div className="nl-hero-particles pointer-events-none" />
      <div className="nl-hero-floor pointer-events-none" />

      <div className="nl-container relative z-10 flex-1 flex flex-col min-h-0">
        <div className="nl-hero-grid grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 flex-1">
          <div className="nl-hero-copy lg:pr-4">
            <p className="nl-hero-reveal nl-eyebrow mb-4">Independent research platform</p>

            <h1 className="nl-hero-reveal text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-bold mb-5">
              Research-Grade
              <br />
              <span className="gradient-text">Peptides &amp; Compounds</span>
            </h1>

            <p className="nl-hero-reveal nl-lead max-w-lg mb-7">
              Independent, research-first platform delivering documented, batch-level analytical
              results for scientific use.
            </p>

            <div className="nl-hero-reveal nl-hero-actions">
              <a href={SHOP_PATH} className="btn-primary inline-flex items-center gap-2 text-sm font-semibold tracking-wide">
                Explore research peptides
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <Link
                to="/standards"
                className="btn-outline inline-flex items-center gap-2 text-sm font-semibold tracking-wide"
              >
                Lab results
              </Link>
            </div>

          </div>

          <div
            className="nl-hero-visual nl-vial-carousel-wrap relative flex flex-col items-center w-full"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="nl-hero-reveal nl-hero-chips w-full max-w-[42rem] justify-between items-start gap-4 mb-4 sm:mb-6">
              <div className="text-left space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--nl-text-muted)]">
                  Catalog {catalogCount}+ compounds
                </p>
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--nl-text-muted)]">
                  Dispatch same-day · M–F
                </p>
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--nl-text-muted)]">
                  Coverage Australia-wide
                </p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--nl-text)] flex items-center justify-end gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--nl-accent)]" aria-hidden />
                  HPLC verified
                </p>
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--nl-text-muted)]">
                  Tested per lot
                </p>
              </div>
            </div>

            {ready ? (
              <>
                <div
                  ref={stageRef}
                  className="nl-vial-stage w-full nl-vial-stage-height"
                >
                  {trio.map((product, i) => {
                    const role = roleForIndex(i, active);
                    return (
                      <div
                        key={product.id}
                        ref={(el) => {
                          vialTrackRefs.current[i] = el;
                        }}
                        className="nl-vial-track-item"
                        data-role={role}
                      >
                        <HeroVial
                          product={product}
                          onSelect={role === 'left' ? goPrev : role === 'right' ? goNext : undefined}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-4 mb-2" role="tablist" aria-label="Product showcase">
                  {trio.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={i === active}
                      aria-label={`Show ${p.name}`}
                      onClick={() => goTo(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === active
                          ? 'w-8 bg-[#2ED1B4] shadow-[0_0_12px_rgba(46,209,180,0.6)]'
                          : 'w-6 bg-[rgba(244,246,250,0.2)] hover:bg-[rgba(244,246,250,0.35)]'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-48 h-64 rounded-2xl bg-[rgba(17,24,39,0.5)] animate-pulse border border-[rgba(244,246,250,0.08)]" />
            )}
          </div>
        </div>

        <div className="nl-hero-meta-block nl-hero-reveal mt-6 lg:mt-8 shrink-0">
          <div className="nl-hero-meta-row">
            <div className="nl-hero-meta-left">
              {[
                { icon: Shield, value: '≥99%', label: 'Purity' },
                { icon: Beaker, value: 'HPLC', label: 'Tested' },
                { icon: Layers, value: `${catalogCount}+`, label: 'Batches' },
                { icon: Truck, value: 'AusPost', label: 'Express' },
              ].map((item, i) => (
                <div key={item.label} className="nl-hero-meta-stat-wrap">
                  {i > 0 && <span className="nl-hero-meta-divider" aria-hidden />}
                  <div className="nl-hero-meta-stat">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--nl-accent)] mb-1.5" strokeWidth={1.75} />
                    <p className="text-sm sm:text-base font-semibold text-[var(--nl-text)] leading-none">{item.value}</p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--nl-text-muted)] mt-1">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {activeProduct && (
              <div
                key={activeProduct.id}
                className="nl-spec-bar nl-hero-meta-spec rounded-xl border border-[var(--nl-border)] bg-[var(--nl-bg-elevated)] px-4 py-3 flex flex-wrap items-center justify-center lg:justify-end gap-x-3 sm:gap-x-4 gap-y-2 text-[10px] sm:text-xs font-mono"
              >
                <span className="text-[var(--nl-accent)] font-semibold uppercase tracking-wider">{activeProduct.name}</span>
                <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
                <span className="text-[var(--nl-text-muted)]">
                  MW <span className="text-[var(--nl-text)]">{specMw(activeProduct)}</span>
                </span>
                <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
                <span className="text-[var(--nl-text-muted)]">
                  Dose <span className="text-[var(--nl-text)]">{centerDose}</span>
                </span>
                <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
                <span className="text-[var(--nl-text-muted)]">
                  Purity <span className="text-[var(--nl-text)]">≥99%</span>
                </span>
                <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
                <span className="text-[var(--nl-text-muted)]">
                  Batch <span className="text-[var(--nl-text)]">{batchLabel(activeProduct)}</span>
                </span>
                {activeProduct.coaUrl?.trim() ? (
                  <>
                    <span className="text-[rgba(244,246,250,0.15)] hidden sm:inline">|</span>
                    <span className="text-[#22C55E] font-semibold">COA Verified</span>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
