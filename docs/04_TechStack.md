# 04 — Tech Stack

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-02 (Browser-First), LOCK-04 (Modular), LOCK-06 (Database Optional), LOCK-09 (AI Discipline)

---

## 1. Purpose

This Tech Stack document defines every technology choice in [PROJECT_NAME] and the rationale behind it. It operationalizes the Architectural Locks in `00_Project_Charter` §3 with concrete tools, libraries, and services. It also defines the **Dependency Policy** that governs future technology additions and the **Upgrade Path** for each choice as the platform scales from Phase 1 ($0 budget) to Phase 4 (revenue-funded).

This document is the authoritative reference for "what technology do we use and why." Engineers consulting this doc should never need to ask "why did we choose X over Y?" — the rationale is recorded here. New dependencies cannot be introduced without amending this document and getting Chief Architect approval (LOCK-09).

The stack is deliberately conservative. We favor mature, well-maintained, free-tier-friendly technologies over novelty. Every choice must satisfy three filters: (1) does it serve an Architectural Lock? (2) does it have a viable free tier through Phase 1? (3) does it have a credible upgrade path should we outgrow the free tier? Technologies failing any filter are rejected.

## 2. Scope

### 2.1 In Scope

- All programming languages, frameworks, libraries, and services used in the platform.
- Browser-side technologies enabling LOCK-02 (Canvas, Web Workers, WASM, etc.).
- Server-side technologies for Identity, Billing, Analytics, Platform Ops contexts.
- Build tooling, package management, testing frameworks.
- Free-tier analysis and upgrade triggers for each external service.
- Dependency policy: how new dependencies are proposed, evaluated, and adopted.

### 2.2 Out of Scope

- Specific code patterns and conventions → `07_CodingStandards`.
- Folder and file organization → `05_ProjectStructure`, `06_FolderStructure`.
- Deployment pipeline configuration → `21_DeploymentGuide`.
- Specific tool implementations (e.g., which image processing library a particular tool uses) → `10_FBRD` per-tool specs; this doc lists approved libraries.

## 3. Architectural Decisions

### AD-01 — Next.js 15+ App Router as the Unified Framework

**Context.** The platform needs SSR/SSG for SEO (LOCK-08), Edge runtime for performance, API routes for server-side tools, and a component model for the Tool Engine UI. Using separate frameworks (e.g., Vite for SPA + Express for API) fragments the codebase and complicates deployment.

**Decision.** Adopt Next.js 15+ with App Router as the single application framework. It provides:
- **Edge Runtime** for tool landing pages and middleware (LOCK-02 performance).
- **Node.js Runtime** for server-side tools and admin actions.
- **Server Components** for SEO-friendly initial render.
- **API Routes** for server-side tool endpoints.
- **File-based routing** that maps naturally to the tool registry (LOCK-05).

**Consequences.**
- ✅ One framework to learn; one deployment target.
- ✅ Edge + Node runtimes available without separate config.
- ✅ Built-in code splitting supports lazy tool loading (LOCK-04).
- ⚠️ Next.js version upgrades require care; major versions can break patterns.
- ⚠️ Some libraries are incompatible with Edge Runtime; documented per-tool.

**Implements:** LOCK-02 (Edge Runtime for browser-first page delivery), LOCK-05 (file-based routing aligns with registry).

### AD-02 — TypeScript Strict Mode End-to-End

**Context.** The platform will scale to 1,000+ tools, each with its own manifest and stages. Without strict typing, runtime type errors will scale linearly with tool count, becoming unmaintainable.

**Decision.** TypeScript 5+ with `strict: true` enabled. No `any` types allowed (ESLint-enforced). Every IO boundary (request, response, manifest, stage input/output) validated with Zod schemas that produce typed outputs.

**Consequences.**
- ✅ Type errors caught at compile time, not runtime.
- ✅ Tool manifests are statically verifiable before registry codegen.
- ✅ Refactoring across 1,000+ tools is feasible with type-checked find/replace.
- ⚠️ Slightly more verbose code; justified by maintainability.

**Implements:** Type safety end-to-end standard (`00_Project_Charter` §6.1).

### AD-03 — Supabase for Identity, Database, and Storage

**Context.** The platform needs Postgres (relational integrity for users, history, content), auth (OAuth + email), and file storage (server-side tool uploads, media assets). Three separate services would triple integration cost.

**Decision.** Adopt Supabase (free tier) as the unified backend for:
- **Postgres database** — all persistent data across bounded contexts (`03_DDD`).
- **Auth** — email/password, OAuth (Google, GitHub), JWT-based sessions.
- **Storage** — server-side tool file uploads (temporary bucket, 1h TTL), media assets for Content Context.

**Consequences.**
- ✅ One integration; one set of credentials; one dashboard.
- ✅ Row-Level Security (RLS) enforced at DB layer for defense-in-depth.
- ✅ Free tier covers Phase 1 (50k MAU, 500MB DB, 1GB storage).
- ⚠️ Vendor lock-in for auth; mitigated by Supabase's JWT standard (can migrate to Auth0/Clerk if needed).
- ⚠️ Free tier DB pauses after 1 week of inactivity; mitigated by scheduled pings.

**Implements:** LOCK-06 (database optional — Tools Context doesn't use Supabase, only Identity/Content/Platform Ops/Billing/Analytics do).

### AD-04 — Drizzle ORM for Type-Safe Database Access

**Context.** Raw SQL loses type safety. Heavy ORMs (Prisma, TypeORM) add runtime overhead and complex migration workflows. The platform needs type-safe DB access that works in Edge Runtime (limited Node APIs).

**Decision.** Adopt Drizzle ORM for all database access in the Infrastructure Layer. Drizzle provides:
- Type-safe schema definitions that match TypeScript types.
- SQL-like query builder (no magic; predictable SQL).
- Works in Edge Runtime (unlike Prisma's query engine).
- Migration files are plain SQL, reviewable in PRs.

**Consequences.**
- ✅ Type safety from schema to query to result.
- ✅ Edge Runtime compatible.
- ✅ Migrations are version-controlled SQL, not auto-generated black boxes.
- ⚠️ More verbose than Prisma; explicit query writing required.
- ⚠️ Smaller community than Prisma; mitigated by excellent docs.

**Implements:** LOCK-04 (modularity — Drizzle schemas defined per bounded context).

### AD-05 — shadcn/ui for UI Components

**Context.** Component libraries like MUI or Ant Design are heavy and opinionated. The platform needs a lightweight, accessible, customizable component system that aligns with the developer-first minimalism design (LOCK-10).

**Decision.** Adopt shadcn/ui — a collection of copy-into-your-codebase components built on Radix UI primitives and Tailwind CSS. Components are owned (not depended upon), enabling full customization.

**Consequences.**
- ✅ No version lock-in; components live in our codebase.
- ✅ Built on Radix UI (accessibility-first, WCAG compliant — supports `12_UDS`).
- ✅ Tailwind-based (aligns with `09_DesignSystem` token approach).
- ✅ Tree-shakeable — only used components are bundled.
- ⚠️ Updates require manual re-sync; mitigated by CLI tool.

**Implements:** LOCK-10 (developer-first minimalism — clean, accessible, customizable).

### AD-06 — Tailwind CSS for Styling

**Context.** CSS-in-JS adds runtime overhead. Plain CSS lacks utility-first productivity. The platform needs a styling system that supports design tokens (LOCK-10) without runtime cost.

**Decision.** Adopt Tailwind CSS 4+ for all styling. Design tokens (colors, spacing, typography) defined as CSS custom properties at the root, mapped to Tailwind theme extensions.

**Consequences.**
- ✅ Zero runtime CSS-in-JS overhead.
- ✅ Token-driven theming enables light/dark mode (LOCK-10).
- ✅ Utility-first approach keeps styles colocated with components.
- ⚠️ Class names can get long; mitigated by component extraction.

**Implements:** LOCK-10 (token-driven, dark/light ready).

### AD-07 — Zod for Runtime Validation

**Context.** TypeScript types exist only at compile time. Runtime data (user input, API responses, file metadata) needs validation. Without it, type mismatches cause runtime errors.

**Decision.** Adopt Zod for all runtime validation. Every IO boundary (tool input, API request, manifest fields, form submissions) is validated with a Zod schema. Zod schemas are the single source of truth; TypeScript types are inferred from them.

**Consequences.**
- ✅ Single source of truth — no drift between types and validators.
- ✅ Tool manifests are runtime-verifiable.
- ✅ Form validation integrates via react-hook-form's Zod resolver.
- ⚠️ Small runtime cost; negligible for validation-heavy use cases.

**Implements:** Type safety end-to-end standard.

### AD-08 — React Hook Form + Zod for Forms

**Context.** Tool configuration forms (e.g., image resize dimensions, PDF merge order) need performant, type-safe form management. Controlled React state is too slow for complex forms.

**Decision.** Adopt React Hook Form for all form state, integrated with Zod via `@hookform/resolvers/zod`. Uncontrolled by default; re-renders minimized.

**Consequences.**
- ✅ Performant forms with minimal re-renders.
- ✅ Type-safe form values via Zod schema inference.
- ✅ Works with shadcn/ui form components.

**Implements:** LOCK-03 (Tool Engine input stage uses forms for configuration).

### AD-09 — Zustand for Client State

**Context.** Some client state (theme, recent tools, in-progress tool state) doesn't belong in URL or server. Redux is overkill; React Context causes re-render storms.

**Decision.** Adopt Zustand for global client state. Stores are small, typed, and composable. Server state (history, favorites) handled separately by TanStack Query (Phase 2+).

**Consequences.**
- ✅ Minimal API; small bundle.
- ✅ No provider wrapper needed.
- ✅ Selectors prevent unnecessary re-renders.

**Implements:** LOCK-04 (state management is local to modules where possible).

### AD-10 — Vercel for Hosting and Edge Delivery

**Context.** The platform needs global CDN, Edge functions, serverless functions, and seamless Next.js integration. Separate providers for each would be operationally complex.

**Decision.** Adopt Vercel as the unified hosting platform. Free tier covers Phase 1 (100GB bandwidth, unlimited Edge requests, 100GB-hours serverless).

**Consequences.**
- ✅ Zero-config Next.js deployment.
- ✅ Edge Network included.
- ✅ Preview deployments per PR (improves review workflow).
- ⚠️ Vendor lock-in for hosting config; mitigated by Next.js being portable to Netlify/self-host if needed.

**Implements:** AD-06 in `02_SAD` (Edge-first deployment topology).

### AD-11 — pnpm as Package Manager

**Context.** npm and yarn have inefficiencies in monorepo and large dependency trees. The platform will have many shared packages and tool modules.

**Decision.** Adopt pnpm as the package manager. Uses a content-addressable store, saving disk space and install time. Strict about peer dependencies (prevents phantom deps).

**Consequences.**
- ✅ Faster installs, less disk usage.
- ✅ Strict peer dep enforcement prevents subtle bugs.
- ✅ First-class monorepo support via workspaces.
- ⚠️ Slightly different node_modules layout; rare compatibility issues.

**Implements:** LOCK-04 (modularity — pnpm workspaces enable clean package boundaries).

## 4. Design Principles

### P1 — Free-Tier-First
Every external service MUST have a viable free tier that covers Phase 1 (10k MAU, 30 tools). Paid services are introduced only when free tier is provably inadequate, documented in `01_BRD` §8.1.

### P2 — Minimal Dependencies
Every dependency is a future maintenance liability. Reject dependencies that can be replaced with <100 lines of code. Prefer standard Web APIs over libraries where possible.

### P3 — Type Safety End-to-End
TypeScript strict + Zod runtime validation at every IO boundary. No `any`. No untyped API responses.

### P4 — Edge-Compatible Where Possible
Code that runs in Edge Runtime (auth middleware, page rendering) MUST avoid Node-only APIs. This constraint is documented per-module.

### P5 — Browser-Native First
For browser-side tools (LOCK-02), prefer native Web APIs (Canvas, Web Crypto, File System Access) over libraries. Use libraries only when native APIs are insufficient (e.g., pdf-lib for PDF manipulation).

### P6 — Upgrade Path Documented
Every external service dependency MUST have a documented upgrade path. "We'll figure it out when we hit the limit" is not acceptable.

## 5. Technology Stack (Detailed)

### 5.1 Frontend

| Layer | Technology | Version | Purpose | Free Tier Adequate Through |
|-------|-----------|---------|---------|---------------------------|
| Framework | Next.js | 15+ | App Router, SSR/SSG, Edge Runtime | Indefinite (open source) |
| Language | TypeScript | 5+ | Type safety | Indefinite |
| Styling | Tailwind CSS | 4+ | Utility-first styling, token theming | Indefinite |
| Components | shadcn/ui | latest | Accessible component library | Indefinite (copy-in) |
| Forms | React Hook Form | 7+ | Performant form state | Indefinite |
| Validation | Zod | 3+ | Runtime schema validation | Indefinite |
| State | Zustand | 4+ | Client global state | Indefinite |
| Icons | lucide-react | latest | Icon set (consistent with shadcn/ui) | Indefinite |

### 5.2 Backend

| Layer | Technology | Version | Purpose | Free Tier Adequate Through |
|-------|-----------|---------|---------|---------------------------|
| Database | Supabase Postgres | latest | Persistent storage across contexts | ~50k MAU / 500MB |
| Auth | Supabase Auth | latest | Email + OAuth, JWT sessions | ~50k MAU |
| Storage | Supabase Storage | latest | Server-side tool uploads, media | 1GB |
| ORM | Drizzle ORM | latest | Type-safe DB access | Indefinite |
| Hosting | Vercel | latest | Edge + Serverless deployment | ~100GB bandwidth |
| Package Mgr | pnpm | 9+ | Dependency management | Indefinite |

### 5.3 Browser-Side Tool Libraries (LOCK-02)

These libraries enable browser-first processing. Each is evaluated for: bundle size, maintenance activity, and Edge/WASM compatibility.

| Library | Purpose | Bundle Size | Used By |
|---------|---------|-------------|---------|
| browser-image-compression | Image compression | ~30KB | Image Compress tool |
| canvas-image-resize | Image resize via Canvas | native (0KB) | Image Resize tool |
| pdf-lib | PDF merge/split/watermark | ~300KB | PDF tools |
| qrcode | QR code generation | ~50KB | QR Generator tool |
| tesseract.js | OCR (browser fallback) | ~2MB + WASM | OCR tool (small files) |
| crypto-js (or native Web Crypto) | Hashing | native (0KB) | Hash Generator tool |
| marked | Markdown rendering | ~30KB | Markdown Preview tool |
| json5 / native JSON | JSON parsing/formatting | native (0KB) | JSON Formatter tool |
| MediaPipe Face Detection | Face detection for passport photo | WASM, lazy-loaded | Passport Photo tool |

**Library selection criteria:**
1. Must work in browser without server.
2. Must be tree-shakeable (or lazy-loaded if large).
3. Must have TypeScript types.
4. Must be actively maintained (commit within last 6 months).
5. Must have permissive license (MIT, Apache, BSD).

### 5.4 Server-Side Libraries (Phase 1+)

| Library | Purpose | Used By |
|---------|---------|---------|
| stripe | Payment processing | Billing Context (Phase 2+) |
| resend | Transactional email | Identity Context (email verification, password reset) |
| posthog | Analytics (optional; alternative to custom) | Analytics Context (Phase 2+) |
| sharp | Server-side image processing | Server-side image tools (Phase 2+) |
| tesseract | Server-side OCR (native, faster than tesseract.js) | OCR tool (server-side fallback) |

### 5.5 Development Tooling

| Tool | Purpose |
|------|---------|
| ESLint | Linting, including custom rules for boundary enforcement (LOCK-04) |
| Prettier | Code formatting |
| Husky | Git hooks (pre-commit lint, pre-push test) |
| lint-staged | Run linters only on staged files |
| Vitest | Unit testing (fast, ESM-native) |
| Playwright | E2E testing |
| Testing Library | Component testing |
| Storybook | Component development (optional, Phase 2+) |
| GitHub Actions | CI/CD |
| Renovate | Dependency update automation |

### 5.6 Observability (Phase 1: Minimal)

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Vercel Analytics | Web Vitals + page views | Generous free tier |
| Vercel Logs | Serverless function logs | Free tier (limited retention) |
| Sentry | Error tracking | 5k errors/month free |
| Axiom (optional) | Structured log aggregation | 1GB/month free |

Phase 2+: OpenTelemetry for distributed tracing; Posthog or Plausible for product analytics.

## 6. Dependency Policy

### 6.1 Adding a New Dependency

Any new dependency (npm package or external service) requires:

1. **Justification written in PR description** answering:
   - What problem does this solve?
   - Why can't it be solved with existing deps or <100 lines of code?
   - What is the bundle size / cost impact?
   - What is the free-tier adequacy?
   - What is the upgrade path?

2. **Approval from Chief Architect.** LOCK-09 mandates no unapproved dependencies.

3. **Update to this document** (`04_TechStack` §5) recording the addition.

4. **Update to `04_TechStack` revision history** noting the addition.

### 6.2 Removing a Dependency

Removing a dependency is encouraged when:
- It's used by only one tool and can be inlined.
- It's unmaintained (no commits in 12+ months).
- A native Web API now covers its functionality.
- It's been replaced by a more capable existing dependency.

Removal PRs are fast-tracked; no Chief Architect approval needed.

### 6.3 Versioning Strategy

- **Patch updates** (e.g., 1.2.3 → 1.2.4): auto-merged by Renovate.
- **Minor updates** (e.g., 1.2.3 → 1.3.0): auto-merged if tests pass.
- **Major updates** (e.g., 1.2.3 → 2.0.0): manual review required; migration plan documented in PR.
- **Next.js major updates**: dedicated upgrade PR with full regression test.

### 6.4 Security Vulnerabilities

- `pnpm audit` runs in CI on every PR.
- Critical vulnerabilities block merge.
- High vulnerabilities must be addressed within 7 days.
- Medium/Low vulnerabilities tracked in backlog.

## 7. Free-Tier Analysis & Upgrade Triggers

| Service | Free Tier Limit | Trigger to Upgrade | Upgrade Cost | Phase |
|---------|----------------|-------------------|--------------|-------|
| Vercel Hobby | 100GB bandwidth/mo | Sustained >80GB for 2 months | $20/mo (Pro) | Phase 2 |
| Vercel Serverless | 100GB-hours/mo | Sustained >80GB-hrs for 2 months | included in Pro | Phase 2 |
| Supabase Free | 500MB DB, 50k MAU, 1GB storage | DB >400MB or MAU >40k | $25/mo (Pro) | Phase 2 |
| Sentry Free | 5k events/mo | >4k events/mo sustained | $26/mo (Team) | Phase 2 |
| GitHub Actions | 2000 min/mo private repos | >1800 min/mo sustained | $4/user/mo | Phase 3 |
| Stripe | No monthly fee; ~3% per transaction | N/A (pay-per-use) | per-transaction | Phase 2 |

### Monitoring Usage

- Vercel dashboard checked weekly during Phase 1.
- Supabase dashboard checked weekly; DB size especially.
- Sentry event volume checked monthly.
- Alerts configured at 80% of any free tier limit.

### Contingency: Hitting Free Tier Limits

If a free tier limit is hit before revenue justifies upgrade:
1. **Optimize first.** Identify waste (large images, unnecessary API calls, redundant queries).
2. **Cache more aggressively.** Move more to Edge cache, lengthen TTLs.
3. **If still over:** Chief Architect approves paid tier; cost tracked in `01_BRD` §8.1.

## 8. Browser-First Technology Choices (LOCK-02)

This section details the Web APIs and patterns that make browser-first processing possible. Tool authors consult this section when choosing how to implement a tool's Processing stage.

### 8.1 Image Processing

- **Canvas API** — resize, crop, format convert (PNG/JPEG/WebP). Native, zero bundle.
- **OffscreenCanvas** — image processing in Web Worker, doesn't block UI.
- **createImageBitmap** — fast image decoding from Blob/File.
- **browser-image-compression** — library for compression with quality control.

### 8.2 PDF Processing

- **pdf-lib** — pure JS PDF creation, modification, merge, split, watermark. ~300KB but lazy-loaded only on PDF tool routes.

### 8.3 Cryptography

- **Web Crypto API** — SHA-1, SHA-256, SHA-384, SHA-512, AES, HMAC. Native, zero bundle.
- **crypto-js** — fallback for algorithms not in Web Crypto (MD5, RIPEMD). Only if needed.

### 8.4 File System Access

- **File System Access API** — direct file read/write on supported browsers (Chrome, Edge). Falls back to download prompt on Safari/Firefox.
- **IndexedDB** — store tool history client-side; persists across sessions.
- **Blob URLs** — preview generated files without server round-trip.

### 8.5 Concurrency

- **Web Workers** — offload heavy processing (image manipulation, PDF rendering) from main thread.
- **OffscreenCanvas** — Canvas operations in Worker.
- **Comlink** — thin wrapper simplifying Worker message passing.

### 8.6 WASM (Phase 2+)

- **Tesseract.js** — OCR via WASM. Lazy-loaded only when OCR tool is used.
- **pdfium** — PDF rendering via WASM (alternative to pdf-lib for some operations).
- **FFmpeg.wasm** — video transcoding (Phase 3+).

## 9. Standards

### 9.1 TypeScript Configuration

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `exactOptionalPropertyTypes: true`
- `noFallthroughCasesInSwitch: true`
- Path aliases: `@/*` → `src/*`, `@tools/*` → `src/tools/*`, `@shared/*` → `src/shared/*`

### 9.2 ESLint Configuration

- `next/core-web-vitals` baseline.
- `eslint-plugin-drizzle` for DB query linting.
- Custom rule: `no-restricted-imports` enforces layer boundaries (LOCK-04).
- Custom rule: `no-any` rejects `any` type usage.
- Custom rule: `no-console` in production code (use structured logger).

### 9.3 Prettier Configuration

- Print width: 100
- Semi: true
- Single quote: true
- Trailing comma: all
- Tab width: 2

### 9.4 Package Version Pinning

- `package.json` uses caret ranges (`^1.2.3`) for non-major updates.
- `pnpm-lock.yaml` committed to repo for reproducible installs.
- Renovate keeps ranges up to date; humans review major bumps.

## 10. Best Practices

### 10.1 When Choosing a Library for a Tool
1. Check if a native Web API solves it (§8).
2. If not, search npm for maintained libraries with TypeScript types.
3. Evaluate bundle size; prefer <100KB. Lazy-load anything >200KB.
4. Verify license is permissive (MIT/Apache/BSD).
5. Add to §5.3 table in this document via PR.

### 10.2 When Hitting Edge Runtime Limitations
- Edge Runtime doesn't support: Node `fs`, `crypto` (use Web Crypto), `Buffer` (use Uint8Array), some `process` APIs.
- If a tool needs Node APIs, declare `execution: 'server'` (LOCK-02 decision matrix in `02_SAD` §AD-04).
- Never silently fall back to Node runtime; explicit declaration required.

### 10.3 When Upgrading Next.js
- Read the upgrade guide before starting.
- Create a dedicated branch; run full test suite.
- Manually test: every tool landing page, every tool workflow, admin panel, auth flows.
- Document any breaking changes in `19_DevelopmentGuideline`.

### 10.4 When a Library Becomes Unmaintained
- Add to "deprecated" list in this doc.
- Open issue in backlog to find replacement.
- If critical, prioritize replacement in next sprint.
- Never remove without a replacement ready.

## 11. Future Scalability

### 11.1 Scaling the Stack
- **Phase 2:** Add Stripe (billing), Resend (email), Posthog (analytics).
- **Phase 3:** Add OpenTelemetry, Axiom (logs), Cloudflare Workers (heavy compute offload).
- **Phase 4:** Add multi-region Supabase read replicas; consider dedicated DB for Analytics Context.

### 11.2 Replacing Components
The architecture allows swapping individual stack components without restructuring:
- **Supabase → Neon/PlanetScale:** Drizzle schemas portable; only connection config changes.
- **Vercel → self-host:** Next.js is portable; Dockerfile + Node server.
- **shadcn/ui → custom:** Components are owned; gradual replacement possible.

### 11.3 Adding WASM-Heavy Tools (Phase 3+)
- Video transcoding, 3D model processing, audio manipulation.
- WASM modules lazy-loaded; never bundled into main chunk.
- Each WASM tool documents its memory requirements and browser support.

### 11.4 Mobile App (Phase 3+)
- If pursued: React Native + Expo, sharing TypeScript types and Zod schemas with web.
- Reuses Identity Context (Supabase Auth) and Content Context API.
- Tool Engine lifecycle portable; UI rebuilt natively.

## 12. Dependencies

### 12.1 Document Dependencies
- Depends on `00_Project_Charter` §3 — LOCKs that mandate technology choices.
- Depends on `02_SAD` — architectural decisions (AD-01 through AD-06) that this stack implements.
- Depends on `03_DDD` — bounded contexts that own schemas (Drizzle schemas per context).
- `05_ProjectStructure` — folder layout that hosts these technologies.
- `07_CodingStandards` — coding rules enforced via ESLint configured here.
- `13_DatabaseDesign` — Drizzle schema definitions per context.
- `21_DeploymentGuide` — Vercel deployment configuration.

### 12.2 External Dependencies
- All technologies listed in §5.
- Free-tier relationships with Vercel, Supabase, Sentry, GitHub.

### 12.3 Assumptions
- Vercel and Supabase free tiers remain available and generous through Phase 1.
- Next.js 15+ remains actively maintained and backwards-compatible at minor version.
- TypeScript 5+ remains the standard for type-safe JS development.
- Web APIs (Canvas, Web Crypto, OffscreenCanvas) remain stable and broadly supported.

## 13. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Tech Stack. Defined Next.js 15+, TypeScript strict, Supabase, Drizzle, shadcn/ui, Tailwind, Zod, RHF, Zustand, Vercel, pnpm. Documented browser-first libraries, dependency policy, free-tier analysis. |

## 14. Cross References

- `00_Project_Charter` §3 — LOCKs implemented by this stack.
- `02_SAD` §3 — Architectural decisions this stack operationalizes.
- `03_DDD` §5 — Bounded contexts whose schemas use Drizzle.
- `05_ProjectStructure` — Folder layout for these technologies.
- `06_FolderStructure` — Granular file conventions.
- `07_CodingStandards` — Coding rules enforced via ESLint here.
- `09_DesignSystem` — Design tokens implemented via Tailwind.
- `10_FBRD` — Tool manifest schema validated via Zod.
- `11_ACD` — Reusable components built on shadcn/ui.
- `13_DatabaseDesign` — Drizzle schemas per context.
- `14_APIConvention` — API routes implemented via Next.js API handlers.
- `21_DeploymentGuide` — Vercel deployment configuration.
- `22_AI_Guideline` — Constrains AI's modification of this stack (LOCK-09).
