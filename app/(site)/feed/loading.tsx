import { ResumeFeedLoading } from '@/components/feed/ResumeFeedLoading';
import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors `app/feed/page.tsx` geometry so the real feed swaps in without a jump. */
export default function FeedLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12" role="status">
      <span className="sr-only">Loading the feed…</span>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <ResumeFeedLoading />
    </div>
  );
}
