import { Loader2Icon } from 'lucide-react';

/**
 * Suspense fallback for any segment that doesn't ship a `loading.tsx` of its
 * own. It stands in for pages whose shape this file can't know, so a spinner is
 * more honest than a skeleton of the wrong layout — segments with a known shape
 * (`account`, `(auth)`) provide their own.
 *
 * `flex-1` because the root layout's body is `min-h-full flex flex-col`; without
 * it the spinner sits under the header instead of centred in the viewport.
 */
export default function Loading() {
  return (
    <div
      role="status"
      className="flex flex-1 items-center justify-center px-4 py-24"
    >
      <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
