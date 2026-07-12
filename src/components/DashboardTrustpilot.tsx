import { ExternalLink, Lock, Star } from 'lucide-react';
import { CONFIG } from '@/lib/config';

type DashboardTrustpilotProps = {
  unlocked: boolean;
};

export default function DashboardTrustpilot({ unlocked }: DashboardTrustpilotProps) {
  return (
    <div
      className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl border ${
        unlocked
          ? 'bg-gradient-to-br from-[rgba(46,209,180,0.08)] to-[rgba(139,92,246,0.08)] border-[rgba(46,209,180,0.25)]'
          : 'bg-[rgba(17,24,39,0.6)] border-[rgba(244,246,250,0.08)]'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${
            unlocked ? 'bg-[rgba(46,209,180,0.15)]' : 'bg-[rgba(244,246,250,0.06)]'
          }`}
        >
          {unlocked ? (
            <Star className="h-5 w-5 text-[#F59E0B]" />
          ) : (
            <Lock className="h-5 w-5 text-[#A9B3C7]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-[#F4F6FA] mb-1">
            Trustpilot reviews
          </h3>
          {unlocked ? (
            <>
              <p className="text-xs sm:text-sm text-[#A9B3C7] mb-4 leading-relaxed">
                Thank you for your purchase. Your Trustpilot review link is unlocked — share your
                experience to help other researchers and support PEPLAB.
              </p>
              <a
                href={CONFIG.TRUSTPILOT.REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-full text-sm"
              >
                Add a Review on Trustpilot
                <ExternalLink className="h-4 w-4" />
              </a>
              <p className="mt-3 text-[11px] text-[#A9B3C7] leading-relaxed">
                This link is only available to verified customers here and in your order emails —
                not on our public storefront — to keep reviews authentic.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-[#A9B3C7] mb-4 leading-relaxed">
                Trustpilot reviews unlock after you complete a purchase. This keeps public feedback
                from verified customers only and helps protect our community from spam or fake
                reviews.
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(244,246,250,0.2)] px-5 py-2.5 text-sm font-medium text-[#F4F6FA] transition-colors hover:border-[rgba(46,209,180,0.45)] hover:bg-[rgba(46,209,180,0.08)]"
              >
                Shop peptides
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
