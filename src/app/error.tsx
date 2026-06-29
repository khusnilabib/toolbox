// src/app/error.tsx — Custom 500 error page.

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/shared/components/page-container';
import { ErrorIllustration } from '@/shared/components/state-illustrations';
import { routes } from '@/shared/config/routes';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error]', error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center animate-page-enter">
      <PageContainer className="py-20">
        <div className="mx-auto max-w-md text-center">
          <ErrorIllustration size={80} className="mx-auto" />
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-sm text-muted-foreground text-pretty">
            An unexpected error occurred. Your data is safe — this is a display issue.
            Try refreshing the page, or return to the homepage.
          </p>
          {error.digest ? (
            <p className="mt-4 rounded-md bg-muted p-2 font-mono text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href={routes.home}>
                <Home className="h-4 w-4" aria-hidden />
                Go home
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
