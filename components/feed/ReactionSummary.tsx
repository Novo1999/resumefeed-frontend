import { REACTION_META, rankedReactions } from '@/lib/resume/reaction';
import type { ReactionCounts } from '@/types/resume';

type ReactionSummaryProps = {
  counts: ReactionCounts;
  total: number;
};

export function ReactionSummary({ counts, total }: ReactionSummaryProps) {
  if (total === 0) return null;

  const topKinds = rankedReactions(counts).slice(0, 3);

  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label={`${total} ${total === 1 ? 'reaction' : 'reactions'}`}
    >
      <span className="flex -space-x-1" aria-hidden="true">
        {topKinds.map((kind) => (
          <span
            key={kind}
            className="flex size-5 items-center justify-center rounded-full bg-background text-[11px] leading-none ring-1 ring-border"
          >
            {REACTION_META[kind].emoji}
          </span>
        ))}
      </span>
      {total}
    </span>
  );
}
