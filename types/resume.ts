export const REACTION_KINDS = ['like', 'heart', 'fire', 'wow', 'haha'] as const;

export type ReactionKind = (typeof REACTION_KINDS)[number];

export type ReactionCounts = Record<ReactionKind, number>;

export type ReactToResumeRequest = {
  kind: ReactionKind | null;
};

export type ResumeReactionResponse = {
  resumeId: string;
  viewerReaction: ReactionKind | null;
  reactionCount: number;
  reactionCounts: ReactionCounts;
};

/** A single person's reaction, for the "who reacted" list. */
export type ResumeReactor = {
  id: string;
  kind: ReactionKind;
  createdAt: string;
  user: ResumeAuthor;
};

export type ResumeReactorsResponse = {
  items: ResumeReactor[];
  nextCursor: string | null;
};

export type CreateResumeRequest = {
  storagePath: string;
  originalFilename: string;
  title?: string | null;
  caption?: string | null;
};

/** Mirrors the creation response from `resumefeed-backend/src/types/resume.ts`. */
export type ResumeResponse = {
  id: string;
  ownerId: string;
  storagePath: string;
  originalFilename: string;
  title: string | null;
  caption: string | null;
  ratingCount: number;
  averageRating: number | null;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
};

export type RateResumeRequest = {
  score: number;
};

export type ResumeRatingResponse = {
  resumeId: string;
  viewerRating: number;
  ratingCount: number;
  averageRating: number | null;
};

export type ResumeAuthor = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string | null;
};

/** A feed card response. `pdfUrl` is an API-issued, short-lived signed URL. */
export type FeedResume = {
  id: string;
  title: string | null;
  caption: string | null;
  originalFilename: string;
  author: ResumeAuthor;
  pdfUrl: string;
  ratingCount: number;
  averageRating: number | null;
  viewerRating: number | null;
  commentCount: number;
  reactionCount: number;
  reactionCounts: ReactionCounts;
  viewerReaction: ReactionKind | null;
  createdAt: string;
};

export type ResumeFeedResponse = {
  items: FeedResume[];
  /** Opaque cursor for the next oldest page, or null when there are no more posts. */
  nextCursor: string | null;
};

export type ResumePdfPreviewProps = {
  pdfUrl: string;
  label: string;
  detailHref?: string;
};

export type ResumeUploadDialogProps = {
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string;
  ownerAvatarUrl: string | null;
};

export type ResumeFeedCardProps = {
  resume: FeedResume;
};
