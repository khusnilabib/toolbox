// src/shared/hooks/use-analytics.ts — React bindings for the analytics client.
//
// NOTE: the `'use client'` directive MUST be the first statement in this file
// (only comments may precede it). Moving any import above it silently breaks
// the client boundary.

'use client';

import type { AnalyticsAdapter } from '@packages/analytics';
import { useCallback, useEffect, useState } from 'react';
import {
  AnalyticsClient,
  type AnalyticsClientOptions,
  getAnalyticsClient,
  ConsoleAdapter,
  GA4Adapter,
  PlausibleAdapter,
  STANDARD_EVENTS,
  type StandardEventName,
} from '@packages/analytics';

let initialisedClient: AnalyticsClient | null = null;

function ensureClient(): AnalyticsClient {
  if (initialisedClient) return initialisedClient;
  const adapters: AnalyticsAdapter[] = [];
  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (ga4Id) adapters.push(new GA4Adapter(ga4Id));
  if (plausibleDomain) adapters.push(new PlausibleAdapter(plausibleDomain));
  if (adapters.length === 0) adapters.push(new ConsoleAdapter());
  const options: AnalyticsClientOptions = {
    adapters,
    consent: process.env.NEXT_PUBLIC_ANALYTICS_CONSENT_DEFAULT === 'true',
    offlineQueue: true,
  };
  initialisedClient = getAnalyticsClient(options);
  return initialisedClient;
}

/**
 * Access the singleton analytics client and bind it to React lifecycle.
 */
export function useAnalytics() {
  const client = ensureClient();

  const track = useCallback(
    <TName extends string, TPayload = Record<string, unknown>>(
      name: TName,
      payload: TPayload,
      context?: { tool?: string; category?: string; userId?: string | null },
    ) => {
      client.track(name, payload, context);
    },
    [client],
  );

  const trackStandard = useCallback(
    (name: StandardEventName, payload: Record<string, unknown> = {}, context?: { tool?: string; category?: string }) => {
      client.trackStandard(name, payload, context);
    },
    [client],
  );

  return { track, trackStandard, client, standardEvents: STANDARD_EVENTS };
}

/**
 * Consent hook — exposes current consent state and a setter.
 */
export function useConsent() {
  const client = ensureClient();
  const [consent, setConsentState] = useState<boolean>(client.hasConsent());

  useEffect(() => {
    setConsentState(client.hasConsent());
  }, [client]);

  const setConsent = useCallback(
    (granted: boolean) => {
      client.setConsent(granted);
      setConsentState(granted);
    },
    [client],
  );

  return { consent, setConsent };
}
