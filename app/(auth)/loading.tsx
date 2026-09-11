import { Skeleton } from '@/components/ui/skeleton';

/**
 * Renders into the form column of `(auth)/layout.tsx`, so the pitch panel and
 * the strip beneath stay put — only the form area swaps.
 *
 * Shaped like the login form (heading, two labelled fields, submit, footer
 * link) because it's the shorter of the two; signup adds a name field, which
 * grows downward without shifting anything already on screen.
 */
export default function AuthLoading() {
  return (
    <div className="flex flex-col gap-6" role="status">
      <span className="sr-only">Loading…</span>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {/* Label, then the `h-10` input it sits above. */}
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        <Skeleton className="mt-1 h-9 w-full" />
        <Skeleton className="mx-auto h-4 w-44" />
      </div>
    </div>
  );
}
