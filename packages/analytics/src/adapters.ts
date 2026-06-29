// @packages/analytics/src/adapters.ts
// Vendor-neutral analytics adapters (DGA-02). The event schema is canonical;
// providers are interchangeable adapters.

import type { BaseEvent } from '@packages/types';

export interface AnalyticsAdapter {
  readonly name: string;
  init?(config?: Record<string, unknown>): Promise<void> | void;
  track(event: BaseEvent): Promise<void> | void;
  identify?(userId: string, traits?: Record<string, unknown>): Promise<void> | void;
  flush?(): Promise<void> | void;
}

/**
 * Google Analytics 4 adapter (uses gtag when available in the browser).
 */
export class GA4Adapter implements AnalyticsAdapter {
  readonly name = 'ga4';
  private measurementId?: string;

  constructor(measurementId?: string) {
    this.measurementId = measurementId;
  }

  init(): void {
    if (typeof window === 'undefined' || !this.measurementId) return;
    if (!(window as unknown as { gtag?: unknown }).gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);
      (window as unknown as { dataLayer: unknown[] }).dataLayer = (
        window as unknown as { dataLayer?: unknown[] }
      ).dataLayer ?? [];
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = function gtag(
        ...args: unknown[]
      ) {
        ((window as unknown as { dataLayer: unknown[] }).dataLayer).push(args);
      };
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('js', new Date());
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        'config',
        this.measurementId,
      );
    }
  }

  track(event: BaseEvent): void {
    if (typeof window === 'undefined') return;
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.('event', event.name, event.payload as Record<string, unknown>);
  }
}

/**
 * Plausible adapter (uses the global `plausible` function injected by the snippet).
 */
export class PlausibleAdapter implements AnalyticsAdapter {
  readonly name = 'plausible';
  private domain?: string;

  constructor(domain?: string) {
    this.domain = domain;
  }

  init(): void {
    if (typeof window === 'undefined' || !this.domain) return;
    if (!(window as unknown as { plausible?: unknown }).plausible) {
      const script = document.createElement('script');
      script.defer = true;
      script.setAttribute('data-domain', this.domain);
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }
  }

  track(event: BaseEvent): void {
    if (typeof window === 'undefined') return;
    const plausible = (window as unknown as {
      plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
    }).plausible;
    plausible?.(event.name, { props: event.payload as Record<string, unknown> });
  }
}

/**
 * Console adapter — useful for local development.
 */
export class ConsoleAdapter implements AnalyticsAdapter {
  readonly name = 'console';

  track(event: BaseEvent): void {
    // eslint-disable-next-line no-console
    console.warn('[analytics]', event.name, event.payload);
  }
}
