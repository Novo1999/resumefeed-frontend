import { baseApi } from './baseApi';
import { resumeApi } from './resumeApi';
import type {
  Comment,
  CommentReactionResponse,
  CommentThread,
  CommentRepliesResponse,
  CommentThreadsResponse,
  WriteCommentRequest,
} from '@/types/comment';
import type { AppDispatch } from '@/store/store';
import type { ReactionKind } from '@/types/resume';
import { optimisticReaction } from '@/lib/resume/reaction';

/**
 * The feed card's comment number comes from the resume list, not from the
 * comment endpoints, so writing a comment has to move it by hand. Refetching the
 * whole feed instead would remint every signed PDF URL on the page.
 */
function patchFeedCommentCount(dispatch: AppDispatch, resumeId: string, delta: number) {
  dispatch(
    resumeApi.util.updateQueryData('getResumes', undefined, (draft) => {
      for (const page of draft.pages) {
        const index = page.items.findIndex((resume) => resume.id === resumeId);
        if (index >= 0) {
          const resume = page.items[index];
          page.items[index] = {
            ...resume,
            commentCount: Math.max(0, resume.commentCount + delta),
          };
        }
      }
    }),
  );
}

/** A comment shows up twice: as a thread root, and inside another root's preview. */
function patchComment(
  items: CommentThread[],
  commentId: string,
  update: (comment: Comment) => Comment,
) {
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].id === commentId) {
      items[i] = { ...items[i], ...update(items[i]) };
      continue;
    }
    const replyIndex = items[i].replies.findIndex((reply) => reply.id === commentId);
    if (replyIndex >= 0) {
      const replies = [...items[i].replies];
      replies[replyIndex] = update(replies[replyIndex]);
      items[i] = { ...items[i], replies };
    }
  }
}

export const commentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCommentThreads: build.infiniteQuery<CommentThreadsResponse, string, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: resumeId, pageParam }) => ({
        url: `/resumes/${resumeId}/comments`,
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
      providesTags: (_result, _error, resumeId) => [{ type: 'Comments' as const, id: resumeId }],
    }),

    getCommentReplies: build.infiniteQuery<CommentRepliesResponse, string, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: commentId, pageParam }) => ({
        url: `/comments/${commentId}/replies`,
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
      providesTags: (_result, _error, commentId) => [{ type: 'Replies' as const, id: commentId }],
    }),

    createComment: build.mutation<Comment, { resumeId: string } & WriteCommentRequest>({
      query: ({ resumeId, body }) => ({
        url: `/resumes/${resumeId}/comments`,
        method: 'POST',
        body: { body },
      }),
      invalidatesTags: (_result, _error, { resumeId }) => [
        { type: 'Comments' as const, id: resumeId },
      ],
      async onQueryStarted({ resumeId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          patchFeedCommentCount(dispatch, resumeId, 1);
        } catch {
          // The thread list refetches from the invalidated tag; nothing to undo.
        }
      },
    }),

    createReply: build.mutation<
      Comment,
      { commentId: string; resumeId: string; rootId: string } & WriteCommentRequest
    >({
      query: ({ commentId, body }) => ({
        url: `/comments/${commentId}/replies`,
        method: 'POST',
        body: { body },
      }),
      // Both lists move: the thread's inline preview and reply count, and the
      // expanded reply list if the viewer has opened it.
      invalidatesTags: (_result, _error, { resumeId, rootId }) => [
        { type: 'Comments' as const, id: resumeId },
        { type: 'Replies' as const, id: rootId },
      ],
      async onQueryStarted({ resumeId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          patchFeedCommentCount(dispatch, resumeId, 1);
        } catch {
          // Nothing optimistic was applied.
        }
      },
    }),

    updateComment: build.mutation<
      Comment,
      { commentId: string; resumeId: string; rootId: string | null } & WriteCommentRequest
    >({
      query: ({ commentId, body }) => ({
        url: `/comments/${commentId}`,
        method: 'PATCH',
        body: { body },
      }),
      invalidatesTags: (_result, _error, { resumeId, rootId }) =>
        rootId
          ? [
              { type: 'Comments' as const, id: resumeId },
              { type: 'Replies' as const, id: rootId },
            ]
          : [{ type: 'Comments' as const, id: resumeId }],
    }),

    deleteComment: build.mutation<
      void,
      { commentId: string; resumeId: string; rootId: string | null }
    >({
      query: ({ commentId }) => ({ url: `/comments/${commentId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { resumeId, rootId }) =>
        rootId
          ? [
              { type: 'Comments' as const, id: resumeId },
              { type: 'Replies' as const, id: rootId },
            ]
          : [{ type: 'Comments' as const, id: resumeId }],
      async onQueryStarted({ resumeId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // A tombstone stops counting too, so either kind of delete is -1.
          patchFeedCommentCount(dispatch, resumeId, -1);
        } catch {
          // Nothing optimistic was applied.
        }
      },
    }),

    reactToComment: build.mutation<
      CommentReactionResponse,
      { commentId: string; resumeId: string; rootId: string | null; kind: ReactionKind | null }
    >({
      query: ({ commentId, kind }) => ({
        url: `/comments/${commentId}/reaction`,
        method: 'PUT',
        body: { kind },
      }),
      // Reacting is a tap, so it must feel instant and must not refetch the
      // thread underneath the person who tapped.
      async onQueryStarted({ commentId, resumeId, rootId, kind }, { dispatch, queryFulfilled }) {
        const patches = [
          dispatch(
            commentApi.util.updateQueryData('getCommentThreads', resumeId, (draft) => {
              for (const page of draft.pages) {
                patchComment(page.items, commentId, (comment) => optimisticReaction(comment, kind));
              }
            }),
          ),
        ];

        if (rootId) {
          patches.push(
            dispatch(
              commentApi.util.updateQueryData('getCommentReplies', rootId, (draft) => {
                for (const page of draft.pages) {
                  const index = page.items.findIndex((reply) => reply.id === commentId);
                  if (index >= 0) page.items[index] = optimisticReaction(page.items[index], kind);
                }
              }),
            ),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          for (const patch of patches) patch.undo();
        }
      },
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useCreateReplyMutation,
  useDeleteCommentMutation,
  useGetCommentRepliesInfiniteQuery,
  useGetCommentThreadsInfiniteQuery,
  useReactToCommentMutation,
  useUpdateCommentMutation,
} = commentApi;
