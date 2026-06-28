# 16 — Event Schema Specification

> **Status:** 🟢 Approved (📈 Constitutional)
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** DGA-02 (Event-Driven Analytics), PC-07 (Analytics Standard), LOCK-04 (Modular — adapter pattern)

---

## 1. Purpose

This Event Schema Specification defines the **canonical analytics event schema** for [PROJECT_NAME]. It is the single source of truth for every analytics event emitted by the platform. All analytics providers (Google Analytics, PostHog, Plausible, self-hosted) consume events in this canonical format; provider-specific adapters translate to each provider's API (per DGA-02).

The event schema exists because without a canonical schema, analytics fragments. One team emits `tool_viewed`, another emits `pageView`, another emits `tool_view` — and cross-tool analytics becomes impossible. PC-07 mandates every tool emits consistent events; DGA-02 mandates vendor-neutral analytics. This document delivers both by defining the canonical event schema that all tools and all providers adhere to.

This schema is the foundation for growth metrics (DGA-09), funnel analysis, A/B experiments (DGA-06), and the future plugin marketplace attribution (DGA-10). Every system that needs to know what users do — analytics dashboards, growth metrics, experiment results, admin insights — derives its data from events conforming to this schema.

## 2. Scope

### 2.1 In Scope

- Canonical event type definitions (ToolEvent, PageEvent, AuthEvent, SearchEvent, AdminEvent).
- Event field specifications (required, optional, types, validation).
- Zod validation schemas for runtime validation.
- Event naming conventions.
- Event payload constraints (size, PII).
- Standard event catalog (the mandatory events per PC-07).
- Custom event extension pattern.
- Event versioning strategy.

### 2.2 Out of Scope

- Analytics provider adapter implementations → `17_AnalyticsArchitecture`.
- Growth metric computation from events → `17_AnalyticsArchitecture` §Growth Metrics.
- Event storage schema (Analytics Context DB tables) → `19_DatabaseDesign`.
- Admin analytics dashboards → `24_AdminSpecification`.
- A/B experiment configuration → `24_AdminSpecification` §Feature Flags.

## 3. Architectural Decisions

### AD-01 — Canonical Event Schema is the Single Source of Truth

**Context.** Without a canonical schema, each team and each analytics provider defines events differently. Cross-tool analysis becomes impossible; switching providers requires rewriting business logic.

**Decision.** This document defines the canonical event schema. All events emitted by the platform conform to this schema. Analytics providers are adapters that translate canonical events to provider-specific formats. Business logic emits canonical events only; it never knows which provider(s) are active.

**Implements:** DGA-02, EC-02 (One Source of Truth), LOCK-04 (Modular — adapter pattern).

### AD-02 — Events are Zod-Validated

**Context.** Malformed events (missing required fields, wrong types) break analytics pipelines silently. Without validation, errors surface in dashboards as missing data, not at emission time.

**Decision.** Every event is validated against a Zod schema at emission time. Validation failures are logged (not silently dropped) and the event is corrected or rejected. The Zod schema is the single source of truth; TypeScript types are inferred.

**Implements:** EC-08 (Security by Default — input validation), EC-02.

### AD-03 — Events are Vendor-Neutral

**Context.** Different analytics providers have different event models (GA4 uses events with parameters; PostHog uses events with properties; Plausible uses simple custom events). Hardcoding to one model creates lock-in.

**Decision.** Canonical events use a neutral format: `eventName` + `payload` (object). Adapters translate to provider-specific formats. Multiple providers can be active simultaneously (e.g., GA4 for marketing, PostHog for product analytics).

**Implements:** DGA-02, EC-12 (Enterprise Readiness — no vendor lock-in).

### AD-04 — Events are Versioned

**Context.** Event schemas evolve over time (new fields, renamed fields). Without versioning, schema changes break historical data analysis.

**Decision.** Every event includes a `schemaVersion` field (semver). Schema changes follow semver: patch (bug fix), minor (additive field), major (breaking change with migration). Analytics Context stores events with their schema version; migrations handle historical data.

**Implements:** DGA-08 (API Evolution — events are internal API), EC-12.

### AD-05 — Events Minimize PII

**Context.** Analytics events often end up in third-party systems (GA, PostHog). PII in events creates privacy and compliance risks (GDPR, CCPA).

**Decision.** Events contain only `userId` (if authenticated) or `anonymousId` (cookie-based). No emails, names, IP addresses, file contents, or input data in event payloads. User-identifiable data is joined at analysis time via Identity Context, never embedded in events.

**Implements:** EC-08 (Security by Default), `01_BRD` §4.4 (Privacy & Data Standards).

### AD-06 — Standard Events are Auto-Emitted by Tool Engine

**Context.** PC-07 mandates 10 standard events per tool. If tools emit these manually, they'll be inconsistent or missing.

**Decision.** The Tool Engine (`02_SAD` AD-02) automatically emits the 10 standard events at lifecycle stage transitions. Tool authors don't write analytics code for standard events; they only declare tool-specific custom events in the manifest.

**Implements:** PC-07, DGA-02, EC-02 (One Source of Truth — standard events emitted once at engine level).

## 4. Design Principles

### P1 — Canonical Schema is Binding
All events conform to this schema. Deviations fail validation and are rejected.

### P2 — Vendor-Neutral by Construction
Events don't know which provider will receive them. Adapters handle translation.

### P3 — PII Minimized
Events contain identifiers only, not personal data. Joins happen at analysis time.

### P4 — Versioned from Day 1
Every event carries its schema version. Historical data remains analyzable after schema evolution.

### P5 — Standard Events are Automatic
Tool Engine emits the 10 standard events. Tool authors declare only custom events.

### P6 — Events are Typed End-to-End
Zod schema → TypeScript type → adapter → provider. No untyped event payloads.

## 5. Canonical Event Schema

### 5.1 Base Event Structure

Every event in the platform conforms to this base structure:

```typescript
// packages/types/src/events.ts

import type { z } from 'zod';

/**
 * Base event structure. All specific event types extend this.
 */
export interface BaseEvent {
  // ─── Event Identity ───────────────────────────────────────
  eventName: string;                    // Canonical event name (snake_case)
  schemaVersion: string;                // semver, e.g., "1.0.0"
  timestamp: string;                    // ISO 8601 UTC

  // ─── User Identity (PII minimized) ────────────────────────
  userId?: string;                      // If authenticated (UUID)
  anonymousId: string;                  // Cookie-based anonymous ID

  // ─── Session & Context ────────────────────────────────────
  sessionId: string;                    // Browsing session ID
  locale: string;                       // e.g., "en-US"
  referrer?: string;                    // Referring URL
  userAgent?: string;                   // Parsed UA (browser, OS)
  viewport?: { width: number; height: number };

  // ─── Platform Context ─────────────────────────────────────
  platformVersion: string;              // Platform release version
  featureFlags?: Record<string, boolean | string>;  // Active flags

  // ─── Payload (event-specific) ─────────────────────────────
  payload: Record<string, unknown>;     // Validated by event-specific Zod schema
}
```

### 5.2 Zod Base Schema

```typescript
// packages/types/src/event-schemas.ts

import { z } from 'zod';

export const baseEventSchema = z.object({
  eventName: z.string().regex(/^[a-z][a-z0-9_]*$/),
  schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  timestamp: z.string().datetime(),
  userId: z.string().uuid().optional(),
  anonymousId: z.string().min(1),
  sessionId: z.string().min(1),
  locale: z.string().min(2),
  referrer: z.string().url().optional(),
  userAgent: z.string().optional(),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }).optional(),
  platformVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  featureFlags: z.record(z.string(), z.union([z.boolean(), z.string()])).optional(),
  payload: z.record(z.string(), z.unknown()),
});
```

### 5.3 Event Naming Conventions

- **Format:** `snake_case` (e.g., `tool_viewed`, not `toolViewed` or `tool-viewed`).
- **Tense:** Past tense for completed actions (`tool_viewed`, `processing_completed`).
- **Structure:** `[subject]_[action]` (e.g., `tool_viewed`, `user_registered`, `search_performed`).
- **Prefixes:** Domain prefix for clarity (`tool_`, `auth_`, `search_`, `admin_`, `page_`).
- **No abbreviations:** `tool_viewed` not `tool_view`; `registration_completed` not `reg_done`.

## 6. Standard Event Catalog (PC-07)

These 10 events are mandatory for every tool, auto-emitted by the Tool Engine.

### 6.1 `tool_viewed`

**Trigger:** User lands on a tool page.

**Payload:**
```typescript
{
  toolSlug: string;           // e.g., "image-resize"
  toolCategory: string;       // e.g., "image"
  toolLifecycle: string;      // e.g., "stable"
  referrer: string;           // Where user came from
  searchQuery?: string;       // If arrived via search
}
```

### 6.2 `tool_started`

**Trigger:** User begins input (uploads file, types text, adjusts params).

**Payload:**
```typescript
{
  toolSlug: string;
  inputType: 'file' | 'text' | 'params' | 'url';
  inputSizeBytes?: number;    // For file inputs
}
```

### 6.3 `validation_failed`

**Trigger:** Input validation fails on submit.

**Payload:**
```typescript
{
  toolSlug: string;
  field: string;              // Which field failed
  errorKind: 'required' | 'maxSize' | 'minSize' | 'format' | 'custom';
  errorMessage: string;       // User-facing message
}
```

### 6.4 `processing_started`

**Trigger:** Processing stage begins.

**Payload:**
```typescript
{
  toolSlug: string;
  executionMode: 'browser' | 'server';
  inputSummary: {
    sizeBytes?: number;
    type?: string;
    dimensions?: { width: number; height: number };
  };
}
```

### 6.5 `processing_completed`

**Trigger:** Processing stage completes successfully.

**Payload:**
```typescript
{
  toolSlug: string;
  durationMs: number;         // Processing time
  outputSummary: {
    sizeBytes?: number;
    type?: string;
    dimensions?: { width: number; height: number };
  };
  success: true;
}
```

### 6.6 `download_attempted`

**Trigger:** User clicks download or copy button.

**Payload:**
```typescript
{
  toolSlug: string;
  outputFormat: string;       // e.g., "png", "pdf", "txt"
  downloadMethod: 'file' | 'clipboard';
}
```

### 6.7 `download_completed`

**Trigger:** Download or copy succeeds.

**Payload:**
```typescript
{
  toolSlug: string;
  outputSizeBytes: number;
  downloadMethod: 'file' | 'clipboard';
  durationMs: number;         // Time from attempt to completion
}
```

### 6.8 `registration_prompt_viewed`

**Trigger:** Registration prompt shown to guest user.

**Payload:**
```typescript
{
  toolSlug: string;
  trigger: 'after_download' | 'history_save_attempt' | 'favorite_attempt' | 'cloud_sync_attempt';
  guestToolsUsedCount: number;  // How many tools used in 7 days
}
```

### 6.9 `registration_completed`

**Trigger:** User completes registration.

**Payload:**
```typescript
{
  toolSlug: string;           // Tool where registration happened
  method: 'email' | 'google' | 'github';
  durationMs: number;         // Time from prompt to completion
}
```

### 6.10 `tool_shared`

**Trigger:** User shares a tool (link copy, social share).

**Payload:**
```typescript
{
  toolSlug: string;
  shareMethod: 'link_copy' | 'twitter' | 'facebook' | 'linkedin' | 'email';
}
```

## 7. Additional Event Types

Beyond the 10 standard tool events, the platform emits these events:

### 7.1 Page Events

```typescript
// Page view (non-tool pages)
{
  eventName: 'page_viewed';
  payload: {
    path: string;             // URL path
    pageType: 'home' | 'category' | 'blog' | 'article' | 'about' | 'pricing' | 'auth';
    title: string;
  };
}
```

### 7.2 Search Events

```typescript
// User performs search
{
  eventName: 'search_performed';
  payload: {
    query: string;
    resultCount: number;
    resultsShown: number;
  };
}

// User clicks search result
{
  eventName: 'search_result_clicked';
  payload: {
    query: string;
    clickedToolSlug: string;
    position: number;          // Position in results
  };
}
```

### 7.3 Auth Events

```typescript
{
  eventName: 'user_signed_in';
  payload: { method: 'email' | 'google' | 'github' };
}

{
  eventName: 'user_signed_out';
  payload: Record<string, never>;
}

{
  eventName: 'user_password_reset_requested';
  payload: { emailDomain: string };  // Domain only, not full email
}
```

### 7.4 Admin Events (Audited per DGA-07)

```typescript
{
  eventName: 'admin_tool_published';
  payload: {
    toolSlug: string;
    previousLifecycle: string;
    newLifecycle: string;
  };
}

{
  eventName: 'admin_tool_deprecated';
  payload: { toolSlug: string; successorSlug?: string };
}

{
  eventName: 'admin_seo_updated';
  payload: { toolSlug: string; fieldsChanged: string[] };
}

{
  eventName: 'admin_user_role_changed';
  payload: { targetUserId: string; previousRole: string; newRole: string };
}

{
  eventName: 'admin_settings_modified';
  payload: { settingKey: string; previousValue: unknown; newValue: unknown };
}

{
  eventName: 'admin_feature_flag_toggled';
  payload: { flagKey: string; previousValue: unknown; newValue: unknown };
}
```

### 7.5 Feature Flag Events (DGA-06)

```typescript
{
  eventName: 'feature_flag_evaluated';
  payload: {
    flagKey: string;
    userId?: string;
    anonymousId: string;
    variant: string | boolean;
    reason: 'default' | 'targeted' | 'experiment';
  };
}
```

## 8. Custom Event Extension Pattern

Tools may declare tool-specific custom events in their manifest (per `12_ToolManifestSpecification` §Analytics).

### 8.1 Custom Event Declaration

```typescript
// In tool's manifest.ts
analytics: {
  events: [
    {
      name: 'aspect_ratio_toggled',
      trigger: 'User toggles maintain-aspect-ratio checkbox',
      payloadSchema: z.object({
        enabled: z.boolean(),
      }),
    },
  ],
  funnelSteps: ['tool_viewed', 'tool_started', 'processing_completed', 'download_completed'],
},
```

### 8.2 Custom Event Emission

```typescript
// In tool's component
import { useAnalytics } from '@/shared/hooks/use-analytics';

function AspectRatioToggle() {
  const analytics = useAnalytics();

  const handleToggle = (enabled: boolean) => {
    analytics.emit('aspect_ratio_toggled', { enabled });
    // ... tool logic
  };

  // ...
}
```

### 8.3 Custom Event Validation

Custom events are validated against their declared Zod schema at emission time. Invalid payloads are logged and rejected.

## 9. Event Payload Constraints

### 9.1 Size Limits
- Max payload size: 10KB (JSON-serialized).
- Larger data referenced by ID (e.g., `toolSlug` not full manifest).

### 9.2 PII Restrictions
- ❌ No email addresses.
- ❌ No names.
- ❌ No IP addresses.
- ❌ No file contents.
- ❌ No input data (user's text, image data, etc.).
- ✅ `userId` (UUID) — joinable via Identity Context.
- ✅ `anonymousId` (cookie-based) — for session tracking.
- ✅ Aggregated/anonymized data (e.g., `inputSizeBytes`, `durationMs`).

### 9.3 Data Types
- Strings: UTF-8, max 1000 chars.
- Numbers: finite, non-NaN.
- Booleans: true/false only.
- Arrays: max 100 items.
- Nested objects: max depth 3.

## 10. Standards

### 10.1 Event Authoring Standards
- Every event follows the base structure (§5.1).
- Every event has a Zod schema for its payload.
- Event names follow naming conventions (§5.3).
- Events minimize PII (§9.2).

### 10.2 Event Emission Standards
- Standard events (10) auto-emitted by Tool Engine.
- Custom events emitted via `useAnalytics()` hook.
- Events validated at emission; failures logged.
- Events queued in IndexedDB if network unavailable; flushed async.

### 10.3 Event Versioning Standards
- `schemaVersion` follows semver.
- Minor version bumps: additive fields.
- Major version bumps: breaking changes with migration.
- Historical events retain their schema version in storage.

### 10.4 Event Storage Standards
- Raw events stored for 90 days.
- Daily aggregates stored indefinitely.
- Events stored in Analytics Context (`03_DDD`).
- Events exportable for data warehouse integration (Phase 3+).

## 11. Best Practices

### 11.1 When Adding a New Event
1. Check if an existing event covers the case.
2. If new: define event name, payload schema, trigger.
3. Add to event catalog in this document.
4. Implement Zod schema.
5. Emit via `useAnalytics()` or Tool Engine.
6. Add to growth metrics if relevant (DGA-09).

### 11.2 When Modifying an Event
- Bump `schemaVersion`.
- Additive changes (new optional fields): minor version.
- Breaking changes (removed fields, semantic changes): major version + migration.
- Update this document via PR.

### 11.3 When Debugging Events
- Use `useAnalytics().debug()` to log all events to console.
- Check IndexedDB queue for unflushed events.
- Verify Zod validation passes.
- Check provider adapter logs.

## 12. Future Expansion

### 12.1 Real-Time Streaming (Phase 3+)
- Events streamed to analytics pipeline via WebSocket or SSE.
- Enables real-time dashboards and alerting.

### 12.2 Event Sourcing for Critical Domains (Phase 4+)
- Admin actions event-sourced for full audit reconstruction.
- Recovery via event replay.

### 12.3 Cross-Platform Events (Phase 3+)
- Mobile app (React Native) emits same canonical events.
- Browser extension emits same canonical events.
- Unified analytics across all touchpoints.

### 12.4 ML-Ready Event Stream (Phase 4+)
- Events formatted for ML pipelines (feature extraction).
- Recommendation engine consumes event stream.

## 13. Dependencies

### 13.1 Document Dependencies
- Depends on `00_Project_Charter` §6 DGA-02 — source of canonical event schema mandate.
- Depends on `02_SAD` AD-02 — Tool Engine emits standard events.
- Depends on `12_ToolManifestSpecification` §Analytics — manifest declares custom events.
- `06_ArchitectureDecisionRecords` — ADR-065 (Event-Driven Analytics), ADR-072 (Growth Metrics).
- `17_AnalyticsArchitecture` — Implements adapter pattern consuming these events.
- `19_DatabaseDesign` §Analytics Context — Stores events.
- `24_AdminSpecification` — Admin events and analytics dashboards.

### 13.2 External Dependencies
- Zod (runtime validation).
- TypeScript (type inference).

### 13.3 Assumptions
- Event schema remains stable; changes via semver.
- Analytics providers support custom events (true for GA4, PostHog, Plausible).

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Event Schema Specification. Defined canonical base event structure, Zod validation, 10 standard PC-07 events, additional event types (page, search, auth, admin, feature flag), custom event extension pattern, payload constraints, PII minimization rules, versioning strategy. |

## 15. Cross References

- `00_Project_Charter` §6 DGA-02, §5 PC-07 — Implemented.
- `02_SAD` AD-02 — Tool Engine auto-emits standard events.
- `03_DDD` §Analytics Context — Event storage and aggregation.
- `06_ArchitectureDecisionRecords` — ADR-065 (Event-Driven Analytics), ADR-072 (Growth Metrics), ADR-060 (Analytics Standard).
- `12_ToolManifestSpecification` §Analytics — Custom event declaration.
- `14_ACD` — `useAnalytics` hook for emitting events.
- `17_AnalyticsArchitecture` — Adapters consuming these events.
- `19_DatabaseDesign` §Analytics Context — Event storage schema.
- `24_AdminSpecification` — Admin events, analytics dashboards.
- `27_DeploymentGuide` — Event pipeline deployment.
- `28_AI_Guideline` — AI must follow event schema (LOCK-09, EC-11).
