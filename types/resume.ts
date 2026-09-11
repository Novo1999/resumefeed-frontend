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
};

export type ResumeUploadDialogProps = {
  ownerId: string;
};

export type ResumeFeedCardProps = {
  resume: FeedResume;
};
