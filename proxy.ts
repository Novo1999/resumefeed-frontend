import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * Runs before every matched request. In Next.js 16 this file is `proxy.ts` —
 * the old `middleware.ts` convention is deprecated.
 *
 * Its job is to keep the Supabase session fresh and to redirect unauthenticated
 * visitors away from protected routes. Treat that redirect as a convenience,
 * not as the security boundary: the real check belongs in the page or route
 * handler (`getCurrentUser()`) and in the API (`requireAuth`).
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Every path except the ones that never need a session:
     * - _next/static, _next/image — build output
     * - favicon.ico, and common static asset extensions
     * Skipping these keeps a Supabase round-trip off every image request.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
