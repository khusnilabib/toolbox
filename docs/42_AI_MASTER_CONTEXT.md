# 42 — AI Master Context

> **Purpose:** Complete executive summary. A new AI can understand the entire project by reading only this document.
> **Max Length:** ~3,500 words. **Last Updated:** 2026-06-28. **Revision:** 1.0.0

---

## Project Vision

**[PROJECT_NAME]** is a **browser-first productivity ecosystem** that enables users to solve everyday digital tasks without installing software and without requiring an account. The platform consolidates hundreds to thousands of utility tools under a single, scalable, privacy-respecting surface.

**Phase Goals:**
- Phase 1: 30 tools, 10k MAU, validate architecture.
- Phase 2: 100 tools, 100k MAU, premium tier.
- Phase 3: 300 tools, 500k MAU, enterprise tier.
- Phase 4: 1,000+ tools, 2M+ MAU, plugin marketplace.

**Brand Values:** Privacy (data stays on device), Speed (sub-second interaction), Simplicity (one tool, one problem), Accessibility (WCAG 2.1 AA).

## Platform Philosophy

The platform is governed by **six tiers** of binding authority:

1. **Architectural Locks (LOCK-01–12):** What the platform IS — identity, browser-first, Tool Engine, modular, plugin-ready, database-optional, guest-first, SEO, AI discipline, design, admin, feature lifecycle.
2. **Engineering Constitution (EC-01–12):** HOW engineering is done — documentation first, one source of truth, component reuse, tool template, progressive enhancement, accessibility, performance budget, security, testing, design system governance, AI collaboration, enterprise readiness.
3. **Product Constitution (PC-01–10):** How every tool BEHAVES — one problem, product contract, completion standard (13 items), quality gates (7 reviews), UX consistency, monetization, analytics, error experience, discoverability, product scalability.
4. **Data & Growth Architecture (DGA-01–10):** How the platform GROWS — database as product service, event-driven analytics, SEO as structured data, search architecture, content isolation, feature flags, auditability, API evolution, growth metrics, marketplace readiness.
5. **Platform Operations Constitution (POC-01–10):** How the platform is OPERATED — reliability, observability, release strategy, rollback, backup/recovery, operational security, incident management, monitoring standards, cost awareness, enterprise operations.
6. **Technical Documents (02–41):** Implementation details.

**Key principle:** Product, data, growth, and operational decisions are architectural decisions. A tool that violates PCs cannot reach Stable. A feature that violates DGAs cannot ship. A deployment that violates POCs cannot proceed.

## Architecture Summary

**Layered Architecture (02_SAD AD-01):**
```
Presentation → Application → Domain → Infrastructure
```
- **Presentation:** React components, pages, layouts. Depends on Application.
- **Application:** Tool Engine, hooks, server actions. Depends on Domain.
- **Domain:** Entities, value objects, Zod schemas. No React/Next.js.
- **Infrastructure:** DB, Auth, Storage, External APIs. Only layer talking to DB.

**Dependency rules enforced via ESLint `no-restricted-imports`.**

**Bounded Contexts (03_DDD):**
1. **Tools (Core, Stateless):** Tool definitions, manifests, execution lifecycle. Zero DB dependency (LOCK-06).
2. **Identity:** Users, auth, sessions, history, favorites.
3. **Content:** Articles, media, taxonomy. Isolated from tools (DGA-05).
4. **Platform Ops:** Feature flags, audit trail, system health, ads.
5. **Billing (Phase 2+):** Subscriptions, plans, invoices, usage.
6. **Analytics:** Events, daily aggregates, funnels. Event sink for all contexts.

**No cross-schema foreign keys.** Integration via domain events (typed, versioned, async).

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript 5+ (strict mode, no `any`) |
| Styling | Tailwind CSS 4+ (token-driven) |
| Components | shadcn/ui (Radix UI primitives) |
| Forms | React Hook Form + Zod |
| State | Zustand (client) |
| Database | Supabase Postgres |
| ORM | Drizzle ORM (Edge-compatible) |
| Auth | Supabase Auth (JWT, OAuth) |
| Storage | Supabase Storage |
| Hosting | Vercel (Edge + Serverless) |
| Package Manager | pnpm (workspaces) |
| Validation | Zod (at every IO boundary) |
| Testing | Vitest (unit), Playwright (E2E) |
| Error Tracking | Sentry |
| Analytics | GA4 / PostHog / Plausible (vendor-neutral adapters) |

**Budget:** $0 (free tier) through Phase 1. All choices have documented upgrade paths.

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public routes (tools, search, blog)
│   ├── (auth)/             # Auth routes (login, register, dashboard)
│   ├── (admin)/            # Admin routes (RBAC protected)
│   ├── (marketing)/        # Homepage, about, pricing
│   └── api/                # API routes (server-side tools, webhooks)
├── tools/                  # Tools Context (core domain)
│   └── [category]/[slug]/  # One folder per tool
│       ├── manifest.ts     # Aggregate root (the contract)
│       ├── stages/         # 5-7 lifecycle stage files
│       ├── components/     # Tool-specific UI
│       ├── hooks/          # Tool-specific hooks
│       ├── lib/            # Tool-specific utilities
│       └── tests/          # Colocated tests
├── identity/               # Identity Context (4 layers)
├── content/                # Content Context
├── platform-ops/           # Platform Ops Context
├── billing/                # Billing Context (Phase 2+)
├── analytics/              # Analytics Context
├── shared/                 # App-specific shared code
├── generated/              # Build-time codegen (registry, sitemap, etc.)
packages/                   # Reusable packages
├── tool-engine/            # ToolEngine<TInput, TOutput>
├── ui/                     # Design system primitives
├── utils/                  # Pure utilities
└── types/                  # Shared types & Zod schemas
drizzle/                    # DB migrations (per context)
tests/                      # Project-wide E2E & integration
docs/                       # All documentation (00-51)
```

**Naming:** `kebab-case` files (non-component), `PascalCase` component files, `kebab-case` folders, `camelCase` variables, `SCREAMING_SNAKE_CASE` constants, `snake_case` DB tables (plural).

## Manifest Philosophy

The **ToolManifest** (`12_ToolManifestSpecification`) is the aggregate root of the Tools Context. It is:
- **Canonical:** Single source of truth for tool identity, behavior, contract, SEO, analytics, discoverability.
- **Self-contained:** Serializable; stage implementations referenced by import.
- **Build-time consumed:** Codegen generates 7 artifacts (registry, navigation, sitemap, SEO meta, admin inventory, search index, analytics config).
- **Plugin-ready:** Schema is public, versioned; Phase 4 marketplace extends with signing/sandboxing.

**Manifest encodes:** slug, category, title, lifecycle, version, purpose, userProblem, inputSchema (Zod), outputSchema (Zod), validationRules, successCriteria, failureStates (PC-08 what/why/how), emptyStates, loadingStates, execution (browser/server), stages, seo (title/description/keywords/canonical/OG/Twitter/JSON-LD/FAQ/breadcrumb/searchIntent), relatedTools, analytics (events/funnelSteps), limits (maxInputSize/maxOutputSize/requiresAuth/premiumOnly).

**Adding a tool = adding a folder with manifest.ts + stages.** Nothing else changes. Registry auto-discovers.

## Tool Engine

Every tool follows the standardized lifecycle (LOCK-03):

```
Input → Validation → Processing → Preview → Download → History (optional) → Share (optional)
```

- **Input:** Accepts raw user input (file, text, params).
- **Validation:** Runs Zod schema; rejects invalid input.
- **Processing:** Executes tool logic (browser-side per LOCK-02, or server-side by exception).
- **Preview:** React component renders output for inspection.
- **Download:** Packages result for download (file) or copy (text).
- **History:** Optional; best-effort persist to user history (LOCK-06 — fails silently if DB down).
- **Share:** Optional; generates shareable link/QR.

**Tool Engine auto-emits 10 standard analytics events** (PC-07): tool_viewed, tool_started, validation_failed, processing_started, processing_completed, download_attempted, download_completed, registration_prompt_viewed, registration_completed, tool_shared.

**Errors are typed** (ToolError union): validation, processing, quota_exceeded, auth_required, server_unavailable. Every error follows PC-08: explains what happened, why, how to fix. Never exposes stack traces.

## Registry

The **Tool Registry** is a build-time codegen system (`05_ProjectStructure` AD-04). A script (`scripts/generate-registry.ts`) walks `src/tools/**/manifest.ts`, validates each against the Zod schema, and emits:

- `src/generated/registry.ts` — Map of all manifests with lookup helpers.
- `src/generated/navigation.ts` — Category → Tool[] for nav menus.
- `src/generated/sitemap.ts` — Sitemap entries for SEO.
- `src/generated/seo-meta.ts` — Per-route SEO metadata.
- `src/generated/admin-inventory.ts` — Tool list for admin panel.
- `src/generated/search-index.ts` — Search index (consumed by Pagefind).
- `src/generated/analytics-config.ts` — Analytics events per tool.

**CI verifies** generated files match manifests; mismatched generations fail the build. Generated files are committed for type safety across the team.

## SEO Strategy

SEO is a first-class architectural concern (LOCK-08). **All SEO originates from the Tool Manifest** (DGA-03); no hardcoded SEO in pages.

**Per tool page:**
- Unique URL, unique metadata, canonical URL.
- Open Graph + Twitter Card tags.
- JSON-LD structured data: SoftwareApplication, FAQPage, BreadcrumbList.
- Min 3 FAQ items, min 3 related tools (internal linking).
- Breadcrumb navigation.
- SSR for indexability (no client-only rendering).

**Sitemap** generated from manifest at build time. Submitted to Google Search Console and Bing.

**Lighthouse SEO ≥95** required (enforced in CI).

## Analytics Strategy

**Event-driven, vendor-neutral** (DGA-02). Canonical event schema (`16_EventSchemaSpecification`) is the single source of truth. Analytics providers (GA4, PostHog, Plausible) are adapters implementing a common interface.

**Pipeline:** Tool Engine emits canonical event → Zod validated → IndexedDB queue (offline support) → flush worker → adapter fan-out → provider(s).

**Consent management (GDPR/CCPA):** No analytics before consent. Consent stored in cookie, revocable.

**Growth metrics (DGA-09):** Computed nightly from raw events — tool popularity, conversion rate, completion rate, registration rate, search success rate, return visits, average processing time. Stored as DailyAggregates in Analytics Context.

**PII minimized:** Events contain userId/anonymousId only. No emails, names, IPs, file contents.

## Database Philosophy

**Database is a product service, not default persistence** (DGA-01). Only long-term-value data is persisted. Temporary processing results stay browser-local (LOCK-02).

**Database stores:** Authentication, user profile, history, favorites, content, admin/config, analytics aggregates, audit logs.

**Database does NOT store:** Tool execution inputs/outputs (ephemeral), search indexes (generated), SEO metadata (in manifest), tool manifests (in code).

**Schema per bounded context** (Postgres schemas: `identity`, `content`, `platform_ops`, `billing`, `analytics`). No cross-schema foreign keys. RLS on every table (defense in depth). Drizzle ORM for type-safe access.

**Database optional (LOCK-06):** Core tools function without DB. If DB is down, tools still work; only account features degrade gracefully.

## Guest-First UX

Guest users can browse, use tools, upload, process, preview, and download — **all without registration** (LOCK-07). Registration is prompted ONLY at value-adding moments: save history, favorite tools, cloud sync, premium features.

**Registration triggers:** After download (5+ tools in 7 days, non-blocking toast), history save attempt, favorite attempt, cloud sync attempt, premium feature attempt. Prompts are dismissible; 7-day cooldown after dismissal.

**Monetization (PC-06):** Revenue never interrupts task completion. Ads only after result shown. Premium gates only at value-add features (batch, AI, cloud sync). Free alternative always offered.

## Admin Philosophy

Admin is the **operational control center**, not just a CMS (LOCK-11). 10 modules: Dashboard, Users, Tools, Content, SEO, Analytics, Feature Flags, Audit Trail, Settings, System Health.

**RBAC enforced** from Phase 1 (6 roles: guest, user, premium, editor, admin, super_admin). Three-layer enforcement: Edge Middleware (route), server actions (action), RLS (row). Every admin action audited (DGA-07, immutable).

**Feature flags** first-class (DGA-06): beta, A/B experiments, regional rollouts, gradual rollouts, internal testing.

## Development Workflow

**AI Development Workflow** (`35_AI_DevelopmentWorkflow`): 10 mandatory steps:
1. Read governance → 2. Read ADR → 3. Read related docs → 4. Validate dependencies → 5. Propose plan → 6. Wait for approval → 7. Implement → 8. Self-review → 9. Update documentation → 10. Verify quality gates.

**Trunk-based development:** Short-lived branches (2-3 days), `main` always deployable, feature flags gate incomplete features, squash merge with conventional commits.

**Definition of Done (PC-03):** 13 mandatory items — input, validation, processing, preview, download, errors, success feedback, accessibility, mobile, SEO, analytics, docs, tests.

**Quality Gates (PC-04):** 7 reviews — functional, accessibility, performance, SEO, security, documentation, UX. All must pass for promotion to Stable.

## Deployment Workflow

**Four environments:** Local → Development → Preview → Production (POC-03). All deploys via CI/CD (GitHub Actions → Vercel). No manual production deploys.

**Instant rollback** via Vercel (POC-04). DB migrations forward-compatible (additive first; breaking changes multi-step). Rollback procedures documented.

**Observability built in** (POC-02): structured JSON logs, health check endpoints, Sentry error tracking, Vercel Analytics, Lighthouse CI. 10 minimum monitoring metrics (uptime, response time, error rate, build/deploy status, API/DB health). Dashboard-ready.

**Backup:** Supabase automated daily backups. RPO 24h, RTO 4h (Phase 1). Quarterly recovery drills.

**Incident lifecycle (POC-07):** Detected → Acknowledged → Investigating → Mitigated → Resolved → Postmortem (48h, blameless, ADR if architectural).

## Future Marketplace

Phase 4 envisions a plugin marketplace: community-created tools, verified publishers, ratings, reviews, tool collections. The architecture anticipates this from Phase 1:
- ToolManifest schema includes `plugin` extension field (publisher, signature, sandbox, platform version).
- Database schema avoids assuming all tools are first-party.
- Identity Context can support publisher identities.
- Analytics can attribute tools to publishers.

**No implementation required today.** Schema design avoids blocking future capabilities.

## Future Enterprise Migration

The operational model supports migration to enterprise environments without architectural redesign (POC-10, EC-12):
- **Vercel → self-hosted:** Next.js is portable; Dockerfile + Node server.
- **Supabase → dedicated Postgres:** Drizzle schemas portable; connection config changes.
- **GitHub Actions → Jenkins/CircleCI:** CI scripts are standard shell commands.
- **Enterprise features (Phase 3+):** SSO (SAML), audit log export, custom SLAs, multi-tenancy, data residency.

**No free-tier-specific optimizations** that would block migration. All upgrade paths documented in `04_TechStack`.

---

*This document is the optimized entry point for AI. For full detail on any topic, consult the specific technical document referenced. The original documentation remains the Single Source of Truth.*
