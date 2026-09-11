'use client';

import { useState } from 'react';
import { MoreHorizontalIcon, PencilIcon, ReplyIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initials } from '@/lib/profile/user';
import { formatCommentTime } from '@/lib/resume/comment';
import { readApiError } from '@/store/api/errors';
import {
  useDeleteCommentMutation,
  useReactToCommentMutation,
  useUpdateCommentMutation,
} from '@/store/api/commentApi';
import type { Comment } from '@/types/comment';
import type { ReactionKind } from '@/types/resume';
import { CommentComposer } from './CommentComposer';
import { ReactionPicker } from './ReactionPicker';
import { ReactionSummary } from './ReactionSummary';

type CommentItemProps = {
  comment: Comment;
  /** The thread this comment belongs to; null when it is itself the root. */
  rootId: string | null;
  onReply: (comment: Comment) => void;
};

export function CommentItem({ comment, rootId, onReply }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const [reactToComment, { isLoading: isReacting }] = useReactToCommentMutation();

  if (comment.deleted) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <div className="size-7 shrink-0 rounded-full border border-dashed border-border" />
        <p className="text-sm text-muted-foreground italic">This comment was deleted.</p>
      </div>
    );
  }

  const name = comment.author?.fullName ?? 'Community member';

  async function saveEdit(body: string) {
    try {
      await updateComment({
        commentId: comment.id,
        resumeId: comment.resumeId,
        rootId,
        body,
      }).unwrap();
      setEditing(false);
      return true;
    } catch (error) {
      toast.error(`Could not save your edit: ${readApiError(error).message}`);
      return false;
    }
  }

  async function react(kind: ReactionKind | null) {
    try {
      await reactToComment({
        commentId: comment.id,
        resumeId: comment.resumeId,
        rootId,
        kind,
      }).unwrap();
    } catch (error) {
      toast.error(`Could not save your reaction: ${readApiError(error).message}`);
    }
  }

  async function remove() {
    try {
      await deleteComment({ commentId: comment.id, resumeId: comment.resumeId, rootId }).unwrap();
    } catch (error) {
      toast.error(`Could not delete that comment: ${readApiError(error).message}`);
    }
  }

  return (
    <div className="flex gap-2.5 py-1.5">
      <Avatar className="size-7 shrink-0">
        {comment.author?.avatarUrl ? <AvatarImage src={comment.author.avatarUrl} alt="" /> : null}
        <AvatarFallback className="text-[11px]">
          {initials(comment.author?.fullName, name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium">{name}</span>
          <time className="shrink-0 text-xs text-muted-foreground" dateTime={comment.createdAt}>
            {formatCommentTime(comment.createdAt)}
          </time>
          {comment.editedAt ? (
            <span
              className="shrink-0 text-xs text-muted-foreground"
              title="This comment was edited"
            >
              edited
            </span>
          ) : null}
        </div>

        {editing ? (
          <div className="pt-1.5">
            <CommentComposer
              onSubmit={saveEdit}
              placeholder="Edit your comment"
              submitLabel="Save"
              initialValue={comment.body ?? ''}
              autoFocus
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-6 break-words">
            {comment.replyToAuthor ? (
              <span className="pe-1 font-medium text-primary">
                @{comment.replyToAuthor.fullName ?? 'Community member'}
              </span>
            ) : null}
            {comment.body}
          </p>
        )}

        {editing ? null : (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <ReactionPicker value={comment.viewerReaction} pending={isReacting} onReact={react} />
            {comment.reactionCount > 0 ? (
              <span className="px-1 text-xs text-muted-foreground">
                <ReactionSummary counts={comment.reactionCounts} total={comment.reactionCount} />
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => onReply(comment)}
            >
              <ReplyIcon />
              Reply
            </Button>

            {comment.viewerCanEdit || comment.viewerCanDelete ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground"
                      aria-label="Comment actions"
                    >
                      <MoreHorizontalIcon />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start">
                  {comment.viewerCanEdit ? (
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                  ) : null}
                  {comment.viewerCanDelete ? (
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={isDeleting}
                      onClick={() => void remove()}
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
