import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { toProfile } from '@/lib/profile/user';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/user-menu';
import { Brand } from '@/components/brand';

/**
 * Server component, so the signed-in state is rendered on the server and the
 * header never flashes "Sign in" at someone who is already signed in.
 */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const profile = user ? toProfile(user) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Brand />

        <nav className="flex items-center gap-2">
          {profile ? (
            <UserMenu
              email={profile.email}
              fullName={profile.fullName ?? undefined}
              avatarUrl={profile.avatarUrl ?? undefined}
            />
          ) : (
            <>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
              >
                Sign in
              </Button>
              <Button render={<Link href="/signup" />} nativeButton={false} size="sm">
                Get started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
