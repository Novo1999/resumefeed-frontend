import { redirect } from 'next/navigation';
import { PublicProfile } from '@/components/profile/PublicProfile';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function ProfilePage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  if (!(await getCurrentUser())) redirect(`/login?next=/profiles/${encodeURIComponent(profileId)}`);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <PublicProfile userId={profileId} />
    </main>
  );
}
