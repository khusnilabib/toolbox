# [PROJECT_NAME] — Documentation Repository

> **The single source of truth for the entire [PROJECT_NAME] ecosystem.**
> Documentation first. Code second. Always.

---

## How to Use This Repository

1. **New developers**: Start with `00_Project_Charter`, then read `07_TechStack` and `08_ProjectStructure`. You should be able to run the project locally within 2 hours.
2. **Product / business stakeholders**: Start with `00_Project_Charter` → `01_BRD` → `24_Roadmap`.
3. **Architects / tech leads**: Read all documents in order. Pay special attention to `02_SAD`, `03_DDD`, `13_DatabaseDesign`, and `14_APIConvention`.
4. **Before making any architectural decision**: Search this repository for prior decisions. If your decision contradicts an existing doc, you must either amend the doc (with justification) or follow the doc.

## Document Index

### Foundation
| # | Document | Purpose |
|---|----------|---------|
| 00 | [Project Charter](./00_Project_Charter.md) | Authorizes the project; defines mission, vision, scope, principles. |
| 01 | [Business Requirements Document (BRD)](./01_BRD.md) | Business goals, target market, KPIs, monetization. |

### Architecture & Design
| # | Document | Purpose |
|---|----------|---------|
| 02 | [Software Architecture Document (SAD)](./02_SAD.md) | System architecture, layers, data flow, deployment topology. |
| 03 | [Domain-Driven Design (DDD)](./03_DDD.md) | Bounded contexts, ubiquitous language, aggregate boundaries. |
| 04 | [Feature-Based Requirements Document (FBRD)](./04_FBRD.md) | Per-feature requirement template and registry. |
| 05 | [Architecture Component Document (ACD)](./05_ACD.md) | Reusable components, modules, and their contracts. |

### UI / Stack / Structure
| # | Document | Purpose |
|---|----------|---------|
| 06 | [UI/UX Design Specification (UDS)](./06_UDS.md) | User flows, interaction patterns, accessibility rules. |
| 07 | [Tech Stack](./07_TechStack.md) | Every technology choice, with rationale and upgrade path. |
| 08 | [Project Structure](./08_ProjectStructure.md) | High-level project layout and module boundaries. |
| 09 | [Folder Structure](./09_FolderStructure.md) | Granular file/folder conventions. |
| 10 | [Coding Standards](./10_CodingStandards.md) | TypeScript strict rules, code style, review checklist. |
| 11 | [Naming Convention](./11_NamingConvention.md) | Files, components, variables, APIs, DB tables. |
| 12 | [Design System](./12_DesignSystem.md) | Tokens, components, themes (light/dark). |

### Data & API
| # | Document | Purpose |
|---|----------|---------|
| 13 | [Database Design](./13_DatabaseDesign.md) | Schema, indexes, migrations, multi-tenancy. |
| 14 | [API Convention](./14_APIConvention.md) | REST/RPC conventions, versioning, error format. |

### SEO / Flow / Auth
| # | Document | Purpose |
|---|----------|---------|
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

## Governance Rules

1. **Documentation first.** No production code is written until the corresponding doc exists and is reviewed.
2. **Charter precedence.** If any document conflicts with `00_Project_Charter`, the charter wins.
3. **Revision history mandatory.** Every change must bump the revision and record what changed and why.
4. **Cross-references must be live.** Broken links are a P1 bug.
5. **No orphan decisions.** Any architectural decision must cite the doc it follows or amends.

## Status Legend

- 🟢 **Approved** — Active, in force.
- 🟡 **Draft** — Under review, not yet authoritative.
- 🔴 **Deprecated** — Superseded; kept for history only.
