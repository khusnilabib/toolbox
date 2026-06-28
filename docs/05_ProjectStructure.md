# 05 — Project Structure

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.3.0
> **Implements:** LOCK-04 (Modular Architecture), LOCK-05 (Plugin-Ready), LOCK-06 (Database Optional); EC-03 (Component Reuse First), EC-04 (Tool Template Standard); PC-04 (Tool Template Standard), PC-10 (Product Scalability); DGA-04 (Search Architecture — index generation)

---

## 1. Purpose

This Project Structure document defines the high-level layout of [PROJECT_NAME]'s codebase. It maps the bounded contexts from `03_DDD` and the architectural layers from `02_SAD` to physical directories. It defines the **Tool Registry Pattern** that enables plugin-ready architecture (LOCK-05), the **Module Boundaries** that enforce modularity (LOCK-04), and the **Stateless Tool Layout** that enables database-optional operation (LOCK-06).

This document is the authoritative reference for "where does this code belong?" Every new file, every new module, every new tool must be placed according to this document. The structure is not a suggestion; it is enforced via ESLint boundary rules, code review, and CI checks.

The structure scales from 30 tools (Phase 1) to 1,000+ tools (Phase 4) without reorganization. The unit of growth is the tool folder; adding a tool creates one new folder and modifies nothing outside the tools directory except auto-generated registry files. This linear scaling property is the single most important structural guarantee.

## 2. Scope

### 2.1 In Scope

- Top-level project directory layout.
- Mapping of bounded contexts (`03_DDD`) to physical directories.
- Mapping of architectural layers (`02_SAD` AD-01) to folder hierarchy within each context.
- Tool module anatomy — the structure every tool follows.
- Tool Registry pattern — build-time codegen for auto-discovery (LOCK-05).
- Shared library structure (`/packages`, `/src/shared`).
- Module boundary enforcement strategy.
- Generated files — what is auto-generated and where it lives.

### 2.2 Out of Scope

- Granular file naming conventions (file-level patterns) → `07_FolderStructure`.
- Specific code patterns within files → `08_CodingStandards`.
- Component-level breakdown → `14_ACD`.
- Database schema layout → `19_DatabaseDesign`.
- CI/CD pipeline configuration → `27_DeploymentGuide`.

## 3. Architectural Decisions

### AD-01 — Feature-Based Architecture at the Top Level

**Context.** Two common patterns exist: type-based (folders for `components/`, `hooks/`, `utils/`) and feature-based (folders for `tools/`, `auth/`, `admin/`). Type-based breaks down at scale because related files scatter across many folders; changing one feature requires touching many directories.

**Decision.** Adopt feature-based architecture at the top level. Each bounded context (`03_DDD`) is a top-level directory. Within each context, files are organized by architectural layer (`02_SAD` AD-01: Presentation, Application, Domain, Infrastructure).

```
src/
├── app/                    # Next.js App Router (routing layer)
├── tools/                  # Tools Context (core domain)
├── identity/               # Identity Context
├── content/                # Content Context
├── platform-ops/           # Platform Operations Context (Admin)
├── billing/                # Billing Context (Phase 2+)
├── analytics/              # Analytics Context
├── shared/                 # Cross-cutting shared code
└── generated/              # Build-time generated files (registry, etc.)
```

**Consequences.**
- ✅ Each context is self-contained; team can own a context end-to-end.
- ✅ Tool count scales linearly — each tool is a folder under `tools/`.
- ✅ Boundary enforcement is structural (folder-per-context) + tooling (ESLint).
- ⚠️ Some shared utilities needed across contexts; mitigated by `/shared` and `/packages`.

**Implements:** LOCK-04 (Modular Architecture), EC-03 (Component Reuse First — shared code lives in `/packages` and `/src/shared`).

### AD-02 — Layered Folders Within Each Context

**Context.** `02_SAD` AD-01 mandates four layers (Presentation, Application, Domain, Infrastructure) with strict dependency rules. The folder structure must make these layers visible and enforceable.

**Decision.** Within each bounded context directory, four subdirectories represent the layers:

```
src/identity/
├── presentation/           # React components, pages (depends on Application)
├── application/            # Use cases, hooks, server actions (depends on Domain)
├── domain/                 # Entities, value objects, schemas (no external deps)
└── infrastructure/         # DB access, external APIs (depends on Domain)
```

Dependency direction is enforced via ESLint `no-restricted-imports`:
- `presentation/` may import from `application/`, `domain/`, `shared/`.
- `application/` may import from `domain/`, `shared/`.
- `domain/` may import from `shared/` only.
- `infrastructure/` may import from `domain/`, `shared/`.

**Consequences.**
- ✅ Layer boundaries are visible in any IDE file tree.
- ✅ ESLint catches violations at lint time, not review time.
- ✅ Domain logic is fully testable without React or DB setup.
- ⚠️ Slightly more nesting than flat structure; justified by enforceability.

**Implements:** LOCK-04, `02_SAD` AD-01.

### AD-03 — Tool Module Anatomy (One Folder Per Tool)

**Context.** LOCK-04 mandates tools are independent modules. LOCK-05 mandates plugin-ready architecture. The structure must make adding a tool a self-contained operation: create a folder, define a manifest, implement stages.

**Decision.** Each tool lives in `src/tools/[category]/[slug]/` and contains:

```
src/tools/image/image-resize/
├── manifest.ts             # ToolManifest — the aggregate root (LOCK-05)
├── stages/
│   ├── input.ts            # InputStage implementation
│   ├── validation.ts       # ValidationStage (Zod schema)
│   ├── processing.ts       # ProcessingStage (browser-side or server-side)
│   ├── preview.ts          # PreviewStage (React component)
│   ├── download.ts         # DownloadStage (packaging logic)
│   ├── history.ts          # HistoryStage (optional; best-effort persistence)
│   └── share.ts            # ShareStage (optional; link/QR generation)
├── components/             # Tool-specific UI components (input forms, etc.)
├── hooks/                  # Tool-specific hooks
├── tests/
│   ├── stages.test.ts      # Unit tests per stage
│   └── e2e.test.ts         # E2E test for the tool workflow
├── README.md               # Tool-specific docs (optional, for complex tools)
└── index.ts                # Re-exports manifest as default
```

**Consequences.**
- ✅ Adding a tool = adding a folder; nothing else changes (registry auto-discovers).
- ✅ Tool is fully isolated; deleting the folder removes the tool completely.
- ✅ Tests colocated with implementation.
- ✅ Plugin-ready (LOCK-05): a third-party tool follows the same structure.
- ⚠️ Many small folders; mitigated by clear naming and IDE support.

**Implements:** LOCK-04, LOCK-05, LOCK-03 (Tool Engine stages map to files), EC-04 (Tool Template Standard — every tool has identical structure).

### AD-04 — Tool Registry Pattern (Build-Time Codegen)

**Context.** LOCK-05 mandates auto-discovery. Runtime registry lookups add latency and complicate Edge deployment. Build-time codegen produces static typed files that Edge can serve.

**Decision.** A build script (`scripts/generate-registry.ts`) walks `src/tools/**/manifest.ts`, imports each manifest, validates it against the schema, and emits typed registry files:

```
src/generated/
├── registry.ts             # Map<slug, ToolManifest> with helpers
├── navigation.ts           # Category → Tool[] for nav menus
├── sitemap.ts              # Sitemap entries for SEO
├── seo-meta.ts             # Per-route SEO metadata (LOCK-08)
├── admin-inventory.ts      # Tool list for admin panel
└── types.ts                # Generated TypeScript types
```

The script runs:
- On every `pnpm dev` start (development).
- On every `pnpm build` (production).
- Via `pnpm gen:registry` (manual).

CI verifies that generated files are committed and match the manifests; mismatched generations fail the build.

**Consequences.**
- ✅ Zero runtime cost for registry lookups.
- ✅ Type safety: malformed manifests fail the build.
- ✅ Auto-discovery: new tools appear in nav, sitemap, admin without manual wiring.
- ✅ Plugin-ready: third-party manifests follow the same schema; can be merged into registry.
- ⚠️ Build time grows linearly with tool count; mitigated by parallel codegen at >500 tools.

**Implements:** LOCK-05 (Plugin-Ready, auto-discovery), LOCK-08 (SEO metadata in registry).

### AD-05 — Shared Code Split Between `/packages` and `/src/shared`

**Context.** Some code is shared across bounded contexts (UI primitives, utility functions, types). Where it lives affects reusability and dependency direction.

**Decision.** Two locations for shared code, with distinct purposes:

**`/packages/*`** — published-style packages, fully self-contained, no dependencies on `src/`. Used for code that could theoretically be extracted to a separate npm package later. Examples:
- `/packages/tool-engine` — the `ToolEngine<TInput, TOutput>` abstraction (LOCK-03).
- `/packages/ui` — design system primitives (built on shadcn/ui, per `09_DesignSystem`).
- `/packages/utils` — pure utility functions (formatting, math, etc.).
- `/packages/types` — shared TypeScript types and Zod schemas.

**`/src/shared/*`** — application-specific shared code that depends on `src/` structure but is used across contexts. Examples:
- `/src/shared/lib` — application utilities (auth client, supabase client).
- `/src/shared/config` — env vars, feature flags client.
- `/src/shared/hooks` — cross-context hooks (useUser, useLocale).

**Consequences.**
- ✅ `/packages` code is highly reusable and could be open-sourced later.
- ✅ `/src/shared` keeps context-spanning app code organized.
- ✅ Clear ownership: `/packages` owned by platform team; `/src/shared` owned by whoever needs it.
- ⚠️ Discipline required to put the right code in the right place; documented in `07_FolderStructure`.

**Implements:** LOCK-04 (modularity), DRY principle.

### AD-06 — App Router Maps to Tool Registry

**Context.** Next.js App Router uses file-based routing. With 1,000+ tools, having one route file per tool is unmanageable. But dynamic routes (`/tools/[category]/[slug]`) need to know which slugs are valid.

**Decision.** Use Next.js dynamic routes that resolve against the generated registry:

```
src/app/
├── (public)/
│   ├── tools/[category]/[slug]/
│   │   └── page.tsx         # Single dynamic route for all tools
│   ├── tools/[category]/
│   │   └── page.tsx         # Category landing page
│   └── tools/
│       └── page.tsx         # All-tools hub page
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── dashboard/page.tsx
├── (admin)/
│   └── admin/               # Per `24_AdminSpecification`
└── (marketing)/
    ├── page.tsx             # Homepage
    ├── about/page.tsx
    └── blog/page.tsx        # Content Context articles
```

The `[slug]/page.tsx` route:
1. Reads `params.slug` and `params.category`.
2. Looks up the manifest in the generated registry.
3. If not found → 404.
4. If found → renders the Tool Engine UI, lazy-loads the tool's Processing stage.
5. Generates SEO metadata from the manifest (LOCK-08).

**Consequences.**
- ✅ One route file handles all tools; no route explosion.
- ✅ Sitemap, SEO metadata, navigation all derived from registry.
- ✅ Static generation possible for known slugs (via `generateStaticParams`).
- ⚠️ Careful handling needed for dynamic params validation.

**Implements:** LOCK-05 (registry-driven routing), LOCK-08 (SEO from manifest).

### AD-07 — Database-Optional Layout

**Context.** LOCK-06 mandates that core tools function without the database. The structure must make this obvious: the Tools Context directory must have no DB imports.

**Decision.** The `src/tools/` directory is structurally forbidden from importing anything from `infrastructure/` layers of any context. This is enforced via ESLint `no-restricted-imports`:

```javascript
// .eslintrc — tools context boundary
{
  files: ['src/tools/**/*'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        '@/identity/infrastructure/*',
        '@/content/infrastructure/*',
        '@/platform-ops/infrastructure/*',
        '@/billing/infrastructure/*',
        '@/analytics/infrastructure/*',
        // Tools context has its OWN infrastructure only for server-side tools
        // but it cannot depend on OTHER contexts' infrastructure
      ]
    }]
  }
}
```

Tools that need to persist data (e.g., history) do so via published interfaces (server actions in Identity Context), not direct DB calls.

**Consequences.**
- ✅ Structural enforcement of LOCK-06; cannot be violated by accident.
- ✅ Tools are testable without DB setup.
- ✅ If DB is down, tools still work (server actions fail gracefully).
- ⚠️ Slightly more indirection for persistence; justified by LOCK-06.

**Implements:** LOCK-06 (Database Optional), EC-05 (Progressive Enhancement — structural enforcement of graceful degradation).

## 4. Design Principles

### P1 — One Tool, One Folder
Every tool is one folder. Adding a tool = adding a folder. Removing a tool = deleting a folder. No side effects on other tools.

### P2 — Layers Are Visible
The four layers (Presentation, Application, Domain, Infrastructure) are visible as subdirectories within each context. This makes architectural decisions inspectable.

### P3 — Generated Files Are Separate
Build-time generated files live in `/src/generated/` and are clearly marked. They are committed to the repo (for type safety across the team) but never manually edited.

### P4 — Shared Code Has a Home
Cross-context code lives in `/packages` (if reusable) or `/src/shared` (if app-specific). Code is never duplicated across contexts (LOCK-09).

### P5 — Boundaries Are Enforced
Folder structure alone is insufficient; ESLint boundary rules enforce dependency direction. Code review verifies boundary compliance.

### P6 — Growth Is Linear
Adding tools, articles, admin features, or users scales linearly: one new folder per item, no reorganization of existing folders.

## 5. Top-Level Project Layout

```
[PROJECT_NAME]/
├── docs/                        # Documentation repository (this doc lives here)
├── public/                      # Static assets served as-is
│   ├── fonts/
│   ├── images/
│   └── favicon.ico
├── scripts/                     # Build scripts, codegen, utilities
│   ├── generate-registry.ts     # Tool registry codegen (AD-04)
│   ├── verify-registry.ts       # CI check: generated files match manifests
│   └── seed-dev-data.ts         # Dev environment seeding
├── src/
│   ├── app/                     # Next.js App Router (AD-06)
│   │   ├── (public)/            # Public route group
│   │   ├── (auth)/              # Auth route group
│   │   ├── (admin)/             # Admin route group (LOCK-11)
│   │   ├── (marketing)/         # Marketing pages
│   │   ├── api/                 # Next.js API routes (server-side tools)
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles, Tailwind imports
│   ├── tools/                   # Tools Context (AD-03)
│   │   ├── image/
│   │   │   ├── image-resize/
│   │   │   ├── image-compress/
│   │   │   ├── passport-photo/
│   │   │   └── ...
│   │   ├── pdf/
│   │   │   ├── pdf-merge/
│   │   │   ├── pdf-split/
│   │   │   └── ...
│   │   ├── developer/
│   │   ├── text/
│   │   ├── converters/
│   │   ├── seo/
│   │   ├── calculators/
│   │   └── _shared/             # Tools-context-internal shared code
│   ├── identity/                # Identity Context (AD-02)
│   │   ├── presentation/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── content/                 # Content Context
│   │   ├── presentation/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── platform-ops/            # Platform Operations Context (Admin)
│   │   ├── presentation/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── billing/                 # Billing Context (Phase 2+, scaffolded)
│   │   ├── presentation/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── analytics/               # Analytics Context
│   │   ├── presentation/        # Analytics dashboards (admin)
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   ├── shared/                  # App-specific shared code (AD-05)
│   │   ├── lib/                 # supabase-client, auth-client, etc.
│   │   ├── config/              # env, feature-flags-client
│   │   ├── hooks/               # useUser, useLocale, useTheme
│   │   └── types/               # Cross-context types
│   └── generated/               # Build-time generated (AD-04)
│       ├── registry.ts
│       ├── navigation.ts
│       ├── sitemap.ts
│       ├── seo-meta.ts
│       ├── admin-inventory.ts
│       └── types.ts
├── packages/                    # Published-style shared packages (AD-05)
│   ├── tool-engine/             # ToolEngine<TInput, TOutput> abstraction
│   ├── ui/                      # Design system primitives
│   ├── utils/                   # Pure utilities
│   └── types/                   # Shared types & Zod schemas
├── drizzle/                     # Drizzle ORM migrations
│   ├── identity/                # Migrations scoped per context
│   ├── content/
│   ├── platform-ops/
│   ├── billing/
│   └── analytics/
├── tests/                       # Project-wide tests (E2E, integration)
│   ├── e2e/
│   └── integration/
├── .github/
│   └── workflows/               # CI/CD pipelines
├── .vscode/                     # Editor config (shared)
├── .env.example                 # Env var template
├── .env.local                   # Local env vars (gitignored)
├── .eslintrc.cjs                # ESLint config with boundary rules (AD-07)
├── .prettierrc                  # Prettier config
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config (design tokens, LOCK-10)
├── drizzle.config.ts            # Drizzle config
├── tsconfig.json                # TS config (strict, path aliases)
├── package.json                 # pnpm workspace root
├── pnpm-workspace.yaml          # Workspace config
└── README.md                    # Project README (links to /docs)
```

## 6. Tool Module Anatomy (Detailed)

This section expands AD-03. Every tool folder follows this exact structure.

### 6.1 The Manifest File (`manifest.ts`)

The manifest is the tool's identity and contract. It is the ONLY file the registry reads. Schema defined in `13_FBRD`.

```typescript
// src/tools/image/image-resize/manifest.ts
import { z } from 'zod';
import { inputStage } from './stages/input';
import { validationStage } from './stages/validation';
import { processingStage } from './stages/processing';
import { previewStage } from './stages/preview';
import { downloadStage } from './stages/download';
import type { ToolManifest } from '@packages/tool-engine';

export const manifest: ToolManifest = {
  slug: 'image-resize',
  category: 'image',
  title: 'Image Resizer',
  description: 'Resize images in your browser...',
  lifecycle: 'stable',                    // LOCK-12
  execution: 'browser',                   // LOCK-02
  inputSchema: z.object({...}),
  outputSchema: z.object({...}),
  stages: {
    input: inputStage,
    validation: validationStage,
    processing: processingStage,
    preview: previewStage,
    download: downloadStage,
    // history and share optional
  },
  seo: { /* per LOCK-08 */ },
  relatedTools: ['image-compress', 'image-crop'],
  faq: [ /* ... */ ],
};

export default manifest;
```

### 6.2 Stage Files (`stages/*.ts`)

Each stage is a pure function following the contract in `02_SAD` §6.1. Stages have no React imports (except `preview.tsx` which renders UI).

### 6.3 Components Folder (`components/`)

Tool-specific React components (input forms, configuration panels). These import from `@packages/ui` for design system primitives, never from other tools.

### 6.4 Hooks Folder (`hooks/`)

Tool-specific hooks. Reusable hooks live in `@packages/tool-engine` or `@/shared/hooks`.

### 6.5 Tests Folder (`tests/`)

- `stages.test.ts` — unit test per stage; pure function tests.
- `e2e.test.ts` — Playwright test for the full tool workflow.

### 6.6 README (optional)

For complex tools, a tool-specific README documents edge cases, performance notes, and design decisions. Not required for simple tools.

## 7. Tool Registry Pattern (Detailed)

### 7.1 Codegen Script

`scripts/generate-registry.ts`:

1. Walks `src/tools/**/manifest.ts` (using glob).
2. Dynamic-imports each manifest.
3. Validates each manifest against the Zod schema from `@packages/tool-engine`.
4. Validates slug/category uniqueness.
5. Emits typed files to `src/generated/`.

### 7.2 Generated Files

**`src/generated/registry.ts`:**

```typescript
// AUTO-GENERATED. Do not edit manually.
import type { ToolManifest } from '@packages/tool-engine';
import imageResize from '@/tools/image/image-resize/manifest';
import imageCompress from '@/tools/image/image-compress/manifest';
// ... all tool manifests

export const registry = {
  bySlug: (slug: string): ToolManifest | undefined => { /* ... */ },
  byCategory: (category: string): ToolManifest[] => { /* ... */ },
  relatedTo: (slug: string): ToolManifest[] => { /* ... */ },
  all: (): ToolManifest[] => { /* ... */ },
};

export const allManifests: ToolManifest[] = [/* ... */];
```

**`src/generated/navigation.ts`:**

```typescript
export const navigation = {
  image: [/* tool slugs */],
  pdf: [/* ... */],
  // ...
};
```

**`src/generated/sitemap.ts`:**

```typescript
export const sitemapEntries = [
  { url: '/tools/image/image-resize', lastModified: '2026-06-28', priority: 0.8 },
  // ...
];
```

### 7.3 CI Verification

`scripts/verify-registry.ts` runs in CI:
1. Regenerates the registry.
2. Diffs against committed files.
3. Fails if out of sync.

This ensures the committed registry always matches the manifests.

## 8. Module Boundaries

### 8.1 Boundary Enforcement

Boundaries are enforced at three levels:

1. **Folder structure** — visible in IDE; humans can see boundaries.
2. **ESLint `no-restricted-imports`** — automated; fails lint on violation.
3. **Code review** — final check; reviewers verify boundary compliance.

### 8.2 Boundary Rules

| Source → Target | Allowed? | Reason |
|-----------------|----------|--------|
| Tool → Tool (same tool) | ✅ | Same module |
| Tool → Tool (different tool) | ❌ | LOCK-04 isolation |
| Tool → Tool `_shared/` | ✅ | Tools-context-internal shared |
| Tool → `@packages/*` | ✅ | Reusable packages |
| Tool → `@/shared/*` | ✅ | App-specific shared |
| Tool → `@/identity/infrastructure/*` | ❌ | LOCK-06 |
| Tool → `@/content/infrastructure/*` | ❌ | LOCK-06 |
| Tool → Server Action (Identity) | ✅ | Published interface |
| `presentation/` → `infrastructure/` | ❌ | Layer violation |
| `domain/` → `react` | ❌ | Layer violation |
| Context A → Context B (internal) | ❌ | Use published API or events |

### 8.3 Server Actions as Published Interfaces

Server actions are the sanctioned way for tools (and other contexts) to invoke cross-context functionality:

```typescript
// src/identity/application/actions/history.ts
'use server';
export async function saveHistoryEntry(entry: HistoryEntryInput) {
  // Identity Context owns this; tools call it
}

// src/tools/image/image-resize/stages/history.ts
import { saveHistoryEntry } from '@/identity/application/actions/history';
// ✅ Allowed — server action is a published interface
```

Server actions are typed, audited, and rate-limited at the platform level.

## 9. Generated Files

### 9.1 What Is Generated

| File | Generated From | Used By |
|------|----------------|---------|
| `src/generated/registry.ts` | Tool manifests | App router, navigation, search |
| `src/generated/navigation.ts` | Tool manifests | Nav components, search index |
| `src/generated/sitemap.ts` | Tool manifests | SEO sitemap route |
| `src/generated/seo-meta.ts` | Tool manifests | Per-route SEO metadata |
| `src/generated/admin-inventory.ts` | Tool manifests | Admin tool list |
| `src/generated/types.ts` | Tool manifests | Type imports across app |

### 9.2 What Is NOT Generated

- Tool stage implementations — hand-written.
- Tool components — hand-written.
- Tool tests — hand-written.
- Documentation — hand-written.

### 9.3 Committing Generated Files

Generated files ARE committed to the repo. Reasons:
- Type safety across the team; no need to run codegen before type-checking.
- Faster CI (no codegen step before lint).
- Diff visibility in PRs (new tool → registry changes visible).

## 10. Standards

### 10.1 Directory Naming Standards
- All directories: `kebab-case`.
- Tool slugs: `kebab-case`, URL-safe, unique within category.
- Context directories: match bounded context name (`identity`, `content`, etc.).

### 10.2 File Placement Standards
- A file belongs to exactly one layer within one context.
- Shared utilities go in `/packages` (if reusable) or `/src/shared` (if app-specific).
- Tests are colocated with the code they test (`tests/` subdirectory).

### 10.3 Generated File Standards
- All generated files start with `// AUTO-GENERATED. Do not edit manually.`
- Generated files live in `/src/generated/` only.
- Manual edits to generated files are reverted by CI.

### 10.4 Tool Folder Standards
- Every tool folder MUST contain `manifest.ts` and `index.ts`.
- Every tool folder MUST contain `stages/` with at least 5 stage files (Input, Validation, Processing, Preview, Download).
- Every tool folder MUST contain `tests/` with at least one stage test.

## 11. Best Practices

### 11.1 When Adding a New Tool
1. Create folder: `src/tools/[category]/[slug]/`.
2. Copy the tool template (`scripts/tool-template/`) into the new folder.
3. Edit `manifest.ts` with tool metadata.
4. Implement each stage file.
5. Run `pnpm gen:registry`.
6. Verify the tool appears in navigation.
7. Run `pnpm test` and `pnpm lint`.
8. PR includes the new folder + updated generated files.

### 11.2 When Refactoring a Tool
- Keep changes within the tool folder where possible.
- If changes affect `_shared/` or `@packages/*`, get Chief Architect approval (LOCK-09).
- Update tests in the same PR.

### 11.3 When Adding a New Bounded Context
1. Get Chief Architect approval (requires DDD amendment per `03_DDD`).
2. Create `src/[context-name]/` with four layer subdirectories.
3. Create `drizzle/[context-name]/` for migrations.
4. Add context to ESLint boundary rules.
5. Update this document via PR.

### 11.4 When Moving Code Between Layers
- Moving code DOWN (Presentation → Application) is usually safe.
- Moving code UP (Domain → Application) requires justification; Domain should be stable.
- Moving code between contexts requires DDD amendment.

## 12. Future Scalability

### 12.1 Scaling to 1,000+ Tools
- Folder structure scales linearly; no reorganization needed.
- Build time scales linearly; mitigations at >500 tools:
  - Parallel manifest import during codegen.
  - Cache codegen output; invalidate only on manifest change.
  - Consider moving to a single index file per category.

### 12.2 Scaling to Multiple Teams
- Each team owns one or more bounded contexts.
- Cross-team changes via published interfaces (server actions, events).
- `/packages` owned by platform team; changes require their review.

### 12.3 Preparing for Plugin Marketplace (Phase 4)
- Tool folder structure is the plugin contract.
- Phase 4 adds:
  - `/plugins/` directory for third-party tools (separate from `/src/tools/`).
  - Plugin manifest signing (verifies publisher).
  - Plugin sandboxing (limits APIs available to third-party code).
  - Plugin versioning (manifest declares supported platform version).
- No changes to first-party tool structure; plugins follow the same anatomy.

### 12.4 Preparing for Multi-Tenancy (Phase 3+)
- Each context's domain layer gains `tenantId` on relevant aggregates.
- Infrastructure layer enforces tenant isolation in queries.
- No structural changes to top-level layout.

### 12.5 Preparing for Mobile App (Phase 3+)
- `/packages` code (types, schemas, utilities) is portable to React Native.
- `/src/tools/` Processing stages are portable (pure TS).
- UI layers rebuilt natively; share types via `/packages/types`.

## 13. Dependencies

### 13.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4 — LOCKs and ECs enforced via this structure.
- Depends on `02_SAD` — layer definitions and Tool Engine contract.
- Depends on `03_DDD` — bounded context boundaries.
- Depends on `04_TechStack` — pnpm workspaces, ESLint, Next.js App Router.
- `07_FolderStructure` — granular file conventions within this layout.
- `08_CodingStandards` — coding rules enforced in this structure.
- `06_ArchitectureDecisionRecords` — records AD-01 through AD-07 as ADRs.
- `11_ProductConstitution` — Expands PC-04 (Tool Template Standard), PC-10 (Product Scalability).
- `12_ToolManifestSpecification` — Defines the manifest schema this structure hosts.
- `13_FBRD` — ToolManifest schema referenced by registry.
- `14_ACD` — components referenced in `@packages/ui`.
- `24_AdminSpecification` — admin layout under `(admin)/` route group.
- `27_DeploymentGuide` — build pipeline runs codegen.

### 13.2 External Dependencies
- Next.js App Router (file-based routing).
- pnpm workspaces (monorepo support).
- ESLint `no-restricted-imports` (boundary enforcement).

### 13.3 Assumptions
- Next.js App Router remains stable; major version changes are infrequent.
- pnpm workspaces continue to support the monorepo pattern.
- File-based routing scales to thousands of dynamic routes (true via `generateStaticParams`).

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Project Structure. Defined feature-based top-level layout, layered folders per context, tool module anatomy, registry pattern (build-time codegen), shared code split (`/packages` + `/src/shared`), boundary enforcement strategy. |
| 1.1.0 | 2026-06-28 | Chief Architect | Linked structure to EC-03 (Component Reuse First) and EC-04 (Tool Template Standard). Renumbered cross-references to reflect insertion of `06_ArchitectureDecisionRecords`. |
| 1.2.0 | 2026-06-28 | Chief Architect | Linked structure to PC-04 (Tool Template Standard) and PC-10 (Product Scalability). Renumbered cross-references to reflect insertion of `11_ProductConstitution` and `12_ToolManifestSpecification` (docs 11-26 shifted to 13-28). |
| 1.3.0 | 2026-06-28 | Chief Architect | Linked structure to DGA-04 (Search Architecture — index generation). Renumbered cross-references to reflect insertion of `16_EventSchemaSpecification`, `17_AnalyticsArchitecture`, `18_SearchArchitecture` (docs 16-28 shifted to 19-31). |

## 15. Cross References

- `00_Project_Charter` §3, §4, §5, §6 — LOCKs, ECs, PCs, and DGAs implemented by this structure.
- `02_SAD` §3 AD-01 — Layered architecture mapped to folders here.
- `03_DDD` §5 — Bounded contexts mapped to top-level directories here.
- `04_TechStack` AD-11 — pnpm workspaces enable this monorepo.
- `06_ArchitectureDecisionRecords` — Permanent record of project structure ADs.
- `11_ProductConstitution` — Expands PC-04, PC-10.
- `12_ToolManifestSpecification` — Canonical schema this structure centers on.
- `16_EventSchemaSpecification` — Event schema location in structure.
- `17_AnalyticsArchitecture` — Analytics adapter location.
- `18_SearchArchitecture` — Search index generation pattern.
- `07_FolderStructure` — Granular file naming within this structure.
- `08_CodingStandards` — Coding rules enforced via ESLint configured here.
- `09_NamingConvention` — Naming rules applied to files in this structure.
- `13_FBRD` — ToolManifest schema (the file this structure centers on).
- `14_ACD` — Reusable components in `@packages/ui`.
- `19_DatabaseDesign` — Drizzle migrations under `drizzle/[context]/`.
- `20_APIConvention` — API routes under `src/app/api/`.
- `21_SEOSpecification` — SEO output derived from generated registry.
- `24_AdminSpecification` — Admin routes under `src/app/(admin)/`.
- `25_DevelopmentGuideline` — Development workflow within this structure.
- `27_DeploymentGuide` — Build pipeline including registry codegen.
- `28_AI_Guideline` — AI must follow this structure (LOCK-09, EC-11).
