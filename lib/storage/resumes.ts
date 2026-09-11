import { env } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';

/** Kept in step with `resumefeed-backend/supabase/storage-setup.sql`. */
export const RESUME_MIME_TYPE = 'application/pdf';
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPT = RESUME_MIME_TYPE;

export function validateResumeFile(file: File): string | null {
  if (file.type !== RESUME_MIME_TYPE) {
    return 'Use a PDF file.';
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'The file name must end in .pdf.';
  }
  if (file.size === 0) {
    return 'That PDF is empty.';
  }
  if (file.size > RESUME_MAX_BYTES) {
    return `That PDF is ${(file.size / 1024 / 1024).toFixed(1)} MB — keep it under 5 MB.`;
  }
  return null;
}

/** The first path segment is required by the bucket's ownership policy. */
function resumePath(userId: string) {
  return `${userId}/${crypto.randomUUID()}.pdf`;
}

/**
 * Uploads only the PDF bytes. The server creates the public feed post afterward,
 * after independently confirming this object exists in the caller's folder.
 */
export async function uploadResume(userId: string, file: File): Promise<string> {
  const path = resumePath(userId);
  const { error } = await getSupabaseClient()
    .storage
    .from(env.resumeBucket)
    .upload(path, file, {
      contentType: RESUME_MIME_TYPE,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(error.message);
  return path;
}
