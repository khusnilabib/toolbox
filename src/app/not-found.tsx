// src/app/not-found.tsx — Custom 404 page with illustration.

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/shared/components/page-container';
import { NotFoundIllustration } from '@/shared/components/state-illustrations';
import { routes } from '@/shared/config/routes';

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center animate-page-enter">
      <PageContainer className="py-20">
        <div className="mx-auto max-w-md text-center">
          <NotFoundIllustration size={160} className="mx-auto" />
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-3 text-sm text-muted-foreground text-pretty">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={routes.home}>Go to homepage</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.tools}>Browse all tools</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
