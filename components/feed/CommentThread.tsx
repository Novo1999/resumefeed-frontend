'use client';

import { Fragment, useMemo, useState } from 'react';
import { ChevronDownIcon, CornerDownRightIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { replyLabel } from '@/lib/resume/comment';
import { readApiError } from '@/store/api/errors';
import { useCreateReplyMutation, useGetCommentRepliesInfiniteQuery } from '@/store/api/commentApi';
import type { Comment, CommentThread as Thread } from '@/types/comment';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';

type CommentThreadProps = {
  thread: Thread;
  focusCommentId?: string;
};

type ReplyBoxProps = {
  replyingTo: Comment;
  onSubmit: (body: string) => Promise<boolean>;
  onCancel: () => void;
};

/** Rendered directly beneath whichever comment is being answered. */
function ReplyBox({ replyingTo, onSubmit, onCancel }: ReplyBoxProps) {
  return (
    <div className="flex flex-col gap-1.5 py-1.5">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CornerDownRightIcon className="size-3.5 shrink-0" />
        Replying to {replyingTo.author?.fullName ?? 'Community member'}
        {replyingTo.author?.role ? ` (${replyingTo.author.role})` : ''}
      </p>
      <CommentComposer
        onSubmit={onSubmit}
        placeholder="Write a reply"
        submitLabel="Reply"
        autoFocus
        onCancel={onCancel}
      />
    </div>
  );
}

/**
 * A root comment and its replies. The first couple of replies arrive with the
 * thread itself; opening it swaps them for the paginated list from the replies
 * endpoint, so a long thread is never loaded until someone asks for it.
 */
export function CommentThread({ thread, focusCommentId }: CommentThreadProps) {
  const containsFocus =
    focusCommentId === thread.id || thread.replies.some((reply) => reply.id === focusCommentId);
  const [expanded, setExpanded] = useState(containsFocus);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [createReply] = useCreateReplyMutation();

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetCommentRepliesInfiniteQuery(thread.id, { skip: !expanded || containsFocus });

  const loadedReplies = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  // Until the full list arrives, the preview that came with the thread is what
  // there is to show — swapping to an empty array would blank the thread.
  const replies = containsFocus
    ? thread.replies
    : expanded && loadedReplies.length > 0
      ? loadedReplies
      : thread.replies;
  const hiddenReplies = thread.replyCount - replies.length;
  // The replies rail also hosts the reply box, so it has to exist for the very
  // first reply on a thread that has none yet.
  const showRail = replies.length > 0 || thread.replyCount > 0 || replyingTo !== null;

  async function submitReply(body: string) {
    const target = replyingTo ?? thread;
    try {
      await createReply({
        commentId: target.id,
        resumeId: thread.resumeId,
        rootId: thread.id,
        body,
      }).unwrap();
      setReplyingTo(null);
      setExpanded(true);
      return true;
    } catch (error) {
      toast.error(`Could not post your reply: ${readApiError(error).message}`);
      return false;
    }
  }

  const replyBoxFor = (comment: Comment) =>
    replyingTo?.id === comment.id ? (
      <ReplyBox replyingTo={comment} onSubmit={submitReply} onCancel={() => setReplyingTo(null)} />
    ) : null;

  return (
    <div className="flex flex-col">
      <CommentItem
        comment={thread}
        rootId={null}
        onReply={setReplyingTo}
        focused={focusCommentId === thread.id}
      />

      {showRail ? (
        <div className="ms-3.5 flex flex-col border-s ps-3.5">
          {replyBoxFor(thread)}

          {replies.map((reply) => (
            <Fragment key={reply.id}>
              <CommentItem
                comment={reply}
                rootId={thread.id}
                onReply={setReplyingTo}
                focused={focusCommentId === reply.id}
              />
              {replyBoxFor(reply)}
            </Fragment>
          ))}

          {hiddenReplies > 0 && !isFetching ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="self-start text-muted-foreground"
              onClick={() => (expanded ? void fetchNextPage() : setExpanded(true))}
            >
              <ChevronDownIcon />
              Show {replyLabel(hiddenReplies)}
            </Button>
          ) : null}

          {isFetching || isFetchingNextPage ? (
            <p className="py-1 text-xs text-muted-foreground">Loading replies...</p>
          ) : null}

          {expanded && hasNextPage && !isFetchingNextPage && hiddenReplies <= 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="self-start text-muted-foreground"
              onClick={() => void fetchNextPage()}
            >
              <ChevronDownIcon />
              Show more replies
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
