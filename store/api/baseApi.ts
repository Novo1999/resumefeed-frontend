import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '@/lib/env';

/**
 * Base RTK Query API. Inject endpoints from feature files with
 * `baseApi.injectEndpoints({ ... })`.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${env.apiUrl}/api`,
    // prepareHeaders: (headers) => headers, // add auth token here later
  }),
  tagTypes: [],
  endpoints: () => ({}),
});
