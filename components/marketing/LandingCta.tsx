import Link from 'next/link';
import { Button } from '@/components/ui/button';

export type LandingCtaProps = {
  signedIn: boolean;
  size?: 'default' | 'lg';
  prominent?: boolean;
};

export function LandingCta({ signedIn, size = 'lg', prominent = false }: LandingCtaProps) {
  const className = prominent ? 'h-12 min-w-40 px-6 text-base shadow-sm' : undefined;

  if (signedIn) {
    return (
      <Button render={<Link href="/feed" />} nativeButton={false} size={size} className={className}>
        Go to the feed
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        render={<Link href="/signup" />}
        nativeButton={false}
        size={size}
        className={className}
      >
        Post your resume
      </Button>
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        variant="ghost"
        size={size}
        className={className}
      >
        Sign in
      </Button>
    </div>
  );
}
