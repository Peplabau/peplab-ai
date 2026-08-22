import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, CheckCircle, ExternalLink } from 'lucide-react';
import { CONFIG } from '@/lib/config';
import {
  getTrustpilotHomepageFeed,
  type TrustpilotReviewRow,
  type TrustpilotStatsRow,
} from '@/lib/supabase-db';
import { filterPublicTrustpilotReviews } from '@/lib/trustpilot-filters';

gsap.registerPlugin(ScrollTrigger);

function formatReviewDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

type TrustpilotReviewsProps = {
  /** `landing` matches Research Gateway (purple/pink). Default is homepage teal theme. */
  variant?: 'home' | 'landing';
};

/**
 * Trustpilot section — rating + slider from Supabase.
 */
export default function TrustpilotReviews({ variant = 'home' }: TrustpilotReviewsProps) {
  const isLanding = variant === 'landing';
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<TrustpilotReviewRow[]>([]);
  const [stats, setStats] = useState<TrustpilotStatsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  );

  const reviewsPerView = isLanding
    ? viewportWidth < 640
      ? 1
      : viewportWidth < 1024
        ? 2
        : 3
    : viewportWidth < 640
      ? 1
      : viewportWidth < 1024
        ? 2
        : 4;
  const maxIndex = Math.max(0, reviews.length - reviewsPerView);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getTrustpilotHomepageFeed()
      .then((feed) => {
        if (cancelled) return;
        setReviews(filterPublicTrustpilotReviews(feed.reviews));
        setStats(feed.stats);
      })
      .catch((err) => console.error('Failed to load Trustpilot feed:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= reviewsPerView) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, maxIndex, reviews.length, reviewsPerView]);

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const avgFromRows = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
    : null;
  const displayScore =
    stats?.trust_score != null && Number.isFinite(Number(stats.trust_score))
      ? Number(stats.trust_score).toFixed(1)
      : avgFromRows != null
        ? avgFromRows.toFixed(1)
        : null;
  const displayCount =
    stats?.review_count && stats.review_count > 0 ? stats.review_count : reviews.length;
  const verifiedCount = reviews.filter((r) => r.is_verified).length;
  const scoreStars = displayScore ? Math.round(Number(displayScore)) : 5;

  if (isLanding) {
    return (
      <section ref={sectionRef} id="reviews" className="rg-section rg-tp">
        <div className="rg-container">
          <div ref={headerRef} className="rg-section-header">
            <p className="rg-eyebrow">Trustpilot</p>
            <h2 className="rg-heading">
              What customers say on <span className="gradient-text">Trustpilot</span>
            </h2>
            <p className="rg-lead mx-auto">
              Independent reviews — the same score and feedback you can verify on Trustpilot.
            </p>

            {displayScore && (
              <div className="rg-tp-score">
                <span className="rg-tp-score-value">{displayScore}</span>
                <div className="rg-tp-score-stars" aria-hidden>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < scoreStars ? 'rg-tp-star--on' : 'rg-tp-star--off'
                      }`}
                    />
                  ))}
                </div>
                <span className="rg-tp-score-meta">
                  {displayCount} review{displayCount === 1 ? '' : 's'}
                  {verifiedCount > 0 ? ` · ${verifiedCount} verified` : ''}
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="rg-tp-empty">Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="rg-tp-empty">
              <p>
                Reviews appear here once synced from Trustpilot. You can still leave a review on
                Trustpilot now.
              </p>
              <a
                href={CONFIG.TRUSTPILOT.PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rg-btn rg-btn--primary rg-btn--cool"
              >
                View on Trustpilot
                <ExternalLink className="w-4 h-4 rg-btn-arrow" />
              </a>
            </div>
          ) : (
            <div className="rg-tp-slider">
              <div className="rg-tp-fade rg-tp-fade--left" aria-hidden />
              <div className="rg-tp-fade rg-tp-fade--right" aria-hidden />

              <div className="rg-tp-track-wrap">
                <div
                  className="rg-tp-track"
                  style={{ transform: `translateX(-${currentIndex * (100 / reviewsPerView)}%)` }}
                >
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rg-tp-slide"
                      style={{ flexBasis: `${100 / reviewsPerView}%` }}
                    >
                      <article className="rg-tp-card">
                        <div className="rg-tp-card-top">
                          <div className="min-w-0">
                            <h3 className="rg-tp-card-title">
                              {review.title || 'Customer review'}
                            </h3>
                            <p className="rg-tp-card-author">
                              {review.author_name || 'Trustpilot reviewer'}
                              {review.reviewed_at
                                ? ` · ${formatReviewDate(review.reviewed_at)}`
                                : ''}
                            </p>
                          </div>
                          {review.is_verified && (
                            <span className="rg-tp-verified">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="rg-tp-card-stars" aria-label={`${review.rating} out of 5`}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'rg-tp-star--on' : 'rg-tp-star--off'
                              }`}
                            />
                          ))}
                        </div>

                        {review.body && (
                          <p className="rg-tp-card-body">&ldquo;{review.body}&rdquo;</p>
                        )}

                        <a
                          href={review.source_url || CONFIG.TRUSTPILOT.PROFILE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rg-tp-card-link"
                        >
                          View on Trustpilot
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              {maxIndex > 0 && (
                <div className="rg-tp-dots" role="tablist" aria-label="Review slides">
                  {[...Array(maxIndex + 1)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === currentIndex}
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setCurrentIndex(i);
                      }}
                      className={`rg-tp-dot${i === currentIndex ? ' rg-tp-dot--active' : ''}`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rg-tp-actions">
            <a
              href={CONFIG.TRUSTPILOT.PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rg-btn rg-btn--outline"
            >
              Read all on Trustpilot
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={CONFIG.TRUSTPILOT.REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rg-btn rg-btn--primary rg-btn--cool"
            >
              Write a review
              <ExternalLink className="w-4 h-4 rg-btn-arrow" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="reviews" className="relative z-30 py-20 lg:py-28">
      <div className="relative z-10 px-6 lg:px-12 max-w-7xl mx-auto">
        <div ref={headerRef} className="text-center mb-12">
          <span className="eyebrow mb-4 block">TRUSTPILOT</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
            Real reviews on <span className="gradient-text">Trustpilot</span>
          </h2>
          <p className="text-sm sm:text-base text-[#A9B3C7] max-w-2xl mx-auto mb-6">
            Synced from our Trustpilot profile — rating and reviews served from PEPLAB.
          </p>

          {displayScore && (
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-[#F4F6FA] tabular-nums">{displayScore}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < scoreStars ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#4B5563]'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="h-8 w-px bg-[rgba(244,246,250,0.2)]" />
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[#A9B3C7] text-sm">
                <span className="tabular-nums">{displayCount} review{displayCount === 1 ? '' : 's'}</span>
                {verifiedCount > 0 && (
                  <>
                    <span className="hidden sm:inline text-[#6B7280]">·</span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      {verifiedCount} verified
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.45)] p-10 text-center text-sm text-[#A9B3C7]">
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.45)] p-8 text-center">
            <p className="text-sm text-[#A9B3C7] mb-4 leading-relaxed">
              Reviews will appear here after the next Trustpilot sync from admin. You can still leave
              a review on Trustpilot in the meantime.
            </p>
            <a
              href={CONFIG.TRUSTPILOT.PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-[#2ED1B4] text-[#070A12] hover:bg-[#26b89e] transition-colors"
            >
              View PEPLAB on Trustpilot
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="relative">
            <div
              className="hidden lg:block absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, #070A12 0%, transparent 100%)' }}
            />
            <div
              className="hidden lg:block absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, #070A12 0%, transparent 100%)' }}
            />

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * (100 / reviewsPerView)}%)` }}
              >
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-2"
                  >
                    <article className="h-full p-5 rounded-2xl bg-[#111827] border border-[rgba(244,246,250,0.08)] hover:border-[rgba(46,209,180,0.2)] transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#F4F6FA] truncate">
                            {review.title || 'Customer review'}
                          </h4>
                          <p className="text-xs text-[#8B5CF6] truncate">
                            {review.author_name || 'Trustpilot reviewer'}
                            {review.reviewed_at ? ` · ${formatReviewDate(review.reviewed_at)}` : ''}
                          </p>
                        </div>
                        {review.is_verified && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(34,197,94,0.1)] shrink-0">
                            <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                            <span className="text-[10px] text-[#22C55E]">Verified</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-[#F59E0B] text-[#F59E0B]'
                                : 'text-[#4B5563]'
                            }`}
                          />
                        ))}
                      </div>

                      {review.body && (
                        <p className="text-sm text-[#A9B3C7] mb-4 leading-relaxed line-clamp-5">
                          &ldquo;{review.body}&rdquo;
                        </p>
                      )}

                      <div className="pt-3 border-t border-[rgba(244,246,250,0.08)]">
                        <a
                          href={review.source_url || CONFIG.TRUSTPILOT.PROFILE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#A9B3C7] hover:text-[#2ED1B4] transition-colors"
                        >
                          View on Trustpilot
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {maxIndex > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {[...Array(maxIndex + 1)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-6 bg-[#8B5CF6]'
                        : 'bg-[rgba(244,246,250,0.3)] hover:bg-[rgba(244,246,250,0.5)]'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={CONFIG.TRUSTPILOT.PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
          >
            Read all on Trustpilot
            <ExternalLink className="w-4 h-4" />
          </a>
          <span className="hidden sm:inline text-[#6B7280]">·</span>
          <a
            href={CONFIG.TRUSTPILOT.REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-[#2ED1B4] text-[#070A12] hover:bg-[#26b89e] transition-colors"
          >
            Write a review
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
