import { baseApi } from './baseApi';

/** Shape of `GET /api/me` in the Express API. */
export type MeResponse = {
  id: string;
  email: string | null;
  metadata: Record<string, unknown>;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Asks the API who it thinks we are. Its answer comes from verifying our
     * access token server-side, so a successful response proves the whole chain
     * works: cookie → browser client → Authorization header → `requireAuth`.
     */
    getMe: build.query<MeResponse, void>({
      query: () => '/me',
      providesTags: ['Me'],
    }),
  }),
});

export const { useGetMeQuery } = authApi;
