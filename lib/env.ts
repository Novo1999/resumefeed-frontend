/** Public runtime config. Reads NEXT_PUBLIC_* env vars (available in browser). */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  resumeBucket: process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET ?? 'resumes',
};

if (typeof window !== 'undefined') {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
      '[ResumeFeed] Missing Supabase env vars. Copy .env.local.example to .env.local and fill them in.',
    );
  }
}
