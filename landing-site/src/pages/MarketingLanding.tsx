import { ArrowRight } from 'lucide-react';
import { coaArchiveUrl, shopPageUrl } from '@/lib/site';
import './marketing-landing.css';

const STATS = [
  { n: '≥99%', l: 'HPLC purity floor' },
  { n: '3', l: 'Tests per batch' },
  { n: '60+', l: 'Published batches' },
] as const;

export default function MarketingLanding() {
  return (
    <div className="ml-page">
      <div className="ml-announce">
        <div className="ml-announce-pill">
          <span className="ml-announce-dot" aria-hidden />
          <p className="ml-announce-text">Peptides Australia – Research use only</p>
        </div>
      </div>

      <section className="ml-hero" aria-label="PEPLAB landing">
        <div className="ml-hero-photo">
          <img
            src="/landing-hero.png"
            alt="PEPLAB research peptides, BAC water, and laboratory supplies"
            width={1600}
            height={1067}
          />
        </div>

        <div className="ml-copy">
          <h1 className="ml-headline">
            Research
            <br />
            Peptides
            <br />
            Australia
          </h1>
          <p className="ml-sub">Lab proof. Not promises.</p>

          <div className="ml-actions">
            <a href={shopPageUrl()} className="ml-shop">
              Shop now
              <ArrowRight className="ml-shop-arrow" strokeWidth={2.4} />
            </a>
            <a href={coaArchiveUrl()} className="ml-coa">
              Browse COA archive
            </a>
          </div>

          <dl className="ml-stats">
            {STATS.map((item) => (
              <div key={item.l}>
                <dt className="sr-only">{item.l}</dt>
                <dd className="ml-stat-n">{item.n}</dd>
                <dd className="ml-stat-l">{item.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
