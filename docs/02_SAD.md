# 02 — Software Architecture Document (SAD)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.2.0
> **Implements:** LOCK-02 (Browser-First), LOCK-03 (Tool Engine), LOCK-04 (Modular Architecture), LOCK-05 (Plugin-Ready), LOCK-06 (Database Optional); EC-05 (Progressive Enhancement), EC-07 (Performance Budget), EC-08 (Security by Default); PC-02 (Product Contract), PC-03 (Completion Standard), PC-05 (UX Consistency), PC-10 (Product Scalability)

---

## 1. Purpose

This Software Architecture Document defines the technical architecture of [PROJECT_NAME] — a browser-first productivity ecosystem. It translates the Architectural Locks in `00_Project_Charter` §3 into concrete system structure: layers, components, data flow, deployment topology, and the cross-cutting mechanisms (Tool Engine, Registry, Graceful Degradation) that make the platform scalable from 30 tools to 1,000+ tools without major restructuring.

This document is the authoritative technical reference. Every implementation choice — folder layout, file boundaries, server vs. client decisions, dependency choices — must trace back to a decision recorded here or in its companion documents (`03_DDD`, `04_TechStack`, `05_ProjectStructure`). When a future engineer asks "why is it built this way?", the answer lives in this SAD or in the Architectural Locks it implements.

The SAD is deliberately technology-agnostic at the architectural level. Specific technology choices (Next.js, Supabase, Drizzle, etc.) are justified in `04_TechStack`. The SAD defines *the shape*; `04_TechStack` defines *the materials*; `05_ProjectStructure` defines *the floor plan*.

## 2. Scope

### 2.1 In Scope

- Layered architecture definition (Presentation, Application, Domain, Infrastructure).
- The **Tool Engine** — the standardized lifecycle every tool follows (LOCK-03).
- The **Tool Registry** — the manifest-driven discovery system (LOCK-05).
- Browser-first vs. server-side decision matrix (LOCK-02).
- Graceful degradation strategy when database/services are unavailable (LOCK-06).
- Deployment topology (Vercel Edge + Supabase + browser).
- Cross-cutting concerns: authentication, RBAC, observability, error handling.
- Scalability strategy from 30 to 1,000+ tools.

### 2.2 Out of Scope

- Specific database schema and table definitions → `13_DatabaseDesign`.
- Specific API endpoint definitions and request/response shapes → `14_APIConvention`.
- Specific folder and file naming conventions → `06_FolderStructure`.
- Specific UI component library and design tokens → `09_DesignSystem`, `11_ACD`.
- Specific deployment CI/CD pipeline → `21_DeploymentGuide`.
- Specific testing strategy and tooling → `20_TestingStrategy`.

## 3. Architectural Decisions

This section records the architectural decisions (ADs) that shape the system. Each decision includes context, decision, consequences, and the lock(s) it implements.

### AD-01 — Layered Architecture with Strict Boundary Enforcement

**Context.** The platform must support hundreds to thousands of tools, each independently developed, while sharing common infrastructure (auth, routing, SEO, admin). Without strict layering, tools tend to reach into infrastructure directly, creating coupling that makes future changes expensive.

**Decision.** The system is organized into four layers with strict dependency rules:

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer  (React components, pages, layouts)  │
│  ↓ depends on                                             │
├─────────────────────────────────────────────────────────┤
│  Application Layer    (Tool Engine, hooks, server actions)│
│  ↓ depends on                                             │
├─────────────────────────────────────────────────────────┤
│  Domain Layer         (Bounded contexts, entities, schemas)│
│  ↓ depends on                                             │
├─────────────────────────────────────────────────────────┤
│  Infrastructure Layer (DB, Auth, Storage, External APIs) │
└─────────────────────────────────────────────────────────┘
```

**Dependency rules:**
- Presentation → Application → Domain → Infrastructure (one-way).
- A tool's Presentation Layer MUST NOT import from Infrastructure directly.
- A tool's Domain Layer MUST NOT import React or Next.js.
- Infrastructure Layer is the ONLY layer allowed to talk to databases, external APIs, and file systems.

**Consequences.**
- ✅ Tools remain isolated; infrastructure changes don't ripple into tool code.
- ✅ Domain logic is unit-testable without React/Next.js.
- ⚠️ Slightly more files per feature (Presentation + Application + Domain split).
- ⚠️ Requires discipline in code review to enforce boundaries.

**Implements:** LOCK-04 (Modular Architecture), EC-02 (One Source of Truth — each layer owns its concerns).

### AD-02 — Tool Engine as Standardized Lifecycle Pipeline

**Context.** LOCK-03 mandates that every tool follows the lifecycle: Input → Validation → Processing → Preview → Download → History → Share. Without a typed, reusable engine, each tool reimplements this lifecycle inconsistently, leading to divergent UX and duplicated logic (violating LOCK-09).

**Decision.** Define a `ToolEngine<TInput, TOutput>` abstraction in the Application Layer that orchestrates the lifecycle. Every tool implements a manifest describing its lifecycle stages; the engine executes them.

```
ToolEngine<TInput, TOutput>
├── InputStage      — accepts raw input (file, text, params)
├── ValidationStage — runs Zod schema validation
├── ProcessingStage — runs the tool's core logic (browser-side or server-side)
├── PreviewStage    — renders result for user inspection
├── DownloadStage   — packages result for download (may trigger registration gate)
├── HistoryStage    — optional; persists to user history if authenticated
└── ShareStage      — optional; generates shareable link/QR
```

Each stage is a typed function `(input, context) => output | error`. Stages are composable: a tool can omit History and Share, but MUST implement Input, Validation, Processing, Preview, and Download.

**Consequences.**
- ✅ Consistent UX across all tools.
- ✅ Adding a new tool = defining a manifest + stage implementations; no infrastructure code.
- ✅ Cross-cutting features (analytics, error reporting, history) added once at engine level.
- ⚠️ Some tools with exotic workflows may need escape hatches; the engine provides extension points.

**Implements:** LOCK-03 (Tool Engine Philosophy), EC-04 (Tool Template Standard), EC-09 (Testing — each stage is unit-testable).

### AD-03 — Tool Registry for Auto-Discovery

**Context.** LOCK-05 mandates plugin-ready architecture with auto-discovery. With 1,000+ tools, manually wiring routes, nav entries, SEO metadata, and admin references per tool does not scale.

**Decision.** Each tool exports a `ToolManifest` object. A build-time registry harvests all manifests and generates:
- Route entries (`/tools/[category]/[slug]`)
- Navigation entries (category lists, search index)
- SEO metadata map
- Admin tool inventory
- Sitemap entries

```
ToolManifest {
  slug: string                      // URL-safe identifier
  category: ToolCategory            // image | pdf | developer | text | ...
  title: string                     // "Image Resizer"
  description: string               // SEO meta description
  lifecycle: FeatureLifecycle       // Concept | Planned | ... | Archived (LOCK-12)
  execution: 'browser' | 'server'   // LOCK-02 classification
  inputSchema: ZodSchema            // Validation stage input
  outputSchema: ZodSchema           // Preview/download output
  stages: ToolStages                // Implementations of each lifecycle stage
  seo: ToolSEOConfig                // Per LOCK-08
  relatedTools: string[]            // Slugs of related tools (internal linking)
  faq: FAQItem[]                    // Per LOCK-08
}
```

**Consequences.**
- ✅ Adding a tool = creating a folder with `manifest.ts` + stage files; registry handles the rest.
- ✅ Navigation, sitemap, SEO, and admin inventory never go stale.
- ✅ Foundation for Phase 4 plugin marketplace: third-party manifests follow the same schema.
- ⚠️ Requires TypeScript build-time codegen; documented in `05_ProjectStructure` §Registry Pattern.

**Implements:** LOCK-05 (Plugin-Ready Architecture), LOCK-08 (SEO Constitution), LOCK-12 (Feature Lifecycle), EC-01 (Documentation — manifest is the documented contract).

### AD-04 — Browser-First by Default, Server-Side by Exception

**Context.** LOCK-02 mandates browser-side processing wherever technically feasible. The architecture must make the browser the default execution target and require explicit justification for server-side processing.

**Decision.** Every tool manifest declares `execution: 'browser' | 'server'`. The Tool Engine routes accordingly. The decision matrix below is the authoritative classification:

| Tool Type | Default Execution | Rationale |
|-----------|------------------|-----------|
| Image resize / compress / crop / format convert | Browser | Canvas API + OffscreenCanvas; large files fit in memory |
| Passport photo / background removal | Browser | Canvas + MediaPipe FaceDetection WASM |
| PDF merge / split / rotate / watermark | Browser | pdf-lib (pure JS) |
| PDF compress | Browser (small files) / Server (large) | pdf-lib for restructuring; server-side for aggressive compression |
| PDF OCR | Server | Tesseract WASM is slow on large PDFs; server uses sharp + tesseract |
| Text tools (formatter, word counter, case converter) | Browser | Pure string operations |
| JSON / Base64 / hash / UUID / password generator | Browser | Crypto API + pure JS |
| QR code generator | Browser | qrcode library, pure JS |
| Regex tester | Browser | Native RegExp |
| Calculators (loan, BMI, percentage, scientific) | Browser | Pure arithmetic |
| Unit / color / number-base converters | Browser | Pure conversion logic |
| Currency converter | Browser (rates cached from server) | Rates fetched periodically; conversion is pure math |
| AI summarizer / translator / captioner | Server | Requires LLM inference; never browser |
| Heavy video transcoding | Server (Phase 3+) or WASM | Browser cannot transcode 1GB video performantly today |

**Consequences.**
- ✅ ~90% of Phase 1 tools run without server compute cost.
- ✅ Privacy is a structural property, not a marketing claim.
- ✅ Server infrastructure stays small through Phase 2.
- ⚠️ Server-side tools require explicit consent UI ("Your file will be uploaded. Deleted within 1 hour.").

**Implements:** LOCK-02 (Browser-First Philosophy), EC-07 (Performance Budget — browser-first reduces server load), EC-08 (Security — files stay on user's device).

### AD-05 — Database Optional via Strict Layer Separation

**Context.** LOCK-06 mandates that core tools function even if the database is down. This is non-trivial in a Next.js + Supabase architecture where auth, storage, and DB are typically deeply intertwined.

**Decision.** The Tool Engine (Application Layer) has ZERO direct dependency on Infrastructure. Tools interact with infrastructure only through optional side-channels:
- History persistence: best-effort, fails silently if DB unavailable.
- Auth checks: tools run in guest mode if auth service is unreachable.
- Analytics: queued in IndexedDB, flushed when backend recovers.

```
Tool Execution Flow:
1. User opens /tools/image-resize
2. Page renders (no DB call required for tool itself)
3. User uploads file → Tool Engine runs entirely in browser
4. Preview rendered → user can download WITHOUT any server call
5. If user is authenticated AND DB is up → history entry saved (best-effort)
6. If DB is down → history save fails silently, tool still completes
```

**Consequences.**
- ✅ Tools always work; platform degrades gracefully.
- ✅ Database maintenance windows don't break user workflows.
- ✅ Clear ownership: infrastructure team owns DB uptime; tool team owns tool correctness.
- ⚠️ History/favorites may temporarily appear stale during outages; UI must communicate this honestly.

**Implements:** LOCK-06 (Database Optional Philosophy), EC-05 (Progressive Enhancement — tools degrade gracefully when DB is down).

### AD-06 — Edge-First Deployment with Regional Database

**Context.** The platform serves a global audience. Vercel Edge Network provides low-latency static delivery; Supabase provides regional Postgres. The architecture must exploit Edge for content delivery without forcing all logic to edge runtime (which lacks many Node APIs).

**Decision.** Three execution runtimes, each used where appropriate:

| Runtime | Used For | Constraints |
|---------|----------|-------------|
| **Edge Runtime** | Static pages, tool landing pages, middleware (auth checks, locale routing), SEO metadata | No Node APIs; limited bundle size; no direct DB connections (use REST/PG-lite) |
| **Node.js Runtime** (Serverless Functions) | Server-side tools (OCR, AI), webhooks, admin actions, scheduled tasks | Full Node API; cold starts ~500ms; 60s execution limit on Vercel free tier |
| **Browser Runtime** | All browser-first tools, UI interactivity, client-side state | Full Web APIs; cannot access secrets; subject to user device capability |

**Consequences.**
- ✅ Tool landing pages load in <500ms globally via Edge.
- ✅ Server-side tools have full Node capability when needed.
- ✅ Browser tools never touch server compute.
- ⚠️ Edge/Node boundary requires care; some libraries only work in one runtime.

**Implements:** LOCK-02 (browser-first), performance goals in `00_Project_Charter` §6.2, EC-07 (Performance Budget — Edge for fast initial render).

## 4. Design Principles

The architecture is governed by six design principles. Every architectural decision must align with these principles; conflicts are resolved by precedence order (P1 > P2 > ... > P6).

### P1 — Browser-First (LOCK-02)
The browser is the default execution target. Server-side processing is an exception requiring justification. *Why P1:* this is the platform's identity (LOCK-01) and primary differentiator.

### P2 — Modularity (LOCK-04)
Every tool is an independent module with explicit boundaries. Modules communicate only through published contracts (manifests, interfaces), never through internal implementation. *Why P2:* 1,000+ tools cannot be maintained without strict isolation.

### P3 — Type Safety End-to-End
TypeScript strict mode; Zod schemas at every IO boundary (request → handler → response, manifest → engine → UI). *Why P3:* type errors at runtime scale linearly with tool count; prevention is cheaper than debugging.

### P4 — Free-Tier-First (LOCK implied via `01_BRD` §4.1)
Architecture must run on $0 of infrastructure cost through Phase 1. Every design choice must be viable on Vercel + Supabase free tiers. *Why P4:* the project has no initial budget; paid services are introduced only when revenue justifies.

### P5 — Documentation-Driven
No architectural element exists without a doc reference. Code without doc precedent is a violation. *Why P5:* this is EC-01; AI-assisted development (LOCK-09) requires explicit context; undocumented decisions get duplicated or contradicted.

### P6 — Performance as a Feature
Sub-second first interaction is a non-negotiable goal. Performance budgets are enforced in CI. *Why P6:* speed is a brand value (`00_Project_Charter` §2) and a SEO ranking factor (LOCK-08).

## 5. System Architecture

### 5.1 High-Level Topology

```
                          ┌──────────────────────┐
                          │   User's Browser     │
                          │  (the primary runtime │
                          │   for ~90% of tools)  │
                          └──────────┬───────────┘
                                     │ HTTPS
                                     ▼
                  ┌──────────────────────────────────────┐
                  │       Vercel Edge Network            │
                  │  (CDN + Edge Middleware + Edge SSR)  │
                  └──────────┬──────────────┬────────────┘
                             │              │
              ┌──────────────▼──┐     ┌─────▼───────────────┐
              │  Static Assets  │     │  Next.js Serverless  │
              │  (immutable)    │     │  (Node runtime)      │
              │  Tool code JS   │     │  - Server-side tools │
              │  Fonts, images  │     │  - Webhooks          │
              └─────────────────┘     │  - Admin actions     │
                                      │  - Scheduled tasks   │
                                      └──────────┬───────────┘
                                                 │
                              ┌──────────────────┴──────────────┐
                              │                                  │
                       ┌──────▼──────┐                  ┌────────▼────────┐
                       │  Supabase   │                  │  External APIs  │
                       │  Postgres   │                  │  (AI, OCR, etc.)│
                       │  Auth       │                  └─────────────────┘
                       │  Storage    │
                       └─────────────┘
```

### 5.2 Request Lifecycle (Tool Page Load)

```
1. User requests /tools/image-resize
2. Vercel Edge receives request
3. Edge Middleware runs:
   - Locale detection
   - Auth cookie check (no DB call; JWT verified at edge)
   - A/B test assignment (if any)
4. Edge SSR renders page shell with:
   - Tool metadata (from build-time registry)
   - SEO tags (from manifest)
   - Tool code chunk URL (lazy-loaded)
5. HTML streamed to browser (<500ms TTFB)
6. Browser hydrates, lazy-loads tool code
7. Tool mounts; Tool Engine initializes in browser
8. User interacts; all processing happens client-side (LOCK-02)
9. If user triggers Download:
   - Guest: download proceeds (LOCK-07)
   - Authenticated: history entry saved (best-effort, LOCK-06)
10. Page view analytics queued in IndexedDB; flushed async
```

### 5.3 Request Lifecycle (Server-Side Tool)

```
1. User opens /tools/ocr-pdf (declared execution: 'server')
2. Page load same as 5.2 (browser-first for the page itself)
3. User uploads PDF
4. Tool Engine detects execution='server', shows consent UI:
   "This tool processes your file on our server. Files deleted within 1 hour."
5. User consents → file uploaded to Vercel Serverless Function
6. Function streams file to Supabase Storage (temporary bucket, 1h TTL)
7. Function invokes OCR pipeline (Tesseract on server, or external API)
8. Result returned to browser
9. Preview rendered
10. File deleted from temp storage (or TTL handles it)
11. History entry saved if authenticated (best-effort)
```

## 6. Tool Engine (Detailed)

The Tool Engine is the heart of the platform. It implements LOCK-03.

### 6.1 Engine Contract

```typescript
// Application Layer — packages/tool-engine/types.ts

interface ToolEngine<TInput, TOutput> {
  manifest: ToolManifest;
  stages: {
    input: InputStage<TInput>;
    validation: ValidationStage<TInput>;
    processing: ProcessingStage<TInput, TOutput>;
    preview: PreviewStage<TOutput>;
    download: DownloadStage<TOutput>;
    history?: HistoryStage<TOutput>;
    share?: ShareStage<TOutput>;
  };
}

interface StageContext {
  signal: AbortSignal;          // For cancellation
  locale: Locale;
  user: User | null;            // null = guest
  trackEvent: (event: string, payload?: Record<string, unknown>) => void;
}
```

### 6.2 Stage Definitions

| Stage | Responsibility | Required | Side Effects Allowed |
|-------|---------------|----------|---------------------|
| Input | Accept raw user input (file, text, params) | ✅ | None |
| Validation | Run Zod schema; reject invalid input | ✅ | None |
| Processing | Execute tool logic; produce output | ✅ | Browser: none. Server: temp storage only |
| Preview | Render output for user inspection | ✅ | None (pure render) |
| Download | Package output for download | ✅ | Trigger download; gate registration per LOCK-07 |
| History | Persist entry to user history | ❌ Optional | DB write (best-effort) |
| Share | Generate shareable link/QR | ❌ Optional | None (pure generation) |

### 6.3 Error Handling

Errors flow through a typed `ToolError` hierarchy:

```typescript
type ToolError =
  | { kind: 'validation'; field: string; message: string }
  | { kind: 'processing'; cause: Error; recoverable: boolean }
  | { kind: 'quota_exceeded'; limit: string; upgradeUrl: string }
  | { kind: 'auth_required'; feature: string; loginUrl: string }
  | { kind: 'server_unavailable'; retryAfter: number };
```

The Engine catches errors at stage boundaries, maps them to user-facing UI states, and logs them to analytics. Tool developers never write `try/catch` boilerplate.

## 7. Tool Registry (Detailed)

The Registry implements LOCK-05. It is a build-time codegen system, not a runtime service.

### 7.1 Manifest Schema

Defined in `10_FBRD` §Tool Manifest. The SAD references it; the FBRD owns the schema.

### 7.2 Build-Time Codegen

A build script (`scripts/generate-registry.ts`) walks `src/tools/**/manifest.ts`, imports each manifest, and emits:
- `src/generated/registry.ts` — typed map of all tools
- `src/generated/sitemap.ts` — sitemap entries
- `src/generated/navigation.ts` — category → tool list for nav
- `src/generated/seo-meta.ts` — per-route SEO metadata
- `src/generated/admin-inventory.ts` — admin tool list

Build-time generation (not runtime) ensures:
- No cold-start penalty for registry lookups.
- Type safety: registry changes fail the build if manifests are malformed.
- SEO metadata is statically analyzable.

### 7.3 Runtime Access

```typescript
// Any tool or page can access the registry:
import { registry } from '@/generated/registry';

const imageTools = registry.byCategory('image');
const tool = registry.bySlug('image-resizer');
const related = registry.relatedTo('image-resizer');
```

## 8. Graceful Degradation

Implements LOCK-06. Every infrastructure dependency has a documented degradation path.

| Service Down | User Impact | Tool Impact | Admin Visibility |
|-------------|-------------|-------------|------------------|
| Supabase Auth | User treated as guest; cannot log in | None — tools run in guest mode | Status page shows auth outage |
| Supabase DB | History/favorites unavailable | None — tools run; history save fails silently | Status page shows DB outage; admin actions blocked |
| Supabase Storage | Server-side tool uploads fail | Browser tools unaffected; server tools show "temporarily unavailable" | Status page shows storage outage |
| External AI API | AI tools return "service unavailable" | Non-AI tools unaffected | Admin analytics show AI tool failure rate |
| Vercel Edge | Entire platform unreachable | N/A | Status page (external monitor) |

The platform NEVER shows a generic "something went wrong" page. Every error has a specific, human-readable explanation tied to the degraded service.

## 9. Cross-Cutting Concerns

### 9.1 Authentication
- Supabase Auth with JWT verified at Edge Middleware.
- No DB call per request for auth check (JWT contains user ID, role).
- Session refresh handled automatically by Supabase client.

### 9.2 Authorization (RBAC)
- Per `17_RBAC`. Roles: guest, user, premium, editor, admin, super_admin.
- Enforcement points: Edge Middleware (route-level), Server Actions (action-level), Tool Engine stages (feature-level).
- Every enforcement point logs denials to audit trail.

### 9.3 Observability
- **Logs:** Structured JSON logs from serverless functions; shipped to Vercel logs (free) and/or Axiom (free tier).
- **Metrics:** Web Vitals (LCP, FID, CLS) collected in browser; tool completion rate, TTFR per tool.
- **Traces:** Optional in Phase 2+ (OpenTelemetry); Phase 1 uses lightweight custom spans.
- **Errors:** Client errors captured with stack trace and tool slug; server errors with request ID.

### 9.4 Internationalization
- Locale detected at Edge Middleware (URL prefix or Accept-Language).
- Tool manifests support multiple locales for title, description, FAQ.
- Phase 1: English only. Phase 2: ES, PT, FR, DE.

### 9.5 Caching Strategy
| Layer | Strategy | TTL |
|-------|----------|-----|
| Browser | Tool code: immutable (content-hashed) | 1 year |
| Browser | Tool results: IndexedDB (per-user) | Until cleared |
| Edge | Static HTML: revalidate | 1 hour |
| Edge | Sitemap: revalidate | 24 hours |
| Server | AI/OCR results: not cached (privacy) | N/A |
| DB | Read-heavy queries: Postgres materialized views | 5 minutes (Phase 2+) |

## 10. Standards

### 10.1 Architectural Standards
- Every tool MUST implement the Tool Engine lifecycle (LOCK-03).
- Every tool MUST declare a manifest conforming to `10_FBRD` schema (LOCK-05).
- Every tool MUST declare `execution: 'browser' | 'server'` (LOCK-02).
- No tool MAY import directly from another tool's internal modules (LOCK-04).
- No tool MAY make synchronous DB calls during processing (LOCK-06).

### 10.2 Boundary Enforcement Standards
- ESLint rule: `no-restricted-imports` prevents Presentation → Infrastructure imports.
- ESLint rule: `no-restricted-imports` prevents Domain → React imports.
- Code review checklist includes boundary verification.

### 10.3 Performance Standards
- Tool landing page TTFB: <500ms at Edge (P95).
- Tool first interaction: <1s on 4G mid-tier device.
- Tool code chunk: <200KB gzipped (excluding shared vendor chunk).
- Server-side tool cold start: <2s.

## 11. Best Practices

### 11.1 When Adding a New Tool
1. Read `10_FBRD` §Tool Manifest schema.
2. Create `src/tools/[category]/[slug]/` folder.
3. Add `manifest.ts` declaring execution mode, schemas, stages.
4. Implement stages; reuse shared components from `11_ACD`.
5. Run `pnpm gen:registry` to update generated files.
6. Verify SEO output via `15_SEOSpecification` checklist.
7. PR must include the manifest, stage implementations, and at least one test per stage.

### 11.2 When Modifying the Tool Engine
- The Tool Engine is shared infrastructure. Changes affect every tool.
- Any change requires: (a) updated tests, (b) updated `11_ACD` documentation, (c) migration path for existing tools, (d) approval from Chief Architect.
- Follow LOCK-09: extend, don't rewrite.

### 11.3 When Adding Server-Side Processing
- Justify in PR description: why can't this run in browser?
- Implement explicit consent UI.
- Ensure file deletion within 1 hour (enforced by storage TTL + cleanup cron).
- Add to `02_SAD` §AD-04 decision matrix as an update.

### 11.4 When Introducing a New External Dependency
- Justify per `04_TechStack` §Dependency Policy.
- Verify free tier adequacy.
- Add to `04_TechStack` dependency table.
- Get Chief Architect approval (LOCK-09).

## 12. Future Scalability

### 12.1 Scaling to 1,000+ Tools
The architecture scales linearly:
- Each tool is an isolated folder; no global state to coordinate.
- Registry codegen handles thousands of entries without runtime cost.
- Build time scales linearly; mitigations: incremental builds, parallel codegen.
- Navigation/search index moved to client-side search (e.g., Pagefind) when exceeds 500 entries.

### 12.2 Scaling to Millions of MAU
- Vercel Edge auto-scales; no action needed.
- Supabase: add read replicas in Phase 3.
- Server-side tools: extract to dedicated worker pool (Cloudflare Workers or Vercel Edge Functions) when serverless cold starts become problematic.
- Database: shard by user_id in Phase 4 if single Postgres cannot keep up.

### 12.3 Scaling the Team
- Phase 1: 1-3 engineers; everyone touches every layer.
- Phase 2: 3-5 engineers; begin specializing (frontend, backend, tool author).
- Phase 3: 5-10 engineers; team structure aligns with bounded contexts (`03_DDD`).
- Phase 4: 10+ engineers; tool authoring becomes a separate role; platform team owns infrastructure.

### 12.4 Scaling to New Tool Categories
Adding a new category (e.g., "Video Tools" in Phase 3):
1. Add category to `ToolCategory` type in Domain Layer.
2. Update navigation taxonomies.
3. Tools in the new category follow the same manifest schema.
4. No changes to Tool Engine, Registry, or Infrastructure.

### 12.5 Preparing for Plugin Marketplace (Phase 4)
- Manifest schema is already public (defined in `10_FBRD`).
- Phase 4 adds: signed manifests, sandboxed execution, versioning, marketplace UI.
- The architecture does NOT need restructuring; the Registry already supports third-party manifests with minor extension.

## 13. Dependencies

### 13.1 Document Dependencies
- Depends on `00_Project_Charter` (Architectural Locks §3, Engineering Constitution §4, Product Constitution §5) — source of authority.
- Depends on `01_BRD` — business context for monetization and KPIs.
- `03_DDD` depends on this SAD for bounded context boundaries.
- `04_TechStack` operationalizes AD-01 through AD-06 with specific technologies.
- `05_ProjectStructure` implements the layer and module boundaries defined here.
- `06_ArchitectureDecisionRecords` records AD-01 through AD-06 as ADRs (append-only history).
- `11_ProductConstitution` expands PC-02, PC-03, PC-05, PC-10 which this SAD implements.
- `12_ToolManifestSpecification` defines the manifest schema referenced in AD-03.
- `14_ACD` defines the Tool Engine component referenced in AD-02.
- `16_DatabaseDesign` implements the Infrastructure Layer for persistence.
- `17_APIConvention` implements the Infrastructure Layer for external APIs.
- `20_RBAC` implements the authorization cross-cutting concern.
- `24_DeploymentGuide` implements AD-06 deployment topology.

### 13.2 External Dependencies
- Vercel (Edge + Serverless) — deployment topology (AD-06).
- Supabase (Postgres + Auth + Storage) — Infrastructure Layer.
- See `04_TechStack` for full list with free-tier analysis.

### 13.3 Assumptions
- Vercel Edge runtime supports the middleware features we use (true as of 2026).
- Supabase free tier remains adequate through Phase 1 (10k MAU).
- Browser APIs (Canvas, OffscreenCanvas, File System Access, Web Crypto) remain stable and broadly supported.

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial SAD. Defined layered architecture (AD-01), Tool Engine (AD-02), Tool Registry (AD-03), browser-first decision matrix (AD-04), database-optional strategy (AD-05), deployment topology (AD-06). |
| 1.1.0 | 2026-06-28 | Chief Architect | Mapped each AD to the Engineering Constitution articles it implements (EC-02, EC-04, EC-05, EC-07, EC-08, EC-09, EC-01). Renumbered cross-references to reflect insertion of `06_ArchitectureDecisionRecords` (docs 06-25 shifted to 07-26). |
| 1.2.0 | 2026-06-28 | Chief Architect | Mapped AD-02 to PC-02 (Product Contract), PC-03 (Completion Standard); AD-03 to PC-10 (Product Scalability); deployment topology to PC-05 (UX Consistency). Renumbered cross-references to reflect insertion of `11_ProductConstitution` and `12_ToolManifestSpecification` (docs 11-26 shifted to 13-28). |

## 15. Cross References

- `00_Project_Charter` §3, §4, §5 — Source of LOCKs, ECs, and PCs implemented by this document.
- `01_BRD` §4.1, §4.4 — Monetization and privacy standards that constrain architecture.
- `03_DDD` — Bounded context boundaries that align with AD-01 layering.
- `04_TechStack` — Specific technologies implementing AD-01 through AD-06.
- `05_ProjectStructure` — Folder layout implementing AD-01 and AD-03.
- `06_ArchitectureDecisionRecords` — Permanent record of AD-01 through AD-06 as ADRs.
- `07_FolderStructure` — Granular file conventions for the layers defined here.
- `11_ProductConstitution` — Expands PC-02, PC-03, PC-05, PC-10.
- `12_ToolManifestSpecification` — Schema referenced by AD-03.
- `14_ACD` §Tool Engine Component — Implementation of AD-02.
- `16_DatabaseDesign` — Infrastructure Layer persistence implementation.
- `17_APIConvention` — Infrastructure Layer external API implementation.
- `18_SEOSpecification` — How AD-03 registry satisfies LOCK-08.
- `19_UserFlow` — How AD-05 graceful degradation affects user journeys.
- `20_RBAC` — Authorization enforcement points referenced in §9.2.
- `21_AdminSpecification` — How admin interacts with Registry and Infrastructure.
- `24_DeploymentGuide` — Operationalizes AD-06.
- `25_AI_Guideline` — Constrains AI's interaction with this architecture (LOCK-09, EC-11).
