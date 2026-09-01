/**
 * Research Gateway — premium editorial landing for /landing.
 * Homepage design language (Sora/Inter/IBM Plex Mono, dark grid bg, brand violet accent)
 * with a bento proof grid, batch marquee, and oversized display type.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FlaskConical,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import CountUp from '@/landing/components/new-landing/CountUp';
import OzcaniumAnalyticsName from '@/components/OzcaniumAnalyticsName';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { RESEARCH_GATEWAY_SEO } from '@/landing/lib/seo-keywords';
import LandingFooter from '@/landing/components/LandingFooter';
import { coaArchiveUrl, shopPageUrl } from '@/landing/lib/site';
import TrustpilotReviews from '@/sections/TrustpilotReviews';

gsap.registerPlugin(ScrollTrigger);

const BATCH_NO = 'BN88LAB';
const LAB_TAB_ADVANCE_MS = 6000;

const TICKER = [
  { id: 'BN88LAB · Lot A', v: 'HPLC 99.20% · LC-MS pass · 10.2mg' },
  { id: 'BN88LAB · Lot B', v: 'HPLC 99.42% · LC-MS pass · 10.1mg' },
  { id: 'BN88LAB · Lot C', v: 'HPLC 99.68% · LC-MS pass · 10.3mg' },
  { id: 'BN88LAB · Lot D', v: 'HPLC 99.31% · LC-MS pass · 10.0mg' },
  { id: 'BN88LAB · Lot E', v: 'HPLC 99.55% · LC-MS pass · 10.2mg' },
] as const;

const PROCESS = [
  { n: '01', title: 'Sampled', text: 'Material pulled from the production lot before it is ever listed.' },
  { n: '02', title: 'Tested', text: 'HPLC purity, LC-MS identity, and content assay — independent lab.' },
  { n: '03', title: 'Published', text: 'All three results issued under one batch ID in the public archive.' },
  { n: '04', title: 'Shipped', text: 'Same ID on your dispatch note. Audit the exact lot you received.' },
] as const;

const FAQ = [
  {
    id: 'hplc',
    q: 'What does the HPLC line mean?',
    a: 'It is the purity of the main peak as area-% on reverse-phase HPLC. We publish the lab figure — we do not round it for marketing.',
  },
  {
    id: 'match',
    q: 'How do I match my order to a COA?',
    a: 'Your dispatch note lists a batch ID. Search that ID in the COA archive — HPLC, LC-MS, and assay should match the lot you received.',
  },
  {
    id: 'three',
    q: 'Why three tests instead of one?',
    a: 'HPLC alone proves purity of whatever is in the vial — not that it is the right sequence, or the labelled amount. LC-MS and the content assay close those gaps.',
  },
  {
    id: 'use',
    q: 'Is this for human use?',
    a: 'No. These materials are for in-vitro laboratory research only. COAs support lab documentation, not medical claims.',
  },
] as const;

/* ————— Lab data panel — tabbed charts ————— */
const LAB_TABS = [
  { id: 'hplc', label: 'HPLC', figure: '99.20', unit: '%', note: 'Main peak area · RT 5.63 min' },
  { id: 'lcms', label: 'LC-MS', figure: 'Pass', unit: '', note: 'Observed MW matches expected sequence' },
  { id: 'assay', label: 'Assay', figure: '10.2', unit: 'mg', note: 'Net peptide vs 10 mg label claim' },
] as const;

/** RP-HPLC chromatogram — dominant main peak + trace impurities. */
function HplcChart() {
  return (
    <svg className="ra-chart" viewBox="0 0 480 210" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="ra-hplc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(139,92,246,0.35)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </linearGradient>
      </defs>
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" y1={y} x2="480" y2={y} className="ra-chart-grid" />
      ))}
      <path
        className="ra-chart-area"
        fill="url(#ra-hplc-fill)"
        stroke="none"
        d="M0,186 L58,186 C70,186 74,170 84,170 C94,170 98,186 112,186 L166,186 C180,186 186,26 202,26 C218,26 224,186 240,186 L280,186 C290,186 294,174 302,174 C310,174 314,186 326,186 L362,186 C370,186 374,179 381,179 C388,179 392,186 402,186 L480,186 L480,210 L0,210 Z"
      />
      <path
        className="ra-chart-line"
        fill="none"
        d="M0,186 L58,186 C70,186 74,170 84,170 C94,170 98,186 112,186 L166,186 C180,186 186,26 202,26 C218,26 224,186 240,186 L280,186 C290,186 294,174 302,174 C310,174 314,186 326,186 L362,186 C370,186 374,179 381,179 C388,179 392,186 402,186 L480,186"
      />
      <line x1="202" y1="26" x2="202" y2="186" className="ra-chart-marker" />
      <g className="ra-chart-tag" transform="translate(214, 34)">
        <rect x="0" y="0" width="122" height="20" rx="4" />
        <text x="61" y="13.5" textAnchor="middle">Peak 1 · 99.20%</text>
      </g>
      <text x="6" y="204" className="ra-chart-axis">0 min</text>
      <text x="474" y="204" textAnchor="end" className="ra-chart-axis">12 min</text>
    </svg>
  );
}

/** Mass spectrum — main m/z stick highlighted. */
function LcmsChart() {
  const sticks: Array<[number, number, boolean?]> = [
    [46, 34], [88, 22], [128, 52], [168, 30], [206, 150, true], [252, 44],
    [296, 26], [338, 38], [382, 18], [424, 28],
  ];
  return (
    <svg className="ra-chart" viewBox="0 0 480 210" preserveAspectRatio="none" aria-hidden>
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" y1={y} x2="480" y2={y} className="ra-chart-grid" />
      ))}
      <line x1="0" y1="186" x2="480" y2="186" className="ra-chart-base" />
      {sticks.map(([x, h, main]) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={186}
          y2={186 - h}
          className={`ra-chart-stick${main ? ' is-main' : ''}`}
        />
      ))}
      <g className="ra-chart-tag" transform="translate(218, 24)">
        <rect x="0" y="0" width="150" height="20" rx="4" />
        <text x="75" y="13.5" textAnchor="middle">m/z match · identity pass</text>
      </g>
      <text x="6" y="204" className="ra-chart-axis">m/z</text>
      <text x="474" y="204" textAnchor="end" className="ra-chart-axis">rel. intensity</text>
    </svg>
  );
}

/** Assay — label claim vs measured, horizontal bars. */
function AssayChart() {
  return (
    <svg className="ra-chart" viewBox="0 0 480 210" preserveAspectRatio="none" aria-hidden>
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" y1={y} x2="480" y2={y} className="ra-chart-grid" />
      ))}
      <text x="6" y="62" className="ra-chart-label">Label claim</text>
      <rect x="6" y="72" width="404" height="26" rx="6" className="ra-chart-bar ra-chart-bar--ghost" />
      <text x="422" y="90" className="ra-chart-value">10.0 mg</text>

      <text x="6" y="136" className="ra-chart-label">Measured</text>
      <rect x="6" y="146" width="412" height="26" rx="6" className="ra-chart-bar" />
      <text x="426" y="164" className="ra-chart-value is-main">10.2 mg</text>
    </svg>
  );
}

function LabPanel() {
  const [tab, setTab] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }
    if (reduced) return;
    const id = window.setInterval(() => setTab((t) => (t + 1) % LAB_TABS.length), LAB_TAB_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const active = LAB_TABS[tab];

  return (
    <div className="ra-lab" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="ra-lab-chrome">
        <span className="ra-lab-chrome-dot" aria-hidden />
        <span className="ra-lab-mark">Live batch data</span>
        <span className="ra-lab-batch">{BATCH_NO}</span>
      </div>

      <div className="ra-lab-tabs" role="tablist" aria-label="Lab tests">
        {LAB_TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === tab}
            className={`ra-lab-tab${i === tab ? ' is-active' : ''}`}
            onClick={() => {
              setTab(i);
              setPaused(true);
            }}
          >
            <span className="ra-lab-tab-n">{String(i + 1).padStart(2, '0')}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="ra-lab-body">
        <div className="ra-lab-readout">
          <p className="ra-lab-figure" key={active.id}>
            {active.figure}
            {active.unit && <span>{active.unit}</span>}
          </p>
          <p className="ra-lab-note">{active.note}</p>
        </div>

        <div className="ra-lab-chart" aria-hidden>
          <div className={`ra-lab-pane${tab === 0 ? ' is-active' : ''}`} key={`hplc-${tab === 0}`}>
            {tab === 0 && <HplcChart />}
          </div>
          <div className={`ra-lab-pane${tab === 1 ? ' is-active' : ''}`} key={`lcms-${tab === 1}`}>
            {tab === 1 && <LcmsChart />}
          </div>
          <div className={`ra-lab-pane${tab === 2 ? ' is-active' : ''}`} key={`assay-${tab === 2}`}>
            {tab === 2 && <AssayChart />}
          </div>
        </div>
      </div>

      <div className="ra-lab-foot">
        <span className="ra-lab-foot-lab">
          Tested by <OzcaniumAnalyticsName />
        </span>
        <span className="ra-lab-foot-status">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          Released
        </span>
        <a href={coaArchiveUrl()} className="ra-lab-foot-link">
          Full COA <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

/* ————— Batch marquee ————— */
function BatchMarquee() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="ra-marquee" aria-hidden>
      <div className="ra-marquee-track">
        {items.map((item, i) => (
          <span key={`${item.id}-${i}`} className="ra-marquee-item">
            <Check className="w-3 h-3" strokeWidth={2.5} />
            <span className="ra-marquee-id">{item.id}</span>
            <span className="ra-marquee-v">{item.v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ————— Hero ————— */
function Hero() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.ra-display-word');
      const fades = el.querySelectorAll('.ra-hero-fade');
      const cert = el.querySelector('.ra-lab');

      if (reduced) {
        gsap.set([words, fades, cert], { clearProps: 'all', opacity: 1 });
        return;
      }

      gsap.set(words, { yPercent: 110 });
      gsap.to(words, { yPercent: 0, duration: 0.9, stagger: 0.09, ease: 'power4.out', delay: 0.1 });
      gsap.fromTo(
        fades,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, delay: 0.5, ease: 'power2.out' },
      );
      gsap.fromTo(
        cert,
        { y: 56, opacity: 0, rotate: 1.2 },
        { y: 0, opacity: 1, rotate: 0, duration: 1.2, delay: 0.35, ease: 'power3.out' },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="ra-hero">
      <div className="ra-bg" aria-hidden>
        <div className="ra-bg-glow ra-bg-glow--teal" />
        <div className="ra-bg-glow ra-bg-glow--violet" />
      </div>

      <div className="ra-shell ra-hero-inner">
        <p className="ra-hero-eyebrow ra-hero-fade">
          <span className="ra-live-dot" aria-hidden />
          Peptides Australia — research use only
        </p>

        <h1 className="ra-display">
          <span className="ra-display-row">
            <span className="ra-display-clip">
              <span className="ra-display-word">PEPLAB AUSTRALIA</span>
            </span>
          </span>
          <span className="ra-display-row">
            <span className="ra-display-clip">
              <span className="ra-display-word ra-display-word--ghost">RESEARCH PEPTIDES</span>
            </span>
          </span>
        </h1>
        <p className="ra-hero-tagline ra-hero-fade text-sm text-[#A9B3C7] mt-2">
          Lab proof. Not promises.
        </p>

        <div className="ra-hero-split">
          <div className="ra-hero-copy ra-hero-fade">
            <p className="ra-hero-lead">
              Every research lot ships with a published certificate — HPLC purity, LC-MS identity, and content
              assay under one batch ID you can audit before you order.
            </p>
            <div className="ra-hero-cta">
              <a href={shopPageUrl()} className="ra-btn ra-btn--solid">
                Shop research materials
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href={coaArchiveUrl()} className="ra-btn ra-btn--ghost">
                Browse COA archive
              </a>
            </div>

            <dl className="ra-hero-stats ra-hero-fade">
              <div>
                <dd>
                  <CountUp end={99} prefix="≥" suffix="%" delay={0.9} />
                </dd>
                <dt>HPLC purity floor</dt>
              </div>
              <div>
                <dd>
                  <CountUp end={3} delay={1.0} />
                </dd>
                <dt>Tests per batch</dt>
              </div>
              <div>
                <dd>
                  <CountUp end={60} suffix="+" delay={1.1} />
                </dd>
                <dt>Published batches</dt>
              </div>
            </dl>
          </div>

          <div className="ra-hero-visual">
            <LabPanel />
          </div>
        </div>
      </div>

      <BatchMarquee />
    </section>
  );
}

/* ————— Bento proof grid ————— */
function ProofBento() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.ra-tile'),
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 78%' },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="ra-section" id="proof">
      <div className="ra-shell">
        <header className="ra-section-head">
          <p className="ra-eyebrow">The proof system</p>
          <h2 className="ra-heading">
            One certificate. <span className="ra-grad">Zero guesswork.</span>
          </h2>
        </header>

        <div className="ra-bento">
          {/* Large — HPLC */}
          <article className="ra-tile ra-tile--hero">
            <p className="ra-tile-kicker">01 — HPLC purity</p>
            <p className="ra-tile-figure">
              99.20<span>%</span>
            </p>
            <p className="ra-tile-text">
              Area-% of the main peak on reverse-phase HPLC. Batches below the ≥99% floor never ship.
            </p>
            <div className="ra-tile-bars" aria-hidden>
              <span style={{ height: '90%' }} />
              <span style={{ height: '16%' }} />
              <span style={{ height: '11%' }} />
              <span style={{ height: '7%' }} />
              <span style={{ height: '5%' }} />
              <span style={{ height: '4%' }} />
            </div>
          </article>

          {/* LC-MS */}
          <article className="ra-tile">
            <p className="ra-tile-kicker">02 — LC-MS identity</p>
            <p className="ra-tile-value ra-tile-value--pass">
              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              Confirmed
            </p>
            <p className="ra-tile-text">Mass spec confirms the sequence — catches mix-ups a clean chromatogram hides.</p>
          </article>

          {/* Assay */}
          <article className="ra-tile">
            <p className="ra-tile-kicker">03 — Content assay</p>
            <p className="ra-tile-value">10.2 mg</p>
            <p className="ra-tile-text">Net peptide against the 10 mg label — fill weight, not just purity.</p>
          </article>

          {/* Lab */}
          <article className="ra-tile">
            <p className="ra-tile-kicker">Independent lab</p>
            <p className="ra-tile-value ra-tile-value--sm">
              <FlaskConical className="w-5 h-5 text-[#A78BFA]" strokeWidth={1.75} />
              <OzcaniumAnalyticsName />
            </p>
            <p className="ra-tile-text">Third-party testing — results published as issued, never rewritten.</p>
          </article>

          {/* Dispatch */}
          <article className="ra-tile">
            <p className="ra-tile-kicker">Dispatch</p>
            <p className="ra-tile-value ra-tile-value--sm">
              <Truck className="w-5 h-5 text-[#A78BFA]" strokeWidth={1.75} />
              Same-day Mon–Fri
            </p>
            <p className="ra-tile-text">AusPost Express Australia-wide. Batch ID printed on your packing slip.</p>
          </article>

          {/* Archive — wide CTA */}
          <a href={coaArchiveUrl()} className="ra-tile ra-tile--cta">
            <div>
              <p className="ra-tile-kicker">Public archive</p>
              <p className="ra-tile-value">Search any batch ID before you buy</p>
              <p className="ra-tile-text ra-tile-text--mono">
                {BATCH_NO} · BN91LAB · BN94LAB · BN97LAB …
              </p>
            </div>
            <span className="ra-tile-cta-arrow" aria-hidden>
              <ArrowUpRight className="w-6 h-6" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ————— Process timeline ————— */
function Process() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.ra-flow-step'),
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%' },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="ra-section ra-section--tint" id="process">
      <div className="ra-shell">
        <header className="ra-section-head">
          <p className="ra-eyebrow">From sample to archive</p>
          <h2 className="ra-heading">How a batch earns its number.</h2>
        </header>

        <div className="ra-flow">
          <div className="ra-flow-line" aria-hidden />
          {PROCESS.map((step) => (
            <article key={step.n} className="ra-flow-step">
              <span className="ra-flow-n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ————— FAQ ————— */
function Faq() {
  const [open, setOpen] = useState<string | null>('hplc');

  return (
    <section className="ra-section" id="faq">
      <div className="ra-shell ra-faq-grid">
        <header className="ra-section-head ra-section-head--left">
          <p className="ra-eyebrow">FAQ</p>
          <h2 className="ra-heading">Clear answers.</h2>
          <p className="ra-lead">HPLC, batch matching, and research-only use.</p>
          <a href={coaArchiveUrl()} className="ra-btn ra-btn--ghost ra-faq-btn">
            Open COA archive
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </header>

        <div className="ra-faq">
          {FAQ.map((item, idx) => {
            const isOpen = open === item.id;
            return (
              <div key={item.id} className={`ra-faq-item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="ra-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                >
                  <span className="ra-faq-idx">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="ra-faq-label">{item.q}</span>
                  <span className="ra-faq-icon" aria-hidden>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && <p className="ra-faq-a">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ————— Site hierarchy — quick links for crawlers & visitors ————— */
const SITE_SECTIONS = [
  { href: '/shop', label: 'Research Peptides', text: 'Browse the research peptide catalogue.' },
  { href: '/standards', label: 'Quality & Testing', text: 'HPLC verification and lab standards.' },
  { href: '/coa', label: 'View COA Results', text: 'Published certificates for every batch.' },
  { href: '/calculator', label: 'Peptide Calculator', text: 'Reconstitution and dose calculations.' },
  { href: '/track-order', label: 'Track Order', text: 'AusPost tracking for your dispatch.' },
  { href: '/contact-info', label: 'Contact & Support', text: 'Australian support and business details.' },
] as const;

function SiteExplore() {
  return (
    <section className="ra-section" aria-labelledby="site-explore-heading">
      <div className="ra-shell">
        <header className="ra-section-head ra-section-head--left">
          <p className="ra-eyebrow">Explore PEPLAB</p>
          <h2 id="site-explore-heading" className="ra-heading">
            Research peptides, testing &amp; support
          </h2>
          <p className="ra-lead">
            PEPLAB Australia publishes independent COA results and quality documentation for every
            research batch. Research use only.
          </p>
        </header>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_SECTIONS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block h-full rounded-xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.55)] p-4 hover:border-[rgba(46,209,180,0.35)] transition-colors"
              >
                <span className="block text-sm font-semibold text-[#F4F6FA]">{item.label}</span>
                <span className="mt-1 block text-xs text-[#A9B3C7] leading-relaxed">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ————— Closing ————— */
function Closing() {
  return (
    <section className="ra-closing">
      <div className="ra-bg" aria-hidden>
        <div className="ra-bg-glow ra-bg-glow--teal" />
      </div>
      <div className="ra-shell ra-closing-inner">
        <h2 className="ra-closing-title">
          Verify the batch.
          <br />
          <span className="ra-grad">Then order.</span>
        </h2>
        <p className="ra-lead">Public COAs. Same-day dispatch Mon–Fri. Research use only.</p>
        <div className="ra-hero-cta ra-closing-cta">
          <a href={coaArchiveUrl()} className="ra-btn ra-btn--solid">
            Review COAs
            <Check className="w-4 h-4" />
          </a>
          <a href={shopPageUrl()} className="ra-btn ra-btn--ghost">
            Go to shop
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ResearchGateway() {
  return (
    <div className="nl-new-landing rg-page rg-atelier">
      <SEO
        title={RESEARCH_GATEWAY_SEO.title}
        description={RESEARCH_GATEWAY_SEO.description}
        keywords={RESEARCH_GATEWAY_SEO.keywords}
      />

      <main id="main-content" className="ra-main">
        <Hero />
        <ProofBento />
        <Process />
        <SiteExplore />
        <div className="ra-trustpilot">
          <TrustpilotReviews variant="landing" />
        </div>
        <Faq />
        <Closing />
        <LandingFooter hideCta />
      </main>
    </div>
  );
}
