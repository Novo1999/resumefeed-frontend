import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { getCurrentUser } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Notifications — Resume Feed' };

export default async function NotificationsPage() {
  if (!(await getCurrentUser())) redirect('/login?next=/notifications');
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-1 font-heading text-3xl tracking-tight">Notifications</h1>
      <p className="mb-8 text-sm text-muted-foreground">Activity on your resumes and feedback.</p>
      <NotificationsList />
    </main>
  );
}
