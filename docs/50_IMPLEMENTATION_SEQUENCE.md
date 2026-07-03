# 50 — Implementation Sequence

> **Purpose:** Definitive implementation order. Every phase has objectives, deliverables, dependencies, exit criteria, complexity, and risk.
> **Last Updated:** 2026-06-28 · **Revision:** 1.0.0

---

## Implementation Flow

```
Sprint 0 (Foundation)
    ↓
Infrastructure
    ↓
Design System
    ↓
Authentication
    ↓
RBAC
    ↓
Database
    ↓
Admin
    ↓
Tool Engine
    ↓
Registry
    ↓
Manifest
    ↓
Search
    ↓
SEO
    ↓
Analytics
    ↓
Monitoring
    ↓
Testing
    ↓
Image Tools
    ↓
PDF Tools
    ↓
Developer Tools
    ↓
Text Tools
    ↓
Converters
    ↓
Calculators
    ↓
SEO Tools
    ↓
Public Launch
    ↓
Growth
    ↓
Marketplace
```

---

## Phase Details

### Phase 1: Sprint 0 — Foundation

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Set up project repository, tooling, infrastructure |
| **Deliverables** | GitHub repo, Next.js project, pnpm workspaces, ESLint/Prettier/Husky, Vercel+Supabase connected, CI pipeline |
| **Dependencies** | None (starting point) |
| **Exit Criteria** | `pnpm dev` runs; `pnpm build` succeeds; CI passes on PR; Preview deploys |
| **Complexity** | Low |
| **Risk Level** | Low |
| **Duration** | 1 week |

### Phase 2: Infrastructure

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Configure Vercel, Supabase, Sentry, env vars, CI/CD |
| **Deliverables** | Vercel project, Supabase project, Sentry, GitHub Actions, `.env.example`, all env vars set |
| **Dependencies** | Phase 1 |
| **Exit Criteria** | Preview deploys on PR; Supabase accessible; Sentry receiving errors; CI runs lint+test+build |
| **Complexity** | Low |
| **Risk Level** | Low |
| **Duration** | 2 days |

### Phase 3: Design System

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Implement design tokens, shadcn/ui, dark/light mode, layout |
| **Deliverables** | `globals.css` with CSS custom properties; `tailwind.config.ts`; header, footer, theme toggle; `ToolLayout` component; `PageContainer`, `SectionHeading` |
| **Dependencies** | Phase 1 |
| **Exit Criteria** | Dark/light works (no FOUC); Lighthouse accessibility ≥95; mobile responsive (360px) |
| **Complexity** | Medium |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 4: Authentication

| Attribute | Detail |
|-----------|--------|
| **Objectives** | User auth (email + OAuth), session management, Edge Middleware |
| **Deliverables** | Supabase Auth configured; login/register/reset pages; `useCurrentUser()` hook; Edge Middleware JWT verify |
| **Dependencies** | Phase 2 |
| **Exit Criteria** | User can register, log in, log out; JWT verified at Edge; OAuth works (Google, GitHub) |
| **Complexity** | Medium |
| **Risk Level** | Medium (Edge runtime compatibility) |
| **Duration** | 4 days |

### Phase 5: RBAC

| Attribute | Detail |
|-----------|--------|
| **Objectives** | 6 roles, permission checking, 3-layer enforcement |
| **Deliverables** | Role definitions; `hasPermission()`, `requirePermission()`, `requirePermissionWithAudit()`; RLS policies |
| **Dependencies** | Phase 4, Phase 6 |
| **Exit Criteria** | RBAC enforced at Edge + server action + RLS; audit logging works |
| **Complexity** | Medium |
| **Risk Level** | Medium (RLS policy correctness) |
| **Duration** | 3 days |

### Phase 6: Database

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Drizzle schemas per context, RLS, migrations, seed data |
| **Deliverables** | Identity, Content, Platform Ops, Analytics schemas; RLS on all tables; migration pipeline; seed script |
| **Dependencies** | Phase 2 |
| **Exit Criteria** | All migrations applied; RLS tested; seed data loads |
| **Complexity** | Medium |
| **Risk Level** | Medium (RLS complexity) |
| **Duration** | 4 days |

### Phase 7: Admin

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Admin panel at `/admin`, Dashboard, Users, Tools, Audit Trail modules |
| **Deliverables** | Admin layout; Dashboard (metrics); Users (list, role change); Tools (inventory, lifecycle); Audit Trail (viewer) |
| **Dependencies** | Phase 5, Phase 6 |
| **Exit Criteria** | Admin accessible only to authorized roles; all write actions audited; dashboard shows metrics |
| **Complexity** | High |
| **Risk Level** | Medium |
| **Duration** | 1 week |

### Phase 8: Tool Engine

| Attribute | Detail |
|-----------|--------|
| **Objectives** | `ToolEngine<TInput,TOutput>`, 7 stage types, error handling, auto analytics |
| **Deliverables** | `packages/tool-engine/`; ToolEngine component; stage types; ToolError hierarchy; auto-emit 10 events |
| **Dependencies** | Phase 3, Phase 6 |
| **Exit Criteria** | Engine renders all lifecycle states; standard events emit; errors follow PC-08 |
| **Complexity** | High |
| **Risk Level** | Medium (abstraction correctness) |
| **Duration** | 1 week |

### Phase 9: Registry

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Build-time codegen, 7 generated artifacts, CI verification |
| **Deliverables** | `generate-registry.ts`; `verify-registry.ts`; 7 generated files in `src/generated/`; `pnpm new-tool` command |
| **Dependencies** | Phase 8 |
| **Exit Criteria** | Adding manifest → registry updates; CI fails if stale; all 7 artifacts produced |
| **Complexity** | Medium |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 10: Manifest

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Zod schema, validation, tool template scaffold |
| **Deliverables** | `manifest-schema.ts`; TypeScript types; `scripts/tool-template/`; `pnpm new-tool` works; CI validates manifests |
| **Dependencies** | Phase 8, Phase 9 |
| **Exit Criteria** | Manifest validates; `pnpm new-tool` creates valid folder; invalid manifests fail CI |
| **Complexity** | Low |
| **Risk Level** | Low |
| **Duration** | 2 days |

### Phase 11: Search

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Pagefind integration, search index, search UI |
| **Deliverables** | `generate-search-index.ts`; Pagefind index; `SearchInput`, `SearchResults`, `SearchPage` components; search events |
| **Dependencies** | Phase 9 |
| **Exit Criteria** | Search returns results <100ms; index from manifests; search works on mobile; events emitted |
| **Complexity** | Medium |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 12: SEO

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Manifest-driven SEO, JSON-LD, sitemap, robots.txt |
| **Deliverables** | `generateMetadata()` from `seo-meta.ts`; JSON-LD injection; `/sitemap.xml`; `/robots.txt`; OG/Twitter tags; canonical URLs |
| **Dependencies** | Phase 9 |
| **Exit Criteria** | Every tool page has complete SEO; structured data valid; sitemap includes all tools; Lighthouse SEO ≥95 |
| **Complexity** | Medium |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 13: Analytics

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Adapter pattern, event queue, consent, growth metrics |
| **Deliverables** | `packages/analytics/`; GA4/PostHog/Plausible adapters; `AnalyticsClient` with IndexedDB; consent banner; nightly metrics |
| **Dependencies** | Phase 8, Phase 6 |
| **Exit Criteria** | Events emit to providers; queue works offline; consent respected; metrics computed nightly |
| **Complexity** | High |
| **Risk Level** | Medium (vendor adapter correctness) |
| **Duration** | 1 week |

### Phase 14: Monitoring

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Health checks, Sentry, Vercel Analytics, Lighthouse CI, admin dashboard |
| **Deliverables** | `/api/health`; Sentry; Vercel Analytics; Lighthouse CI; admin monitoring widgets; alerting |
| **Dependencies** | Phase 7 |
| **Exit Criteria** | Health check returns subsystem status; errors tracked; Lighthouse in CI; dashboard shows metrics |
| **Complexity** | Medium |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 15: Testing

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Vitest, Playwright, Testing Library, axe-core, Lighthouse CI, initial tests |
| **Deliverables** | Test configs; test fixtures; CI runs all tests; coverage tracking |
| **Dependencies** | Phase 1 |
| **Exit Criteria** | `pnpm test` and `pnpm test:e2e` work; CI fails on test failure; coverage tracked |
| **Complexity** | Low |
| **Risk Level** | Low |
| **Duration** | 2 days |

### Phase 16: Image Tools (5 tools)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Image Resizer, Compressor, Cropper, Format Converter, Passport Photo |
| **Deliverables** | 5 complete tools (all 13 PC-03 items, all 7 PC-04 gates) |
| **Dependencies** | Phase 8-15 (all infrastructure) |
| **Exit Criteria** | All 5 tools in `Stable`; Lighthouse scores met; E2E tests pass |
| **Complexity** | Medium-High (Passport Photo is complex) |
| **Risk Level** | Medium |
| **Duration** | 1.5 weeks |

### Phase 17: PDF Tools (4-5 tools)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | PDF Merge, Split, Compress, Rotate, Watermark |
| **Deliverables** | 4-5 complete tools |
| **Dependencies** | Phase 16 (pattern established) |
| **Exit Criteria** | All tools in `Stable` |
| **Complexity** | Medium (pdf-lib library) |
| **Risk Level** | Medium (PDF edge cases) |
| **Duration** | 1 week |

### Phase 18: Developer Tools (5-6 tools)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | JSON Formatter, UUID Generator, Password Generator, Base64, Hash Generator, Regex Tester |
| **Deliverables** | 5-6 complete tools |
| **Dependencies** | Phase 16 (pattern established) |
| **Exit Criteria** | All tools in `Stable` |
| **Complexity** | Low (pure JS, no file processing) |
| **Risk Level** | Low |
| **Duration** | 4 days |

### Phase 19: Text Tools (3-5 tools)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Word Counter, Case Converter, Lorem Ipsum, Text Diff, Markdown Preview |
| **Deliverables** | 3-5 complete tools |
| **Dependencies** | Phase 16 |
| **Exit Criteria** | All tools in `Stable` |
| **Complexity** | Low |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 20: Converters (2 tools)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Unit Converter, Color Converter (HEX/RGB/HSL) |
| **Deliverables** | 2 complete tools |
| **Dependencies** | Phase 16 |
| **Exit Criteria** | All tools in `Stable` |
| **Complexity** | Low |
| **Risk Level** | Low |
| **Duration** | 2 days |

### Phase 21: Calculators (2-5 tools)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Loan Calculator, BMI Calculator, Percentage, Age, Scientific |
| **Deliverables** | 2-5 complete tools |
| **Dependencies** | Phase 16 |
| **Exit Criteria** | All tools in `Stable` |
| **Complexity** | Low |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 22: SEO Tools (2-5 tools)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Meta Tag Generator, Sitemap Builder, Robots.txt Generator, OG Preview, Schema Markup |
| **Deliverables** | 2-5 complete tools |
| **Dependencies** | Phase 16 |
| **Exit Criteria** | All tools in `Stable` |
| **Complexity** | Low-Medium |
| **Risk Level** | Low |
| **Duration** | 3 days |

### Phase 23: Public Launch

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Production deployment, sitemap submission, monitoring, launch |
| **Deliverables** | Production live; custom domain; sitemap submitted; monitoring active; launch announcement |
| **Dependencies** | All previous phases |
| **Exit Criteria** | Production site live; all tools accessible; health check passes; 10k MAU target set |
| **Complexity** | Low |
| **Risk Level** | Medium (production readiness) |
| **Duration** | 3 days |

### Phase 24: Growth

| Attribute | Detail |
|-----------|--------|
| **Objectives** | 10k → 100k MAU; SEO optimization; content creation; A/B experiments |
| **Deliverables** | Growth metrics dashboard; content calendar; experiment framework; optimization iterations |
| **Dependencies** | Phase 23 |
| **Exit Criteria** | 100k MAU; conversion rate ≥2%; 3+ A/B experiments run |
| **Complexity** | Ongoing |
| **Risk Level** | Low |
| **Duration** | Ongoing (Phase 2) |

### Phase 25: Marketplace (Phase 4)

| Attribute | Detail |
|-----------|--------|
| **Objectives** | Plugin marketplace, verified publishers, ratings, reviews, collections |
| **Deliverables** | Plugin signing/sandboxing; marketplace UI; publisher verification; rating/review system; revenue share |
| **Dependencies** | Phase 24 (sustainable platform) |
| **Exit Criteria** | Third-party tools publishable; marketplace browseable; revenue share working |
| **Complexity** | Very High |
| **Risk Level** | High |
| **Duration** | Phase 4 (multi-quarter) |

---

## Summary

| Phase | Duration | Complexity | Risk |
|-------|----------|------------|------|
| 1-2 (Foundation) | 1.5 weeks | Low | Low |
| 3-7 (Platform) | 3 weeks | Medium-High | Medium |
| 8-15 (Infrastructure) | 4 weeks | Medium-High | Medium |
| 16-22 (Tools) | 4 weeks | Low-Medium | Low-Medium |
| 23 (Launch) | 3 days | Low | Medium |
| **Total to Launch** | **~13 weeks** | | |
| 24-25 (Growth/Marketplace) | Ongoing | High | High |

## Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Implementation Sequence. 25 phases from Sprint 0 through Marketplace. |

## Cross References

- `36_ProjectBootstrapRoadmap` — Milestone-based roadmap.
- `37_MVPImplementationPlan` — MVP tool list.
- `38_ProjectBacklog` — Detailed backlog.
- `39_SprintPlanning` — Sprint-by-sprint plan.
- `41_ProjectChecklist` — Master checklist.
- `51_PROJECT_HEALTH_DASHBOARD` — Living dashboard.
