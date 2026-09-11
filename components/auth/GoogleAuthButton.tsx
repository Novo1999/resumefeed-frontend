'use client';

import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { safeNextPath } from '@/lib/auth/routes';
import { Button } from '@/components/ui/button';

type GoogleAuthButtonProps = {
  next?: string;
  disabled?: boolean;
  onError: (message: string | undefined) => void;
};

/** Starts Supabase's hosted Google OAuth sign-in/sign-up flow. */
export function GoogleAuthButton({ next, disabled, onError }: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const signInWithGoogle = async () => {
    onError(undefined);
    setIsRedirecting(true);

    try {
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', safeNextPath(next));

      const { error } = await getSupabaseClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.toString() },
      });

      if (error) {
        onError(error.message);
        setIsRedirecting(false);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to start Google sign-in.');
      setIsRedirecting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={disabled || isRedirecting}
      onClick={signInWithGoogle}
    >
      {isRedirecting ? <Loader2Icon className="animate-spin" /> : <GoogleIcon />}
      {isRedirecting ? 'Redirecting to Google\u2026' : 'Continue with Google'}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.52h3.14c1.84-1.69 2.91-4.18 2.91-7.29Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.62 0 4.82-.87 6.43-2.23L15.3 17c-.87.58-1.98.92-3.3.92-2.53 0-4.67-1.71-5.44-4.01H3.32v2.6A9.72 9.72 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.56 13.91A5.84 5.84 0 0 1 6.25 12c0-.66.11-1.3.31-1.91v-2.6H3.32A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.07 4.51l3.24-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.08c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.82 3.18 14.62 2.25 12 2.25a9.72 9.72 0 0 0-8.68 5.24l3.24 2.6C7.33 7.79 9.47 6.08 12 6.08Z"
      />
    </svg>
  );
}
