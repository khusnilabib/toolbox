# 38 — Project Backlog

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** Phase 1 priorities

---

## 1. Purpose

This document is the **prioritized backlog** for [PROJECT_NAME], organized by platform domain. Each item includes description, dependencies, estimate, priority, and acceptance criteria.

## 2. Priority Levels

| Priority | Description |
|----------|-------------|
| P0 | Critical — must ship for MVP. Blocks launch. |
| P1 | High — should ship for MVP. Important but not blocking. |
| P2 | Medium — nice to have for MVP. Ship if time permits. |
| P3 | Low — post-MVP. Phase 2+. |

## 3. Backlog by Domain

### 3.1 Platform

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| PLT-001 | Next.js 15+ project setup with TypeScript strict | None | 2h | P0 | `pnpm dev` runs; TypeScript strict enabled |
| PLT-002 | Tailwind CSS + shadcn/ui setup | PLT-001 | 2h | P0 | Design tokens in globals.css; shadcn components installed |
| PLT-003 | ESLint, Prettier, Husky, lint-staged | PLT-001 | 1h | P0 | Pre-commit hooks run lint+format |
| PLT-004 | pnpm workspaces configured | PLT-001 | 1h | P0 | `/packages/*` recognized as workspaces |
| PLT-005 | GitHub Actions CI pipeline | PLT-001 | 2h | P0 | CI runs lint, type-check, test, build on PR |
| PLT-006 | Vercel project connected | PLT-001 | 0.5h | P0 | Preview deploys on PR |
| PLT-007 | Error boundaries (root + tool) | PLT-002 | 1h | P0 | Errors caught; user sees error state not crash |
| PLT-008 | 404 and error pages | PLT-002 | 1h | P0 | Custom 404 and 500 pages |
| PLT-009 | Theme toggle (dark/light) | PLT-002 | 1h | P0 | Toggle works; no FOUC; preference saved |
| PLT-010 | PWA manifest | PLT-006 | 1h | P2 | Installable on mobile |

### 3.2 Authentication

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| AUTH-001 | Supabase Auth configured | PLT-006 | 1h | P0 | Email/password + OAuth enabled |
| AUTH-002 | Login page | AUTH-001, PLT-002 | 2h | P0 | User can log in; validation; error states |
| AUTH-003 | Register page | AUTH-001 | 2h | P0 | User can register; email verification sent |
| AUTH-004 | Password reset flow | AUTH-001 | 2h | P0 | User can request reset; email sent; reset works |
| AUTH-005 | Edge Middleware (JWT verify) | AUTH-001 | 2h | P0 | JWT verified at edge; no DB call per request |
| AUTH-006 | useCurrentUser hook | AUTH-005 | 1h | P0 | Hook returns user or null |
| AUTH-007 | OAuth (Google, GitHub) | AUTH-001 | 2h | P1 | OAuth login works for Google and GitHub |
| AUTH-008 | Session management | AUTH-005 | 1h | P0 | Session refreshes automatically |
| AUTH-009 | Logout flow | AUTH-006 | 0.5h | P0 | User can log out; session cleared |

### 3.3 Admin

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| ADM-001 | Admin layout + route protection | AUTH-005, RBAC-001 | 2h | P0 | `/admin` requires admin role |
| ADM-002 | Dashboard module | ADM-001, OBS-001 | 3h | P0 | Shows uptime, response time, error rate, recent activity |
| ADM-003 | Users module | ADM-001, DB-001 | 3h | P1 | List, search, filter users; view detail; change role |
| ADM-004 | Tools module | ADM-001, REG-001 | 2h | P1 | Tool inventory from registry; lifecycle management |
| ADM-005 | Audit Trail module | ADM-001, DB-004 | 2h | P1 | View immutable audit log; filter by action/actor/date |
| ADM-006 | Feature Flags module | ADM-001, DB-004 | 3h | P2 | List, toggle, set rollout %, targeting rules |
| ADM-007 | Settings module | ADM-001 | 2h | P2 | Platform name, URL, social, ad config |
| ADM-008 | System Health module | ADM-001, OBS-003 | 2h | P1 | Dependency status, error tracking, deploy status |

### 3.4 Tool Engine

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| TE-001 | ToolEngine abstraction | PLT-004 | 4h | P0 | Engine orchestrates 7 lifecycle stages |
| TE-002 | Stage type definitions | TE-001 | 2h | P0 | All 7 stage types defined with contracts |
| TE-003 | ToolError hierarchy | TE-001 | 2h | P0 | Typed errors (validation, processing, quota, auth, server) |
| TE-004 | Standard analytics auto-emit | TE-001, ANA-001 | 2h | P0 | 10 PC-07 events auto-emitted by engine |
| TE-005 | ToolLayout component | TE-001, PLT-002 | 3h | P0 | Renders PC-05 canonical layout |
| TE-006 | ErrorDisplay component | TE-001, PLT-002 | 1h | P0 | Renders PC-08 compliant errors (what/why/how) |
| TE-007 | SuccessToast component | TE-001 | 1h | P0 | Success feedback on download |
| TE-008 | FileDropzone component | PLT-002 | 2h | P0 | Drag-drop + click upload; validation |
| TE-009 | ToolInputForm component | TE-001, PLT-002 | 3h | P0 | RHF + Zod form; field types |

### 3.5 Registry

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| REG-001 | generate-registry.ts script | TE-001 | 3h | P0 | Walks manifests; generates 7 artifacts |
| REG-002 | verify-registry.ts CI check | REG-001 | 1h | P0 | CI fails if generated files stale |
| REG-003 | Tool template scaffold | REG-001 | 2h | P0 | `pnpm new-tool` creates valid folder |
| REG-004 | Dynamic route for tools | REG-001 | 2h | P0 | `/tools/[category]/[slug]` resolves from registry |

### 3.6 Analytics

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| ANA-001 | Event schema (Zod) | PLT-004 | 2h | P0 | Canonical event schema with validation |
| ANA-002 | AnalyticsAdapter interface | ANA-001 | 2h | P0 | Interface defined; adapter pattern |
| ANA-003 | GA4 adapter | ANA-002 | 2h | P1 | GA4 adapter implemented |
| ANA-004 | PostHog adapter | ANA-002 | 2h | P2 | PostHog adapter implemented |
| ANA-005 | Plausible adapter | ANA-002 | 1h | P2 | Plausible adapter implemented |
| ANA-006 | Event queue (IndexedDB) | ANA-002 | 3h | P0 | Events queued offline; flush on reconnect |
| ANA-007 | Consent management | ANA-006 | 2h | P0 | Cookie banner; no analytics before consent |
| ANA-008 | Nightly metrics computation | ANA-001, DB-004 | 3h | P1 | Growth metrics computed nightly |
| ANA-009 | useAnalytics hook | ANA-006 | 1h | P0 | Hook for emitting custom events |

### 3.7 Search

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| SRCH-001 | Search index generation | REG-001 | 2h | P1 | Index generated from manifests at build time |
| SRCH-002 | Pagefind integration | SRCH-001 | 2h | P1 | Client-side search; <100ms query |
| SRCH-003 | SearchInput component | SRCH-002, PLT-002 | 2h | P1 | Header search with instant results dropdown |
| SRCH-004 | SearchPage | SRCH-002 | 2h | P1 | `/search?q=` page for shareable URLs |
| SRCH-005 | Search analytics events | SRCH-002, ANA-009 | 1h | P1 | search_performed, search_result_clicked emitted |

### 3.8 SEO

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| SEO-001 | generateMetadata from manifest | REG-001 | 2h | P0 | Tool page SEO from manifest seo field |
| SEO-002 | JSON-LD structured data | SEO-001 | 2h | P0 | SoftwareApplication, FAQPage, BreadcrumbList |
| SEO-003 | Sitemap generation | REG-001 | 1h | P0 | `/sitemap.xml` with all stable/beta tools |
| SEO-004 | robots.txt | PLT-006 | 0.5h | P0 | Disallow admin/api; allow public |
| SEO-005 | Open Graph + Twitter Card | SEO-001 | 1h | P0 | OG and Twitter tags from manifest |
| SEO-006 | Canonical URLs | SEO-001 | 0.5h | P0 | Canonical URL on every page |
| SEO-007 | Breadcrumb component | SEO-001, PLT-002 | 1h | P0 | Visual breadcrumb + BreadcrumbList JSON-LD |
| SEO-008 | FAQ component | SEO-001, PLT-002 | 1h | P0 | Accordion FAQ from manifest |
| SEO-009 | RelatedTools component | REG-001, PLT-002 | 1h | P0 | Related tools grid from manifest |

### 3.9 Monitoring

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| OBS-001 | Health check endpoint | PLT-006, DB-001 | 2h | P0 | `/api/health` returns status of all subsystems |
| OBS-002 | Sentry integration | PLT-006 | 2h | P0 | Client + server error tracking |
| OBS-003 | Vercel Analytics | PLT-006 | 0.5h | P0 | Core Web Vitals tracked |
| OBS-004 | Lighthouse CI | PLT-005 | 2h | P0 | CI runs Lighthouse; fails if below budget |
| OBS-005 | Structured logging | PLT-006 | 2h | P0 | JSON logs with requestId, userId |
| OBS-006 | Alerting | OBS-001, OBS-002 | 2h | P1 | Alerts on uptime down, error rate spike |

### 3.10 Database

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| DB-001 | Identity schema + migrations | AUTH-001 | 3h | P0 | users, sessions, history_entries, favorites tables |
| DB-002 | RLS policies (Identity) | DB-001 | 2h | P0 | Users can only access own data |
| DB-003 | Content schema + migrations | DB-001 | 2h | P1 | articles, media_assets, taxonomy_terms |
| DB-004 | Platform Ops schema + migrations | DB-001 | 3h | P0 | feature_flags, audit_entries, system_health_checks |
| DB-005 | Analytics schema + migrations | DB-001 | 2h | P1 | events, daily_aggregates |
| DB-006 | RLS policies (all contexts) | DB-002 | 3h | P0 | Every table has RLS |
| DB-007 | Seed data script | DB-001 | 1h | P0 | Dev data for testing |

### 3.11 RBAC

| ID | Description | Dependencies | Estimate | Priority | Acceptance Criteria |
|----|-------------|--------------|----------|----------|---------------------|
| RBAC-001 | Role definitions + permissions | AUTH-001 | 2h | P0 | 6 roles defined; role→permission mapping |
| RBAC-002 | hasPermission utility | RBAC-001 | 1h | P0 | Permission checking function |
| RBAC-003 | requirePermission server util | RBAC-002 | 1h | P0 | Server-side permission check with throw |
| RBAC-004 | Audit logging for admin actions | RBAC-003, DB-004 | 2h | P0 | Every admin action audited |

### 3.12 Tools (20 MVP Tools)

| ID | Tool | Category | Dependencies | Estimate | Priority |
|----|------|----------|--------------|----------|----------|
| TOOL-001 | Image Resizer | image | TE-001, REG-001 | 4h | P0 |
| TOOL-002 | Image Compressor | image | TE-001, REG-001 | 6h | P0 |
| TOOL-003 | PDF Merge | pdf | TE-001, REG-001 | 6h | P0 |
| TOOL-004 | JSON Formatter | developer | TE-001, REG-001 | 3h | P0 |
| TOOL-005 | Password Generator | developer | TE-001, REG-001 | 3h | P0 |
| TOOL-006 | Word Counter | text | TE-001, REG-001 | 3h | P0 |
| TOOL-007 | Image Cropper | image | TE-001, REG-001 | 4h | P1 |
| TOOL-008 | Image Format Converter | image | TE-001, REG-001 | 4h | P1 |
| TOOL-009 | PDF Split | pdf | TE-001, REG-001 | 5h | P1 |
| TOOL-010 | PDF Compress | pdf | TE-001, REG-001 | 6h | P1 |
| TOOL-011 | UUID Generator | developer | TE-001, REG-001 | 2h | P1 |
| TOOL-012 | Base64 Encoder/Decoder | developer | TE-001, REG-001 | 2h | P1 |
| TOOL-013 | Unit Converter | converters | TE-001, REG-001 | 4h | P1 |
| TOOL-014 | Color Converter | converters | TE-001, REG-001 | 3h | P1 |
| TOOL-015 | Meta Tag Generator | seo | TE-001, REG-001 | 4h | P1 |
| TOOL-016 | Loan Calculator | calculators | TE-001, REG-001 | 3h | P1 |
| TOOL-017 | BMI Calculator | calculators | TE-001, REG-001 | 2h | P1 |
| TOOL-018 | Passport Photo Maker | image | TE-001, REG-001 | 8h | P2 |
| TOOL-019 | Hash Generator | developer | TE-001, REG-001 | 3h | P2 |
| TOOL-020 | Lorem Ipsum Generator | text | TE-001, REG-001 | 2h | P2 |

## 4. Total Estimates

| Domain | P0 Hours | P1 Hours | P2 Hours | Total |
|--------|----------|----------|----------|-------|
| Platform | 11.5 | 0 | 1 | 12.5 |
| Authentication | 10.5 | 2 | 0 | 12.5 |
| Admin | 5 | 7 | 5 | 17 |
| Tool Engine | 21 | 0 | 0 | 21 |
| Registry | 8 | 0 | 0 | 8 |
| Analytics | 11 | 5 | 3 | 19 |
| Search | 0 | 9 | 0 | 9 |
| SEO | 9 | 0 | 0 | 9 |
| Monitoring | 8.5 | 2 | 0 | 10.5 |
| Database | 14 | 4 | 0 | 18 |
| RBAC | 6 | 0 | 0 | 6 |
| Tools (20) | 25 | 33 | 13 | 71 |
| **Total** | **129.5** | **62** | **22** | **213.5** |

**Note:** Estimates are engineering hours; actual calendar time depends on team size and parallelism.

## 5. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Project Backlog. 60+ items across 12 domains with descriptions, dependencies, estimates, priorities, acceptance criteria. Total ~213 engineering hours. |

## 6. Cross References

- `36_ProjectBootstrapRoadmap` — Milestone-based roadmap.
- `37_MVPImplementationPlan` — MVP tool prioritization.
- `39_SprintPlanning` — Sprint-by-sprint delivery plan.
- `41_ProjectChecklist` — Master checklist.
