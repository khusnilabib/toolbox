# 09 — Naming Convention

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-04 (Modular), LOCK-09 (AI Discipline); EC-02 (One Source of Truth), EC-04 (Tool Template Standard)

---

## 1. Purpose

This Naming Convention document defines the mandatory naming rules for every identifier in [PROJECT_NAME]: files, folders, variables, functions, types, components, hooks, props, CSS classes, database tables, API endpoints, environment variables, and more. Where `07_FolderStructure` defines folder/file structure, this document defines what those entities are named and how naming conveys intent.

Naming is the single most impactful code-quality factor. Engineers read names far more often than they read implementations; a good name communicates intent instantly, while a bad name requires reading the implementation to understand. Inconsistent naming — `getUserData` in one file, `fetchUserInfo` in another, `retrieveUser` in a third — fragments the codebase's mental model and slows every contributor. AI assistants (LOCK-09) particularly depend on consistent naming to make correct suggestions.

This document enforces LOCK-04 (modularity — consistent naming across modules), LOCK-09 (AI discipline — AI can rely on naming patterns), EC-02 (one source of truth — names refer to one concept), and EC-04 (tool template standard — every tool uses identical naming).

## 2. Scope

### 2.1 In Scope

- File naming conventions (per file type).
- Folder naming conventions.
- Variable, function, parameter naming.
- Type, interface, enum, union naming.
- React component naming (PascalCase rules).
- Hook naming (`use*` prefix).
- Props naming.
- CSS class / Tailwind token naming.
- Database table, column, index, constraint naming.
- API endpoint naming (URL paths).
- Environment variable naming.
- Constant naming.
- Event naming (domain events).
- Tool slug naming (URL-safe identifiers).

### 2.2 Out of Scope

- File organization within folders → `07_FolderStructure`.
- Code style within files → `08_CodingStandards`.
- Design token values → `10_DesignSystem`.
- Specific tool slugs → `26_Backlog`.

## 3. Architectural Decisions

### AD-01 — Three Casing Conventions

**Context.** Different identifier types have different conventions in the JavaScript/TypeScript ecosystem. Using one convention everywhere conflicts with ecosystem expectations; using too many creates cognitive load.

**Decision.** Three casing conventions, each tied to identifier type:

| Convention | Used For | Example |
|-----------|----------|---------|
| `PascalCase` | React components, types, interfaces, enums, Zod schemas | `ToolCard`, `User`, `HistoryEntry` |
| `camelCase` | Variables, functions, parameters, hooks (with `use` prefix), props | `toolSlug`, `getUser()`, `useToolHistory()`, `onComplete` |
| `kebab-case` | Files (non-component), folders, URLs, CSS classes, env vars | `image-resize.ts`, `tools/image/`, `/tools/image-resize`, `NEXT_PUBLIC_SITE_URL` |

**Rationale:**
- `PascalCase` for types/components matches TypeScript/React ecosystem (instantly distinguishable from values).
- `camelCase` for values matches JavaScript standard.
- `kebab-case` for files/URLs matches Next.js, Vercel, and web standards (URL-safe, no case sensitivity issues).

**Implements:** EC-04 (Tool Template Standard — consistent naming).

### AD-02 — File Naming by Type

**Context.** File names must instantly convey what's inside without requiring the engineer to open the file.

**Decision.** File naming by type:

| File Type | Convention | Example |
|-----------|-----------|---------|
| React component (one per file) | `PascalCase.tsx` | `ToolCard.tsx`, `ImageUploader.tsx` |
| Utility/helper file | `kebab-case.ts` | `image-utils.ts`, `format-bytes.ts` |
| Hook file | `use-[name].ts` | `use-tool-history.ts`, `use-current-user.ts` |
| Type definitions | `[name].types.ts` | `tool.types.ts`, `user.types.ts` |
| Zod schema | `[name]-schema.ts` | `user-schema.ts`, `tool-manifest-schema.ts` |
| Test file | `[subject].test.ts` or `[subject].test.tsx` | `image-utils.test.ts`, `ToolCard.test.tsx` |
| E2E test | `[scenario].spec.ts` | `tool-workflow.spec.ts`, `auth-flow.spec.ts` |
| Config file | `[name].config.ts` | `tailwind.config.ts`, `drizzle.config.ts` |
| Manifest | `manifest.ts` | `manifest.ts` (inside tool folder) |
| Index/barrel | `index.ts` or `index.tsx` | always `index` |
| Documentation | `kebab-case.md` | `coding-standards.md` (this file uses numeric prefix per `/docs` convention) |

**Implements:** EC-02 (One Source of Truth — file type inferable from name).

### AD-03 — Folder Naming

**Context.** Folder names appear in import paths and URLs; they must be URL-safe and consistent.

**Decision.** Folder naming rules:
- All folders: `kebab-case`.
- Special prefix `_shared/` for category-internal shared code (sorts first alphabetically).
- Bounded context folders: match context name (`identity`, `content`, `platform-ops`).
- Layer folders: `presentation`, `application`, `domain`, `infrastructure`.
- Tool category folders: `image`, `pdf`, `developer`, `text`, `converters`, `seo`, `calculators`.
- Tool slug folders: `kebab-case`, URL-safe, unique within category.

**Implements:** LOCK-04 (Modular — consistent folder structure).

### AD-04 — Variable and Function Naming

**Context.** Variable and function names are read hundreds of times more than they're written. Clarity beats brevity.

**Decision.** Rules:
- **Descriptive over abbreviated.** `userEmailAddress` not `usrEmail`. `getActiveSubscriptions` not `getActSubs`.
- **Verbs for functions.** `getUser`, `saveHistoryEntry`, `validateInput`, `processImage`. Common verbs: `get`, `fetch`, `save`, `update`, `delete`, `create`, `validate`, `process`, `transform`, `format`, `parse`, `serialize`.
- **Nouns for variables.** `user`, `historyEntry`, `toolManifest`, `inputData`.
- **Boolean variables prefixed with `is`, `has`, `can`, `should`.** `isLoading`, `hasPermission`, `canEdit`, `shouldDisplay`.
- **Constants in `SCREAMING_SNAKE_CASE`** for true constants; `camelCase` for configurable values.
- **Avoid single letters** except for loop counters (`i`, `j`, `k`) or mathematical operations (`x`, `y`, `z`).
- **No Hungarian notation.** Don't prefix with type (`strName`, `intCount`). TypeScript types convey this.

**Implements:** EC-02, readability.

### AD-05 — Type and Interface Naming

**Context.** Type names appear in declarations, generic constraints, and error messages. They must be distinctive and meaningful.

**Decision.** Rules:
- **PascalCase** for all types, interfaces, enums, unions.
- **Nouns for types.** `User`, `HistoryEntry`, `ToolManifest`, `ProcessingResult`.
- **No `I` prefix for interfaces.** `User` not `IUser` (TypeScript convention; interfaces and types interchangeable).
- **No `Type` suffix** unless disambiguating from a value with the same name. `User` not `UserType`; but `UserType` if there's also a `User` class.
- **Props suffix for React prop types.** `ToolCardProps`, `ButtonProps`.
- **State suffix for state types.** `ToolExecutionState`, `AuthState`.
- **Schema suffix for Zod schemas.** `userSchema`, `toolManifestSchema`.
- **Input/Output suffix for stage types.** `ImageResizeInput`, `ImageResizeOutput`.
- **Event suffix for domain events.** `UserRegisteredEvent`, `ToolExecutionCompletedEvent`.

**Implements:** EC-02 (consistent naming across types).

### AD-06 — React Component Naming

**Context.** Components are the building blocks of UI. Their names must convey purpose and hierarchy.

**Decision.** Rules:
- **PascalCase** for component names.
- **Nouns for components.** `ToolCard`, `ImageUploader`, `DownloadButton`, `HistoryList`.
- **Descriptive names.** `ToolCard` not `Card` (too generic); `PrimaryButton` not `Button` (already taken by design system).
- **Avoid abbreviations.** `Navigation` not `Nav` (except in well-established cases like `URL`).
- **Suffix indicates type.**
  - `...Card` — card-like container.
  - `...List` — renders a list.
  - `...Item` — single item in a list.
  - `...Button` — interactive button.
  - `...Form` — form container.
  - `...Field` — single form field.
  - `...Modal` / `...Dialog` — modal dialog.
  - `...Provider` — context provider.
  - `...Layout` — layout wrapper.
  - `...Page` — top-level page component.
- **Higher-order components prefixed with `with`.** `withAuth`, `withFeatureFlag`.
- **Compound components use dot notation.** `Card.Header`, `Card.Body`, `Card.Footer`.

**Implements:** EC-10 (Design System Governance — components identifiable by name).

### AD-07 — Hook Naming

**Context.** Custom hooks must be instantly distinguishable from regular functions.

**Decision.** Rules:
- **`use` prefix** for all hooks. `useToolHistory`, `useCurrentUser`, `useTheme`.
- **camelCase** after `use` prefix.
- **Descriptive name describing what's returned or done.** `useToolHistory` (returns history), `useSaveHistoryEntry` (performs save), `useIsMobile` (returns boolean).
- **Boolean-returning hooks prefixed with `useIs` or `useHas`.** `useIsAuthenticated`, `useHasPermission`.
- **Hook files named `use-[name].ts`.** `use-tool-history.ts` exports `useToolHistory`.

**Implements:** React convention, readability.

### AD-08 — Props Naming

**Context.** Props are the API of a component. Consistent prop naming makes components composable.

**Decision.** Rules:
- **camelCase** for all props.
- **Event handler props prefixed with `on`.** `onComplete`, `onError`, `onToolSelect`.
- **Boolean props prefixed with `is`, `has`, `can`, `should`.** `isLoading`, `hasError`, `canEdit`, `shouldAutoSave`.
- **Callback props are functions, not objects.** `onComplete: () => void` not `callbacks: { onComplete: () => void }`.
- **Children prop is always `children`.** Don't rename to `content` or `body`.
- **Default props via destructuring.** `function Button({ size = 'md', variant = 'primary' }: ButtonProps)`.
- **Prop type interface suffixed with `Props`.** `ButtonProps`, `ToolCardProps`.

**Implements:** React convention, EC-10.

### AD-09 — Database Naming

**Context.** Database table and column names appear in queries, migrations, and documentation. They must be consistent and unambiguous.

**Decision.** Rules (Postgres conventions):
- **Table names: `snake_case`, plural.** `users`, `history_entries`, `tool_manifests` (if persisted), `audit_entries`.
- **Column names: `snake_case`.** `created_at`, `user_id`, `tool_slug`, `is_active`.
- **Primary key: `id`.** Always `id`, never `user_id` as PK (use `user_id` as FK).
- **Foreign keys: `[table_singular]_id`.** `user_id` references `users.id`, `tool_slug` references `tools.slug` (if tools were a table — they're not, but the pattern holds).
- **Timestamps: `created_at`, `updated_at`, `deleted_at`.** Always these exact names.
- **Boolean columns: `is_` or `has_` prefix.** `is_active`, `has_premium`.
- **JSON columns: descriptive noun.** `metadata`, `preferences`, `seo_config`.
- **Indexes: `idx_[table]_[columns]`.** `idx_users_email`, `idx_history_entries_user_id`.
- **Unique constraints: `uq_[table]_[columns]`.** `uq_users_email`.
- **Foreign key constraints: `fk_[from_table]_[to_table]`.** `fk_history_entries_users`.
- **Check constraints: `ck_[table]_[description]`.** `ck_users_email_format`.

**Schema names** (per bounded context): `identity`, `content`, `platform_ops`, `billing`, `analytics`. Tools Context has no schema (stateless per LOCK-06).

**Implements:** Postgres ecosystem conventions, EC-02.

### AD-10 — API Endpoint Naming

**Context.** API URLs are part of the public contract. Once published, they're hard to change.

**Decision.** Rules (RESTful conventions):
- **URLs: `kebab-case`, plural nouns for collections.** `/api/tools`, `/api/users`, `/api/history-entries`.
- **Single resource: `/api/[collection]/[id]`.** `/api/users/123`, `/api/history-entries/abc`.
- **Nested resources: `/api/[parent]/[id]/[child]`.** `/api/users/123/history-entries`.
- **Actions on resources: `/api/[collection]/[id]/[action]`.** `/api/users/123/deactivate`, `/api/tools/image-resize/execute`.
- **HTTP methods convey intent.** GET = read, POST = create, PATCH = update, DELETE = delete.
- **Query parameters: `kebab-case`.** `?page-size=20`, `?sort-by=created_at`.
- **Versioning: `/api/v1/...`.** Always versioned from day 1.

**Implements:** REST ecosystem conventions.

### AD-11 — Tool Slug Naming

**Context.** Tool slugs are URL identifiers and must be unique, stable, and SEO-friendly.

**Decision.** Rules:
- **`kebab-case`, URL-safe.** `image-resize`, `pdf-merge`, `json-formatter`.
- **Lowercase only.** No uppercase.
- **No special characters** except hyphens. No underscores, no dots, no slashes.
- **No reserved words.** Not `admin`, `api`, `auth`, `dashboard`, `settings`, `tools` (these are route prefixes).
- **Descriptive over abbreviated.** `image-resize` not `img-rsz`.
- **Action-oriented for transformation tools.** `image-resize`, `pdf-compress`, `json-format`.
- **Noun-oriented for generator tools.** `uuid-generator`, `password-generator`, `qr-generator`.
- **Unique within category.** Two tools in different categories can have similar slugs but not identical (e.g., `text-convert-case` and `image-convert-format`).
- **Globally unique recommended** to avoid confusion. `image-resize` not just `resize`.

**Implements:** LOCK-05 (Plugin-Ready — slugs are stable identifiers), LOCK-08 (SEO — URLs are SEO-relevant).

### AD-12 — Environment Variable Naming

**Context.** Environment variables are the configuration interface. Their names must be self-documenting.

**Decision.** Rules:
- **`SCREAMING_SNAKE_CASE`.**
- **`NEXT_PUBLIC_` prefix for client-accessible vars.** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **No prefix for server-only vars.** `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`.
- **Service name as prefix.** `SUPABASE_*`, `STRIPE_*`, `RESEND_*`, `SENTRY_*`.
- **Descriptive suffix.** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Boolean vars end with `_ENABLED` or are `true`/`false` strings.** `FEATURE_AI_TOOLS_ENABLED`.
- **Default values documented in `.env.example`.**

**Implements:** Next.js conventions, EC-08 (Security — clear distinction between public and secret vars).

### AD-13 — Constant Naming

**Context.** Constants are values that don't change. Their naming must distinguish them from variables.

**Decision.** Rules:
- **True constants: `SCREAMING_SNAKE_CASE`.** `MAX_FILE_SIZE_BYTES`, `DEFAULT_PAGE_SIZE`, `SUPPORTED_IMAGE_FORMATS`.
- **Configurable constants (could change per environment): `camelCase`.** `defaultPageSize`, `maxFileSizeBytes`. These read from env vars with defaults.
- **Constants grouped in `*.ts` files.** `src/shared/config/limits.ts`, `src/shared/config/timeouts.ts`.
- **No magic numbers in code.** Extract as named constant.

**Implements:** EC-02 (One Source of Truth), AD-12 in `08_CodingStandards`.

### AD-14 — Domain Event Naming

**Context.** Domain events are published across bounded contexts. Their names must be unambiguous and self-documenting.

**Decision.** Rules:
- **Past tense.** `UserRegistered`, `ToolExecutionCompleted`, `SubscriptionCancelled`. Events represent things that have happened.
- **PascalCase.**
- **`Event` suffix** to distinguish from other types. `UserRegisteredEvent`.
- **Subject + verb.** `UserRegistered` (user is subject, registered is verb), `ToolExecutionCompleted` (tool execution is subject, completed is verb).
- **File name: `[event-name].ts` in `domain/events/`.** `user-registered.ts`, `tool-execution-completed.ts`.
- **Event type string: `[context].[event-name]`.** `identity.user-registered`, `tools.tool-execution-completed`. Used for routing.

**Implements:** `03_DDD` AD-05 (Context Integration via Domain Events).

### AD-15 — CSS Class and Token Naming

**Context.** Tailwind classes and CSS custom properties must follow consistent naming.

**Decision.** Rules:
- **Tailwind classes: as-defined by Tailwind.** `bg-background`, `text-foreground`, `p-4`, `mt-8`, `rounded-lg`.
- **Custom CSS classes: `kebab-case`.** `.tool-card`, `.history-list`.
- **CSS custom properties (design tokens): `--kebab-case`.** `--color-background`, `--color-foreground`, `--spacing-unit`.
- **Token categories:** `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--breakpoint-*`.
- **No `BEM` or other methodologies.** Tailwind utilities are sufficient; custom classes only for complex compositions.

**Implements:** EC-10 (Design System Governance), LOCK-10.

## 4. Design Principles

### P1 — Names Communicate Intent
A reader should understand what an identifier does without reading its implementation. If they have to read the implementation, the name is wrong.

### P2 — Consistency Over Creativity
Use the same word for the same concept everywhere. Don't alternate `get`/`fetch`/`retrieve` for the same action. Pick one and stick to it.

### P3 — Ecosystem Conventions First
Follow TypeScript, React, Next.js, Postgres, and REST conventions. Deviating from ecosystem norms creates friction for new contributors.

### P4 — Searchability
Names should be greppable. `getUserHistory` is greppable; `gh` is not. If you can't grep for it, it doesn't exist.

### P5 — Stability
Once named, identifiers are hard to rename (especially public APIs, URLs, DB columns). Name things well the first time.

### P6 — No Ambiguity
Don't use names that could mean multiple things. `data` is ambiguous; `userInputData` is clear. `process` is ambiguous; `processImage` is clear.

## 5. Naming Reference Tables (Quick Lookup)

### 5.1 Casing Reference

| Convention | Used For |
|-----------|----------|
| `PascalCase` | Components, types, interfaces, enums, Zod schemas, domain events |
| `camelCase` | Variables, functions, parameters, props, hooks (with `use` prefix) |
| `kebab-case` | Files (non-component), folders, URLs, CSS classes, env vars |
| `SCREAMING_SNAKE_CASE` | Constants, environment variables |
| `snake_case` | Database tables, columns, indexes, constraints |

### 5.2 Common Verb Reference

| Verb | Use For |
|------|---------|
| `get` | Synchronous read from local source |
| `fetch` | Asynchronous read from remote source |
| `save` | Persist (create or update) |
| `create` | New entity creation |
| `update` | Modify existing entity |
| `delete` | Remove entity (hard delete) |
| `remove` | Remove from collection (soft delete or unlink) |
| `validate` | Check validity, return boolean or throw |
| `parse` | Convert string to structured data |
| `serialize` | Convert structured data to string |
| `format` | Convert data to display string |
| `transform` | Convert data from one shape to another |
| `process` | Run a multi-step operation (Tool Engine stage) |
| `generate` | Create new content (e.g., `generateUUID`) |
| `compute` | Calculate derived value |

### 5.3 Common Suffix Reference

| Suffix | Used For |
|--------|----------|
| `...Props` | React component prop types |
| `...State` | State types |
| `...Schema` | Zod schemas |
| `...Input` | Tool stage input types |
| `...Output` | Tool stage output types |
| `...Event` | Domain event types |
| `...Error` | Error types |
| `...Config` | Configuration types |
| `...Result` | Operation result types |
| `...Card`, `...List`, `...Item`, `...Button`, `...Form`, `...Field`, `...Modal`, `...Provider`, `...Layout`, `...Page` | Component type indicators |

### 5.4 Common Prefix Reference

| Prefix | Used For |
|--------|----------|
| `use` | Custom hooks (`useToolHistory`) |
| `is`, `has`, `can`, `should` | Boolean variables and props (`isLoading`, `hasPermission`) |
| `on` | Event handler props (`onComplete`, `onError`) |
| `with` | Higher-order components (`withAuth`) |
| `get`, `fetch`, `save`, `create`, `update`, `delete`, `remove`, `validate`, `parse`, `serialize`, `format`, `transform`, `process`, `generate`, `compute` | Function verb prefixes |

## 6. Standards

### 6.1 Identifier Length Standards
- Variables/functions: 1-4 words. `getUser`, `saveHistoryEntry`, `validateToolManifest`.
- Components: 1-3 words. `ToolCard`, `ImageUploader`, `Button`.
- Types: 1-3 words. `User`, `HistoryEntry`, `ToolManifest`.
- Files: 1-4 words kebab-case. `image-utils.ts`, `use-tool-history.ts`.
- Avoid single letters except loop counters.

### 6.2 Acronym Standards
- Acronyms in PascalCase: capitalize first letter only. `Url`, not `URL`. `Json`, not `JSON`. `Pdf`, not `PDF`.
- Exception: well-established all-caps acronyms in code (e.g., `API` in URLs, `UUID` in tool names) may remain all-caps.
- Acronyms at start of camelCase: lowercase. `urlValidator`, not `URLValidator`.

### 6.3 Boolean Naming Standards
- Prefix with `is`, `has`, `can`, `should`.
- `isLoading`, not `loading`.
- `hasPermission`, not `permission`.
- `canEdit`, not `editable` (the latter is ambiguous: is it "can be edited" or "is edited"?).
- Avoid negations. `isActive`, not `isNotInactive`.

### 6.4 Function Naming Standards
- Verb prefix (see §5.2).
- Returns void: verb describing action. `saveUser`, `logEvent`.
- Returns value: noun describing result, prefixed with `get` or `fetch`. `getUser`, `fetchHistoryEntries`.
- Async functions: same naming; `async` keyword conveys async nature.

### 6.5 Constants Standards
- `SCREAMING_SNAKE_CASE`.
- Grouped by domain in config files.
- Documented with JSDoc comment explaining the value and rationale.

### 6.6 Reserved Names
The following names are reserved and must not be used as identifiers:
- `admin`, `api`, `auth`, `dashboard`, `settings`, `tools`, `users` — reserved for routes.
- `data` — too ambiguous; use specific name.
- `item`, `value`, `temp`, `foo`, `bar` — except in tests.
- `any`, `unknown`, `never`, `void` — reserved TypeScript keywords.

## 7. Best Practices

### 7.1 When Naming a Variable
1. Use a noun.
2. Be specific: `userEmailAddress` not `data`.
3. Avoid abbreviations unless widely accepted (`URL`, `ID`).
4. Use camelCase.
5. Boolean variables prefixed with `is`/`has`/`can`/`should`.

### 7.2 When Naming a Function
1. Start with a verb (see §5.2).
2. Describe what the function does, not how.
3. Avoid `and` in names — split into two functions. `saveAndNotify` → `save()` + `notify()`.
4. Use camelCase.
5. Async functions don't need `Async` suffix; `async` keyword suffices.

### 7.3 When Naming a Component
1. PascalCase.
2. Noun describing what it represents.
3. Suffix indicating type (Card, List, Button, etc.) when helpful.
4. Don't prefix with project name (`ProjectToolCard`) — context implies it.

### 7.4 When Naming a Type
1. PascalCase.
2. Noun.
3. No `I` prefix, no `Type` suffix (unless disambiguating).
4. Suffix with `Props`, `State`, `Schema`, `Input`, `Output`, `Event`, `Error`, `Config`, `Result` where appropriate.

### 7.5 When Naming a File
1. Match the file type convention (AD-02).
2. Use kebab-case (except components, which use PascalCase).
3. Name reflects primary export.
4. Avoid generic names like `utils.ts`, `helpers.ts`, `misc.ts`. Be specific: `image-utils.ts`, `format-bytes.ts`.

### 7.6 When Naming a Database Table
1. Plural snake_case.
2. Descriptive noun.
3. Schema name as prefix when querying cross-schema.

### 7.7 When Naming a Tool
1. Tool slug: kebab-case, URL-safe, unique within category.
2. Action-oriented for transformation tools (`image-resize`).
3. Noun-oriented for generator tools (`uuid-generator`).
4. Globally unique recommended.

### 7.8 When Naming an Environment Variable
1. SCREAMING_SNAKE_CASE.
2. `NEXT_PUBLIC_` prefix for client-side.
3. Service prefix (`SUPABASE_*`, `STRIPE_*`).
4. Descriptive suffix.

## 8. Future Scalability

### 8.1 Scaling to New Identifier Types
- New identifier types (e.g., experiment names, feature flag keys) follow the conventions in this document.
- Add new identifier types to §5 reference tables when introduced.

### 8.2 Scaling to Multiple Languages
- If mobile app (React Native) is added (Phase 3+), naming conventions remain consistent (TypeScript everywhere).
- API naming (RESTful) remains stable.

### 8.3 Scaling to Plugin Marketplace (Phase 4)
- Plugin namespaces: `@publisher/plugin-name`.
- Plugin tool slugs: `[publisher].[tool-slug]` to avoid collisions.
- Plugin naming follows the same conventions as first-party tools.

### 8.4 Internationalization
- Tool slugs remain in English (URL standard).
- Tool titles, descriptions, FAQ support multiple languages via manifest's `seo` field per `11_FBRD`.

## 9. Dependencies

### 9.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4 — LOCKs and ECs these conventions implement.
- Depends on `02_SAD` — Tool Engine contract names referenced here.
- Depends on `03_DDD` — Domain event naming follows DDD conventions.
- Depends on `04_TechStack` — TypeScript, React, Postgres ecosystem conventions.
- Depends on `05_ProjectStructure`, `07_FolderStructure` — folder names referenced here.
- `06_ArchitectureDecisionRecords` — records AD-01 through AD-15.
- `08_CodingStandards` — coding rules within files (this document defines names).
- `10_DesignSystem` — design token names.
- `11_FBRD` — ToolManifest field names.
- `14_DatabaseDesign` — database table/column naming.
- `15_APIConvention` — API endpoint naming.
- `16_SEOSpecification` — URL naming for SEO.

### 9.2 External Dependencies
- TypeScript, React, Next.js, Postgres ecosystem conventions.

### 9.3 Assumptions
- Naming conventions remain stable; changes require ADR.
- Team accepts the discipline of consistent naming.

## 10. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Naming Convention. Defined casing conventions, file/folder naming, variable/function/type/component/hook/props naming, database naming, API endpoint naming, tool slug naming, env var naming, constant naming, domain event naming, CSS class naming. |

## 11. Cross References

- `00_Project_Charter` §3, §4 — LOCKs and ECs implemented.
- `02_SAD` AD-02 — Tool Engine stage names follow conventions here.
- `03_DDD` §6 — Ubiquitous language glossary terms follow these conventions.
- `04_TechStack` — Ecosystem conventions (TypeScript, React, Postgres).
- `05_ProjectStructure` — Folder names referenced here.
- `06_ArchitectureDecisionRecords` — AD-01 through AD-15 record naming decisions.
- `07_FolderStructure` — File naming conventions (this document details the names).
- `08_CodingStandards` — Code style rules (this document defines identifiers).
- `10_DesignSystem` — Design token names.
- `11_FBRD` — ToolManifest field names.
- `14_DatabaseDesign` — Database naming in practice.
- `15_APIConvention` — API endpoint naming in practice.
- `16_SEOSpecification` — URL naming for SEO.
- `19_AdminSpecification` — Admin route naming.
- `23_AI_Guideline` — AI must follow naming conventions (LOCK-09, EC-11).
