import type { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

function readString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Narrows a Supabase user to the fields the UI actually renders. */
export function toProfile(user: User): Profile {
  return {
    id: user.id,
    email: user.email ?? '',
    fullName: readString(user.user_metadata, 'full_name'),
    avatarUrl: readString(user.user_metadata, 'avatar_url'),
  };
}

/** First letters of the name, or of the email when there is no name. */
export function initials(fullName: string | null | undefined, email: string) {
  const source = fullName?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?').concat(parts.length > 1 ? parts[1][0] : '').toUpperCase();
}
