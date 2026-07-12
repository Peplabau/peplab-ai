import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { ReviewPhoto } from '@/components/ReviewImageUpload';
import { getHomepageReviews, incrementReviewHelpful, type HomepageReviewRow } from '@/lib/supabase-db';
import {
  getReviewHelpfulVotedIds,
  hasVotedReviewHelpful,
  markReviewHelpfulVoted,
} from '@/lib/review-helpful';

gsap.registerPlugin(ScrollTrigger);

interface HomepageReview {
  id: string;
  title?: string;
  product_name?: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count?: number;
  image_url?: string | null;
}

export default function Reviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<HomepageReview[]>([]);
  const [totalVerifiedReviews, setTotalVerifiedReviews] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [votedReviewIds, setVotedReviewIds] = useState<string[]>([]);
  const [likingReviewId, setLikingReviewId] = useState<string | null>(null);

  const reviewsPerView = typeof window !== 'undefined'
    ? window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4
    : 4;
  const maxIndex = Math.max(0, reviews.length - reviewsPerView);

  useEffect(() => {
    setVotedReviewIds(getReviewHelpfulVotedIds());
  }, []);

  useEffect(() => {
    getHomepageReviews().then((data: HomepageReviewRow[]) => {
      const rows: HomepageReview[] = data.map((row) => ({
        id: row.id,
        title: row.title || '',
        product_name: row.products?.name || 'Product Review',
        rating: Math.max(1, Math.min(5, Number(row.rating) || 5)),
        comment: row.comment || '',
        is_verified_purchase: Boolean(row.is_verified_purchase),
        helpful_count: Number(row.helpful_count) || 0,
        image_url: row.image_url || null,
      }));
      setReviews(rows);
      setTotalVerifiedReviews(rows.filter((r) => r.is_verified_purchase).length);
    }).catch((err) => console.error('Failed to load homepage reviews:', err));
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
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, maxIndex]);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : '5.0';

  const isReviewVoted = (reviewId: string) =>
    votedReviewIds.includes(reviewId) || hasVotedReviewHelpful(reviewId);

  const markHelpful = async (reviewId: string) => {
    if (isReviewVoted(reviewId) || likingReviewId === reviewId) return;

    setIsAutoPlaying(false);
    setLikingReviewId(reviewId);

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, helpful_count: (review.helpful_count || 0) + 1 }
          : review,
      ),
    );

    const result = await incrementReviewHelpful(reviewId);

    if ('error' in result) {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpful_count: Math.max(0, (review.helpful_count || 1) - 1) }
            : review,
        ),
      );
      setLikingReviewId(null);
      return;
    }

    markReviewHelpfulVoted(reviewId);
    setVotedReviewIds((prev) => (prev.includes(reviewId) ? prev : [...prev, reviewId]));
    setLikingReviewId(null);
  };

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="relative z-30 py-20 lg:py-28"
    >
      <div className="relative z-10 px-6 lg:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="eyebrow mb-4 block">REVIEWS</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
            Customers are <span className="gradient-text">reviewing</span>
          </h2>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-[#F4F6FA]">{averageRating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
            </div>
            <div className="h-8 w-px bg-[rgba(244,246,250,0.2)]" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              <span className="text-[#A9B3C7]">({totalVerifiedReviews}) Verified</span>
            </div>
          </div>
        </div>

        {/* Slideshow Container */}
        <div className="relative">
          {/* Edge blur fade — desktop only, kept intentionally narrow */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #070A12 0%, transparent 100%)' }} />
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #070A12 0%, transparent 100%)' }} />

          {/* Reviews Slider */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / reviewsPerView)}%)` }}
            >
              {reviews.map((review) => {
                const voted = isReviewVoted(review.id);
                const liking = likingReviewId === review.id;

                return (
                  <div
                    key={review.id}
                    className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-2"
                  >
                    <div
                      role="button"
                      tabIndex={voted ? -1 : 0}
                      onClick={() => markHelpful(review.id)}
                      onKeyDown={(e) => {
                        if (voted || liking) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          markHelpful(review.id);
                        }
                      }}
                      className={`h-full p-5 rounded-2xl bg-[#111827] border transition-all duration-300 ${
                        voted
                          ? 'border-[rgba(46,209,180,0.25)] cursor-default'
                          : 'border-[rgba(244,246,250,0.08)] hover:border-[rgba(46,209,180,0.2)] cursor-pointer active:scale-[0.99]'
                      }`}
                      aria-label={
                        voted
                          ? 'You found this review helpful'
                          : 'Tap to mark this review as helpful'
                      }
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-[#F4F6FA]">{review.title || 'Verified Review'}</h4>
                          <p className="text-xs text-[#8B5CF6]">{review.product_name}</p>
                        </div>
                        {review.is_verified_purchase && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(34,197,94,0.1)]">
                            <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                            <span className="text-[10px] text-[#22C55E]">Verified</span>
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                        ))}
                      </div>

                      {/* Comment */}
                      {review.image_url && (
                        <ReviewPhoto url={review.image_url} className="mb-3" />
                      )}
                      <p className="text-sm text-[#A9B3C7] mb-4 leading-relaxed">
                        "{review.comment}"
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[rgba(244,246,250,0.08)]">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs tabular-nums ${
                            voted ? 'text-[#2ED1B4]' : 'text-[#A9B3C7]'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${voted ? 'fill-current' : ''}`} />
                          {review.helpful_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[...Array(maxIndex + 1)].map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex 
                    ? 'w-6 bg-[#8B5CF6]' 
                    : 'bg-[rgba(244,246,250,0.3)] hover:bg-[rgba(244,246,250,0.5)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA removed per landing-page request */}
      </div>
    </section>
  );
}
