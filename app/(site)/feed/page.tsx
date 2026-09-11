import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResumeFeed } from '@/components/feed/ResumeFeed';
import { ResumeUploadDialog } from '@/components/feed/ResumeUploadDialog';
import { toProfile } from '@/lib/profile/user';
import { getCurrentUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Resume review feed',
  description: 'Resumes the community is reviewing right now.',
  robots: { index: false, follow: false },
};

export default async function FeedPage() {
  // `proxy.ts` also gates this, but a matcher change can silently drop that.
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/feed');
  const profile = toProfile(user);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl tracking-tight">Feed</h1>
          <p className="text-sm text-muted-foreground">
            Resumes the community is reviewing right now.
          </p>
        </div>
        <ResumeUploadDialog
          ownerId={profile.id}
          ownerName={profile.fullName}
          ownerEmail={profile.email}
          ownerAvatarUrl={profile.avatarUrl}
        />
      </div>

      <ResumeFeed />
    </div>
  );
}
