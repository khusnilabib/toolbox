# 12 — Tool Manifest Specification

> **Status:** 🟢 Approved (📋 Constitutional)
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-03 (Tool Engine), LOCK-05 (Plugin-Ready), LOCK-08 (SEO), LOCK-12 (Feature Lifecycle); PC-02 (Product Contract), PC-07 (Analytics), PC-09 (Discoverability), PC-10 (Product Scalability)

---

## 1. Purpose

This Tool Manifest Specification defines the **canonical schema** that every tool in [PROJECT_NAME] must implement. The ToolManifest is the single source of truth for a tool's identity, behavior, contract, and metadata. It is the aggregate root of the Tools Context (`03_DDD`), the contract for the Tool Registry (`05_ProjectStructure` AD-04), and the foundation for navigation, SEO, sitemap, search, admin inventory, and analytics configuration (PC-10).

The manifest is the most important schema in the platform. Every system that needs to know about a tool — routing, navigation, SEO, admin, analytics, search, future plugin marketplace — derives its data from the manifest. If the manifest is wrong, every downstream system is wrong. If the manifest is incomplete, downstream systems produce incomplete output. This document specifies the schema in enough detail that a tool author can write a correct manifest without consulting any other reference.

The manifest is also the **plugin contract** for the future Phase 4 marketplace. Third-party plugins will produce manifests following the same schema (with additional signing/sandboxing fields). Designing the schema comprehensively now ensures the plugin marketplace requires no schema changes later.

## 2. Scope

### 2.1 In Scope

- Complete ToolManifest TypeScript type definition.
- Field-by-field specification: type, required/optional, validation rules, example values.
- Zod schema for runtime validation.
- Manifest file structure and location.
- Build-time codegen contract: which manifest fields produce which generated artifacts.
- Manifest versioning strategy.
- Plugin manifest extensions (Phase 4 preview).

### 2.2 Out of Scope

- Tool stage implementations → `13_FBRD`, `14_ACD`.
- Tool folder structure → `07_FolderStructure` §Tool Folder Template.
- Specific tool manifests (Image Resizer, etc.) → `28_Backlog`.
- Admin UI for managing tools → `21_AdminSpecification`.
- SEO content standards → `18_SEOSpecification`.

## 3. Architectural Decisions

### AD-01 — Manifest is the Aggregate Root

**Context.** `03_DDD` AD-04 designates ToolManifest as the aggregate root of the Tools Context. This means the manifest is the single source of truth for a tool's identity and behavior. All other tool-related data (executions, history entries) reference the manifest but don't redefine it.

**Decision.** The ToolManifest is the aggregate root. It is a self-contained, serializable description of a tool. Any code producing a valid ToolManifest can be registered as a tool — first-party or third-party.

**Implements:** LOCK-05 (Plugin-Ready), `03_DDD` AD-04, PC-10 (Product Scalability).

### AD-02 — Manifest is Build-Time Consumed

**Context.** Runtime manifest parsing adds latency and complicates Edge deployment. Build-time codegen produces static typed files that Edge can serve with zero runtime cost.

**Decision.** The Tool Manifest is consumed at build time by `scripts/generate-registry.ts` (`05_ProjectStructure` AD-04). The script imports each `manifest.ts`, validates it against the Zod schema, and emits generated files (`registry.ts`, `navigation.ts`, `sitemap.ts`, `seo-meta.ts`, `admin-inventory.ts`, `types.ts`).

**Implements:** LOCK-05, PC-10, EC-07 (Performance Budget — no runtime cost).

### AD-03 — Manifest is Zod-Validated

**Context.** A malformed manifest produces broken downstream artifacts. Without validation, errors surface at runtime, not build time.

**Decision.** Every manifest is validated against a Zod schema at build time. Validation failures block the build. The Zod schema is the single source of truth; the TypeScript type is inferred from it.

**Implements:** EC-08 (Security by Default — input validation), EC-02 (One Source of Truth).

### AD-04 — Manifest is Versioned

**Context.** As the platform evolves, the manifest schema will need to change (new fields, renamed fields, removed fields). Without versioning, schema changes break existing tools silently.

**Decision.** Every manifest declares `manifestVersion` (e.g., `1.0.0`). Schema changes follow semver:
- **Patch (1.0.0 → 1.0.1):** bug fixes, no schema change.
- **Minor (1.0.0 → 1.1.0):** additive fields; existing manifests still valid.
- **Major (1.0.0 → 2.0.0):** breaking changes; existing manifests must be migrated.

The codegen script supports multiple manifest versions and migrates older manifests to the current internal representation.

**Implements:** EC-12 (Enterprise Readiness — stable contract evolution), LOCK-05 (Plugin-Ready — plugin compatibility).

### AD-05 — Manifest Encodes the Product Contract

**Context.** PC-02 mandates every tool has a product contract (purpose, inputs, outputs, validation, etc.). The contract must live somewhere; the manifest is the natural location.

**Decision.** The ToolManifest schema includes all PC-02 product contract fields. Tools without complete contracts fail manifest validation.

**Implements:** PC-02 (Product Contract), PC-10 (Product Scalability — contract drives codegen).

### AD-06 — Manifest Encodes Analytics Configuration

**Context.** PC-07 mandates every tool emits consistent analytics events. The manifest must declare which events the tool emits (beyond the standard 10 that the Tool Engine emits automatically).

**Decision.** The manifest's `analytics` field declares the tool's analytics configuration: standard events (always emitted by Tool Engine) plus any tool-specific custom events.

**Implements:** PC-07 (Analytics Standard), PC-10 (Product Scalability — analytics config derived from manifest).

### AD-07 — Manifest Encodes SEO Metadata

**Context.** LOCK-08 mandates every tool page has complete SEO metadata. The manifest must encode this metadata for codegen to consume.

**Decision.** The manifest's `seo` field encodes: title, description, keywords, canonical URL, Open Graph, Twitter Card, JSON-LD structured data, FAQ, breadcrumb, search intent.

**Implements:** LOCK-08 (SEO Constitution), PC-09 (Feature Discoverability — related tools for internal linking), PC-10 (Product Scalability — SEO derived from manifest).

### AD-08 — Manifest Encodes Related Tools

**Context.** PC-09 mandates every tool helps users discover additional tools. Related tools must be declared somewhere; the manifest is the natural location.

**Decision.** The manifest's `relatedTools` field is an array of tool slugs. The codegen generates bidirectional links (if tool A lists tool B as related, tool B's page shows tool A in "Related" — unless tool B explicitly excludes A).

**Implements:** PC-09 (Feature Discoverability), LOCK-08 (SEO — internal linking).

## 4. Design Principles

### P1 — Manifest is the Single Source of Truth
Anything not in the manifest is not part of the platform's understanding of the tool. No out-of-band configuration, no hardcoded tool lists, no manual registration.

### P2 — Manifest is Serializable
The manifest can be serialized to JSON (for plugin marketplace distribution, admin API responses, etc.). No functions in the manifest — only data. Stage implementations are referenced by import, not embedded.

### P3 — Manifest is Comprehensive
Every downstream system's needs are anticipated. If a new system needs manifest data, extend the schema via ADR rather than creating a parallel data source.

### P4 — Manifest is Validated
Zod schema validation at build time catches errors early. No manifest reaches production with missing required fields or invalid values.

### P5 — Manifest is Versioned
Schema evolution is governed by semver. Tools can be migrated gradually. Breaking changes require migration tooling.

### P6 — Manifest is Plugin-Ready
The schema is public and stable enough that third-party plugins can produce valid manifests. Phase 4 plugin marketplace extends the schema with signing/sandboxing fields, not replaces it.

## 5. ToolManifest Schema (Complete Definition)

### 5.1 TypeScript Type Definition

```typescript
// packages/tool-engine/src/types.ts

import type { ZodSchema } from 'zod';
import type { ComponentType } from 'react';

/**
 * The canonical ToolManifest schema.
 * Every tool MUST produce a manifest conforming to this type.
 *
 * @see /docs/12_ToolManifestSpecification.md
 */
export interface ToolManifest {
  // ─── Identity ───────────────────────────────────────────────
  manifestVersion: string;            // semver, e.g., "1.0.0"
  slug: string;                       // URL-safe, unique within category
  category: ToolCategory;             // 'image' | 'pdf' | 'developer' | ...
  title: string;                      // "Image Resizer"
  description: string;                // One-sentence description for SEO
  lifecycle: FeatureLifecycle;        // LOCK-12: 'concept' | 'planned' | ... | 'archived'
  version: string;                    // Tool's own version, semver

  // ─── Product Contract (PC-02) ──────────────────────────────
  purpose: string;                    // One-sentence: what the tool does
  userProblem: string;                // The problem the user is solving
  inputSchema: ZodSchema;             // Zod schema for input validation
  outputSchema: ZodSchema;            // Zod schema for output
  validationRules: ValidationRule[];  // Specific constraints (size, format, etc.)
  successCriteria: string;            // What constitutes success
  failureStates: FailureState[];      // Enumerated failure modes
  emptyStates: EmptyState[];          // UI states when no input
  loadingStates: LoadingState[];      // UI states during processing

  // ─── Execution (LOCK-02, LOCK-03) ──────────────────────────
  execution: 'browser' | 'server';    // LOCK-02 classification
  stages: ToolStages;                 // Stage implementations (imported, not serialized)

  // ─── SEO (LOCK-08) ─────────────────────────────────────────
  seo: ToolSEOConfig;

  // ─── Discoverability (PC-09) ───────────────────────────────
  relatedTools: string[];             // Slugs of related tools (min 3)
  suggestedWorkflows?: SuggestedWorkflow[];  // Optional, Phase 1+

  // ─── Analytics (PC-07) ─────────────────────────────────────
  analytics: ToolAnalyticsConfig;

  // ─── Limits & Constraints ──────────────────────────────────
  limits: ToolLimits;

  // ─── i18n (Phase 2+; English-only in Phase 1) ──────────────
  i18n?: ToolI18nConfig;

  // ─── Plugin Extensions (Phase 4) ───────────────────────────
  plugin?: PluginExtension;           // Only for third-party plugins
}

// ─── Supporting Types ────────────────────────────────────────

export type ToolCategory =
  | 'image'
  | 'pdf'
  | 'developer'
  | 'text'
  | 'converters'
  | 'seo'
  | 'calculators'
  | 'utility'
  | 'ai';                              // Phase 2+

export type FeatureLifecycle =
  | 'concept'
  | 'planned'
  | 'design'
  | 'development'
  | 'testing'
  | 'beta'
  | 'stable'
  | 'deprecated'
  | 'archived';

export type SearchIntent =
  | 'informational'                    // User wants to learn
  | 'transactional'                    // User wants to do something
  | 'navigational';                    // User is looking for a specific tool

export interface ValidationRule {
  field: string;                       // e.g., "file"
  type: 'required' | 'maxSize' | 'minSize' | 'format' | 'custom';
  value?: string | number;             // e.g., "10MB" for maxSize
  message: string;                     // User-facing error message
}

export interface FailureState {
  kind: 'validation' | 'processing' | 'quota_exceeded' | 'auth_required' | 'server_unavailable';
  cause: string;                       // Technical cause identifier
  userMessage: {
    what: string;                      // What happened (plain language)
    why?: string;                      // Why (if known)
    howToFix: string;                  // How to fix (actionable)
  };
}

export interface EmptyState {
  scenario: string;                    // e.g., "no_input", "no_result"
  title: string;
  description: string;
  cta?: { label: string; action: string };
}

export interface LoadingState {
  scenario: string;                    // e.g., "uploading", "processing", "downloading"
  title: string;
  description: string;
  estimatedDuration?: number;          // ms, for progress estimation
}

export interface ToolStages {
  input: InputStage<any>;              // Accepts raw input
  validation: ValidationStage<any>;    // Runs Zod validation
  processing: ProcessingStage<any, any>;  // Core tool logic
  preview: ComponentType<{ output: any }>;  // React component for preview
  download: DownloadStage<any>;        // Packages result for download
  history?: HistoryStage<any>;         // Optional: persists to user history
  share?: ShareStage<any>;             // Optional: generates share link/QR
}

export interface ToolSEOConfig {
  searchIntent: SearchIntent;
  title: string;                       // Full SEO title (≤60 chars)
  description: string;                 // Meta description (≤160 chars)
  keywords: string[];                  // Target keywords
  canonicalUrl: string;                // Canonical URL
  openGraph: {
    title: string;
    description: string;
    image: string;                     // URL to OG image
    type: 'website';
  };
  twitterCard: {
    card: 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
  structuredData: {
    '@type': 'SoftwareApplication';
    name: string;
    applicationCategory: string;
    operatingSystem: 'Web';
    offers: { '@type': 'Offer'; price: '0'; priceCurrency: 'USD' };
    aggregateRating?: {
      '@type': 'AggregateRating';
      ratingValue: string;
      ratingCount: number;
    };
  };
  faq: FAQItem[];                      // Min 3 Q&As per LOCK-08
  breadcrumb: BreadcrumbItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SuggestedWorkflow {
  name: string;                        // e.g., "Resize then Compress"
  steps: string[];                     // Slugs of tools in workflow
  description: string;
}

export interface ToolAnalyticsConfig {
  events: AnalyticsEventConfig[];      // Tool-specific events (beyond standard 10)
  funnelSteps: string[];               // Defines funnel for analytics dashboard
}

export interface AnalyticsEventConfig {
  name: string;                        // Event name (e.g., "tool_viewed")
  trigger: string;                     // When emitted
  payloadSchema: ZodSchema;            // Zod schema for payload
}

export interface ToolLimits {
  maxInputSize: number;                // bytes
  maxOutputSize: number;               // bytes
  maxProcessingTime: number;           // ms
  rateLimitPerUser?: number;           // requests per hour
  requiresAuth: boolean;               // If true, requires login
  premiumOnly: boolean;                // If true, requires premium
}

export interface ToolI18nConfig {
  defaultLocale: string;               // e.g., "en"
  supportedLocales: string[];          // e.g., ["en", "es", "fr"]
  translations: Record<string, {       // locale → translations
    title: string;
    description: string;
    faq: FAQItem[];
  }>;
}

export interface PluginExtension {
  publisher: string;                   // Publisher identifier
  signature: string;                   // Manifest signature (Phase 4)
  sandboxedExecution: boolean;         // If true, runs in sandbox
  supportedPlatformVersions: string;   // semver range
}
```

### 5.2 Zod Validation Schema

```typescript
// packages/tool-engine/src/manifest-schema.ts

import { z } from 'zod';

export const toolManifestSchema = z.object({
  // Identity
  manifestVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(50),
  category: z.enum([
    'image', 'pdf', 'developer', 'text',
    'converters', 'seo', 'calculators', 'utility', 'ai',
  ]),
  title: z.string().min(3).max(60),
  description: z.string().min(50).max(160),
  lifecycle: z.enum([
    'concept', 'planned', 'design', 'development',
    'testing', 'beta', 'stable', 'deprecated', 'archived',
  ]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),

  // Product Contract
  purpose: z.string().min(10).max(120),
  userProblem: z.string().min(20).max(300),
  inputSchema: z.any(),  // ZodSchema instance, validated at runtime
  outputSchema: z.any(),
  validationRules: z.array(z.object({
    field: z.string(),
    type: z.enum(['required', 'maxSize', 'minSize', 'format', 'custom']),
    value: z.union([z.string(), z.number()]).optional(),
    message: z.string(),
  })).min(1),
  successCriteria: z.string().min(10).max(200),
  failureStates: z.array(z.object({
    kind: z.enum(['validation', 'processing', 'quota_exceeded', 'auth_required', 'server_unavailable']),
    cause: z.string(),
    userMessage: z.object({
      what: z.string(),
      why: z.string().optional(),
      howToFix: z.string(),
    }),
  })).min(1),
  emptyStates: z.array(z.object({
    scenario: z.string(),
    title: z.string(),
    description: z.string(),
    cta: z.object({
      label: z.string(),
      action: z.string(),
    }).optional(),
  })).min(1),
  loadingStates: z.array(z.object({
    scenario: z.string(),
    title: z.string(),
    description: z.string(),
    estimatedDuration: z.number().optional(),
  })).min(1),

  // Execution
  execution: z.enum(['browser', 'server']),
  stages: z.object({
    input: z.any(),
    validation: z.any(),
    processing: z.any(),
    preview: z.any(),
    download: z.any(),
    history: z.any().optional(),
    share: z.any().optional(),
  }),

  // SEO
  seo: z.object({
    searchIntent: z.enum(['informational', 'transactional', 'navigational']),
    title: z.string().min(10).max(60),
    description: z.string().min(50).max(160),
    keywords: z.array(z.string()).min(3).max(10),
    canonicalUrl: z.string().url(),
    openGraph: z.object({
      title: z.string(),
      description: z.string(),
      image: z.string().url(),
      type: z.literal('website'),
    }),
    twitterCard: z.object({
      card: z.literal('summary_large_image'),
      title: z.string(),
      description: z.string(),
      image: z.string().url(),
    }),
    structuredData: z.object({
      '@type': z.literal('SoftwareApplication'),
      name: z.string(),
      applicationCategory: z.string(),
      operatingSystem: z.literal('Web'),
      offers: z.object({
        '@type': z.literal('Offer'),
        price: z.literal('0'),
        priceCurrency: z.literal('USD'),
      }),
      aggregateRating: z.object({
        '@type': z.literal('AggregateRating'),
        ratingValue: z.string(),
        ratingCount: z.number(),
      }).optional(),
    }),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).min(3),
    breadcrumb: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
    })).min(2),
  }),

  // Discoverability
  relatedTools: z.array(z.string()).min(3),
  suggestedWorkflows: z.array(z.object({
    name: z.string(),
    steps: z.array(z.string()).min(2),
    description: z.string(),
  })).optional(),

  // Analytics
  analytics: z.object({
    events: z.array(z.object({
      name: z.string(),
      trigger: z.string(),
      payloadSchema: z.any(),
    })),
    funnelSteps: z.array(z.string()).min(4),
  }),

  // Limits
  limits: z.object({
    maxInputSize: z.number().positive(),
    maxOutputSize: z.number().positive(),
    maxProcessingTime: z.number().positive(),
    rateLimitPerUser: z.number().positive().optional(),
    requiresAuth: z.boolean(),
    premiumOnly: z.boolean(),
  }),

  // i18n (optional in Phase 1)
  i18n: z.object({
    defaultLocale: z.string(),
    supportedLocales: z.array(z.string()).min(1),
    translations: z.record(z.string(), z.object({
      title: z.string(),
      description: z.string(),
      faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })),
    })),
  }).optional(),

  // Plugin Extension (Phase 4)
  plugin: z.object({
    publisher: z.string(),
    signature: z.string(),
    sandboxedExecution: z.boolean(),
    supportedPlatformVersions: z.string(),
  }).optional(),
});

export type ToolManifest = z.infer<typeof toolManifestSchema>;
```

## 6. Field-by-Field Specification

### 6.1 Identity Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `manifestVersion` | string | ✅ | semver regex | Schema version this manifest targets. |
| `slug` | string | ✅ | `^[a-z0-9-]+$`, 3-50 chars, unique within category | URL-safe identifier. |
| `category` | ToolCategory | ✅ | enum | Tool category for navigation. |
| `title` | string | ✅ | 3-60 chars | Human-readable title. |
| `description` | string | ✅ | 50-160 chars | One-sentence description for SEO. |
| `lifecycle` | FeatureLifecycle | ✅ | enum (9 values) | LOCK-12 lifecycle status. |
| `version` | string | ✅ | semver regex | Tool's own version (independent of manifest version). |

### 6.2 Product Contract Fields (PC-02)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `purpose` | string | ✅ | One-sentence statement of what the tool does. |
| `userProblem` | string | ✅ | The user's problem being solved. |
| `inputSchema` | ZodSchema | ✅ | Schema for input validation. |
| `outputSchema` | ZodSchema | ✅ | Schema for output validation. |
| `validationRules` | ValidationRule[] | ✅ | Specific constraints (size, format, etc.). |
| `successCriteria` | string | ✅ | What constitutes successful execution. |
| `failureStates` | FailureState[] | ✅ | Enumerated failure modes with PC-08-compliant messages. |
| `emptyStates` | EmptyState[] | ✅ | UI states when no input. |
| `loadingStates` | LoadingState[] | ✅ | UI states during processing. |

### 6.3 Execution Fields (LOCK-02, LOCK-03)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `execution` | 'browser' \| 'server' | ✅ | LOCK-02 classification. |
| `stages` | ToolStages | ✅ | Stage implementations (imported, not serialized). |
| `stages.input` | InputStage | ✅ | Accepts raw input. |
| `stages.validation` | ValidationStage | ✅ | Runs Zod validation. |
| `stages.processing` | ProcessingStage | ✅ | Core tool logic. |
| `stages.preview` | React ComponentType | ✅ | Renders result preview. |
| `stages.download` | DownloadStage | ✅ | Packages result for download. |
| `stages.history` | HistoryStage | ❌ | Optional: persists to user history. |
| `stages.share` | ShareStage | ❌ | Optional: generates share link/QR. |

### 6.4 SEO Fields (LOCK-08)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seo.searchIntent` | SearchIntent | ✅ | Informational / Transactional / Navigational. |
| `seo.title` | string | ✅ | SEO title (≤60 chars). |
| `seo.description` | string | ✅ | Meta description (≤160 chars). |
| `seo.keywords` | string[] | ✅ | 3-10 target keywords. |
| `seo.canonicalUrl` | string | ✅ | Canonical URL. |
| `seo.openGraph` | object | ✅ | Open Graph tags. |
| `seo.twitterCard` | object | ✅ | Twitter Card tags. |
| `seo.structuredData` | object | ✅ | JSON-LD SoftwareApplication schema. |
| `seo.faq` | FAQItem[] | ✅ | Min 3 Q&As. |
| `seo.breadcrumb` | BreadcrumbItem[] | ✅ | Min 2 items (Home → Category → Tool). |

### 6.5 Discoverability Fields (PC-09)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `relatedTools` | string[] | ✅ | Min 3 slugs of related tools. |
| `suggestedWorkflows` | SuggestedWorkflow[] | ❌ | Optional multi-tool workflows. |

### 6.6 Analytics Fields (PC-07)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `analytics.events` | AnalyticsEventConfig[] | ✅ | Tool-specific events (beyond standard 10). |
| `analytics.funnelSteps` | string[] | ✅ | Min 4 steps defining the conversion funnel. |

**Standard 10 events (emitted automatically by Tool Engine, not declared per-tool):**
1. `tool_viewed`
2. `tool_started`
3. `validation_failed`
4. `processing_started`
5. `processing_completed`
6. `download_attempted`
7. `download_completed`
8. `registration_prompt_viewed`
9. `registration_completed`
10. `tool_shared`

### 6.7 Limits Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `limits.maxInputSize` | number | ✅ | Max input size in bytes. |
| `limits.maxOutputSize` | number | ✅ | Max output size in bytes. |
| `limits.maxProcessingTime` | number | ✅ | Max processing time in ms. |
| `limits.rateLimitPerUser` | number | ❌ | Requests per hour per user. |
| `limits.requiresAuth` | boolean | ✅ | If true, requires login (rare per LOCK-07). |
| `limits.premiumOnly` | boolean | ✅ | If true, requires premium (PC-06: must be value-add, not core). |

### 6.8 i18n Fields (Phase 2+)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `i18n.defaultLocale` | string | ❌ (Phase 1) | Default locale code (e.g., "en"). |
| `i18n.supportedLocales` | string[] | ❌ (Phase 1) | Supported locale codes. |
| `i18n.translations` | Record<locale, translations> | ❌ (Phase 1) | Per-locale translations. |

### 6.9 Plugin Extension Fields (Phase 4)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plugin.publisher` | string | ❌ (Phase 4) | Publisher identifier. |
| `plugin.signature` | string | ❌ (Phase 4) | Manifest signature for verification. |
| `plugin.sandboxedExecution` | boolean | ❌ (Phase 4) | If true, runs in sandbox. |
| `plugin.supportedPlatformVersions` | string | ❌ (Phase 4) | semver range of compatible platform versions. |

## 7. Manifest File Location and Structure

### 7.1 File Location

Every tool's manifest lives at:
```
src/tools/[category]/[slug]/manifest.ts
```

Per `07_FolderStructure` §Tool Folder Template.

### 7.2 File Structure

```typescript
// src/tools/image/image-resize/manifest.ts

import { z } from 'zod';
import type { ToolManifest } from '@packages/tool-engine';
import { inputStage } from './stages/input';
import { validationStage } from './stages/validation';
import { processingStage } from './stages/processing';
import { Preview } from './stages/preview';
import { downloadStage } from './stages/download';
import { historyStage } from './stages/history';

const inputSchema = z.object({
  file: z.instanceof(File),
  width: z.number().min(1).max(10000),
  height: z.number().min(1).max(10000),
  maintainAspectRatio: z.boolean().default(true),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  sizeBytes: z.number(),
});

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug: 'image-resize',
  category: 'image',
  title: 'Image Resizer',
  description: 'Resize images to any dimensions instantly in your browser. Free, private, no upload required.',
  lifecycle: 'stable',
  version: '1.0.0',

  // Product Contract
  purpose: 'Resize an image to specific width and height dimensions.',
  userProblem: 'I need an image at a specific size for a profile picture, thumbnail, or print layout.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'file', type: 'required', message: 'Please upload an image.' },
    { field: 'file', type: 'maxSize', value: 10 * 1024 * 1024, message: 'Image must be under 10MB.' },
    { field: 'file', type: 'format', value: 'image/png|image/jpeg|image/webp', message: 'Supported formats: PNG, JPEG, WebP.' },
  ],
  successCriteria: 'Output image has the exact specified dimensions and same format as input.',
  failureStates: [
    {
      kind: 'validation',
      cause: 'file_too_large',
      userMessage: {
        what: 'Your image is too large to process.',
        why: 'The maximum file size is 10MB; your file is 25MB.',
        howToFix: 'Try the Image Compressor tool first to reduce its size, or use a smaller image.',
      },
    },
    // ... more failure states
  ],
  emptyStates: [
    {
      scenario: 'no_input',
      title: 'Upload an image to resize',
      description: 'Drag and drop an image, or click to browse. Your image stays on your device.',
      cta: { label: 'Choose Image', action: 'upload' },
    },
  ],
  loadingStates: [
    {
      scenario: 'processing',
      title: 'Resizing your image...',
      description: 'This usually takes less than a second.',
      estimatedDuration: 800,
    },
  ],

  // Execution
  execution: 'browser',
  stages: {
    input: inputStage,
    validation: validationStage,
    processing: processingStage,
    preview: Preview,
    download: downloadStage,
    history: historyStage,
  },

  // SEO
  seo: {
    searchIntent: 'transactional',
    title: 'Image Resizer - Free Online Image Resize Tool | [PROJECT_NAME]',
    description: 'Resize PNG, JPEG, and WebP images to any dimensions. Free, private, browser-based. No upload required. Try our fast image resizer.',
    keywords: ['image resizer', 'resize image', 'image dimensions', 'resize photo online'],
    canonicalUrl: 'https://example.com/tools/image/image-resize',
    openGraph: {
      title: 'Image Resizer - Free & Private',
      description: 'Resize images in your browser. No upload required.',
      image: 'https://example.com/og/image-resize.png',
      type: 'website',
    },
    twitterCard: {
      card: 'summary_large_image',
      title: 'Image Resizer - Free & Private',
      description: 'Resize images in your browser. No upload required.',
      image: 'https://example.com/og/image-resize.png',
    },
    structuredData: {
      '@type': 'SoftwareApplication',
      name: 'Image Resizer',
      applicationCategory: 'ImageProcessing',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    faq: [
      { question: 'Is this image resizer free?', answer: 'Yes, completely free with no registration required.' },
      { question: 'Are my images uploaded to a server?', answer: 'No. All processing happens in your browser. Your images never leave your device.' },
      { question: 'What image formats are supported?', answer: 'PNG, JPEG, and WebP. Use the Image Format Converter for other formats.' },
    ],
    breadcrumb: [
      { name: 'Home', url: 'https://example.com' },
      { name: 'Image Tools', url: 'https://example.com/tools/image' },
      { name: 'Image Resizer', url: 'https://example.com/tools/image/image-resize' },
    ],
  },

  // Discoverability
  relatedTools: ['image-compress', 'image-crop', 'image-format-convert'],

  // Analytics
  analytics: {
    events: [
      {
        name: 'aspect_ratio_toggled',
        trigger: 'User toggles maintain-aspect-ratio checkbox',
        payloadSchema: z.object({ enabled: z.boolean() }),
      },
    ],
    funnelSteps: ['tool_viewed', 'tool_started', 'processing_completed', 'download_completed'],
  },

  // Limits
  limits: {
    maxInputSize: 10 * 1024 * 1024,  // 10MB
    maxOutputSize: 10 * 1024 * 1024,  // 10MB
    maxProcessingTime: 30000,  // 30s
    requiresAuth: false,
    premiumOnly: false,
  },
};

export default manifest;
```

## 8. Build-Time Codegen Contract

The codegen script (`scripts/generate-registry.ts`) consumes each `manifest.ts` and produces the following generated artifacts. Each artifact's source manifest fields are documented.

### 8.1 `src/generated/registry.ts`

```typescript
// AUTO-GENERATED. Do not edit manually.
import type { ToolManifest } from '@packages/tool-engine';
import imageResize from '@/tools/image/image-resize/manifest';
import imageCompress from '@/tools/image/image-compress/manifest';
// ... all tool manifests

export const allManifests: ToolManifest[] = [imageResize, imageCompress, /* ... */];

export const registry = {
  bySlug: (slug: string) => allManifests.find(m => m.slug === slug),
  byCategory: (category: string) => allManifests.filter(m => m.category === category),
  relatedTo: (slug: string) => {
    const tool = allManifests.find(m => m.slug === slug);
    if (!tool) return [];
    return tool.relatedTools
      .map(s => allManifests.find(m => m.slug === s))
      .filter(Boolean);
  },
  all: () => allManifests,
};
```

**Source fields:** All manifest fields.

### 8.2 `src/generated/navigation.ts`

```typescript
// AUTO-GENERATED. Do not edit manually.
export const navigation = {
  image: [
    { slug: 'image-resize', title: 'Image Resizer', description: '...' },
    { slug: 'image-compress', title: 'Image Compressor', description: '...' },
    // ...
  ],
  pdf: [/* ... */],
  // ...
};
```

**Source fields:** `category`, `slug`, `title`, `description`.

### 8.3 `src/generated/sitemap.ts`

```typescript
// AUTO-GENERATED. Do not edit manually.
export const sitemapEntries = [
  {
    url: '/tools/image/image-resize',
    lastModified: '2026-06-28',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  // ...
];
```

**Source fields:** `category`, `slug`, `version` (for lastModified).

### 8.4 `src/generated/seo-meta.ts`

```typescript
// AUTO-GENERATED. Do not edit manually.
export const seoMeta: Record<string, {
  title: string;
  description: string;
  openGraph: object;
  twitterCard: object;
  structuredData: object;
  canonicalUrl: string;
}> = {
  '/tools/image/image-resize': {
    title: 'Image Resizer - Free Online Image Resize Tool | [PROJECT_NAME]',
    description: 'Resize PNG, JPEG, and WebP images...',
    openGraph: { /* ... */ },
    twitterCard: { /* ... */ },
    structuredData: { /* ... */ },
    canonicalUrl: 'https://example.com/tools/image/image-resize',
  },
  // ...
};
```

**Source fields:** All `seo.*` fields.

### 8.5 `src/generated/admin-inventory.ts`

```typescript
// AUTO-GENERATED. Do not edit manually.
export const adminInventory = [
  {
    slug: 'image-resize',
    title: 'Image Resizer',
    category: 'image',
    lifecycle: 'stable',
    version: '1.0.0',
    execution: 'browser',
    lastUpdated: '2026-06-28',
  },
  // ...
];
```

**Source fields:** `slug`, `title`, `category`, `lifecycle`, `version`, `execution`.

### 8.6 `src/generated/search-index.ts`

```typescript
// AUTO-GENERATED. Do not edit manually.
export const searchIndex = [
  {
    slug: 'image-resize',
    title: 'Image Resizer',
    description: 'Resize images to any dimensions...',
    keywords: ['image resizer', 'resize image', /* ... */],
    faq: [/* ... */],
  },
  // ...
];
```

**Source fields:** `slug`, `title`, `description`, `seo.keywords`, `seo.faq`.

### 8.7 `src/generated/analytics-config.ts`

```typescript
// AUTO-GENERATED. Do not edit manually.
export const analyticsConfig = [
  {
    slug: 'image-resize',
    standardEvents: ['tool_viewed', 'tool_started', /* ... 10 standard */],
    customEvents: [{ name: 'aspect_ratio_toggled', /* ... */ }],
    funnelSteps: ['tool_viewed', 'tool_started', 'processing_completed', 'download_completed'],
  },
  // ...
];
```

**Source fields:** `analytics.*`, `slug`.

## 9. Standards

### 9.1 Manifest Authoring Standards
- Every manifest follows the schema in §5.
- Every manifest is validated against the Zod schema at build time.
- Every manifest is committed to the repo (not generated at runtime).
- Every manifest declares `manifestVersion` for compatibility tracking.

### 9.2 Manifest Validation Standards
- Build fails on any validation error.
- CI runs `scripts/verify-registry.ts` to verify generated files match manifests.
- Pre-commit hook runs manifest validation.

### 9.3 Manifest Versioning Standards
- `manifestVersion` follows semver.
- Schema changes require corresponding `manifestVersion` bump.
- Migration tooling provided for major version bumps.

### 9.4 Manifest Immutability Standards
- Once a manifest is published (tool in `stable` lifecycle), its `slug` MUST NOT change.
- `category` changes require migration (URL redirects).
- Breaking schema changes require migration path for existing tools.

## 10. Best Practices

### 10.1 When Writing a Manifest
1. Start from the tool template (`scripts/tool-template/`).
2. Fill identity fields first (slug, category, title).
3. Define the product contract (purpose, userProblem, schemas).
4. Implement stages; reference them in `stages`.
5. Write SEO metadata (consult `18_SEOSpecification`).
6. Identify 3+ related tools.
7. Configure analytics (standard events are automatic; add custom if needed).
8. Set limits conservatively (can be relaxed later).
9. Validate locally: `pnpm gen:registry`.
10. Verify generated files are correct.

### 10.2 When Modifying a Manifest
- Bump `version` field for any change.
- Bump `manifestVersion` only for schema changes.
- Update `lifecycle` per LOCK-12.
- Update `seo.lastModified` implicitly via git.

### 10.3 When Reviewing a Manifest PR
- Verify all required fields present.
- Verify Zod schemas are valid.
- Verify SEO metadata meets `18_SEOSpecification`.
- Verify `relatedTools` has ≥3 entries.
- Verify `failureStates` messages meet PC-08 (what/why/how).
- Verify `limits` are reasonable.
- Verify generated files are updated.

## 11. Future Expansion

### 11.1 Schema Evolution
- Minor version bumps: additive fields (e.g., new optional field for collaboration tools).
- Major version bumps: breaking changes with migration tooling.
- All schema changes require ADR.

### 11.2 Plugin Marketplace (Phase 4)
- Plugins produce manifests with `plugin` extension fields.
- Plugin manifests are signed; signature verified at install.
- Plugin manifests declare `sandboxedExecution`; sandbox enforces API restrictions.
- Plugin manifests declare `supportedPlatformVersions`; compatibility checked.

### 11.3 Multi-Tenancy (Phase 3+)
- Manifests may gain `tenantId` field for tenant-specific tool configurations.
- Generated artifacts filter by tenant.

### 11.4 AI Tool Extensions (Phase 2+)
- AI tools extend manifest with `ai` field declaring model, prompt template, token limits.
- Standard manifest schema doesn't change; AI tools are a category with additional config.

## 12. Dependencies

### 12.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4, §5 — LOCKs, ECs, PCs the schema implements.
- Depends on `02_SAD` — Tool Engine contract the manifest encodes.
- Depends on `03_DDD` AD-04 — ToolManifest as aggregate root.
- Depends on `05_ProjectStructure` AD-04 — codegen pattern.
- `06_ArchitectureDecisionRecords` — ADR-055, ADR-060, ADR-062, ADR-063.
- `11_ProductConstitution` — PC-02, PC-07, PC-09, PC-10.
- `13_FBRD` — Per-feature requirements referencing manifest fields.
- `14_ACD` — Tool Engine component consuming the manifest.
- `18_SEOSpecification` — SEO field standards.
- `21_AdminSpecification` — Admin inventory from manifest.
- `22_DevelopmentGuideline` — PR workflow for manifest changes.

### 12.2 External Dependencies
- Zod (runtime validation).
- TypeScript (type inference from Zod).

### 12.3 Assumptions
- Manifest schema remains stable; changes require ADR.
- Build-time codegen remains the consumption pattern (no runtime registry service).

## 13. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Tool Manifest Specification. Defined complete TypeScript type, Zod validation schema, field-by-field specification, manifest file location and structure, build-time codegen contract for 7 generated artifacts, versioning strategy, plugin extension preview. |

## 14. Cross References

- `00_Project_Charter` §3 LOCK-03, LOCK-05, LOCK-08, LOCK-12; §5 PC-02, PC-07, PC-09, PC-10 — Implemented.
- `02_SAD` AD-02, AD-03 — Tool Engine and Registry consume the manifest.
- `03_DDD` AD-04 — ToolManifest as aggregate root.
- `05_ProjectStructure` AD-04 — Codegen pattern consuming manifests.
- `06_ArchitectureDecisionRecords` — ADR-055 (Product Contract), ADR-060 (Analytics), ADR-062 (Discoverability), ADR-063 (Product Scalability).
- `07_FolderStructure` §Tool Folder Template — Manifest file location.
- `08_CodingStandards` — Zod validation standards.
- `09_NamingConvention` — Slug naming rules.
- `11_ProductConstitution` — PC-02, PC-07, PC-09, PC-10 expanded.
- `13_FBRD` — Per-tool feature specs reference manifest fields.
- `14_ACD` — Tool Engine component uses manifest's `stages`.
- `15_UDS` — Tool page layout uses manifest's `seo` and `relatedTools`.
- `18_SEOSpecification` — SEO field standards.
- `21_AdminSpecification` — Admin inventory from manifest.
- `22_DevelopmentGuideline` — PR workflow for manifest changes.
- `25_AI_Guideline` — AI must follow manifest schema (LOCK-09, EC-11).
- `28_Backlog` — Every backlog tool's manifest follows this spec.
