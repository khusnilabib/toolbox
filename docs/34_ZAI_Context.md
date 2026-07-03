# 34 — ZAI Context (Permanent Project Memory)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Purpose:** Reusable context for every future AI conversation about [PROJECT_NAME].

---

## 1. Project Vision

**[PROJECT_NAME]** is a **browser-first productivity ecosystem** that enables users to solve everyday digital tasks without installing software and without requiring an account.

**Mission:** Build one of the largest online productivity tool platforms providing hundreds to thousands of useful tools within one ecosystem.

**Brand Values:**
1. **Privacy** — User data stays on the user's device whenever technically possible.
2. **Speed** — Sub-second first interaction; no unnecessary network round-trips.
3. **Simplicity** — Every tool has one obvious primary action.
4. **Accessibility** — WCAG 2.1 AA from day 1.

**Phase Goals:**
- Phase 1: 30 tools, 10k MAU.
- Phase 2: 100 tools, 100k MAU.
- Phase 3: 300 tools, 500k MAU, premium tier.
- Phase 4: 1,000+ tools, 2M+ MAU, marketplace.

## 2. Architecture Summary

**Tech Stack:**
- Frontend: Next.js 15+ (App Router), TypeScript (strict), Tailwind CSS 4+, shadcn/ui.
- Backend: Supabase (Postgres, Auth, Storage), Drizzle ORM.
- State: Zustand (client), React Hook Form + Zod (forms).
- Hosting: Vercel (Edge + Serverless).
- Package Manager: pnpm (workspaces).

**Layered Architecture (per `02_SAD`):**
```
Presentation → Application → Domain → Infrastructure
```
- Presentation: React components, pages.
- Application: Tool Engine, hooks, server actions.
- Domain: Entities, value objects, schemas (no React/Next.js).
- Infrastructure: DB, Auth, Storage, External APIs.

**Bounded Contexts (per `03_DDD`):**
1. Tools (Core domain, stateless).
2. Identity (Users, auth, history, favorites).
3. Content (Articles, media, taxonomy).
4. Platform Operations (Admin, feature flags, audit).
5. Billing (Subscriptions, plans — Phase 2+).
6. Analytics (Events, aggregates).

**Tool Engine (LOCK-03):**
```
Input → Validation → Processing → Preview → Download → History (optional) → Share (optional)
```

**Tool Registry (LOCK-05):**
- Build-time codegen from `manifest.ts` files.
- Generates: registry, navigation, sitemap, SEO metadata, admin inventory, search index, analytics config.
- Adding a tool = adding a folder; nothing else changes.

## 3. Governance Summary

**Six-tier priority (highest to lowest):**

| Tier | Document | Articles |
|------|----------|----------|
| 1 | Architectural Locks (`00_Project_Charter` §3) | LOCK-01 through LOCK-12 |
| 2 | Engineering Constitution (`00_Project_Charter` §4) | EC-01 through EC-12 |
| 3 | Product Constitution (`00_Project_Charter` §5) | PC-01 through PC-10 |
| 4 | Data & Growth Architecture (`00_Project_Charter` §6) | DGA-01 through DGA-10 |
| 5 | Platform Operations Constitution (`00_Project_Charter` §7) | POC-01 through POC-10 |
| 6 | Technical Documents (`02`–`41`) | — |

**Key Governance Rules:**
- Documentation first (EC-01).
- One source of truth (EC-02).
- Component reuse first (EC-03).
- Browser-first processing (LOCK-02).
- Database optional (LOCK-06).
- Guest-first UX (LOCK-07).
- SEO as structured data from manifest (DGA-03).
- Event-driven analytics, vendor-neutral (DGA-02).
- Every tool has a product contract (PC-02).
- Every tool passes 7 quality gates before Stable (PC-04).
- Reliability first; graceful degradation (POC-01).
- Observability by default (POC-02).
- ADR append-only (`06_ArchitectureDecisionRecords`).

**ADR Repository:** 83 ADRs (ADR-001 through ADR-083) in `06_ArchitectureDecisionRecords.md`.

## 4. Folder Conventions

```
[PROJECT_NAME]/
├── docs/                        # Documentation (00-41 + README)
├── public/                      # Static assets
├── scripts/                     # Build scripts, codegen
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (public)/            # Public routes
│   │   ├── (auth)/              # Auth routes
│   │   ├── (admin)/             # Admin routes
│   │   ├── (marketing)/         # Marketing pages
│   │   └── api/                 # API routes
│   ├── tools/                   # Tools Context (core domain)
│   │   ├── image/
│   │   │   ├── image-resize/    # One folder per tool
│   │   │   │   ├── manifest.ts
│   │   │   │   ├── stages/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── lib/
│   │   │   │   └── tests/
│   │   │   └── _shared/
│   │   ├── pdf/
│   │   ├── developer/
│   │   └── ...
│   ├── identity/                # Identity Context
│   │   ├── presentation/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── content/                 # Content Context
│   ├── platform-ops/            # Platform Ops Context
│   ├── billing/                 # Billing Context (Phase 2+)
│   ├── analytics/               # Analytics Context
│   ├── shared/                  # App-specific shared code
│   └── generated/               # Build-time generated (registry, etc.)
├── packages/                    # Reusable packages
│   ├── tool-engine/
│   ├── ui/
│   ├── utils/
│   └── types/
├── drizzle/                     # DB migrations per context
└── tests/                       # Project-wide E2E/integration tests
```

**File Naming:**
- Components: `PascalCase.tsx` (e.g., `ToolCard.tsx`).
- Non-components: `kebab-case.ts` (e.g., `image-utils.ts`).
- Tests: `[subject].test.ts`.
- Folders: `kebab-case`.

## 5. Coding Rules

- **TypeScript strict mode** (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- **No `any` type** (ESLint-enforced).
- **Zod at every IO boundary** (request, response, manifest, env vars).
- **File size limits:** 300 lines soft, 500 lines hard.
- **No giant files;** split into modules.
- **Composition over inheritance.**
- **No hardcoded values;** use constants/config.
- **ESLint boundary enforcement** (no cross-layer imports).
- **Prettier:** 100 chars, semicolons, single quotes, trailing commas.
- **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- **PR-based review;** all changes require approval.
- **Documentation updated in same PR as code** (EC-01).

## 6. Naming Rules

- **PascalCase:** Components, types, interfaces, enums, Zod schemas.
- **camelCase:** Variables, functions, parameters, props, hooks (`use*` prefix).
- **kebab-case:** Files (non-component), folders, URLs, CSS classes, env vars.
- **SCREAMING_SNAKE_CASE:** Constants, environment variables.
- **snake_case:** Database tables (plural), columns, indexes.
- **Tool slugs:** `kebab-case`, URL-safe, unique within category.

## 7. Design Rules

- **Developer-first minimalism** (Vercel-like).
- **Monochrome palette** + single accent color.
- **Token-driven theming** via CSS custom properties.
- **Dark/light mode** from day 1.
- **WCAG 2.1 AA** minimum.
- **Mobile-first** (360px baseline).
- **Minimal animation** (≤200ms, reduced-motion respected).
- **Design system governance** (EC-10): no ad hoc UI.
- **Components from `@packages/ui`** (shadcn/ui-based).
- **Icons from lucide-react.**
- **Fonts:** Inter (sans), JetBrains Mono (mono) via `next/font`.

## 8. Performance Targets

- **TTFB (Edge):** <500ms P95.
- **Tool first interaction:** <1s on 4G mid-tier.
- **Tool code chunk:** <200KB gzipped.
- **Total JS per page:** <500KB gzipped.
- **Lighthouse Performance:** ≥90.
- **Lighthouse Accessibility:** ≥95.
- **Lighthouse SEO:** ≥95.
- **Server-side tool cold start:** <2s.
- **Performance regressions are bugs** (EC-07).

## 9. Security Rules

- **Validate every input** (Zod).
- **Sanitize every output** (React auto-escaping; DOMPurify for dynamic HTML).
- **Principle of least privilege** (RBAC + RLS).
- **Secure headers** (CSP, X-Frame-Options, etc.).
- **Strict TypeScript** (no `any`).
- **Secrets never committed** (`secretlint` in pre-commit).
- **Dependency review required** (LOCK-09).
- **No `dangerouslySetInnerHTML`** without DOMPurify.
- **No `eval` or `new Function`.**
- **RLS on every DB table.**
- **JWT verified at Edge Middleware** (no DB call per request).
- **Audit trail for all admin actions** (DGA-07, immutable).

## 10. Tool Lifecycle

```
Concept → Planned → Design → Development → Testing → Beta → Stable → Deprecated → Archived
```

- **Concept → Planned:** FBRD entry drafted (`13_FBRD`).
- **Planned → Design:** FBRD reviewed; SEO researched.
- **Design → Development:** FBRD approved; manifest.ts created.
- **Development → Testing:** Implementation complete; unit tests pass.
- **Testing → Beta:** All 13 PC-03 items implemented; deployed to staging.
- **Beta → Stable:** All 7 PC-04 quality gates passed.
- **Stable → Deprecated:** Tool replaced or sunset.
- **Deprecated → Archived:** Removed from navigation; redirects to successor.

## 11. Manifest Philosophy

The **ToolManifest** (`12_ToolManifestSpecification`) is the aggregate root of the Tools Context. It is:
- **Canonical:** Single source of truth for tool identity, behavior, contract, metadata.
- **Self-contained:** Serializable; no functions (stage implementations imported).
- **Comprehensive:** Encodes product contract (PC-02), SEO (DGA-03), analytics (PC-07), discoverability (PC-09).
- **Build-time consumed:** Codegen generates registry, nav, sitemap, SEO, admin, search, analytics.
- **Plugin-ready:** Schema is public, versioned; Phase 4 marketplace extends with signing/sandboxing.
- **Versioned:** `manifestVersion` (semver) for schema evolution.

**Manifest encodes:**
- Identity: slug, category, title, lifecycle, version.
- Product Contract: purpose, userProblem, inputs, outputs, validation, success/failure/empty/loading states.
- Execution: browser/server, stages.
- SEO: title, description, keywords, canonical, OG, Twitter Card, JSON-LD, FAQ, breadcrumb, searchIntent.
- Discoverability: relatedTools, suggestedWorkflows.
- Analytics: events, funnelSteps.
- Limits: maxInputSize, maxOutputSize, requiresAuth, premiumOnly.

## 12. SEO Philosophy

- **SEO is a first-class architectural concern** (LOCK-08).
- **Manifest is canonical source** for all SEO (DGA-03); no hardcoded SEO in pages.
- **Structured data via JSON-LD:** SoftwareApplication, FAQPage, BreadcrumbList.
- **Sitemap generated from manifest** at build time.
- **Internal linking mandatory:** every tool links to related tools (PC-09).
- **SSR for SEO-critical pages;** no client-only rendering.
- **Canonical URLs prevent duplication.**
- **Lighthouse SEO ≥95 required.**
- **SEO is the primary acquisition channel** through Phase 2.

## 13. Analytics Philosophy

- **Event-driven** (DGA-02): every important action produces a standardized event.
- **Vendor-neutral:** GA4, PostHog, Plausible, self-hosted all supported via adapters.
- **Canonical event schema** (`16_EventSchemaSpecification`): single source of truth.
- **10 standard events** auto-emitted by Tool Engine (PC-07): tool_viewed, tool_started, validation_failed, processing_started/completed, download_attempted/completed, registration_prompt_viewed/completed, tool_shared.
- **PII minimized:** userId/anonymousId only; no emails, names, IPs, file contents.
- **Consent management** (GDPR/CCPA): no analytics before consent.
- **Growth metrics computed nightly** from events (DGA-09): tool popularity, conversion rate, completion rate, registration rate, search success rate, return visits, avg processing time.

## 14. Admin Philosophy

- **Admin is the operational control center,** not just a CMS (LOCK-11).
- **10 modules:** Dashboard, Users, Tools, Content, SEO, Analytics, Feature Flags, Audit Trail, Settings, System Health.
- **RBAC enforced** from Phase 1 (LOCK-11, `23_RBAC`).
- **Every admin action audited** (DGA-07); audit logs immutable.
- **Feature flags first-class** (DGA-06): beta, A/B, regional, gradual, internal.
- **Monitoring dashboard-ready** (POC-08): uptime, response time, error rate, build/deploy status, API/DB health.

## 15. Development Workflow

**AI Development Workflow** (`35_AI_DevelopmentWorkflow`):
1. Read governance.
2. Read ADR.
3. Read related documents.
4. Validate dependencies.
5. Propose implementation plan.
6. Wait for approval.
7. Implement.
8. Self-review.
9. Update documentation.
10. Verify quality gates.

**Trunk-based development:**
- Short-lived feature branches (2-3 days max).
- `main` always deployable.
- Feature flags gate incomplete features.
- Squash merge with conventional commit message.

**PR workflow:**
1. Create branch.
2. Develop + test locally.
3. Open PR with description.
4. CI runs (lint, type-check, test, build, security).
5. Preview deployment created.
6. Reviewer tests + approves.
7. Merge to main.
8. Vercel deploys.
9. Post-deploy monitoring (30 min).

**Definition of Done (PC-03):** 13 mandatory items (input, validation, processing, preview, download, errors, success feedback, accessibility, mobile, SEO, analytics, docs, tests).

**Quality Gates (PC-04):** 7 reviews (functional, accessibility, performance, SEO, security, documentation, UX).

## 16. Future Expansion Strategy

**Phase 2:**
- 100 tools; premium subscription (Stripe).
- Multi-language support (ES, PT, FR, DE).
- Public API (v1).
- PostHog/Plausible analytics.
- Storybook for components.

**Phase 3:**
- 300 tools; enterprise tier (SSO, audit logs, SLA).
- Multi-tenancy (`tenant_id`).
- Server-side search (Algolia/Meilisearch).
- Real-time analytics.
- Mobile app (React Native).

**Phase 4:**
- 1,000+ tools; plugin marketplace.
- Community-created tools with verified publishers.
- Ratings, reviews, tool collections.
- White-label / embed product.
- API monetization (usage-based).

**Architecture does not require restructuring between phases.** All future capabilities are anticipated by current design (DGA-10, POC-10, EC-12).

## 17. How to Use This Context

This document is optimized as **reusable context for every future AI conversation**. When starting a new AI session about [PROJECT_NAME]:

1. **Provide this document as context** (or reference it).
2. **AI follows the AI Guideline** (`33_AI_Guideline`).
3. **AI follows the AI Development Workflow** (`35_AI_DevelopmentWorkflow`).
4. **AI references ADR repository** before architectural changes.
5. **AI respects governance hierarchy** (six tiers).

**For specific questions, AI should reference:**
- Architecture: `02_SAD`, `03_DDD`, `05_ProjectStructure`.
- Coding: `08_CodingStandards`, `09_NamingConvention`.
- Tools: `12_ToolManifestSpecification`, `13_FBRD`, `14_ACD`.
- UX: `10_DesignSystem`, `15_UDS`.
- Data: `16_EventSchemaSpecification`, `17_AnalyticsArchitecture`, `19_DatabaseDesign`.
- APIs: `20_APIConvention`.
- SEO: `21_SEOSpecification`.
- Auth: `23_RBAC`.
- Operations: `24_PlatformOperationsConstitution` through `28_ReleaseManagement`.
- AI: `33_AI_Guideline`, this document, `35_AI_DevelopmentWorkflow`.
- Planning: `36_ProjectBootstrapRoadmap` through `41_ProjectChecklist`.

## 18. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial ZAI Context. Comprehensive project memory covering vision, architecture, governance (6 tiers), folder/coding/naming/design rules, performance/security targets, tool lifecycle, manifest/SEO/analytics/admin philosophy, development workflow, future expansion. Optimized as reusable AI context. |

## 19. Cross References

- `00_Project_Charter` — Source of all governance (§3 Locks, §4 ECs, §5 PCs, §6 DGAs, §7 POCs).
- `02_SAD` through `05_ProjectStructure` — Architecture core.
- `06_ArchitectureDecisionRecords` — 83 ADRs.
- `07_FolderStructure` through `10_DesignSystem` — Implementation conventions.
- `11_ProductConstitution`, `12_ToolManifestSpecification` — Product specifications.
- `13_FBRD` through `15_UDS` — Feature & UI specs.
- `16_EventSchemaSpecification` through `18_SearchArchitecture` — Data & growth.
- `19_DatabaseDesign` through `23_RBAC` — Data/API/SEO/auth.
- `24_PlatformOperationsConstitution` through `28_ReleaseManagement` — Operations.
- `29_AdminSpecification` through `31_TestingStrategy` — Admin & process.
- `32_DeploymentGuide` — Operational deployment.
- `33_AI_Guideline` — AI behavior rules.
- `35_AI_DevelopmentWorkflow` — Mandatory AI workflow.
- `36_ProjectBootstrapRoadmap` through `41_ProjectChecklist` — Planning & implementation.
