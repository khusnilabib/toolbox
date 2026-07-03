# 39 — Sprint Planning

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** Phase 1 delivery plan

---

## 1. Purpose

This document defines the **first 10 development sprints** for [PROJECT_NAME]. Each sprint has goals, deliverables, risks, dependencies, definition of done, and expected duration.

## 2. Sprint Overview

| Sprint | Focus | Duration | Tools Added |
|--------|-------|----------|-------------|
| 1 | Foundation + Platform | 1 week | 0 |
| 2 | Auth + Database + RBAC | 1 week | 0 |
| 3 | Tool Engine + Registry | 1 week | 0 |
| 4 | SEO + Analytics + Search | 1 week | 0 |
| 5 | P0 Tools (first 3) | 1 week | 3 |
| 6 | P0 Tools (next 3) | 1 week | 3 |
| 7 | P1 Tools (first 5) | 1 week | 5 |
| 8 | P1 Tools (next 6) | 1 week | 6 |
| 9 | P2 Tools + Polish | 1 week | 3 |
| 10 | Launch Prep + Production | 1 week | 0 |

**Total: 10 weeks, 20 tools.**

---

## 3. Sprint 1: Foundation + Platform

**Goals:**
- Set up Next.js project with TypeScript strict.
- Configure Tailwind, shadcn/ui, ESLint, Prettier, Husky.
- Set up pnpm workspaces.
- Configure CI/CD (GitHub Actions + Vercel).
- Implement site layout (header, footer, theme toggle).

**Deliverables:**
- Next.js 15+ project running locally.
- Design system tokens (CSS custom properties).
- Header with nav, search placeholder, theme toggle.
- Footer with legal links.
- Dark/light mode working.
- CI pipeline (lint, type-check, test, build).
- Vercel preview deploys on PR.

**Risks:**
- Tailwind 4+ configuration changes (mitigation: follow official docs).
- shadcn/ui component compatibility (mitigation: use stable versions).

**Dependencies:** None (starting point).

**Definition of Done:**
- `pnpm dev` runs without errors.
- `pnpm build` succeeds.
- CI passes on PR.
- Preview deployment accessible.
- Lighthouse accessibility ≥95 on homepage.

**Duration:** 1 week (40 hours).

---

## 4. Sprint 2: Auth + Database + RBAC

**Goals:**
- Set up Supabase project (Auth + Postgres + Storage).
- Implement authentication (email/password + OAuth).
- Implement Drizzle ORM schemas for Identity context.
- Implement RLS policies.
- Implement RBAC (6 roles, permission checking).
- Implement Edge Middleware for JWT verification.

**Deliverables:**
- Supabase project configured.
- Login, register, password reset pages.
- `useCurrentUser()` hook.
- Edge Middleware verifying JWT.
- `hasPermission()`, `requirePermission()` utilities.
- Identity schema (users, sessions, history_entries, favorites).
- RLS policies on all Identity tables.
- Auth events emitted.

**Risks:**
- Supabase Auth Edge compatibility (mitigation: test in Edge runtime).
- RLS policy complexity (mitigation: start simple, test thoroughly).

**Dependencies:** Sprint 1.

**Definition of Done:**
- User can register, log in, log out.
- JWT verified at Edge (no DB call per request).
- RLS policies tested (users access only own data).
- Auth events in analytics.

**Duration:** 1 week (40 hours).

---

## 5. Sprint 3: Tool Engine + Registry

**Goals:**
- Implement `ToolEngine<TInput, TOutput>` abstraction.
- Implement all 7 stage types.
- Implement build-time registry codegen.
- Implement manifest Zod schema.
- Create tool template scaffold.
- Implement `ToolLayout` and core components.

**Deliverables:**
- `packages/tool-engine/` package.
- `ToolEngine` component with lifecycle orchestration.
- Stage type definitions.
- `ToolError` hierarchy.
- `scripts/generate-registry.ts` producing 7 artifacts.
- `scripts/verify-registry.ts` CI check.
- Tool template scaffold (`pnpm new-tool`).
- `ToolLayout`, `ErrorDisplay`, `SuccessToast`, `FileDropzone`, `ToolInputForm` components.
- Standard analytics events auto-emitted by Tool Engine.

**Risks:**
- Tool Engine abstraction complexity (mitigation: start with one tool to validate).
- Codegen script complexity (mitigation: incremental implementation).

**Dependencies:** Sprint 1, Sprint 2.

**Definition of Done:**
- Tool Engine renders all lifecycle states.
- `pnpm new-tool image image-test` creates valid tool folder.
- `pnpm gen:registry` generates all 7 artifacts.
- CI fails if generated files stale.
- Standard analytics events emit correctly.

**Duration:** 1 week (40 hours).

---

## 6. Sprint 4: SEO + Analytics + Search

**Goals:**
- Implement manifest-driven SEO metadata.
- Implement JSON-LD structured data.
- Implement sitemap and robots.txt.
- Implement analytics adapter pattern (GA4, PostHog, Plausible).
- Implement event queue with offline support.
- Implement consent management.
- Implement search (Pagefind).
- Implement monitoring (health check, Sentry, Lighthouse CI).

**Deliverables:**
- `generateMetadata()` using `seo-meta.ts`.
- JSON-LD injection (SoftwareApplication, FAQPage, BreadcrumbList).
- `/sitemap.xml` and `/robots.txt` routes.
- `packages/analytics/` with adapters.
- `AnalyticsClient` with IndexedDB queue.
- Consent banner.
- `SearchInput`, `SearchResults`, `SearchPage` components.
- `/api/health` endpoint.
- Sentry integration.
- Lighthouse CI in GitHub Actions.

**Risks:**
- Pagefind integration complexity (mitigation: follow Pagefind docs).
- Consent management GDPR compliance (mitigation: legal review).

**Dependencies:** Sprint 3.

**Definition of Done:**
- Every tool page has complete SEO metadata.
- Structured data validates via Schema.org validator.
- Analytics events emit to configured providers.
- Search returns results in <100ms.
- Health check returns all subsystem statuses.
- Lighthouse CI runs on PRs.

**Duration:** 1 week (40 hours).

---

## 7. Sprint 5: P0 Tools (First 3)

**Goals:**
- Implement first 3 P0 tools: Image Resizer, Image Compressor, PDF Merge.
- Validate Tool Engine pattern with real tools.
- Pass all PC-04 quality gates.

**Deliverables:**
- `src/tools/image/image-resize/` — complete tool with all 13 PC-03 items.
- `src/tools/image/image-compress/` — complete tool.
- `src/tools/pdf/pdf-merge/` — complete tool.
- Each tool: manifest, stages, components, tests, SEO, analytics.

**Risks:**
- Image processing edge cases (large files, exotic formats).
- PDF manipulation library (pdf-lib) edge cases.

**Dependencies:** Sprint 3, Sprint 4.

**Definition of Done:**
- All 3 tools in `Stable` lifecycle.
- All 7 quality gates passed per tool.
- Lighthouse: Performance ≥90, Accessibility ≥95, SEO ≥95.
- E2E tests pass.
- Tools appear in search and navigation.

**Duration:** 1 week (40 hours).

---

## 8. Sprint 6: P0 Tools (Next 3)

**Goals:**
- Implement remaining 3 P0 tools: JSON Formatter, Password Generator, Word Counter.
- These are simpler tools (pure JS, no file processing).

**Deliverables:**
- `src/tools/developer/json-formatter/`
- `src/tools/developer/password-generator/`
- `src/tools/text/word-counter/`

**Risks:** Minimal (simple tools, pattern established in Sprint 5).

**Dependencies:** Sprint 5.

**Definition of Done:**
- All 3 tools in `Stable`.
- All 7 quality gates passed.
- All P0 tools (6 total) complete.

**Duration:** 1 week (40 hours).

---

## 9. Sprint 7: P1 Tools (First 5)

**Goals:**
- Implement 5 P1 tools: Image Cropper, Image Format Converter, PDF Split, PDF Compress, UUID Generator.

**Deliverables:**
- 5 complete tools following established pattern.

**Risks:**
- PDF Compress complexity (mitigation: use pdf-lib; may need server-side for aggressive compression).

**Dependencies:** Sprint 6.

**Definition of Done:**
- All 5 tools in `Stable`.
- All 7 quality gates passed.
- 11 total tools live.

**Duration:** 1 week (40 hours).

---

## 10. Sprint 8: P1 Tools (Next 6)

**Goals:**
- Implement 6 P1 tools: Base64 Encoder/Decoder, Unit Converter, Color Converter, Meta Tag Generator, Loan Calculator, BMI Calculator.

**Deliverables:**
- 6 complete tools.

**Risks:** Minimal.

**Dependencies:** Sprint 7.

**Definition of Done:**
- All 6 tools in `Stable`.
- 17 total tools live.

**Duration:** 1 week (40 hours).

---

## 11. Sprint 9: P2 Tools + Polish

**Goals:**
- Implement 3 P2 tools: Passport Photo Maker, Hash Generator, Lorem Ipsum Generator.
- Polish existing tools based on testing feedback.
- Performance optimization.

**Deliverables:**
- 3 complete tools.
- Bug fixes from Sprint 5-8 testing.
- Performance optimizations (bundle size, lazy loading).

**Risks:**
- Passport Photo Maker complexity (face detection via MediaPipe).

**Dependencies:** Sprint 8.

**Definition of Done:**
- All 3 tools in `Stable`.
- 20 total tools live.
- Performance budgets met for all tools.
- No known bugs.

**Duration:** 1 week (40 hours).

---

## 12. Sprint 10: Launch Prep + Production

**Goals:**
- Final production readiness.
- Deploy to production.
- Submit sitemap to Google Search Console.
- Set up monitoring and alerting.
- Launch.

**Deliverables:**
- Production environment configured.
- All env vars set.
- Custom domain configured.
- Sitemap submitted to Google and Bing.
- Monitoring dashboard live.
- Alerting configured.
- Backup verified.
- Rollback procedure tested.
- Launch announcement.

**Risks:**
- Production environment differences (mitigation: test thoroughly on Preview).
- SEO indexing delay (mitigation: submit sitemap early).

**Dependencies:** Sprint 9.

**Definition of Done:**
- Production site live at custom domain.
- All 20 tools accessible and functional.
- Health check passes.
- Monitoring dashboard shows green.
- Sitemap submitted.
- 10k MAU target set.

**Duration:** 1 week (40 hours).

---

## 13. Sprint Summary

| Sprint | Goal | Tools | Cumulative |
|--------|------|-------|------------|
| 1 | Foundation | 0 | 0 |
| 2 | Auth + DB | 0 | 0 |
| 3 | Tool Engine | 0 | 0 |
| 4 | SEO + Analytics + Search | 0 | 0 |
| 5 | P0 Tools (3) | 3 | 3 |
| 6 | P0 Tools (3) | 3 | 6 |
| 7 | P1 Tools (5) | 5 | 11 |
| 8 | P1 Tools (6) | 6 | 17 |
| 9 | P2 Tools (3) + Polish | 3 | 20 |
| 10 | Launch | 0 | 20 |

**Total: 10 weeks, 20 tools, production launch.**

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Sprint Planning. 10 sprints over 10 weeks delivering 20 tools from foundation to production launch. |

## 15. Cross References

- `36_ProjectBootstrapRoadmap` — Milestone-based roadmap.
- `37_MVPImplementationPlan` — Tool prioritization.
- `38_ProjectBacklog` — Detailed backlog with estimates.
- `40_DefinitionOfReady` — When work can begin.
- `41_ProjectChecklist` — Master checklist.
