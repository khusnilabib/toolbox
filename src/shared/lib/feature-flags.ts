// src/shared/lib/feature-flags.ts — Feature flag service (DGA-06).

import type { FeatureFlag } from '@packages/types';

type FlagListener = (flag: FeatureFlag) => void;

/**
 * In-memory feature flag service with env overrides and subscribe hooks.
 * Persistence is optional (localStorage when in browser).
 */
export class FeatureFlagService {
  private flags = new Map<string, FeatureFlag>();
  private listeners = new Set<FlagListener>();

  constructor(initial: FeatureFlag[] = []) {
    for (const flag of initial) this.flags.set(flag.key, flag);
  }

  register(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    this.notify(flag);
  }

  isEnabled(key: string): boolean {
    // Env override takes precedence.
    if (typeof process !== 'undefined') {
      const envValue = process.env[`FEATURE_${key.toUpperCase().replace(/-/g, '_')}`];
      if (envValue === 'true') return true;
      if (envValue === 'false') return false;
    }
    return this.flags.get(key)?.enabled ?? false;
  }

  get(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  all(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  setEnabled(key: string, enabled: boolean): void {
    const existing = this.flags.get(key);
    if (!existing) return;
    const next: FeatureFlag = { ...existing, enabled };
    this.flags.set(key, next);
    this.notify(next);
  }

  /**
   * Evaluate a flag for a specific user using the rollout percentage.
   * Deterministic per (key, userId) pair.
   */
  evaluate(key: string, userId?: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;
    if (!flag.enabled) return false;
    if (flag.rolloutPercentage === undefined || flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;
    if (!userId) return Math.random() * 100 < flag.rolloutPercentage;
    const hash = simpleHash(`${key}:${userId}`);
    return hash % 100 < flag.rolloutPercentage;
  }

  subscribe(listener: FlagListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(flag: FeatureFlag): void {
    for (const listener of this.listeners) {
      try {
        listener(flag);
      } catch {
        /* listeners must not throw the engine */
      }
    }
  }
}

function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

let singleton: FeatureFlagService | null = null;

export function getFeatureFlagService(): FeatureFlagService {
  if (!singleton) {
    singleton = new FeatureFlagService([
      { key: 'admin-console', enabled: true, description: 'Admin console visibility' },
      { key: 'history-persistence', enabled: true, description: 'Persist tool history locally' },
      { key: 'share-links', enabled: true, description: 'Generate shareable links for tools' },
      { key: 'analytics-consent-banner', enabled: true, description: 'Show analytics consent banner' },
    ]);
  }
  return singleton;
}
