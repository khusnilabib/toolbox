# 06 — Architecture Decision Records (ADR)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** EC-01 (Documentation First), LOCK-09 (AI Discipline)
> **Policy:** APPEND-ONLY. Never modify historical records. Supersessions are recorded as new ADRs that reference the superseded one.

---

## 1. Purpose

This document is the **permanent history of architectural decisions** for [PROJECT_NAME]. Every significant architectural decision — whether a governance Lock, an Engineering Constitution article, or a technical architectural decision (AD) — is recorded here as an Architecture Decision Record (ADR).

ADR repositories solve a specific problem: architectural decisions are made continuously over the lifetime of a project, and without a permanent record, the *reasons* behind decisions are lost. Six months later, an engineer looking at a piece of code asks "why is it built this way?" and finds no answer. They propose a change that re-litigates a decision already made, wasting time and potentially regressing. ADRs prevent this by making every decision searchable, dated, and contextual.

This document consolidates all decisions from Batches 1 and 2 (Charter, BRD, SAD, DDD, TechStack, ProjectStructure) into formal ADRs. **Future architectural changes MUST append new ADR entries** instead of modifying historical records. When a decision is superseded, a new ADR is added with `Status: Supersedes ADR-XXX`, and the original ADR's status is updated to `Superseded by ADR-YYY` (this status-only edit is the only allowed modification to a historical ADR).

The ADR repository is the operational manifestation of EC-01 (Documentation First) and LOCK-09 (AI Discipline): every architectural choice has a citation, every change has a rationale, and AI assistants are required to consult this repository before proposing architectural changes.

## 2. Scope

### 2.1 In Scope

- All Architectural Locks (LOCK-01 through LOCK-12) recorded as governance ADRs.
- All Engineering Constitution articles (EC-01 through EC-12) recorded as governance ADRs.
- All technical Architectural Decisions (ADs) from `02_SAD`, `03_DDD`, `04_TechStack`, `05_ProjectStructure`.
- The ADR lifecycle: proposal, approval, status transitions, supersession.
- The ADR template that future decisions must follow.

### 2.2 Out of Scope

- Implementation details (code patterns, file layouts) → see the originating document.
- Day-to-day coding decisions (e.g., "use Map vs Object") → not architectural; live in PR descriptions.
- Dependency version bumps → tracked in `04_TechStack` revision history.

## 3. Architectural Decisions

### AD-01 — ADR Repository as Append-Only History

**Context.** Architectural decisions evolve. Without a stable record, the rationale behind past choices is lost, leading to re-litigation and regression. Editing historical decisions destroys the audit trail.

**Decision.** This document is append-only. New ADRs are added at the end. Supersessions are recorded as new ADRs that reference the superseded one. The only allowed modification to a historical ADR is updating its `Status` field to point to the superseding ADR.

**Consequences.**
- ✅ Full audit trail of every architectural decision.
- ✅ Engineers can trace why a decision was made, when, and by whom.
- ✅ AI assistants (LOCK-09, EC-11) consult ADRs before proposing changes.
- ⚠️ Document grows over time; mitigated by clear categorization and indexing.

**Implements:** EC-01 (Documentation First), LOCK-09 (AI Discipline).

### AD-02 — Three ADR Categories

**Context.** Not all decisions carry the same authority. A Lock is permanent governance; a technical AD is implementable guidance. Mixing them obscures the priority order.

**Decision.** ADRs are categorized into three tiers reflecting the governance layers in `README.md`:

1. **Architectural Lock ADRs** (governance tier 1) — define what the platform IS.
2. **Engineering Constitution ADRs** (governance tier 2) — define HOW engineering is DONE.
3. **Technical ADRs** (tier 3) — define how the platform is BUILT.

**Consequences.**
- ✅ Authority precedence is explicit.
- ✅ Conflicts between tiers resolve top-down (Lock > EC > Technical).
- ⚠️ Some decisions span tiers (e.g., LOCK-02 + EC-07 both address performance); cross-references handle this.

**Implements:** Governance Layers in `README.md`.

### AD-03 — ADR Numbering Convention

**Context.** With potentially hundreds of ADRs over the project lifetime, numbering must be stable and searchable.

**Decision.** ADRs are numbered sequentially with zero-padded three-digit IDs: `ADR-001`, `ADR-002`, ..., `ADR-999`. Numbers are never reused, even if an ADR is superseded. The format `ADR-XXX` is the canonical reference in cross-doc citations.

**Consequences.**
- ✅ Stable references; `ADR-025` always means the same thing.
- ✅ Searchable in any editor.
- ⚠️ Number gaps if ADRs are rejected (rejected ADRs are still recorded with `Status: Rejected`).

**Implements:** EC-01 (Documentation First — every decision has a stable citation).

## 4. Design Principles

### P1 — Decisions Are Contextual
Every ADR records the context in which the decision was made, not just the decision itself. Context is what makes a decision understandable years later.

### P2 — Consequences Are Honest
Every ADR lists positive AND negative consequences. Decisions presented as all-upside are suspect; real decisions involve trade-offs.

### P3 — Alternatives Are Visible
Every ADR records the alternatives considered and why they were rejected. This prevents re-litigation: an engineer proposing an alternative can see it was already considered.

### P4 — Status Is Current
ADR status reflects the current state, not the historical state. Status transitions (`Proposed` → `Approved` → `Deprecated` → `Superseded`) are recorded in the ADR's Status field with dates.

### P5 — Citations Are Bidirectional
When an ADR is referenced from another document, that document's cross-reference section lists the ADR. When an ADR references another document, the ADR's Cross References section lists it.

### P6 — AI Consultation Is Mandatory
Per LOCK-09 and EC-11, AI assistants MUST consult this repository before proposing any architectural change. Failure to consult is an EC-11 violation.

## 5. ADR Template

Every ADR in this repository MUST follow this template:

```markdown
### ADR-XXX — [Decision Title]

- **Decision ID:** ADR-XXX
- **Date:** YYYY-MM-DD
- **Status:** Proposed | Approved | Deprecated | Superseded by ADR-YYY | Rejected
- **Category:** Architectural Lock | Engineering Constitution | Technical
- **Implements:** [LOCK-XX / EC-XX / N/A]
- **Decision Owner:** [Role]

**Context.**
[Why is this decision being made? What problem does it solve? What constraints apply?]

**Decision.**
[What is the decision? Be specific enough that an engineer can determine whether code complies.]

**Consequences.**
- ✅ [Positive consequence 1]
- ✅ [Positive consequence 2]
- ⚠️ [Negative consequence or trade-off]
- ⚠️ [Negative consequence or trade-off]

**Alternatives Considered.**
- **Alternative A:** [Description]. Rejected because [reason].
- **Alternative B:** [Description]. Rejected because [reason].

**Future Review Trigger.**
[What condition would prompt re-evaluation of this decision? E.g., "If Vercel removes Edge Runtime, re-evaluate AD-06 deployment topology."]

**Cross References.**
- [Document references]
```

## 6. ADR Index (Quick Reference)

### 6.1 Architectural Lock ADRs (Governance Tier 1)

| ADR | Title | Status | Source |
|-----|-------|--------|--------|
| ADR-001 | Platform Identity | Approved | `00_Project_Charter` §3 LOCK-01 |
| ADR-002 | Browser-First Philosophy | Approved | `00_Project_Charter` §3 LOCK-02 |
| ADR-003 | Tool Engine Philosophy | Approved | `00_Project_Charter` §3 LOCK-03 |
| ADR-004 | Modular Architecture | Approved | `00_Project_Charter` §3 LOCK-04 |
| ADR-005 | Plugin-Ready Architecture | Approved | `00_Project_Charter` §3 LOCK-05 |
| ADR-006 | Database Optional Philosophy | Approved | `00_Project_Charter` §3 LOCK-06 |
| ADR-007 | Guest-First User Experience | Approved | `00_Project_Charter` §3 LOCK-07 |
| ADR-008 | SEO Constitution | Approved | `00_Project_Charter` §3 LOCK-08 |
| ADR-009 | AI Development Constitution | Approved | `00_Project_Charter` §3 LOCK-09 |
| ADR-010 | Design Philosophy | Approved | `00_Project_Charter` §3 LOCK-10 |
| ADR-011 | Admin Philosophy | Approved | `00_Project_Charter` §3 LOCK-11 |
| ADR-012 | Feature Lifecycle | Approved | `00_Project_Charter` §3 LOCK-12 |

### 6.2 Engineering Constitution ADRs (Governance Tier 2)

| ADR | Title | Status | Source |
|-----|-------|--------|--------|
| ADR-013 | Documentation First | Approved | `00_Project_Charter` §4 EC-01 |
| ADR-014 | One Source of Truth | Approved | `00_Project_Charter` §4 EC-02 |
| ADR-015 | Component Reuse First | Approved | `00_Project_Charter` §4 EC-03 |
| ADR-016 | Tool Template Standard | Approved | `00_Project_Charter` §4 EC-04 |
| ADR-017 | Progressive Enhancement | Approved | `00_Project_Charter` §4 EC-05 |
| ADR-018 | Accessibility First | Approved | `00_Project_Charter` §4 EC-06 |
| ADR-019 | Performance Budget | Approved | `00_Project_Charter` §4 EC-07 |
| ADR-020 | Security by Default | Approved | `00_Project_Charter` §4 EC-08 |
| ADR-021 | Testing Philosophy | Approved | `00_Project_Charter` §4 EC-09 |
| ADR-022 | Design System Governance | Approved | `00_Project_Charter` §4 EC-10 |
| ADR-023 | AI Collaboration Rules | Approved | `00_Project_Charter` §4 EC-11 |
| ADR-024 | Enterprise Readiness | Approved | `00_Project_Charter` §4 EC-12 |

### 6.3 Technical ADRs (Tier 3) — Software Architecture (`02_SAD`)

| ADR | Title | Status | Source |
|-----|-------|--------|--------|
| ADR-025 | Layered Architecture with Strict Boundary Enforcement | Approved | `02_SAD` AD-01 |
| ADR-026 | Tool Engine as Standardized Lifecycle Pipeline | Approved | `02_SAD` AD-02 |
| ADR-027 | Tool Registry for Auto-Discovery | Approved | `02_SAD` AD-03 |
| ADR-028 | Browser-First by Default, Server-Side by Exception | Approved | `02_SAD` AD-04 |
| ADR-029 | Database Optional via Strict Layer Separation | Approved | `02_SAD` AD-05 |
| ADR-030 | Edge-First Deployment with Regional Database | Approved | `02_SAD` AD-06 |

### 6.4 Technical ADRs (Tier 3) — Domain-Driven Design (`03_DDD`)

| ADR | Title | Status | Source |
|-----|-------|--------|--------|
| ADR-031 | Six Bounded Contexts | Approved | `03_DDD` AD-01 |
| ADR-032 | Tools Context is the Core Domain | Approved | `03_DDD` AD-02 |
| ADR-033 | Database-Optional Requires Stateless Tools Context | Approved | `03_DDD` AD-03 |
| ADR-034 | Plugin-Ready via Manifest Aggregate | Approved | `03_DDD` AD-04 |
| ADR-035 | Context Integration via Domain Events | Approved | `03_DDD` AD-05 |

### 6.5 Technical ADRs (Tier 3) — Tech Stack (`04_TechStack`)

| ADR | Title | Status | Source |
|-----|-------|--------|--------|
| ADR-036 | Next.js 15+ App Router as Unified Framework | Approved | `04_TechStack` AD-01 |
| ADR-037 | TypeScript Strict Mode End-to-End | Approved | `04_TechStack` AD-02 |
| ADR-038 | Supabase for Identity, Database, and Storage | Approved | `04_TechStack` AD-03 |
| ADR-039 | Drizzle ORM for Type-Safe Database Access | Approved | `04_TechStack` AD-04 |
| ADR-040 | shadcn/ui for UI Components | Approved | `04_TechStack` AD-05 |
| ADR-041 | Tailwind CSS for Styling | Approved | `04_TechStack` AD-06 |
| ADR-042 | Zod for Runtime Validation | Approved | `04_TechStack` AD-07 |
| ADR-043 | React Hook Form + Zod for Forms | Approved | `04_TechStack` AD-08 |
| ADR-044 | Zustand for Client State | Approved | `04_TechStack` AD-09 |
| ADR-045 | Vercel for Hosting and Edge Delivery | Approved | `04_TechStack` AD-10 |
| ADR-046 | pnpm as Package Manager | Approved | `04_TechStack` AD-11 |

### 6.6 Technical ADRs (Tier 3) — Project Structure (`05_ProjectStructure`)

| ADR | Title | Status | Source |
|-----|-------|--------|--------|
| ADR-047 | Feature-Based Architecture at Top Level | Approved | `05_ProjectStructure` AD-01 |
| ADR-048 | Layered Folders Within Each Context | Approved | `05_ProjectStructure` AD-02 |
| ADR-049 | Tool Module Anatomy (One Folder Per Tool) | Approved | `05_ProjectStructure` AD-03 |
| ADR-050 | Tool Registry Pattern (Build-Time Codegen) | Approved | `05_ProjectStructure` AD-04 |
| ADR-051 | Shared Code Split Between `/packages` and `/src/shared` | Approved | `05_ProjectStructure` AD-05 |
| ADR-052 | App Router Maps to Tool Registry | Approved | `05_ProjectStructure` AD-06 |
| ADR-053 | Database-Optional Layout | Approved | `05_ProjectStructure` AD-07 |

## 7. ADR Records (Full Text)

### Part 1: Architectural Lock ADRs (Governance Tier 1)

---

### ADR-001 — Platform Identity

- **Decision ID:** ADR-001
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-01
- **Decision Owner:** Chief Architect

**Context.** Without a locked identity statement, the platform drifts over time as different stakeholders reframe it ("it's a SaaS suite", "it's an online tools directory", "it's an AI utility platform"). Each reframing leads to inconsistent product, design, and engineering decisions.

**Decision.** [PROJECT_NAME] is officially positioned as a **browser-first productivity ecosystem that enables users to solve everyday digital tasks without installing software and without requiring an account.** Four brand values anchor every decision: Privacy, Speed, Simplicity, Accessibility.

**Consequences.**
- ✅ Stable identity prevents product drift.
- ✅ Brand values become evaluation criteria for every PR and design mock.
- ⚠️ Cannot pivot to "SaaS suite" or "AI utility platform" without charter amendment.

**Alternatives Considered.**
- **"Online tools directory":** Rejected — undifferentiated from competitors; doesn't capture ecosystem ambition.
- **"Productivity SaaS suite":** Rejected — implies account-first onboarding, contradicting LOCK-07.

**Future Review Trigger.** Only if the platform's mission fundamentally changes (e.g., acquisition, pivot). Otherwise permanent.

**Cross References.** `00_Project_Charter` §2, §3 LOCK-01.

---

### ADR-002 — Browser-First Philosophy

- **Decision ID:** ADR-002
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-02
- **Decision Owner:** Chief Architect

**Context.** Server-side processing for tools that could run in-browser creates unnecessary infrastructure cost, slower UX, and privacy concerns. Without a structural commitment to browser-first, tools tend to default to server-side because it's the developer's comfort zone.

**Decision.** Whenever technically possible, processing MUST happen entirely inside the user's browser. Browser-first by default; server-side only when technically unavoidable (AI inference, large file processing, OCR on big documents, premium cloud features).

**Consequences.**
- ✅ Better privacy — user data stays on user's device.
- ✅ Faster UX — no network round-trip.
- ✅ Lower infrastructure cost — ~90% of Phase 1 tools run without server compute.
- ✅ Better scalability — browser capacity scales with users.
- ⚠️ Some tools require server-side fallback for large files or specialized processing.

**Alternatives Considered.**
- **Server-first with browser fallback:** Rejected — inverts the default; leads to over-reliance on servers.
- **Hybrid without default:** Rejected — ambiguous; engineers would pick arbitrarily per tool.

**Future Review Trigger.** If a tool category emerges that cannot be served browser-side AND cannot be solved via WASM (e.g., video transcoding at scale), re-evaluate the default for that category.

**Cross References.** `00_Project_Charter` §3 LOCK-02, `02_SAD` AD-04 (decision matrix), `04_TechStack` §8 (browser-side libraries).

---

### ADR-003 — Tool Engine Philosophy

- **Decision ID:** ADR-003
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-03
- **Decision Owner:** Chief Architect

**Context.** Without a standardized tool lifecycle, each tool implements its own workflow inconsistently. UX diverges; cross-cutting features (analytics, history, error handling) must be re-implemented per tool; maintenance scales linearly with tool count instead of constant.

**Decision.** Every tool MUST follow one standardized lifecycle: Input → Validation → Processing → Preview → Download → History (optional) → Share (optional). Tools reuse this lifecycle via the typed `ToolEngine<TInput, TOutput>` abstraction.

**Consequences.**
- ✅ Consistent UX across all tools.
- ✅ Cross-cutting features added once at engine level.
- ✅ Adding a tool = defining a manifest + stage implementations.
- ⚠️ Exotic workflows need escape hatches; provided as extension points.

**Alternatives Considered.**
- **Free-form tool structure:** Rejected — leads to UX inconsistency and duplicated logic.
- **Multiple lifecycle patterns (e.g., single-step vs. multi-step):** Rejected — the standard lifecycle accommodates both via optional History/Share stages.

**Future Review Trigger.** If a tool genuinely cannot fit the lifecycle (e.g., real-time collaborative editing), propose a new ADR rather than bypassing the engine.

**Cross References.** `00_Project_Charter` §3 LOCK-03, `02_SAD` AD-02, `05_ProjectStructure` AD-03, `12_ACD` §Tool Engine Component.

---

### ADR-004 — Modular Architecture

- **Decision ID:** ADR-004
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-04
- **Decision Owner:** Chief Architect

**Context.** At 1,000+ tools, tight coupling between tools causes cascading failures and makes changes expensive. Without strict modularity, a bug in one tool can break unrelated tools.

**Decision.** Every tool is an independent module that is: Independent, Reusable, Replaceable, Maintainable, Discoverable. Modules MUST NOT depend directly on another module's internal implementation. Shared functionality lives only in `/packages` and `/src/shared`.

**Consequences.**
- ✅ Bugs in one tool cannot affect others.
- ✅ Tools can be replaced without affecting siblings.
- ✅ Testing is isolated per module.
- ⚠️ Requires discipline in code review to enforce boundaries.
- ⚠️ Slightly more indirection for shared functionality.

**Alternatives Considered.**
- **Shared utility soup (all tools import from common utils):** Rejected — leads to god-modules.
- **Microservices per tool:** Rejected — operational overhead unjustified for browser-side tools.

**Future Review Trigger.** If a tool's needs genuinely cannot be met by composition, propose an ADR for the exception.

**Cross References.** `00_Project_Charter` §3 LOCK-04, `02_SAD` AD-01, `03_DDD` AD-01, `05_ProjectStructure` AD-01, AD-03.

---

### ADR-005 — Plugin-Ready Architecture

- **Decision ID:** ADR-005
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-05
- **Decision Owner:** Chief Architect

**Context.** Phase 4 envisions a plugin marketplace. If the architecture is not plugin-ready from Phase 1, retrofitting plugin support requires major restructuring.

**Decision.** The platform MUST support future plugin/module registration. Each tool exposes metadata through a manifest/registry system. Adding a new tool should require minimal modification outside the tool's own module. Auto-discovery and registry-driven navigation are anticipated.

**Consequences.**
- ✅ Phase 4 marketplace requires no architectural change.
- ✅ First-party and third-party tools are structurally identical.
- ⚠️ Manifest schema evolution requires discipline.

**Alternatives Considered.**
- **Hardcoded tool registration:** Rejected — doesn't scale to 1,000+ tools.
- **Runtime registry service:** Rejected — adds latency and operational complexity; build-time codegen is faster.

**Future Review Trigger.** When Phase 4 marketplace development begins, add ADRs for plugin signing, sandboxing, and versioning.

**Cross References.** `00_Project_Charter` §3 LOCK-05, `02_SAD` AD-03, `03_DDD` AD-04, `05_ProjectStructure` AD-04, `11_FBRD` §Tool Manifest.

---

### ADR-006 — Database Optional Philosophy

- **Decision ID:** ADR-006
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-06
- **Decision Owner:** Chief Architect

**Context.** If core tool processing depends on the database, every DB outage breaks user workflows. This is unacceptable for a productivity platform where reliability is a brand value.

**Decision.** The database is NOT required for the platform to operate. Core tools MUST continue functioning even if database services are temporarily unavailable. Database responsibilities: authentication, user profile, history, favorites, cloud sync, analytics, admin, content, settings. Core tool processing MUST NOT depend on database availability.

**Consequences.**
- ✅ Tools always work; platform degrades gracefully.
- ✅ Database maintenance windows don't break user workflows.
- ⚠️ History/favorites may temporarily appear stale during outages.

**Alternatives Considered.**
- **Strong DB coupling with retry logic:** Rejected — adds latency even when DB is up; doesn't truly solve outage scenarios.
- **Read replicas for HA:** Rejected for Phase 1 — adds cost; defer to Phase 3.

**Future Review Trigger.** If a tool category inherently requires server-side state (e.g., scheduled batch processing), document the exception in `02_SAD` §AD-04 decision matrix.

**Cross References.** `00_Project_Charter` §3 LOCK-06, `02_SAD` AD-05, `03_DDD` AD-03, `05_ProjectStructure` AD-07.

---

### ADR-007 — Guest-First User Experience

- **Decision ID:** ADR-007
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-07
- **Decision Owner:** Chief Architect

**Context.** Forcing registration before demonstrating value creates friction that drives users away, especially for search-driven traffic where users want to solve one problem in 60 seconds.

**Decision.** Guest users may browse tools, upload files, configure settings, process files, and preview results. Registration is requested ONLY when users attempt to download results, save history, favorite tools, synchronize devices, or access premium capabilities. No mandatory registration before demonstrating value.

**Consequences.**
- ✅ Lower bounce rate from search traffic.
- ✅ Trust built through demonstrated value.
- ⚠️ History/favorites only available post-registration (acceptable trade-off).

**Alternatives Considered.**
- **Always-free with optional account:** Rejected — same effect, less clear UX.
- **Soft registration gate (e.g., after 3 tool uses):** Rejected — arbitrary; users feel manipulated.

**Future Review Trigger.** If abuse (e.g., automated scraping) forces stricter gating, propose a targeted ADR rather than weakening LOCK-07 globally.

**Cross References.** `00_Project_Charter` §3 LOCK-07, `01_BRD` §4.2, `17_UserFlow`.

---

### ADR-008 — SEO Constitution

- **Decision ID:** ADR-008
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-08
- **Decision Owner:** Chief Architect

**Context.** SEO is the primary acquisition channel through Phase 2. If SEO is treated as post-launch optimization, the URL structure, routing, and metadata systems won't support it, requiring expensive refactoring.

**Decision.** SEO is a first-class architectural concern. Every tool page supports: unique URL, unique metadata, canonical URL, Open Graph, Twitter Card, structured data (JSON-LD), breadcrumb, FAQ, related tools, internal linking, search intent mapping. No duplicate metadata or content. SEO requirements influence architecture from the beginning.

**Consequences.**
- ✅ Every tool is an indexable, schema-marked landing page.
- ✅ Internal linking strengthens SEO across the ecosystem.
- ⚠️ Requires manifest schema to encode SEO fields (LOCK-05 compatibility).

**Alternatives Considered.**
- **SEO plugin added post-launch:** Rejected — too late; URL structure and routing can't be retrofitted cheaply.
- **Per-tool SEO config files (separate from manifest):** Rejected — duplicates manifest's responsibility.

**Future Review Trigger.** If search engine algorithms shift significantly (e.g., AI-generated search results reduce organic traffic >40%), update `16_SEOSpecification` and possibly this ADR.

**Cross References.** `00_Project_Charter` §3 LOCK-08, `02_SAD` AD-03, `16_SEOSpecification`, `11_FBRD` §Tool Manifest.

---

### ADR-009 — AI Development Constitution

- **Decision ID:** ADR-009
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-09
- **Decision Owner:** Chief Architect

**Context.** AI-assisted development can produce code quickly, but without discipline it duplicates components, drifts from architecture, and introduces unapproved dependencies — creating technical debt faster than human developers would.

**Decision.** AI (and humans using AI tooling) MUST NOT duplicate components/logic, change architecture, change folder conventions, install dependencies, or introduce breaking patterns without explicit human approval. AI MUST prefer extending existing systems over creating parallel implementations. Consistency > speed.

**Consequences.**
- ✅ AI becomes a force multiplier without degrading architecture.
- ✅ Codebase remains coherent as it scales.
- ⚠️ Slightly slower AI-driven development; justified by long-term maintainability.

**Alternatives Considered.**
- **Unrestricted AI development:** Rejected — leads to architectural drift within months.
- **AI banned entirely:** Rejected — forfeits legitimate productivity gains.

**Future Review Trigger.** As AI capabilities evolve, refine the rules in `23_AI_Guideline` and `24_ZAI_Context`.

**Cross References.** `00_Project_Charter` §3 LOCK-09, `23_AI_Guideline`, `24_ZAI_Context`, `20_DevelopmentGuideline` §AI-Assisted Development.

---

### ADR-010 — Design Philosophy

- **Decision ID:** ADR-010
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-10
- **Decision Owner:** Chief Architect

**Context.** Without a locked design philosophy, the platform accumulates inconsistent visual choices over time as different contributors introduce preferences.

**Decision.** Visual language follows developer-first minimalism inspired by modern engineering products (Vercel-like). Characteristics: monochrome palette, high contrast, spacious layout, premium feel, fast interfaces, minimal animation, accessible, mobile-first, dark/light mode ready. Avoid decorative UI that does not improve usability.

**Consequences.**
- ✅ Consistent visual language across the ecosystem.
- ✅ Token-driven theming enables dark/light mode from day 1.
- ⚠️ Restricts creative experimentation; justified by ecosystem coherence.

**Alternatives Considered.**
- **Notion-like (warm, whitespace):** Rejected — doesn't match developer-first identity.
- **Stripe-like (pastels, friendly):** Rejected — too consumer-facing for the developer audience.

**Future Review Trigger.** If user research indicates the design alienates non-developer audiences, propose a brand refresh ADR.

**Cross References.** `00_Project_Charter` §3 LOCK-10, `10_DesignSystem`, `13_UDS`.

---

### ADR-011 — Admin Philosophy

- **Decision ID:** ADR-011
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-11
- **Decision Owner:** Chief Architect

**Context.** Treating admin as "just a CMS" leads to under-investment in operational capabilities, forcing engineers to do operational tasks manually as the platform scales.

**Decision.** The Admin Panel is the operational control center, not just a CMS. Long-term modules include: Dashboard, Users, Roles, Permissions, Categories, Tools, Media, SEO, Articles, Analytics, Advertisements, Feature Flags, Experiments, System Health, Logs, Audit Trail, Settings. Enterprise-scale growth is anticipated.

**Consequences.**
- ✅ Operations scale with the platform.
- ✅ RBAC and audit trail from Phase 1.
- ⚠️ Higher initial investment in admin infrastructure.

**Alternatives Considered.**
- **External admin tools (e.g., Retool):** Rejected — doesn't integrate with our bounded contexts; creates data silos.
- **Phase-1-minimal admin (CRUD only):** Rejected — would require rebuilding for Phase 2+ needs.

**Future Review Trigger.** When new operational needs emerge (e.g., experiment management), add module per `19_AdminSpecification`.

**Cross References.** `00_Project_Charter` §3 LOCK-11, `19_AdminSpecification`, `18_RBAC`.

---

### ADR-012 — Feature Lifecycle

- **Decision ID:** ADR-012
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Architectural Lock
- **Implements:** LOCK-12
- **Decision Owner:** Chief Architect

**Context.** Without a standardized feature lifecycle, tools exist in a binary "live or not" state. This makes it hard to communicate intent (e.g., "this tool is in beta, expect bugs") and impossible to deprecate cleanly.

**Decision.** Every feature has a maturity status. Canonical lifecycle: Concept → Planned → Design → Development → Testing → Beta → Stable → Deprecated → Archived. Lifecycle is represented inside the Admin Panel as a first-class field on every tool, feature, and module. Each tool's manifest declares its current status. Status transitions are audited.

**Consequences.**
- ✅ Clear communication of tool maturity to users and team.
- ✅ Clean deprecation path via Deprecated → Archived.
- ⚠️ Requires discipline to keep manifest status current.

**Alternatives Considered.**
- **Binary live/draft:** Rejected — too coarse; can't communicate beta state.
- **SemVer-style versioning:** Rejected — versioning is orthogonal to lifecycle; both needed.

**Future Review Trigger.** If a new lifecycle state becomes necessary (e.g., "experimental"), add via charter amendment.

**Cross References.** `00_Project_Charter` §3 LOCK-12, `11_FBRD` §Tool Manifest, `19_AdminSpecification` §Feature Lifecycle.

---

### Part 2: Engineering Constitution ADRs (Governance Tier 2)

---

### ADR-013 — Documentation First

- **Decision ID:** ADR-013
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-01
- **Decision Owner:** Chief Architect

**Context.** Without mandatory documentation, decisions live only in the heads of contributors. As the team grows or AI assistants rotate context, undocumented decisions get re-litigated or contradicted.

**Decision.** Documentation is the single source of truth. No implementation exists without corresponding documentation. Every PR satisfies: documentation updated, architecture remains compliant with LOCKs and ECs, ADR updated if an architectural decision changes.

**Consequences.**
- ✅ Every architectural choice has a citation.
- ✅ AI assistants can consult docs instead of guessing.
- ⚠️ Slightly slower PR cycle; justified by long-term coherence.

**Alternatives Considered.**
- **Documentation encouraged but optional:** Rejected — leads to gradual documentation rot.
- **External wiki:** Rejected — fragmented from code; goes stale.

**Future Review Trigger.** Permanent.

**Cross References.** `00_Project_Charter` §4 EC-01, `20_DevelopmentGuideline`, this document.

---

### ADR-014 — One Source of Truth

- **Decision ID:** ADR-014
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-02
- **Decision Owner:** Chief Architect

**Context.** Duplicated constants, validation logic, schemas, and business workflows create maintenance hazards — when one copy changes, others go stale silently.

**Decision.** Every business rule exists in exactly one place. Avoid duplicated constants, validation logic, schemas, utilities, or business workflows. If duplication is discovered, it must be refactored.

**Consequences.**
- ✅ Single point of update for any business rule.
- ✅ Type safety propagates from one source.
- ⚠️ Requires discipline to identify duplication in code review.

**Alternatives Considered.**
- **Tolerate duplication under 50 lines:** Rejected — arbitrary threshold; small duplications compound.

**Future Review Trigger.** Permanent.

**Cross References.** `00_Project_Charter` §4 EC-02, `08_CodingStandards` §DRY Enforcement, `12_ACD` §Shared Component Inventory.

---

### ADR-015 — Component Reuse First

- **Decision ID:** ADR-015
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-03
- **Decision Owner:** Chief Architect

**Context.** Engineers under deadline pressure tend to create new components rather than search for existing ones, leading to component sprawl and duplicated logic.

**Decision.** Before creating a new component, hook, utility, service, or helper: (1) Search existing implementation. (2) Extend existing implementation if appropriate. (3) Create new only when justified. The platform grows by composition rather than duplication.

**Consequences.**
- ✅ Component inventory stays manageable.
- ✅ Cross-cutting improvements propagate via shared components.
- ⚠️ Slightly more time per new component; justified by long-term coherence.

**Alternatives Considered.**
- **Free creation with periodic cleanup:** Rejected — cleanups never happen; sprawl accumulates.

**Future Review Trigger.** Permanent.

**Cross References.** `00_Project_Charter` §4 EC-03, `12_ACD` §Component Catalog, `08_CodingStandards` §Reuse Checklist.

---

### ADR-016 — Tool Template Standard

- **Decision ID:** ADR-016
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-04
- **Decision Owner:** Chief Architect

**Context.** Without a standardized tool template, each tool's internal structure varies, making it harder to onboard new tools and easier for bugs to hide in idiosyncratic code paths.

**Decision.** Every tool follows an identical internal structure. Each tool exposes: metadata, manifest, validation, processing, preview, download, SEO, tests, documentation. No tool defines an entirely custom lifecycle without architectural approval.

**Consequences.**
- ✅ Onboarding a new tool is mechanical.
- ✅ Tests and tooling can assume structure.
- ⚠️ Exotic tools need approval to deviate; documented as ADR.

**Alternatives Considered.**
- **Flexible structure per tool category:** Rejected — fragments tooling; harder to maintain at scale.

**Future Review Trigger.** When a tool genuinely cannot fit the template, propose a deviation ADR.

**Cross References.** `00_Project_Charter` §4 EC-04, `05_ProjectStructure` §Tool Module Anatomy, `11_FBRD`, `07_FolderStructure` §Tool Folder Template.

---

### ADR-017 — Progressive Enhancement

- **Decision ID:** ADR-017
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-05
- **Decision Owner:** Chief Architect

**Context.** Web apps that fail completely when JavaScript fails, APIs are down, or DB is unavailable create terrible UX. Users hit a white screen or error page with no recovery.

**Decision.** The platform remains usable when JavaScript partially fails, APIs are temporarily unavailable, database is offline, or authentication is unavailable. Whenever possible, gracefully degrade rather than fail.

**Consequences.**
- ✅ Users can complete core workflows during partial outages.
- ✅ Trust built through resilience.
- ⚠️ Requires explicit degradation paths in every layer.

**Alternatives Considered.**
- **Fail-fast with clear error pages:** Rejected — acceptable for admin tools, unacceptable for user-facing tools.

**Future Review Trigger.** Permanent.

**Cross References.** `00_Project_Charter` §4 EC-05, `02_SAD` §Graceful Degradation, `17_UserFlow` §Degraded Journeys.

---

### ADR-018 — Accessibility First

- **Decision ID:** ADR-018
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-06
- **Decision Owner:** Chief Architect

**Context.** Treating accessibility as a "Phase 2 polish" item means it never happens; retrofitting accessibility is more expensive than building it in from the start.

**Decision.** Every UI component satisfies accessibility requirements. Minimum: keyboard navigation, focus visibility, screen reader support, semantic HTML, WCAG AA contrast, reduced motion compatibility. Accessibility is not optional.

**Consequences.**
- ✅ Platform usable by people with disabilities from day 1.
- ✅ Accessibility is also a SEO ranking factor.
- ⚠️ Slightly more time per component; justified by ethical and legal obligations.

**Alternatives Considered.**
- **WCAG A (lower bar):** Rejected — insufficient; WCAG AA is the industry standard.
- **Phase 2 retrofit:** Rejected — too expensive; never happens.

**Future Review Trigger.** If WCAG releases a new standard (e.g., WCAG 3.0), update `13_UDS` accordingly.

**Cross References.** `00_Project_Charter` §4 EC-06, `10_DesignSystem` §Accessibility, `13_UDS` §Accessibility Standards, `21_TestingStrategy` §Accessibility Testing.

---

### ADR-019 — Performance Budget

- **Decision ID:** ADR-019
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-07
- **Decision Owner:** Chief Architect

**Context.** Without explicit performance budgets, performance degrades imperceptibly over time as features are added. By the time users complain, the regression is hard to reverse.

**Decision.** Every feature respects predefined performance budgets. Targets: fast initial render, minimal JavaScript, lazy loading where appropriate, tree shaking, code splitting, image optimization. Performance regressions are treated as bugs.

**Consequences.**
- ✅ Performance remains a brand value over time.
- ✅ SEO ranking factor preserved.
- ⚠️ Requires CI enforcement to be effective.

**Alternatives Considered.**
- **"Best-effort" performance:** Rejected — no enforcement; degrades silently.

**Future Review Trigger.** As device capabilities and network speeds evolve, update specific budget numbers in `08_CodingStandards`.

**Cross References.** `00_Project_Charter` §4 EC-07, `02_SAD` §Performance Standards, `08_CodingStandards` §Performance Budget, `22_DeploymentGuide` §Performance Monitoring.

---

### ADR-020 — Security by Default

- **Decision ID:** ADR-020
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-08
- **Decision Owner:** Chief Architect

**Context.** Reactive security (fixing vulnerabilities as they're discovered) is insufficient for a platform handling user files and authentication.

**Decision.** Default assumptions: validate every input, sanitize every output, principle of least privilege, secure headers, strict TypeScript, secrets never committed, dependency review required. Security is proactive, not reactive.

**Consequences.**
- ✅ Reduced attack surface.
- ✅ Compliance with GDPR/CCPA easier.
- ⚠️ Slightly more boilerplate per IO boundary; justified.

**Alternatives Considered.**
- **Trust internal boundaries:** Rejected — defense in depth requires validation at every boundary.

**Future Review Trigger.** Permanent; new threat vectors trigger updates to `08_CodingStandards` §Security Rules.

**Cross References.** `00_Project_Charter` §4 EC-08, `08_CodingStandards` §Security Rules, `15_APIConvention` §Security, `14_DatabaseDesign` §RLS, `18_RBAC`, `22_DeploymentGuide` §Security Headers.

---

### ADR-021 — Testing Philosophy

- **Decision ID:** ADR-021
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-09
- **Decision Owner:** Chief Architect

**Context.** Without a testing philosophy, teams gravitate to either no tests (fast initial delivery, unmaintainable later) or all-E2E (slow, flaky, expensive). Both fail at scale.

**Decision.** Testing pyramid: Unit Tests → Integration Tests → End-to-End Tests. Every reusable engine is testable independently. Tool Engine, Registry, Validators, and Shared Utilities are designed for testing from the beginning.

**Consequences.**
- ✅ Fast, reliable test suite.
- ✅ Refactoring enabled by unit tests; confidence enabled by E2E.
- ⚠️ Requires test infrastructure investment up front.

**Alternatives Considered.**
- **Test-only-E2E (ice cream cone):** Rejected — slow, flaky.
- **No tests, rely on types:** Rejected — types catch some bugs but not behavior.

**Future Review Trigger.** Permanent.

**Cross References.** `00_Project_Charter` §4 EC-09, `21_TestingStrategy`, `08_CodingStandards` §Testability Requirements.

---

### ADR-022 — Design System Governance

- **Decision ID:** ADR-022
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-10
- **Decision Owner:** Chief Architect

**Context.** Without design system governance, pages accumulate ad hoc UI patterns — bespoke spacing, custom colors, one-off components — fragmenting the visual language.

**Decision.** No page introduces ad hoc UI patterns. Every visual element originates from the Design System. Spacing, typography, colors, radius, shadows, icons, and motion remain consistent across the ecosystem.

**Consequences.**
- ✅ Visual coherence across 1,000+ tools.
- ✅ Design system improvements propagate automatically.
- ⚠️ Requires design system to cover all needs; expansion via PR.

**Alternatives Considered.**
- **Allow per-tool customization:** Rejected — fragments the brand.

**Future Review Trigger.** Permanent.

**Cross References.** `00_Project_Charter` §4 EC-10, `10_DesignSystem`, `12_ACD`, `08_CodingStandards` §Design System Compliance.

---

### ADR-023 — AI Collaboration Rules

- **Decision ID:** ADR-023
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-11
- **Decision Owner:** Chief Architect

**Context.** AI assistants without explicit collaboration rules tend to make assumptions, introduce unnecessary abstractions, and create technical debt to maximize short-term output.

**Decision.** AI is a permanent engineering partner. AI must: preserve consistency, explain architectural trade-offs, reference existing documentation, avoid unnecessary abstractions, minimize technical debt. When uncertainty exists: ask before assuming.

**Consequences.**
- ✅ AI becomes a force multiplier without degrading the codebase.
- ✅ Knowledge captured in docs is reused by AI.
- ⚠️ Slightly slower AI-driven development; justified.

**Alternatives Considered.**
- **Unrestricted AI:** Rejected — drifts from architecture.
- **AI banned:** Rejected — forfeits productivity.

**Future Review Trigger.** As AI capabilities evolve, refine `23_AI_Guideline` and `24_ZAI_Context`.

**Cross References.** `00_Project_Charter` §4 EC-11, `23_AI_Guideline`, `24_ZAI_Context`, `20_DevelopmentGuideline` §AI-Assisted Development.

---

### ADR-024 — Enterprise Readiness

- **Decision ID:** ADR-024
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Engineering Constitution
- **Implements:** EC-12
- **Decision Owner:** Chief Architect

**Context.** Free-tier constraints (Vercel Free, Supabase Free, GitHub) are appropriate for Phase 1 but cannot become architectural assumptions. If the codebase is built assuming free-tier limits, migrating to paid infrastructure later requires redesign.

**Decision.** Although the project begins on free infrastructure, the architecture remains capable of scaling to enterprise deployment without major redesign. No implementation assumes free-tier limitations as permanent.

**Consequences.**
- ✅ Migration to paid infrastructure is configuration, not rewrite.
- ✅ Enterprise sales (Phase 3+) don't require architectural rework.
- ⚠️ Slightly more abstraction in infrastructure layer; justified.

**Alternatives Considered.**
- **Free-tier-specific optimizations:** Rejected — creates lock-in to free tier.

**Future Review Trigger.** When migration to paid tier begins, document migration steps in `22_DeploymentGuide` §Enterprise Migration.

**Cross References.** `00_Project_Charter` §4 EC-12, `04_TechStack` §Upgrade Paths, `02_SAD` §Future Scalability, `22_DeploymentGuide` §Enterprise Migration.

---

### Part 3: Technical ADRs — Software Architecture (`02_SAD`)

---

### ADR-025 — Layered Architecture with Strict Boundary Enforcement

- **Decision ID:** ADR-025
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04, EC-02
- **Decision Owner:** Chief Architect

**Context.** The platform must support hundreds to thousands of tools, each independently developed, while sharing common infrastructure (auth, routing, SEO, admin). Without strict layering, tools tend to reach into infrastructure directly, creating coupling that makes future changes expensive.

**Decision.** The system is organized into four layers with strict dependency rules: Presentation → Application → Domain → Infrastructure (one-way). Presentation cannot import from Infrastructure. Domain cannot import React. Infrastructure is the only layer that talks to databases, external APIs, and file systems.

**Consequences.**
- ✅ Tools remain isolated; infrastructure changes don't ripple.
- ✅ Domain logic is unit-testable without React/Next.js.
- ⚠️ Slightly more files per feature; justified by enforceability.

**Alternatives Considered.**
- **Three-layer (Presentation, Business, Data):** Rejected — doesn't separate Domain from Application clearly.
- **Hexagonal architecture:** Rejected — more abstraction than needed for this scale.

**Future Review Trigger.** If a context's complexity justifies hexagonal or CQRS, propose a context-specific ADR.

**Cross References.** `02_SAD` AD-01, `05_ProjectStructure` AD-02.

---

### ADR-026 — Tool Engine as Standardized Lifecycle Pipeline

- **Decision ID:** ADR-026
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-03, EC-04, EC-09
- **Decision Owner:** Chief Architect

**Context.** LOCK-03 mandates that every tool follows the lifecycle: Input → Validation → Processing → Preview → Download → History → Share. Without a typed, reusable engine, each tool reimplements this lifecycle inconsistently, leading to divergent UX and duplicated logic (violating LOCK-09).

**Decision.** Define a `ToolEngine<TInput, TOutput>` abstraction in the Application Layer that orchestrates the lifecycle. Every tool implements a manifest describing its lifecycle stages; the engine executes them. Stages are composable: a tool can omit History and Share, but MUST implement Input, Validation, Processing, Preview, and Download.

**Consequences.**
- ✅ Consistent UX across all tools.
- ✅ Cross-cutting features added once at engine level.
- ⚠️ Some tools with exotic workflows may need escape hatches; provided as extension points.

**Alternatives Considered.**
- **Free-form tool structure:** Rejected — UX inconsistency; duplicated logic.
- **Inheritance-based tool base class:** Rejected — composition preferred over inheritance per `00_Project_Charter` §8 (coding rules).

**Future Review Trigger.** If a tool genuinely cannot fit the pipeline, propose an escape-hatch ADR.

**Cross References.** `02_SAD` AD-02, `12_ACD` §Tool Engine Component, `11_FBRD` §Tool Manifest.

---

### ADR-027 — Tool Registry for Auto-Discovery

- **Decision ID:** ADR-027
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-05, LOCK-08, LOCK-12, EC-01
- **Decision Owner:** Chief Architect

**Context.** LOCK-05 mandates plugin-ready architecture with auto-discovery. With 1,000+ tools, manually wiring routes, nav entries, SEO metadata, and admin references per tool does not scale.

**Decision.** Each tool exports a `ToolManifest` object. A build-time registry harvests all manifests and generates: route entries, navigation entries, SEO metadata map, admin tool inventory, sitemap entries. Build-time codegen ensures zero runtime cost and type safety.

**Consequences.**
- ✅ Adding a tool = creating a folder with manifest + stage files; nothing else changes.
- ✅ Navigation, sitemap, SEO, and admin inventory never go stale.
- ✅ Foundation for Phase 4 plugin marketplace.
- ⚠️ Requires TypeScript build-time codegen.

**Alternatives Considered.**
- **Runtime registry service:** Rejected — adds latency; cold-start risk.
- **Manual registration:** Rejected — doesn't scale; goes stale.

**Future Review Trigger.** When Phase 4 marketplace begins, add ADRs for plugin signing and sandboxing.

**Cross References.** `02_SAD` AD-03, `05_ProjectStructure` AD-04, `11_FBRD` §Tool Manifest.

---

### ADR-028 — Browser-First by Default, Server-Side by Exception

- **Decision ID:** ADR-028
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-02, EC-07, EC-08
- **Decision Owner:** Chief Architect

**Context.** LOCK-02 mandates browser-side processing wherever technically feasible. The architecture must make the browser the default execution target and require explicit justification for server-side processing.

**Decision.** Every tool manifest declares `execution: 'browser' | 'server'`. The Tool Engine routes accordingly. A decision matrix in `02_SAD` §AD-04 classifies each tool type with rationale. Server-side tools require explicit consent UI disclosing that files are uploaded and deleted within 1 hour.

**Consequences.**
- ✅ ~90% of Phase 1 tools run without server compute cost.
- ✅ Privacy is a structural property.
- ⚠️ Server-side tools require explicit consent UI.

**Alternatives Considered.**
- **All server-side:** Rejected — violates LOCK-02; privacy and cost concerns.
- **Per-tool ad-hoc decisions:** Rejected — no consistency; engineers default to what's familiar.

**Future Review Trigger.** When a new tool type doesn't fit the matrix, add it via this ADR's amendment (new ADR).

**Cross References.** `02_SAD` AD-04, `04_TechStack` §8 (browser-side libraries).

---

### ADR-029 — Database Optional via Strict Layer Separation

- **Decision ID:** ADR-029
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-06, EC-05
- **Decision Owner:** Chief Architect

**Context.** LOCK-06 mandates that core tools function even if the database is down. This is non-trivial in a Next.js + Supabase architecture where auth, storage, and DB are typically deeply intertwined.

**Decision.** The Tool Engine (Application Layer) has ZERO direct dependency on Infrastructure. Tools interact with infrastructure only through optional side-channels: history persistence (best-effort), auth checks (guest mode fallback), analytics (queued in IndexedDB, flushed async).

**Consequences.**
- ✅ Tools always work; platform degrades gracefully.
- ✅ Database maintenance windows don't break user workflows.
- ⚠️ History/favorites may temporarily appear stale during outages.

**Alternatives Considered.**
- **DB-coupled with retry logic:** Rejected — adds latency; doesn't solve outage.
- **Read replicas for HA:** Rejected for Phase 1 — adds cost.

**Future Review Trigger.** If a tool category inherently requires server-side state, document exception in `02_SAD` §AD-04.

**Cross References.** `02_SAD` AD-05, `03_DDD` AD-03, `05_ProjectStructure` AD-07.

---

### ADR-030 — Edge-First Deployment with Regional Database

- **Decision ID:** ADR-030
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-02, EC-07
- **Decision Owner:** Chief Architect

**Context.** The platform serves a global audience. Vercel Edge Network provides low-latency static delivery; Supabase provides regional Postgres. The architecture must exploit Edge for content delivery without forcing all logic to edge runtime (which lacks many Node APIs).

**Decision.** Three execution runtimes: Edge Runtime (static pages, middleware, SEO metadata), Node.js Runtime (server-side tools, webhooks, admin actions), Browser Runtime (browser-first tools). Each used where appropriate.

**Consequences.**
- ✅ Tool landing pages load in <500ms globally.
- ✅ Server-side tools have full Node capability.
- ⚠️ Edge/Node boundary requires care; some libraries incompatible.

**Alternatives Considered.**
- **All-Node (no Edge):** Rejected — slower global performance.
- **All-Edge:** Rejected — Edge lacks Node APIs needed for some server-side tools.

**Future Review Trigger.** If Vercel removes Edge Runtime, re-evaluate deployment topology.

**Cross References.** `02_SAD` AD-06, `22_DeploymentGuide`.

---

### Part 4: Technical ADRs — Domain-Driven Design (`03_DDD`)

---

### ADR-031 — Six Bounded Contexts

- **Decision ID:** ADR-031
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04, EC-02
- **Decision Owner:** Chief Architect

**Context.** The platform serves distinct concerns: executing tools, managing users, publishing content, operating the platform, processing payments, and observing behavior. Mixing these concerns in a single domain model leads to ambiguity and tangled schemas.

**Decision.** Partition the system into six bounded contexts: Tools, Identity, Content, Platform Operations, Billing, Analytics. Each context owns its own ubiquitous language, schema, and aggregates. Cross-context data access via published API or domain events only.

**Consequences.**
- ✅ Each context has its own ubiquitous language.
- ✅ Each context owns its own schema; no shared mega-table.
- ⚠️ Cross-context features require explicit integration.

**Alternatives Considered.**
- **Single context with sub-folders:** Rejected — boundaries are conceptual, not just physical.
- **More contexts (e.g., separate Notifications):** Rejected for Phase 1 — over-engineering; defer to Phase 2+.

**Future Review Trigger.** When a new concern emerges that doesn't fit any context, propose a new context via DDD amendment.

**Cross References.** `03_DDD` AD-01, `05_ProjectStructure` AD-01, `14_DatabaseDesign`.

---

### ADR-032 — Tools Context is the Core Domain

- **Decision ID:** ADR-032
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-01, LOCK-03
- **Decision Owner:** Chief Architect

**Context.** The platform's identity (LOCK-01) is "browser-first productivity ecosystem." The Tools Context is what makes this true. Without designating it as core, architectural attention diffuses equally across all contexts.

**Decision.** Tools Context is designated the core domain. It receives the most architectural attention, the strictest invariants, and the most investment in design. Other contexts are supporting or generic subdomains using off-the-shelf solutions where possible.

**Consequences.**
- ✅ Architectural effort concentrated where it matters.
- ✅ Generic contexts use proven solutions (Supabase Auth, Stripe, etc.).

**Alternatives Considered.**
- **Equal investment across contexts:** Rejected — diffuses effort; core domain under-served.

**Future Review Trigger.** If the platform's identity shifts (per ADR-001 amendment), re-evaluate which context is core.

**Cross References.** `03_DDD` AD-02, `00_Project_Charter` §3 LOCK-01.

---

### ADR-033 — Database-Optional Requires Stateless Tools Context

- **Decision ID:** ADR-033
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-06, EC-05
- **Decision Owner:** Chief Architect

**Context.** LOCK-06 mandates that core tools function without the database. The Tools Context must therefore be inherently stateless — its aggregates must not require persistence to function.

**Decision.** The Tools Context's primary aggregate, Tool, is a stateless concept defined by its manifest (code) and inputs (provided by user). Execution produces outputs that are ephemeral unless explicitly persisted by the Identity Context (history) or Billing Context (cloud storage).

**Consequences.**
- ✅ Tools Context has zero DB dependency; LOCK-06 satisfied structurally.
- ✅ Tools can be developed and tested without DB setup.

**Alternatives Considered.**
- **Stateful Tools Context with DB-outage fallback:** Rejected — fallback is fragile; structural statelessness is robust.

**Future Review Trigger.** Permanent; structural.

**Cross References.** `03_DDD` AD-03, `02_SAD` AD-05, `05_ProjectStructure` AD-07.

---

### ADR-034 — Plugin-Ready via Manifest Aggregate

- **Decision ID:** ADR-034
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-05, LOCK-12
- **Decision Owner:** Chief Architect

**Context.** LOCK-05 mandates plugin-ready architecture. The Tools Context must expose a stable, versioned contract that third-party plugins can implement.

**Decision.** The ToolManifest is the aggregate root of the Tools Context. It is a self-contained, serializable description of a tool. Any code producing a valid ToolManifest can be registered as a tool — first-party or third-party. Manifest schema is public and versioned.

**Consequences.**
- ✅ Phase 4 plugin marketplace requires no architectural change.
- ✅ First-party and third-party tools are structurally identical.
- ⚠️ Manifest schema evolution requires discipline.

**Alternatives Considered.**
- **Plugin API (runtime registration):** Rejected — adds runtime complexity; build-time codegen is simpler.

**Future Review Trigger.** When Phase 4 begins, add ADRs for plugin signing, sandboxing, versioning.

**Cross References.** `03_DDD` AD-04, `11_FBRD` §Tool Manifest, `02_SAD` AD-03.

---

### ADR-035 — Context Integration via Domain Events

- **Decision ID:** ADR-035
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04
- **Decision Owner:** Chief Architect

**Context.** Bounded contexts must communicate (e.g., when a user completes a tool, Analytics needs to know; when a user upgrades, Billing needs to notify Identity). Direct context-to-context calls create coupling.

**Decision.** Contexts integrate via domain events. A context publishes an event when something notable happens; other contexts subscribe. Events are typed, versioned, and asynchronous.

**Consequences.**
- ✅ Contexts remain decoupled.
- ✅ Async by default; no context blocks another.
- ⚠️ Eventual consistency between contexts; UI must account for this.

**Alternatives Considered.**
- **Synchronous context-to-context calls:** Rejected — creates temporal coupling.
- **Shared database tables:** Rejected — violates bounded context ownership.

**Future Review Trigger.** If event volume becomes problematic, add event sourcing infrastructure (Phase 3+).

**Cross References.** `03_DDD` AD-05, `15_APIConvention`.

---

### Part 5: Technical ADRs — Tech Stack (`04_TechStack`)

---

### ADR-036 — Next.js 15+ App Router as the Unified Framework

- **Decision ID:** ADR-036
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-02, LOCK-05
- **Decision Owner:** Chief Architect

**Context.** The platform needs SSR/SSG for SEO (LOCK-08), Edge runtime for performance, API routes for server-side tools, and a component model for the Tool Engine UI. Using separate frameworks fragments the codebase.

**Decision.** Adopt Next.js 15+ with App Router as the single application framework. Provides Edge Runtime, Node.js Runtime, Server Components, API Routes, and file-based routing.

**Consequences.**
- ✅ One framework to learn; one deployment target.
- ✅ Edge + Node runtimes available without separate config.
- ⚠️ Next.js major upgrades require care.

**Alternatives Considered.**
- **Remix:** Rejected — smaller ecosystem; less Edge support.
- **Vite SPA + Express API:** Rejected — fragments deployment; loses SSR for SEO.
- **SvelteKit:** Rejected — team TypeScript/React expertise; ecosystem smaller.

**Future Review Trigger.** If Next.js stagnates or significantly breaks backwards compatibility, evaluate alternatives.

**Cross References.** `04_TechStack` AD-01, `22_DeploymentGuide`.

---

### ADR-037 — TypeScript Strict Mode End-to-End

- **Decision ID:** ADR-037
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** EC-08
- **Decision Owner:** Chief Architect

**Context.** The platform will scale to 1,000+ tools, each with its own manifest and stages. Without strict typing, runtime type errors scale linearly with tool count.

**Decision.** TypeScript 5+ with `strict: true`. No `any` types allowed (ESLint-enforced). Every IO boundary validated with Zod schemas producing typed outputs.

**Consequences.**
- ✅ Type errors caught at compile time.
- ✅ Refactoring across 1,000+ tools is feasible.
- ⚠️ Slightly more verbose code; justified.

**Alternatives Considered.**
- **JavaScript with JSDoc:** Rejected — less ergonomic; weaker tooling.
- **TypeScript without strict:** Rejected — defeats the purpose.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-02, `08_CodingStandards`.

---

### ADR-038 — Supabase for Identity, Database, and Storage

- **Decision ID:** ADR-038
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-06, EC-12
- **Decision Owner:** Chief Architect

**Context.** The platform needs Postgres, auth (OAuth + email), and file storage. Three separate services would triple integration cost.

**Decision.** Adopt Supabase (free tier) as the unified backend for Postgres database, Auth (email/password, OAuth, JWT sessions), and Storage (server-side tool uploads, media assets).

**Consequences.**
- ✅ One integration; one dashboard.
- ✅ Row-Level Security (RLS) at DB layer.
- ✅ Free tier covers Phase 1.
- ⚠️ Vendor lock-in for auth; mitigated by JWT standard.

**Alternatives Considered.**
- **Neon + Clerk + Cloudflare R2:** Rejected — three integrations; more operational overhead.
- **Firebase:** Rejected — NoSQL doesn't fit relational needs; vendor lock-in worse.
- **Self-hosted Postgres + Auth0:** Rejected — operational overhead; Phase 1 budget.

**Future Review Trigger.** If Supabase free tier becomes inadequate (Phase 2+) or pricing changes unfavorably, evaluate alternatives. Architecture is portable via Drizzle.

**Cross References.** `04_TechStack` AD-03, `14_DatabaseDesign`, `22_DeploymentGuide`.

---

### ADR-039 — Drizzle ORM for Type-Safe Database Access

- **Decision ID:** ADR-039
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04, EC-08
- **Decision Owner:** Chief Architect

**Context.** Raw SQL loses type safety. Heavy ORMs (Prisma, TypeORM) add runtime overhead and complex migration workflows. The platform needs type-safe DB access that works in Edge Runtime.

**Decision.** Adopt Drizzle ORM for all database access. Type-safe schema definitions, SQL-like query builder, Edge Runtime compatible, plain SQL migrations.

**Consequences.**
- ✅ Type safety from schema to query to result.
- ✅ Edge Runtime compatible.
- ✅ Migrations are version-controlled SQL.
- ⚠️ More verbose than Prisma; explicit query writing required.

**Alternatives Considered.**
- **Prisma:** Rejected — query engine doesn't work in Edge Runtime; heavier.
- **TypeORM:** Rejected — decorator-based; less type-safe; maintenance concerns.
- **Raw SQL with typed wrapper:** Rejected — reinvents Drizzle.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-04, `14_DatabaseDesign`.

---

### ADR-040 — shadcn/ui for UI Components

- **Decision ID:** ADR-040
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-10, EC-06, EC-10
- **Decision Owner:** Chief Architect

**Context.** Component libraries like MUI or Ant Design are heavy and opinionated. The platform needs a lightweight, accessible, customizable component system aligned with developer-first minimalism.

**Decision.** Adopt shadcn/ui — copy-into-your-codebase components built on Radix UI primitives and Tailwind CSS. Components are owned, not depended upon.

**Consequences.**
- ✅ No version lock-in; components live in our codebase.
- ✅ Built on Radix UI (accessibility-first).
- ✅ Tailwind-based; aligns with design tokens.
- ⚠️ Updates require manual re-sync; mitigated by CLI tool.

**Alternatives Considered.**
- **MUI:** Rejected — heavy; opinionated styling.
- **Ant Design:** Rejected — not aligned with developer-first aesthetic.
- **Radix UI directly:** Rejected — too low-level; would re-implement shadcn/ui.
- **Chakra UI:** Rejected — runtime CSS-in-JS overhead.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-05, `10_DesignSystem`, `12_ACD`.

---

### ADR-041 — Tailwind CSS for Styling

- **Decision ID:** ADR-041
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-10
- **Decision Owner:** Chief Architect

**Context.** CSS-in-JS adds runtime overhead. Plain CSS lacks utility-first productivity. The platform needs a styling system supporting design tokens without runtime cost.

**Decision.** Adopt Tailwind CSS 4+. Design tokens defined as CSS custom properties at the root, mapped to Tailwind theme extensions.

**Consequences.**
- ✅ Zero runtime CSS-in-JS overhead.
- ✅ Token-driven theming enables light/dark mode.
- ⚠️ Class names can get long; mitigated by component extraction.

**Alternatives Considered.**
- **Emotion / styled-components:** Rejected — runtime overhead.
- **CSS Modules:** Rejected — less ergonomic; no utility-first productivity.
- **Vanilla Extract:** Rejected — excellent but smaller ecosystem; team familiarity lower.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-06, `10_DesignSystem`.

---

### ADR-042 — Zod for Runtime Validation

- **Decision ID:** ADR-042
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** EC-08, EC-02
- **Decision Owner:** Chief Architect

**Context.** TypeScript types exist only at compile time. Runtime data (user input, API responses, file metadata) needs validation. Without it, type mismatches cause runtime errors.

**Decision.** Adopt Zod for all runtime validation. Every IO boundary validated with Zod schema. Zod schemas are the single source of truth; TypeScript types inferred from them.

**Consequences.**
- ✅ Single source of truth — no drift between types and validators.
- ✅ Tool manifests are runtime-verifiable.
- ⚠️ Small runtime cost; negligible for validation-heavy use cases.

**Alternatives Considered.**
- **Yup:** Rejected — less type-inference capability.
- **io-ts:** Rejected — less ergonomic API.
- **Joi:** Rejected — weaker TypeScript integration.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-07, `11_FBRD` §Tool Manifest, `15_APIConvention`.

---

### ADR-043 — React Hook Form + Zod for Forms

- **Decision ID:** ADR-043
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-03
- **Decision Owner:** Chief Architect

**Context.** Tool configuration forms (image resize dimensions, PDF merge order) need performant, type-safe form management. Controlled React state is too slow for complex forms.

**Decision.** Adopt React Hook Form integrated with Zod via `@hookform/resolvers/zod`. Uncontrolled by default; re-renders minimized.

**Consequences.**
- ✅ Performant forms with minimal re-renders.
- ✅ Type-safe form values via Zod schema inference.
- ✅ Works with shadcn/ui form components.

**Alternatives Considered.**
- **Formik:** Rejected — more re-renders; less performant.
- **Controlled state:** Rejected — performance issues with complex forms.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-08, `12_ACD` §Form Components.

---

### ADR-044 — Zustand for Client State

- **Decision ID:** ADR-044
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04
- **Decision Owner:** Chief Architect

**Context.** Some client state (theme, recent tools, in-progress tool state) doesn't belong in URL or server. Redux is overkill; React Context causes re-render storms.

**Decision.** Adopt Zustand for global client state. Stores are small, typed, and composable. Server state (history, favorites) handled separately by TanStack Query (Phase 2+).

**Consequences.**
- ✅ Minimal API; small bundle.
- ✅ No provider wrapper needed.
- ✅ Selectors prevent unnecessary re-renders.

**Alternatives Considered.**
- **Redux Toolkit:** Rejected — too much boilerplate for our needs.
- **Jotai:** Rejected — excellent but atomic model doesn't fit our state shape.
- **React Context:** Rejected — re-render storms for non-trivial state.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-09.

---

### ADR-045 — Vercel for Hosting and Edge Delivery

- **Decision ID:** ADR-045
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** EC-07, EC-12
- **Decision Owner:** Chief Architect

**Context.** The platform needs global CDN, Edge functions, serverless functions, and seamless Next.js integration. Separate providers for each would be operationally complex.

**Decision.** Adopt Vercel as the unified hosting platform. Free tier covers Phase 1 (100GB bandwidth, unlimited Edge requests, 100GB-hours serverless).

**Consequences.**
- ✅ Zero-config Next.js deployment.
- ✅ Edge Network included.
- ✅ Preview deployments per PR.
- ⚠️ Vendor lock-in for hosting config; mitigated by Next.js portability.

**Alternatives Considered.**
- **Netlify:** Rejected — weaker Next.js App Router support.
- **Cloudflare Pages:** Rejected — Next.js compatibility issues at time of decision.
- **Self-hosted on AWS:** Rejected — operational overhead; Phase 1 budget.

**Future Review Trigger.** If Vercel pricing changes unfavorably or free tier shrinks, evaluate self-hosting. Next.js is portable.

**Cross References.** `04_TechStack` AD-10, `22_DeploymentGuide`.

---

### ADR-046 — pnpm as Package Manager

- **Decision ID:** ADR-046
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04, EC-12
- **Decision Owner:** Chief Architect

**Context.** npm and yarn have inefficiencies in monorepo and large dependency trees. The platform will have many shared packages and tool modules.

**Decision.** Adopt pnpm as the package manager. Content-addressable store saves disk space and install time. Strict peer dependency enforcement prevents phantom deps.

**Consequences.**
- ✅ Faster installs, less disk usage.
- ✅ Strict peer dep enforcement prevents subtle bugs.
- ✅ First-class monorepo support via workspaces.
- ⚠️ Slightly different node_modules layout; rare compatibility issues.

**Alternatives Considered.**
- **npm:** Rejected — slower; no workspaces until recent versions.
- **yarn (classic):** Rejected — less efficient storage.
- **yarn (berry):** Rejected — PnP mode has compatibility issues with some tools.

**Future Review Trigger.** Permanent.

**Cross References.** `04_TechStack` AD-11, `05_ProjectStructure` AD-05.

---

### Part 6: Technical ADRs — Project Structure (`05_ProjectStructure`)

---

### ADR-047 — Feature-Based Architecture at Top Level

- **Decision ID:** ADR-047
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04, EC-03
- **Decision Owner:** Chief Architect

**Context.** Two common patterns: type-based (folders for `components/`, `hooks/`, `utils/`) and feature-based (folders for `tools/`, `auth/`, `admin/`). Type-based breaks down at scale because related files scatter across many folders.

**Decision.** Adopt feature-based architecture at the top level. Each bounded context is a top-level directory. Within each context, files organized by architectural layer.

**Consequences.**
- ✅ Each context is self-contained.
- ✅ Tool count scales linearly.
- ✅ Boundary enforcement is structural + tooling.
- ⚠️ Some shared utilities needed across contexts; mitigated by `/shared` and `/packages`.

**Alternatives Considered.**
- **Type-based:** Rejected — scatters related files at scale.
- **Hybrid (type within feature):** Rejected — adds complexity without benefit.

**Future Review Trigger.** Permanent.

**Cross References.** `05_ProjectStructure` AD-01, `03_DDD` AD-01.

---

### ADR-048 — Layered Folders Within Each Context

- **Decision ID:** ADR-048
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04
- **Decision Owner:** Chief Architect

**Context.** `02_SAD` AD-01 mandates four layers with strict dependency rules. The folder structure must make these layers visible and enforceable.

**Decision.** Within each bounded context directory, four subdirectories represent the layers: `presentation/`, `application/`, `domain/`, `infrastructure/`. Dependency direction enforced via ESLint `no-restricted-imports`.

**Consequences.**
- ✅ Layer boundaries visible in any IDE file tree.
- ✅ ESLint catches violations at lint time.
- ✅ Domain logic is fully testable without React or DB setup.
- ⚠️ Slightly more nesting than flat structure.

**Alternatives Considered.**
- **Flat structure with naming conventions:** Rejected — relies on discipline; not enforceable.
- **Single src/ folder with tags:** Rejected — less visible; harder to navigate.

**Future Review Trigger.** Permanent.

**Cross References.** `05_ProjectStructure` AD-02, `02_SAD` AD-01.

---

### ADR-049 — Tool Module Anatomy (One Folder Per Tool)

- **Decision ID:** ADR-049
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04, LOCK-05, LOCK-03, EC-04
- **Decision Owner:** Chief Architect

**Context.** LOCK-04 mandates tools are independent modules. LOCK-05 mandates plugin-ready architecture. The structure must make adding a tool a self-contained operation.

**Decision.** Each tool lives in `src/tools/[category]/[slug]/` and contains: `manifest.ts`, `stages/` (with stage files), `components/`, `hooks/`, `tests/`, `README.md` (optional), `index.ts`. Tests are colocated with implementation.

**Consequences.**
- ✅ Adding a tool = adding a folder; nothing else changes.
- ✅ Tool is fully isolated; deleting the folder removes the tool completely.
- ✅ Plugin-ready: third-party tools follow the same structure.
- ⚠️ Many small folders; mitigated by clear naming.

**Alternatives Considered.**
- **All tools in one folder:** Rejected — unmanageable at scale.
- **Tools spread across multiple folders (e.g., components separate):** Rejected — violates tool independence.

**Future Review Trigger.** Permanent.

**Cross References.** `05_ProjectStructure` AD-03, `11_FBRD` §Tool Manifest, `07_FolderStructure` §Tool Folder Template.

---

### ADR-050 — Tool Registry Pattern (Build-Time Codegen)

- **Decision ID:** ADR-050
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-05, LOCK-08
- **Decision Owner:** Chief Architect

**Context.** LOCK-05 mandates auto-discovery. Runtime registry lookups add latency. Build-time codegen produces static typed files that Edge can serve.

**Decision.** A build script walks `src/tools/**/manifest.ts`, imports each manifest, validates it against the schema, and emits typed registry files: `registry.ts`, `navigation.ts`, `sitemap.ts`, `seo-meta.ts`, `admin-inventory.ts`, `types.ts`. CI verifies generated files are committed and match manifests.

**Consequences.**
- ✅ Zero runtime cost for registry lookups.
- ✅ Type safety: malformed manifests fail the build.
- ✅ Auto-discovery: new tools appear in nav, sitemap, admin without manual wiring.
- ⚠️ Build time grows linearly; mitigations at >500 tools.

**Alternatives Considered.**
- **Runtime registry service:** Rejected — adds latency; cold-start risk.
- **Manual registration:** Rejected — doesn't scale; goes stale.

**Future Review Trigger.** At >500 tools, evaluate parallel codegen and incremental builds.

**Cross References.** `05_ProjectStructure` AD-04, `02_SAD` AD-03, `11_FBRD` §Tool Manifest.

---

### ADR-051 — Shared Code Split Between `/packages` and `/src/shared`

- **Decision ID:** ADR-051
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-04, EC-02
- **Decision Owner:** Chief Architect

**Context.** Some code is shared across bounded contexts. Where it lives affects reusability and dependency direction.

**Decision.** Two locations: `/packages/*` for published-style packages (fully self-contained, could be extracted to npm later — e.g., `tool-engine`, `ui`, `utils`, `types`). `/src/shared/*` for application-specific shared code that depends on `src/` structure (e.g., `lib`, `config`, `hooks`).

**Consequences.**
- ✅ `/packages` code is highly reusable.
- ✅ `/src/shared` keeps context-spanning app code organized.
- ⚠️ Discipline required to put the right code in the right place.

**Alternatives Considered.**
- **All shared code in `/packages`:** Rejected — application-specific code shouldn't pretend to be reusable.
- **All shared code in `/src/shared`:** Rejected — loses the "could be open-sourced" property of `/packages`.

**Future Review Trigger.** Permanent.

**Cross References.** `05_ProjectStructure` AD-05, `12_ACD`.

---

### ADR-052 — App Router Maps to Tool Registry

- **Decision ID:** ADR-052
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-05, LOCK-08
- **Decision Owner:** Chief Architect

**Context.** Next.js App Router uses file-based routing. With 1,000+ tools, having one route file per tool is unmanageable. But dynamic routes need to know which slugs are valid.

**Decision.** Use Next.js dynamic routes that resolve against the generated registry. One `[slug]/page.tsx` route handles all tools by looking up the manifest in the registry. SEO metadata generated from the manifest.

**Consequences.**
- ✅ One route file handles all tools; no route explosion.
- ✅ Sitemap, SEO, navigation all derived from registry.
- ✅ Static generation possible for known slugs.

**Alternatives Considered.**
- **One route file per tool:** Rejected — doesn't scale.
- **Custom routing layer:** Rejected — bypasses Next.js benefits.

**Future Review Trigger.** Permanent.

**Cross References.** `05_ProjectStructure` AD-06, `16_SEOSpecification`.

---

### ADR-053 — Database-Optional Layout

- **Decision ID:** ADR-053
- **Date:** 2026-06-28
- **Status:** Approved
- **Category:** Technical
- **Implements:** LOCK-06, EC-05
- **Decision Owner:** Chief Architect

**Context.** LOCK-06 mandates that core tools function without the database. The structure must make this obvious: the Tools Context directory must have no DB imports.

**Decision.** The `src/tools/` directory is structurally forbidden from importing anything from `infrastructure/` layers of any context. Enforced via ESLint `no-restricted-imports`. Tools that need to persist data do so via published interfaces (server actions in Identity Context), not direct DB calls.

**Consequences.**
- ✅ Structural enforcement of LOCK-06; cannot be violated by accident.
- ✅ Tools are testable without DB setup.
- ✅ If DB is down, tools still work.
- ⚠️ Slightly more indirection for persistence; justified.

**Alternatives Considered.**
- **Discipline-only enforcement:** Rejected — fails under deadline pressure.
- **Runtime check for DB imports:** Rejected — too late; lint-time is better.

**Future Review Trigger.** Permanent.

**Cross References.** `05_ProjectStructure` AD-07, `02_SAD` AD-05, `03_DDD` AD-03.

---

## 8. Standards

### 8.1 ADR Authoring Standards
- Every ADR follows the template in §5.
- Every ADR is dated and attributed to a Decision Owner.
- Every ADR lists at least one alternative considered.
- Every ADR lists both positive and negative consequences.

### 8.2 ADR Status Standards
- **Proposed:** Submitted for review; not yet authoritative.
- **Approved:** Active; in force.
- **Deprecated:** Still followed but slated for replacement; new code should follow the replacement.
- **Superseded by ADR-YYY:** Replaced by a newer ADR.
- **Rejected:** Considered but not adopted; kept for historical context.

### 8.3 ADR Citation Standards
- ADRs are cited as `ADR-XXX` (e.g., `ADR-025`).
- Citations in other documents link to this document's section for that ADR.
- Code comments citing an ADR use the format `// See ADR-025 for rationale.`

### 8.4 ADR Append-Only Standards
- Historical ADRs are never modified except for the `Status` field.
- Status updates reference the superseding ADR.
- New ADRs are appended at the end of their category section.
- ADR numbers are never reused.

## 9. Best Practices

### 9.1 When to Write an ADR
Write an ADR when:
- A decision affects multiple files, modules, or contexts.
- A decision is hard to reverse (architectural, schema, dependency).
- A decision has trade-offs that future engineers need to understand.
- A decision could be re-litigated without a recorded rationale.

Do NOT write an ADR for:
- Implementation details (variable names, function signatures).
- Dependency version bumps (tracked in `04_TechStack` revision history).
- Bug fixes.
- Refactors that don't change architecture.

### 9.2 When to Supersede an ADR
Supersede an ADR when:
- The context that motivated the decision has changed.
- A better alternative has emerged.
- The decision's negative consequences outweigh its benefits.

Process:
1. Write a new ADR proposing the change, with `Status: Proposed`.
2. Reference the superseded ADR in the new ADR's Context section.
3. After approval, update the superseded ADR's `Status` to `Superseded by ADR-YYY`.
4. Update all documents that reference the superseded ADR.

### 9.3 AI Consultation
Per LOCK-09 and EC-11, AI assistants MUST:
- Search this repository before proposing any architectural change.
- Cite relevant ADRs in any proposal that touches architecture.
- Ask before assuming, especially when no relevant ADR exists.

### 9.4 Code Review
Code reviewers MUST:
- Verify that architectural changes have a corresponding ADR.
- Reject PRs that introduce architectural changes without ADR precedent.
- Cite the ADR being followed in approval comments.

## 10. Future Scalability

### 10.1 Scaling to Hundreds of ADRs
- ADR index (§6) provides quick lookup.
- Categories keep related ADRs together.
- Search (Ctrl+F in any editor) finds ADRs by title or keyword.

### 10.2 ADR Tooling (Phase 2+)
- Consider ADR-specific tooling (e.g., `adr-tools` CLI) for scaffolding.
- Optional: ADR browser UI in admin panel for non-engineers.

### 10.3 ADR Audit (Quarterly)
- Chief Architect reviews all ADRs quarterly.
- Deprecated/superseded ADRs are marked clearly.
- ADRs whose Future Review Trigger has fired are evaluated for amendment.

### 10.4 Cross-Repository ADRs (Phase 4+)
- If the platform spawns multiple repos (e.g., plugin marketplace), each repo has its own ADR repository.
- Cross-repo ADRs reference each other by `RepoName/ADR-XXX`.

## 11. Dependencies

### 11.1 Document Dependencies
- Depends on `00_Project_Charter` §3 (Architectural Locks) and §4 (Engineering Constitution) — source of all governance ADRs.
- Depends on `02_SAD`, `03_DDD`, `04_TechStack`, `05_ProjectStructure` — source of all technical ADRs.
- Future technical documents (`11_FBRD` through `26_Backlog`) will add ADRs as they record architectural decisions.

### 11.2 Process Dependencies
- `20_DevelopmentGuideline` defines the PR workflow that requires ADR updates.
- `23_AI_Guideline` defines AI's responsibility to consult this repository.

### 11.3 Assumptions
- The ADR template and numbering scheme remain stable for the project lifetime.
- The team accepts the discipline of writing ADRs for architectural decisions.

## 12. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial ADR repository. Consolidated 12 Architectural Locks (ADR-001 through ADR-012), 12 Engineering Constitution articles (ADR-013 through ADR-024), and 29 technical ADs (ADR-025 through ADR-053) from Batches 1 and 2. Defined ADR template, lifecycle, and append-only policy. |

## 13. Cross References

- `00_Project_Charter` §3, §4 — Source of governance ADRs (ADR-001 through ADR-024).
- `01_BRD` — Business context motivating many ADRs.
- `02_SAD` §3 — Source of ADR-025 through ADR-030.
- `03_DDD` §3 — Source of ADR-031 through ADR-035.
- `04_TechStack` §3 — Source of ADR-036 through ADR-046.
- `05_ProjectStructure` §3 — Source of ADR-047 through ADR-053.
- `07_FolderStructure` — Implements ADR-047, ADR-048, ADR-049.
- `08_CodingStandards` — Implements ADR-013, ADR-014, ADR-015, ADR-019, ADR-020, ADR-021, ADR-022.
- `09_NamingConvention` — Implements ADR-048.
- `10_DesignSystem` — Implements ADR-010, ADR-018, ADR-022, ADR-040, ADR-041.
- `11_FBRD` — Implements ADR-003, ADR-005, ADR-012, ADR-026, ADR-027, ADR-034.
- `12_ACD` — Implements ADR-026, ADR-040, ADR-043, ADR-051.
- `13_UDS` — Implements ADR-010, ADR-018.
- `14_DatabaseDesign` — Implements ADR-029, ADR-031, ADR-033, ADR-038, ADR-039.
- `15_APIConvention` — Implements ADR-035, ADR-042.
- `16_SEOSpecification` — Implements ADR-008, ADR-027, ADR-050, ADR-052.
- `17_UserFlow` — Implements ADR-007, ADR-017.
- `18_RBAC` — Implements ADR-011, ADR-020.
- `19_AdminSpecification` — Implements ADR-011, ADR-012.
- `20_DevelopmentGuideline` — Implements ADR-013, ADR-023.
- `21_TestingStrategy` — Implements ADR-018, ADR-019, ADR-021.
- `22_DeploymentGuide` — Implements ADR-024, ADR-030, ADR-038, ADR-045.
- `23_AI_Guideline` — Implements ADR-009, ADR-023.
- `24_ZAI_Context` — Implements ADR-009, ADR-023.
- `25_Roadmap` — Phased plan referencing many ADRs.
- `26_Backlog` — Phase 1 tool list, each tool follows ADR-026, ADR-049.
