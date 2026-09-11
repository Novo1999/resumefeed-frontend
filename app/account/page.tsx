import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { toProfile } from '@/lib/profile/user';
import { ProfileForm } from '@/components/account/profile-form';
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

  const profile = toProfile(user);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="font-heading text-3xl tracking-tight">
          {profile.fullName ? `Hey, ${profile.fullName.split(' ')[0]}` : 'Your account'}
        </h1>
        <p className="text-sm text-muted-foreground">
          How you show up to everyone reviewing resumes alongside you.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your picture and name appear on every resume and review you post.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>What Supabase knows about you.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono text-xs break-all">{profile.id}</dd>

              <dt className="text-muted-foreground">Email confirmed</dt>
              <dd>{user.email_confirmed_at ? 'Yes' : 'Not yet'}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
