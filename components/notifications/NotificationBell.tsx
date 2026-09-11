'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { notificationApi, useGetUnreadNotificationCountQuery } from '@/store/api/notificationApi';

export function NotificationBell({ userId }: { userId: string }) {
  const dispatch = useAppDispatch();
  const { data } = useGetUnreadNotificationCountQuery();
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    const channel = getSupabaseClient()
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        () => dispatch(notificationApi.util.invalidateTags(['Notifications'])),
      )
      .subscribe();
    return () => {
      void getSupabaseClient().removeChannel(channel);
    };
  }, [dispatch, userId]);

  const label = unreadCount ? `Notifications (${unreadCount} unread)` : 'Notifications';
  return (
    <Button
      render={<Link href="/notifications" />}
      nativeButton={false}
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={label}
    >
      <BellIcon />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-4 text-primary-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Button>
  );
}
