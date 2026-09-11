'use client';

import { useState } from 'react';
import { StarIcon } from 'lucide-react';

type StarRatingProps = {
  value: number | null;
  pending: boolean;
  onRate: (score: number) => void;
};

export function StarRating({ value, pending, onRate }: StarRatingProps) {
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const displayedScore = hoveredScore ?? value ?? 0;

  return (
    <div
      className="flex items-center"
      role="radiogroup"
      aria-label="Rate this resume from 1 to 5 stars"
    >
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          aria-label={`${score} star${score === 1 ? '' : 's'}`}
          disabled={pending}
          onMouseEnter={() => setHoveredScore(score)}
          onMouseLeave={() => setHoveredScore(null)}
          onFocus={() => setHoveredScore(score)}
          onBlur={() => setHoveredScore(null)}
          onClick={() => onRate(score)}
          className="shrink-0 cursor-pointer rounded-sm p-0.5 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <StarIcon
            className={`size-[18px] transition-colors sm:size-5 ${
              score <= displayedScore ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
