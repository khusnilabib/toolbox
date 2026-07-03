# 44 — AI Decision Tree

> **Purpose:** Decision trees for common AI implementation decisions. Follow the tree; do not skip steps.
> **Last Updated:** 2026-06-28 · **Revision:** 1.0.0

---

## 1. Component Decision Tree

```
Need a UI component?
│
├─ Is it a primitive (Button, Input, Card, Dialog, etc.)?
│   └─ YES → Use @packages/ui. Do NOT create custom. (EC-10, ADR-022)
│
├─ Is it a shared composite (PageContainer, EmptyState, ToolCard)?
│   └─ YES → Check src/shared/components/. Reuse if exists. (EC-03, ADR-015)
│
├─ Is it tool-specific?
│   └─ YES → Place in tool's components/ folder.
│
└─ Is it genuinely new and shared?
    │
    ├─ Search @packages/ui → exists? → Use it.
    ├─ Search src/shared/components → exists? → Use it.
    ├─ Can existing be extended via props? → Extend it.
    └─ Genuinely new → Create in src/shared/components/ or @packages/ui/
        └─ Justify in PR description (EC-03). Document in 14_ACD.
```

## 2. Database Decision Tree

```
Need to persist data?
│
├─ Is it temporary processing data (tool input/output)?
│   └─ YES → Browser-local only. IndexedDB or memory. (LOCK-02, DGA-01, ADR-064)
│
├─ Is it long-term user value (history, favorites, profile)?
│   └─ YES → Database (Identity Context). But tool must still work without DB. (LOCK-06, ADR-029)
│
├─ Is it content (articles, media)?
│   └─ YES → Database (Content Context). Isolated from tools. (DGA-05, ADR-068)
│
├─ Is it admin/config (feature flags, audit, settings)?
│   └─ YES → Database (Platform Ops Context). Audited. (DGA-07, ADR-070)
│
├─ Is it analytics (events, metrics)?
│   └─ YES → Database (Analytics Context). Events via canonical schema. (DGA-02, ADR-065)
│
└─ Is it search index / SEO metadata / tool manifest?
    └─ NO → These are generated from manifest or in code. Not in DB. (DGA-03, DGA-04)
```

## 3. Authentication Decision Tree

```
Does the feature require authentication?
│
├─ Is it core tool usage (browse, upload, process, preview, download)?
│   └─ NO → Guest access. No auth required. (LOCK-07, ADR-007)
│
├─ Is it history save, favorites, cloud sync?
│   └─ YES → Prompt registration at point of action. Non-blocking. (LOCK-07, PC-06)
│
├─ Is it premium feature (batch, AI, cloud sync)?
│   └─ YES → Require auth + premium subscription. Free alternative offered. (PC-06, ADR-059)
│
├─ Is it admin action?
│   └─ YES → Require admin or super_admin role. RBAC enforced. (LOCK-11, 23_RBAC)
│
└─ Is it content editing?
    └─ YES → Require editor role. RBAC enforced. (23_RBAC)
```

## 4. SEO Decision Tree

```
Need SEO for a page?
│
├─ Is it a tool page?
│   └─ YES → All SEO from manifest.seo field. No hardcoded SEO. (DGA-03, ADR-066)
│       ├─ Title (50-60 chars), Description (150-160 chars)
│       ├─ JSON-LD: SoftwareApplication + FAQPage + BreadcrumbList
│       ├─ Min 3 FAQ, min 3 related tools
│       ├─ Open Graph + Twitter Card
│       └─ Canonical URL
│
├─ Is it a category page?
│   └─ YES → Generated from registry. Standard metadata.
│
├─ Is it a content article?
│   └─ YES → SEO from Content Context article record.
│
└─ Is it a marketing page?
    └─ YES → Hardcoded in page metadata (exception to DGA-03 for non-tool pages).
```

## 5. Analytics Decision Tree

```
Need to track a user action?
│
├─ Is it one of the 10 standard events? (tool_viewed, tool_started, etc.)
│   └─ YES → Tool Engine auto-emits. Do NOT emit manually. (PC-07, ADR-060)
│
├─ Is it a tool-specific custom event?
│   └─ YES → Declare in manifest.analytics.events. Emit via useAnalytics(). (PC-07)
│
├─ Is it an admin action?
│   └─ YES → Server-side audit log (platform_ops.audit_entries). Immutable. (DGA-07, ADR-070)
│
├─ Is it a search event?
│   └─ YES → Emit search_performed, search_result_clicked, search_abandoned.
│
└─ Is it a page view?
    └─ YES → Emit page_viewed. Auto-tracked.
```

## 6. API Decision Tree

```
Need an API endpoint?
│
├─ Is it internal (called by our own frontend)?
│   └─ YES → Use Next.js Server Action. Mark with 'use server'. (05_ProjectStructure §8.3)
│       ├─ Validate input with Zod
│       ├─ Check auth (requirePermission)
│       └─ Return { data } or { error }
│
├─ Is it a server-side tool endpoint?
│   └─ YES → Next.js API Route at /api/v1/tools/[slug]/execute. (20_APIConvention)
│
├─ Is it a webhook?
│   └─ YES → Next.js API Route. Validate signature. Idempotent.
│
└─ Is it a public API (Phase 3+)?
    └─ YES → Versioned (/api/v1/...). Documented. Rate limited. API key auth.
```

## 7. Manifest Decision Tree

```
Creating a new tool?
│
├─ Does it solve exactly ONE problem?
│   └─ NO → Split into multiple tools. (PC-01, ADR-054)
│
├─ Can it run browser-side?
│   └─ YES → execution: 'browser'. (LOCK-02, ADR-028)
│   └─ NO → execution: 'server'. Justify in FBRD. Show consent UI. (LOCK-02)
│
├─ Fill all manifest fields:
│   ├─ Identity (slug, category, title, lifecycle, version)
│   ├─ Product Contract (purpose, userProblem, inputs, outputs, validation, states)
│   ├─ SEO (all fields per 21_SEOSpecification)
│   ├─ Discoverability (relatedTools, min 3)
│   ├─ Analytics (custom events, funnel steps)
│   └─ Limits (maxInputSize, requiresAuth, premiumOnly)
│
├─ Run pnpm gen:registry
├─ Verify CI passes
└─ Pass all 7 quality gates before Stable. (PC-04, ADR-057)
```

## 8. Tool Decision Tree

```
Should this be a tool?
│
├─ Does it solve exactly one user problem?
│   └─ NO → Not a tool. Consider article, workflow, or split. (PC-01)
│
├─ Does it follow the Tool Engine lifecycle?
│   └─ NO → If it can't fit Input→Validation→Processing→Preview→Download, propose ADR. (LOCK-03)
│
├─ Can it run browser-side?
│   └─ Prefer browser. Server only if AI inference, OCR, or large file processing. (LOCK-02)
│
├─ Is there an existing tool that does this?
│   └─ YES → Don't create duplicate. Extend existing. (EC-02, EC-03)
│
└─ Create tool:
    1. Draft FBRD entry (13_FBRD)
    2. Get FBRD approved
    3. pnpm new-tool [category] [slug]
    4. Implement manifest + stages
    5. Write tests
    6. Pass quality gates
    7. Promote to Stable
```

## 9. Admin Decision Tree

```
Need an admin module or action?
│
├─ Which role is required?
│   ├─ editor → content management
│   ├─ admin → tool management, feature flags, users
│   └─ super_admin → role changes, system config
│
├─ Is the action a write (create/update/delete)?
│   └─ YES → Must be audited. Audit entry: actor, action, resource, before/after. (DGA-07, ADR-070)
│
├─ Use admin layout (src/app/(admin)/admin/)
├─ Use admin components from 14_ACD
├─ Server actions with requirePermissionWithAudit()
└─ Verify RLS policies don't block
```

## 10. Performance Decision Tree

```
Performance concern?
│
├─ Bundle size too large?
│   ├─ Is tool code lazy-loaded? → If not, add dynamic import.
│   ├─ Are heavy libs lazy-loaded? → If not, lazy-load (pdf-lib, tesseract.js).
│   └─ Can dependency be replaced with native API? → Replace. (04_TechStack §8)
│
├─ TTFB too slow?
│   ├─ Is page SSR'd at Edge? → Verify Edge runtime.
│   ├─ Are there unnecessary DB calls? → Remove or cache.
│   └─ Is middleware heavy? → Optimize.
│
├─ Lighthouse score below budget?
│   ├─ Performance <90 → Check bundle, images, fonts.
│   ├─ Accessibility <95 → Check ARIA, contrast, keyboard.
│   └─ SEO <95 → Check metadata, structured data, sitemap.
│
└─ Is this a regression?
    └─ YES → Treat as bug. Fix before merge. (EC-07)
```

## 11. Security Decision Tree

```
Security concern?
│
├─ Is there user input?
│   └─ YES → Validate with Zod at boundary. (EC-08, ADR-020)
│
├─ Is there dynamic HTML?
│   └─ YES → Use DOMPurify. Never raw dangerouslySetInnerHTML. (08_CodingStandards AD-07)
│
├─ Is there a DB query?
│   └─ YES → Use Drizzle parameterized queries. Never string concat. RLS enforced.
│
├─ Are there secrets?
│   └─ YES → In env vars only. Never committed. secretlint verifies. (POC-06)
│
├─ Is it an admin action?
│   └─ YES → requirePermissionWithAudit(). RBAC enforced. Audited. (DGA-07)
│
├─ Is it a file upload?
│   └─ YES → Validate type + size. Server-side tools: temp storage with 1h TTL.
│
└─ Is it a new dependency?
    └─ YES → Chief Architect approval required. Check for vulnerabilities. (LOCK-09)
```

## 12. Deployment Decision Tree

```
Ready to deploy?
│
├─ Has pre-deployment checklist been completed? (32_DeploymentGuide §9)
│   └─ NO → Complete checklist first.
│
├─ All CI checks pass?
│   └─ NO → Fix issues. Do not deploy.
│
├─ Lighthouse scores within budget?
│   └─ NO → Fix performance/accessibility/SEO. Do not deploy.
│
├─ Documentation updated? (EC-01)
│   └─ NO → Update docs. Do not deploy.
│
├─ Rollback plan documented?
│   └─ NO → Document rollback. Do not deploy.
│
├─ DB migrations reviewed?
│   └─ If breaking → Follow multi-step pattern. (POC-04)
│
├─ Feature flags configured?
│   └─ If gradual rollout → Configure flags. (DGA-06)
│
└─ Deploy via CI/CD (merge to main).
    └─ Post-deploy: monitor 30 min. If issues → instant rollback. (POC-03, POC-04)
```
