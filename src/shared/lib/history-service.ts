// src/shared/lib/history-service.ts — Tool history service (best-effort, local-only by default).

import { generateId } from '@packages/utils';

export interface HistoryEntry<T = unknown> {
  id: string;
  slug: string;
  timestamp: number;
  input: T;
  output?: unknown;
  meta?: Record<string, unknown>;
}

export interface HistoryProvider {
  list(slug?: string, limit?: number): Promise<HistoryEntry[]>;
  add(entry: Omit<HistoryEntry, 'id' | 'timestamp'> & Partial<Pick<HistoryEntry, 'id' | 'timestamp'>>): Promise<HistoryEntry>;
  remove(id: string): Promise<void>;
  clear(slug?: string): Promise<void>;
}

/**
 * In-memory history provider — useful when no persistence is desired.
 */
export class MemoryHistoryProvider implements HistoryProvider {
  private entries: HistoryEntry[] = [];

  async list(slug?: string, limit = 50): Promise<HistoryEntry[]> {
    const filtered = slug ? this.entries.filter((e) => e.slug === slug) : this.entries;
    return filtered.slice(-limit).reverse();
  }

  async add(entry: Omit<HistoryEntry, 'id' | 'timestamp'> & Partial<Pick<HistoryEntry, 'id' | 'timestamp'>>): Promise<HistoryEntry> {
    const next: HistoryEntry = {
      id: entry.id ?? generateId('hist'),
      timestamp: entry.timestamp ?? Date.now(),
      slug: entry.slug,
      input: entry.input,
      output: entry.output,
      meta: entry.meta,
    };
    this.entries.push(next);
    if (this.entries.length > 500) this.entries.shift();
    return next;
  }

  async remove(id: string): Promise<void> {
    this.entries = this.entries.filter((e) => e.id !== id);
  }

  async clear(slug?: string): Promise<void> {
    if (!slug) {
      this.entries = [];
      return;
    }
    this.entries = this.entries.filter((e) => e.slug !== slug);
  }
}

let provider: HistoryProvider | null = null;

export function getHistoryProvider(): HistoryProvider {
  if (!provider) provider = new MemoryHistoryProvider();
  return provider;
}

export function setHistoryProvider(p: HistoryProvider): void {
  provider = p;
}
