import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the geometry of `app/account/page.tsx` — same container, same heading
 * block, same two cards — so the real page swaps in without the layout jumping.
 *
 * The page awaits `getCurrentUser()`, so this is what a visitor sees on every
 * navigation to `/account` while that round-trip is in flight.
 */
export default function AccountLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12" role="status">
      <span className="sr-only">Loading your account…</span>

      <div className="mb-8 flex flex-col gap-2">
        {/* Matches the `text-3xl` heading and the line of muted copy under it. */}
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            {/* The four `dt`/`dd` rows of the session list. */}
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="contents">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full max-w-64" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-44" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
