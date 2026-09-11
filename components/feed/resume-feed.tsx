'use client';

import dynamic from 'next/dynamic';
import { FileTextIcon, MessageSquareIcon, RefreshCwIcon, StarIcon, ThumbsUpIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/profile/user';
import { useGetResumesQuery } from '@/store/api/resumeApi';
import type { ResumeFeedCardProps } from '@/types/resume';

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

  if (isLoading) return <FeedLoading />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
        <p className="font-medium">Couldn’t load the feed</p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          <RefreshCwIcon />
          Try again
        </Button>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
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

  return <div className="flex flex-col gap-5">{data.items.map((resume) => <FeedCard key={resume.id} resume={resume} />)}</div>;
}
