/**
 * Research Gateway — premium editorial landing for /landing.
 * Homepage design language (Sora/Inter/IBM Plex Mono, dark grid bg, brand violet accent)
 * with a bento proof grid, batch marquee, and oversized display type.
 */
import { useLayoutEffect, useRef, useState } from 'react';
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
import OzcaniumAnalyticsName from '@/components/OzcaniumAnalyticsName';
import { SEO } from '@/components/SEO';
import { RESEARCH_GATEWAY_SEO } from '@/landing/lib/seo-keywords';
import LandingFooter from '@/landing/components/LandingFooter';
import { coaArchiveUrl, shopPageUrl } from '@/landing/lib/site';
import TrustpilotReviews from '@/sections/TrustpilotReviews';
import MarketingLanding from '@/pages/MarketingLanding';

gsap.registerPlugin(ScrollTrigger);

const BATCH_NO = 'BN88LAB';
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
        <MarketingLanding />
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
