import type { ReactionCounts, ReactionKind } from '@/types/resume';
import { REACTION_KINDS } from '@/types/resume';

export const REACTION_META: Record<ReactionKind, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Like' },
  heart: { emoji: '❤️', label: 'Heart' },
  fire: { emoji: '🔥', label: 'Fire' },
  wow: { emoji: '😮', label: 'Wow' },
  haha: { emoji: '😂', label: 'Haha' },
};

/** Anything carrying the one-per-person reaction shape: a resume or a comment. */
export type Reactable = {
  viewerReaction: ReactionKind | null;
  reactionCounts: ReactionCounts;
  reactionCount: number;
};

export function optimisticReaction<T extends Reactable>(item: T, kind: ReactionKind | null): T {
  const previous = item.viewerReaction;
  if (previous === kind) return item;

  const reactionCounts: ReactionCounts = { ...item.reactionCounts };
  if (previous) reactionCounts[previous] = Math.max(0, reactionCounts[previous] - 1);
  if (kind) reactionCounts[kind] += 1;

  const delta = (kind ? 1 : 0) - (previous ? 1 : 0);

  return {
    ...item,
    viewerReaction: kind,
    reactionCounts,
    reactionCount: Math.max(0, item.reactionCount + delta),
  };
}

/** The kinds actually used on a resume, most popular first. */
export function rankedReactions(counts: ReactionCounts): ReactionKind[] {
  return REACTION_KINDS.filter((kind) => counts[kind] > 0).sort((a, b) => counts[b] - counts[a]);
}
