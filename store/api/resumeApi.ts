import { baseApi } from './baseApi';
import type { CreateResumeRequest, ResumeFeedResponse, ResumeResponse } from '@/types/resume';

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
  }),
});

export const { useCreateResumeMutation, useGetResumesQuery, useLazyGetResumesQuery } = resumeApi;
