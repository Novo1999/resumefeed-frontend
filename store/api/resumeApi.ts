import { baseApi } from './baseApi';
import type {
  CreateResumeRequest,
  RateResumeRequest,
  ResumeFeedResponse,
  ResumeRatingResponse,
  ResumeResponse,
} from '@/types/resume';

export const resumeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getResumes: build.query<ResumeFeedResponse, string | void>({
      query: (cursor) => ({
        url: '/resumes',
        params: cursor ? { cursor } : undefined,
      }),
      providesTags: ['Resumes'],
    }),
    createResume: build.mutation<ResumeResponse, CreateResumeRequest>({
      query: (body) => ({ url: '/resumes', method: 'POST', body }),
      invalidatesTags: ['Resumes'],
    }),
    rateResume: build.mutation<ResumeRatingResponse, { resumeId: string; score: RateResumeRequest['score'] }>({
      query: ({ resumeId, score }) => ({ url: `/resumes/${resumeId}/rating`, method: 'PUT', body: { score } }),
    }),
  }),
});

export const { useCreateResumeMutation, useGetResumesQuery, useLazyGetResumesQuery, useRateResumeMutation } = resumeApi;
