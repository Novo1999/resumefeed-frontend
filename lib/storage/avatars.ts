import { env } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';

/** Keep in step with `allowed_mime_types` on the bucket. */
export const AVATAR_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** For the file input's `accept`, so the picker filters before we have to. */
export const AVATAR_ACCEPT = AVATAR_MIME_TYPES.join(',');

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export function validateAvatarFile(file: File): string | null {
  if (!(AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Use a PNG, JPEG or WebP image.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB — keep it under 2 MB.`;
  }
  return null;
}

/**
 * The first path segment is the owner: storage RLS compares it to `auth.uid()`,
 * so this shape is what enforces that nobody writes into anyone else's folder.
 * A fresh filename each time means the CDN never serves the previous picture.
 */
function avatarPath(userId: string, file: File) {
  return `${userId}/${crypto.randomUUID()}.${EXTENSIONS[file.type] ?? 'png'}`;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = getSupabaseClient();
  const path = avatarPath(userId, file);

  const { error } = await supabase.storage
    .from(env.avatarBucket)
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(env.avatarBucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Drops every file in the user's folder except `keepUrl`, so replacing a picture
 * doesn't leave the old one behind. Call it only once the new URL is saved — a
 * failed save would otherwise leave the profile pointing at a deleted file.
 */
export async function pruneOldAvatars(userId: string, keepUrl: string | null) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(env.avatarBucket).list(userId);
  if (error || !data) return;

  const keep = keepUrl ? decodeURIComponent(keepUrl).split('/').pop() : null;
  const stale = data.filter((item) => item.name !== keep).map((item) => `${userId}/${item.name}`);

  if (stale.length > 0) {
    await supabase.storage.from(env.avatarBucket).remove(stale);
  }
}
