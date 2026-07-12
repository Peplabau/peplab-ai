import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare } from 'lucide-react';
import { ReviewPhoto } from '@/components/ReviewImageUpload';
import { incrementReviewHelpful } from '@/lib/supabase-db';
import { supabase } from '@/lib/supabase';
import {
  getReviewHelpfulVotedIds,
  hasVotedReviewHelpful,
  markReviewHelpfulVoted,
} from '@/lib/review-helpful';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  image_url?: string | null;
  profiles?: {
    full_name: string;
  };
}

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [votedReviewIds, setVotedReviewIds] = useState<string[]>([]);
  const [likingReviewId, setLikingReviewId] = useState<string | null>(null);

  const isReviewVoted = (reviewId: string) =>
    votedReviewIds.includes(reviewId) || hasVotedReviewHelpful(reviewId);

  useEffect(() => {
    setVotedReviewIds(getReviewHelpfulVotedIds());
  }, []);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Calculate stats
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
        setTotalReviews(data.length);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    if (isReviewVoted(reviewId) || likingReviewId === reviewId) return;

    setLikingReviewId(reviewId);
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, helpful_count: review.helpful_count + 1 }
          : review,
      ),
    );

    const result = await incrementReviewHelpful(reviewId);

    if ('error' in result) {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpful_count: Math.max(0, review.helpful_count - 1) }
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-[#F59E0B] fill-[#F59E0B]'
                : 'text-[rgba(244,246,250,0.2)]'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-40 rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <MessageSquare className="w-6 h-6 text-[#2ED1B4]" />
        <h3 className="text-xl font-semibold text-[#F4F6FA]">Customer Reviews</h3>
        {totalReviews > 0 && (
          <div className="flex items-center gap-2">
            {renderStars(Math.round(averageRating))}
            <span className="text-[#A9B3C7]">({totalReviews})</span>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-6 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] text-center">
          <p className="text-[#A9B3C7]">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const voted = isReviewVoted(review.id);
            const liking = likingReviewId === review.id;

            return (
            <div
              key={review.id}
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
              className={`p-5 rounded-xl bg-[rgba(17,24,39,0.6)] border transition-all duration-300 ${
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
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-[#22C55E]">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-[#F4F6FA]">{review.title}</h4>
                  )}
                </div>
                <span className="text-xs text-[#A9B3C7]">
                  {new Date(review.created_at).toLocaleDateString('en-AU')}
                </span>
              </div>
              
              {review.image_url && <ReviewPhoto url={review.image_url} className="mb-4" />}
              <p className="text-[#A9B3C7] mb-4">{review.comment}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A9B3C7]">
                  {'Verified Buyer'}
                </span>
                <span
                  className={`flex items-center gap-1 text-sm tabular-nums ${
                    voted ? 'text-[#2ED1B4]' : 'text-[#A9B3C7]'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-current' : ''}`} />
                  {review.helpful_count}
                </span>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}