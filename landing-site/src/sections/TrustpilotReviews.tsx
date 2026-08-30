import { ExternalLink, Star } from 'lucide-react';
import { MAIN_SITE_URL } from '@/lib/site';

const TRUSTPILOT_PROFILE =
  import.meta.env.VITE_TRUSTPILOT_PROFILE_URL || 'https://www.trustpilot.com/review/peplab.com.au';

/**
 * Lightweight Trustpilot CTA for the standalone landing deploy.
 * Full review carousel stays in the main shop app (needs Supabase).
 */
export default function TrustpilotReviews({ variant = 'landing' }: { variant?: 'home' | 'landing' }) {
  const isLanding = variant === 'landing';

  if (isLanding) {
    return (
      <section id="reviews" className="rg-section rg-tp">
        <div className="rg-container">
          <div className="rg-section-header">
            <p className="rg-eyebrow">Trustpilot</p>
            <h2 className="rg-heading">
              What customers say on <span className="gradient-text">Trustpilot</span>
            </h2>
            <p className="rg-lead mx-auto">
              Independent reviews you can verify on Trustpilot. Full review feed lives on the shop
              site.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={TRUSTPILOT_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="rg-btn rg-btn--solid inline-flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                View Trustpilot reviews
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href={`${MAIN_SITE_URL}/shop`} className="rg-btn rg-btn--ghost">
                Visit PEPLAB shop
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
