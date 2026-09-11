/** Public runtime config. Reads NEXT_PUBLIC_* env vars (available in browser). */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  resumeBucket: process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET ?? 'resumes',
  avatarBucket: process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET ?? 'avatars',
};

/**
 * Whether auth can work at all. Checked before building any Supabase client so
 * a missing key produces the message below instead of a stack trace from deep
 * inside the SDK — and so the public pages still render without one.
 */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const SUPABASE_SETUP_MESSAGE =
  'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
  'in resumefeed-frontend/.env.local (Supabase Dashboard → Project Settings → API), then restart `npm run dev`.';

if (!isSupabaseConfigured) {
  console.warn(`[ResumeFeed] ${SUPABASE_SETUP_MESSAGE}`);
}
