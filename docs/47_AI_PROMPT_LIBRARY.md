# 47 — AI Prompt Library

> **Purpose:** Categorized library of reusable prompts for AI-assisted development.
> **Last Updated:** 2026-06-28 · **Revision:** 1.0.0
>
> **Every prompt instructs AI to consult:** AI_MASTER_CONTEXT (42), ADR Repository (06), and relevant technical documents before producing code.

---

## How to Use

1. Copy the prompt text.
2. Replace `[PLACEHOLDERS]` with specifics.
3. Paste into new AI conversation.
4. AI follows the AI Development Workflow (35).

---

## 1. Create a New Tool

```
Read 42_AI_MASTER_CONTEXT, 06_ArchitectureDecisionRecords (search for tool-related ADRs), 12_ToolManifestSpecification, 13_FBRD, 45_AI_TOOL_TEMPLATE.

Create a new tool: [TOOL_NAME] in category [CATEGORY].

Problem it solves: [DESCRIPTION]

Follow the AI Development Workflow (35_AI_DevelopmentWorkflow):
1. Identify applicable governance (LOCKs, ECs, PCs, DGAs, POCs).
2. Search ADR repository for relevant decisions.
3. Read 45_AI_TOOL_TEMPLATE for canonical structure.
4. Propose implementation plan (folder structure, manifest, stages, tests).
5. Wait for my approval before writing code.

The tool must:
- Solve exactly ONE problem (PC-01).
- Have a complete product contract in manifest (PC-02).
- Run browser-side if possible (LOCK-02).
- Follow the Tool Engine lifecycle (LOCK-03).
- Include all 13 completion items (PC-03).
- Emit all 10 standard analytics events (PC-07).
```

## 2. Refactor a Tool

```
Read 42_AI_MASTER_CONTEXT, 06_ArchitectureDecisionRecords, 08_CodingStandards, 45_AI_TOOL_TEMPLATE.

Refactor the tool at src/tools/[CATEGORY]/[SLUG]/.

Issue: [DESCRIBE ISSUE — e.g., "processing stage is too slow", "code duplication", "missing tests"]

Follow the AI Development Workflow:
1. Read existing manifest and stages.
2. Identify the root cause.
3. Propose refactoring plan (what changes, why, trade-offs).
4. Wait for approval.
5. Implement changes.
6. Ensure all 13 PC-03 completion items still pass.
7. Update documentation if behavior changed.

Do NOT change the manifest slug or break backward compatibility.
```

## 3. Review Architecture

```
Read 42_AI_MASTER_CONTEXT, 06_ArchitectureDecisionRecords, 02_SAD, 03_DDD, 05_ProjectStructure.

Review the architecture of [COMPONENT/FEATURE/MODULE].

Check:
- Does it follow the layered architecture? (Presentation → Application → Domain → Infrastructure)
- Does it respect bounded context boundaries? (No cross-context imports)
- Does it follow LOCK-04 (modular, independent, reusable)?
- Are there ADR precedents? If not, is a new ADR needed?
- Are there any architectural violations (boundary breaches, coupling)?

Provide:
1. Compliance assessment (pass/fail per governance article).
2. Architectural issues found.
3. Recommended fixes with trade-offs.
4. ADR references for each recommendation.
```

## 4. Review Performance

```
Read 42_AI_MASTER_CONTEXT, 08_CodingStandards (§Performance Budget), 26_ObservabilitySpecification.

Review performance of [PAGE/COMPONENT/TOOL].

Check against budgets:
- TTFB <500ms P95
- Tool code chunk <200KB gzipped
- Total JS per page <500KB gzipped
- Lighthouse Performance ≥90
- Lighthouse Accessibility ≥95
- Lighthouse SEO ≥95

Analyze:
1. Bundle size (is tool code lazy-loaded?).
2. Render performance (unnecessary re-renders?).
3. Image optimization (next/image?).
4. Font loading (next/font?).
5. Database queries (N+1? unnecessary calls?).

Provide specific optimization recommendations with estimated impact.
```

## 5. Review Security

```
Read 42_AI_MASTER_CONTEXT, 08_CodingStandards (§Security Rules), 23_RBAC, 19_DatabaseDesign (§RLS).

Review security of [COMPONENT/FEATURE/API ROUTE].

Check:
- Input validated with Zod at every boundary? (EC-08)
- Output sanitized? (No raw HTML without DOMPurify)
- RBAC enforced? (requirePermission in server actions)
- RLS policies on all DB tables?
- No secrets in client bundles?
- No dangerouslySetInnerHTML without DOMPurify?
- No eval or new Function?
- Rate limiting on API routes?
- Secure headers configured?

Provide:
1. Security assessment (vulnerabilities found).
2. Risk level per finding (critical/high/medium/low).
3. Recommended fixes.
```

## 6. Generate Tests

```
Read 42_AI_MASTER_CONTEXT, 31_TestingStrategy, 45_AI_TOOL_TEMPLATE (§Tests).

Generate tests for [COMPONENT/TOOL/FEATURE] at [FILE_PATH].

Requirements:
- Unit tests for all pure functions (Vitest).
- Component tests for React components (Testing Library).
- E2E test for user flow (Playwright).
- Accessibility test (axe-core).
- Test file colocated in tests/ subdirectory.
- Coverage target: Domain ≥90%, Application ≥80%, Tool stages ≥85%.

Test cases:
1. Happy path (valid input → expected output).
2. Edge cases (empty input, max size, invalid format).
3. Error states (validation failure, processing failure).
4. Accessibility (keyboard nav, ARIA, contrast).

Generate the test file and verify it passes with `pnpm test`.
```

## 7. Generate Documentation

```
Read 42_AI_MASTER_CONTEXT, 35_AI_DevelopmentWorkflow (Step 9).

Generate documentation for [FEATURE/TOOL/CHANGE].

Requirements (EC-01):
- Update relevant docs/ files.
- Add revision history entry.
- Verify cross-references are live.
- Update ADR if architectural change.
- Update tool README if tool behavior changed.

Documents to update:
- [LIST SPECIFIC DOCS]
- Revision history with specific change description.
- Cross-references to related docs.

Do NOT create new documentation files unless absolutely necessary. Prefer updating existing.
```

## 8. Create Migration

```
Read 42_AI_MASTER_CONTEXT, 19_DatabaseDesign (§Migration Strategy), 06_ArchitectureDecisionRecords.

Create a database migration for [CHANGE DESCRIPTION].

Requirements:
- Use Drizzle ORM schema modification.
- Generate migration with `pnpm drizzle-kit generate`.
- Forward-compatible if possible (additive: new column/table).
- If breaking: follow multi-step pattern (add → deploy → backfill → deploy → drop).
- Migration scoped to correct bounded context schema.
- RLS policies on new tables.

Provide:
1. Schema change (TypeScript Drizzle code).
2. Generated SQL migration.
3. Migration plan (zero-downtime if breaking).
4. Rollback procedure.
```

## 9. Create Admin Module

```
Read 42_AI_MASTER_CONTEXT, 29_AdminSpecification, 46_AI_ADMIN_TEMPLATE, 23_RBAC.

Create a new admin module: [MODULE_NAME] at /admin/[module].

Purpose: [DESCRIPTION]

Follow 46_AI_ADMIN_TEMPLATE:
1. Page structure (list, detail, create/edit).
2. RBAC permission check (which role?).
3. Server actions with Zod validation.
4. Audit logging for all write actions (DGA-07).
5. Error handling (20_APIConvention format).
6. Accessibility (WCAG AA).
7. Tests (list, create, permission denial).

Propose the module structure and wait for approval before implementing.
```

## 10. Fix Bugs

```
Read 42_AI_MASTER_CONTEXT and search 06_ArchitectureDecisionRecords for relevant ADRs.

Bug: [DESCRIBE BUG — symptoms, expected behavior, actual behavior]

Location: [FILE/COMPONENT/ROUTE]

Follow:
1. Read the affected code.
2. Identify root cause (not symptom).
3. Propose fix with trade-offs.
4. Wait for approval.
5. Implement fix.
6. Add test that reproduces the bug (prevents regression).
7. Verify fix doesn't introduce new issues.
8. Update documentation if behavior changed.

Do NOT apply quick fixes that bypass governance. Follow all LOCKs, ECs, PCs.
```

## 11. Optimize SEO

```
Read 42_AI_MASTER_CONTEXT, 21_SEOSpecification, 12_ToolManifestSpecification (§SEO).

Optimize SEO for tool: [TOOL_SLUG].

Check:
- Title (50-60 chars, includes primary keyword).
- Description (150-160 chars, action-oriented, includes "free"/"private").
- Keywords (3-10, researched).
- JSON-LD valid (Schema.org validator).
- FAQ (min 3, real questions).
- Related tools (min 3, sensible).
- Canonical URL correct.
- Open Graph image (1200x630px).
- Lighthouse SEO ≥95.

Provide:
1. Current SEO assessment.
2. Keyword research recommendations.
3. Specific manifest.seo field updates.
4. Expected impact on search ranking.
```

## 12. Optimize Accessibility

```
Read 42_AI_MASTER_CONTEXT, 15_UDS (§Accessibility Standards), 10_DesignSystem (§Accessibility).

Optimize accessibility for [PAGE/COMPONENT/TOOL].

Check WCAG 2.1 AA:
- Semantic HTML (button, nav, main, article, section, aside, header, footer).
- Keyboard navigation (all interactive elements, logical tab order, no traps).
- Focus visibility (focus-visible: outline).
- Screen reader (ARIA labels, aria-live for dynamic content).
- Color contrast (body ≥7:1, large text ≥4.5:1).
- Reduced motion (prefers-reduced-motion respected).
- Touch targets (≥44x44px on mobile).
- Forms (labels associated, aria-required, error descriptions).
- Images (alt text, decorative aria-hidden).

Provide:
1. Accessibility assessment (violations found).
2. Specific code fixes.
3. axe-core test additions.
```

## 13. Optimize Bundle Size

```
Read 42_AI_MASTER_CONTEXT, 08_CodingStandards (§Performance Budget).

Optimize bundle size for [PAGE/TOOL].

Current: [CURRENT_SIZE]KB gzipped. Target: <200KB (tool) or <500KB (total page).

Analyze:
1. Is tool code lazy-loaded via dynamic import?
2. Are heavy libraries (pdf-lib, tesseract.js) lazy-loaded?
3. Can any dependency be replaced with native Web API?
4. Are there unused imports?
5. Is tree-shaking working?
6. Can shared vendor chunk be split further?

Provide:
1. Bundle analysis (which dependencies contribute most).
2. Specific optimizations (lazy-load, replace, remove).
3. Expected size reduction.
```

## 14. Create Analytics

```
Read 42_AI_MASTER_CONTEXT, 16_EventSchemaSpecification, 17_AnalyticsArchitecture, 12_ToolManifestSpecification (§Analytics).

Create analytics for [FEATURE/TOOL].

Requirements:
- Use canonical event schema (16_EventSchemaSpecification).
- Standard 10 events auto-emitted by Tool Engine (don't emit manually).
- Custom events declared in manifest.analytics.events.
- Events validated with Zod at emission.
- PII minimized (userId/anonymousId only).
- Consent respected (no analytics before consent).

Provide:
1. Event design (names, triggers, payloads).
2. Manifest analytics field updates.
3. useAnalytics() calls in components.
4. Funnel steps definition.
```

## 15. Generate API

```
Read 42_AI_MASTER_CONTEXT, 20_APIConvention, 05_ProjectStructure (§Server Actions).

Create API endpoint for [FEATURE].

Requirements:
- RESTful conventions, versioned (/api/v1/...).
- JSON-only with Zod validation.
- JWT auth (Bearer token).
- RBAC permission check.
- Rate limiting.
- Consistent error format (code, message, details, requestId).
- Deprecation policy followed (DGA-08).

Decide:
- Server Action (internal) vs API Route (public/server-side tool)?
- Required permission?
- Request/response schemas?

Provide:
1. Endpoint design (URL, method, request, response).
2. Zod schemas.
3. Server action or API route implementation.
4. Tests.
```

## 16. Generate Database Schema

```
Read 42_AI_MASTER_CONTEXT, 19_DatabaseDesign, 03_DDD (§Bounded Contexts).

Create database schema for [FEATURE].

Requirements:
- Schema in correct bounded context (identity, content, platform_ops, billing, analytics).
- Drizzle ORM TypeScript definition.
- RLS policies on every table.
- Standard columns: id (UUID), created_at, updated_at.
- Snake_case table names (plural), snake_case columns.
- No cross-schema foreign keys.
- Indexes for query patterns.

Provide:
1. Drizzle schema definition.
2. RLS policies (SQL).
3. Migration SQL.
4. Index definitions.
```
