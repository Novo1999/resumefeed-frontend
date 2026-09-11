'use client'; // Error boundaries must be Client Components.

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCwIcon, TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Catches render-time errors from `app/page.tsx` and every nested segment that
 * doesn't define its own `error.tsx`. It does *not* cover the root layout —
 * `SiteHeader`'s Supabase call lives there, and a throw from it is caught by
 * `app/global-error.tsx` instead.
 *
 * `retry()` (stable since Next 16.3) re-fetches and re-renders the boundary's
 * children, so a transient failure — a dropped Supabase connection, an API
 * blip — clears without a full page reload.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // The hook for a reporting service later. In production, a Server Component
    // error arrives here already scrubbed — a generic message plus `digest`.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm p-2">
        <CardHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlertIcon className="size-4 text-destructive" />
          </div>
          <CardTitle className="text-lg">Something went wrong</CardTitle>
          <CardDescription>
            That&apos;s on us, not on you. Trying again often clears it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button size="lg" className="w-full" onClick={() => retry()}>
            <RotateCwIcon />
            Try again
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Back home
          </Button>

          {/* Lets someone quote the exact failure in a bug report — it's the
              only handle that ties this screen to a line in the server logs. */}
          {error.digest ? (
            <p className="pt-1 text-center font-mono text-xs text-muted-foreground">
              {error.digest}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
