import { baseApi } from './baseApi';
import type { CreateResumeRequest, ResumeResponse } from '@/types/resume';

export const resumeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createResume: build.mutation<ResumeResponse, CreateResumeRequest>({
      query: (body) => ({ url: '/resumes', method: 'POST', body }),
      invalidatesTags: ['Resumes'],
    }),
  }),
});

export const { useCreateResumeMutation } = resumeApi;
