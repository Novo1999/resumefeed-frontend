import { WEEK, formatAge, formatShortDate } from './time';

/**
 * Comments are read against each other, so recency matters more than the date:
 * "2h" places a reply in a conversation in a way "Sep 11" does not. Past a week
 * that stops being true and the date is more useful.
 */
export function formatCommentTime(isoDate: string): string {
  const date = new Date(isoDate);
  const elapsed = Date.now() - date.getTime();

  if (elapsed >= WEEK) return formatShortDate(date);
  return formatAge(elapsed) ?? formatShortDate(date);
}

/** "3 replies", "1 reply" — the label behind a collapsed thread. */
export function replyLabel(count: number): string {
  return `${count} ${count === 1 ? 'reply' : 'replies'}`;
}
