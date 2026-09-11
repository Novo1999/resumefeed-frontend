import { ProfileForm } from '@/components/account/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toProfile } from '@/lib/profile/user';
import { getCurrentUser } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

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
      </div>
    </div>
  );
}
