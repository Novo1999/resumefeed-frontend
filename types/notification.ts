import type { ReactionKind, ResumeAuthor } from './resume';

export type NotificationKind =
  | 'resume_comment'
  | 'comment_reply'
  | 'resume_reaction'
  | 'comment_reaction'
  | 'resume_rating';

export type Notification = {
  id: string;
  kind: NotificationKind;
  resumeId: string;
  commentId: string | null;
  commentBody: string | null;
  reactionKind: ReactionKind | null;
  ratingScore: number | null;
  readAt: string | null;
  removedAt: string | null;
  createdAt: string;
  available: boolean;
  actor: ResumeAuthor;
};

export type NotificationListResponse = {
  items: Notification[];
  nextCursor: string | null;
  unreadCount: number;
};
