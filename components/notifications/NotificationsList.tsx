'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { CheckIcon, MessageSquareIcon, RefreshCwIcon, ReplyIcon, StarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/profile/user';
import { formatPostedTime } from '@/lib/resume/time';
import { REACTION_META } from '@/lib/resume/reaction';
import { readApiError } from '@/store/api/errors';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import {
  notificationApi,
  useGetNotificationsInfiniteQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} from '@/store/api/notificationApi';
import type { Notification } from '@/types/notification';
import { StarRating } from '@/components/feed/StarRating';

function description(notification: Notification) {
  const actor = notification.actor.fullName ?? 'A community member';
  if (!notification.available) return `${actor}'s feedback is no longer available.`;
  if (notification.removedAt) return `${actor} removed their reaction.`;
  switch (notification.kind) {
    case 'resume_comment':
      return `${actor} commented on your resume.`;
    case 'comment_reply':
      return `${actor} replied to your feedback.`;
    case 'resume_reaction':
      return `${actor} reacted to your resume.`;
    case 'comment_reaction':
      return `${actor} reacted to your feedback.`;
    case 'resume_rating':
      return `${actor} rated your resume ${notification.ratingScore} out of 5.`;
  }
}

function ActivityIcon({ notification }: { notification: Notification }) {
  switch (notification.kind) {
    case 'resume_comment':
      return <MessageSquareIcon className="size-4" aria-hidden="true" />;
    case 'comment_reply':
      return <ReplyIcon className="size-4" aria-hidden="true" />;
    case 'resume_reaction':
    case 'comment_reaction':
      return notification.reactionKind ? (
        <span className="text-base leading-none" aria-hidden="true">
          {REACTION_META[notification.reactionKind].emoji}
        </span>
      ) : null;
    case 'resume_rating':
      return <StarIcon className="size-4" aria-hidden="true" />;
  }
}

function activityLabel(notification: Notification) {
  switch (notification.kind) {
    case 'resume_comment':
      return 'New comment';
    case 'comment_reply':
      return 'New reply';
    case 'resume_reaction':
    case 'comment_reaction':
      return notification.removedAt ? 'Removed reaction' : 'New reaction';
    case 'resume_rating':
      return 'New rating';
  }
}

export function NotificationsList() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetNotificationsInfiniteQuery();
  const [readNotification] = useReadNotificationMutation();
  const [readAll, { isLoading: isReadingAll }] = useReadAllNotificationsMutation();
  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;
  const triggerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => 88,
    overscan: 6,
  });

  useEffect(() => {
    let disposed = false;
    let channel: ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null = null;
    void getSupabaseClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user || disposed) return;
        channel = getSupabaseClient()
          .channel(`notifications-list:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `recipient_id=eq.${user.id}`,
            },
            () => dispatch(notificationApi.util.invalidateTags(['Notifications'])),
          )
          .subscribe();
      });
    return () => {
      disposed = true;
      if (channel) void getSupabaseClient().removeChannel(channel);
    };
  }, [dispatch]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    try {
      await fetchNextPage().unwrap();
    } catch (loadError) {
      toast.error(`Couldn't load notifications: ${readApiError(loadError).message}`);
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: '700px 0px' },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, items.length, loadMore]);

  async function openNotification(notification: Notification) {
    if (notification.readAt === null) {
      try {
        await readNotification(notification.id).unwrap();
      } catch (readError) {
        toast.error(`Couldn't mark notification as read: ${readApiError(readError).message}`);
      }
    }
    if (!notification.available) return;
    const focus = notification.commentId
      ? `?comment=${encodeURIComponent(notification.commentId)}`
      : '';
    router.push(`/resumes/${notification.resumeId}${focus}`);
  }

  async function markAllRead() {
    try {
      await readAll().unwrap();
    } catch (readError) {
      toast.error(`Couldn't mark notifications as read: ${readApiError(readError).message}`);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm text-destructive">{readApiError(error).message}</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCwIcon />
          Try again
        </Button>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-14 text-center text-sm text-muted-foreground">
        No notifications yet.
      </p>
    );
  }

  return (
    <section aria-label="Notifications">
      {unreadCount > 0 ? (
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isReadingAll}
            onClick={() => void markAllRead()}
          >
            <CheckIcon /> Mark all as read
          </Button>
        </div>
      ) : null}
      <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const notification = items[virtualItem.index];
          const actorName = notification.actor.fullName ?? 'Community member';
          return (
            <div
              key={notification.id}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className="absolute left-0 top-0 w-full pb-2"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <button
                type="button"
                onClick={() => void openNotification(notification)}
                className={`relative flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-muted/70 ${notification.readAt === null ? 'border-primary/30 bg-primary/5' : 'border-transparent'}`}
              >
                <Avatar className="size-9 shrink-0">
                  {notification.actor.avatarUrl ? (
                    <AvatarImage src={notification.actor.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback>
                    {initials(notification.actor.fullName, actorName)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  title={activityLabel(notification)}
                  aria-label={activityLabel(notification)}
                >
                  <ActivityIcon notification={notification} />
                </span>
                <span className={`min-w-0 flex-1 ${notification.kind === 'resume_rating' ? 'md:pr-24' : ''}`}>
                  <span className="block text-sm">{description(notification)}</span>
                  {notification.commentBody ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {notification.commentBody}
                    </span>
                  ) : null}
                  {notification.kind === 'resume_rating' ? (
                    <span className="mt-1 block md:absolute md:right-8 md:top-1/2 md:mt-0 md:-translate-y-1/2">
                      <StarRating value={notification.ratingScore} readOnly />
                    </span>
                  ) : null}
                  <time
                    className="mt-0.5 block text-xs text-muted-foreground"
                    dateTime={notification.createdAt}
                  >
                    {formatPostedTime(notification.createdAt)}
                  </time>
                </span>
                {notification.readAt === null ? (
                  <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                ) : null}
              </button>
            </div>
          );
        })}
      </div>
      {hasNextPage ? <div ref={triggerRef} className="h-px" aria-hidden="true" /> : null}
      {isFetchingNextPage ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading more notifications…
        </p>
      ) : null}
    </section>
  );
}
