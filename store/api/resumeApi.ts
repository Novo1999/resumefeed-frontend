import { baseApi } from './baseApi';
import type {
  CreateResumeRequest,
  FeedResume,
  RateResumeRequest,
  ResumeFeedResponse,
  ResumeRatingResponse,
  ResumeResponse,
} from '@/types/resume';
import { optimisticRating } from '@/lib/resume/rating';

function patchRating(
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
            patchRating(draft, resumeId, (resume) => optimisticRating(resume, score));
          }),
        );

        try {
          const { data: confirmed } = await queryFulfilled;
          dispatch(
            resumeApi.util.updateQueryData('getResumes', undefined, (draft) => {
              patchRating(draft, resumeId, (resume) => ({
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
  }),
});

export const { useCreateResumeMutation, useGetResumesInfiniteQuery, useRateResumeMutation } =
  resumeApi;
