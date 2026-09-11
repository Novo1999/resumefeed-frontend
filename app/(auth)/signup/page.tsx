import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create an account — Resume Feed',
  description: 'Join Resume Feed to get honest feedback on your resume.',
};

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Post your resume, review a few others, and the feedback comes back to you.
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
