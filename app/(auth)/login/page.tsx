import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to share your resume and review others.',
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  // `proxy.ts` puts the originally requested path here when it bounces a
  // signed-out visitor. It also redirects signed-in users away from this page,
  // so there is no need to check for a session here.
  const { next } = await searchParams;
  const nextPath = typeof next === 'string' ? next : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to pick up where you left off.</p>
      </div>

      <LoginForm next={nextPath} />
    </div>
  );
}
