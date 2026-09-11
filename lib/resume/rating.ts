import type { FeedResume } from '@/types/resume';

export function optimisticRating(resume: FeedResume, score: number): FeedResume {
  const previousScore = resume.viewerRating;
  const previousCount = resume.ratingCount;
  const previousTotal = (resume.averageRating ?? 0) * previousCount;
  const nextCount = previousScore === null ? previousCount + 1 : previousCount;
  const nextTotal =
    previousScore === null ? previousTotal + score : previousTotal - previousScore + score;

  return {
    ...resume,
    viewerRating: score,
    ratingCount: nextCount,
    averageRating: Number((nextTotal / nextCount).toFixed(2)),
  };
}
