import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Shown for unmatched URLs and wherever a segment calls `notFound()`.
 *
 * No `metadata` export: `not-found.tsx` isn't a route, so Next ignores one here
 * (only the experimental `global-not-found.js` accepts it). The title falls back
 * to the root layout's, which is the sensible thing to show anyway.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-widest text-muted-foreground">
        404
      </p>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-4xl tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The link may be out of date, or the resume you&apos;re after has since
          been taken down by its author.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button render={<Link href="/" />} nativeButton={false} size="lg">
          Back home
        </Button>
        <Button
          render={<Link href="/account" />}
          nativeButton={false}
          variant="ghost"
          size="lg"
        >
          Your account
        </Button>
      </div>
    </div>
  );
}
