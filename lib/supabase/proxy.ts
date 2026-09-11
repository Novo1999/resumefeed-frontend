import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env, isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from '../env';
import { AFTER_AUTH_REDIRECT } from '../auth/routes';

/** Routes that require a signed-in user. Prefix match, so `/account/x` is covered. */
const PROTECTED_PREFIXES = ['/', '/account'];

/** Auth pages a signed-in user has no reason to see. */
const AUTH_ROUTES = ['/login', '/signup'];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Refreshes the Supabase session on every matched request and gates routes.
 *
 * Two things have to happen here, in this order:
 *
 * 1. `getUser()` revalidates the access token and, when it has expired, mints a
 *    fresh one. Without this the session dies the moment the token lapses,
 *    because server components cannot write cookies themselves.
 * 2. The refreshed cookies are copied onto *both* the request (so the server
 *    component rendering this request sees the new token) and whatever response
 *    we end up returning (so the browser stores it).
 */
export async function updateSession(request: NextRequest) {
  // Without keys there is no session to refresh and nothing to gate. Let the
  // request through so the public pages still render; the auth flows themselves
  // throw `SUPABASE_SETUP_MESSAGE` the moment anyone tries to use them.
  if (!isSupabaseConfigured) {
    console.warn(`[ResumeFeed] ${SUPABASE_SETUP_MESSAGE}`);
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  // Held separately so a redirect can carry them too. Supabase rotates refresh
  // tokens: if we drop a freshly minted one, the next request replays the spent
  // token and the user is signed out for no reason.
  const refreshedCookies: { name: string; value: string; options: object }[] = [];
  const refreshedHeaders: Record<string, string> = {};

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });

        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
          refreshedCookies.push(cookie);
        }
        // Responses that carry auth cookies must not be cached by a CDN, or one
        // visitor's token can be handed to the next.
        for (const [key, headerValue] of Object.entries(headers)) {
          response.headers.set(key, headerValue);
          refreshedHeaders[key] = headerValue;
        }
      },
    },
  });

  /** Re-applies anything `setAll` produced onto a response built after the fact. */
  function carryCookies(target: NextResponse) {
    for (const { name, value, options } of refreshedCookies) {
      target.cookies.set(name, value, options);
    }
    for (const [key, value] of Object.entries(refreshedHeaders)) {
      target.headers.set(key, value);
    }
    return target;
  }

  // Do not put code between the client above and `getUser()` below — anything
  // that returns early here leaves the session unrefreshed and logs users out
  // at random, which is miserable to debug.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && startsWithAny(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    // Send them back where they were headed once they sign in.
    loginUrl.searchParams.set('next', pathname);
    return carryCookies(NextResponse.redirect(loginUrl));
  }

  if (user && startsWithAny(pathname, AUTH_ROUTES)) {
    const landingUrl = request.nextUrl.clone();
    landingUrl.pathname = AFTER_AUTH_REDIRECT;
    landingUrl.search = '';
    return carryCookies(NextResponse.redirect(landingUrl));
  }

  // Must be this exact response object — a fresh `NextResponse.next()` here
  // would drop the refreshed cookies set above.
  return response;
}
