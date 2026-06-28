# 08 — Coding Standards

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.1.0
> **Implements:** LOCK-04 (Modular), LOCK-09 (AI Discipline); EC-01 (Documentation First), EC-02 (One Source of Truth), EC-03 (Component Reuse First), EC-07 (Performance Budget), EC-08 (Security by Default), EC-09 (Testing Philosophy), EC-10 (Design System Governance); PC-03 (Tool Completion Standard), PC-04 (Quality Gates), PC-08 (Error Experience)

---

## 1. Purpose

This Coding Standards document defines the mandatory rules for writing code in [PROJECT_NAME]. It operationalizes the Engineering Constitution articles that govern code quality: EC-01 (documentation first), EC-02 (one source of truth), EC-03 (component reuse first), EC-07 (performance budget), EC-08 (security by default), EC-09 (testing philosophy), and EC-10 (design system governance).

Without explicit coding standards, a codebase accumulates inconsistency: one file uses `any`, another uses unknown; one team uses React Query, another uses raw fetch; one engineer adds a 50KB dependency for a one-liner. Over months, the codebase becomes a patchwork that resists change. Coding standards prevent this by making the right choice the default and the wrong choice a deliberate, documented exception.

This document is enforced via ESLint, Prettier, TypeScript compiler options, Husky pre-commit hooks, and code review. Standards that cannot be enforced automatically are enforced via review checklist (§10). Every PR must pass automated checks AND satisfy the review checklist.

## 2. Scope

### 2.1 In Scope

- TypeScript configuration and strict mode rules.
- ESLint rules and custom boundary enforcement.
- Prettier formatting configuration.
- Code style rules (naming within files, structure, patterns).
- Performance budget numbers and enforcement.
- Security coding rules (input validation, output sanitization, secrets handling).
- Testability requirements for engines and shared code.
- Design system compliance rules.
- Code review checklist.
- File size limits and refactoring triggers.

### 2.2 Out of Scope

- File and folder naming conventions → `07_FolderStructure`.
- Variable, function, type naming → `09_NamingConvention`.
- Design tokens and visual design → `10_DesignSystem`.
- Testing strategy and framework choices → `23_TestingStrategy`.
- PR workflow and branching → `22_DevelopmentGuideline`.

## 3. Architectural Decisions

### AD-01 — TypeScript Strict Configuration

**Context.** TypeScript's default settings allow many unsafe patterns (implicit any, null indexing, unchecked optional access). Without strict mode, type safety is illusory.

**Decision.** TypeScript configuration enforces:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

**Consequences.**
- ✅ Maximum type safety from the compiler.
- ✅ Many bugs caught at compile time.
- ⚠️ Slightly more verbose code; justified.

**Implements:** EC-08 (Security by Default — type safety is a security property).

### AD-02 — No `any` Type

**Context.** `any` defeats TypeScript's purpose. Code with `any` is essentially JavaScript — type errors pass through silently.

**Decision.** The `any` type is banned via ESLint rule `@typescript-eslint/no-explicit-any`. When the type is genuinely unknown, use `unknown` and narrow with type guards or Zod schemas.

**Exceptions:** None. If you genuinely need `any`, propose an ADR.

**Implements:** EC-08, EC-02 (one source of truth — types are the source).

### AD-03 — Zod at Every IO Boundary

**Context.** TypeScript types vanish at runtime. Data from external sources (user input, API responses, file metadata, environment variables) is not type-checked at runtime without explicit validation.

**Decision.** Every IO boundary is validated with a Zod schema:
- API request bodies and query parameters.
- API response payloads (when from external services).
- Form submissions.
- Environment variables at boot.
- Tool manifest fields.
- File upload metadata.
- LocalStorage / IndexedDB reads.

The Zod schema is the single source of truth; TypeScript types are inferred via `z.infer<typeof schema>`.

**Consequences.**
- ✅ Runtime type safety at all trust boundaries.
- ✅ Single source of truth — no drift between types and validators.
- ⚠️ Small runtime cost; negligible.

**Implements:** EC-08 (Security — input validation), EC-02 (One Source of Truth).

### AD-04 — Boundary Enforcement via ESLint

**Context.** `02_SAD` AD-01 and `05_ProjectStructure` AD-07 mandate strict layer boundaries. Without automated enforcement, engineers violate boundaries under deadline pressure.

**Decision.** ESLint `no-restricted-imports` rules enforce:
- `presentation/` cannot import from `infrastructure/`.
- `domain/` cannot import from React, Next.js, or any context's `infrastructure/`.
- `src/tools/` cannot import from any context's `infrastructure/` (LOCK-06).
- Cross-context internal imports are blocked; only published APIs (server actions) are allowed.

**Consequences.**
- ✅ Boundary violations fail lint, not review.
- ✅ LOCK-06 (database optional) enforced structurally.
- ⚠️ Some legitimate cross-boundary needs require server actions as indirection.

**Implements:** LOCK-04 (Modular), LOCK-06 (Database Optional), EC-02.

### AD-05 — File Size Limits

**Context.** Large files are hard to navigate, hard to test, and often violate single responsibility. Without limits, files grow indefinitely.

**Decision.** File size limits:
- **Soft limit:** 300 lines per file. Approaching this triggers refactor consideration.
- **Hard limit:** 500 lines per file. Exceeding this blocks PR merge (enforced via ESLint `max-lines`).

**Exceptions:** Generated files (`src/generated/`) are exempt. Test files have a 500-line soft limit, 800-line hard limit.

**Consequences.**
- ✅ Files remain navigable and testable.
- ✅ Single responsibility enforced structurally.
- ⚠️ Some refactor overhead; justified.

**Implements:** `00_Project_Charter` §7.1 (architectural standards — no giant files).

### AD-06 — Performance Budget

**Context.** EC-07 mandates performance budgets. Without specific numbers, "performance budget" is aspirational, not enforceable.

**Decision.** Performance budgets:

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| Tool landing page TTFB (Edge) | <500ms P95 | Vercel Analytics alert |
| Tool first interaction | <1s on 4G mid-tier | Lighthouse CI |
| Tool code chunk (gzipped) | <200KB | Bundle analyzer CI |
| Shared vendor chunk (gzipped) | <300KB | Bundle analyzer CI |
| Total JS for tool page (gzipped) | <500KB | Bundle analyzer CI |
| Image assets | <200KB each, optimized | next/image enforcement |
| Server-side tool cold start | <2s | Vercel logs |
| Lighthouse Performance score | ≥90 | Lighthouse CI |
| Lighthouse Accessibility score | ≥95 | Lighthouse CI |
| Lighthouse SEO score | ≥95 | Lighthouse CI |

Performance regressions (exceeding budget by >10%) block PR merge.

**Implements:** EC-07 (Performance Budget), LOCK-02 (Browser-First — performance angle).

### AD-07 — Security Coding Rules

**Context.** EC-08 mandates security by default. Specific coding rules make "secure by default" concrete.

**Decision.** Security coding rules:

1. **Validate every input.** All external data (user input, API responses, env vars, file uploads) validated with Zod.
2. **Sanitize every output.** HTML output escaped via React's automatic escaping. Dynamic HTML uses `dompurify`. SQL via Drizzle parameterized queries (never string concatenation).
3. **Principle of least privilege.** Server actions check RBAC permissions before executing. Database queries use RLS policies enforced at DB layer.
4. **Secure headers.** `next.config.ts` sets CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
5. **Strict TypeScript.** No `any`; strict mode enabled.
6. **Secrets never committed.** All secrets in env vars; `.env.local` gitignored; `secretlint` runs in pre-commit.
7. **Dependency review.** `pnpm audit` runs in CI. New dependencies require Chief Architect approval (LOCK-09).
8. **No `dangerouslySetInnerHTML`** without explicit review and DOMPurify sanitization.
9. **No `eval` or `new Function`** in any code.
10. **No inline event handlers** in JSX (use React event handlers).

**Implements:** EC-08 (Security by Default).

### AD-08 — Testability Requirements

**Context.** EC-09 mandates testing. Code must be designed for testability; retrofitting tests to untestable code is expensive.

**Decision.** Testability requirements:

1. **Pure functions preferred.** Side effects isolated to specific modules (repositories, services).
2. **Dependency injection.** External dependencies (DB, APIs, time) injected via function parameters or context, not imported directly.
3. **No global mutable state.** Module-level constants are OK; module-level mutable state is not. Use Zustand stores for client state, server actions for server state.
4. **Tool Engine, Registry, Validators, Shared Utilities** designed for independent testing. They have no implicit dependencies on React, DB, or network.
5. **Mocks for external services.** Tests use mocks for Supabase, Stripe, external APIs. Mocks defined per test or in test setup.

**Consequences.**
- ✅ Unit tests are fast and reliable.
- ✅ Refactoring enabled by tests.
- ⚠️ Requires discipline to inject dependencies rather than import directly.

**Implements:** EC-09 (Testing Philosophy).

### AD-09 — Design System Compliance

**Context.** EC-10 mandates that every visual element originates from the Design System. Without enforcement, pages accumulate ad hoc styling.

**Decision.** Design system compliance rules:

1. **No inline styles.** Use Tailwind classes or design system components.
2. **No `style={{...}}` props** except for dynamic values that cannot be expressed in Tailwind (e.g., computed positions).
3. **No CSS files** except `globals.css` (Tailwind imports and CSS custom properties).
4. **Use design tokens.** Colors via `bg-background`, `text-foreground`, etc. Spacing via Tailwind scale. Never hardcoded `#fff` or `padding: 12px`.
5. **Use design system components.** `Button`, `Input`, `Card`, `Dialog`, etc. from `@packages/ui`. Don't reinvent.
6. **Icons from `lucide-react` only.** No SVG sprites, no icon fonts.
7. **Dark mode supported.** Every component works in both light and dark mode via token switching.

**Implements:** EC-10 (Design System Governance), LOCK-10 (Design Philosophy).

### AD-10 — DRY Enforcement

**Context.** EC-02 mandates one source of truth. Without enforcement, duplication accumulates.

**Decision.** DRY enforcement:

1. **Constants in one place.** Shared constants live in `@packages/utils` or context's `domain/`. Never duplicated across files.
2. **Validation logic in Zod schemas.** Validation rules live in Zod schemas, not in if/else chains repeated per use.
3. **Business rules in domain layer.** Business logic lives in domain entities/aggregates, not in components or API routes.
4. **Components reused, not copied.** Before creating a component, search `@packages/ui` and `src/shared/components/` (EC-03).
5. **ESLint `no-duplicate-imports`** prevents duplicate imports within a file.
6. **Code review checklist** includes "Is this logic duplicated anywhere?" question.

**Implements:** EC-02 (One Source of Truth), EC-03 (Component Reuse First).

### AD-11 — Composition Over Inheritance

**Context.** Deep inheritance hierarchies are hard to reason about and refactor. Composition (small, composable pieces) scales better.

**Decision.** Prefer composition over inheritance:
- Components compose via props and children.
- Hooks compose via `useHookA()` calling `useHookB()`.
- Tools compose via Tool Engine stages (each stage is a function, not a class).
- No class inheritance deeper than 1 level. Prefer interfaces + composition.

**Exceptions:** Domain entities MAY use limited inheritance for shared base behavior, documented per case.

**Implements:** `00_Project_Charter` §9 (Coding Rules — prefer composition).

### AD-12 — No Hardcoded Values

**Context.** Hardcoded values (URLs, file size limits, timeouts, magic numbers) scattered across the codebase are impossible to update consistently.

**Decision.** No hardcoded values:
- URLs in `src/shared/config/site-config.ts`.
- Limits (file size, rate limit) in `src/shared/config/limits.ts`.
- Timeouts in `src/shared/config/timeouts.ts`.
- Magic numbers extracted as named constants at the top of the file or in a config.
- Environment-specific values in env vars.

**Exceptions:** Truly local constants (used once, never change) may be inline with a comment explaining the value.

**Implements:** EC-02 (One Source of Truth).

## 4. Design Principles

### P1 — Type Safety Is Security
Strict TypeScript + Zod runtime validation = type errors caught at compile time AND runtime. This is a security property, not just a developer experience.

### P2 — Pure Where Possible
Pure functions are easy to test, easy to reason about, and easy to refactor. Side effects are isolated to specific modules.

### P3 — Fail Loud, Fail Early
Invalid input fails at the boundary (Zod validation), not deep in the call stack. Errors are typed and actionable, not generic "something went wrong."

### P4 — Composition Scales
Small composable pieces (functions, hooks, components) scale better than monolithic inheritance hierarchies.

### P5 — Performance Is a Feature
Performance budgets are enforced like functional requirements. Regressions are bugs.

### P6 — Security Is Proactive
Security rules apply to all code, not just "security-sensitive" code. Defense in depth.

### P7 — Tests Enable Refactoring
Code is written to be tested. Tests are written to enable future refactoring, not to achieve coverage metrics.

## 5. TypeScript Standards

### 5.1 Compiler Configuration
Per AD-01. Strict mode with additional safety flags.

### 5.2 Path Aliases
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@tools/*": ["./src/tools/*"],
    "@shared/*": ["./src/shared/*"],
    "@packages/*": ["./packages/*"]
  }
}
```

### 5.3 Type Definitions
- Shared types in `@packages/types`.
- Context-specific types in context's `domain/schemas/`.
- Tool-specific types in tool's `manifest.ts` (Zod schemas inferred to types).
- Never duplicate a type definition; if needed in multiple places, promote to shared.

### 5.4 Generic Constraints
- Generics constrained with `extends` where possible.
- Avoid unbounded generics `<T>`; use `<T extends unknown>` or specific constraints.

### 5.5 Union Types vs Enums
- Prefer union types (`type Status = 'active' | 'inactive'`) over enums (better tree-shaking, simpler runtime).
- Use enums only when values need to be iterated or reverse-mapped.

### 5.6 Null vs Undefined
- Use `undefined` for "not set" (consistent with JavaScript defaults).
- Use `null` only for explicit "no value" (e.g., JSON from APIs).
- Never use both interchangeably.

## 6. ESLint Configuration

### 6.1 Base Rules
- `next/core-web-vitals` baseline.
- `@typescript-eslint/recommended` and `@typescript-eslint/recommended-type-checked`.
- `eslint-plugin-drizzle` for DB query linting.
- `eslint-plugin-jsx-a11y` for accessibility (EC-06).

### 6.2 Custom Rules
- `no-restricted-imports` (AD-04) — boundary enforcement.
- `@typescript-eslint/no-explicit-any` — ban `any` (AD-02).
- `no-console` in production code — use structured logger.
- `max-lines` — 500 line hard limit (AD-05).
- `react/no-danger` — ban `dangerouslySetInnerHTML` (AD-07).
- `no-eval` — ban `eval` (AD-07).
- `prefer-const` — require `const` where possible.
- `no-unused-vars` — ban unused variables.
- `eqeqeq` — require strict equality.

### 6.3 Rule Severity
- **Error:** Blocks PR merge. Used for security, boundary, type safety rules.
- **Warn:** Shows warning but doesn't block. Used for style preferences.

## 7. Prettier Configuration

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Prettier runs on save (via VS Code workspace config) and on pre-commit (via Husky + lint-staged).

## 8. Code Style Rules

### 8.1 Function Standards
- Functions ≤50 lines preferred. Functions >100 lines require justification.
- Pure functions preferred; side effects isolated.
- Early return for invalid input (guard clauses), not nested if/else.
- Async functions use `async/await`, not `.then()/.catch()`.

### 8.2 Component Standards
- Function components only (no class components).
- One component per file (AD-02 in `07_FolderStructure`).
- Props typed via interface, defined immediately above the component.
- Hooks called at top level, never in conditions or loops.
- Side effects in `useEffect`, with cleanup when needed.

### 8.3 Hook Standards
- Custom hooks prefixed with `use` (e.g., `useToolHistory`).
- Hooks return typed values; never `any`.
- Hooks are pure given their inputs; side effects via `useEffect`.

### 8.4 Server Action Standards
- Marked with `'use server'` directive.
- Input validated with Zod schema.
- RBAC permission check before execution.
- Return typed result; throw typed errors.
- No direct DB access bypassing repository layer.

### 8.5 Error Handling
- Errors are typed (union of error kinds, not `Error`).
- Errors caught at stage boundaries (Tool Engine handles).
- No `try/catch` with empty `catch` block.
- No swallowing errors (catch must at least log).

### 8.6 Import Standards
- Imports sorted: external → internal → relative (enforced via `eslint-plugin-import`).
- No circular imports (detected via `madge` in CI).
- No unused imports (auto-removed via ESLint).
- Named imports preferred over default imports (except for components).

## 9. Performance Standards

### 9.1 Bundle Size
- Per AD-06. Tool chunks <200KB gzipped; total JS per page <500KB gzipped.
- Bundle analyzer runs in CI; regressions block merge.

### 9.2 Lazy Loading
- Tool code lazy-loaded via dynamic import.
- Heavy libraries (pdf-lib, tesseract.js) lazy-loaded only when tool is used.
- Below-the-fold components lazy-loaded via `next/dynamic`.

### 9.3 Image Optimization
- All images via `next/image` (automatic optimization, responsive sizes, lazy loading).
- No `<img>` tags directly.
- SVGs inlined when small (<5KB); otherwise as image files.

### 9.4 Font Loading
- Fonts via `next/font` (automatic optimization, no layout shift).
- Maximum 2 font families loaded.
- Variable fonts preferred (one file, multiple weights).

### 9.5 Caching
- Static assets: immutable cache (1 year).
- HTML: revalidate (1 hour for tool pages, 24 hours for blog).
- API responses: cache explicitly with `Cache-Control` headers.

### 9.6 Render Performance
- Avoid unnecessary re-renders via `useMemo`, `useCallback`, `React.memo`.
- Don't optimize prematurely; measure first with React DevTools profiler.

## 10. Security Standards (Detailed)

### 10.1 Input Validation
- All external input validated with Zod.
- Validation at the boundary (server action entry, API route handler, form submit handler).
- Invalid input returns typed error, never proceeds.

### 10.2 Output Encoding
- React escapes HTML by default; never bypass.
- Dynamic HTML uses `dompurify.sanitize()`.
- SQL via Drizzle parameterized queries; never string concatenation.
- URLs validated before redirect (prevent open redirect).

### 10.3 Authentication
- JWT verified at Edge Middleware (no DB call per request).
- Session refresh automatic via Supabase client.
- Logout invalidates session server-side.

### 10.4 Authorization
- RBAC enforced at server action entry.
- Database RLS policies enforce row-level access.
- Admin actions require admin role; super-admin actions require super-admin.

### 10.5 Secrets Management
- All secrets in env vars (`.env.local` for dev, Vercel env vars for prod).
- `.env.local` in `.gitignore`.
- `secretlint` runs in pre-commit hook.
- No secrets in client bundles; only `NEXT_PUBLIC_*` vars accessible client-side.

### 10.6 HTTP Headers
- Content-Security-Policy configured in `next.config.ts`.
- X-Frame-Options: DENY.
- X-Content-Type-Options: nosniff.
- Referrer-Policy: strict-origin-when-cross-origin.
- Permissions-Policy: restricts camera, microphone, geolocation.

### 10.7 File Upload Security
- File type validated (MIME + extension).
- File size limited per tool (declared in manifest).
- Server-side tools: files stored in temp bucket with 1h TTL.
- No executable file types accepted.

## 11. Testability Requirements (Detailed)

### 11.1 Pure Functions
- Business logic in pure functions, no side effects.
- Side effects (DB, API, file system) isolated to infrastructure layer.

### 11.2 Dependency Injection
- External dependencies passed as parameters or via context.
- No direct imports of `supabase-client` in domain/application layers.
- Use factory functions or context providers.

### 11.3 Mocking Strategy
- Vitest mocks for Supabase, Stripe, external APIs.
- Mocks defined in test setup files per context.
- No real network calls in unit tests.

### 11.4 Test Data
- Test fixtures in `tests/fixtures/`.
- Factory functions for creating test entities.
- No shared mutable test state.

### 11.5 Coverage Targets
- Domain layer: ≥90% line coverage.
- Application layer: ≥80% line coverage.
- Tool stages: ≥85% line coverage.
- Presentation layer: ≥60% line coverage (focus on interaction logic).
- Infrastructure layer: ≥70% line coverage.

Coverage is tracked but not enforced as a hard gate; the gate is "tests exist for critical paths."

## 12. Design System Compliance (Detailed)

### 12.1 Token Usage
- Colors: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, etc.
- Spacing: Tailwind scale (`p-4`, `mt-8`, `gap-2`).
- Typography: `text-sm`, `text-base`, `text-lg`, `font-medium`, `font-semibold`.
- Radius: `rounded-md`, `rounded-lg`, `rounded-full`.
- Shadows: `shadow-sm`, `shadow-md`, `shadow-lg`.

### 12.2 Component Usage
- Use `@packages/ui` components for all primitives.
- Compose primitives into higher-level components in `src/shared/components/`.
- Tool-specific components in tool's `components/` folder.
- No reinventing Button, Input, Select, etc.

### 12.3 Dark Mode
- Every component works in light and dark mode.
- Test both modes in Storybook (Phase 2+) or via dev tools toggle.
- No hardcoded colors; everything via tokens.

### 12.4 Accessibility
- WCAG 2.1 AA conformance (EC-06).
- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`).
- ARIA attributes only when semantic HTML insufficient.
- Keyboard navigation tested per component.
- Focus visibility via Tailwind `focus-visible:` classes.
- Reduced motion via `motion-reduce:` classes.

## 13. Code Review Checklist

Every PR must satisfy this checklist before approval:

### 13.1 Architecture & Boundaries
- [ ] No boundary violations (ESLint passes).
- [ ] No `any` types introduced.
- [ ] File size within limits (300 soft, 500 hard).
- [ ] No new dependencies without ADR approval (LOCK-09).

### 13.2 Type Safety & Validation
- [ ] All IO boundaries validated with Zod.
- [ ] No `as` type assertions without justification.
- [ ] No `!` non-null assertions without justification.
- [ ] Types inferred from Zod schemas, not duplicated.

### 13.3 Security
- [ ] Input validated.
- [ ] Output escaped/sanitized.
- [ ] No secrets in code.
- [ ] RBAC checks in server actions.
- [ ] No `dangerouslySetInnerHTML` without DOMPurify.

### 13.4 Performance
- [ ] Bundle size within budget.
- [ ] Lazy loading where appropriate.
- [ ] No unnecessary re-renders.
- [ ] Images via `next/image`.
- [ ] Lighthouse scores within budget (if UI change).

### 13.5 Testing
- [ ] Tests added for new logic.
- [ ] Tests pass locally.
- [ ] Coverage maintained or improved.
- [ ] E2E tests added for user-facing flows.

### 13.6 Design System
- [ ] No inline styles (except dynamic values).
- [ ] No hardcoded colors/spacing.
- [ ] Components from `@packages/ui`.
- [ ] Dark mode supported.
- [ ] Accessibility verified (keyboard, screen reader).

### 13.7 Documentation
- [ ] Docs updated if behavior changed (EC-01).
- [ ] ADR added/updated if architectural decision changed.
- [ ] Tool README updated if tool behavior changed.
- [ ] JSDoc added for public APIs.

### 13.8 DRY & Reuse
- [ ] No duplicated logic (EC-02).
- [ ] Existing components extended rather than duplicated (EC-03).
- [ ] Constants extracted to config (AD-12).

## 14. Best Practices

### 14.1 When Writing a New Function
1. Make it pure if possible.
2. Type all inputs and outputs.
3. Validate inputs at the boundary.
4. Keep it under 50 lines.
5. Write a test alongside it.

### 14.2 When Writing a New Component
1. Check `@packages/ui` for existing (EC-03).
2. One component per file.
3. Props typed via interface.
4. Use design tokens, not hardcoded values.
5. Verify dark mode and accessibility.
6. Write a component test.

### 14.3 When Adding a Server Action
1. Mark with `'use server'`.
2. Validate input with Zod.
3. Check RBAC permissions.
4. Use repository pattern for DB access.
5. Return typed result; throw typed error.
6. Write integration test.

### 14.4 When Adding a Tool Stage
1. Follow Tool Engine contract (`02_SAD` §6).
2. Pure function where possible.
3. Type input/output via Zod schemas.
4. No side effects except in `history` stage (best-effort).
5. Write unit test for the stage.

### 14.5 When Refactoring
1. Tests must pass before and after.
2. One refactoring per PR (don't mix with feature changes).
3. Update docs if behavior changes.
4. Use TypeScript to find all call sites.

### 14.6 When Fixing a Bug
1. Write a failing test that reproduces the bug.
2. Fix the bug.
3. Verify test passes.
4. Run full test suite to ensure no regression.

## 15. Future Scalability

### 15.1 Scaling Standards to New Contexts
- New contexts inherit these standards automatically.
- Context-specific standards (if any) added as appendix to this document.

### 15.2 Scaling to Multiple Teams
- Each team adopts these standards.
- Cross-team code review ensures consistency.
- Standards changes require ADR.

### 15.3 Automation Roadmap
- Phase 1: ESLint, Prettier, TypeScript, Husky, lint-staged.
- Phase 2: Bundle analyzer in CI, Lighthouse CI, accessibility CI.
- Phase 3: Type coverage tracking, performance regression detection.

## 16. Dependencies

### 16.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4 — LOCKs and ECs these standards implement.
- Depends on `02_SAD` — architectural decisions enforced via ESLint.
- Depends on `04_TechStack` — TypeScript, ESLint, Prettier configurations.
- Depends on `05_ProjectStructure`, `07_FolderStructure` — boundary rules.
- `06_ArchitectureDecisionRecords` — records AD-01 through AD-12.
- `09_NamingConvention` — naming rules within files.
- `10_DesignSystem` — design tokens used in code.
- `22_DevelopmentGuideline` — PR workflow enforcing these standards.
- `23_TestingStrategy` — testing standards complement these.

### 16.2 External Dependencies
- TypeScript 5+, ESLint, Prettier, Husky, lint-staged.
- `eslint-plugin-drizzle`, `eslint-plugin-jsx-a11y`, `eslint-plugin-import`.
- `secretlint` for secrets detection.
- `madge` for circular dependency detection.

### 16.3 Assumptions
- Team accepts the discipline of strict TypeScript, Zod validation, and boundary enforcement.
- CI infrastructure can run all checks within reasonable time (<10 minutes per PR).

## 17. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Coding Standards. Defined TypeScript strict config, no-any rule, Zod-at-boundaries rule, boundary enforcement via ESLint, file size limits, performance budget, security coding rules, testability requirements, design system compliance, code review checklist. |
| 1.1.0 | 2026-06-28 | Chief Architect | Linked coding standards to PC-03 (Tool Completion Standard), PC-04 (Quality Gates), PC-08 (Error Experience). Renumbered cross-references to reflect insertion of `11_ProductConstitution` and `12_ToolManifestSpecification` (docs 11-26 shifted to 13-28). |

## 18. Cross References

- `00_Project_Charter` §3, §4, §5 — LOCKs, ECs, and PCs implemented.
- `02_SAD` AD-01 — Layered architecture enforced via ESLint here.
- `04_TechStack` AD-02, §9 — TypeScript and ESLint configurations.
- `05_ProjectStructure` AD-07 — Database-optional layout enforced here.
- `06_ArchitectureDecisionRecords` — ADR-013 through ADR-024 (ECs), ADR-025 through ADR-053 (technical ADs).
- `11_ProductConstitution` — Expands PC-03, PC-04, PC-08.
- `12_ToolManifestSpecification` — Manifest schema validated via Zod.
- `07_FolderStructure` — File and folder conventions complementing these standards.
- `09_NamingConvention` — Naming rules within files.
- `10_DesignSystem` — Design tokens used in code.
- `13_FBRD` — Tool manifest schema validated via Zod.
- `14_ACD` — Reusable components from `@packages/ui`.
- `16_DatabaseDesign` — RLS policies complement security rules.
- `17_APIConvention` — API-specific coding rules.
- `20_RBAC` — Authorization rules enforced in server actions.
- `22_DevelopmentGuideline` — PR workflow including this checklist.
- `23_TestingStrategy` — Testing standards referenced in §11.
- `24_DeploymentGuide` — CI pipeline runs these checks.
- `25_AI_Guideline` — AI must follow these standards (LOCK-09, EC-11).
