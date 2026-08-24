/** Reviews mentioning GHK-Cu are never shown on public Trustpilot sections. */
const GHK_CU_PATTERN = /ghk[\s._\-/:]*cu\b/i;

export function trustpilotTextMentionsGhkCu(...parts: Array<string | null | undefined>): boolean {
  const text = parts.filter(Boolean).join(' ');
  if (!text.trim()) return false;
  return GHK_CU_PATTERN.test(text);
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
