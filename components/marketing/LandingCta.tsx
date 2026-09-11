import Link from 'next/link';
import { Button } from '@/components/ui/button';

export type LandingCtaProps = {
  signedIn: boolean;
  size?: 'default' | 'lg';
};

export function LandingCta({ signedIn, size = 'lg' }: LandingCtaProps) {
  if (signedIn) {
    return (
      <Button render={<Link href="/feed" />} nativeButton={false} size={size}>
        Go to the feed
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button render={<Link href="/signup" />} nativeButton={false} size={size}>
        Post your resume
      </Button>
      <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size={size}>
        Sign in
      </Button>
    </div>
  );
}
