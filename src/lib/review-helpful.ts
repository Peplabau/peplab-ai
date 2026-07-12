const STORAGE_KEY = 'peplab_review_helpful_voted';

export function getReviewHelpfulVotedIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function hasVotedReviewHelpful(reviewId: string): boolean {
  return getReviewHelpfulVotedIds().includes(reviewId);
}

export function markReviewHelpfulVoted(reviewId: string): void {
  try {
    const voted = getReviewHelpfulVotedIds();
    if (voted.includes(reviewId)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...voted, reviewId]));
  } catch {
    /* ignore storage errors */
  }
}
