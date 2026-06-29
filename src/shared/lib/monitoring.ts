// src/shared/lib/monitoring.ts — Monitoring infrastructure (Phase 6 Sprint 6).
// Sentry error reporting, Vercel Analytics, Web Vitals collection.
//
// All providers are initialized lazily and degrade gracefully when not configured.

import type { NextRouter } from 'next/router';

// ─── Sentry (Error Reporting) ────────────────────────────────────────────────
// Sentry SDK is loaded dynamically to avoid bundling when not configured.

let sentryInitialized = false;

export async function initSentry(): Promise<void> {
  if (sentryInitialized) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1,
      replaysSessionSampleRate: 0.01, // 1% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      integrations: [
        // Sentry.replayIntegration is loaded when SDK is loaded
      ],
      ignoreErrors: [
        // Browser extension noise
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        // Network errors that users can retry
        'Network request failed',
        'Failed to fetch',
      ],
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        // Firefox extensions
        /^moz-extension:\/\//i,
      ],
    });
    sentryInitialized = true;
  } catch (err) {
    console.warn('[monitoring] Failed to initialize Sentry:', err);
  }
}

export async function captureException(error: unknown, context?: Record<string, unknown>): Promise<void> {
  try {
    const Sentry = await import('@sentry/nextjs');
    if (context) {
      Sentry.captureException(error, { extra: context });
    } else {
      Sentry.captureException(error);
    }
  } catch {
    // Sentry not available — fall back to console.error
    console.error('[monitoring] Unhandled exception:', error);
  }
}

export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(message, level);
  } catch {
    console.info(`[monitoring] ${level}: ${message}`);
  }
}

// ─── Vercel Analytics ────────────────────────────────────────────────────────
let analyticsInitialized = false;

export async function initVercelAnalytics(): Promise<void> {
  if (analyticsInitialized) return;
  if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) {
    try {
      await import('@vercel/analytics');
      analyticsInitialized = true;
    } catch (err) {
      console.warn('[monitoring] Vercel Analytics not available:', err);
    }
  }
}

// ─── Web Vitals ──────────────────────────────────────────────────────────────
export interface WebVitalMetric {
  name: 'CLS' | 'LCP' | 'FID' | 'FID' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type WebVitalHandler = (metric: WebVitalMetric) => void;

const webVitalHandlers: Set<WebVitalHandler> = new Set();

export function onWebVitals(handler: WebVitalHandler): () => void {
  webVitalHandlers.add(handler);
  return () => webVitalHandlers.delete(handler);
}

async function reportWebVital(metric: WebVitalMetric): Promise<void> {
  // Notify local handlers
  for (const handler of webVitalHandlers) {
    try {
      handler(metric);
    } catch {
      // handler errors must not break the chain
    }
  }

  // Report to Vercel Web Vitals (if configured)
  try {
    const url = '/api/web-vitals';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dsn: process.env.NEXT_PUBLIC_VERCEL_WEB_VITALS_DSN,
        event: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          page: typeof window !== 'undefined' ? window.location.pathname : '/',
          sessionId: getSessionId(),
        },
      }),
    });
  } catch {
    // Best-effort — swallow errors
  }

  // Report to Sentry as breadcrumbs
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.addBreadcrumb({
      category: 'web-vital',
      message: `${metric.name}: ${metric.value} (${metric.rating})`,
      level: metric.rating === 'poor' ? 'warning' : 'info',
    });
  } catch {
    // no-op
  }
}

export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const webVitals = await import('web-vitals');
    webVitals.onCLS(reportWebVital);
    webVitals.onLCP(reportWebVital);
    webVitals.onFCP(reportWebVital);
    webVitals.onTTFB(reportWebVital);
    webVitals.onINP(reportWebVital);
  } catch (err) {
    console.warn('[monitoring] web-vitals not available:', err);
  }
}

// ─── Session ID (for correlating events) ─────────────────────────────────────
const SESSION_ID_KEY = 'session-id';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

// ─── Page View Tracking ──────────────────────────────────────────────────────
export async function trackPageView(url: string): Promise<void> {
  // Vercel Analytics auto-tracks, but we also report to Sentry
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: url,
      level: 'info',
    });
  } catch {
    // no-op
  }
}

// ─── Router Subscription (for SPA navigation tracking) ────────────────────────
export function subscribeToRouter(router: NextRouter): () => void {
  const handleRouteChange = (url: string) => {
    void trackPageView(url);
  };
  router.events.on('routeChangeComplete', handleRouteChange);
  return () => {
    router.events.off('routeChangeComplete', handleRouteChange);
  };
}
