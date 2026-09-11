import { baseApi } from './baseApi';
import type {
  CreateResumeRequest,
  FeedResume,
  RateResumeRequest,
  ReactionKind,
  ResumeFeedResponse,
  ResumeRatingResponse,
  ResumeReactionResponse,
  ResumeReactorsResponse,
  ResumeResponse,
} from '@/types/resume';
import { optimisticRating } from '@/lib/resume/rating';
import { optimisticReaction } from '@/lib/resume/reaction';

function patchResume(
  draft: { pages: ResumeFeedResponse[] },
  resumeId: string,
  update: (resume: FeedResume) => FeedResume,
) {
  for (const page of draft.pages) {
    const index = page.items.findIndex((resume) => resume.id === resumeId);
    if (index >= 0) page.items[index] = update(page.items[index]);
  }
}

export const resumeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getResumes: build.infiniteQuery<ResumeFeedResponse, void, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ pageParam }) => ({
        url: '/resumes',
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
      providesTags: ['Resumes'],
    }),
    createResume: build.mutation<ResumeResponse, CreateResumeRequest>({
      query: (body) => ({ url: '/resumes', method: 'POST', body }),
      invalidatesTags: ['Resumes'],
    }),
    rateResume: build.mutation<
      ResumeRatingResponse,
      { resumeId: string; score: RateResumeRequest['score'] }
    >({
      query: ({ resumeId, score }) => ({
        url: `/resumes/${resumeId}/rating`,
        method: 'PUT',
        body: { score },
      }),
      async onQueryStarted({ resumeId, score }, { dispatch, queryFulfilled }) {
        const optimisticPatch = dispatch(
          resumeApi.util.updateQueryData('getResumes', undefined, (draft) => {
            patchResume(draft, resumeId, (resume) => optimisticRating(resume, score));
          }),
        );

        try {
          const { data: confirmed } = await queryFulfilled;
          dispatch(
            resumeApi.util.updateQueryData('getResumes', undefined, (draft) => {
              patchResume(draft, resumeId, (resume) => ({
                ...resume,
                viewerRating: confirmed.viewerRating,
                ratingCount: confirmed.ratingCount,
                averageRating: confirmed.averageRating,
              }));
            }),
          );
        } catch {
          optimisticPatch.undo();
        }
      },
    }),
    reactToResume: build.mutation<
      ResumeReactionResponse,
      { resumeId: string; kind: ReactionKind | null }
    >({
      query: ({ resumeId, kind }) => ({
        url: `/resumes/${resumeId}/reaction`,
        method: 'PUT',
        body: { kind },
      }),
      invalidatesTags: (_result, _error, { resumeId }) => [
        { type: 'Reactors' as const, id: resumeId },
      ],
      async onQueryStarted({ resumeId, kind }, { dispatch, queryFulfilled }) {
        const optimisticPatch = dispatch(
          resumeApi.util.updateQueryData('getResumes', undefined, (draft) => {
            patchResume(draft, resumeId, (resume) => optimisticReaction(resume, kind));
          }),
        );

        try {
          const { data: confirmed } = await queryFulfilled;
          dispatch(
            resumeApi.util.updateQueryData('getResumes', undefined, (draft) => {
              patchResume(draft, resumeId, (resume) => ({
                ...resume,
                viewerReaction: confirmed.viewerReaction,
                reactionCount: confirmed.reactionCount,
                reactionCounts: confirmed.reactionCounts,
              }));
            }),
          );
        } catch {
          optimisticPatch.undo();
        }
      },
    }),
    getResumeReactors: build.infiniteQuery<ResumeReactorsResponse, string, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg: resumeId, pageParam }) => ({
        url: `/resumes/${resumeId}/reactions`,
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
      providesTags: (_result, _error, resumeId) => [{ type: 'Reactors' as const, id: resumeId }],
    }),
  }),
});

export const {
  useCreateResumeMutation,
  useGetResumeReactorsInfiniteQuery,
  useGetResumesInfiniteQuery,
  useRateResumeMutation,
  useReactToResumeMutation,
} = resumeApi;
