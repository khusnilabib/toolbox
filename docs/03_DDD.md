# 03 — Domain-Driven Design (DDD)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.3.0
> **Implements:** LOCK-04 (Modular Architecture), LOCK-05 (Plugin-Ready), LOCK-06 (Database Optional); EC-02 (One Source of Truth); PC-02 (Product Contract via ToolManifest aggregate); DGA-05 (Content Architecture), DGA-10 (Future Marketplace Readiness)

---

## 1. Purpose

This Domain-Driven Design document defines the conceptual model of [PROJECT_NAME]. It identifies the **bounded contexts** that partition the system, the **ubiquitous language** that ensures engineers and domain experts mean the same thing by the same word, the **aggregates** that enforce consistency boundaries, and the **context map** that defines how contexts relate to one another.

DDD is the conceptual counterpart to `02_SAD`. Where the SAD defines physical layers and runtime topology, DDD defines semantic boundaries — what belongs together conceptually, what must stay separate, and why. Without DDD, modular architecture (LOCK-04) degrades into "folders that happen to be separate" with no enforcement of conceptual boundaries. Engineers start reaching across contexts for convenience, and within 18 months the codebase is a tangled web of cross-references that resists change.

This document is the authoritative source for: what counts as a Tool, what counts as a User, what counts as Content, what counts as an Admin action, and how these concepts interact without violating each other's invariants. Every code module, every database table, every API endpoint must belong to exactly one bounded context, and that context's rules apply.

## 2. Scope

### 2.1 In Scope

- Definition of bounded contexts and their responsibilities.
- Ubiquitous language glossary (terms with precise, context-bound meanings).
- Aggregate boundaries and consistency rules.
- Context map (relationships, integration patterns).
- Domain events (cross-context communication).
- Mapping from bounded contexts to code modules and DB schemas.

### 2.2 Out of Scope

- Physical architecture (layers, runtimes) → `02_SAD`.
- Folder layout → `05_ProjectStructure`, `07_FolderStructure`.
- Database table schemas → `19_DatabaseDesign`.
- API endpoint definitions → `20_APIConvention`.
- UI flows between contexts → `22_UserFlow`.

## 3. Architectural Decisions

### AD-01 — Six Bounded Contexts

**Context.** The platform serves distinct concerns: executing tools, managing users, publishing content, operating the platform (admin), processing payments, and observing behavior. Mixing these concerns in a single domain model leads to ambiguity (e.g., does "User" mean the same thing in auth, in analytics, and in billing?) and to tangled schemas (a User table with 80 columns covering auth, profile, billing, analytics).

**Decision.** Partition the system into six bounded contexts:

1. **Tools Context** — the core domain. Tool definitions, manifests, execution lifecycle, tool categories, tool registry.
2. **Identity Context** — users, authentication, sessions, profiles, RBAC role assignment.
3. **Content Context** — articles, guides, SEO landing pages, media library, editorial workflow.
4. **Platform Operations Context** (Admin) — admin actions, feature flags, experiments, audit trail, system health.
5. **Billing Context** — subscriptions, plans, invoices, usage limits, payment provider integration.
6. **Analytics Context** — tool usage events, page views, funnels, aggregated metrics.

**Consequences.**
- ✅ Each context has its own ubiquitous language; "User" in Identity means auth identity, while in Billing it means "customer", while in Analytics it means "actor".
- ✅ Each context owns its own schema; no shared mega-table.
- ✅ Teams can specialize by context in Phase 3+.
- ⚠️ Cross-context features require explicit integration (domain events, published interfaces).

**Implements:** LOCK-04 (Modular Architecture at the conceptual level), EC-02 (One Source of Truth — each concept lives in exactly one context).

### AD-02 — Tools Context is the Core Domain

**Context.** The platform's identity (LOCK-01) is "browser-first productivity ecosystem." The Tools Context is what makes this true — without tools, there is no ecosystem. Other contexts exist to support tools (Identity: who can use them; Content: SEO that funnels to them; Billing: premium tool features; Analytics: how they're used; Platform Ops: operating them).

**Decision.** Tools Context is designated the **core domain**. It receives the most architectural attention, the strictest invariants, and the most investment in design. All other contexts are **supporting** or **generic** subdomains.

| Context | Domain Type | Investment Level |
|---------|------------|------------------|
| Tools | Core | High — competitive advantage lives here |
| Identity | Generic | Low — use Supabase Auth; minimal customization |
| Content | Supporting | Medium — SEO differentiator but well-understood patterns |
| Platform Ops | Supporting | Medium — admin is operationally critical |
| Billing | Generic | Low — use Stripe-standard patterns |
| Analytics | Generic | Low — use standard event-tracking patterns |

**Consequences.**
- ✅ Architectural effort concentrated where it matters.
- ✅ Generic contexts can use off-the-shelf solutions (Supabase Auth, Stripe, Posthog).
- ⚠️ Core domain must be hand-built; no shortcuts.

**Implements:** LOCK-01 (Platform Identity), LOCK-03 (Tool Engine).

### AD-03 — Database-Optional Requires Stateless Tools Context

**Context.** LOCK-06 mandates that core tools function without the database. The Tools Context must therefore be inherently stateless — its aggregates must not require persistence to function.

**Decision.** The Tools Context's primary aggregate, **Tool**, is a stateless concept. A Tool is defined by its manifest (code) and its inputs (provided by user). Execution produces outputs that are ephemeral unless explicitly persisted by the Identity Context (history) or Billing Context (cloud storage).

```
Tools Context (stateless)
├── Tool aggregate (manifest + lifecycle stages)
├── ToolCategory (taxonomy)
├── ToolExecution (ephemeral; not persisted)
└── ToolRegistry (build-time; not runtime DB)

Identity Context (stateful, DB-backed)
└── HistoryEntry (references Tool by slug, persists outputs)
```

**Consequences.**
- ✅ Tools Context has zero DB dependency; LOCK-06 satisfied structurally.
- ✅ Tools can be developed and tested without DB setup.
- ⚠️ History/favorites belong to Identity Context, not Tools — keeps boundaries clean.

**Implements:** LOCK-06 (Database Optional).

### AD-04 — Plugin-Ready via Manifest Aggregate

**Context.** LOCK-05 mandates plugin-ready architecture. The Tools Context must expose a stable, versioned contract that third-party plugins can implement.

**Decision.** The **ToolManifest** is the aggregate root of the Tools Context. It is a self-contained, serializable description of a tool. Any code that produces a valid ToolManifest can be registered as a tool — first-party or third-party.

```
ToolManifest (aggregate root)
├── Identity: slug, category, lifecycle status
├── Description: title, description, FAQ, related tools
├── Execution: 'browser' | 'server', stage implementations
├── Schemas: input ZodSchema, output ZodSchema
├── SEO: per-tool SEO config (LOCK-08)
└── Versioning: manifest_version, tool_version
```

The manifest schema is public (documented in `13_FBRD`) and versioned. Breaking changes require a manifest_version bump and a migration path for existing tools.

**Consequences.**
- ✅ Phase 4 plugin marketplace requires no architectural change — just a signing/sandboxing layer on top.
- ✅ First-party and third-party tools are structurally identical.
- ⚠️ Manifest schema evolution requires discipline; breaking changes are expensive.

**Implements:** LOCK-05 (Plugin-Ready), LOCK-12 (Feature Lifecycle — status lives in manifest).

### AD-05 — Context Integration via Domain Events

**Context.** Bounded contexts must communicate (e.g., when a user completes a tool, Analytics needs to know; when a user upgrades, Billing needs to notify Identity). Direct context-to-context calls create coupling.

**Decision.** Contexts integrate via **domain events**. A context publishes an event when something notable happens; other contexts subscribe. Events are typed, versioned, and asynchronous.

```
Tools Context publishes:
- ToolExecutionStarted { toolSlug, userId?, inputSummary, timestamp }
- ToolExecutionCompleted { toolSlug, userId?, outputSummary, durationMs }
- ToolExecutionFailed { toolSlug, userId?, errorKind, timestamp }

Identity Context publishes:
- UserRegistered { userId, email, source }
- UserLoggedIn { userId, method }
- HistoryEntrySaved { userId, toolSlug, entryId }

Billing Context publishes:
- SubscriptionStarted { userId, planId, startDate }
- SubscriptionCancelled { userId, planId, endDate }
- UsageLimitExceeded { userId, limitType, currentValue }

Content Context publishes:
- ArticlePublished { articleId, slug, category }
- ArticleUpdated { articleId, slug }

Platform Ops Context publishes:
- FeatureFlagToggled { flagKey, newValue, changedBy }
- ToolStatusChanged { toolSlug, oldStatus, newStatus, changedBy }
```

**Consequences.**
- ✅ Contexts remain decoupled; subscribers can be added/removed without publishers changing.
- ✅ Async by default; no context blocks another.
- ⚠️ Eventual consistency between contexts; UI must account for this.
- ⚠️ Event schema evolution requires versioning strategy.

**Implements:** LOCK-04 (modularity at integration level).

## 4. Design Principles

### P1 — One Concept, One Context
Every domain concept belongs to exactly one bounded context. "User" exists in Identity; Billing has "Customer" (a role played by a User); Analytics has "Actor" (an anonymous or identified event source). This prevents the "god table" anti-pattern. *Implements EC-02 (One Source of Truth).*

### P2 — Contexts Don't Share Tables
Each context owns its own database tables (or Supabase schema). Cross-context data access is via published API or domain event, never via direct table join. This enforces context boundaries at the data layer.

### P3 — Aggregates Enforce Invariants
Every aggregate has invariants that the aggregate root enforces on every mutation. External code cannot bypass these invariants by directly modifying fields. This keeps the domain model honest.

### P4 — Ubiquitous Language is Binding
Terms defined in the glossary (§6) have one meaning in their context. Code MUST use these terms; PRs that introduce synonyms are rejected. This prevents the "synonym drift" that makes large codebases incomprehensible.

### P5 — Tools Context is Stateless
The Tools Context MUST NOT depend on persistence to function. This is structural enforcement of LOCK-06, not a runtime check.

### P6 — Manifest is the Contract
The ToolManifest is the only contract between a tool and the platform. Anything not in the manifest is not part of the platform's understanding of the tool.

## 5. Bounded Contexts (Detailed)

### 5.1 Tools Context (Core Domain)

**Responsibility.** Define, register, and execute tools.

**Aggregates:**
- **Tool** (aggregate root) — defined by ToolManifest; stateless.
- **ToolCategory** — taxonomy node; categories can have subcategories.
- **ToolExecution** — ephemeral record of one run; not persisted by Tools Context (Identity may persist a reference).

**Invariants:**
- A Tool MUST have a unique slug within its category.
- A Tool MUST declare exactly one execution mode ('browser' | 'server').
- A Tool MUST implement all required Tool Engine stages (LOCK-03).
- A Tool's lifecycle status transitions follow LOCK-12 (Concept → Planned → ... → Archived).

**Owns:** `tools` (registry, not runtime table), `tool_categories`.

### 5.2 Identity Context

**Responsibility.** Authenticate users, manage profiles, assign roles, persist user-owned data (history, favorites).

**Aggregates:**
- **User** (aggregate root) — auth identity, profile, role assignments.
- **Session** — active auth session; scoped to device.
- **HistoryEntry** — record of a tool execution saved by a user; references Tool by slug (not FK to Tools Context).
- **Favorite** — bookmarked tool by user.

**Invariants:**
- A User has exactly one role at a time (per `23_RBAC`).
- HistoryEntries are immutable once created; deleted via soft-delete.
- Favorites are unique per (userId, toolSlug).

**Owns:** `users`, `sessions`, `history_entries`, `favorites`.

**Note:** Identity Context gracefully degrades per LOCK-06 — if its DB is unavailable, Tools Context still functions; users are treated as guests.

### 5.3 Content Context

**Responsibility.** Author, edit, publish, and serve articles, guides, and SEO landing pages.

**Aggregates:**
- **Article** (aggregate root) — title, body, slug, category, SEO metadata, publish status.
- **MediaAsset** — image, video, or document used in articles or tool pages.
- **TaxonomyTerm** — tag or category applied to articles for navigation/SEO.

**Invariants:**
- Article slugs are unique globally.
- Articles cannot be published without SEO metadata (LOCK-08).
- MediaAssets are referenced by URL; deletion is soft with orphan check.

**Owns:** `articles`, `media_assets`, `taxonomy_terms`, `article_taxonomy`.

### 5.4 Platform Operations Context (Admin)

**Responsibility.** Operate the platform: feature flags, experiments, audit trail, system health, ad management.

**Aggregates:**
- **FeatureFlag** (aggregate root) — key, enabled state, targeting rules, rollout percentage.
- **Experiment** — A/B test definition with variants and traffic allocation.
- **AuditEntry** — immutable record of an admin action.
- **SystemHealthCheck** — latest status of each infrastructure component.
- **Advertisement** — ad placement definition with targeting.

**Invariants:**
- AuditEntries are append-only; never edited or deleted.
- FeatureFlag changes are audited.
- Experiments cannot overlap on the same audience segment without explicit conflict resolution.

**Owns:** `feature_flags`, `experiments`, `audit_entries`, `system_health_checks`, `advertisements`.

### 5.5 Billing Context

**Responsibility.** Manage subscriptions, plans, invoices, usage tracking against limits.

**Aggregates:**
- **Subscription** (aggregate root) — userId, planId, status, current period, renewal date.
- **Plan** — defined tier (free, premium, enterprise) with limits and price.
- **Invoice** — billing record from payment provider.
- **UsageRecord** — monthly counter per user per limit type (tool_uses, ai_calls, storage_bytes).

**Invariants:**
- A User has at most one active Subscription.
- UsageRecords reset monthly; rollover not supported in Phase 1.
- Plan changes are pro-rated per Stripe-standard logic.

**Owns:** `subscriptions`, `plans`, `invoices`, `usage_records`.

**Note:** Billing Context is Phase 2+. Phase 1 has a single implicit "free" plan; no billing tables needed.

### 5.6 Analytics Context

**Responsibility.** Capture, aggregate, and report on user behavior and tool performance.

**Aggregates:**
- **Event** (aggregate root) — raw event record (page_view, tool_started, tool_completed, etc.).
- **DailyAggregate** — pre-aggregated metric per (date, toolSlug, eventType).
- **Funnel** — defined sequence of events for conversion tracking.

**Invariants:**
- Events are immutable once ingested.
- Aggregates are computed nightly from raw events; raw events retained for 90 days, aggregates indefinitely.
- Personally identifiable information in events is minimized (user ID only, no email/IP).

**Owns:** `events`, `daily_aggregates`, `funnels`.

**Note:** Analytics Context is the consumer of domain events from all other contexts. It does not publish events; it only subscribes.

## 6. Ubiquitous Language Glossary

Terms below have ONE meaning within their context. When a term is used in a different context, it is a different concept and SHOULD have a different name. Where the same word is unavoidable (e.g., "user"), the context qualifier makes the meaning unambiguous.

### Tools Context

| Term | Definition |
|------|------------|
| **Tool** | A discrete utility that follows the Tool Engine lifecycle (LOCK-03). Identified by slug within a category. Stateless. |
| **ToolManifest** | The aggregate root describing a Tool. Self-contained, serializable. Defined in `13_FBRD`. |
| **ToolCategory** | A taxonomy node grouping related Tools (e.g., "image", "pdf"). |
| **ToolExecution** | One run of a Tool from Input to Download. Ephemeral; not persisted by Tools Context. |
| **ToolRegistry** | The build-time-generated map of all ToolManifests. Not a runtime DB table. |
| **Stage** | One step in the Tool Engine lifecycle (Input, Validation, Processing, Preview, Download, History, Share). |
| **Browser Tool** | A Tool whose Processing stage runs in the user's browser (LOCK-02). |
| **Server Tool** | A Tool whose Processing stage runs on the server. Requires explicit user consent. |

### Identity Context

| Term | Definition |
|------|------------|
| **User** | An authenticated identity. Has exactly one role. May be guest (null User). |
| **Session** | An active authentication token scoped to a device. Expires or is revoked. |
| **Role** | A label (guest, user, premium, editor, admin, super_admin) granting permissions per `23_RBAC`. |
| **HistoryEntry** | A record of a ToolExecution saved by a User. References Tool by slug. |
| **Favorite** | A User's bookmark of a Tool. |
| **Guest** | An unauthenticated visitor. Treated as null User; tools still function (LOCK-06, LOCK-07). |

### Content Context

| Term | Definition |
|------|------------|
| **Article** | An editorial piece (guide, list, comparison) published for SEO and user education. |
| **MediaAsset** | An image, video, or document used in Articles or Tool pages. Stored in Supabase Storage. |
| **TaxonomyTerm** | A tag or category applied to Articles for navigation and SEO. |
| **PublishStatus** | One of: draft, in_review, scheduled, published, archived. |

### Platform Operations Context

| Term | Definition |
|------|------------|
| **FeatureFlag** | A toggle controlling availability of a feature for a segment of users. |
| **Experiment** | An A/B test with variants and traffic allocation. |
| **AuditEntry** | An immutable record of an admin action (who, what, when, before, after). |
| **SystemHealthCheck** | Latest status of an infrastructure component (up, degraded, down). |
| **Advertisement** | A defined ad placement with targeting rules and active/inactive state. |
| **FeatureLifecycle** | The status of a Tool or feature: Concept → Planned → Design → Development → Testing → Beta → Stable → Deprecated → Archived (LOCK-12). |

### Billing Context

| Term | Definition |
|------|------------|
| **Customer** | A User in their billing capacity. Same person, different aggregate. |
| **Subscription** | A User's active plan with start/end dates and renewal terms. |
| **Plan** | A defined tier (free, premium, enterprise) with limits and price. |
| **Invoice** | A billing record from the payment provider (Stripe). |
| **UsageRecord** | A monthly counter tracking a User's consumption against Plan limits. |

### Analytics Context

| Term | Definition |
|------|------------|
| **Actor** | The source of an event. May be a User (if authenticated) or an anonymous visitor. |
| **Event** | A raw record of user behavior (page_view, tool_started, tool_completed, etc.). |
| **DailyAggregate** | A pre-computed metric per (date, toolSlug, eventType). |
| **Funnel** | A defined sequence of Events for conversion analysis. |
| **Session** (Analytics) | A browsing session, distinct from Identity Context's Session. Identified by cookie, not auth token. |

## 7. Context Map

The context map defines how contexts relate. Relationships follow standard DDD patterns (Konvers, Vernon).

```
                      ┌─────────────────┐
                      │  Tools (Core)   │
                      │  [stateless]    │
                      └────────┬────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
   ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
   │    Identity     │ │   Content    │ │   Billing    │
   │  [customer-sup.]│ │ [supporting] │ │  [generic]   │
   └────────┬────────┘ └──────┬───────┘ └──────┬───────┘
            │                 │                │
            │    ┌────────────┘                │
            │    │                             │
            ▼    ▼                             ▼
        ┌─────────────────┐         ┌──────────────────┐
        │   Analytics     │         │  Platform Ops    │
        │   [generic]     │         │  [supporting]    │
        │  (event sink)   │         │  [admin, audit]  │
        └─────────────────┘         └──────────────────┘
```

### Relationship Patterns

| From → To | Pattern | Description |
|-----------|---------|-------------|
| Identity → Tools | Customer/Supplier | Identity supplies User context to Tools; Tools defines what it needs (userId or null). |
| Billing → Identity | Conformist | Billing conforms to Identity's User concept; doesn't redefine. |
| Content → Tools | Customer/Supplier | Content articles reference Tools by slug; Tools publishes slug list. |
| Analytics → All | Conformist (event subscriber) | Analytics conforms to event schemas published by other contexts. |
| Platform Ops → All | Shared Kernel (via feature flags) | Feature flags affect all contexts; flag definitions owned by Platform Ops. |
| Platform Ops → Tools | Customer/Supplier | Platform Ops can change Tool lifecycle status; Tools publishes status change events. |
| Billing → Tools | Customer/Supplier | Billing checks Tool execution limits; Tools publishes execution events. |

### Anti-Corruption Layers

Where a context integrates with an external system, an Anti-Corruption Layer (ACL) translates external concepts to internal ones:

- **Identity ACL:** Wraps Supabase Auth; translates Supabase user records to Identity Context's User aggregate.
- **Billing ACL:** Wraps Stripe; translates Stripe customer/subscription to Billing Context aggregates.
- **Analytics ACL:** Wraps external analytics provider (if used in Phase 2+); translates provider events to Analytics Context Events.

ACLs prevent external schema changes from corrupting internal domain models.

## 8. Aggregate Consistency Rules

### 8.1 Transaction Boundaries
- A single transaction modifies exactly ONE aggregate.
- Cross-aggregate consistency is achieved via domain events, eventually.
- No transaction spans multiple bounded contexts.

### 8.2 Aggregate Size
- Aggregates are kept small. A Tool is its manifest. A User is its profile + role. A HistoryEntry is a single record.
- Large nested structures (e.g., User with all their HistoryEntries) are modeled as separate aggregates with references, not as one big aggregate.

### 8.3 Reference Patterns
- Aggregates reference other aggregates by ID (slug, userId, articleId), never by direct object reference.
- Cross-context references use the foreign context's public identifier (e.g., HistoryEntry references `toolSlug`, not a Tools Context internal ID).

## 9. Standards

### 9.1 Context Ownership Standards
- Every code module MUST belong to exactly one bounded context (declared in module header comment).
- Every database table MUST belong to exactly one context (declared in migration header).
- Cross-context imports are flagged in code review and require explicit justification.

### 9.2 Domain Event Standards
- Every domain event MUST be typed (TypeScript interface) and versioned (`event_version: 1`).
- Events MUST be idempotent (subscribers can safely receive duplicates).
- Events MUST NOT contain PII beyond userId (no emails, no file contents).
- Event payloads MUST be small (<10KB); large data referenced by ID.

### 9.3 Schema Ownership Standards
- Each context owns a Postgres schema (e.g., `tools`, `identity`, `content`, `ops`, `billing`, `analytics`).
- No cross-schema foreign keys. References are by string ID.
- Migrations are scoped per context; no migration touches another context's schema.

## 10. Best Practices

### 10.1 When Adding a New Concept
1. Identify which bounded context it belongs to. If it doesn't fit any, you may need a new context (rare; requires Chief Architect approval).
2. Add the term to the ubiquitous language glossary (§6).
3. Define the aggregate it belongs to and the invariants it must enforce.
4. Document any domain events it publishes or subscribes to.

### 10.2 When Two Contexts Need to Share Data
- **Default:** publish a domain event from the owner; subscriber reacts.
- **Synchronous read needed:** owner exposes a published read API; subscriber calls it. Never read owner's tables directly.
- **Synchronous write needed:** this is a smell. Re-architect so writes are local to the owning context, triggered by event.

### 10.3 When Renaming a Domain Concept
- Update the glossary first.
- Update all code that uses the term.
- Reject PRs that introduce synonyms for the renamed concept.
- Add a deprecation note in the old term's location pointing to the new term.

### 10.4 When Modeling a New Tool
- The tool's domain concept is always a **Tool** (an aggregate in Tools Context).
- The tool's execution logic belongs in the Tool's Processing stage, not in a separate domain.
- The tool does NOT own user data; history of tool use belongs to Identity Context.

## 11. Future Scalability

### 11.1 Adding New Bounded Contexts
Phase 3+ may introduce:
- **Collaboration Context** — shared workspaces, team folders.
- **Marketplace Context** — third-party plugin catalog, reviews, transactions.
- **API Context** — public API keys, rate limits, usage billing for external API consumers.

Adding a context requires: (a) Chief Architect approval, (b) DDD amendment, (c) schema namespace allocation, (d) context map update.

### 11.2 Context Splitting
If a context grows too large (e.g., Identity grows to include team management, organization management), split it. Split criteria: >15 aggregates, >20 tables, or team ownership boundary.

### 11.3 Event Schema Evolution
- Events are versioned (`event_version` field).
- Subscribers handle all versions they care about; unknown versions are logged and skipped (not crashed).
- Breaking changes (field removal, semantic change) require a new event name (e.g., `ToolExecutionStarted` → `ToolExecutionStartedV2`).

### 11.4 Multi-Tenancy (Phase 3+)
- Each context's schema gains a `tenant_id` column.
- Aggregate roots enforce tenant isolation in queries.
- Platform Ops Context manages tenant administration.

## 12. Dependencies

### 12.1 Document Dependencies
- Depends on `00_Project_Charter` §3 (Architectural Locks) and §4 (Engineering Constitution) — LOCK-04, LOCK-05, LOCK-06 shape context boundaries; EC-02 enforces one source of truth.
- Depends on `02_SAD` — physical architecture that hosts the bounded contexts.
- `05_ProjectStructure` — maps bounded contexts to folder structure.
- `06_ArchitectureDecisionRecords` — records AD-01 through AD-05 as ADRs.
- `11_ProductConstitution` — expands PC-02 (Product Contract) which DDD's Tools Context implements.
- `12_ToolManifestSpecification` — defines ToolManifest aggregate (referenced by AD-034).
- `13_FBRD` — defines ToolManifest aggregate (Tools Context root).
- `19_DatabaseDesign` — implements each context's schema.
- `20_APIConvention` — defines how contexts expose published APIs.
- `23_RBAC` — defines Role aggregate in Identity Context.
- `24_AdminSpecification` — operates Platform Ops Context.

### 12.2 External Dependencies
- Supabase Postgres — provides schema isolation per context.
- No external DDD framework; patterns implemented in plain TypeScript.

### 12.3 Assumptions
- Six contexts remain stable through Phase 2. Phase 3+ may add 1-3 more.
- Context boundaries align with team boundaries as team grows (Conway's Law applied intentionally).

## 13. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial DDD. Defined 6 bounded contexts, ubiquitous language glossary, context map, aggregate consistency rules. |
| 1.1.0 | 2026-06-28 | Chief Architect | Linked bounded context design to EC-02 (One Source of Truth). Renumbered cross-references to reflect insertion of `06_ArchitectureDecisionRecords` (docs 06-25 shifted to 07-26). |
| 1.2.0 | 2026-06-28 | Chief Architect | Linked ToolManifest aggregate to PC-02 (Product Contract). Renumbered cross-references to reflect insertion of `11_ProductConstitution` and `12_ToolManifestSpecification` (docs 11-26 shifted to 13-28). |
| 1.3.0 | 2026-06-28 | Chief Architect | Linked DDD to DGA-05 (Content Architecture) and DGA-10 (Future Marketplace Readiness). Renumbered cross-references to reflect insertion of `16_EventSchemaSpecification`, `17_AnalyticsArchitecture`, `18_SearchArchitecture` (docs 16-28 shifted to 19-31). |

## 14. Cross References

- `00_Project_Charter` §3, §4, §5, §6 — Source of LOCKs, ECs, PCs, and DGAs implemented by this document.
- `02_SAD` — Physical architecture hosting the bounded contexts.
- `04_TechStack` — Technologies used to implement domain events and ACLs.
- `05_ProjectStructure` — Folder layout mapping to bounded contexts.
- `06_ArchitectureDecisionRecords` — Permanent record of DDD architectural decisions.
- `11_ProductConstitution` — Expands PC-02 which DDD implements.
- `12_ToolManifestSpecification` — ToolManifest aggregate (Tools Context root).
- `16_EventSchemaSpecification` — Event schema referenced by Analytics Context.
- `17_AnalyticsArchitecture` — Analytics Context implementation patterns.
- `07_FolderStructure` — Granular file conventions per context.
- `13_FBRD` — ToolManifest aggregate (Tools Context root).
- `14_ACD` — Tool Engine component (implementation of Tools Context aggregate).
- `19_DatabaseDesign` — Schema per context.
- `20_APIConvention` — Published APIs between contexts.
- `21_SEOSpecification` — How Content Context supports SEO.
- `22_UserFlow` — How user journeys cross context boundaries.
- `23_RBAC` — Role aggregate in Identity Context.
- `24_AdminSpecification` — Platform Ops Context operation.
- `28_AI_Guideline` — Constrains AI's modification of domain model (LOCK-09, EC-11).
