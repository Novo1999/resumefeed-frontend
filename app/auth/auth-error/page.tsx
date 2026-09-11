import Link from 'next/link';
import type { Metadata } from 'next';
import { TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sign-in problem — Resume Feed',
};

/** Where `app/auth/callback/route.ts` sends a link it could not redeem. */
export default async function AuthErrorPage({ searchParams }: PageProps<'/auth/auth-error'>) {
  const { reason } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm p-2">
        <CardHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlertIcon className="size-4 text-destructive" />
          </div>
          <CardTitle className="text-lg">That link didn&apos;t work</CardTitle>
          <CardDescription>
            {typeof reason === 'string' && reason
              ? reason
              : 'The link may have expired or already been used.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button render={<Link href="/login" />} nativeButton={false} size="lg" className="w-full">
            Back to sign in
          </Button>
          <Button
            render={<Link href="/signup" />}
            nativeButton={false}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Create a new account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
