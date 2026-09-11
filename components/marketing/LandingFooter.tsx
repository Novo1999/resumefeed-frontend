import Link from 'next/link';
import { Brand } from '@/components/Brand';

export function LandingFooter({ signedIn }: { signedIn: boolean }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <Brand />
          <p className="text-sm text-muted-foreground">
            Give a review, get a review. That is the whole deal.
          </p>
        </div>

        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          {signedIn ? (
            <>
              <Link href="/feed" className="hover:text-foreground">
                Feed
              </Link>
              <Link href="/account" className="hover:text-foreground">
                Account
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-foreground">
                Sign in
              </Link>
              <Link href="/signup" className="hover:text-foreground">
                Create an account
              </Link>
            </>
          )}
        </nav>
      </div>
    </footer>
  );
}
