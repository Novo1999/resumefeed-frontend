import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { InboxIcon } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Feed — Resume Feed',
  description: 'Resumes the community is reviewing right now.',
};

export default async function FeedPage() {
  // `proxy.ts` also gates this, but a matcher change can silently drop that.
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/feed');

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="font-heading text-3xl tracking-tight">Feed</h1>
        <p className="text-sm text-muted-foreground">
          Resumes the community is reviewing right now.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <InboxIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium">Nothing here yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            The feed fills up as people post resumes and start trading reviews.
          </p>
        </div>
      </div>
    </div>
  );
}
