import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResumeDetail } from '@/components/feed/ResumeDetail';
import { getCurrentUser } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Resume — Resume Feed' };

export default async function ResumePage({
  params,
  searchParams,
}: {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ comment?: string | string[] }>;
}) {
  const { resumeId } = await params;
  const { comment } = await searchParams;
  if (!(await getCurrentUser())) redirect(`/login?next=/resumes/${encodeURIComponent(resumeId)}`);
  const focusCommentId = typeof comment === 'string' ? comment : undefined;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <ResumeDetail resumeId={resumeId} focusCommentId={focusCommentId} />
    </main>
  );
}
