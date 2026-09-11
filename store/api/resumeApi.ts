import { baseApi } from './baseApi';
import type { CreateResumeRequest, ResumeFeedResponse, ResumeResponse } from '@/types/resume';

export const resumeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getResumes: build.query<ResumeFeedResponse, void>({
      query: () => '/resumes',
      providesTags: ['Resumes'],
    }),
    createResume: build.mutation<ResumeResponse, CreateResumeRequest>({
      query: (body) => ({ url: '/resumes', method: 'POST', body }),
      invalidatesTags: ['Resumes'],
    }),
  }),
});

export const { useCreateResumeMutation, useGetResumesQuery } = resumeApi;
