# [PROJECT_NAME] — Documentation Repository

> **The single source of truth for the entire [PROJECT_NAME] ecosystem.**
> Documentation first. Code second. Always.
>
> **[PROJECT_NAME] is a browser-first productivity ecosystem that enables users to solve everyday digital tasks without installing software and without requiring an account.**

---

## Governance Layers (Priority Order)

The project is governed by **five layers**, each with distinct authority. When conflicts arise, higher layers override lower layers.

| Priority | Layer | Document | What It Defines |
|----------|-------|----------|-----------------|
| 1 (highest) | **Architectural Locks** | `00_Project_Charter` §3 | What the platform IS (identity, philosophy, permanent rules). 12 locks. |
| 2 | **Engineering Constitution** | `00_Project_Charter` §4 | HOW engineering is DONE (process discipline, quality gates). 12 articles. |
| 3 | **Product Constitution** | `00_Project_Charter` §5 | HOW every tool BEHAVES as a product (one problem per tool, product contracts, quality gates). 10 articles. |
| 4 | **Data & Growth Architecture** | `00_Project_Charter` §6 | HOW the platform GROWS (analytics, SEO, search, content, feature flags, audit, API evolution, marketplace readiness). 10 articles. |
| 5 | **Technical Documents** | `06`–`31` | How the locks, constitutions, ECs, PCs, and DGAs are implemented in code. |

Amending Layers 1–4 requires a charter revision. Layer 5 documents are amended through normal PR review. **Data & growth decisions are architectural decisions** — the DGA has the same binding authority as the Architectural Locks, Engineering Constitution, and Product Constitution.

---

## Architectural Locks (Permanent Rules)

Twelve decisions are **locked** as permanent project rules. See `00_Project_Charter` §3.

| # | Lock | One-Line Summary |
|---|------|------------------|
| 1 | **Platform Identity** | Browser-first Productivity Ecosystem. Privacy, speed, simplicity, accessibility. |
| 2 | **Browser-First Philosophy** | Client-side processing by default; server-side only when unavoidable. |
| 3 | **Tool Engine Philosophy** | Standardized lifecycle: Input → Validation → Processing → Preview → Download → History → Share. |
| 4 | **Modular Architecture** | Every tool is Independent, Reusable, Replaceable, Maintainable, Discoverable. |
| 5 | **Plugin-Ready Architecture** | Manifest/registry-driven tool registration; auto-discovery; minimal coupling. |
| 6 | **Database Optional** | Core tools function without DB. DB serves only auth, history, content, admin, analytics. |
| 7 | **Guest-First UX** | No registration before value demonstrated. |
| 8 | **SEO Constitution** | First-class architectural concern; every tool page is a fully-optimized landing page. |
| 9 | **AI Development Constitution** | Consistency > speed. No duplication, no architectural drift, no unapproved dependencies. |
| 10 | **Design Philosophy** | Developer-first minimalism (Vercel-like). Monochrome, high contrast, spacious. |
| 11 | **Admin Philosophy** | Operational control center, not just a CMS. Enterprise-scale from day 1. |
| 12 | **Feature Lifecycle** | Concept → Planned → Design → Development → Testing → Beta → Stable → Deprecated → Archived. |

## Engineering Constitution (Mandatory Engineering Rules)

Twelve articles. See `00_Project_Charter` §4.

| # | Article | One-Line Summary |
|---|---------|------------------|
| EC-01 | **Documentation First** | No implementation without docs; every PR updates docs. |
| EC-02 | **One Source of Truth** | Every business rule exists in exactly one place; duplication is refactored. |
| EC-03 | **Component Reuse First** | Search → Extend → Create (only when justified). |
| EC-04 | **Tool Template Standard** | Every tool follows identical internal structure (manifest + stages + tests). |
| EC-05 | **Progressive Enhancement** | Platform degrades gracefully when JS/APIs/DB/auth partially fail. |
| EC-06 | **Accessibility First** | WCAG AA, keyboard nav, focus visibility, screen reader, reduced motion. |
| EC-07 | **Performance Budget** | Fast initial render, minimal JS, lazy loading, code splitting; regressions are bugs. |
| EC-08 | **Security by Default** | Validate input, sanitize output, least privilege, secure headers, dep review. |
| EC-09 | **Testing Philosophy** | Unit → Integration → E2E pyramid; engines designed for testability. |
| EC-10 | **Design System Governance** | No ad hoc UI; every visual element from Design System. |
| EC-11 | **AI Collaboration Rules** | AI preserves consistency, references docs, asks before assuming. |
| EC-12 | **Enterprise Readiness** | Free-tier now, but architecture must scale to enterprise without redesign. |

## Product Constitution (Mandatory Product Rules)

Ten articles. See `00_Project_Charter` §5 and `11_ProductConstitution`.

| # | Article | One-Line Summary |
|---|---------|------------------|
| PC-01 | **One Tool, One Problem** | Each tool solves exactly one clearly defined user problem. No feature creep. |
| PC-02 | **Product Contract** | Every tool defines purpose, inputs, outputs, validation, processing, success/failure/empty/loading states, SEO intent, related tools, analytics events. |
| PC-03 | **Tool Completion Standard** | A tool is complete only with all 13 items: input, validation, processing, preview, download, errors, success feedback, accessibility, mobile, SEO, analytics, docs, tests. |
| PC-04 | **Quality Gates** | Stable requires passing functional, accessibility, performance, SEO, security, documentation, UX reviews. |
| PC-05 | **UX Consistency** | Every tool page follows the same layout: Hero → Tool → Result → FAQ → Related → Docs → Feedback → Footer. |
| PC-06 | **Monetization Philosophy** | Revenue never interrupts task completion. Ads/premium only after value demonstrated. |
| PC-07 | **Analytics Standard** | Every tool emits consistent events (viewed, started, validation failed, processing started/completed, download attempted/completed, registration viewed/completed, shared). |
| PC-08 | **Error Experience** | Every error explains what happened, why, how to fix. Never expose stack traces. |
| PC-09 | **Feature Discoverability** | Every tool helps users discover more tools (related, workflows, categories, search, recent, popular). |
| PC-10 | **Product Scalability** | Every new tool requires minimal engineering effort. Manifest generates nav, SEO, sitemap, search, admin, analytics. |

## Data & Growth Architecture (Mandatory Growth Rules)

Ten articles define how the platform grows sustainably. See `00_Project_Charter` §6.

| # | Article | One-Line Summary |
|---|---------|------------------|
| DGA-01 | **Database as a Product Service** | DB is a product capability, not just persistence. Only long-term-value data is persisted; temp results stay browser-local. |
| DGA-02 | **Event-Driven Analytics** | Every important action produces a standardized analytics event. Vendor-neutral; providers are adapters; event schema is canonical. |
| DGA-03 | **SEO Metadata as Structured Data** | SEO originates from structured metadata (Tool Manifest). No hardcoded SEO values in pages. |
| DGA-04 | **Search Architecture** | Search supports instant, category, related, popular, recent, synonyms, fuzzy, tags. Indexes generated from Tool Manifest. |
| DGA-05 | **Content Architecture** | Documentation, Help, Blog, Tutorials, Tool Pages are separate content types. CMS integration never affects Tool Engine. |
| DGA-06 | **Feature Flags** | Every major feature deployable independently. Beta, A/B, regional, gradual, internal testing. First-class platform capability. |
| DGA-07 | **Auditability** | Every admin action is auditable (tool published/deprecated, SEO updated, role changed, settings modified). Audit logs are immutable. |
| DGA-08 | **API Evolution** | Public APIs are versioned. Deprecation follows documented policy. Backward compatibility preferred. Breaking changes require ADRs. |
| DGA-09 | **Growth Metrics** | Every tool contributes to ecosystem metrics (popularity, conversion, completion, registration, search success, return visits, avg processing time). Generated from standardized events. |
| DGA-10 | **Future Marketplace Readiness** | Architecture anticipates community tools, verified publishers, marketplace, ratings, reviews, collections. DB & manifest design avoid blocking these. |

---

## How to Use This Repository

1. **New developers**: Start with `00_Project_Charter` (§3 Locks, §4 ECs, §5 PCs, §6 DGAs), then read `04_TechStack`, `05_ProjectStructure`, `06_ArchitectureDecisionRecords`, `12_ToolManifestSpecification`. You should be able to run the project locally within 2 hours.
2. **Product / business stakeholders**: Start with `00_Project_Charter` → `01_BRD` → `11_ProductConstitution` → `30_Roadmap`.
3. **Tool authors**: Start with `11_ProductConstitution` → `12_ToolManifestSpecification` → `13_FBRD` → `07_FolderStructure` §Tool Folder Template.
4. **Architects / tech leads**: Read all documents in order. Pay special attention to `02_SAD`, `03_DDD`, `06_ArchitectureDecisionRecords`, `16_EventSchemaSpecification`, `17_AnalyticsArchitecture`, `18_SearchArchitecture`, `19_DatabaseDesign`, `20_APIConvention`.
5. **Before making any architectural, product, or growth decision**: Search `06_ArchitectureDecisionRecords` for prior decisions. If your decision contradicts an existing ADR, LOCK, EC, PC, or DGA, you must either amend the governing document (with justification) or follow the existing rule.

## Document Index

### Foundation
| # | Document | Purpose |
|---|----------|---------|
| 00 | [Project Charter](./00_Project_Charter.md) | Mission, scope, **12 Architectural Locks** (§3), **12 Engineering Constitution articles** (§4), **10 Product Constitution articles** (§5), **10 Data & Growth Architecture articles** (§6). |
| 01 | [Business Requirements (BRD)](./01_BRD.md) | Business goals, target market, KPIs, monetization. |

### Architecture Core (tightly coupled)
| # | Document | Purpose |
|---|----------|---------|
| 02 | [Software Architecture (SAD)](./02_SAD.md) | System layers, Tool Engine, deployment topology. |
| 03 | [Domain-Driven Design (DDD)](./03_DDD.md) | Bounded contexts, ubiquitous language, aggregates. |
| 04 | [Tech Stack](./04_TechStack.md) | Technology choices, rationale, upgrade paths. |
| 05 | [Project Structure](./05_ProjectStructure.md) | High-level layout, module boundaries, registry pattern. |
| 06 | [Architecture Decision Records (ADR)](./06_ArchitectureDecisionRecords.md) | Permanent history of all architectural decisions. Append-only. |

### Implementation Conventions
| # | Document | Purpose |
|---|----------|---------|
| 07 | [Folder Structure](./07_FolderStructure.md) | Granular file/folder conventions. |
| 08 | [Coding Standards](./08_CodingStandards.md) | TypeScript strict rules, code style, review checklist. |
| 09 | [Naming Convention](./09_NamingConvention.md) | Files, components, variables, APIs, DB tables. |
| 10 | [Design System](./10_DesignSystem.md) | Tokens, components, themes (light/dark). |

### Product Specifications (constitutional)
| # | Document | Purpose |
|---|----------|---------|
| 11 | [Product Constitution](./11_ProductConstitution.md) | Binding rules for how every tool behaves as a product (PC-01 through PC-10 expanded). |
| 12 | [Tool Manifest Specification](./12_ToolManifestSpecification.md) | Canonical schema every tool must implement. Foundation for Registry, Admin, Search, SEO, Analytics, future Marketplace. |

### Feature & UI Specifications
| # | Document | Purpose |
|---|----------|---------|
| 13 | [Feature-Based Requirements (FBRD)](./13_FBRD.md) | Per-feature requirement template and registry. |
| 14 | [Architecture Component (ACD)](./14_ACD.md) | Reusable components, modules, and their contracts. |
| 15 | [UI/UX Design Specification (UDS)](./15_UDS.md) | User flows, interaction patterns, accessibility. |

### Data & Growth Architecture
| # | Document | Purpose |
|---|----------|---------|
| 16 | [Event Schema Specification](./16_EventSchemaSpecification.md) | Canonical analytics event schema; vendor-neutral. Implements DGA-02, PC-07. |
| 17 | [Analytics Architecture](./17_AnalyticsArchitecture.md) | Analytics provider adapters, event pipeline, growth metrics. Implements DGA-02, DGA-09. |
| 18 | [Search Architecture](./18_SearchArchitecture.md) | Search index generation, instant/category/related/fuzzy search. Implements DGA-04. |

### Data, API, SEO, Auth
| # | Document | Purpose |
|---|----------|---------|
| 19 | [Database Design](./19_DatabaseDesign.md) | Schema per bounded context, RLS, migrations, multi-tenancy. Implements DGA-01, DGA-10. |
| 20 | [API Convention](./20_APIConvention.md) | REST conventions, versioning, error format, deprecation policy. Implements DGA-08. |
| 21 | [SEO Specification](./21_SEOSpecification.md) | Per-tool SEO from manifest; structured data, sitemaps. Implements DGA-03, LOCK-08. |
| 22 | [User Flow](./22_UserFlow.md) | Guest → registered → premium journeys. Implements LOCK-07, PC-06. |
| 23 | [RBAC](./23_RBAC.md) | Roles, permissions, enforcement points. Implements LOCK-11, EC-08, DGA-07. |

### Admin & Process
| # | Document | Purpose |
|---|----------|---------|
| 24 | [Admin Specification](./24_AdminSpecification.md) | `/admin` modules, screens, workflows. Implements LOCK-11, DGA-06, DGA-07. |
| 25 | [Development Guideline](./25_DevelopmentGuideline.md) | Branching, PRs, CI, code review, definition of done. |
| 26 | [Testing Strategy](./26_TestingStrategy.md) | Unit / integration / E2E / visual / load testing. |

### Ops & AI
| # | Document | Purpose |
|---|----------|---------|
| 27 | [Deployment Guide](./27_DeploymentGuide.md) | Environments, env vars, rollback, observability. |
| 28 | [AI Guideline](./28_AI_Guideline.md) | Where AI is used, model choices, prompt management. |
| 29 | [ZAI Context](./29_ZAI_Context.md) | AI-assistant context, memory, agent conventions. |

### Planning
| # | Document | Purpose |
|---|----------|---------|
| 30 | [Roadmap](./30_Roadmap.md) | Phase 1 → Phase 4 milestones and success criteria. |
| 31 | [Backlog](./31_Backlog.md) | Prioritized list of tools and features per phase. |

## Document Template

Every document in this repository MUST contain these sections:

```
1. Purpose
2. Scope
3. Goals
4. Standards
5. Examples
6. Best Practices
7. Future Expansion
8. Dependencies
9. Revision History
10. Cross References
```

Documents in the Architecture Core group (`02_SAD`, `03_DDD`, `04_TechStack`, `05_ProjectStructure`) follow an extended template that also includes **Architectural Decisions**, **Design Principles**, and **Future Scalability** sections.

## Governance Rules

1. **Documentation first.** No production code is written until the corresponding doc exists and is reviewed. (EC-01)
2. **Architectural Locks override everything.** The 12 locks in `00_Project_Charter` §3 have priority over every other document. Amending a lock requires a charter revision.
3. **Engineering Constitution is mandatory.** The 12 articles in `00_Project_Charter` §4 supersede implementation preferences. Violations block PR merge.
4. **Product Constitution is mandatory.** The 10 articles in `00_Project_Charter` §5 govern every tool's product behavior. Violations block tool promotion to Stable (PC-04).
5. **Data & Growth Architecture is mandatory.** The 10 articles in `00_Project_Charter` §6 govern analytics, SEO, search, content, feature flags, audit, API evolution, and marketplace readiness. Violations block growth-affecting features.
6. **Charter precedence.** If any document conflicts with `00_Project_Charter`, the charter wins.
7. **ADR append-only.** Architectural decisions are recorded in `06_ArchitectureDecisionRecords` and never modified; supersessions are recorded as new ADRs that reference the superseded one.
8. **Tool Manifest is canonical.** The schema in `12_ToolManifestSpecification` is the single source of truth for every tool. Registry, Admin, Search, SEO, Analytics all derive from it.
9. **Event schema is canonical.** The event schema in `16_EventSchemaSpecification` is the single source of truth for all analytics events. Providers are adapters (DGA-02).
10. **Revision history mandatory.** Every change must bump the revision and record what changed and why.
11. **Cross-references must be live.** Broken links are P1 bugs.
12. **No orphan decisions.** Any architectural, product, or growth decision must cite the doc, lock, EC, PC, or DGA it follows or amends.

## Status Legend

- 🟢 **Approved** — Active, in force.
- 🟡 **Draft** — Under review, not yet authoritative.
- 🔴 **Deprecated** — Superseded; kept for history only.
- 🔒 **Locked** — Architectural Lock; cannot be changed without charter amendment.
- ⚙️ **Constitutional** — Engineering Constitution article; mandatory engineering rule.
- 📋 **Product** — Product Constitution article; mandatory product rule.
- 📈 **Growth** — Data & Growth Architecture article; mandatory growth rule.
