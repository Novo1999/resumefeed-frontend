import type { ReactionCounts, ReactionKind, ResumeAuthor } from './resume';

export const COMMENT_BODY_MAX_LENGTH = 2000;

/**
 * Mirrors `resumefeed-backend/src/types/comment.ts`. There is no generated
 * client yet, so the two can drift silently — change them together.
 */
export type Comment = {
  id: string;
  resumeId: string;
  /** Null on a root comment; the root's ID on a reply. */
  parentId: string | null;
  /** Null on a deleted comment, which keeps its replies but gives up its identity. */
  author: ResumeAuthor | null;
  /** Present when this reply answers another reply: renders "replying to @Sam". */
  replyToAuthor: ResumeAuthor | null;
  body: string | null;
  deleted: boolean;
  replyCount: number;
  editedAt: string | null;
  createdAt: string;
  reactionCount: number;
  reactionCounts: ReactionCounts;
  /** The signed-in viewer's reaction on this comment, if they left one. */
  viewerReaction: ReactionKind | null;
  viewerCanEdit: boolean;
  viewerCanDelete: boolean;
};

/** A root comment carrying the oldest few of its replies. */
export type CommentThread = Comment & {
  replies: Comment[];
};

export type CommentThreadsResponse = {
  items: CommentThread[];
  nextCursor: string | null;
};

export type CommentRepliesResponse = {
  items: Comment[];
  nextCursor: string | null;
};

export type WriteCommentRequest = {
  body: string;
};

export type CommentReactionResponse = {
  commentId: string;
  viewerReaction: ReactionKind | null;
  reactionCount: number;
  reactionCounts: ReactionCounts;
};
