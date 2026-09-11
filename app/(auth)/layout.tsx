import { AuthPitchPanel, AuthPitchStrip } from '@/components/marketing/auth-pitch';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <AuthPitchPanel />

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          {children}
          <AuthPitchStrip />
        </div>
      </main>
    </div>
  );
}
