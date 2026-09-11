import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from '../env';

let browserClient: SupabaseClient | null = null;

/**
 * Singleton browser Supabase client.
 *
 * Unlike a plain `createClient`, this writes the session to **cookies** rather
 * than localStorage, which is what lets `lib/supabase/server.ts` and `proxy.ts`
 * read the same session on the server. Keep the two in sync — a session written
 * by one must be readable by the other.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return browserClient;
}
