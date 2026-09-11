const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'narrow' });
const absolute = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

/**
 * Comments are read against each other, so recency matters more than the date:
 * "2h" places a reply in a conversation in a way "Sep 11" does not. Past a week
 * that stops being true and the date is more useful.
 */
export function formatCommentTime(isoDate: string): string {
  const date = new Date(isoDate);
  const elapsed = Date.now() - date.getTime();

  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), 'minute');
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), 'hour');
  if (elapsed < WEEK) return relative.format(-Math.floor(elapsed / DAY), 'day');
  return absolute.format(date);
}

/** "3 replies", "1 reply" — the label behind a collapsed thread. */
export function replyLabel(count: number): string {
  return `${count} ${count === 1 ? 'reply' : 'replies'}`;
}
