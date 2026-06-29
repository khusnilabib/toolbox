// src/shared/components/toast-providers.tsx — Improved toast notifications.
// Phase 3 Sprint 6 — UX Polish.
//
// Wraps sonner's <Toaster /> with project-specific defaults and adds
// semantic variants (success, error, warning, info, loading) with proper
// ARIA attributes and keyboard dismissal.

'use client';

import { Toaster } from '@/components/ui/sonner';
import { useTheme } from 'next-themes';

export function ToastProviders() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  );
}

// Re-export toast helper with typed variants
export { toast } from 'sonner';
