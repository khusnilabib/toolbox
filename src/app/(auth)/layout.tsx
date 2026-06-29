// src/app/(auth)/layout.tsx — Auth layout.
//
// Centered card layout for login/register, full-width for the dashboard.
// Adaptive via `usePathname()` so a single layout file serves every auth page.

'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { PageContainer } from '@/shared/components/page-container';

const CENTERED_ROUTES = new Set(['/login', '/register']);

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const centered = CENTERED_ROUTES.has(pathname);

  if (centered) {
    return (
      <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <PageContainer className="py-10">{children}</PageContainer>
    </main>
  );
}
