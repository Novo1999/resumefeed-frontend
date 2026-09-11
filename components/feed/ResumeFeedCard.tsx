'use client';

import dynamic from 'next/dynamic';
import { FileTextIcon, MessageSquareIcon, StarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/profile/user';
import type { ReactionKind } from '@/types/resume';
import type { ResumeFeedCardProps } from '@/types/resume';
import { ReactionPicker } from './ReactionPicker';
import { ReactionsDialog } from './ReactionsDialog';
import { CommentsSection } from './CommentsSection';
import { StarRating } from './StarRating';

const ResumePdfPreview = dynamic(
  () => import('./ResumePdfPreview').then((module) => module.ResumePdfPreview),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> },
);

type ResumeFeedCardPropsWithActions = ResumeFeedCardProps & {
  isRating: boolean;
  onRate: (resumeId: string, score: number) => void;
  isReacting: boolean;
  onReact: (resumeId: string, kind: ReactionKind | null) => void;
};

export function ResumeFeedCard({
  resume,
  isRating,
  onRate,
  isReacting,
  onReact,
}: ResumeFeedCardPropsWithActions) {
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

      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span
            className="inline-flex items-center gap-1.5"
            aria-label={`Average rating: ${rating}`}
          >
            <StarIcon className="size-4 shrink-0" />
            {rating}
            {resume.ratingCount > 0 ? ` (${resume.ratingCount})` : ''}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquareIcon className="size-4 shrink-0" />
            {resume.commentCount}
          </span>
          {resume.reactionCount > 0 ? (
            <ReactionsDialog
              resumeId={resume.id}
              counts={resume.reactionCounts}
              total={resume.reactionCount}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-2 sm:flex-1 sm:border-t-0 sm:pt-0">
          <ReactionPicker
            value={resume.viewerReaction}
            pending={isReacting}
            onReact={(kind) => onReact(resume.id, kind)}
          />
          <StarRating
            value={resume.viewerRating}
            pending={isRating}
            onRate={(score) => onRate(resume.id, score)}
          />
          <Button
            render={<a href={resume.pdfUrl} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="ms-auto"
          >
            <FileTextIcon />
            Open PDF
          </Button>
        </div>
      </div>

      <CommentsSection resumeId={resume.id} commentCount={resume.commentCount} />
    </article>
  );
}
