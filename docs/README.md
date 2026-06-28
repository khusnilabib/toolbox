# [PROJECT_NAME] — Documentation Repository

> **The single source of truth for the entire [PROJECT_NAME] ecosystem.**
> Documentation first. Code second. Always.
>
> **[PROJECT_NAME] is a browser-first productivity ecosystem that enables users to solve everyday digital tasks without installing software and without requiring an account.**

---

## Architectural Locks (Permanent Rules)

Twelve decisions are **locked** as permanent project rules. They have higher priority than any future document unless explicitly revised through a charter amendment. See `00_Project_Charter` §Architectural Locks for the full binding text.

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

---

## How to Use This Repository

1. **New developers**: Start with `00_Project_Charter` (especially §Architectural Locks), then read `04_TechStack` and `05_ProjectStructure`. You should be able to run the project locally within 2 hours.
2. **Product / business stakeholders**: Start with `00_Project_Charter` → `01_BRD` → `24_Roadmap`.
3. **Architects / tech leads**: Read all documents in order. Pay special attention to `02_SAD`, `03_DDD`, `13_DatabaseDesign`, and `14_APIConvention`.
4. **Before making any architectural decision**: Search this repository for prior decisions. If your decision contradicts an existing doc OR an Architectural Lock, you must either amend the doc/lock (with justification) or follow the existing rule.

## Document Index

### Foundation
| # | Document | Purpose |
|---|----------|---------|
| 00 | [Project Charter](./00_Project_Charter.md) | Mission, scope, **12 Architectural Locks**, principles. |
| 01 | [Business Requirements (BRD)](./01_BRD.md) | Business goals, target market, KPIs, monetization. |

### Architecture Core (tightly coupled)
| # | Document | Purpose |
|---|----------|---------|
| 02 | [Software Architecture (SAD)](./02_SAD.md) | System layers, Tool Engine, deployment topology. |
| 03 | [Domain-Driven Design (DDD)](./03_DDD.md) | Bounded contexts, ubiquitous language, aggregates. |
| 04 | [Tech Stack](./04_TechStack.md) | Technology choices, rationale, upgrade paths. |
| 05 | [Project Structure](./05_ProjectStructure.md) | High-level layout, module boundaries, registry pattern. |

### Implementation Conventions
| # | Document | Purpose |
|---|----------|---------|
| 06 | [Folder Structure](./06_FolderStructure.md) | Granular file/folder conventions. |
| 07 | [Coding Standards](./07_CodingStandards.md) | TypeScript strict rules, code style, review checklist. |
| 08 | [Naming Convention](./08_NamingConvention.md) | Files, components, variables, APIs, DB tables. |
| 09 | [Design System](./09_DesignSystem.md) | Tokens, components, themes (light/dark). |

### Feature & UI Specifications
| # | Document | Purpose |
|---|----------|---------|
| 10 | [Feature-Based Requirements (FBRD)](./10_FBRD.md) | Per-feature requirement template and registry. |
| 11 | [Architecture Component (ACD)](./11_ACD.md) | Reusable components, modules, and their contracts. |
| 12 | [UI/UX Design Specification (UDS)](./12_UDS.md) | User flows, interaction patterns, accessibility. |

### Data, API, SEO, Auth
| # | Document | Purpose |
|---|----------|---------|
| 13 | [Database Design](./13_DatabaseDesign.md) | Schema, indexes, migrations, multi-tenancy. |
| 14 | [API Convention](./14_APIConvention.md) | REST/RPC conventions, versioning, error format. |
| 15 | [SEO Specification](./15_SEOSpecification.md) | Per-tool SEO: metadata, structured data, sitemaps. |
| 16 | [User Flow](./16_UserFlow.md) | Guest → registered → premium journeys. |
| 17 | [RBAC](./17_RBAC.md) | Roles, permissions, enforcement points. |

### Admin & Process
| # | Document | Purpose |
|---|----------|---------|
| 18 | [Admin Specification](./18_AdminSpecification.md) | `/admin` modules, screens, workflows. |
| 19 | [Development Guideline](./19_DevelopmentGuideline.md) | Branching, PRs, CI, code review, definition of done. |
| 20 | [Testing Strategy](./20_TestingStrategy.md) | Unit / integration / E2E / visual / load testing. |

### Ops & AI
| # | Document | Purpose |
|---|----------|---------|
| 21 | [Deployment Guide](./21_DeploymentGuide.md) | Environments, env vars, rollback, observability. |
| 22 | [AI Guideline](./22_AI_Guideline.md) | Where AI is used, model choices, prompt management. |
| 23 | [ZAI Context](./23_ZAI_Context.md) | AI-assistant context, memory, agent conventions. |

### Planning
| # | Document | Purpose |
|---|----------|---------|
| 24 | [Roadmap](./24_Roadmap.md) | Phase 1 → Phase 4 milestones and success criteria. |
| 25 | [Backlog](./25_Backlog.md) | Prioritized list of tools and features per phase. |

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

1. **Documentation first.** No production code is written until the corresponding doc exists and is reviewed.
2. **Architectural Locks override everything.** The 12 locks in `00_Project_Charter` §Architectural Locks have priority over every other document. Amending a lock requires a charter revision (§9 of the charter).
3. **Charter precedence.** If any document (other than a lock) conflicts with `00_Project_Charter`, the charter wins.
4. **Revision history mandatory.** Every change must bump the revision and record what changed and why.
5. **Cross-references must be live.** Broken links are a P1 bug.
6. **No orphan decisions.** Any architectural decision must cite the doc or lock it follows or amends.

## Status Legend

- 🟢 **Approved** — Active, in force.
- 🟡 **Draft** — Under review, not yet authoritative.
- 🔴 **Deprecated** — Superseded; kept for history only.
- 🔒 **Locked** — Architectural Lock; cannot be changed without charter amendment.
