import { baseApi } from './baseApi';

/** Mirrors `MeResponse` in `resumefeed-backend/src/routes/me.ts`. */
export type MeResponse = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  emailConfirmed: boolean;
  metadata: Record<string, unknown>;
};

/** Email is deliberately absent — the API rejects any attempt to change it. */
export type UpdateMeRequest = {
  fullName?: string;
  /** `null` clears the picture. */
  avatarUrl?: string | null;
};

export type ApiError = {
  error: string;
  fieldErrors?: Partial<Record<'fullName' | 'avatarUrl', string>>;
};

export const profileApi = baseApi.injectEndpoints({
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

    updateMe: build.mutation<MeResponse, UpdateMeRequest>({
      query: (body) => ({ url: '/me', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation } = profileApi;
