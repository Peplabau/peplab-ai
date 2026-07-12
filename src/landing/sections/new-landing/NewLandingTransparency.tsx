
import { useRef } from 'react';
import { ArrowRight, FileText, FlaskConical, Link2, Search, TestTube2 } from 'lucide-react';
import RevealHeading from '@/landing/components/new-landing/RevealHeading';
import { useNewLandingReveal } from '@/landing/hooks/useNewLandingReveal';
import { shopUrl, coaArchiveUrl } from '@/landing/lib/site';

const SMALL_CARDS = [
  {
    icon: FlaskConical,
    title: 'Third-party tested',
    description:
      'Every batch undergoes independent HPLC analysis by third-party laboratories.',
  },
  {
    icon: Link2,
    title: 'Unique batch IDs',
    description:
      'Each batch is assigned a unique identifier for complete traceability from source to delivery.',
  },
  {
    icon: FileText,
    title: 'Published COAs',
    description:
      'Certificates of Analysis are published publicly and linked directly to each product listing.',
  },
  {
    icon: Search,
    title: 'Purity verified',
    description:
      'Results confirm identity, purity, and composition meet our ≥99% standard before release.',
  },
] as const;

export default function NewLandingTransparency() {
  const sectionRef = useRef<HTMLElement>(null);
  useNewLandingReveal(sectionRef);

  return (
    <section ref={sectionRef} className="nl-section overflow-hidden" aria-labelledby="nl-transparency-heading">
      <div className="nl-transparency-glow pointer-events-none" aria-hidden />

      <div className="nl-featured-container relative z-10">
        <header className="nl-section-header">
          <p className="nl-reveal-eyebrow nl-eyebrow">Transparency</p>
          <RevealHeading as="h2" id="nl-transparency-heading" className="nl-heading">
            Batch-Level Verification
          </RevealHeading>
        </header>

        <div className="nl-transparency-grid-wrap">
          <div className="nl-transparency-grid">
            <article className="nl-transparency-feature nl-reveal-item">
              <div className="nl-transparency-icon-box">
                <TestTube2 className="w-5 h-5 text-[#2ED1B4]" strokeWidth={1.75} />
              </div>
              <h3 className="nl-reveal-text text-xl sm:text-2xl font-extrabold text-[#F4F6FA] mt-5 leading-tight">
                Not generic claims.
              </h3>
              <p className="nl-reveal-text text-sm sm:text-base text-[#A9B3C7] mt-4 leading-relaxed font-medium">
                We publish analytical results for{' '}
                <strong className="text-[#F4F6FA] font-bold">every batch received</strong>
                —not blanket statements. You can verify purity, identity, and composition before
                your research begins.
              </p>
              <a
                href={coaArchiveUrl()}
                className="nl-reveal-text nl-transparency-cta mt-6 sm:mt-8 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide text-[#070A12] bg-[#2ED1B4] hover:bg-[#38DCC0] transition-colors"
              >
                View batch results
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </a>
            </article>

            <div className="nl-transparency-cards">
              {SMALL_CARDS.map((card) => (
                <article key={card.title} className="nl-transparency-card nl-reveal-item">
                  <div className="nl-transparency-icon-box nl-transparency-icon-box--sm">
                    <card.icon className="w-4 h-4 text-[#2ED1B4]" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#F4F6FA] mt-4 leading-snug">{card.title}</h4>
                  <p className="text-xs sm:text-sm text-[#A9B3C7] mt-2 leading-relaxed font-medium">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
