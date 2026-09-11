export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'narrow' });
const absolute = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

/** "Sep 11" — the date on its own. */
export function formatShortDate(date: Date): string {
  return absolute.format(date);
}

/**
 * "just now", "5m ago", "3h ago", "2d ago" — null once the gap is measured in
 * months, where counting days stops telling the reader anything the date can't.
 */
export function formatAge(elapsed: number): string | null {
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), 'minute');
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), 'hour');
  if (elapsed < MONTH) return relative.format(-Math.floor(elapsed / DAY), 'day');
  return null;
}

/**
 * "Sep 11 (3h ago)" — the date anchors the post, the age tells you how warm it
 * is. Months-old posts drop the bracket and keep the date alone.
 */
export function formatPostedTime(isoDate: string): string {
  const date = new Date(isoDate);
  const age = formatAge(Date.now() - date.getTime());
  const day = formatShortDate(date);

  return age ? `${day} (${age})` : day;
}
