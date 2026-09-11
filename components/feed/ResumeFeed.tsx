'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { CheckCircle2Icon, FileTextIcon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { readApiError } from '@/store/api/errors';
import {
  useGetResumesInfiniteQuery,
  useRateResumeMutation,
  useReactToResumeMutation,
} from '@/store/api/resumeApi';
import type { ReactionKind } from '@/types/resume';
import { ResumeFeedCard } from './ResumeFeedCard';
import { ResumeFeedLoading } from './ResumeFeedLoading';

export function ResumeFeed() {
  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetResumesInfiniteQuery();
  const [rateResume] = useRateResumeMutation();
  const [reactToResume] = useReactToResumeMutation();
  const [ratingResumeIds, setRatingResumeIds] = useState<Set<string>>(new Set());
  const [reactingResumeIds, setReactingResumeIds] = useState<Set<string>>(new Set());
  const [nextPageError, setNextPageError] = useState<string>();
  const feedRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const resumes = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    setNextPageError(undefined);
    try {
      await fetchNextPage().unwrap();
    } catch (loadError) {
      setNextPageError(readApiError(loadError).message);
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const rate = useCallback(
    async (resumeId: string, score: number) => {
      if (ratingResumeIds.has(resumeId)) return;

      setRatingResumeIds((current) => new Set(current).add(resumeId));

      try {
        await rateResume({ resumeId, score }).unwrap();
      } catch (ratingError) {
        toast.error(`Could not save your rating: ${readApiError(ratingError).message}`);
      } finally {
        setRatingResumeIds((current) => {
          const next = new Set(current);
          next.delete(resumeId);
          return next;
        });
      }
    },
    [rateResume, ratingResumeIds],
  );

  const react = useCallback(
    async (resumeId: string, kind: ReactionKind | null) => {
      if (reactingResumeIds.has(resumeId)) return;

      setReactingResumeIds((current) => new Set(current).add(resumeId));

      try {
        await reactToResume({ resumeId, kind }).unwrap();
      } catch (reactionError) {
        toast.error(`Could not save your reaction: ${readApiError(reactionError).message}`);
      } finally {
        setReactingResumeIds((current) => {
          const next = new Set(current);
          next.delete(resumeId);
          return next;
        });
      }
    },
    [reactToResume, reactingResumeIds],
  );

  const virtualizer = useWindowVirtualizer({
    count: resumes.length,
    estimateSize: () => 500,
    overscan: 2,
    scrollMargin,
    useFlushSync: false,
  });

  useEffect(() => {
    const updateScrollMargin = () => {
      const feed = feedRef.current;
      if (feed) setScrollMargin(feed.getBoundingClientRect().top + window.scrollY);
    };

    updateScrollMargin();
    window.addEventListener('resize', updateScrollMargin);
    return () => window.removeEventListener('resize', updateScrollMargin);
  }, [resumes.length]);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    if (!trigger || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNextPage();
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, loadNextPage, resumes.length]);

  if (isLoading) return <ResumeFeedLoading />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/50 bg-destructive/5 px-6 py-14 text-center">
        <p className="font-medium text-destructive">Couldn't load the feed</p>
        <p className="max-w-sm text-sm text-destructive" role="alert">
          {readApiError(error).message}
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          <RefreshCwIcon />
          Try again
        </Button>
      </div>
    );
  }

  if (!data || resumes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <FileTextIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium">Nothing here yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Post the first resume and invite the community to review it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={feedRef} className="w-full" aria-label="Resume feed">
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const resume = resumes[virtualItem.index];
          return (
            <div
              key={resume.id}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full pb-5"
              style={{ transform: `translateY(${virtualItem.start - scrollMargin}px)` }}
            >
              <ResumeFeedCard
                resume={resume}
                isRating={ratingResumeIds.has(resume.id)}
                onRate={rate}
                isReacting={reactingResumeIds.has(resume.id)}
                onReact={react}
              />
            </div>
          );
        })}
      </div>

      {isFetchingNextPage ? (
        <div className="flex justify-center py-4 text-sm text-muted-foreground">
          Loading more resumes...
        </div>
      ) : null}
      {nextPageError ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-center text-sm text-destructive" role="alert">
            Couldn't load more resumes: {nextPageError}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadNextPage()}>
            <RefreshCwIcon />
            Retry loading more
          </Button>
        </div>
      ) : null}
      {!hasNextPage && !nextPageError ? (
        <p className="flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
          <CheckCircle2Icon
            className="size-4 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          You're all caught up.
        </p>
      ) : null}
      {hasNextPage ? <div ref={loadMoreTriggerRef} className="h-px" aria-hidden="true" /> : null}
    </div>
  );
}
