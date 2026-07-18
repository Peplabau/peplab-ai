import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import gsap from 'gsap';
import {
  ArrowRight,
  Beaker,
  Check,
  ChevronDown,
  Dna,
  FlaskConical,
  Layers,
  Scale,
  Shield,
  Truck,
} from 'lucide-react';
import CountUp from '@/landing/components/new-landing/CountUp';
import OzcaniumAnalyticsName, { OZCANIUM_ANALYTICS_LAB_NAME } from '@/components/OzcaniumAnalyticsName';
import WriteInText from '@/landing/components/new-landing/WriteInText';
import { SEO } from '@/landing/components/SEO';
import { RESEARCH_GATEWAY_SEO } from '@/landing/lib/seo-keywords';
import LandingFooter from '@/landing/components/LandingFooter';
import { getStaticProducts } from '@/landing/lib/static-data';
import { shopUrl, coaArchiveUrl, shopPageUrl } from '@/landing/lib/site';

const COUNT_DURATION = 1.75;
const COUNT_BASE_DELAY = 0.55;
const BATCH_NO = 'BN88LAB';

const COA_TEST_CARDS = [
  {
    id: 'hplc',
    title: 'HPLC Purity Test',
    result: '99.20%',
    note: 'Purity verified on COA',
  },
  {
    id: 'lcms',
    title: 'LC-MS Identity Test',
    result: 'Confirmed',
    note: 'Compound identity match',
  },
  {
    id: 'assay',
    title: 'Peptide Content Assay',
    result: '10.2mg',
    note: 'Stated dose verified',
  },
] as const;

const HERO_META_STATS = [
  { icon: Shield, kind: 'count' as const, end: 99, prefix: '≥', suffix: '%', label: 'Purity' },
  { icon: Beaker, kind: 'text' as const, value: 'HPLC', label: 'Tested' },
  { icon: Layers, kind: 'count' as const, end: 60, suffix: '+', label: 'Batches' },
  { icon: Truck, kind: 'text' as const, value: 'AusPost', label: 'Express' },
] as const;

const RECENT_BATCHES = [
  { id: BATCH_NO, purity: '99.20%', lcms: 'Pass', assay: '10.2mg', ago: '2d ago' },
  { id: BATCH_NO, purity: '99.42%', lcms: 'Pass', assay: '10.1mg', ago: '5d ago' },
  { id: BATCH_NO, purity: '99.68%', lcms: 'Pass', assay: '10.3mg', ago: '8d ago' },
  { id: BATCH_NO, purity: '99.31%', lcms: 'Pass', assay: '10.0mg', ago: '11d ago' },
] as const;

const TICKER_ITEMS = [
  { id: BATCH_NO, hplc: '99.20%', lcms: 'LC-MS pass', assay: '10.2mg', ago: '2d ago' },
  { id: BATCH_NO, hplc: '99.42%', lcms: 'LC-MS pass', assay: '10.1mg', ago: '5d ago' },
  { id: BATCH_NO, hplc: '99.68%', lcms: 'LC-MS pass', assay: '10.3mg', ago: '8d ago' },
  { id: BATCH_NO, hplc: '99.31%', lcms: 'LC-MS pass', assay: '10.0mg', ago: '11d ago' },
  { id: BATCH_NO, hplc: '99.55%', lcms: 'LC-MS pass', assay: '10.2mg', ago: '14d ago' },
  { id: BATCH_NO, hplc: '99.70%', lcms: 'LC-MS pass', assay: '10.1mg', ago: '18d ago' },
] as const;

const APPROACH = [
  {
    icon: FlaskConical,
    title: 'HPLC Purity Test',
    text: 'Shows purity percentage (e.g. 99.2% purity) — usually the first thing customers ask for. Displayed on every published COA.',
  },
  {
    icon: Dna,
    title: 'LC-MS Identity Test',
    text: 'Confirms the compound is actually the peptide listed on the label. Helps verify there was no mix-up in manufacturing.',
  },
  {
    icon: Scale,
    title: 'Peptide Content Assay',
    text: 'Confirms the amount in the vial (e.g. 10mg is actually close to 10mg). Builds confidence you are getting the stated dosage.',
  },
] as const;

const VERIFY_STEPS = [
  {
    step: '01',
    title: 'HPLC purity analysis',
    text: 'Every batch is HPLC-tested for purity percentage. Results below ≥99% are rejected — the number on your COA is the lab result, published unmodified.',
  },
  {
    step: '02',
    title: 'LC-MS identity check',
    text: 'LC-MS confirms the peptide matches the compound on the label. Catches manufacturing mix-ups before any batch enters inventory.',
  },
  {
    step: '03',
    title: 'Content assay',
    text: 'Peptide content assay verifies the stated dose in the vial — so 10mg labelled means the lab measured close to 10mg.',
  },
  {
    step: '04',
    title: 'COA published',
    text: 'All three results are compiled into a batch-specific Certificate of Analysis, linked to batch ID and published for verification.',
  },
] as const;

const COMPARE_ROWS: { id: string; label: ReactNode; us: boolean; them: boolean }[] = [
  { id: 'hplc', label: 'HPLC purity % on every COA', us: true, them: false },
  { id: 'lcms', label: 'LC-MS identity verification', us: true, them: false },
  { id: 'assay', label: 'Peptide content assay (dose check)', us: true, them: false },
  { id: 'batch', label: 'Batch-specific COA per shipment', us: true, them: false },
  {
    id: 'lab',
    label: (
      <>
        Independent third-party lab (<OzcaniumAnalyticsName />)
      </>
    ),
    us: true,
    them: false,
  },
  { id: 'public', label: 'Public COA access before you order', us: true, them: false },
];

const FAQ = [
  {
    id: 'hplc',
    q: 'What is the HPLC Purity Test on your COA?',
    a: 'HPLC measures purity as a percentage — for example 99.2% purity. It is the most common question customers ask and appears on every Certificate of Analysis we publish. We enforce a minimum ≥99% threshold before any batch is accepted.',
  },
  {
    id: 'verify-coa',
    q: 'How do I verify the COA for my batch?',
    a: 'Your order confirmation lists the batch number at dispatch. Match that ID to our published COAs on the main shop — each document shows HPLC purity, LC-MS identity, and content assay for that specific lot.',
  },
  {
    id: 'lcms',
    q: 'What does the LC-MS Identity Test confirm?',
    a: 'LC-MS (liquid chromatography–mass spectrometry) verifies the compound in the vial is actually the peptide named on the label. It helps rule out manufacturing mix-ups or mislabelling — not just purity, but identity.',
  },
  {
    id: 'assay',
    q: 'What is the Peptide Content Assay?',
    a: 'The content assay measures how much peptide is actually in the vial versus the label claim — e.g. confirming a 10mg vial is close to 10mg. It gives confidence you are receiving the stated dosage, not just a pure compound at an unknown quantity.',
  },
  {
    id: 'research-only',
    q: 'Why is this positioned as research-only?',
    a: 'These compounds are supplied strictly for in-vitro laboratory research and analytical reference use. We make no medical, therapeutic, or performance claims. COAs support research documentation and traceability only.',
  },
  {
    id: 'shipping',
    q: 'Do you ship outside Australia?',
    a: 'PEPLAB dispatches exclusively within Australia. Domestic shipping lets us maintain Mon–Fri same-day dispatch via AusPost Express and consistent support turnaround.',
  },
] as const;

function HplcChart({ pathRef }: { pathRef: RefObject<SVGPathElement | null> }) {
  return (
    <div className="rg-hplc-chart" aria-hidden>
      <svg viewBox="0 0 360 110" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rg-hplc-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="55%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <text x="4" y="12" fill="#6B7280" fontSize="7" fontWeight="600">
          MAU
        </text>
        <text x="320" y="108" fill="#6B7280" fontSize="7" fontWeight="600">
          RT (MIN)
        </text>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <line
            key={n}
            x1={(n - 1) * 40 + 20}
            y1="18"
            x2={(n - 1) * 40 + 20}
            y2="92"
            stroke="rgba(244,246,250,0.05)"
            strokeWidth="1"
          />
        ))}
        <line x1="0" y1="92" x2="360" y2="92" stroke="rgba(244,246,250,0.1)" strokeWidth="1" />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <text
            key={`x-${n}`}
            x={(n - 1) * 40 + 20}
            y="104"
            textAnchor="middle"
            fill="#6B7280"
            fontSize="6"
          >
            {n}
          </text>
        ))}
        <path
          ref={pathRef}
          d="M0,92 L52,92 L68,24 L82,92 L320,92"
          fill="none"
          stroke="url(#rg-hplc-line)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect x="158" y="14" width="34" height="15" rx="3" fill="rgba(244,246,250,0.08)" />
        <text x="175" y="25" textAnchor="middle" fill="#F4F6FA" fontSize="7" fontWeight="700">
          MAIN
        </text>
        <rect
          x="188"
          y="32"
          width="96"
          height="18"
          rx="4"
          fill="rgba(139,92,246,0.18)"
          stroke="rgba(139,92,246,0.45)"
          strokeWidth="1"
        />
        <text x="236" y="44" textAnchor="middle" fill="#C4B5FD" fontSize="7" fontWeight="600">
          Peak 1 · RT 5.63 · 99.20%
        </text>
      </svg>
    </div>
  );
}

function CoaTestCards() {
  return (
    <div className="rg-coa-tests" aria-label="COA test results">
      {COA_TEST_CARDS.map((test) => (
        <article key={test.id} className="rg-coa-test-card">
          <div className="rg-coa-test-copy">
            <span className="rg-coa-test-title">{test.title}</span>
            <span className="rg-coa-test-note">{test.note}</span>
          </div>
          <div className="rg-coa-test-result-wrap">
            <span className="rg-coa-test-result">{test.result}</span>
            <span className="rg-coa-test-pass ">
              <Check className="w-3 h-3 text-[#36ea51]" strokeWidth={2.5} />
              Pass
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function CertificatePanel({ pathRef }: { pathRef: RefObject<SVGPathElement | null> }) {
  return (
    <div className="rg-hplc-panel-inner">
      <div className="rg-hplc-card-head">
        <Shield className="w-4 h-4 text-[#45ff34]" strokeWidth={2} />
        <span className="rg-hplc-card-label">
          Batch COA{' '}
          <span className="rg-hplc-lab">
            <span className="text-white">Tested by</span>{' '}
            <OzcaniumAnalyticsName />
          </span>
        </span>
        <span className=" text-[#10B981] rg-hplc-badge ">Independent</span>
      </div>
      <div className="rg-hplc-meta">
        <div className="rg-hplc-meta-item">
          <span className="rg-hplc-meta-label">Batch no</span>
          <span className="rg-hplc-meta-value">{BATCH_NO}</span>
        </div>
        <div className="rg-hplc-meta-item">
          <span className="rg-hplc-meta-label">Tests</span>
          <span className="rg-hplc-meta-value">3-test COA</span>
        </div>
        <div className="rg-hplc-meta-item">
          <span className="rg-hplc-meta-label">Tested</span>
          <span className="rg-hplc-meta-value">28 May 2026</span>
        </div>
      </div>
      <HplcChart pathRef={pathRef} />
      <CoaTestCards />
      <div className="rg-hplc-purity-row">
        <div>
          <span className="rg-hplc-purity-label">HPLC purity</span>
          <span className="rg-hplc-purity-value rg-hplc-purity-count">
            <CountUp
              end={99.2}
              decimals={1}
              suffix="%"
              delay={1.6}
              duration={1.2}
              className="rg-hplc-purity-accent"
            />
          </span>
          <span className="rg-hplc-purity-note">Primary COA result · ≥99% threshold</span>
        </div>
        <span className="rg-hplc-verified color-green">
          <Check className="w-3.5 h-3.5 color-green" strokeWidth={2.5} />
          Verified
        </span>
      </div>
      <a href={coaArchiveUrl()} className="rg-hplc-archive">
        <span className="rg-hplc-archive-label">COA archive</span>
        <span className="rg-hplc-archive-url">peplab.ai/coa</span>
        <span className="rg-hplc-archive-cta">
          View full COA <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </a>
    </div>
  );
}

function RecentBatchesPanel() {
  return (
    <div className="rg-hplc-panel-inner rg-recent-panel">
      <div className="rg-hplc-card-head">
        <FlaskConical className="w-4 h-4 text-[#8B5CF6]" strokeWidth={2} />
        <span className="rg-hplc-card-label">
          Recent COAs <span className="rg-hplc-lab">Published batches</span>
        </span>
        <span className="rg-hplc-badge">Live</span>
      </div>
      <ul className="rg-recent-list">
        {RECENT_BATCHES.map((batch, index) => (
          <li key={`${batch.id}-${batch.ago}-${index}`} className="rg-recent-item">
            <div>
              <span className="rg-recent-id">{batch.id}</span>
              <span className="rg-recent-meta">
                {batch.ago} · LC-MS <span className="rg-recent-pass">{batch.lcms}</span> · {batch.assay}
              </span>
            </div>
            <span className="rg-recent-purity">{batch.purity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HplcCard({ pathRef }: { pathRef: RefObject<SVGPathElement | null> }) {
  const [tab, setTab] = useState<'certificate' | 'recent'>('certificate');

  return (
    <div className="rg-hplc-wrap rg-hero-card">
      <div className="rg-tabs" role="tablist" aria-label="Batch verification">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'certificate'}
          className={`rg-tab${tab === 'certificate' ? ' rg-tab--active' : ''}`}
          onClick={() => setTab('certificate')}
        >
          COA proof
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'recent'}
          className={`rg-tab${tab === 'recent' ? ' rg-tab--active' : ''}`}
          onClick={() => setTab('recent')}
        >
          Recent COAs
        </button>
      </div>
      <div className="rg-hplc-card">
        <div
          className={`rg-hplc-panel${tab === 'certificate' ? ' rg-hplc-panel--active' : ''}`}
          role="tabpanel"
          aria-hidden={tab !== 'certificate'}
        >
          <CertificatePanel pathRef={pathRef} />
        </div>
        <div
          className={`rg-hplc-panel${tab === 'recent' ? ' rg-hplc-panel--active' : ''}`}
          role="tabpanel"
          aria-hidden={tab !== 'recent'}
        >
          <RecentBatchesPanel />
        </div>
      </div>
    </div>
  );
}

const VERIFICATION_TEST_ICONS = {
  hplc: FlaskConical,
  lcms: Dna,
  assay: Scale,
} as const;

function VerificationSection() {
  return (
    <section id="verification" className="rg-section rg-verification">
      <div className="rg-container">
        <div className="rg-verification-panel">
          <div className="rg-verification-grid">
            <div className="rg-verification-copy">
              <p className="rg-verification-eyebrow">
                <Shield className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
                COA proof
              </p>

              <h2 className="rg-verification-heading">
                <span className="rg-verification-heading-line">Three tests.</span>
                <span className="rg-verification-heading-accent">One published COA.</span>
              </h2>

              <p className="rg-verification-lead">
                Every PEPLAB batch is tested for HPLC purity, LC-MS identity, and peptide content assay —
                then published as a batch-specific Certificate of Analysis you can verify before you order.
              </p>

              <div className="rg-verification-contrast">
                <div className="rg-verification-vs rg-verification-vs--weak">
                  <span className="rg-verification-vs-label">Most suppliers</span>
                  <p>One purity number — or the same old certificate reused across every shipment.</p>
                </div>
                <div className="rg-verification-vs rg-verification-vs--strong">
                  <span className="rg-verification-vs-label">PEPLAB</span>
                  <p>Three independent tests, one batch-specific COA, published and traceable per lot.</p>
                </div>
              </div>

              <a href={coaArchiveUrl()} className="rg-verification-cta">
                View published COAs
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="rg-verification-visual">
              <div className="rg-verification-stack" aria-label="Three COA tests">
                {COA_TEST_CARDS.map((test, index) => {
                  const Icon = VERIFICATION_TEST_ICONS[test.id];
                  return (
                    <article key={test.id} className="rg-verification-test">
                      <span className="rg-verification-test-num">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="rg-verification-test-icon">
                        <Icon className="w-4 h-4 text-[#A78BFA]" strokeWidth={1.75} />
                      </div>
                      <div className="rg-verification-test-copy">
                        <h3 className="rg-verification-test-title">{test.title}</h3>
                        <p className="rg-verification-test-note">{test.note}</p>
                      </div>
                      <div className="rg-verification-test-result-wrap">
                        <span className="rg-verification-test-result">{test.result}</span>
                        <span className="rg-verification-test-pass">
                          <Check className="w-3 h-3 text-[#36ea51]" strokeWidth={2.5} />
                          Pass
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="rg-verification-stamp">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                COA verified · <OzcaniumAnalyticsName /> · {BATCH_NO}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqOrderSection({
  openFaq,
  setOpenFaq,
}: {
  openFaq: string | null;
  setOpenFaq: (id: string | null) => void;
}) {
  return (
    <section id="faq" className="rg-section rg-faq-order">
      <div className="rg-container">
        <div className="rg-faq-order-grid">
          <div className="rg-faq-order-faq">
            <p className="rg-eyebrow">FAQ</p>
            <h2 className="rg-heading">COA questions, answered.</h2>
            <p className="rg-lead rg-faq-order-lead">
              Clear answers on HPLC, LC-MS, content assay, and batch verification.
            </p>
            <div className="rg-faq-list">
              {FAQ.map((item, index) => {
                const open = openFaq === item.id;
                return (
                  <article key={item.id} className={`rg-faq-item${open ? ' rg-faq-item--open' : ''}`}>
                    <h3 className="m-0">
                      <button
                        type="button"
                        className="rg-faq-trigger"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : item.id)}
                      >
                        <span className="rg-faq-qnum">Q.{String(index + 1).padStart(2, '0')}</span>
                        <span>{item.q}</span>
                        <ChevronDown className="rg-faq-chevron" strokeWidth={2} />
                      </button>
                    </h3>
                    {open && <p className="rg-faq-answer">{item.a}</p>}
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="rg-faq-order-cta">
            <div className="rg-faq-order-cta-panel">
              <p className="rg-faq-order-cta-badge">
                <span className="rg-hero-badge-dot" aria-hidden />
                Ready to order
              </p>
              <h2 className="rg-faq-order-cta-title">
                Verify before you order.
                <span className="rg-faq-order-cta-accent">Every. Single. Batch.</span>
              </h2>
              <p className="rg-faq-order-cta-lead">
                Every COA is public. Every order ships with the batch number you can audit. No guessing. No
                generic certificates.
              </p>
              <div className="rg-faq-order-cta-actions">
                <a href={shopPageUrl()} className="rg-btn rg-btn--primary rg-btn--cool">
                  Shop <span className="rg-btn-accent-word">now</span>
                  <ArrowRight className="w-4 h-4 rg-btn-arrow" />
                </a>
                <a href={coaArchiveUrl()} className="rg-btn rg-btn--outline">
                  Review COAs first
                </a>
              </div>
              <p className="rg-faq-order-cta-trust">
                Secure checkout · Card · Apple Pay · Google Pay · Crypto · Dispatched from Australia
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function BatchTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="rg-ticker">
      <div className="rg-ticker-inner">
        <span className="rg-ticker-label">
          <span className="rg-ticker-live-dot" aria-hidden />
          Live verified feed
        </span>
        <div className="rg-ticker-scroll" aria-hidden>
          <div className="rg-ticker-track">
            {items.map((item, i) => (
              <span key={`${item.id}-${i}`} className="rg-ticker-item">
                <Check className="w-3 h-3" strokeWidth={2.5} />
                {item.id}
                <span className="rg-ticker-dot">·</span>
                {item.ago}
                <span className="rg-ticker-dot">·</span>
                <span className="rg-ticker-purity">
                  {item.hplc} · {item.lcms} · {item.assay}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchHero() {
  const heroRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [catalogCount, setCatalogCount] = useState(60);

  const metaStats = useMemo(
    () =>
      HERO_META_STATS.map((item) =>
        item.kind === 'count' && item.label === 'Batches'
          ? { ...item, end: catalogCount }
          : item,
      ),
    [catalogCount],
  );

  useEffect(() => {
    setCatalogCount(getStaticProducts().length || 60);
  }, []);

  const labelDelay = (index: number) => COUNT_BASE_DELAY + index * 0.14 + COUNT_DURATION + 0.06;

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* ignore */
    }

    const ctx = gsap.context(() => {
      const reveals = hero.querySelectorAll('.rg-hero-reveal');
      const words = hero.querySelectorAll<HTMLElement>('.rg-reveal-word');
      const card = hero.querySelector('.rg-hero-card');
      const accentLine = hero.querySelector('.rg-hero-accent-line');

      if (reduced) {
        if (words.length) gsap.set(words, { opacity: 1, yPercent: 0, clearProps: 'transform' });
        if (reveals.length) gsap.set(reveals, { opacity: 1, x: 0, y: 0, clearProps: 'all' });
        if (card) gsap.set(card, { opacity: 1, x: 0, clearProps: 'all' });
        if (accentLine) gsap.set(accentLine, { opacity: 1, scaleX: 1, clearProps: 'all' });
        return;
      }

      if (words.length) {
        gsap.set(words, { yPercent: 110, opacity: 0 });
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.045,
          delay: 0.12,
          ease: 'power3.out',
          clearProps: 'transform',
        });
      }

      if (reveals.length) {
        gsap.fromTo(
          reveals,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.09,
            ease: 'power3.out',
            clearProps: 'transform',
          },
        );
      }

      if (card) {
        gsap.fromTo(
          card,
          { x: 48, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.05, delay: 0.25, ease: 'power3.out', clearProps: 'transform' },
        );
      }

      if (accentLine) {
        gsap.fromTo(
          accentLine,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.85,
            delay: 0.45,
            ease: 'power2.inOut',
            transformOrigin: 'left center',
          },
        );
      }

      const path = pathRef.current;
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2,
          delay: 0.7,
          ease: 'power2.inOut',
        });
      }
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="rg-hero nl-hero relative overflow-x-hidden overflow-y-visible">
      <div className="nl-hero-vignette pointer-events-none" aria-hidden />
      <div className="nl-hero-glow rg-hero-glow pointer-events-none" aria-hidden />
      <div className="rg-hero-orb rg-hero-orb--purple pointer-events-none" aria-hidden />
      <div className="rg-hero-orb rg-hero-orb--pink pointer-events-none" aria-hidden />

      <div className="nl-container relative z-10 flex flex-col min-h-0">
        <div className="rg-hero-grid nl-hero-grid grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 flex-1">
          <div className="rg-hero-copy lg:pr-4">
            <p className="rg-hero-eyebrow rg-hero-reveal">
              <span className="rg-hero-eyebrow-dot" aria-hidden />
              <WriteInText text="Peptides Australia" delay={0.08} charDelay={0.022} />
            </p>

            <h1 className="rg-hero-title">
              <span className="rg-hero-line">
                <span className="rg-reveal-word-wrap">
                  <span className="rg-reveal-word">PEPLAB PEPTIDES</span>
                </span>
              </span>
              <span className="rg-hero-accent-row">
                <span className="rg-reveal-word-wrap">
                  <span className="rg-reveal-word rg-hero-accent">WHERE PURITY MEETS POWER</span>
                </span>
              </span>
            </h1>

            <p className="rg-hero-lead">
              <WriteInText
                text="Third-party tested. Result published. Same-day dispatch Mon–Fri. AusPost Express Australia-wide."
                delay={0.2}
                charDelay={0.012}
              />
            </p>

            <div className="rg-hero-accent-line rg-hero-reveal" aria-hidden />

            <div className="rg-hero-actions rg-hero-reveal">
              <a href={shopPageUrl()} className="rg-btn rg-btn--primary rg-btn--cool">
                Shop <span className="rg-btn-accent-word">now</span>
                <ArrowRight className="w-4 h-4 rg-btn-arrow" />
              </a>
            </div>
          </div>

          <div className="rg-hero-visual nl-hero-visual relative flex flex-col items-center w-full">
            <HplcCard pathRef={pathRef} />
          </div>
        </div>

        <div className="nl-hero-meta-block rg-hero-meta-block mt-6 lg:mt-8 shrink-0">
          <div className="nl-hero-meta-row">
            <div className="nl-hero-meta-left">
              {metaStats.map((item, i) => (
                <div key={item.label} className="nl-hero-meta-stat-wrap">
                  {i > 0 && <span className="nl-hero-meta-divider" aria-hidden />}
                  <div className="nl-hero-meta-stat rg-hero-meta-stat">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--nl-accent)] mb-1.5" strokeWidth={1.75} />
                    <p className="text-sm sm:text-base font-bold text-[var(--nl-text)] leading-none tabular-nums">
                      {item.kind === 'count' ? (
                        <CountUp
                          end={item.end}
                          prefix={'prefix' in item ? item.prefix : ''}
                          suffix={item.suffix}
                          delay={COUNT_BASE_DELAY + i * 0.14}
                          duration={COUNT_DURATION}
                        />
                      ) : (
                        <WriteInText
                          text={item.value}
                          delay={COUNT_BASE_DELAY + i * 0.14}
                          charDelay={0.055}
                        />
                      )}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--nl-text-muted)] mt-1 font-semibold">
                      <WriteInText text={item.label} delay={labelDelay(i)} charDelay={0.03} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="nl-spec-bar nl-hero-meta-spec rg-hero-spec-bar rounded-xl border border-[var(--nl-border)] bg-[var(--nl-bg-elevated)] px-4 py-3 flex flex-wrap items-center justify-center lg:justify-end gap-x-3 sm:gap-x-4 gap-y-2 text-[10px] sm:text-xs font-mono">
              <span className="text-[#36ea51] font-bold uppercase tracking-wider">{BATCH_NO}</span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF]">
                HPLC{' '}
                <span className="text-[#36ea51] font-semibold tabular-nums">99.2%</span>
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF]">
                LC-MS <span className="text-[#36ea51] font-semibold">Pass</span>
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF]">
                Assay <span className="text-[#36ea51] font-semibold">10.2mg</span>
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#FFFFFF  ]">
                Lab <OzcaniumAnalyticsName className="font-semibold" />
              </span>
              <span className="text-[var(--nl-border-strong)] hidden sm:inline">|</span>
              <span className="text-[#36ea51] font-bold">COA Verified</span>
            </div>
          </div>
        </div>
      </div>

      <BatchTicker />
    </section>
  );
}

export default function ResearchGateway() {
  const [openFaq, setOpenFaq] = useState<string | null>('hplc');

  return (
    <div className="nl-new-landing rg-page">
      <SEO
        title={RESEARCH_GATEWAY_SEO.title}
        description={RESEARCH_GATEWAY_SEO.description}
        keywords={RESEARCH_GATEWAY_SEO.keywords}
      />

      <main id="main-content" className="relative pt-16 sm:pt-20 lg:pt-24">
        <ResearchHero />

        <VerificationSection />

        <section id="approach" className="rg-section rg-section--alt">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">What&apos;s on your COA</p>
              <h2 className="rg-heading">The three tests customers ask for first.</h2>
              <p className="rg-lead mx-auto">
                Purity percentage, compound identity, and stated dose — documented independently by{' '}
                <OzcaniumAnalyticsName />
                {' '}and published on every batch COA.
              </p>
            </div>
            <div className="rg-approach-grid rg-approach-grid--coa">
              {APPROACH.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rg-approach-card">
                    <div className="rg-approach-icon">
                      <Icon className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.75} />
                    </div>
                    <h3 className="rg-card-title">{item.title}</h3>
                    <p className="rg-card-text">{item.text}</p>
                  </article>
                );
              })}
            </div>
            <p className="rg-section-note">Published proof — not marketing claims.</p>
          </div>
        </section>

        <section id="process" className="rg-section">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">Testing protocol</p>
              <h2 className="rg-heading">How every COA is built.</h2>
              <p className="rg-lead mx-auto">
                Four stages from sample to published COA. No batch reaches the catalogue until all three tests pass.
              </p>
            </div>
            <div className="rg-steps">
              {VERIFY_STEPS.map((step) => (
                <article key={step.step} className="rg-step">
                  <span className="rg-step-num">{step.step}</span>
                  <h3 className="rg-card-title">{step.title}</h3>
                  <p className="rg-card-text">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rg-section rg-section--alt">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">Compare</p>
              <h2 className="rg-heading">Full COA testing vs typical suppliers.</h2>
              <p className="rg-lead mx-auto">
                What a complete Certificate of Analysis should include — and what most suppliers skip.
              </p>
            </div>
            <div className="rg-compare-wrap">
              <table className="rg-compare">
                <thead>
                  <tr>
                    <th scope="col">Criteria</th>
                    <th scope="col" className="rg-compare-us">
                      PEPLAB
                    </th>
                    <th scope="col">Typical suppliers</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td>{row.label}</td>
                      <td>{row.us ? <Check className="rg-check yes" /> : '—'}</td>
                      <td>{row.them ? <Check className="rg-check yes" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rg-section rg-section--alt">
          <div className="rg-container">
            <div className="rg-section-header">
              <p className="rg-eyebrow">Resources</p>
              <h2 className="rg-heading">Verify documentation, then order.</h2>
            </div>
            <div className="rg-resource-grid">
              <a href={coaArchiveUrl()} className="rg-resource-card">
                <span className="rg-resource-num">01</span>
                <h3 className="rg-card-title">Published COA archive</h3>
                <p className="rg-card-text">
                  Review HPLC purity, LC-MS identity, and content assay results for every batch before you order.
                </p>
                <span className="rg-resource-link">
                  Open COA archive <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <a href={shopPageUrl()} className="rg-resource-card">
                <span className="rg-resource-num">02</span>
                <h3 className="rg-card-title">Research catalogue</h3>
                <p className="rg-card-text">
                  Browse research compounds with batch-specific COAs linked to each product listing.
                </p>
                <span className="rg-resource-link">
                  Browse catalogue <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <a href={shopPageUrl()} className="rg-resource-card">
                <span className="rg-resource-num">03</span>
                <h3 className="rg-card-title">Shop &amp; dispatch</h3>
                <p className="rg-card-text">
                  Order with full traceability. Same-day dispatch Mon–Fri via AusPost Express.
                </p>
                <span className="rg-resource-link">
                  Go to shop <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          </div>
        </section>

        <FaqOrderSection openFaq={openFaq} setOpenFaq={setOpenFaq} />

        <LandingFooter hideCta />
      </main>
    </div>
  );
}
