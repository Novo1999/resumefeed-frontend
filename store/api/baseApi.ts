import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';
import { withLogging } from './loggingBaseQuery';

/**
 * Base RTK Query API. Inject endpoints from feature files with
 * `baseApi.injectEndpoints({ ... })`.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: withLogging(
    fetchBaseQuery({
      baseUrl: `${env.apiUrl}/api`,
      /**
       * Attach the Supabase access token to every request. The Express API
       * verifies it in `requireAuth` (see `resumefeed-backend/src/middleware/auth.ts`).
       *
       * `getSession()` is cheap — it reads the cookie and only hits the network
       * when the token has actually expired, in which case it refreshes first,
       * so we never send a stale token.
       */
      prepareHeaders: async (headers) => {
        const {
          data: { session },
        } = await getSupabaseClient().auth.getSession();

        if (session?.access_token) {
          headers.set('Authorization', `Bearer ${session.access_token}`);
        }
        return headers;
      },
    }),
  ),
  tagTypes: ['Me', 'Resumes', 'Reactors'],
  endpoints: () => ({}),
});
