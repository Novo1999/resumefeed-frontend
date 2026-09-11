export type CreateResumeRequest = {
  storagePath: string;
  originalFilename: string;
  title?: string | null;
};

/** Mirrors the creation response from `resumefeed-backend/src/types/resume.ts`. */
export type ResumeResponse = {
  id: string;
  ownerId: string;
  storagePath: string;
  originalFilename: string;
  title: string | null;
  ratingCount: number;
  averageRating: number | null;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
};
