'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import dynamic from 'next/dynamic';
import { CheckCircle2Icon, FileTextIcon, MessageSquareIcon, RefreshCwIcon, StarIcon, ThumbsUpIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/profile/user';
import { readApiError } from '@/store/api/errors';
import { useGetResumesQuery, useLazyGetResumesQuery } from '@/store/api/resumeApi';
import type { FeedResume, ResumeFeedCardProps } from '@/types/resume';

// PDF.js uses browser APIs, so this module must never be server-rendered.
const ResumePdfPreview = dynamic(
  () => import('./resume-pdf-preview').then((module) => module.ResumePdfPreview),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full" />,
  },
);

function FeedCard({ resume }: ResumeFeedCardProps) {
  const authorName = resume.author.fullName ?? 'Community member';
  const label = resume.title ?? resume.originalFilename;
  const rating = resume.averageRating === null ? 'Not rated yet' : resume.averageRating.toFixed(1);

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="size-9">
          {resume.author.avatarUrl ? <AvatarImage src={resume.author.avatarUrl} alt="" /> : null}
          <AvatarFallback>{initials(resume.author.fullName, authorName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{authorName}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
        <time className="shrink-0 text-xs text-muted-foreground" dateTime={resume.createdAt}>
          {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
            new Date(resume.createdAt),
          )}
        </time>
      </div>

      {resume.caption ? (
        <p className="whitespace-pre-wrap px-4 pb-3 text-sm leading-6 text-foreground">{resume.caption}</p>
      ) : null}

      <div className="overflow-hidden border-y bg-muted/30">
        <ResumePdfPreview pdfUrl={resume.pdfUrl} label={label} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <StarIcon className="size-4" />
            {rating}
            {resume.ratingCount > 0 ? ` (${resume.ratingCount})` : ''}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquareIcon className="size-4" />
            {resume.commentCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ThumbsUpIcon className="size-4" />
            {resume.reactionCount}
          </span>
        </div>

        <Button
          render={<a href={resume.pdfUrl} target="_blank" rel="noreferrer" />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <FileTextIcon />
          Open PDF
        </Button>
      </div>
    </article>
  );
}

function FeedLoading() {
  return (
    <div className="flex flex-col gap-5">
      {[0, 1].map((item) => (
        <div key={item} className="overflow-hidden rounded-xl border p-4">
          <Skeleton className="mb-4 h-9 w-44" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="mt-4 h-5 w-52" />
        </div>
      ))}
    </div>
  );
}

export function ResumeFeed() {
  const { data, error, isLoading, refetch } = useGetResumesQuery();
  const [fetchNextPage, { error: nextPageError, isFetching: isFetchingNextPage }] = useLazyGetResumesQuery();
  const [resumes, setResumes] = useState<FeedResume[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // A fresh first page (including an RTK Query invalidation after upload) resets
  // the loaded pages. That avoids mixing a newly ordered first page with stale
  // older pages.
  useEffect(() => {
    if (!data) return;
    setResumes(data.items);
    setNextCursor(data.nextCursor);
  }, [data]);

  const loadNextPage = useCallback(async () => {
    if (!nextCursor || isFetchingNextPage) return;

    const page = await fetchNextPage(nextCursor).unwrap();
    setResumes((current) => {
      const knownIds = new Set(current.map((resume) => resume.id));
      return [...current, ...page.items.filter((resume) => !knownIds.has(resume.id))];
    });
    setNextCursor(page.nextCursor);
  }, [fetchNextPage, isFetchingNextPage, nextCursor]);

  const virtualizer = useWindowVirtualizer({
    count: resumes.length,
    estimateSize: () => 500,
    overscan: 2,
    scrollMargin,
  });

  // The virtualizer tracks window scroll, so it needs the feed's document
  // offset to place items correctly below the page heading.
  useEffect(() => {
    const updateScrollMargin = () => {
      const feed = feedRef.current;
      if (feed) setScrollMargin(feed.getBoundingClientRect().top + window.scrollY);
    };

    updateScrollMargin();
    window.addEventListener('resize', updateScrollMargin);
    return () => window.removeEventListener('resize', updateScrollMargin);
  }, [resumes.length]);

  // The sentinel is observed against the window, so reaching the bottom by
  // scrolling anywhere on the page loads the next cursor page.
  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    if (!trigger || !nextCursor || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNextPage();
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [isFetchingNextPage, loadNextPage, nextCursor, resumes.length]);

  if (isLoading) return <FeedLoading />;

  if (error) {
    const message = readApiError(error).message;
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/50 bg-destructive/5 px-6 py-14 text-center">
        <p className="font-medium text-destructive">Couldn’t load the feed</p>
        <p className="max-w-sm text-sm text-destructive" role="alert">
          {message}
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

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={feedRef} className="w-full" aria-label="Resume feed">
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualItems.map((virtualItem) => {
          const resume = resumes[virtualItem.index];
          return (
            <div
              key={resume.id}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full pb-5"
              style={{ transform: `translateY(${virtualItem.start - scrollMargin}px)` }}
            >
              <FeedCard resume={resume} />
            </div>
          );
        })}
      </div>

      {isFetchingNextPage ? (
        <div className="flex justify-center py-4 text-sm text-muted-foreground">Loading more resumesâ€¦</div>
      ) : null}
      {nextPageError ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-center text-sm text-destructive" role="alert">
            Couldn’t load more resumes: {readApiError(nextPageError).message}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadNextPage()}>
            <RefreshCwIcon />
            Retry loading more
          </Button>
        </div>
      ) : null}
      {!nextCursor && !nextPageError ? (
        <p className="flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
          <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          You&apos;re all caught up.
        </p>
      ) : null}
      {nextCursor ? <div ref={loadMoreTriggerRef} className="h-px" aria-hidden="true" /> : null}
    </div>
  );
}
