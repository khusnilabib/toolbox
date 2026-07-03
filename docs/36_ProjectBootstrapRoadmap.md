# 36 — Project Bootstrap Roadmap

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** All governance layers (operational roadmap)

---

## 1. Purpose

This document defines the **complete implementation roadmap** for [PROJECT_NAME], from Sprint 0 (project bootstrap) through all tool categories. Each milestone defines objectives, dependencies, deliverables, and exit criteria.

## 2. Sprint 0: Foundation

**Objectives:**
- Set up project repository, tooling, and infrastructure.
- Establish development environment.
- Configure CI/CD pipeline.

**Dependencies:** None (starting point).

**Deliverables:**
- GitHub repository with `main` branch protection.
- Next.js 15+ project with TypeScript strict, Tailwind, shadcn/ui.
- pnpm workspaces configured.
- ESLint, Prettier, Husky, lint-staged configured.
- Vercel project connected.
- Supabase project created.
- GitHub Actions CI pipeline (lint, type-check, test, build).
- `.env.example` with all required env vars.
- `docs/` repository with all 41 documents.

**Exit Criteria:**
- `pnpm dev` runs locally.
- `pnpm build` succeeds.
- CI pipeline runs on PR.
- Preview deployment creates on PR.
- All governance docs committed.

## 3. Authentication

**Objectives:**
- Implement user authentication (email + OAuth).
- Set up RBAC roles (guest, user, premium, editor, admin, super_admin).
- Implement Edge Middleware for auth checks.

**Dependencies:** Sprint 0.

**Deliverables:**
- Supabase Auth configured (email/password, Google, GitHub OAuth).
- `src/identity/` context with presentation/application/domain/infrastructure layers.
- `useCurrentUser()` hook.
- Login, register, password reset pages.
- Edge Middleware verifying JWT.
- RBAC permission checking utilities (`hasPermission`, `requirePermission`).
- Session management.

**Exit Criteria:**
- User can register, log in, log out.
- JWT verified at Edge (no DB call per request).
- RBAC roles assigned correctly.
- Auth events emitted (`user_signed_in`, `user_signed_out`).

## 4. Database

**Objectives:**
- Set up Drizzle ORM schemas per bounded context.
- Implement RLS policies on all tables.
- Set up migration pipeline.

**Dependencies:** Sprint 0, Authentication.

**Deliverables:**
- `drizzle/` directory with per-context migration folders.
- Drizzle schemas for: Identity, Content, Platform Ops, Analytics.
- RLS policies on every table.
- `pnpm drizzle-kit generate` and `migrate` working.
- Database seed script for dev data.

**Exit Criteria:**
- All migrations applied to Supabase.
- RLS policies tested (users can only access own data).
- Seed data loads successfully.

## 5. Layout

**Objectives:**
- Implement site-wide layout (header, footer, navigation).
- Implement design system tokens (light/dark mode).
- Implement `ToolLayout` component.

**Dependencies:** Sprint 0.

**Deliverables:**
- `globals.css` with CSS custom properties (design tokens).
- `tailwind.config.ts` with token mappings.
- Root layout (`src/app/layout.tsx`) with theme provider.
- Header with search, navigation, theme toggle, login/account.
- Footer with legal links.
- `ToolLayout` component (PC-05 canonical layout).
- `PageContainer`, `SectionHeading` shared components.
- Dark/light mode toggle with no FOUC.

**Exit Criteria:**
- Layout renders on all pages.
- Dark/light mode works (no flash).
- Mobile responsive (360px).
- Lighthouse accessibility ≥95.

## 6. Admin

**Objectives:**
- Implement admin panel structure at `/admin`.
- Implement admin modules: Dashboard, Users, Tools, Audit Trail.
- Implement admin RBAC enforcement.

**Dependencies:** Authentication, Database.

**Deliverables:**
- `/admin` route group with layout.
- Dashboard module (real-time metrics, system health).
- Users module (list, detail, role management).
- Tools module (inventory, lifecycle management).
- Audit Trail module (immutable audit log viewer).
- Admin RBAC (minimum `editor` role for `/admin`).
- Every admin action audited.

**Exit Criteria:**
- Admin panel accessible only to authorized roles.
- All write actions audited.
- Dashboard shows real-time metrics.
- Users module can change roles (with audit).

## 7. Tool Engine

**Objectives:**
- Implement `ToolEngine<TInput, TOutput>` abstraction.
- Implement stage types (Input, Validation, Processing, Preview, Download, History, Share).
- Implement error handling (typed errors, PC-08).

**Dependencies:** Layout, Database.

**Deliverables:**
- `packages/tool-engine/` package.
- `ToolEngine` component with lifecycle orchestration.
- Stage type definitions and contracts.
- Typed `ToolError` hierarchy.
- Auto-emission of 10 standard analytics events (PC-07).
- `useAnalytics()` hook.

**Exit Criteria:**
- Tool Engine renders all lifecycle states (empty, input, validating, processing, preview, error, downloaded).
- Standard analytics events auto-emitted.
- Errors follow PC-08 (what/why/how).

## 8. Registry

**Objectives:**
- Implement build-time tool registry codegen.
- Generate: registry, navigation, sitemap, SEO metadata, admin inventory, search index, analytics config.

**Dependencies:** Tool Engine.

**Deliverables:**
- `scripts/generate-registry.ts` script.
- `scripts/verify-registry.ts` CI check.
- `src/generated/` directory with: registry.ts, navigation.ts, sitemap.ts, seo-meta.ts, admin-inventory.ts, search-index.ts, analytics-config.ts.
- `pnpm gen:registry` command.
- CI verification (generated files match manifests).

**Exit Criteria:**
- Adding a manifest → registry auto-updates.
- CI fails if generated files out of sync.
- All 7 generated artifacts produced.

## 9. Manifest

**Objectives:**
- Implement ToolManifest Zod schema.
- Implement manifest validation.
- Create tool template scaffold.

**Dependencies:** Tool Engine, Registry.

**Deliverables:**
- `packages/tool-engine/src/manifest-schema.ts` (Zod schema).
- `packages/tool-engine/src/types.ts` (TypeScript types inferred from Zod).
- `scripts/tool-template/` scaffold.
- `pnpm new-tool [category] [slug]` command.
- Manifest validation in CI.

**Exit Criteria:**
- Manifest validates against Zod schema.
- `pnpm new-tool image image-resize` creates valid tool folder.
- Invalid manifests fail CI.

## 10. SEO

**Objectives:**
- Implement manifest-driven SEO metadata.
- Implement JSON-LD structured data.
- Implement sitemap generation.
- Implement robots.txt.

**Dependencies:** Registry, Manifest.

**Deliverables:**
- `generateMetadata()` in tool page using `seo-meta.ts`.
- JSON-LD injection (SoftwareApplication, FAQPage, BreadcrumbList).
- `/sitemap.xml` route.
- `/robots.txt` route.
- Open Graph and Twitter Card tags.
- Canonical URLs.

**Exit Criteria:**
- Every tool page has complete SEO metadata.
- Structured data validates via Schema.org validator.
- Sitemap includes all stable/beta tools.
- Lighthouse SEO ≥95.

## 11. Analytics

**Objectives:**
- Implement analytics adapter pattern (GA4, PostHog, Plausible).
- Implement event queue with offline support.
- Implement consent management.
- Implement nightly growth metrics computation.

**Dependencies:** Tool Engine, Database.

**Deliverables:**
- `packages/analytics/` package.
- `AnalyticsAdapter` interface.
- GA4, PostHog, Plausible adapters.
- `AnalyticsClient` with IndexedDB queue.
- Consent banner and management.
- Nightly metrics computation script.
- Analytics dashboard in admin.

**Exit Criteria:**
- Events emit to configured providers.
- Events queue offline and flush on reconnect.
- Consent respected (no analytics before consent).
- Growth metrics computed nightly.

## 12. Search

**Objectives:**
- Implement build-time search index generation.
- Implement client-side search (Pagefind).
- Implement search UI components.

**Dependencies:** Registry, Manifest.

**Deliverables:**
- `scripts/generate-search-index.ts` script.
- Pagefind integration.
- `SearchInput`, `SearchResults`, `SearchPage` components.
- Search analytics events (`search_performed`, `search_result_clicked`).
- Empty state and no-results state.

**Exit Criteria:**
- Search returns results in <100ms.
- Search index generated from manifests.
- Search works on mobile.
- Search analytics events emitted.

## 13. Monitoring

**Objectives:**
- Implement health check endpoints.
- Set up Sentry error tracking.
- Set up Vercel Analytics.
- Set up Lighthouse CI.
- Implement admin monitoring dashboard.

**Dependencies:** Layout, Admin.

**Deliverables:**
- `/api/health` endpoint with subsystem checks.
- Sentry integration (client + server).
- Vercel Analytics configured.
- Lighthouse CI in GitHub Actions.
- Admin dashboard with monitoring widgets.
- Alerting configuration.

**Exit Criteria:**
- Health check returns status for all subsystems.
- Errors tracked in Sentry.
- Lighthouse scores tracked in CI.
- Admin dashboard shows real-time metrics.

## 14. Testing

**Objectives:**
- Set up Vitest, Playwright, Testing Library.
- Set up axe-core accessibility testing.
- Set up Lighthouse CI.
- Write initial test suite.

**Dependencies:** Sprint 0.

**Deliverables:**
- Vitest configured with coverage.
- Playwright configured.
- Testing Library configured.
- axe-core integration.
- Test fixtures (`tests/fixtures/`).
- CI runs all tests.

**Exit Criteria:**
- `pnpm test` runs unit tests.
- `pnpm test:e2e` runs E2E tests.
- Coverage targets defined.
- CI fails on test failure.

## 15. Deployment

**Objectives:**
- Configure Vercel production deployment.
- Set up environment variables.
- Configure custom domain.
- Set up monitoring and alerting.

**Dependencies:** All previous milestones.

**Deliverables:**
- Vercel production deployment configured.
- All env vars set (Preview + Production).
- Custom domain configured.
- SSL certificate (Vercel automatic).
- Post-deploy monitoring checklist.
- Rollback procedure documented.

**Exit Criteria:**
- Production deployment succeeds.
- Custom domain serves site.
- Health check passes in production.
- Rollback tested.

## 16. Image Tools

**Objectives:**
- Implement image tool category.
- Tools: Image Resizer, Image Compressor, Image Cropper, Image Format Converter, Passport Photo Maker.

**Dependencies:** Tool Engine, Registry, Manifest, SEO, Analytics.

**Deliverables:** 5 image tools, each with:
- Complete manifest (PC-02).
- All 13 completion items (PC-03).
- All 7 quality gates passed (PC-04).
- Browser-first execution (LOCK-02).
- SEO metadata (DGA-03).
- Analytics events (PC-07).

**Exit Criteria:** All 5 tools in `Stable` lifecycle.

## 17. PDF Tools

**Objectives:**
- Implement PDF tool category.
- Tools: PDF Merge, PDF Split, PDF Compress, PDF Rotate, PDF Watermark.

**Dependencies:** Tool Engine, Registry, Manifest.

**Deliverables:** 5 PDF tools (same standards as Image Tools).

**Exit Criteria:** All 5 tools in `Stable` lifecycle.

## 18. Developer Tools

**Objectives:**
- Implement developer tool category.
- Tools: JSON Formatter, Base64 Encoder/Decoder, UUID Generator, Password Generator, Hash Generator, Regex Tester.

**Dependencies:** Tool Engine, Registry, Manifest.

**Deliverables:** 6 developer tools (same standards).

**Exit Criteria:** All 6 tools in `Stable` lifecycle.

## 19. Text Tools

**Objectives:**
- Implement text tool category.
- Tools: Word Counter, Case Converter, Lorem Ipsum Generator, Text Diff, Markdown Preview.

**Dependencies:** Tool Engine, Registry, Manifest.

**Deliverables:** 5 text tools (same standards).

**Exit Criteria:** All 5 tools in `Stable` lifecycle.

## 20. Calculator Tools

**Objectives:**
- Implement calculator tool category.
- Tools: Loan Calculator, BMI Calculator, Percentage Calculator, Age Calculator, Scientific Calculator.

**Dependencies:** Tool Engine, Registry, Manifest.

**Deliverables:** 5 calculator tools (same standards).

**Exit Criteria:** All 5 tools in `Stable` lifecycle.

## 21. SEO Tools

**Objectives:**
- Implement SEO tool category.
- Tools: Meta Tag Generator, Sitemap Builder, Robots.txt Generator, Open Graph Preview, Schema Markup Generator.

**Dependencies:** Tool Engine, Registry, Manifest.

**Deliverables:** 5 SEO tools (same standards).

**Exit Criteria:** All 5 tools in `Stable` lifecycle.

## 22. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Project Bootstrap Roadmap. Defined 21 milestones from Sprint 0 through all tool categories. |

## 23. Cross References

- `00_Project_Charter` — All governance layers.
- `37_MVPImplementationPlan` — Phase 1 MVP tool prioritization.
- `38_ProjectBacklog` — Detailed backlog.
- `39_SprintPlanning` — Sprint-by-sprint plan.
- `41_ProjectChecklist` — Master checklist.
