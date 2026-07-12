import { Link } from 'react-router-dom';
import { ArrowRight, FileText, FlaskConical, Link2, Search, TestTube2 } from 'lucide-react';

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
    title: 'Batch records',
    description:
      'Batch documentation is maintained internally while public certificate links are being updated.',
  },
  {
    icon: Search,
    title: 'Purity verified',
    description:
      'Results confirm identity, purity, and composition meet our ≥99% standard before release.',
  },
] as const;

export default function NewLandingTransparency() {
  return (
    <section className="nl-section overflow-hidden" aria-labelledby="nl-transparency-heading">
      <div className="nl-transparency-glow pointer-events-none" aria-hidden />

      <div className="nl-featured-container relative z-10">
        <header className="nl-section-header">
          <p className="nl-eyebrow">Transparency</p>
          <h2 id="nl-transparency-heading" className="nl-heading">
            Batch-Level Verification
          </h2>
        </header>

        <div className="nl-transparency-grid-wrap">
          <div className="nl-transparency-grid">
            <article className="nl-transparency-feature">
              <div className="nl-transparency-icon-box">
                <TestTube2 className="w-5 h-5 text-[#2ED1B4]" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] mt-5 leading-tight">
                Not generic claims.
              </h3>
              <p className="text-sm sm:text-[0.9375rem] text-[#A9B3C7] mt-4 leading-relaxed">
                We publish analytical results for{' '}
                <strong className="text-[#F4F6FA] font-semibold">every batch received</strong>
                —not blanket statements. You can verify purity, identity, and composition before
                your research begins.
              </p>
              <Link
                to="/standards"
                className="nl-transparency-cta mt-6 sm:mt-8 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide text-[#070A12] bg-gradient-to-r from-[#2ED1B4] to-[#1FA896] hover:shadow-[0_8px_24px_rgba(46,209,180,0.35)] transition-shadow"
              >
                View batch results
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </article>

            <div className="nl-transparency-cards">
              {SMALL_CARDS.map((card) => (
                <article key={card.title} className="nl-transparency-card">
                  <div className="nl-transparency-icon-box nl-transparency-icon-box--sm">
                    <card.icon className="w-4 h-4 text-[#2ED1B4]" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-base font-bold text-[#F4F6FA] mt-4 leading-snug">{card.title}</h4>
                  <p className="text-xs sm:text-sm text-[#A9B3C7] mt-2 leading-relaxed">
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
