import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Your account — Resume Feed',
};

export default async function AccountPage() {
  // `proxy.ts` also gates this, but a matcher change can silently drop that.
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="font-heading text-3xl tracking-tight">
          {fullName ? `Hey, ${fullName.split(' ')[0]}` : 'Your account'}
        </h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re signed in. This page is only reachable with a valid session.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>What Supabase knows about you.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{fullName ?? <span className="text-muted-foreground">—</span>}</dd>

              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>

              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono text-xs break-all">{user.id}</dd>

              <dt className="text-muted-foreground">Confirmed</dt>
              <dd>{user.email_confirmed_at ? 'Yes' : 'Not yet'}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
