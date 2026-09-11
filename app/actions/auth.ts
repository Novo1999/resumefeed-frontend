'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AFTER_AUTH_REDIRECT, safeNextPath } from '@/lib/auth/routes';
import {
  loginSchema,
  signupSchema,
  toFieldErrors,
  type AuthFieldErrors,
  type LoginValues,
  type SignupValues,
} from '@/lib/auth/schemas';

/** Only returned on failure — success always ends in a `redirect()`. */
export type AuthActionResult = {
  fieldErrors?: AuthFieldErrors;
  message?: string;
  emailConfirmationSent?: boolean;
  email?: string;
};

export async function login(values: LoginValues, next?: string): Promise<AuthActionResult> {
  // A Server Action is a public POST endpoint, so re-validate server-side.
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      // One message for both cases: distinguishing them tells an attacker
      // which emails are registered.
      message:
        error.code === 'invalid_credentials'
          ? 'That email and password do not match an account.'
          : error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect(safeNextPath(next));
}

export async function signup(values: SignupValues): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const { fullName, email, password } = parsed.data;

  const [supabase, requestHeaders] = await Promise.all([createSupabaseServerClient(), headers()]);

  // Derived from the request so this works on localhost, previews and prod.
  const origin =
    requestHeaders.get('origin') ?? `http://${requestHeaders.get('host') ?? 'localhost:3000'}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { message: error.message };
  }

  // Supabase answers a duplicate signup with an identity-less decoy user rather
  // than creating another account. Keep the visitor on this form instead of
  // presenting the successful-signup confirmation state.
  const isDecoyUser = data.user?.identities?.length === 0;

  if (isDecoyUser) {
    return { message: 'An account with this email already exists. Please sign in instead.' };
  }

  if (!data.session) {
    return { emailConfirmationSent: true, email };
  }

  revalidatePath('/', 'layout');
  redirect(AFTER_AUTH_REDIRECT);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
