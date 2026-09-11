import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from '../env';

/** One per request — a module-level singleton would leak sessions between visitors. */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies, and `proxy.ts` has already
          // refreshed this request's session anyway.
        }
      },
    },
  });
}

/**
 * Never `getSession()` on the server — it decodes the cookie without verifying
 * the signature. `cache()` keeps this to one round-trip per request.
 */
export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
