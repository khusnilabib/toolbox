import type { BaseEvent } from '@packages/types';

/*
 * Analytics Queue — Per 17_AnalyticsArchitecture AD-03:
 * Events queued in memory (IndexedDB in production) before transmission.
 * Offline support: flush when network recovers.
 */

export class AnalyticsQueue {
  private queue: BaseEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private maxQueueSize: number;
  private flushIntervalMs: number;

  constructor(config: { maxQueueSize?: number; flushIntervalMs?: number } = {}) {
    this.maxQueueSize = config.maxQueueSize ?? 1000;
    this.flushIntervalMs = config.flushIntervalMs ?? 5000;
  }

  enqueue(event: BaseEvent): void {
    this.queue.push(event);
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift(); // Drop oldest
    }
  }

  startFlush(flushFn: (events: BaseEvent[]) => Promise<void>): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(async () => {
      if (this.queue.length === 0) return;
      const events = [...this.queue];
      this.queue = [];
      try {
        await flushFn(events);
      } catch {
        // Re-queue on failure
        this.queue.unshift(...events);
      }
    }, this.flushIntervalMs);
  }

  stopFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }

  flushNow(flushFn: (events: BaseEvent[]) => Promise<void>): Promise<void> {
    if (this.queue.length === 0) return Promise.resolve();
    const events = [...this.queue];
    this.queue = [];
    return flushFn(events);
  }
}
