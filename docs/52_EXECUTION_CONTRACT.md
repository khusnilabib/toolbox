# 52 — Execution Contract

> **Status:** 🔒 IMMUTABLE — Cannot be modified unless superseded by a new ADR.
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Purpose:** Freeze all project conventions before any code is written. Every future implementation MUST comply with this contract.

---

## 1. Frozen Technology Stack

The following technologies are **approved and frozen**. No substitution, removal, or addition is permitted without an ADR approved by the Chief Architect.

| Layer | Technology | Version Constraint | ADR Reference |
|-------|-----------|-------------------|---------------|
| Framework | Next.js | 15+ (App Router) | ADR-036 |
| Language | TypeScript | 5+ (strict mode) | ADR-037 |
| Styling | Tailwind CSS | 4+ | ADR-041 |
| Components | shadcn/ui (Radix UI primitives) | Latest stable | ADR-040 |
| Database | Supabase (Postgres) | Latest stable | ADR-038 |
| ORM | Drizzle ORM | Latest stable | ADR-039 |
| Auth | Supabase Auth | Latest stable | ADR-038 |
| Storage | Supabase Storage | Latest stable | ADR-038 |
| Hosting | Vercel (Edge + Serverless) | Latest stable | ADR-045 |
| Package Manager | pnpm | 9+ (workspaces) | ADR-046 |
| Validation | Zod | 3+ | ADR-042 |
| Forms | React Hook Form | 7+ | ADR-043 |
| Client State | Zustand | 4+ | ADR-044 |
| Icons | lucide-react | Latest stable | `10_DesignSystem` AD-09 |
| Error Tracking | Sentry | Latest stable | `26_ObservabilitySpecification` AD-03 |
| Analytics (Adapter) | GA4 / PostHog / Plausible | Via adapter pattern | ADR-065 |
| E2E Testing | Playwright | Latest stable | ADR-021 |
| Unit Testing | Vitest | Latest stable | ADR-021 |
| Component Testing | Testing Library (@testing-library/react) | Latest stable | ADR-021 |
| Accessibility Testing | axe-core | Latest stable | ADR-021 |
| Performance Testing | Lighthouse CI | Latest stable | ADR-021 |

**Rule:** Adding any dependency not listed here requires Chief Architect approval and ADR documentation (LOCK-09, EC-03).

---

## 2. Approved Dependencies

### 2.1 Approved (No Approval Needed)

The technologies in §1 are pre-approved. The following additional libraries are approved for specific use cases:

| Library | Use Case | When |
|---------|---------|------|
| `browser-image-compression` | Image compression (browser) | Image Compressor tool |
| `pdf-lib` | PDF manipulation (browser) | PDF tools (merge, split, rotate, watermark) |
| `qrcode` | QR code generation (browser) | QR Generator tool |
| `marked` | Markdown rendering (browser) | Markdown Preview tool |
| `tesseract.js` | OCR via WASM (browser, lazy-loaded) | OCR tool (small files) |
| `tesseract` | OCR (server-side, native) | OCR tool (large files, server fallback) |
| `stripe` | Payment processing | Billing Context (Phase 2+) |
| `resend` | Transactional email | Identity Context (Phase 2+) |
| `next/font` | Font optimization | All fonts |
| `next/image` | Image optimization | All images |
| `tailwindcss-animate` | Tailwind animation plugin | Design system animations |
| `comlink` | Web Worker wrapper | Heavy processing tools |
| `posthog-js` | PostHog analytics adapter | Analytics (Phase 2+) |
| `@axe-core/playwright` | Accessibility E2E testing | All E2E test suites |

### 2.2 Prohibited Dependencies

The following are **prohibited** unless a future ADR explicitly approves them:

| Prohibited | Reason | Alternative |
|-----------|--------|-------------|
| Redux / Redux Toolkit | Overkill for our state needs | Zustand |
| Material UI (MUI) | Heavy, opinionated, conflicts with design system | shadcn/ui |
| Ant Design | Not aligned with developer-first minimalism | shadcn/ui |
| Chakra UI | Runtime CSS-in-JS overhead | shadcn/ui + Tailwind |
| Bootstrap | Conflicts with Tailwind; opinionated | Tailwind CSS |
| jQuery | Unnecessary; modern JS/React | Native APIs / React |
| CSS Modules | Conflicts with Tailwind utility-first | Tailwind CSS |
| styled-components / Emotion | Runtime CSS-in-JS overhead | Tailwind CSS |
| Prisma | Query engine incompatible with Edge Runtime | Drizzle ORM |
| TypeORM | Decorator-based; less type-safe; maintenance concerns | Drizzle ORM |
| Formik | Less performant than RHF | React Hook Form |
| Yup | Less type-inference than Zod | Zod |
| Joi | Weaker TypeScript integration | Zod |
| Moment.js | Deprecated; large | Native `Intl` / `date-fns` (if needed, ADR required) |
| Lodash | Most utilities available natively or in `@packages/utils` | Native JS / custom utils |
| Axios | `fetch` is sufficient | Native `fetch` |
| Express | Next.js API routes suffice | Next.js API routes |
| NestJS | Overkill for our architecture | Next.js server actions + API routes |
| Sentry SDK (alternative) | Already using Sentry | Sentry |
| Datadog / New Relic | Cost; free-tier incompatible | Vercel Analytics + Sentry |
| Algolia | Cost; Phase 3+ evaluation | Pagefind (client-side) |
| Firebase | NoSQL doesn't fit; vendor lock-in worse than Supabase | Supabase |
| AWS SDK (direct) | Use Vercel/Supabase abstractions | Vercel + Supabase |

**Rule:** Any dependency not in §1 or §2.1 is prohibited by default. Adding it requires ADR approval with justification (LOCK-09, EC-03, `04_TechStack` §6).

---

## 3. Folder Freeze

The following top-level folder structure is **frozen**. No new top-level directories may be added without ADR approval.

```
[PROJECT_NAME]/
├── docs/                        # Documentation (00-52 + README) — FROZEN
├── public/                      # Static assets — FROZEN
├── scripts/                     # Build scripts, codegen — FROZEN
├── src/
│   ├── app/                     # Next.js App Router — FROZEN
│   ├── tools/                   # Tools Context — FROZEN
│   ├── identity/                # Identity Context — FROZEN
│   ├── content/                 # Content Context — FROZEN
│   ├── platform-ops/            # Platform Ops Context — FROZEN
│   ├── billing/                 # Billing Context (Phase 2+) — FROZEN
│   ├── analytics/               # Analytics Context — FROZEN
│   ├── shared/                  # App-specific shared — FROZEN
│   └── generated/               # Build-time generated — FROZEN
├── packages/                    # Reusable packages — FROZEN
│   ├── tool-engine/             # FROZEN
│   ├── ui/                      # FROZEN
│   ├── utils/                   # FROZEN
│   └── types/                   # FROZEN
├── drizzle/                     # DB migrations — FROZEN
├── tests/                       # Project-wide tests — FROZEN
├── .github/                     # CI/CD — FROZEN
└── [config files]               # FROZEN
```

### 3.1 Within Each Bounded Context (Frozen Layer Structure)

```
src/[context]/
├── presentation/                # React components, pages
├── application/                 # Server actions, hooks, services
├── domain/                      # Entities, schemas, events
└── infrastructure/              # DB, external APIs, storage
```

No additional layer directories may be created. Subdirectories within layers (e.g., `presentation/components/`, `domain/entities/`) follow `07_FolderStructure` AD-05.

### 3.2 Tool Folder Structure (Frozen per `45_AI_TOOL_TEMPLATE`)

```
src/tools/[category]/[slug]/
├── manifest.ts                  # MANDATORY
├── index.ts                     # MANDATORY
├── stages/                      # MANDATORY (5-7 files)
├── components/                  # OPTIONAL
├── hooks/                       # OPTIONAL
├── lib/                         # OPTIONAL
├── tests/                       # MANDATORY
└── README.md                    # OPTIONAL (mandatory for complex)
```

### 3.3 Route Group Structure (Frozen)

```
src/app/
├── (public)/                    # Public routes
├── (auth)/                      # Auth-required routes
├── (admin)/                     # Admin routes
├── (marketing)/                 # Marketing pages
├── api/                         # API routes
├── layout.tsx                   # Root layout
├── globals.css                  # Global styles
├── not-found.tsx                # 404
└── error.tsx                    # Error boundary
```

**Rule:** Adding any directory outside this frozen structure requires ADR approval.

---

## 4. Naming Freeze

All naming conventions are frozen per `09_NamingConvention`. The following are the immutable rules:

### 4.1 Files

| Type | Convention | Example |
|------|-----------|---------|
| React component | `PascalCase.tsx` | `ToolCard.tsx` |
| Non-component TS | `kebab-case.ts` | `image-utils.ts` |
| Hook | `use-[name].ts` | `use-tool-history.ts` |
| Type definitions | `[name].types.ts` | `tool.types.ts` |
| Zod schema | `[name]-schema.ts` | `user-schema.ts` |
| Test (unit/integration) | `[subject].test.ts` | `image-utils.test.ts` |
| Test (E2E) | `[scenario].spec.ts` | `tool-workflow.spec.ts` |
| Config | `[name].config.ts` | `tailwind.config.ts` |
| Manifest | `manifest.ts` | `manifest.ts` |
| Barrel | `index.ts` | `index.ts` |
| Documentation | `kebab-case.md` | `coding-standards.md` |

### 4.2 Folders

- All folders: `kebab-case`.
- Special: `_shared/` for category-internal shared (sorts first).
- Route groups: `(name)` per Next.js convention.

### 4.3 Variables & Functions

- `camelCase` for variables, functions, parameters.
- Verbs for functions: `get`, `fetch`, `save`, `create`, `update`, `delete`, `validate`, `process`, `parse`, `format`.
- Booleans prefixed: `is`, `has`, `can`, `should`.
- Constants: `SCREAMING_SNAKE_CASE` for true constants; `camelCase` for configurable.

### 4.4 Types & Interfaces

- `PascalCase` for types, interfaces, enums, unions.
- No `I` prefix for interfaces. No `Type` suffix (unless disambiguating).
- Suffixes: `Props`, `State`, `Schema`, `Input`, `Output`, `Event`, `Error`, `Config`, `Result`.

### 4.5 Components

- `PascalCase` nouns: `ToolCard`, `ImageUploader`, `DownloadButton`.
- Suffixes: `Card`, `List`, `Item`, `Button`, `Form`, `Field`, `Modal`, `Provider`, `Layout`, `Page`.

### 4.6 Hooks

- `use` prefix + `camelCase`: `useToolHistory`, `useCurrentUser`, `useTheme`.
- Boolean hooks: `useIs*`, `useHas*`.

### 4.7 Routes (URLs)

- `kebab-case`, plural nouns for collections: `/api/v1/tools`, `/api/v1/users`.
- Single resource: `/api/v1/[collection]/[id]`.
- Actions: `/api/v1/[collection]/[id]/[action]`.
- Versioned: `/api/v1/...`.

### 4.8 Database

- Tables: `snake_case`, plural (`users`, `history_entries`).
- Columns: `snake_case` (`created_at`, `user_id`).
- Primary key: `id` (UUID).
- Foreign key: `[table_singular]_id` (`user_id`).
- Timestamps: `created_at`, `updated_at`, `deleted_at`.
- Booleans: `is_` or `has_` prefix.
- Indexes: `idx_[table]_[columns]`.
- Unique: `uq_[table]_[columns]`.
- FK constraint: `fk_[from]_[to]`.
- Check: `ck_[table]_[description]`.

### 4.9 Manifest

- `slug`: `kebab-case`, URL-safe, unique within category.
- `category`: enum (`image`, `pdf`, `developer`, `text`, `converters`, `seo`, `calculators`, `utility`, `ai`).
- `lifecycle`: enum (9 values per LOCK-12).

### 4.10 Events

- `snake_case`, past tense: `tool_viewed`, `processing_completed`.
- Structure: `[subject]_[action]`.
- Domain prefix: `tool_`, `auth_`, `search_`, `admin_`, `page_`.

**Rule:** These naming conventions are frozen. Any deviation requires ADR approval.

---

## 5. Coding Freeze

The following coding rules are **frozen** and enforced via ESLint, TypeScript compiler, and code review:

### 5.1 TypeScript

- `strict: true` — mandatory.
- `noUncheckedIndexedAccess: true` — mandatory.
- `noImplicitOverride: true` — mandatory.
- `exactOptionalPropertyTypes: true` — mandatory.
- `noFallthroughCasesInSwitch: true` — mandatory.
- `noUnusedLocals: true` — mandatory.
- `noUnusedParameters: true` — mandatory.
- `noImplicitReturns: true` — mandatory.
- **No `any` type.** ESLint `@typescript-eslint/no-explicit-any` = error. Use `unknown` + Zod narrowing.
- **No `as` type assertions** without justification in comment.
- **No `!` non-null assertions** without justification in comment.
- Zod schemas at every IO boundary (request, response, manifest, env vars, file upload, localStorage/IndexedDB).
- TypeScript types inferred from Zod schemas (`z.infer<typeof schema>`).

### 5.2 React / Next.js

- **Server Components by default.** Use `'use client'` only when necessary (state, effects, event handlers, browser APIs).
- **No class components.** Function components only.
- **One component per file.** (Exception: small private sub-components in same file.)
- **Hooks at top level only.** Never in conditions, loops, or nested functions.
- **`useEffect` with cleanup** when side effects need cleanup.
- **`React.memo` / `useMemo` / `useCallback`** only when measured performance benefit (not premature).

### 5.3 Architecture Rules

- **Browser-first:** Processing in browser whenever technically possible (LOCK-02).
- **No business logic in UI components.** Business logic in domain/application layers.
- **No duplicated logic.** Every business rule exists in exactly one place (EC-02).
- **No duplicated components.** Search before creating (EC-03).
- **No hardcoded values.** Use constants, config, or env vars (AD-12 in `08_CodingStandards`).
- **Composition over inheritance.** No class inheritance deeper than 1 level.
- **Layer boundaries enforced.** ESLint `no-restricted-imports`:
  - `presentation/` → cannot import from `infrastructure/`.
  - `domain/` → cannot import from React or Next.js.
  - `src/tools/` → cannot import from any context's `infrastructure/`.
  - Cross-context internal imports blocked; use server actions or domain events.

### 5.4 Code Style (Prettier — Frozen)

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

### 5.5 File Size Limits

- **Soft limit:** 300 lines per file.
- **Hard limit:** 500 lines per file (ESLint `max-lines` = error).
- **Exception:** Generated files (`src/generated/`) exempt.
- **Test files:** 500-line soft, 800-line hard.

### 5.6 Conventional Commits

```
feat: add image resize tool
fix: correct PDF merge order bug
docs: update API convention
refactor: extract validation logic
chore: update dependencies
test: add E2E test for image resize
```

**Rule:** These coding rules are frozen. Any deviation requires ADR approval.

---

## 6. Tool Implementation Contract

Every new tool MUST follow this contract without exception. No tool may be promoted to `Stable` without satisfying all items.

### 6.1 Mandatory Structure

Per `45_AI_TOOL_TEMPLATE` and `07_FolderStructure` AD-03:

```
src/tools/[category]/[slug]/
├── manifest.ts          # MANDATORY — complete per 12_ToolManifestSpecification
├── index.ts             # MANDATORY — re-exports manifest
├── stages/
│   ├── input.ts         # MANDATORY
│   ├── validation.ts    # MANDATORY — Zod schema from manifest.inputSchema
│   ├── processing.ts    # MANDATORY — browser-side per LOCK-02
│   ├── preview.tsx      # MANDATORY — React component
│   ├── download.ts      # MANDATORY
│   ├── history.ts       # OPTIONAL
│   └── share.ts         # OPTIONAL
├── components/          # OPTIONAL — tool-specific UI
├── hooks/               # OPTIONAL
├── lib/                 # OPTIONAL — pure utilities
├── tests/
│   ├── stages.test.ts   # MANDATORY — unit tests per stage
│   ├── e2e.test.ts      # MANDATORY — Playwright E2E
│   └── accessibility.test.ts  # MANDATORY — axe-core
└── README.md            # MANDATORY for complex tools
```

### 6.2 Manifest Requirements (PC-02)

Every manifest MUST include ALL of the following fields:

| Field Group | Required Fields |
|-------------|----------------|
| Identity | `manifestVersion`, `slug`, `category`, `title`, `description`, `lifecycle`, `version` |
| Product Contract | `purpose`, `userProblem`, `inputSchema` (Zod), `outputSchema` (Zod), `validationRules`, `successCriteria`, `failureStates` (PC-08), `emptyStates`, `loadingStates` |
| Execution | `execution` ('browser' or 'server'), `stages` (5-7 stage implementations) |
| SEO | `seo.searchIntent`, `seo.title`, `seo.description`, `seo.keywords`, `seo.canonicalUrl`, `seo.openGraph`, `seo.twitterCard`, `seo.structuredData`, `seo.faq` (min 3), `seo.breadcrumb` (min 2) |
| Discoverability | `relatedTools` (min 3 slugs) |
| Analytics | `analytics.events`, `analytics.funnelSteps` (min 4) |
| Limits | `limits.maxInputSize`, `limits.maxOutputSize`, `limits.maxProcessingTime`, `limits.requiresAuth`, `limits.premiumOnly` |

### 6.3 Definition of Done (PC-03 — 13 Items)

Every tool MUST have ALL 13 items before promotion to `Stable`:

1. ✅ Upload/Input implemented
2. ✅ Validation implemented (Zod)
3. ✅ Processing stage implemented (browser-side per LOCK-02)
4. ✅ Preview component implemented
5. ✅ Download/Copy implemented
6. ✅ Error Handling (PC-08: what/why/how, no stack traces)
7. ✅ Success Feedback (toast/notification)
8. ✅ Accessibility (WCAG 2.1 AA, keyboard, screen reader, reduced motion)
9. ✅ Mobile Support (360px viewport, ≥44px touch targets)
10. ✅ SEO (all `seo` manifest fields, JSON-LD valid, Lighthouse SEO ≥95)
11. ✅ Analytics (all 10 standard events auto-emitted + custom events)
12. ✅ Documentation (README, manifest accurate, ADRs updated)
13. ✅ Tests (unit + E2E + accessibility)

### 6.4 Quality Gates (PC-04 — 7 Reviews)

Before promotion to `Stable`, all 7 gates MUST pass:

1. ✅ **Functional review** — all features work; tests pass.
2. ✅ **Accessibility review** — WCAG AA; Lighthouse ≥95; keyboard/screen reader tested.
3. ✅ **Performance review** — Lighthouse ≥90; bundle <200KB; TTFB <500ms.
4. ✅ **SEO review** — all `21_SEOSpecification` requirements; structured data valid.
5. ✅ **Security review** — input validated; no secrets; RLS policies.
6. ✅ **Documentation review** — README complete; ADRs updated; manifest accurate.
7. ✅ **UX review** — PC-05 layout; PC-08 errors; mobile usable.

**Rule:** No exceptions. No tool reaches `Stable` without all 13 items + all 7 gates.

---

## 7. Admin Module Contract

Every admin module MUST follow this contract per `46_AI_ADMIN_TEMPLATE` and `29_AdminSpecification`.

### 7.1 Page Structure (Frozen)

```
src/app/(admin)/admin/[module]/
├── page.tsx                  # List view
├── [id]/page.tsx             # Detail view (if applicable)
├── new/page.tsx              # Create form (if applicable)
├── components/
│   ├── [Module]Table.tsx
│   ├── [Module]Form.tsx
│   └── [Module]Detail.tsx
└── tests/
    └── [module].test.tsx
```

Server actions in: `src/platform-ops/application/actions/[module].ts`

### 7.2 Mandatory Requirements

| Requirement | Rule |
|-------------|------|
| RBAC | `requirePermission()` on every page and server action |
| Audit | `requirePermissionWithAudit()` for all write actions (DGA-07) |
| Validation | Zod schema on all server action inputs |
| Error format | `{ error: { code, message, details, requestId } }` per `20_APIConvention` |
| Accessibility | WCAG AA; semantic tables; labeled forms; keyboard nav |
| Tests | List, create, update, delete, permission denial |
| Design system | Components from `@packages/ui` and `@/shared/components` (EC-10) |
| Documentation | Update `29_AdminSpecification` or `14_ACD` if new pattern |

### 7.3 Permission Matrix (Frozen)

| Module | Read | Write |
|--------|------|-------|
| Dashboard | editor | N/A |
| Users | admin | super_admin |
| Tools | editor | admin |
| Content | editor | editor |
| SEO | editor | editor |
| Analytics | admin | N/A |
| Feature Flags | admin | admin |
| Audit Trail | admin | N/A (read-only) |
| Settings | admin | admin |
| System Health | admin | N/A |

**Rule:** No admin module may be created outside this contract.

---

## 8. Pull Request Contract

Every PR MUST pass ALL of the following before merge. No exceptions.

### 8.1 Automated CI Checks

| Check | Tool | Threshold | Blocking? |
|-------|------|-----------|-----------|
| Lint | ESLint + Prettier | 0 errors | ✅ Yes |
| Type Check | `tsc --noEmit` | 0 errors | ✅ Yes |
| Unit Tests | Vitest | All pass | ✅ Yes |
| Build | `pnpm build` | Succeeds | ✅ Yes |
| Security Scan | `pnpm audit` + `secretlint` | 0 critical | ✅ Yes |
| Registry Verification | `scripts/verify-registry.ts` | Generated files match manifests | ✅ Yes |
| Lighthouse Performance | Lighthouse CI | ≥90 | ✅ Yes |
| Lighthouse Accessibility | Lighthouse CI | ≥95 | ✅ Yes |
| Lighthouse SEO | Lighthouse CI | ≥95 | ✅ Yes |
| Bundle Size | Bundle analyzer | Tool chunk <200KB; total <500KB | ✅ Yes |

### 8.2 Manual Review Checks

| Check | Reviewer | Blocking? |
|-------|----------|-----------|
| Code review checklist (`08_CodingStandards` §13) | Peer engineer | ✅ Yes |
| Architecture compliance (boundaries, governance) | Peer engineer | ✅ Yes |
| Documentation updated (EC-01) | Peer engineer | ✅ Yes |
| ADR updated (if architectural change) | Chief Architect | ✅ Yes |
| No duplicated components/logic (EC-02, EC-03) | Peer engineer | ✅ Yes |
| No new dependencies without approval (LOCK-09) | Chief Architect | ✅ Yes |
| Definition of Ready satisfied (`40_DefinitionOfReady`) | Chief Architect | ✅ Yes (for new items) |
| Definition of Done satisfied (PC-03, if tool) | Reviewer per gate | ✅ Yes |

### 8.3 Merge Rules

- **Squash merge** to `main` with conventional commit message.
- **Minimum 1 approval** from peer reviewer.
- **All CI checks green.**
- **All manual checks verified.**
- **Branch deleted after merge.**
- **Post-deploy monitoring** for 30 minutes.

**Rule:** No PR merges without all checks passing. No "I'll fix it later" exceptions.

---

## 9. AI Behavior Contract

AI (and any human using AI tooling) MUST adhere to the following behavioral contract. Violations are EC-11 violations and block PR merge.

### 9.1 AI Must NEVER

| Prohibited Action | Rule Reference |
|-------------------|----------------|
| Invent architecture not in ADR repository | LOCK-09, EC-11, ADR-009 |
| Rename folders | LOCK-09, §3 (Folder Freeze) |
| Rename files (outside naming convention) | LOCK-09, §4 (Naming Freeze) |
| Duplicate components | EC-03, ADR-015 |
| Duplicate business logic | EC-02, ADR-014 |
| Create parallel implementations | EC-02, EC-03 |
| Ignore ADR repository | LOCK-09, EC-01 |
| Ignore governance (LOCKs, ECs, PCs, DGAs, POCs) | All governance tiers |
| Guess implementation details | EC-11, `33_AI_Guideline` Rule 1 |
| Skip testing | EC-09, ADR-021, PC-03 |
| Skip documentation | EC-01, ADR-013, PC-03 |
| Introduce dependencies without approval | LOCK-09, ADR-009 |
| Change folder conventions | LOCK-09, §3 |
| Use `any` type | EC-08, `08_CodingStandards` AD-02 |
| Hardcode SEO values in pages | DGA-03, ADR-066 |
| Bypass RBAC checks | EC-08, `23_RBAC` |
| Bypass RLS policies | EC-08, `19_DatabaseDesign` AD-02 |
| Expose stack traces to users | PC-08, ADR-061 |
| Block core tool completion with paywall | PC-06, ADR-059, LOCK-07 |
| Require registration before value | LOCK-07, ADR-007 |
| Deploy without rollback plan | POC-04, ADR-077 |
| Skip the AI Development Workflow | `35_AI_DevelopmentWorkflow` |
| Implement before approval | `35_AI_DevelopmentWorkflow` Step 6 |

### 9.2 AI Must ALWAYS

| Required Action | Rule Reference |
|-----------------|----------------|
| Read `42_AI_MASTER_CONTEXT` first | `48_AI_SESSION_START` |
| Reference documentation before proposing changes | EC-01, EC-11 |
| Consult ADR repository before architectural decisions | LOCK-09, `35_AI_DevelopmentWorkflow` Step 2 |
| Search existing components before creating new | EC-03, `44_AI_DECISION_TREE` |
| Explain trade-offs before major decisions | EC-11, `33_AI_Guideline` Rule 6 |
| Ask before assuming | EC-11, `33_AI_Guideline` Rule 7 |
| Follow the 10-step AI Development Workflow | `35_AI_DevelopmentWorkflow` |
| Update documentation in same PR as code | EC-01 |
| Write tests alongside implementation | EC-09 |
| Use design system components | EC-10 |
| Validate all IO with Zod | EC-08 |
| Follow naming conventions | §4, `09_NamingConvention` |
| Follow folder structure | §3, `07_FolderStructure` |
| Emit standard analytics events | PC-07, DGA-02 |
| Respect governance hierarchy (6 tiers) | `00_Project_Charter` |
| Produce implementation incrementally | `48_AI_SESSION_START` |
| Wait for approval before architectural changes | `35_AI_DevelopmentWorkflow` Step 6 |

**Rule:** These AI behavior rules are frozen and binding on all AI interactions.

---

## 10. Change Management

Every architectural change — no matter how small — requires the following process. **No silent architectural changes are permitted.**

### 10.1 Architectural Change Process

```
1. IDENTIFY CHANGE
   — What architectural element is changing?
   — Which ADR currently governs it?
   — Which governance tier (LOCK/EC/PC/DGA/POC) is affected?
   ↓
2. WRITE ADR
   — Draft new ADR (or supersession) per 06_ArchitectureDecisionRecords template.
   — Include: Context, Decision, Consequences, Alternatives, Future Review Trigger.
   ↓
3. IMPACT ANALYSIS
   — What documents need updating?
   — What code needs changing?
   — What migrations are needed?
   — What is the rollback plan?
   — What is the risk level?
   ↓
4. MIGRATION PLAN
   — If breaking change: multi-step migration (add → deploy → backfill → deploy → remove).
   — If additive: forward-compatible; no migration needed.
   — Database: Drizzle migration with RLS policies.
   ↓
5. APPROVAL
   — Chief Architect reviews ADR.
   — Chief Architect approves or rejects.
   — If LOCK/EC/PC/DGA/POC change: charter revision required.
   ↓
6. DOCUMENTATION UPDATE
   — Update affected technical documents.
   — Update revision history.
   — Update cross-references.
   — Update AI context pack (42-51) if structure changes.
   ↓
7. IMPLEMENTATION
   — Follow AI Development Workflow (35).
   — Implement change per approved ADR.
   — Update tests.
   — Pass all quality gates.
   ↓
8. VERIFICATION
   — Verify all CI checks pass.
   — Verify documentation is consistent.
   — Verify no governance violations.
   — Verify rollback plan works.
```

### 10.2 What Constitutes an Architectural Change

| Change Type | Requires ADR? | Requires Charter Revision? |
|-------------|---------------|---------------------------|
| New dependency | ✅ Yes | No |
| Removing dependency | ✅ Yes | No |
| New folder structure | ✅ Yes | No |
| New bounded context | ✅ Yes | No |
| New database table | ✅ Yes (if new pattern) | No |
| New API version | ✅ Yes | No |
| Changing LOCK | ✅ Yes | ✅ Yes |
| Changing EC | ✅ Yes | ✅ Yes |
| Changing PC | ✅ Yes | ✅ Yes |
| Changing DGA | ✅ Yes | ✅ Yes |
| Changing POC | ✅ Yes | ✅ Yes |
| New tool (following existing pattern) | ❌ No | No |
| Bug fix (no architecture change) | ❌ No | No |
| Refactor (no architecture change) | ❌ No | No |
| New component (following existing pattern) | ❌ No | No |

### 10.3 Documentation Update Requirements

Per EC-01, every architectural change MUST update:
1. The relevant technical document(s).
2. Revision history in every modified document.
3. `06_ArchitectureDecisionRecords` (new ADR or supersession).
4. `42_AI_MASTER_CONTEXT` if the change affects the executive summary.
5. `43_AI_IMPLEMENTATION_RULES` if new rules are introduced.
6. `49_AI_CONTEXT_INDEX` if document structure changes.
7. `51_PROJECT_HEALTH_DASHBOARD` if metrics change.

**Rule:** No silent architectural changes. Every change is documented, approved, and traceable.

---

## 11. Contract Enforcement

### 11.1 Automated Enforcement

| Rule | Enforcement Mechanism |
|------|----------------------|
| No `any` | ESLint `@typescript-eslint/no-explicit-any` (error) |
| TypeScript strict | `tsconfig.json` `strict: true` |
| File size limits | ESLint `max-lines` (500 error) |
| Layer boundaries | ESLint `no-restricted-imports` |
| No secrets | `secretlint` pre-commit hook |
| Prettier formatting | Husky + lint-staged pre-commit |
| Lighthouse scores | Lighthouse CI in GitHub Actions |
| Bundle size | Bundle analyzer in CI |
| Registry sync | `verify-registry.ts` in CI |
| Tests pass | Vitest + Playwright in CI |

### 11.2 Manual Enforcement

| Rule | Enforcement Mechanism |
|------|----------------------|
| No duplicated components | Code review checklist |
| Governance compliance | Code review checklist |
| ADR precedent | Code review checklist |
| Documentation updated | Code review checklist |
| AI workflow followed | PR description verification |
| Quality gates passed | Promotion review |
| Definition of Ready | Sprint planning verification |

### 11.3 Violation Consequences

| Violation Type | Consequence |
|---------------|-------------|
| ESLint/TypeScript error | CI fails; PR blocked |
| Test failure | CI fails; PR blocked |
| Lighthouse below budget | CI fails; PR blocked |
| Bundle size exceeded | CI fails; PR blocked |
| Missing documentation | PR blocked by reviewer |
| Missing ADR (architectural change) | PR blocked by reviewer |
| Governance violation | PR blocked; Chief Architect notified |
| AI workflow bypassed | PR blocked; process review |
| Unapproved dependency | PR blocked; dependency removed |

---

## 12. Contract Immutability

This document is **immutable**. It cannot be modified unless:

1. A new ADR is written proposing a change to this contract.
2. The ADR is approved by the Chief Architect.
3. If the change affects a governance tier (LOCK/EC/PC/DGA/POC), a charter revision is required.
4. The contract document is updated with a new revision number.
5. All downstream documents (42-51 AI context pack) are updated to reflect the change.

**No silent changes to this contract. No exceptions for "just this once." No verbal agreements. Everything in writing, everything in ADRs.**

---

## 13. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Execution Contract. Froze technology stack, dependencies, folder structure, naming conventions, coding rules, tool implementation contract, admin module contract, PR contract, AI behavior contract, and change management process. |

## 14. Cross References

- `00_Project_Charter` — All governance tiers (§3 LOCKs, §4 ECs, §5 PCs, §6 DGAs, §7 POCs).
- `06_ArchitectureDecisionRecords` — 83 ADRs; append-only.
- `07_FolderStructure` — Folder structure detail.
- `08_CodingStandards` — Coding rules detail.
- `09_NamingConvention` — Naming rules detail.
- `12_ToolManifestSpecification` — Manifest schema.
- `35_AI_DevelopmentWorkflow` — Mandatory AI workflow.
- `42_AI_MASTER_CONTEXT` — Executive summary.
- `43_AI_IMPLEMENTATION_RULES` — Concise governance rules.
- `45_AI_TOOL_TEMPLATE` — Tool template.
- `46_AI_ADMIN_TEMPLATE` — Admin template.
- `48_AI_SESSION_START` — Session initialization prompt.
- `50_IMPLEMENTATION_SEQUENCE` — Implementation order.
- `51_PROJECT_HEALTH_DASHBOARD` — Project health.
