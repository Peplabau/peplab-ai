/**
 * Reviews mentioning GHK-Cu are never shown on public Trustpilot sections.
 * Matches: GHKCU, GHK-CU, GHK CU, and unicode dash variants.
 */
const GHK_CU_PATTERN =
  /ghk[\s\u00a0\u2000-\u200b\u2010-\u2015._\-–—/:]*cu\b/i;

/** Normalize fancy dashes/spaces so concatenated and hyphenated forms match reliably. */
function normalizeTrustpilotText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u2010-\u2015\u2212]/g, '-') // various dashes → hyphen
    .replace(/[\u00a0\u2000-\u200b]/g, ' ');
}

export function trustpilotTextMentionsGhkCu(...parts: Array<string | null | undefined>): boolean {
  const text = normalizeTrustpilotText(parts.filter(Boolean).join(' '));
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

export function filterPublicTrustpilotReviews<
  T extends {
    title?: string | null;
    body?: string | null;
    author_name?: string | null;
  },
>(reviews: T[]): T[] {
  return reviews.filter((review) => !trustpilotReviewMentionsGhkCu(review));
}
