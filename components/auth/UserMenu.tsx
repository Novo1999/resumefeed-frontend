'use client';

import Link from 'next/link';
import { LogOutIcon, UserIcon } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { initials } from '@/lib/profile/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type UserMenuProps = {
  email: string;
  fullName?: string;
  avatarUrl?: string;
};

export function UserMenu({ email, fullName, avatarUrl }: UserMenuProps) {
  const fallback = initials(fullName, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <Avatar className="size-7">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {/* Base UI throws if GroupLabel has no Group ancestor. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            {fullName ? <span className="font-medium">{fullName}</span> : null}
            <span className="text-xs font-normal text-muted-foreground">{email}</span>
          </DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/account" />}>
            <UserIcon />
            Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* A form, not an onClick: signing out is a mutation, and this way it
            works even before the client bundle has hydrated.
            `nativeButton` tells Base UI this really is a <button>, so it leaves
            keyboard activation to the browser instead of synthesising a click —
            without it, Space would not submit the form. */}
        <form action={signOut}>
          <DropdownMenuItem
            render={<button type="submit" className="w-full" />}
            nativeButton
            variant="destructive"
          >
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
