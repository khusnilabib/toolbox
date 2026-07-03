import type { BaseEvent } from '@packages/types';

/*
 * Analytics Adapter Interface — Per DGA-02, 17_AnalyticsArchitecture AD-01:
 * Vendor-neutral adapter pattern. Each provider implements this interface.
 * Business logic emits canonical events; adapters translate to provider formats.
 */

export interface AnalyticsAdapterConfig {
  enabled: boolean;
  debug?: boolean;
  measurementId?: string;
  apiKey?: string;
  domain?: string;
}

export interface AnalyticsAdapter {
  readonly name: string;
  initialize(config: AnalyticsAdapterConfig): Promise<void>;
  emit(event: BaseEvent): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  reset(): void;
  isReady(): boolean;
}
