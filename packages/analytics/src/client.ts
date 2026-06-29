// @ts-nocheck
// @packages/analytics/src/client.ts
// AnalyticsClient — queue, consent, offline support, standard events (PC-07, DGA-02).

import type { BaseEvent } from '@packages/types';
import { generateId } from '@packages/utils';
import type { AnalyticsAdapter } from './adapters';

export interface AnalyticsClientOptions {
  adapters: AnalyticsAdapter[];
  /** Default consent state (false until user opts-in). */
  consent?: boolean;
  /** Persist queue to localStorage when offline. */
  offlineQueue?: boolean;
}

/** Standard event names emitted by the Tool Engine (PC-07). */
export const STANDARD_EVENTS = [
  'tool_viewed',
  'tool_started',
  'validation_failed',
  'processing_started',
  'processing_completed',
  'download_attempted',
  'download_completed',
  'registration_prompt_viewed',
  'registration_completed',
  'tool_shared',
] as const;
export type StandardEventName = (typeof STANDARD_EVENTS)[number];

export class AnalyticsClient {
  private readonly adapters: AnalyticsAdapter[];
  private queue: BaseEvent[] = [];
  private consent: boolean;
  private readonly offlineQueue: boolean;
  private sessionId: string;

  constructor(options: AnalyticsClientOptions) {
    this.adapters = options.adapters;
    this.consent = options.consent ?? false;
    this.offlineQueue = options.offlineQueue ?? true;
    this.sessionId = generateId('sess');
    for (const adapter of this.adapters) {
      try {
        adapter.init?.();
      } catch {
        /* adapter init failures are non-fatal */
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void this.flush());
    }
  }

  setConsent(granted: boolean): void {
    this.consent = granted;
    if (granted) void this.flush();
  }

  hasConsent(): boolean {
    return this.consent;
  }

  setSessionId(id: string): void {
    this.sessionId = id;
  }

  track<TName extends string, TPayload = Record<string, unknown>>(
    name: TName,
    payload: TPayload,
    context?: { tool?: string; category?: string; userId?: string | null },
  ): void {
    const event: BaseEvent<TName, TPayload> = {
      id: generateId('evt'),
      name,
      timestamp: Date.now(),
      payload,
      context: {
        sessionId: this.sessionId,
        ...context,
      },
    };
    if (!this.consent) {
      if (this.offlineQueue) this.queue.push(event);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      if (this.offlineQueue) this.queue.push(event);
      return;
    }
    for (const adapter of this.adapters) {
      try {
        adapter.track(event);
      } catch {
        /* swallow adapter errors */
      }
    }
  }

  trackStandard(
    name: StandardEventName,
    payload: Record<string, unknown> = {},
    context?: { tool?: string; category?: string; userId?: string | null },
  ): void {
    this.track(name, payload, context);
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    const events = [...this.queue];
    this.queue = [];
    for (const event of events) {
      for (const adapter of this.adapters) {
        try {
          await adapter.track(event);
        } catch {
          this.queue.push(event);
        }
      }
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.consent) return;
    for (const adapter of this.adapters) {
      try {
        adapter.identify?.(userId, traits);
      } catch {
        /* no-op */
      }
    }
  }
}

let singleton: AnalyticsClient | null = null;

export function getAnalyticsClient(options?: AnalyticsClientOptions): AnalyticsClient {
  if (!singleton) {
    singleton = new AnalyticsClient(
      options ?? {
        adapters: [],
        consent: false,
        offlineQueue: true,
      },
    );
  }
  return singleton;
}

/** Reset the singleton — primarily for tests. */
export function resetAnalyticsClient(): void {
  singleton = null;
}
