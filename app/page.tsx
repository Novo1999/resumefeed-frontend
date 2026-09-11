import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResumeFeed } from '@/components/feed/resume-feed';
import { ResumeUploadDialog } from '@/components/feed/resume-upload-dialog';
import { getCurrentUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Feed — Resume Feed',
  description: 'Resumes the community is reviewing right now.',
};

/** The authenticated resume feed is the app's home route. */
export default async function HomePage() {
  // `proxy.ts` also gates this, but a matcher change can silently drop that.
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/');

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl tracking-tight">Feed</h1>
          <p className="text-sm text-muted-foreground">
            Resumes the community is reviewing right now.
          </p>
        </div>
        <ResumeUploadDialog ownerId={user.id} />
      </div>

      <ResumeFeed />
    </div>
  );
}
