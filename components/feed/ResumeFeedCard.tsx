'use client';

import dynamic from 'next/dynamic';
import { FileTextIcon, MessageSquareIcon, StarIcon, ThumbsUpIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/profile/user';
import type { ResumeFeedCardProps } from '@/types/resume';
import { StarRating } from './StarRating';

const ResumePdfPreview = dynamic(
  () => import('./ResumePdfPreview').then((module) => module.ResumePdfPreview),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> },
);

type ResumeFeedCardPropsWithRating = ResumeFeedCardProps & {
  isRating: boolean;
  onRate: (resumeId: string, score: number) => void;
};

export function ResumeFeedCard({ resume, isRating, onRate }: ResumeFeedCardPropsWithRating) {
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
        <p className="whitespace-pre-wrap px-4 pb-3 text-sm leading-6 text-foreground">
          {resume.caption}
        </p>
      ) : null}

      <div className="overflow-hidden border-y bg-muted/30">
        <ResumePdfPreview pdfUrl={resume.pdfUrl} label={label} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <StarRating
            value={resume.viewerRating}
            pending={isRating}
            onRate={(score) => onRate(resume.id, score)}
          />
          <span
            className="inline-flex items-center gap-1.5"
            aria-label={`Average rating: ${rating}`}
          >
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
