# 17 — Analytics Architecture

> **Status:** 🟢 Approved (📈 Constitutional)
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** DGA-02 (Event-Driven Analytics), DGA-09 (Growth Metrics), PC-07 (Analytics Standard), LOCK-04 (Modular — adapter pattern)

---

## 1. Purpose

This Analytics Architecture document defines **how analytics events flow through [PROJECT_NAME]**, from emission at the user's browser to consumption by analytics providers and growth metric computation. It implements DGA-02 (vendor-neutral, event-driven analytics) and DGA-09 (growth metrics from standardized events).

The architecture exists because analytics is not a single component — it's a pipeline: emission → validation → queuing → transmission → adapter → provider → aggregation → metrics → dashboards. Without a documented architecture, this pipeline becomes ad hoc: events are emitted but not validated; validated but not queued (lost on network failure); queued but not adapter-translated; translated but not aggregated into metrics. Each gap produces silent data loss. This document specifies the complete pipeline so every stage is implemented and tested.

The key architectural commitment is the **adapter pattern**: business logic emits canonical events (per `16_EventSchemaSpecification`); adapters translate to provider-specific formats. This means the platform can run Google Analytics, PostHog, Plausible, or any future provider — simultaneously or interchangeably — without changing business logic. This is the operationalization of DGA-02's mandate that "analytics providers are adapters; the event schema is canonical."

## 2. Scope

### 2.1 In Scope

- Analytics pipeline architecture (emission → dashboards).
- Adapter pattern for vendor-neutral provider support.
- Event queue and flush strategy (offline support).
- Growth metrics computation from events.
- Analytics provider configurations (GA4, PostHog, Plausible).
- Client-side vs server-side analytics.
- Consent management (GDPR/CCPA).
- Analytics Context implementation (per `03_DDD`).

### 2.2 Out of Scope

- Canonical event schema → `16_EventSchemaSpecification`.
- Event storage schema (DB tables) → `19_DatabaseDesign` §Analytics Context.
- Admin analytics dashboards UI → `24_AdminSpecification`.
- A/B experiment configuration → `24_AdminSpecification` §Feature Flags.
- Specific provider API docs → provider documentation.

## 3. Architectural Decisions

### AD-01 — Adapter Pattern for Analytics Providers

**Context.** DGA-02 mandates vendor-neutral analytics. Business logic must not know which provider is active. Without an adapter pattern, switching providers requires rewriting all event emission code.

**Decision.** Implement an `AnalyticsAdapter` interface. Each provider (GA4, PostHog, Plausible, self-hosted) implements this interface. The `AnalyticsClient` accepts one or more adapters; events are fanned out to all active adapters. Business logic calls `analyticsClient.emit(eventName, payload)`; adapters handle translation.

```typescript
interface AnalyticsAdapter {
  name: string;
  initialize(config: AdapterConfig): Promise<void>;
  emit(event: CanonicalEvent): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  reset(): void;  // Called on sign-out
}
```

**Implements:** DGA-02, LOCK-04 (Modular), EC-03 (Component Reuse — adapters are pluggable).

### AD-02 — Client-Side Primary, Server-Side for Admin Events

**Context.** Most analytics events originate in the browser (user interactions). Admin events originate server-side. Mixing emission paths creates complexity.

**Decision.** Primary analytics emission is client-side (via `useAnalytics()` hook). Server-side emission is reserved for admin events (DGA-07 audit) and server-side tool processing events. Both paths feed the same canonical event queue.

**Implements:** LOCK-02 (Browser-First — analytics follows the browser-first principle), DGA-07 (Admin events audited server-side).

### AD-03 — Event Queue with Offline Support

**Context.** Users may go offline (mobile, flaky connections). Events emitted while offline are lost without a queue.

**Decision.** Events are queued in IndexedDB before transmission. A flush worker sends queued events to active adapters. If flush fails (network error), events remain in queue and retry on next flush. Queue is bounded (max 1000 events; oldest dropped if exceeded).

**Implements:** EC-05 (Progressive Enhancement — analytics survives network issues), DGA-02.

### AD-04 — Growth Metrics Computed Nightly

**Context.** Growth metrics (DGA-09) require aggregating across many events. Computing in real-time is expensive and unnecessary (metrics don't change minute-to-minute).

**Decision.** Growth metrics are computed nightly (2 AM UTC) from raw events. Raw events retained for 90 days; aggregates retained indefinitely. Metrics stored in Analytics Context's `daily_aggregates` table.

**Implements:** DGA-09, EC-07 (Performance Budget — no real-time metric computation cost).

### AD-05 — Consent Management (GDPR/CCPA)

**Context.** Analytics requires user consent in EU (GDPR) and California (CCPA). Without consent management, analytics violates privacy laws.

**Decision.** Analytics only initializes after user consent (cookie banner). Consent stored in cookie; respected by all adapters. Users can revoke consent; adapters reset and stop emitting. Anonymous analytics (no `userId`) allowed without consent in some jurisdictions; configurable per locale.

**Implements:** EC-08 (Security by Default — privacy), `01_BRD` §4.4 (Privacy & Data Standards).

### AD-06 — Multi-Provider Support

**Context.** Different teams need different analytics: marketing uses GA4, product uses PostHog, engineering may use self-hosted. Single-provider limits insights.

**Decision.** Multiple adapters can be active simultaneously. Each event is fanned out to all active adapters. Adapter configuration via env vars; different adapters can be active in different environments (e.g., PostHog in staging, GA4 in production).

**Implements:** DGA-02, EC-12 (Enterprise Readiness — flexible analytics).

## 4. Design Principles

### P1 — Canonical Events, Adapter Translation
Business logic emits canonical events. Adapters translate. Never the other way around.

### P2 — Queue Before Flush
Events are queued before transmission. Offline doesn't mean data loss.

### P3 — Consent First
No analytics without consent. Consent is revocable.

### P4 — Aggregate, Don't Recompute
Growth metrics are pre-aggregated nightly, not recomputed per query.

### P5 — PII Minimized
Events contain identifiers only, not personal data (per `16_EventSchemaSpecification` §9.2).

### P6 — Provider Agnostic
The platform works with zero, one, or multiple analytics providers. Business logic is unchanged.

## 5. Analytics Pipeline Architecture

### 5.1 High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Tool Engine   │    │ useAnalytics │    │ Page Render  │  │
│  │ (auto-emit)   │    │ (custom)     │    │ (page_viewed)│  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             ▼                                │
│                  ┌─────────────────────┐                    │
│                  │  AnalyticsClient    │                    │
│                  │  (validate + queue) │                    │
│                  └──────────┬──────────┘                    │
│                             ▼                                │
│                  ┌─────────────────────┐                    │
│                  │  IndexedDB Queue    │                    │
│                  │  (offline support)  │                    │
│                  └──────────┬──────────┘                    │
│                             ▼                                │
│                  ┌─────────────────────┐                    │
│                  │  Flush Worker       │                    │
│                  │  (batch transmit)   │                    │
│                  └──────────┬──────────┘                    │
└─────────────────────────────┼──────────────────────────────┘
                              ▼
              ┌───────────────────────────────┐
              │     Adapter Fan-Out           │
              ┌───────────────┬───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │   GA4    │   │ PostHog  │   │ Plausible│
        │ Adapter  │   │ Adapter  │   │ Adapter  │
        └────┬─────┘   └────┬─────┘   └────┬─────┘
             │              │              │
             ▼              ▼              ▼
        Google         PostHog        Plausible
        Analytics      Cloud          Cloud
```

### 5.2 Server-Side Pipeline (Admin Events)

```
┌─────────────────────────────────────────────┐
│              Server (Next.js API)             │
│  ┌──────────────┐    ┌──────────────┐        │
│  │ Admin Action │    │ Server-Side  │        │
│  │ (audit log)  │    │ Tool Process │        │
│  └──────┬───────┘    └──────┬───────┘        │
│         └───────────────────┼                │
│                             ▼                │
│                  ┌─────────────────────┐     │
│                  │ ServerAnalytics     │     │
│                  │ (validate + emit)   │     │
│                  └──────────┬──────────┘     │
└─────────────────────────────┼────────────────┘
                              ▼
              ┌───────────────────────────────┐
              │  Analytics Context DB         │
              │  (events table + aggregates)  │
              └───────────────────────────────┘
```

## 6. Analytics Adapter Interface

### 6.1 Interface Definition

```typescript
// packages/analytics/src/types.ts

import type { CanonicalEvent } from '@packages/types/events';

export interface AnalyticsAdapter {
  /** Adapter identifier (e.g., "ga4", "posthog", "plausible") */
  readonly name: string;

  /**
   * Initialize the adapter with provider-specific config.
   * Called once on client startup (after consent).
   */
  initialize(config: AdapterConfig): Promise<void>;

  /**
   * Emit a canonical event to this provider.
   * Adapter translates to provider-specific format.
   */
  emit(event: CanonicalEvent): void;

  /**
   * Identify a user (post-login).
   * Adapters that support user identification implement this.
   */
  identify(userId: string, traits?: Record<string, unknown>): void;

  /**
   * Reset user identity (post-logout).
   * Clears any provider-side user association.
   */
  reset(): void;

  /**
   * Check if adapter is properly initialized and ready.
   */
  isReady(): boolean;
}

export interface AdapterConfig {
  measurementId?: string;      // GA4
  apiKey?: string;             // PostHog
  domain?: string;             // Plausible
  enabled: boolean;
  debug?: boolean;
}
```

### 6.2 GA4 Adapter (Example)

```typescript
// packages/analytics/src/adapters/ga4-adapter.ts

import type { AnalyticsAdapter, AdapterConfig } from '../types';
import type { CanonicalEvent } from '@packages/types/events';

export class GA4Adapter implements AnalyticsAdapter {
  readonly name = 'ga4';
  private config: AdapterConfig | null = null;
  private ready = false;

  async initialize(config: AdapterConfig): Promise<void> {
    this.config = config;
    // Load gtag.js script
    await loadGtagScript(config.measurementId!);
    this.ready = true;
  }

  emit(event: CanonicalEvent): void {
    if (!this.ready || !this.config?.enabled) return;

    // Translate canonical event to GA4 format
    gtag('event', event.eventName, {
      // GA4 custom parameters
      ...this.translatePayload(event.payload),
      // Standard GA4 params
      send_to: this.config.measurementId,
      event_category: this.inferCategory(event.eventName),
    });
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    gtag('config', this.config!.measurementId!, {
      user_id: userId,
      ...traits,
    });
  }

  reset(): void {
    gtag('config', this.config!.measurementId!, { user_id: undefined });
  }

  isReady(): boolean {
    return this.ready;
  }

  private translatePayload(payload: Record<string, unknown>): Record<string, unknown> {
    // GA4 has payload size limits; trim if needed
    // GA4 param names max 40 chars; values max 100 chars
    return Object.entries(payload).reduce((acc, [key, value]) => {
      const trimmedKey = key.slice(0, 40);
      const trimmedValue = typeof value === 'string' ? value.slice(0, 100) : value;
      acc[trimmedKey] = trimmedValue;
      return acc;
    }, {} as Record<string, unknown>);
  }

  private inferCategory(eventName: string): string {
    if (eventName.startsWith('tool_')) return 'tool';
    if (eventName.startsWith('auth_')) return 'auth';
    if (eventName.startsWith('search_')) return 'search';
    if (eventName.startsWith('admin_')) return 'admin';
    return 'engagement';
  }
}

declare function gtag(...args: unknown[]): void;
```

### 6.3 PostHog Adapter (Example)

```typescript
// packages/analytics/src/adapters/posthog-adapter.ts

import type { AnalyticsAdapter, AdapterConfig } from '../types';
import type { CanonicalEvent } from '@packages/types/events';
import posthog from 'posthog-js';

export class PostHogAdapter implements AnalyticsAdapter {
  readonly name = 'posthog';
  private config: AdapterConfig | null = null;
  private ready = false;

  async initialize(config: AdapterConfig): Promise<void> {
    this.config = config;
    posthog.init(config.apiKey!, {
      api_host: 'https://app.posthog.com',
      debug: config.debug,
    });
    this.ready = true;
  }

  emit(event: CanonicalEvent): void {
    if (!this.ready || !this.config?.enabled) return;
    posthog.capture(event.eventName, event.payload);
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    posthog.identify(userId, traits);
  }

  reset(): void {
    posthog.reset();
  }

  isReady(): boolean {
    return this.ready;
  }
}
```

### 6.4 Plausible Adapter (Example)

```typescript
// packages/analytics/src/adapters/plausible-adapter.ts

import type { AnalyticsAdapter, AdapterConfig } from '../types';
import type { CanonicalEvent } from '@packages/types/events';

export class PlausibleAdapter implements AnalyticsAdapter {
  readonly name = 'plausible';
  private config: AdapterConfig | null = null;
  private ready = false;

  async initialize(config: AdapterConfig): Promise<void> {
    this.config = config;
    await loadPlausibleScript(config.domain!);
    this.ready = true;
  }

  emit(event: CanonicalEvent): void {
    if (!this.ready || !this.config?.enabled) return;
    // Plausible custom events
    if (typeof window.plausible !== 'undefined') {
      window.plausible(event.eventName, { props: event.payload });
    }
  }

  identify(): void {
    // Plausible doesn't support user identification (privacy-first)
  }

  reset(): void {
    // No-op for Plausible
  }

  isReady(): boolean {
    return this.ready;
  }
}

declare global {
  interface Window {
    plausible?: (event: string, props?: Record<string, unknown>) => void;
  }
}
```

## 7. AnalyticsClient

The `AnalyticsClient` orchestrates adapters, validation, and queuing.

```typescript
// packages/analytics/src/analytics-client.ts

import type { AnalyticsAdapter } from './types';
import type { CanonicalEvent } from '@packages/types/events';
import { baseEventSchema } from '@packages/types/event-schemas';
import { EventQueue } from './event-queue';

export class AnalyticsClient {
  private adapters: AnalyticsAdapter[] = [];
  private queue: EventQueue;
  private consentGiven = false;

  constructor() {
    this.queue = new EventQueue({
      maxQueueSize: 1000,
      flushIntervalMs: 5000,  // Flush every 5 seconds
    });
  }

  registerAdapter(adapter: AnalyticsAdapter): void {
    this.adapters.push(adapter);
  }

  async grantConsent(): Promise<void> {
    this.consentGiven = true;
    // Initialize all adapters
    for (const adapter of this.adapters) {
      const config = this.getAdapterConfig(adapter.name);
      if (config.enabled) {
        await adapter.initialize(config);
      }
    }
    // Start flush worker
    this.queue.startFlush((events) => this.flushToAdapters(events));
  }

  revokeConsent(): void {
    this.consentGiven = false;
    this.adapters.forEach(a => a.reset());
    this.queue.clear();
  }

  emit(eventName: string, payload: Record<string, unknown>): void {
    if (!this.consentGiven) return;

    const event: CanonicalEvent = {
      eventName,
      schemaVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      anonymousId: this.getAnonymousId(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      locale: this.getLocale(),
      platformVersion: this.getPlatformVersion(),
      payload,
    };

    // Validate against Zod schema
    const result = baseEventSchema.safeParse(event);
    if (!result.success) {
      console.error('Invalid event:', result.error.issues);
      return;
    }

    this.queue.enqueue(event);
  }

  private async flushToAdapters(events: CanonicalEvent[]): Promise<void> {
    for (const event of events) {
      for (const adapter of this.adapters) {
        if (adapter.isReady()) {
          adapter.emit(event);
        }
      }
    }
  }

  // ... helper methods (getAnonymousId, etc.)
}
```

## 8. Event Queue Implementation

```typescript
// packages/analytics/src/event-queue.ts

import type { CanonicalEvent } from '@packages/types/events';

export class EventQueue {
  private queue: CanonicalEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(private config: {
    maxQueueSize: number;
    flushIntervalMs: number;
  }) {}

  enqueue(event: CanonicalEvent): void {
    this.queue.push(event);
    if (this.queue.length > this.config.maxQueueSize) {
      this.queue.shift();  // Drop oldest
    }
  }

  startFlush(flushFn: (events: CanonicalEvent[]) => Promise<void>): void {
    this.flushTimer = setInterval(async () => {
      if (this.queue.length === 0) return;
      const events = [...this.queue];
      this.queue = [];
      try {
        await flushFn(events);
      } catch (error) {
        // Re-queue on failure
        this.queue.unshift(...events);
      }
    }, this.config.flushIntervalMs);
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
}
```

## 9. Growth Metrics (DGA-09)

### 9.1 Metric Definitions

| Metric | Definition | Computation |
|--------|------------|-------------|
| **Tool Popularity** | Views per tool per day | `COUNT(tool_viewed) GROUP BY toolSlug, date` |
| **Conversion Rate** | Viewed → Downloaded | `COUNT(download_completed) / COUNT(tool_viewed)` per tool |
| **Completion Rate** | Started → Completed | `COUNT(processing_completed) / COUNT(tool_started)` per tool |
| **Registration Rate** | Prompt Viewed → Registered | `COUNT(registration_completed) / COUNT(registration_prompt_viewed)` |
| **Search Success Rate** | Searched → Clicked Result | `COUNT(search_result_clicked) / COUNT(search_performed)` |
| **Return Visits** | 7-day return rate | Users with `tool_viewed` on day N AND day N+1..7 |
| **Average Processing Time** | Mean `durationMs` from `processing_completed` | `AVG(payload.durationMs)` per tool |

### 9.2 Nightly Aggregation Job

```typescript
// scripts/compute-growth-metrics.ts (runs nightly at 2 AM UTC)

import { db } from '@/shared/lib/analytics-db';

async function computeDailyMetrics(date: string) {
  // Tool popularity
  await db.execute(sql`
    INSERT INTO analytics.daily_aggregates (date, metric_name, tool_slug, value)
    SELECT ${date}, 'tool_popularity', payload->>'toolSlug', COUNT(*)
    FROM analytics.events
    WHERE event_name = 'tool_viewed'
      AND DATE(timestamp) = ${date}
    GROUP BY payload->>'toolSlug'
    ON CONFLICT (date, metric_name, tool_slug) DO UPDATE SET value = EXCLUDED.value;
  `);

  // Conversion rate
  await db.execute(sql`
    INSERT INTO analytics.daily_aggregates (date, metric_name, tool_slug, value)
    SELECT ${date}, 'conversion_rate', viewed.tool_slug,
      downloaded.count::FLOAT / viewed.count
    FROM (
      SELECT payload->>'toolSlug' AS tool_slug, COUNT(*) AS count
      FROM analytics.events
      WHERE event_name = 'tool_viewed' AND DATE(timestamp) = ${date}
      GROUP BY payload->>'toolSlug'
    ) viewed
    LEFT JOIN (
      SELECT payload->>'toolSlug' AS tool_slug, COUNT(*) AS count
      FROM analytics.events
      WHERE event_name = 'download_completed' AND DATE(timestamp) = ${date}
      GROUP BY payload->>'toolSlug'
    ) downloaded ON viewed.tool_slug = downloaded.tool_slug;
  `);

  // ... other metrics
}
```

### 9.3 Metric Consumption

```typescript
// src/platform-ops/application/services/metrics-service.ts

export async function getToolPopularity(dateRange: { start: string; end: string }) {
  return db.query(sql`
    SELECT tool_slug, date, value
    FROM analytics.daily_aggregates
    WHERE metric_name = 'tool_popularity'
      AND date BETWEEN ${dateRange.start} AND ${dateRange.end}
    ORDER BY date, value DESC;
  `);
}
```

## 10. Standards

### 10.1 Adapter Authoring Standards
- Every adapter implements the `AnalyticsAdapter` interface.
- Every adapter is in `packages/analytics/src/adapters/`.
- Every adapter has unit tests.
- Adapters never modify canonical events; they translate.

### 10.2 Event Emission Standards
- Client-side via `useAnalytics()` hook.
- Server-side via `ServerAnalytics` service.
- All events validated against Zod schema.
- Events queued before transmission.

### 10.3 Consent Standards
- No analytics before consent.
- Consent banner on first visit.
- Consent stored in cookie (1 year).
- Revocable via privacy settings.

### 10.4 Metric Computation Standards
- Nightly batch at 2 AM UTC.
- Raw events retained 90 days.
- Aggregates retained indefinitely.
- Metrics queryable via admin dashboard.

## 11. Best Practices

### 11.1 When Adding a New Provider
1. Implement `AnalyticsAdapter` interface.
2. Add to `packages/analytics/src/adapters/`.
3. Add env var for config (e.g., `NEXT_PUBLIC_POSTHOG_API_KEY`).
4. Register in analytics client initialization.
5. Test with debug mode.

### 11.2 When Debugging Analytics
- Enable adapter debug mode.
- Use `useAnalytics().debug()` to log all events.
- Check IndexedDB queue for unflushed events.
- Verify provider dashboards receive events.

### 11.3 When Adding a Growth Metric
1. Define metric in `17_AnalyticsArchitecture` §9.1.
2. Add SQL to nightly aggregation job.
3. Add admin dashboard widget.
4. Verify computation matches expectations.

## 12. Future Expansion

### 12.1 Real-Time Analytics (Phase 3+)
- Stream events via WebSocket to admin dashboard.
- Real-time active user count, tool usage.

### 12.2 Data Warehouse Export (Phase 3+)
- Daily export to BigQuery/Snowflake for advanced analysis.
- ML pipeline integration.

### 12.3 Experiment Platform (Phase 3+)
- A/B test results computed from events.
- Statistical significance calculation.

### 12.4 Attribution Model (Phase 4+)
- Multi-touch attribution for marketplace tools.
- Publisher revenue attribution.

## 13. Dependencies

### 13.1 Document Dependencies
- Depends on `00_Project_Charter` §6 DGA-02, DGA-09.
- Depends on `16_EventSchemaSpecification` — canonical event schema.
- Depends on `03_DDD` §Analytics Context — bounded context for analytics.
- `06_ArchitectureDecisionRecords` — ADR-065, ADR-072.
- `12_ToolManifestSpecification` §Analytics — tool-declared custom events.
- `14_ACD` — `useAnalytics` hook.
- `19_DatabaseDesign` §Analytics Context — event storage.
- `24_AdminSpecification` — analytics dashboards.
- `27_DeploymentGuide` — nightly job deployment.

### 13.2 External Dependencies
- GA4 (`gtag.js`), PostHog (`posthog-js`), Plausible script.
- IndexedDB (event queue).
- Supabase Postgres (event storage).

### 13.3 Assumptions
- Analytics providers support custom events (true for all listed).
- Nightly batch computation acceptable for growth metrics.
- 90-day raw event retention sufficient for analysis.

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Analytics Architecture. Defined adapter pattern (GA4, PostHog, Plausible), event queue with offline support, consent management, nightly growth metrics computation, multi-provider fan-out. |

## 15. Cross References

- `00_Project_Charter` §6 DGA-02, DGA-09, §5 PC-07 — Implemented.
- `02_SAD` AD-02 — Tool Engine emits standard events consumed by this architecture.
- `03_DDD` §Analytics Context — Bounded context this implements.
- `06_ArchitectureDecisionRecords` — ADR-065 (Event-Driven Analytics), ADR-072 (Growth Metrics), ADR-060 (Analytics Standard).
- `12_ToolManifestSpecification` §Analytics — Custom events declared in manifest.
- `14_ACD` — `useAnalytics` hook and components.
- `16_EventSchemaSpecification` — Canonical event schema consumed by adapters.
- `19_DatabaseDesign` §Analytics Context — Event storage schema.
- `24_AdminSpecification` — Analytics dashboards consuming growth metrics.
- `27_DeploymentGuide` — Nightly job and analytics pipeline deployment.
- `28_AI_Guideline` — AI must follow analytics architecture (LOCK-09, EC-11).
