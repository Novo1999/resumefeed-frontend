import Link from 'next/link';
import { cn } from 'cn';

const brandMark = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    className="size-3.5"
  >
    <path d="M5 6h9M5 12h14M5 18h11" />
  </svg>
);

export function Brand({
  href = '/',
  tone = 'default',
  className,
}: {
  href?: string;
  /** `inverted` for the dark marketing panel, where theme tokens invert wrongly. */
  tone?: 'default' | 'inverted';
  className?: string;
}) {
  const inverted = tone === 'inverted';

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 text-base font-semibold tracking-tight',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-md',
          inverted ? 'bg-zinc-50 text-zinc-950' : 'bg-foreground text-background',
        )}
      >
        {brandMark}
      </span>
      <span>
        Resume
        <span className={inverted ? 'text-zinc-400' : 'text-muted-foreground'}>Feed</span>
      </span>
    </Link>
  );
}
