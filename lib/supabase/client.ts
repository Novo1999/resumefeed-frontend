import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';

let browserClient: SupabaseClient | null = null;

/**
 * Singleton browser Supabase client. Persists the session in localStorage and
 * auto-refreshes tokens. Handles the OAuth redirect (`?code=`) automatically.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return browserClient;
}
