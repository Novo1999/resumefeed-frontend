import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/routes';

/**
 * Where Supabase sends the user back to after they click a link in an email.
 *
 * Two link shapes arrive here, depending on how the project's email templates
 * are written, so handle both:
 *
 *   ?code=...                 the PKCE flow — exchange it for a session
 *   ?token_hash=...&type=...  the OTP flow — verify it for a session
 *
 * Either way the session lands in cookies before we redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Supabase reports a rejected link (expired, already used) in the query string.
  const errorDescription = searchParams.get('error_description') ?? searchParams.get('error');

  const redirectTo = safeNextPath(searchParams.get('next'));

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/auth/auth-error?reason=${encodeURIComponent(errorDescription)}`,
    );
  }

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/auth-error?reason=${encodeURIComponent(error.message)}`,
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/auth-error?reason=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/auth-error?reason=${encodeURIComponent(
      'That confirmation link was missing its token.',
    )}`,
  );
}
