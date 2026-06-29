// src/shared/providers/platform-provider.tsx — Root providers (PC-05, EC-05, EC-06).

'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@/shared/hooks/use-theme';
import { AnalyticsClient, ConsoleAdapter, getAnalyticsClient } from '@packages/analytics';
import { getFeatureFlagService } from '@/shared/lib/feature-flags';
import { getEventBus } from '@/shared/lib/event-bus';
import { Toaster } from '@/components/ui/sonner';

// ─── Analytics Provider ──────────────────────────────────────
const AnalyticsContext = createContext<AnalyticsClient | null>(null);

export function AnalyticsProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: AnalyticsClient;
}) {
  const value = useMemo(
    () => client ?? getAnalyticsClient({ adapters: [new ConsoleAdapter()], consent: false }),
    [client],
  );
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalyticsClient(): AnalyticsClient {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error('useAnalyticsClient must be used inside <AnalyticsProvider>');
  }
  return ctx;
}

// ─── Registry Provider (generated registry accessor) ─────────
const RegistryContext = createContext<{ allSlugs: string[] } | null>(null);

export function RegistryProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ allSlugs: [] as string[] }), []);
  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry(): { allSlugs: string[] } {
  const ctx = useContext(RegistryContext);
  return ctx ?? { allSlugs: [] };
}

// ─── Error Provider (top-level error boundary storage) ───────
const ErrorContext = createContext<{
  lastError: { message: string; timestamp: number } | null;
  report: (message: string) => void;
} | null>(null);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      lastError: null,
      report: (message: string) => {
        getEventBus().emit('tool:error', { message });
      },
    }),
    [],
  );
  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export function useErrorReporter(): (message: string) => void {
  const ctx = useContext(ErrorContext);
  return ctx?.report ?? (() => undefined);
}

// ─── Platform Provider (composes everything) ─────────────────
export function PlatformProvider({ children }: { children: ReactNode }) {
  // Touch the singletons so they're initialised eagerly on the client.
  useMemo(() => {
    getFeatureFlagService();
    getEventBus();
  }, []);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AnalyticsProvider>
        <RegistryProvider>
          <ErrorProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </ErrorProvider>
        </RegistryProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}
