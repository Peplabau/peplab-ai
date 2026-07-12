import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SHOP_PATH } from '@/lib/routes';

const CTA_BULLETS = [
  '99%+ HPLC purity',
  'Same-day dispatch (Mon–Fri)',
  '10% off crypto orders',
] as const;

export default function NewLandingClosing() {
  return (
    <section className="nl-closing relative z-10" aria-labelledby="nl-closing-learn-heading">
      <div className="nl-closing-learn">
        <div className="nl-featured-container py-8 sm:py-12 lg:py-14">
          <header className="nl-section-header">
            <p className="nl-eyebrow">Learn more</p>
            <h2 id="nl-closing-learn-heading" className="nl-heading">
              Explore the PEPLAB research catalogue
            </h2>
            <p className="nl-lead">
              Detailed compound profiles, mechanisms of action, and published literature references for
              every peptide in our catalogue.
            </p>
            <div className="nl-closing-actions mt-8 sm:mt-10">
              <a href={SHOP_PATH} className="nl-closing-btn nl-closing-btn--primary">
                Research catalogue
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </a>
              <Link to="/standards" className="nl-closing-btn nl-closing-btn--secondary">
                Research gateway
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          </header>
        </div>
      </div>

      <div className="nl-closing-cta-wrap">
        <div className="nl-closing-cta-container pb-10 sm:pb-12 lg:pb-14">
          <div className="nl-closing-cta">
            <div className="nl-closing-cta-grid" aria-hidden />
            <div className="nl-closing-cta-glow" aria-hidden />

            <div className="nl-closing-cta-inner">
              <p className="nl-closing-cta-eyebrow">Get started</p>
              <h3 className="nl-closing-cta-title">
                Choose a <span className="nl-closing-cta-highlight">compound.</span>
                <br className="hidden sm:block" /> We&apos;ll handle the{' '}
                <span className="nl-closing-cta-highlight">rest.</span>
              </h3>
              <p className="nl-closing-cta-desc">
                Independent batch testing, AusPost Express, transparent CoAs. Built for laboratories that
                need certainty, not marketing.
              </p>
              <div className="nl-closing-cta-actions">
                <a href={SHOP_PATH} className="nl-closing-btn nl-closing-btn--cta-primary">
                  Browse the catalogue
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </a>
                <Link to="/standards" className="nl-closing-btn nl-closing-btn--cta-outline">
                  View latest CoA
                </Link>
              </div>
              <ul className="nl-closing-bullets">
                {CTA_BULLETS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
