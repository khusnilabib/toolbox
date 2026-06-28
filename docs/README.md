# [PROJECT_NAME] — Documentation Repository

> **The single source of truth for the entire [PROJECT_NAME] ecosystem.**
> Documentation first. Code second. Always.
>
> **[PROJECT_NAME] is a browser-first productivity ecosystem that enables users to solve everyday digital tasks without installing software and without requiring an account.**

---

## Governance Layers (Priority Order)

The project is governed by **three layers**, each with distinct authority. When conflicts arise, higher layers override lower layers.

| Priority | Layer | Document | What It Defines |
|----------|-------|----------|-----------------|
| 1 (highest) | **Architectural Locks** | `00_Project_Charter` §3 | What the platform IS (identity, philosophy, permanent rules). 12 locks. |
| 2 | **Engineering Constitution** | `00_Project_Charter` §4 | HOW engineering is DONE (process discipline, quality gates). 12 articles. |
| 3 | **Technical Documents** | `02`–`26` | How the locks and constitution are implemented in code. |

Amending Layer 1 or 2 requires a charter revision. Layer 3 documents are amended through normal PR review.

---

## Architectural Locks (Permanent Rules)

Twelve decisions are **locked** as permanent project rules. They define the platform's permanent identity and constraints. See `00_Project_Charter` §3 for the full binding text.

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

Twelve articles define mandatory engineering discipline. They supersede implementation preferences. See `00_Project_Charter` §4 for the full binding text.

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

---

## How to Use This Repository

1. **New developers**: Start with `00_Project_Charter` (especially §3 Architectural Locks and §4 Engineering Constitution), then read `04_TechStack`, `05_ProjectStructure`, and `06_ArchitectureDecisionRecords`. You should be able to run the project locally within 2 hours.
2. **Product / business stakeholders**: Start with `00_Project_Charter` → `01_BRD` → `25_Roadmap`.
3. **Architects / tech leads**: Read all documents in order. Pay special attention to `02_SAD`, `03_DDD`, `14_DatabaseDesign`, `15_APIConvention`, and `06_ArchitectureDecisionRecords`.
4. **Before making any architectural decision**: Search `06_ArchitectureDecisionRecords` for prior decisions. If your decision contradicts an existing ADR, LOCK, or EC, you must either amend the governing document (with justification) or follow the existing rule.

## Document Index

### Foundation
| # | Document | Purpose |
|---|----------|---------|
| 00 | [Project Charter](./00_Project_Charter.md) | Mission, scope, **12 Architectural Locks** (§3), **12 Engineering Constitution articles** (§4). |
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

### Feature & UI Specifications
| # | Document | Purpose |
|---|----------|---------|
| 11 | [Feature-Based Requirements (FBRD)](./11_FBRD.md) | Per-feature requirement template and registry. |
| 12 | [Architecture Component (ACD)](./12_ACD.md) | Reusable components, modules, and their contracts. |
| 13 | [UI/UX Design Specification (UDS)](./13_UDS.md) | User flows, interaction patterns, accessibility. |

### Data, API, SEO, Auth
| # | Document | Purpose |
|---|----------|---------|
| 14 | [Database Design](./14_DatabaseDesign.md) | Schema, indexes, migrations, multi-tenancy. |
| 15 | [API Convention](./15_APIConvention.md) | REST/RPC conventions, versioning, error format. |
| 16 | [SEO Specification](./16_SEOSpecification.md) | Per-tool SEO: metadata, structured data, sitemaps. |
| 17 | [User Flow](./17_UserFlow.md) | Guest → registered → premium journeys. |
| 18 | [RBAC](./18_RBAC.md) | Roles, permissions, enforcement points. |

### Admin & Process
| # | Document | Purpose |
|---|----------|---------|
| 19 | [Admin Specification](./19_AdminSpecification.md) | `/admin` modules, screens, workflows. |
| 20 | [Development Guideline](./20_DevelopmentGuideline.md) | Branching, PRs, CI, code review, definition of done. |
| 21 | [Testing Strategy](./21_TestingStrategy.md) | Unit / integration / E2E / visual / load testing. |

### Ops & AI
| # | Document | Purpose |
|---|----------|---------|
| 22 | [Deployment Guide](./22_DeploymentGuide.md) | Environments, env vars, rollback, observability. |
| 23 | [AI Guideline](./23_AI_Guideline.md) | Where AI is used, model choices, prompt management. |
| 24 | [ZAI Context](./24_ZAI_Context.md) | AI-assistant context, memory, agent conventions. |

### Planning
| # | Document | Purpose |
|---|----------|---------|
| 25 | [Roadmap](./25_Roadmap.md) | Phase 1 → Phase 4 milestones and success criteria. |
| 26 | [Backlog](./26_Backlog.md) | Prioritized list of tools and features per phase. |

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
4. **Charter precedence.** If any document (other than a lock or EC) conflicts with `00_Project_Charter`, the charter wins.
5. **ADR append-only.** Architectural decisions are recorded in `06_ArchitectureDecisionRecords` and never modified; supersessions are recorded as new ADRs that reference the superseded one.
6. **Revision history mandatory.** Every change must bump the revision and record what changed and why.
7. **Cross-references must be live.** Broken links are P1 bugs.
8. **No orphan decisions.** Any architectural decision must cite the doc, lock, or EC it follows or amends.

## Status Legend

- 🟢 **Approved** — Active, in force.
- 🟡 **Draft** — Under review, not yet authoritative.
- 🔴 **Deprecated** — Superseded; kept for history only.
- 🔒 **Locked** — Architectural Lock; cannot be changed without charter amendment.
- ⚙️ **Constitutional** — Engineering Constitution article; mandatory engineering rule.
