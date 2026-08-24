/**
 * Public Trustpilot sections must never show a review that mentions GHK
 * in any form: GHK, GHK-Cu, GHK CU, ghkcu, ghK-CU, etc.
 */
const GHK_PATTERN = /\bghk(?:[\s._\-/:]*cu)?\b/i;

export function trustpilotTextMentionsGhkCu(...parts: Array<string | null | undefined>): boolean {
  const text = parts.filter(Boolean).join(' ');
  if (!text.trim()) return false;
  return GHK_PATTERN.test(text);
}

export function trustpilotReviewMentionsGhkCu(review: {
  title?: string | null;
  body?: string | null;
  author_name?: string | null;
}): boolean {
  return trustpilotTextMentionsGhkCu(review.title, review.body, review.author_name);
}

export function filterPublicTrustpilotReviews<T extends {
  title?: string | null;
  body?: string | null;
  author_name?: string | null;
}>(reviews: T[]): T[] {
  return reviews.filter((review) => !trustpilotReviewMentionsGhkCu(review));
}

export function statsFromPublicTrustpilotReviews(
  reviews: Array<{ rating?: number | null }>,
): { review_count: number; trust_score: number | null } {
  const review_count = reviews.length;
  if (review_count === 0) return { review_count: 0, trust_score: null };
  const trust_score =
    Math.round(
      (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / review_count) * 10,
    ) / 10;
  return { review_count, trust_score };
}
