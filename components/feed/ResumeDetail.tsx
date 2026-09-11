'use client';

import { useState } from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ResumeFeedCard } from '@/components/feed/ResumeFeedCard';
import { readApiError } from '@/store/api/errors';
import {
  useGetResumeQuery,
  useRateResumeMutation,
  useReactToResumeMutation,
} from '@/store/api/resumeApi';
import type { ReactionKind } from '@/types/resume';

export function ResumeDetail({
  resumeId,
  focusCommentId,
}: {
  resumeId: string;
  focusCommentId?: string;
}) {
  const { data: resume, error, isLoading, refetch } = useGetResumeQuery(resumeId);
  const [rateResume] = useRateResumeMutation();
  const [reactToResume] = useReactToResumeMutation();
  const [rating, setRating] = useState(false);
  const [reacting, setReacting] = useState(false);

  async function rate(id: string, score: number) {
    if (rating) return;
    setRating(true);
    try {
      await rateResume({ resumeId: id, score }).unwrap();
      void refetch();
    } catch (rateError) {
      toast.error(`Could not save your rating: ${readApiError(rateError).message}`);
    } finally {
      setRating(false);
    }
  }

  async function react(id: string, kind: ReactionKind | null) {
    if (reacting) return;
    setReacting(true);
    try {
      await reactToResume({ resumeId: id, kind }).unwrap();
      void refetch();
    } catch (reactionError) {
      toast.error(`Could not save your reaction: ${readApiError(reactionError).message}`);
    } finally {
      setReacting(false);
    }
  }

  if (isLoading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />;
  if (error || !resume) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm text-destructive">
          {error ? readApiError(error).message : 'This resume is no longer available.'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCwIcon />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <ResumeFeedCard
      resume={resume}
      isRating={rating}
      onRate={rate}
      isReacting={reacting}
      onReact={react}
      showAllCommentsInitially
      focusCommentId={focusCommentId}
      linkToDetail={false}
    />
  );
}
