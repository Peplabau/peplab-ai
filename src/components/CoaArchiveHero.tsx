import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Check, Search, Shield } from 'lucide-react';
import { gsap } from 'gsap';
import CountUp from '@/components/CountUp';
import CoaHplcChart from '@/components/CoaHplcChart';
import OzcaniumAnalyticsName, { OZCANIUM_ANALYTICS_LAB_NAME } from '@/components/OzcaniumAnalyticsName';
import { cn } from '@/lib/utils';

const PURITY_VALUE = 99;
const PURITY_LABEL = '99.00%';

type CoaArchiveHeroProps = {
  certificateCount: number;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

function MetaItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8b93a8] sm:text-[9px]">
        {label}
      </span>
      <span
        className={cn(
          'block truncate font-mono font-semibold tracking-[0.04em] text-[#F4F6FA]',
          highlight ? 'text-sm font-bold' : 'text-[11px]',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function HeroStat({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="coa-archive-hero-stat">
      <dt className="coa-archive-hero-stat-label">{label}</dt>
      <dd className="coa-archive-hero-stat-value">{loading ? '—' : value}</dd>
    </div>
  );
}

export default function CoaArchiveHero({
  certificateCount,
  loading,
  searchQuery,
  onSearchChange,
}: CoaArchiveHeroProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = panelRef.current;
    if (!root) return;

    const paths = root.querySelectorAll<SVGPathElement>('[data-coa-chart-path]');
    const progressBar = root.querySelector<HTMLDivElement>('[data-coa-progress]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
      if (progressBar) gsap.set(progressBar, { width: '99%' });
      return;
    }

    paths.forEach((path) => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        delay: 0.35,
        ease: 'power2.inOut',
      });
    });

    if (progressBar) {
      gsap.set(progressBar, { width: '0%' });
      gsap.to(progressBar, {
        width: '99%',
        duration: 1.4,
        delay: 1,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <section className="coa-archive-hero mb-6 lg:mb-10" aria-labelledby="coa-archive-heading">
      <div className="coa-archive-hero-grid">
        <div className="coa-archive-hero-copy">
          <div className="coa-archive-hero-header">
            <div className="coa-archive-hero-icon" aria-hidden>
              <Shield size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="coa-archive-hero-kicker">
                Verified · Tested by <OzcaniumAnalyticsName />
              </p>
              <h1 id="coa-archive-heading" className="coa-archive-hero-title">
                Certificate of Analysis
              </h1>
              <p className="coa-archive-hero-subtitle">Published archive</p>
            </div>
          </div>

          <p className="coa-archive-hero-mobile-meta lg:hidden">
            {loading ? 'Loading certificates…' : `${certificateCount} certificates · HPLC · ${OZCANIUM_ANALYTICS_LAB_NAME}`}
          </p>

          <p className="coa-archive-hero-lead coa-archive-hero-lead--short lg:hidden">
            Batch-specific HPLC documentation for PEPLAB research products.
          </p>

          <p className="coa-archive-hero-lead coa-archive-hero-lead--full hidden lg:block">
            Batch-specific analytical documentation for PEPLAB research products. Each entry
            records purity, testing method, and independent laboratory verification prior to
            release.
          </p>

          <dl className="coa-archive-hero-stats hidden lg:grid">
            <HeroStat
              label="Certificates"
              value={String(certificateCount)}
              loading={loading}
            />
            <HeroStat label="Testing lab" value={<OzcaniumAnalyticsName compact />} />
            <HeroStat label="Method" value="HPLC" />
            <HeroStat label="Purity standard" value="≥99%" />
          </dl>

          <ul className="coa-archive-hero-points hidden lg:flex">
            <li>Documents batch-level purity, method, and test date for every listed product.</li>
            <li>Results issued by an independent third-party laboratory before sale.</li>
            <li>For laboratory research use only — not for human or veterinary consumption.</li>
          </ul>
        </div>

        <div className="coa-archive-hero-toolbar">
          <label htmlFor="coa-archive-search" className="coa-archive-hero-search-label">
            Search archive
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
              aria-hidden
            />
            <input
              id="coa-archive-search"
              type="search"
              placeholder="Product, batch, method, or lab…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="coa-archive-hero-search-input"
            />
          </div>
        </div>

        <div
          ref={panelRef}
          className="coa-archive-hero-panel coa-rg-panel relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 sm:p-5 lg:min-h-[320px]"
        >
          <div className="coa-rg-panel-glow pointer-events-none absolute inset-0 rounded-2xl" aria-hidden />

          <div className="relative">
            <div className="coa-archive-hero-panel-head mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#F4F6FA] sm:text-xs">
                Tested by <OzcaniumAnalyticsName />
              </span>
              <span className="coa-rg-badge shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em]">
                Independent
              </span>
            </div>

            <div className="coa-archive-hero-panel-meta relative mb-2 hidden grid-cols-2 gap-x-3 gap-y-2 border-b border-[rgba(244,246,250,0.06)] pb-3 sm:mb-3 lg:grid lg:grid-cols-4">
              <MetaItem
                label="Published"
                value={loading ? '—' : String(certificateCount)}
                highlight
              />
              <MetaItem label="Method" value="HPLC" />
              <MetaItem label="Standard" value="≥99%" />
              <MetaItem label="Archive" value="Live" />
            </div>

            <CoaHplcChart
              purityLabel={PURITY_LABEL}
              compact
              className="coa-archive-hero-chart h-[6.5rem] sm:h-[9rem] lg:h-[11rem] lg:!h-[11rem]"
            />
          </div>

          <div className="relative mt-3 flex flex-col gap-2 sm:mt-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8b93a8] sm:text-[10px]">
                  HPLC purity
                </p>
                <p className="coa-rg-purity-accent mt-0.5 text-2xl font-extrabold tabular-nums leading-[1.1] sm:mt-1 sm:text-3xl lg:text-[2.5rem]">
                  <CountUp end={PURITY_VALUE} decimals={2} suffix="%" delay={0.75} duration={1.2} active />
                </p>
                <p className="coa-archive-hero-panel-note mt-0.5 hidden text-[10px] text-[#6B7280] sm:block">
                  Primary COA result · ≥99% threshold
                </p>
              </div>
              <span className="coa-rg-verified inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] sm:px-2.5 sm:py-1 sm:text-[9px]">
                <Check size={10} strokeWidth={3} className="text-[#36ea51] sm:h-[11px] sm:w-[11px]" />
                Verified
              </span>
            </div>

            <div className="coa-rg-progress-track h-1 shrink-0 overflow-hidden rounded-full sm:h-1.5">
              <div data-coa-progress className="coa-rg-progress-bar h-full rounded-full" style={{ width: '0%' }} />
            </div>

            <p className="coa-archive-hero-panel-foot hidden items-center justify-center gap-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] sm:flex sm:text-[10px]">
              <Check size={10} className="shrink-0 text-[#36ea51]" strokeWidth={3} />
              <span>Every batch certified before sale · Research use only</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
