'use client';

import { useMemo, useState } from 'react';
import { ChevronUpIcon, MessageSquareIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { readApiError } from '@/store/api/errors';
import {
  useCreateCommentMutation,
  useGetCommentThreadsInfiniteQuery,
} from '@/store/api/commentApi';
import { CommentComposer } from './CommentComposer';
import { CommentThread } from './CommentThread';

/** Threads shown before anyone asks for the rest. Roots arrive newest first. */
const PREVIEW_THREADS = 2;

type CommentsSectionProps = {
  resumeId: string;
  /** The card's own total, which counts replies and excludes deleted comments. */
  commentCount: number;
};

/**
 * Always mounted on a card, not hidden behind a toggle — but the feed is
 * virtualized, so only the few cards near the viewport ever mount one and ask
 * for comments.
 */
export function CommentsSection({ resumeId, commentCount }: CommentsSectionProps) {
  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetCommentThreadsInfiniteQuery(resumeId);
  const [createComment] = useCreateCommentMutation();
  const [showAll, setShowAll] = useState(false);

  const threads = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const visible = showAll ? threads : threads.slice(0, PREVIEW_THREADS);
  const collapsed = !showAll && (threads.length > PREVIEW_THREADS || hasNextPage);

  async function submitComment(body: string) {
    try {
      await createComment({ resumeId, body }).unwrap();
      return true;
    } catch (submitError) {
      toast.error(`Could not post your comment: ${readApiError(submitError).message}`);
      return false;
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t px-4 py-3" aria-label="Comments">
      <CommentComposer
        onSubmit={submitComment}
        placeholder="Share what would make this resume stronger"
        submitLabel="Comment"
      />

      {isLoading ? (
        <div className="flex flex-col gap-3 py-1">
          {Array.from({ length: PREVIEW_THREADS }, (_, index) => (
            <div key={index} className="flex gap-2.5">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm text-destructive" role="alert">
            {readApiError(error).message}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && threads.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to give feedback.
        </p>
      ) : null}

      {collapsed ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start px-2 text-muted-foreground"
          onClick={() => setShowAll(true)}
        >
          <MessageSquareIcon />
          View all {commentCount} comments
        </Button>
      ) : null}

      {visible.length > 0 ? (
        <div className="flex flex-col divide-y">
          {visible.map((thread) => (
            <div key={thread.id} className="py-1.5 first:pt-0 last:pb-0">
              <CommentThread thread={thread} />
            </div>
          ))}
        </div>
      ) : null}

      {showAll && hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more comments'}
        </Button>
      ) : null}

      {showAll && threads.length > PREVIEW_THREADS ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start px-2 text-muted-foreground"
          onClick={() => setShowAll(false)}
        >
          <ChevronUpIcon />
          Show fewer
        </Button>
      ) : null}
    </section>
  );
}
