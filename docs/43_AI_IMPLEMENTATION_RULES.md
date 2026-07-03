# 43 — AI Implementation Rules

> **Purpose:** All governance articles converted to concise, actionable rules. Each rule references its origin.
> **Last Updated:** 2026-06-28 · **Revision:** 1.0.0

---

## Architecture Rules

| Rule | Origin |
|------|--------|
| Browser-first processing by default; server-side only when technically unavoidable. | LOCK-02, ADR-028, ADR-064 |
| Every tool follows: Input → Validation → Processing → Preview → Download → History → Share. | LOCK-03, ADR-026 |
| Every tool is an independent module; no direct imports between tools. | LOCK-04, ADR-025 |
| Tool manifests are the plugin contract; auto-discovery via build-time codegen. | LOCK-05, ADR-027 |
| Core tools must function without database; DB serves only auth, history, content, admin, analytics. | LOCK-06, ADR-029 |
| No registration before value demonstrated. | LOCK-07, ADR-007 |
| SEO is first-class; manifest is canonical source for all SEO. | LOCK-08, ADR-066 |
| AI must not duplicate, drift, or introduce unapproved dependencies. | LOCK-09, ADR-009 |
| Design system is monochrome, high-contrast, token-driven, dark/light ready. | LOCK-10, ADR-010 |
| Admin is operational control center with RBAC and audit from Phase 1. | LOCK-11, ADR-011 |
| Every feature has lifecycle status: Concept → Planned → Design → Dev → Testing → Beta → Stable → Deprecated → Archived. | LOCK-12, ADR-012 |
| Layered architecture: Presentation → Application → Domain → Infrastructure. No layer skips. | ADR-025 |
| Six bounded contexts: Tools, Identity, Content, Platform Ops, Billing, Analytics. No cross-schema FKs. | ADR-031 |
| Contexts integrate via domain events only (typed, versioned, async). | ADR-035 |

## Engineering Rules

| Rule | Origin |
|------|--------|
| No code without prior documentation. Every PR updates docs. | EC-01, ADR-013 |
| Every business rule exists in exactly one place. Duplication must be refactored. | EC-02, ADR-014 |
| Before creating new component: Search → Extend → Create (only when justified). | EC-03, ADR-015 |
| Every tool follows identical folder structure: manifest + stages + components + hooks + lib + tests. | EC-04, ADR-016 |
| Platform degrades gracefully when JS/APIs/DB/auth partially fail. | EC-05, ADR-017 |
| WCAG 2.1 AA: keyboard nav, focus visibility, screen reader, reduced motion, ≥44px touch targets. | EC-06, ADR-018 |
| Performance budget: TTFB <500ms, tool chunk <200KB, total JS <500KB, Lighthouse ≥90. Regressions are bugs. | EC-07, ADR-019 |
| Validate every input (Zod), sanitize every output, least privilege, secure headers, `secretlint`, dep review. | EC-08, ADR-020 |
| Testing pyramid: Unit (70%) → Integration (20%) → E2E (10%). Engines designed for testability. | EC-09, ADR-021 |
| No ad hoc UI; every visual element from Design System. No inline styles, no hardcoded colors. | EC-10, ADR-022 |
| AI preserves consistency, references docs, asks before assuming, explains trade-offs. | EC-11, ADR-023 |
| Architecture must scale to enterprise without redesign; no free-tier lock-in. | EC-12, ADR-024 |
| TypeScript strict mode; no `any` (ESLint-enforced). Zod at every IO boundary. | ADR-037, ADR-042 |
| File size: 300 lines soft, 500 lines hard. | `08_CodingStandards` AD-05 |
| Composition over inheritance. No hardcoded values. | `08_CodingStandards` AD-11, AD-12 |

## Product Rules

| Rule | Origin |
|------|--------|
| Each tool solves exactly one problem. No feature creep. | PC-01, ADR-054 |
| Every tool has a product contract: purpose, inputs, outputs, validation, processing, success/failure/empty/loading states, SEO intent, related tools, analytics events. | PC-02, ADR-055 |
| Tool is complete only with all 13 items: input, validation, processing, preview, download, errors, success feedback, accessibility, mobile, SEO, analytics, docs, tests. | PC-03, ADR-056 |
| Stable requires 7 gates: functional, accessibility, performance, SEO, security, documentation, UX. | PC-04, ADR-057 |
| Tool page layout: Hero → Tool → Result → FAQ → Related → Docs → Feedback → Footer. | PC-05, ADR-058 |
| Revenue never interrupts task completion. Ads only after value demonstrated. | PC-06, ADR-059 |
| Every tool emits 10 standard analytics events (auto-emitted by Tool Engine). | PC-07, ADR-060 |
| Every error explains what happened, why, how to fix. Never expose stack traces. | PC-08, ADR-061 |
| Every tool helps discover more tools: related, workflows, categories, search, recent, popular. | PC-09, ADR-062 |
| Adding a tool = adding a folder; manifest generates nav, SEO, sitemap, search, admin, analytics. | PC-10, ADR-063 |

## SEO Rules

| Rule | Origin |
|------|--------|
| All SEO from Tool Manifest; no hardcoded SEO in pages. | DGA-03, ADR-066 |
| JSON-LD structured data: SoftwareApplication, FAQPage, BreadcrumbList. | `21_SEOSpecification` AD-02 |
| Min 3 FAQ items, min 2 breadcrumb items, min 3 related tools per tool page. | LOCK-08, PC-09 |
| Sitemap generated from manifest at build time. | DGA-03, `21_SEOSpecification` AD-03 |
| Canonical URLs on every page; no duplicate metadata. | LOCK-08 |
| SSR for all SEO-critical pages; no client-only rendering. | `21_SEOSpecification` AD-06 |
| Lighthouse SEO ≥95. | EC-07, `08_CodingStandards` AD-06 |

## Analytics Rules

| Rule | Origin |
|------|--------|
| Every important action produces a standardized analytics event. | DGA-02, ADR-065 |
| Analytics is vendor-neutral; providers are adapters; event schema is canonical. | DGA-02, ADR-065 |
| Events validated with Zod at emission. | `16_EventSchemaSpecification` AD-02 |
| Events queued in IndexedDB before transmission (offline support). | `17_AnalyticsArchitecture` AD-03 |
| No analytics before consent (GDPR/CCPA). | `17_AnalyticsArchitecture` AD-05 |
| PII minimized: userId/anonymousId only; no emails, names, IPs, file contents. | `16_EventSchemaSpecification` AD-05 |
| Growth metrics computed nightly from events. | DGA-09, ADR-072 |
| Multiple providers can be active simultaneously. | `17_AnalyticsArchitecture` AD-06 |

## Security Rules

| Rule | Origin |
|------|--------|
| Validate every input (Zod). Sanitize every output. | EC-08, ADR-020 |
| RLS on every database table. | `19_DatabaseDesign` AD-02 |
| JWT verified at Edge Middleware; no DB call per request. | `23_RBAC` AD-05 |
| No secrets in client bundles; `secretlint` in pre-commit. | EC-08, POC-06 |
| No `dangerouslySetInnerHTML` without DOMPurify. No `eval`. | `08_CodingStandards` AD-07 |
| RBAC: 6 roles, permission checking at 3 layers (Edge, server action, RLS). | LOCK-11, `23_RBAC` AD-03 |
| Every admin action audited; audit logs immutable. | DGA-07, ADR-070 |
| Rate limiting on all API routes. | `20_APIConvention` AD-05 |
| Secure headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. | `08_CodingStandards` AD-07 |

## Performance Rules

| Rule | Origin |
|------|--------|
| Tool landing page TTFB <500ms P95. | EC-07, `08_CodingStandards` AD-06 |
| Tool code chunk <200KB gzipped. | EC-07 |
| Total JS per page <500KB gzipped. | EC-07 |
| Lighthouse Performance ≥90, Accessibility ≥95, SEO ≥95. | EC-07 |
| Lazy-load all tool code; code splitting. | EC-07 |
| Images via `next/image`; fonts via `next/font`. | `08_CodingStandards` §9 |
| Performance regressions treated as bugs. | EC-07 |

## UI Rules

| Rule | Origin |
|------|--------|
| Use design tokens only; no hardcoded colors/spacing. | LOCK-10, EC-10 |
| Components from `@packages/ui`; no reinventing primitives. | EC-10 |
| Dark/light mode from day 1; token-driven. | LOCK-10 |
| WCAG 2.1 AA: semantic HTML, ARIA, keyboard nav, focus visibility, ≥44px touch targets. | EC-06 |
| Minimal animation (≤200ms, reduced-motion respected). | LOCK-10, `10_DesignSystem` AD-07 |
| Mobile-first (360px baseline). | PC-03 |
| Consistent tool page layout (PC-05). | PC-05, ADR-058 |

## Testing Rules

| Rule | Origin |
|------|--------|
| Unit tests for all pure functions and stages. | EC-09, ADR-021 |
| E2E tests for all user flows (Playwright). | EC-09 |
| Accessibility tests (axe-core). | EC-06 |
| Performance tests (Lighthouse CI, bundle size). | EC-07 |
| Coverage: Domain ≥90%, Application ≥80%, Tool stages ≥85%. | `31_TestingStrategy` AD-04 |
| Tests colocated with code in `tests/` subdirectory. | `07_FolderStructure` AD-04 |
| No flaky tests; tests are deterministic and isolated. | `31_TestingStrategy` §8.3 |

## Deployment Rules

| Rule | Origin |
|------|--------|
| All deploys via CI/CD; no manual production deploys. | POC-03, ADR-076 |
| Every deployment supports instant rollback (Vercel). | POC-04, ADR-077 |
| DB migrations forward-compatible; breaking changes multi-step. | POC-04, `19_DatabaseDesign` §6.3 |
| Pre-deployment checklist completed. | POC-03, `24_PlatformOperationsConstitution` §4.1 |
| Post-deploy monitoring for 30 minutes. | POC-03 |
| RPO 24h, RTO 4h (Phase 1). Quarterly recovery drills. | POC-05, ADR-078 |
| Incident lifecycle: Detected → Acknowledged → Investigating → Mitigated → Resolved → Postmortem (48h). | POC-07, ADR-080 |
| 10 minimum monitoring metrics: uptime, response time, error rate, build/deploy status, API/DB health. | POC-08, ADR-081 |
| Monthly cost review; alert at 80% of free-tier limits. | POC-09, ADR-082 |
| Operational model supports enterprise migration without redesign. | POC-10, ADR-083 |
