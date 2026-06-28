# 07 — Folder Structure

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-04 (Modular), LOCK-05 (Plugin-Ready), LOCK-06 (Database Optional); EC-03 (Component Reuse First), EC-04 (Tool Template Standard), EC-01 (Documentation First)

---

## 1. Purpose

This Folder Structure document defines the granular file and folder conventions for [PROJECT_NAME]. Where `05_ProjectStructure` defines the high-level layout (top-level directories, bounded contexts, layer boundaries, registry pattern), this document specifies the rules for files within those directories: naming, organization, grouping, and what belongs where.

The reason this document exists separately from `05_ProjectStructure` is that folder structure failures happen at the file level, not the directory level. An engineer who creates `imageResize.ts` instead of `image-resize.ts`, or who puts a React component in `domain/`, or who creates `utils2.ts` because `utils.ts` got too big — these are the failures that compound into an unmaintainable codebase. Without explicit rules, the file-level structure drifts in dozens of small ways that no single reviewer catches.

This document enforces LOCK-04 (modularity), LOCK-05 (plugin-ready architecture via consistent tool structure), LOCK-06 (database optional via structural separation), EC-03 (component reuse first), EC-04 (tool template standard), and EC-01 (documentation first — every folder has a reason recorded here).

## 2. Scope

### 2.1 In Scope

- File naming conventions (kebab-case, PascalCase, camelCase rules).
- Folder organization within each bounded context.
- Tool folder template — the exact structure every tool follows (EC-04).
- Shared code organization (`/packages` vs `/src/shared`).
- Test file placement and naming.
- Documentation file placement.
- Generated files conventions.
- Configuration file placement.
- Migration file organization.

### 2.2 Out of Scope

- Top-level directory layout → `05_ProjectStructure`.
- Code style within files → `08_CodingStandards`.
- Naming of variables, functions, types → `09_NamingConvention`.
- Database schema definitions → `14_DatabaseDesign`.

## 3. Architectural Decisions

### AD-01 — File Naming: Three Conventions Based on File Type

**Context.** Mixing naming conventions (some files kebab-case, some PascalCase, some camelCase) creates visual inconsistency and forces engineers to remember per-file rules. A clear convention based on file type reduces cognitive load.

**Decision.** Three naming conventions, each tied to file type:

| File Type | Convention | Example |
|-----------|-----------|---------|
| Non-component files (utils, hooks, schemas, configs, tests) | `kebab-case.ts` | `image-utils.ts`, `use-tool-history.ts` |
| React component files (single component per file) | `PascalCase.tsx` | `ToolCard.tsx`, `ImageUploader.tsx` |
| Test files | `[name].test.ts` or `[name].test.tsx` | `image-utils.test.ts`, `ToolCard.test.tsx` |
| Type definition files | `kebab-case.types.ts` or `[name].types.ts` | `tool.types.ts` |
| Index files (barrels) | `index.ts` or `index.tsx` | always `index` |
| Documentation | `kebab-case.md` | `architecture-decisions.md` |
| Configuration | `kebab-case.config.ts` | `tailwind.config.ts`, `drizzle.config.ts` |

**Rationale:**
- `kebab-case` for non-components is the JavaScript ecosystem standard (Next.js, Vercel conventions).
- `PascalCase` for components matches the component name (`ToolCard` is in `ToolCard.tsx`), making imports visually obvious.
- Test suffix `.test.ts` colocates tests with their subjects, easily greppable.

**Implements:** EC-04 (Tool Template Standard — consistent naming).

### AD-02 — One Component Per File

**Context.** Files with multiple components become hard to navigate, hard to test, and create import ambiguity.

**Decision.** Each `.tsx` file in `presentation/` or `components/` contains exactly ONE exported React component. The file name matches the component name (PascalCase). Small "private" sub-components used only by the main component may live in the same file, but only if not exported.

**Consequences.**
- ✅ File name = component name = import path; no ambiguity.
- ✅ Tests target one component per file.
- ⚠️ More files; mitigated by clear folder organization.

**Implements:** EC-09 (Testing — one component per file makes testing straightforward).

### AD-03 — Tool Folder Template (EC-04)

**Context.** EC-04 mandates every tool follows an identical internal structure. The exact structure must be documented so tool authors have a template to copy.

**Decision.** Every tool folder follows this exact structure:

```
src/tools/[category]/[tool-slug]/
├── manifest.ts              # ToolManifest — the aggregate root
├── index.ts                 # Re-exports manifest as default
├── stages/
│   ├── input.ts             # InputStage implementation
│   ├── validation.ts        # ValidationStage (Zod schema + validator)
│   ├── processing.ts        # ProcessingStage (browser-side or server-side)
│   ├── preview.tsx          # PreviewStage (React component)
│   ├── download.ts          # DownloadStage (packaging logic)
│   ├── history.ts           # HistoryStage (optional)
│   └── share.ts             # ShareStage (optional)
├── components/              # Tool-specific React components
│   ├── InputForm.tsx        # Configuration form (if any)
│   ├── ProcessingProgress.tsx  # Progress UI
│   └── ResultDisplay.tsx    # Result preview UI
├── hooks/                   # Tool-specific hooks
│   └── use-processing.ts    # e.g., useProcessing()
├── lib/                     # Tool-specific pure utilities
│   └── image-ops.ts         # e.g., image manipulation functions
├── tests/
│   ├── stages.test.ts       # Unit tests per stage
│   ├── input-form.test.tsx  # Component tests
│   └── e2e.test.ts          # Playwright E2E test
└── README.md                # Tool-specific docs (optional for simple tools)
```

**Rules:**
- `manifest.ts` and `index.ts` are mandatory.
- `stages/` is mandatory with at least 5 files (input, validation, processing, preview, download).
- `stages/history.ts` and `stages/share.ts` are optional.
- `components/`, `hooks/`, `lib/` are optional; created only when needed.
- `tests/` is mandatory with at least `stages.test.ts`.
- `README.md` is mandatory for tools with non-obvious behavior; optional for trivial tools.

**Implements:** EC-04 (Tool Template Standard), LOCK-05 (Plugin-Ready — third-party tools follow same structure).

### AD-04 — Colocated Tests

**Context.** Separating tests into a top-level `tests/` directory separates tests from the code they test, making it harder to keep them in sync.

**Decision.** Tests are colocated with the code they test:
- Unit tests: `tests/` subdirectory within the module.
- Component tests: `tests/` subdirectory within the component's folder.
- E2E tests: project-level `tests/e2e/` directory (because they span modules).
- Integration tests: project-level `tests/integration/` directory.

**Consequences.**
- ✅ Tests are easy to find next to the code.
- ✅ Deleting a module deletes its tests.
- ⚠️ E2E tests span modules; centralized for clarity.

**Implements:** EC-09 (Testing Philosophy).

### AD-05 — Layer Subdirectory Pattern Within Contexts

**Context.** `05_ProjectStructure` AD-02 mandates four layer subdirectories per context. Within each layer, files need further organization.

**Decision.** Standard subdirectory pattern within each layer:

```
src/[context]/
├── presentation/
│   ├── components/          # Context-specific React components
│   ├── layouts/             # Layout components
│   └── pages/               # Page-level components (if not in app/)
├── application/
│   ├── actions/             # Server actions
│   ├── hooks/               # Application hooks
│   ├── services/            # Application services
│   └── use-cases/           # Use case orchestration
├── domain/
│   ├── entities/            # Domain entities
│   ├── value-objects/       # Value objects
│   ├── aggregates/          # Aggregate roots
│   ├── events/              # Domain events
│   └── schemas/             # Zod schemas for domain types
└── infrastructure/
    ├── repositories/        # Drizzle-based repositories
    ├── clients/             # External API clients
    └── storage/             # File storage adapters
```

Subdirectories are created only when needed; an empty context may start with empty layer directories.

**Implements:** LOCK-04 (Modular), `02_SAD` AD-01 (Layered Architecture).

### AD-06 — Shared Code Split Rule

**Context.** `05_ProjectStructure` AD-05 defines `/packages` and `/src/shared` as two locations for shared code. The decision rule for which goes where must be explicit.

**Decision.** Decision rule:

| Code Characteristic | Location |
|---------------------|----------|
| Has zero dependencies on `src/` structure | `/packages` |
| Could theoretically be published to npm | `/packages` |
| Used by multiple bounded contexts | `/packages` or `/src/shared` (see below) |
| Depends on `src/` structure (e.g., imports from another context's published API) | `/src/shared` |
| App-specific configuration (env vars, feature flags client) | `/src/shared` |
| Cross-context hooks (useUser, useLocale) | `/src/shared` |
| Pure utilities (formatting, math) | `/packages/utils` |
| Type definitions shared across contexts | `/packages/types` |
| Zod schemas shared across contexts | `/packages/types` |
| UI primitives (Button, Input, Card) | `/packages/ui` |
| Tool Engine abstraction | `/packages/tool-engine` |

When uncertain, default to `/src/shared` — promoting to `/packages` is easy; demoting is harder.

**Implements:** EC-02 (One Source of Truth), EC-03 (Component Reuse First).

### AD-07 — Generated Files Convention

**Context.** `05_ProjectStructure` AD-04 generates files via build-time codegen. Generated files must be clearly marked and never manually edited.

**Decision.** All generated files:
- Live in `src/generated/` only.
- Start with the header comment `// AUTO-GENERATED. Do not edit manually.`
- Are committed to the repo (for type safety across the team).
- Are verified by CI (`scripts/verify-registry.ts` fails the build if generated files are out of sync with manifests).

**Consequences.**
- ✅ Type safety without running codegen before lint.
- ✅ Diff visibility in PRs.
- ⚠️ Discipline required to never manually edit.

**Implements:** LOCK-05 (Plugin-Ready via codegen), EC-01 (Documentation — generated files are documented as such).

### AD-08 — Documentation File Placement

**Context.** EC-01 mandates documentation first. Documentation files must be discoverable.

**Decision.** Documentation placement rules:

| Document Type | Location |
|--------------|----------|
| Project-level docs (architecture, conventions) | `/docs/*.md` |
| Tool-specific docs | `src/tools/[category]/[slug]/README.md` |
| Package docs | `/packages/[name]/README.md` |
| ADRs | `/docs/06_ArchitectureDecisionRecords.md` (consolidated) |
| API docs | `/docs/15_APIConvention.md` + inline JSDoc |
| README | Project root `README.md` (links to `/docs`) |

**Implements:** EC-01 (Documentation First).

## 4. Design Principles

### P1 — Convention Over Configuration
Follow the conventions in this document; don't invent new patterns. If a convention doesn't fit your case, propose an ADR rather than deviating silently.

### P2 — Colocation
Code, tests, and docs for a module live together. Don't separate them by type.

### P3 — Discoverability
An engineer browsing the file tree should be able to find what they need without grepping. Folder and file names must be self-explanatory.

### P4 — Minimal Subdirectories
Don't create subdirectories until you have 5+ files in a folder. Premature subdirectories create empty navigation.

### P5 — Naming Reflects Purpose
File and folder names reflect what they contain, not who created them or when. Avoid names like `utils-v2.ts` or `johns-stuff/`.

### P6 — Generated Files Are Sacred
Never manually edit generated files. If a generated file is wrong, fix the source (manifest, codegen script) and regenerate.

## 5. Top-Level Project Layout (Reference)

This is the canonical reference for top-level layout. Detailed in `05_ProjectStructure` §5.

```
[PROJECT_NAME]/
├── docs/
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── tools/
│   ├── identity/
│   ├── content/
│   ├── platform-ops/
│   ├── billing/
│   ├── analytics/
│   ├── shared/
│   └── generated/
├── packages/
├── drizzle/
├── tests/
├── .github/
└── config files
```

## 6. Detailed Folder Rules

### 6.1 `/src/app/` — Next.js App Router

```
src/app/
├── (public)/                # Public route group (no auth required)
│   ├── tools/[category]/[slug]/page.tsx   # Single dynamic route for all tools
│   ├── tools/[category]/page.tsx          # Category landing
│   └── tools/page.tsx                     # All-tools hub
├── (auth)/                  # Auth-required route group
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
├── (admin)/                 # Admin route group (RBAC required)
│   ├── admin/layout.tsx     # Admin layout with sidebar
│   └── admin/page.tsx       # Admin dashboard
├── (marketing)/             # Marketing pages
│   ├── page.tsx             # Homepage
│   ├── about/page.tsx
│   ├── pricing/page.tsx
│   └── blog/page.tsx        # Content Context articles
├── api/                     # API routes (server-side tools, webhooks)
│   ├── tools/[slug]/route.ts   # Server-side tool endpoints
│   └── webhooks/               # Webhook handlers
├── layout.tsx               # Root layout (HTML, body, providers)
├── globals.css              # Global styles (Tailwind imports, CSS custom properties)
├── not-found.tsx            # 404 page
└── error.tsx                # Global error boundary
```

**Rules:**
- Route groups `(name)` don't affect URL; used for organization and shared layouts.
- One `page.tsx` per route; no business logic in page files (delegate to context's application layer).
- `layout.tsx` files contain shared layout, navigation, and providers.

### 6.2 `/src/tools/[category]/[slug]/` — Tool Folder Template

See AD-03 for the full template. Every tool folder follows this exact structure.

**Category folders** (`image/`, `pdf/`, `developer/`, `text/`, `converters/`, `seo/`, `calculators/`) each contain their tool subfolders and an optional `_shared/` folder for category-specific shared code:

```
src/tools/image/
├── _shared/                 # Image-category-specific shared code
│   ├── lib/
│   │   └── canvas-utils.ts  # e.g., shared canvas operations
│   └── components/
│       └── ImageDropzone.tsx  # Shared image upload component
├── image-resize/
├── image-compress/
├── passport-photo/
└── background-remover/
```

The `_shared/` folder name uses underscore prefix to sort it before tool folders alphabetically.

### 6.3 `/src/[context]/` — Bounded Context Layout

Each bounded context follows the four-layer pattern (AD-05). Example for Identity Context:

```
src/identity/
├── presentation/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── UserMenu.tsx
│   │   └── AuthGuard.tsx
│   └── layouts/
│       └── AuthLayout.tsx
├── application/
│   ├── actions/
│   │   ├── sign-in.ts       # Server action
│   │   ├── sign-out.ts
│   │   └── save-history-entry.ts
│   ├── hooks/
│   │   ├── use-current-user.ts
│   │   └── use-history.ts
│   └── services/
│       └── auth-service.ts  # Wraps Supabase auth client
├── domain/
│   ├── entities/
│   │   └── user.ts          # User entity class
│   ├── value-objects/
│   │   └── email.ts         # Email value object
│   ├── aggregates/
│   │   └── history-entry.ts # HistoryEntry aggregate root
│   ├── events/
│   │   ├── user-registered.ts
│   │   └── user-logged-in.ts
│   └── schemas/
│       └── user-schema.ts   # Zod schema for User
└── infrastructure/
    ├── repositories/
    │   ├── user-repository.ts       # Drizzle-based
    │   └── history-entry-repository.ts
    ├── clients/
    │   └── supabase-auth-client.ts  # Supabase auth wrapper
    └── storage/
        └── avatar-storage.ts        # Avatar file storage
```

### 6.4 `/packages/[name]/` — Shared Package Layout

Each package is a self-contained module with its own `package.json`:

```
packages/
├── tool-engine/
│   ├── src/
│   │   ├── types.ts         # ToolEngine<TInput, TOutput> types
│   │   ├── engine.ts        # Engine implementation
│   │   ├── stages/          # Stage type definitions
│   │   └── index.ts         # Package entry point
│   ├── tests/
│   │   └── engine.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── ui/
│   ├── src/
│   │   ├── button/
│   │   │   ├── Button.tsx
│   │   │   ├── button.test.tsx
│   │   │   └── index.ts
│   │   ├── input/
│   │   ├── card/
│   │   └── index.ts
│   └── package.json
├── utils/
│   ├── src/
│   │   ├── format.ts        # formatBytes, formatDate, etc.
│   │   ├── math.ts          # clamp, range, etc.
│   │   └── index.ts
│   └── package.json
└── types/
    ├── src/
    │   ├── tool.ts          # ToolManifest types
    │   ├── user.ts          # Shared User type
    │   └── index.ts
    └── package.json
```

### 6.5 `/src/shared/` — App-Specific Shared Code

```
src/shared/
├── lib/
│   ├── supabase-client.ts   # Browser Supabase client
│   ├── supabase-server.ts   # Server Supabase client
│   ├── analytics.ts         # Analytics client
│   └── logger.ts            # Structured logger
├── config/
│   ├── env.ts               # Environment variables (validated)
│   ├── feature-flags.ts     # Feature flag client
│   ├── site-config.ts       # Site name, URL, social handles
│   └── routes.ts            # Route constants
├── hooks/
│   ├── use-theme.ts         # Dark/light mode
│   ├── use-media-query.ts
│   ├── use-debounce.ts
│   └── use-current-user.ts  # Wraps Identity Context's hook
├── components/              # App-specific shared components (not in design system)
│   ├── PageContainer.tsx
│   ├── SectionHeading.tsx
│   └── ThemeToggle.tsx
└── types/
    ├── api.ts               # Shared API types
    └── index.ts
```

### 6.6 `/src/generated/` — Build-Time Generated

```
src/generated/
├── registry.ts              # Tool registry (Map of manifests)
├── navigation.ts            # Category → Tool[] for nav
├── sitemap.ts               # Sitemap entries
├── seo-meta.ts              # Per-route SEO metadata
├── admin-inventory.ts       # Tool list for admin
└── types.ts                 # Generated TypeScript types
```

All files start with `// AUTO-GENERATED. Do not edit manually.` and are verified by CI.

### 6.7 `/drizzle/[context]/` — Database Migrations

Migrations are scoped per bounded context:

```
drizzle/
├── identity/
│   ├── 0000_initial.sql
│   ├── 0001_add_history_entries.sql
│   └── meta/
│       ├── 0000_snapshot.json
│       └── 0001_snapshot.json
├── content/
│   └── 0000_initial.sql
├── platform-ops/
│   └── 0000_initial.sql
├── billing/                 # Phase 2+
└── analytics/
```

Migration files are numbered sequentially with descriptive names. Migration metadata (snapshots) lives in `meta/`.

### 6.8 `/scripts/` — Build and Utility Scripts

```
scripts/
├── generate-registry.ts     # Tool registry codegen (AD-04 in 05_ProjectStructure)
├── verify-registry.ts       # CI check: generated files match manifests
├── seed-dev-data.ts         # Dev environment seeding
├── tool-template/           # Template for new tools
│   ├── manifest.ts
│   ├── stages/
│   └── ...
└── analyze-bundle.ts        # Bundle size analysis
```

### 6.9 `/tests/` — Project-Wide Tests

```
tests/
├── e2e/                     # Playwright E2E tests
│   ├── tool-workflow.spec.ts
│   ├── auth-flow.spec.ts
│   └── admin.spec.ts
├── integration/             # Cross-context integration tests
│   └── tool-to-history.spec.ts
└── fixtures/                # Test fixtures (sample files, etc.)
    ├── images/
    └── pdfs/
```

### 6.10 `/docs/` — Documentation

All project-level documentation lives in `/docs/`, numbered sequentially as defined in `README.md`. No other location for project-level docs.

### 6.11 `/public/` — Static Assets

```
public/
├── fonts/                   # Self-hosted fonts (if any)
├── images/                  # Static images (logos, OG images)
│   ├── logo.svg
│   ├── og-default.png       # Default Open Graph image
│   └── icons/
├── favicon.ico
├── robots.txt               # Static robots.txt (or generated route)
└── manifest.webmanifest     # PWA manifest
```

## 7. Tool Folder Template (Reference)

The canonical tool folder template, for quick reference when creating a new tool:

```
src/tools/[category]/[tool-slug]/
├── manifest.ts              # MANDATORY
├── index.ts                 # MANDATORY (re-exports manifest)
├── stages/                  # MANDATORY (5-7 files)
│   ├── input.ts
│   ├── validation.ts
│   ├── processing.ts
│   ├── preview.tsx
│   ├── download.ts
│   ├── history.ts           # OPTIONAL
│   └── share.ts             # OPTIONAL
├── components/              # OPTIONAL (if tool has custom UI)
│   ├── InputForm.tsx
│   ├── ProcessingProgress.tsx
│   └── ResultDisplay.tsx
├── hooks/                   # OPTIONAL
│   └── use-processing.ts
├── lib/                     # OPTIONAL (tool-specific pure utilities)
│   └── tool-ops.ts
├── tests/                   # MANDATORY (at least stages.test.ts)
│   ├── stages.test.ts
│   ├── input-form.test.tsx
│   └── e2e.test.ts
└── README.md                # OPTIONAL for simple, MANDATORY for complex
```

A tool template scaffold lives at `scripts/tool-template/` and can be copied via `pnpm new-tool [category] [slug]`.

## 8. Standards

### 8.1 File Naming Standards
- Non-component TypeScript files: `kebab-case.ts`
- Component files: `PascalCase.tsx`
- Test files: `[name].test.ts` or `[name].test.tsx`
- Type files: `[name].types.ts`
- Documentation: `kebab-case.md`
- Config: `kebab-case.config.ts`

### 8.2 Folder Naming Standards
- All folders: `kebab-case`
- Special prefixes: `_shared/` (sorts first, indicates internal shared)
- Route groups in `app/`: `(name)` per Next.js convention

### 8.3 File Size Standards (per `00_Project_Charter` §7.1)
- Soft limit: 300 lines per file
- Hard limit: 500 lines per file
- Files approaching 300 lines should be refactored into smaller modules
- Files exceeding 500 lines block PR merge

### 8.4 Folder Cardinality Standards
- Don't create a subdirectory until parent has 5+ files
- Don't create more than 2 levels of nesting within a context's layer
- Single-file folders are acceptable (e.g., `stages/input.ts`)

### 8.5 Index File Standards
- `index.ts` files are barrel files that re-export public APIs
- They do NOT contain logic
- They prevent deep import paths (`@/tools/image/image-resize` vs `@/tools/image/image-resize/manifest`)

### 8.6 Test File Standards
- Every test file is named `[subject].test.ts` or `[subject].test.tsx`
- Test files live in `tests/` subdirectory of their subject's folder
- E2E tests live in project-level `tests/e2e/`
- Test fixtures live in `tests/fixtures/`

## 9. Best Practices

### 9.1 When Creating a New Tool
1. Run `pnpm new-tool [category] [slug]` to scaffold from template.
2. Edit `manifest.ts` with tool metadata.
3. Implement each stage in `stages/`.
4. Add components, hooks, lib as needed.
5. Write tests in `tests/`.
6. Run `pnpm gen:registry` to update generated files.
7. Verify with `pnpm test` and `pnpm lint`.

### 9.2 When Adding a Component
1. Check `@packages/ui` for existing component (EC-03).
2. Check `src/shared/components/` for app-specific shared component.
3. If tool-specific, place in tool's `components/` folder.
4. Name file `PascalCase.tsx` matching component name.
5. One component per file (AD-02).

### 9.3 When Adding a Utility Function
1. Check `@packages/utils` for existing utility (EC-03).
2. Check context's `domain/` or `application/` for context-specific utility.
3. If tool-specific, place in tool's `lib/` folder.
4. Name file `kebab-case.ts` describing the utility group (e.g., `image-ops.ts`, not `helpers.ts`).

### 9.4 When Adding a Test
1. Place next to the code being tested (AD-04).
2. Name `[subject].test.ts`.
3. E2E tests go in `tests/e2e/` with descriptive name `[scenario].spec.ts`.
4. Use fixtures from `tests/fixtures/` for sample files.

### 9.5 When Refactoring
1. Preserve file naming conventions.
2. Don't create temporary folders like `old/`, `deprecated/`, `v2/`.
3. If deleting a file, delete its tests too (colocated).
4. Update imports across the codebase; rely on TypeScript to catch misses.

### 9.6 When Adding Documentation
1. Project-level docs go in `/docs/` with numbered filename.
2. Tool-specific docs go in tool's `README.md`.
3. Package docs go in package's `README.md`.
4. Inline code comments use JSDoc for public APIs.

## 10. Future Scalability

### 10.1 Scaling to 1,000+ Tools
- Tool folder template scales linearly.
- At >500 tools, consider adding a `tools/_index.ts` for faster IDE navigation.
- Category folders may need sub-categories (e.g., `image/resize/`, `image/convert/`); add via ADR if needed.

### 10.2 Scaling Packages
- `/packages` can grow to 10+ packages without issue.
- Each package remains self-contained; no cross-package imports except via published APIs.

### 10.3 Plugin Directory (Phase 4)
- Add `/plugins/` directory for third-party tools.
- Plugin folder structure mirrors tool folder structure (AD-03).
- Plugins are signed and sandboxed per future ADR.

### 10.4 Multi-Tenancy (Phase 3+)
- Each context's `infrastructure/` layer gains `tenancy/` subdirectory for tenant-aware repositories.
- No structural changes to top-level layout.

## 11. Dependencies

### 11.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4 — LOCKs and ECs enforced via this structure.
- Depends on `02_SAD` — layer definitions and Tool Engine contract.
- Depends on `03_DDD` — bounded context boundaries.
- Depends on `04_TechStack` — pnpm workspaces, ESLint, Next.js App Router.
- Depends on `05_ProjectStructure` — high-level layout this document details.
- Depends on `06_ArchitectureDecisionRecords` — ADR-047 through ADR-053.

### 11.2 External Dependencies
- Next.js App Router conventions (route groups, file-based routing).
- pnpm workspaces (monorepo support).
- ESLint `no-restricted-imports` (boundary enforcement).

### 11.3 Assumptions
- File naming conventions remain stable; changes require ADR.
- Tool template remains stable; deviations require EC-04 architectural approval.

## 12. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Folder Structure. Defined file naming conventions, tool folder template, layer subdirectory pattern, shared code split rule, generated files convention, documentation placement. |

## 13. Cross References

- `00_Project_Charter` §3, §4 — LOCKs and ECs implemented by this structure.
- `02_SAD` AD-01 — Layered architecture implemented by layer subdirectories here.
- `03_DDD` §5 — Bounded contexts mapped to top-level directories.
- `04_TechStack` — Technologies (pnpm, ESLint) enforcing this structure.
- `05_ProjectStructure` — High-level layout this document details.
- `06_ArchitectureDecisionRecords` — ADR-047 through ADR-053 record structure decisions.
- `08_CodingStandards` — Coding rules within files in this structure.
- `09_NamingConvention` — Naming rules for variables, functions, types within files.
- `10_DesignSystem` — Design tokens used by components in this structure.
- `11_FBRD` — Tool manifest schema (the file at the root of every tool folder).
- `12_ACD` — Reusable components referenced from `@packages/ui`.
- `14_DatabaseDesign` — Drizzle migrations under `drizzle/[context]/`.
- `19_AdminSpecification` — Admin routes under `src/app/(admin)/`.
- `20_DevelopmentGuideline` — PR workflow including structure verification.
- `22_DeploymentGuide` — Build pipeline including registry codegen.
- `23_AI_Guideline` — AI must follow this structure (LOCK-09, EC-11).
