'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { RefreshCwIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/profile/user';
import { REACTION_META } from '@/lib/resume/reaction';
import { readApiError } from '@/store/api/errors';
import { useGetResumeReactorsInfiniteQuery } from '@/store/api/resumeApi';
import type { ReactionCounts } from '@/types/resume';
import { ReactionSummary } from './ReactionSummary';

const ROW_HEIGHT = 56;
/** Start the next page while this many rows are still below the fold. */
const PREFETCH_ROWS = 5;

type ReactionsDialogProps = {
  resumeId: string;
  counts: ReactionCounts;
  total: number;
};

export function ReactionsDialog({ resumeId, counts, total }: ReactionsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        title="See who reacted"
        className="inline-flex cursor-pointer items-center rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ReactionSummary counts={counts} total={total} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reactions</DialogTitle>
          <DialogDescription>
            {total} {total === 1 ? 'person has' : 'people have'} reacted to this resume.
          </DialogDescription>
        </DialogHeader>
        <ReactorList resumeId={resumeId} />
      </DialogContent>
    </Dialog>
  );
}

function ReactorList({ resumeId }: { resumeId: string }) {
  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetResumeReactorsInfiniteQuery(resumeId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reactors = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const virtualizer = useVirtualizer({
    count: reactors.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualRows = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastRow = virtualRows[virtualRows.length - 1];
    if (!lastRow || !hasNextPage || isFetchingNextPage) return;
    if (lastRow.index >= reactors.length - PREFETCH_ROWS) void fetchNextPage();
  }, [virtualRows, reactors.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex h-80 flex-col gap-3 py-1">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-destructive" role="alert">
          {readApiError(error).message}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCwIcon />
          Try again
        </Button>
      </div>
    );
  }

  if (reactors.length === 0) {
    return (
      <p className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        No reactions yet.
      </p>
    );
  }

  return (
    <div ref={scrollRef} className="h-80 overflow-y-auto overscroll-contain">
      <ul className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualRows.map((row) => {
          const reactor = reactors[row.index];
          const name = reactor.user.fullName ?? 'Community member';
          const meta = REACTION_META[reactor.kind];

          return (
            <li
              key={reactor.id}
              className="absolute top-0 left-0 flex w-full items-center gap-3 pr-1"
              style={{ height: `${row.size}px`, transform: `translateY(${row.start}px)` }}
            >
              <div className="relative shrink-0">
                <Avatar className="size-9">
                  {reactor.user.avatarUrl ? (
                    <AvatarImage src={reactor.user.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback>{initials(reactor.user.fullName, name)}</AvatarFallback>
                </Avatar>
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-background text-[11px] leading-none ring-1 ring-border"
                >
                  {meta.emoji}
                </span>
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
              <span className="shrink-0 text-sm text-muted-foreground">{meta.label}</span>
            </li>
          );
        })}
      </ul>
      {isFetchingNextPage ? (
        <p className="py-3 text-center text-sm text-muted-foreground">Loading more...</p>
      ) : null}
    </div>
  );
}
