export const AFTER_AUTH_REDIRECT = '/feed';

/** Rejects `//host` too — browsers read that as protocol-relative. */
export function safeNextPath(value: unknown): string {
  if (typeof value !== 'string') return AFTER_AUTH_REDIRECT;
  if (!value.startsWith('/') || value.startsWith('//')) return AFTER_AUTH_REDIRECT;
  return value;
}
