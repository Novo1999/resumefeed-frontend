'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { UserMenu, type UserMenuProps } from './UserMenu';

type SignedInNavigationProps = UserMenuProps & { userId: string };

export function SignedInNavigation({ userId, ...profile }: SignedInNavigationProps) {
  const pathname = usePathname();
  const onFeed = pathname === '/feed';
  const onNotifications = pathname === '/notifications';

  return (
    <nav className="flex items-center gap-2">
      {!onFeed ? (
        <Button render={<Link href="/feed" />} nativeButton={false} variant="ghost" size="sm">
          Feed
        </Button>
      ) : null}
      {!onNotifications ? <NotificationBell userId={userId} /> : null}
      <UserMenu {...profile} />
    </nav>
  );
}
