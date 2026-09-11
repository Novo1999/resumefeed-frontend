'use client';

import { BriefcaseBusinessIcon, RefreshCwIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { initials } from '@/lib/profile/user';
import { readApiError } from '@/store/api/errors';
import { useGetPublicProfileQuery } from '@/store/api/profileApi';

export function PublicProfile({ userId }: { userId: string }) {
  const { data: profile, error, isLoading, refetch } = useGetPublicProfileQuery(userId);

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm text-destructive">
          {error ? readApiError(error).message : 'This profile is no longer available.'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCwIcon />
          Try again
        </Button>
      </div>
    );
  }

  const name = profile.fullName ?? 'Community member';

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-18" size="lg">
          {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-lg">{initials(profile.fullName, name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-3xl tracking-tight">{name}</h1>
          {profile.role ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <BriefcaseBusinessIcon className="size-3.5" />
              {profile.role}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Community member</p>
          )}
        </div>
      </div>
    </section>
  );
}
