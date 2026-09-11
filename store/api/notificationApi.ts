import { baseApi } from './baseApi';
import type { NotificationListResponse } from '@/types/notification';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.infiniteQuery<NotificationListResponse, void, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ pageParam }) => ({
        url: '/notifications',
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
      providesTags: ['Notifications'],
    }),
    getUnreadNotificationCount: build.query<{ unreadCount: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    readNotification: build.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    readAllNotifications: build.mutation<{ unreadCount: number }, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} = notificationApi;
