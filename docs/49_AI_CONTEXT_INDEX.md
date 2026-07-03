# 49 — AI Context Index

> **Purpose:** Fast navigation index. For every document: purpose, keywords, dependencies, related docs, typical usage.
> **Last Updated:** 2026-06-28 · **Revision:** 1.0.0

---

## How to Use

When AI needs information on a topic, look up the keyword in this index. The index points to the right document. Load only what's needed.

---

## Document Index

### 00_Project_Charter
- **Purpose:** Mission, scope, all 6 governance tiers (54 articles).
- **Keywords:** charter, locks, ECs, PCs, DGAs, POCs, governance, identity, vision.
- **Dependencies:** None (root document).
- **Related:** 01_BRD, 06_ADR, 42_AI_MASTER_CONTEXT.
- **Usage:** When checking governance authority; when a decision conflicts with governance.

### 01_BRD
- **Purpose:** Business goals, target market, KPIs, monetization.
- **Keywords:** business, KPIs, MAU, monetization, ads, premium, enterprise, roadmap.
- **Dependencies:** 00_Project_Charter.
- **Related:** 36_ProjectBootstrapRoadmap, 37_MVPImplementationPlan.
- **Usage:** When making business decisions; when prioritizing features.

### 02_SAD
- **Purpose:** System architecture, layers, Tool Engine, deployment topology.
- **Keywords:** architecture, layers, Tool Engine, Edge, serverless, browser-first, graceful degradation.
- **Dependencies:** 00_Project_Charter, 03_DDD.
- **Related:** 04_TechStack, 05_ProjectStructure, 14_ACD.
- **Usage:** When designing system structure; when making architectural decisions.

### 03_DDD
- **Purpose:** Bounded contexts, ubiquitous language, aggregates, domain events.
- **Keywords:** DDD, bounded context, Tools, Identity, Content, Platform Ops, Billing, Analytics, aggregate, domain event.
- **Dependencies:** 02_SAD.
- **Related:** 19_DatabaseDesign, 05_ProjectStructure.
- **Usage:** When defining domain boundaries; when adding new contexts.

### 04_TechStack
- **Purpose:** Technology choices with rationale and upgrade paths.
- **Keywords:** Next.js, TypeScript, Tailwind, shadcn/ui, Supabase, Drizzle, Vercel, pnpm, Zod, free tier.
- **Dependencies:** 02_SAD.
- **Related:** 08_CodingStandards, 32_DeploymentGuide.
- **Usage:** When choosing technologies; when adding dependencies; when planning upgrades.

### 05_ProjectStructure
- **Purpose:** High-level layout, module boundaries, registry pattern.
- **Keywords:** folder structure, feature-based, layers, tool folder, registry, codegen, shared code.
- **Dependencies:** 02_SAD, 03_DDD, 04_TechStack.
- **Related:** 07_FolderStructure, 12_ToolManifestSpecification.
- **Usage:** When creating new modules; when understanding where code belongs.

### 06_ArchitectureDecisionRecords
- **Purpose:** Permanent history of all architectural decisions (83 ADRs).
- **Keywords:** ADR, decisions, append-only, governance, LOCK, EC, PC, DGA, POC, technical.
- **Dependencies:** All governance docs.
- **Related:** 00_Project_Charter, 43_AI_IMPLEMENTATION_RULES.
- **Usage:** BEFORE any architectural change — search for precedent. When citing decisions.

### 07_FolderStructure
- **Purpose:** Granular file/folder naming conventions.
- **Keywords:** file naming, kebab-case, PascalCase, tool folder template, colocated tests.
- **Dependencies:** 05_ProjectStructure.
- **Related:** 09_NamingConvention, 45_AI_TOOL_TEMPLATE.
- **Usage:** When creating files; when naming components.

### 08_CodingStandards
- **Purpose:** TypeScript strict rules, code style, review checklist, performance budget, security rules.
- **Keywords:** TypeScript, strict, no any, Zod, ESLint, file size, performance budget, security, code review.
- **Dependencies:** 04_TechStack.
- **Related:** 31_TestingStrategy, 30_DevelopmentGuideline.
- **Usage:** When writing code; when reviewing PRs; when checking performance/security.

### 09_NamingConvention
- **Purpose:** Naming rules for files, components, variables, APIs, DB tables.
- **Keywords:** naming, camelCase, PascalCase, kebab-case, snake_case, slugs, env vars.
- **Dependencies:** 07_FolderStructure.
- **Related:** 07_FolderStructure, 19_DatabaseDesign.
- **Usage:** When naming anything; when creating DB tables.

### 10_DesignSystem
- **Purpose:** Design tokens, components, themes (light/dark), accessibility standards.
- **Keywords:** design tokens, colors, typography, spacing, dark mode, WCAG, shadcn/ui, Tailwind.
- **Dependencies:** 04_TechStack.
- **Related:** 14_ACD, 15_UDS.
- **Usage:** When building UI; when theming; when checking accessibility.

### 11_ProductConstitution
- **Purpose:** Binding rules for how every tool behaves as a product (PC-01 through PC-10 expanded).
- **Keywords:** product, one problem, product contract, completion standard, quality gates, UX consistency, monetization, analytics, errors, discoverability.
- **Dependencies:** 00_Project_Charter §5.
- **Related:** 12_ToolManifestSpecification, 13_FBRD.
- **Usage:** When designing tool behavior; when promoting to Stable.

### 12_ToolManifestSpecification
- **Purpose:** Canonical schema every tool must implement.
- **Keywords:** manifest, schema, Zod, slug, category, lifecycle, stages, SEO, analytics, limits, plugin.
- **Dependencies:** 11_ProductConstitution, 02_SAD.
- **Related:** 45_AI_TOOL_TEMPLATE, 13_FBRD.
- **Usage:** When creating a tool; when validating manifest; when extending schema.

### 13_FBRD
- **Purpose:** Per-feature requirement template and lifecycle transitions.
- **Keywords:** FBRD, feature requirements, product contract, lifecycle, quality gates.
- **Dependencies:** 12_ToolManifestSpecification.
- **Related:** 11_ProductConstitution, 45_AI_TOOL_TEMPLATE.
- **Usage:** Before creating any tool; when promoting lifecycle.

### 14_ACD
- **Purpose:** Reusable components catalog (Tool Engine, ToolLayout, ErrorDisplay, etc.).
- **Keywords:** components, ToolEngine, ToolLayout, FileDropzone, ErrorDisplay, SuccessToast, SearchInput.
- **Dependencies:** 10_DesignSystem, 12_ToolManifestSpecification.
- **Related:** 15_UDS, 45_AI_TOOL_TEMPLATE.
- **Usage:** When building UI; when looking for existing components (EC-03).

### 15_UDS
- **Purpose:** User flows, interaction patterns, accessibility, state designs.
- **Keywords:** UX, user flow, guest, registration, premium, states, empty, loading, error, success, mobile, accessibility.
- **Dependencies:** 10_DesignSystem, 14_ACD.
- **Related:** 22_UserFlow, 11_ProductConstitution.
- **Usage:** When designing UX; when implementing states; when testing accessibility.

### 16_EventSchemaSpecification
- **Purpose:** Canonical analytics event schema (vendor-neutral).
- **Keywords:** events, analytics, schema, Zod, tool_viewed, standard events, custom events, PII.
- **Dependencies:** 17_AnalyticsArchitecture.
- **Related:** 17_AnalyticsArchitecture, 12_ToolManifestSpecification.
- **Usage:** When implementing analytics; when emitting events.

### 17_AnalyticsArchitecture
- **Purpose:** Analytics pipeline, adapter pattern, growth metrics.
- **Keywords:** analytics, adapter, GA4, PostHog, Plausible, event queue, consent, growth metrics.
- **Dependencies:** 16_EventSchemaSpecification.
- **Related:** 16_EventSchemaSpecification, 18_SearchArchitecture.
- **Usage:** When configuring analytics; when computing metrics.

### 18_SearchArchitecture
- **Purpose:** Search index generation, Pagefind, search modes.
- **Keywords:** search, Pagefind, instant search, fuzzy, synonyms, index, manifest-driven.
- **Dependencies:** 12_ToolManifestSpecification, 05_ProjectStructure.
- **Related:** 21_SEOSpecification, 17_AnalyticsArchitecture.
- **Usage:** When implementing search; when adding search modes.

### 19_DatabaseDesign
- **Purpose:** Schema per context, RLS, migrations, marketplace prep.
- **Keywords:** database, schema, Drizzle, RLS, migrations, Identity, Content, Platform Ops, Analytics, audit.
- **Dependencies:** 03_DDD, 04_TechStack.
- **Related:** 23_RBAC, 20_APIConvention.
- **Usage:** When creating DB tables; when writing migrations; when setting RLS.

### 20_APIConvention
- **Purpose:** REST conventions, versioning, error format, deprecation, server actions.
- **Keywords:** API, REST, versioned, Zod, JWT, rate limiting, error format, server actions, deprecation.
- **Dependencies:** 04_TechStack, 23_RBAC.
- **Related:** 19_DatabaseDesign, 05_ProjectStructure.
- **Usage:** When creating API routes; when writing server actions.

### 21_SEOSpecification
- **Purpose:** Manifest-driven SEO, JSON-LD, sitemaps, internal linking.
- **Keywords:** SEO, manifest, JSON-LD, structured data, sitemap, Open Graph, Twitter Card, canonical, FAQ, breadcrumb.
- **Dependencies:** 12_ToolManifestSpecification.
- **Related:** 12_ToolManifestSpecification, 18_SearchArchitecture.
- **Usage:** When implementing SEO; when validating structured data.

### 22_UserFlow
- **Purpose:** Guest → registered → premium journeys, degraded flows, monetization touchpoints.
- **Keywords:** user flow, guest, registration, premium, degraded, monetization, ads, onboarding.
- **Dependencies:** 15_UDS, 23_RBAC.
- **Related:** 15_UDS, 11_ProductConstitution.
- **Usage:** When designing user journeys; when implementing registration prompts.

### 23_RBAC
- **Purpose:** Roles (6), permissions, enforcement (3 layers), audit.
- **Keywords:** RBAC, roles, guest, user, premium, editor, admin, super_admin, permissions, RLS, JWT, audit.
- **Dependencies:** 19_DatabaseDesign, 04_TechStack.
- **Related:** 29_AdminSpecification, 20_APIConvention.
- **Usage:** When implementing auth; when checking permissions; when designing admin.

### 24_PlatformOperationsConstitution
- **Purpose:** POC-01 through POC-10 expanded (reliability, observability, release, rollback, backup, security, incidents, monitoring, cost, enterprise).
- **Keywords:** POC, operations, reliability, observability, release, rollback, backup, incidents, monitoring, cost.
- **Dependencies:** 00_Project_Charter §7.
- **Related:** 25-28 (operational docs).
- **Usage:** When making operational decisions; before production deployment.

### 25_DeploymentArchitecture
- **Purpose:** Environments, pipeline, topology, secrets, enterprise migration.
- **Keywords:** deployment, Vercel, environments, Local, Development, Preview, Production, secrets, enterprise.
- **Dependencies:** 04_TechStack, 24_PlatformOperationsConstitution.
- **Related:** 28_ReleaseManagement, 32_DeploymentGuide.
- **Usage:** When configuring deployment; when managing secrets.

### 26_ObservabilitySpecification
- **Purpose:** Logs, metrics, health checks, error tracking, monitoring standards, cost monitoring.
- **Keywords:** observability, logs, metrics, health check, Sentry, Lighthouse, monitoring, cost, alerting.
- **Dependencies:** 24_PlatformOperationsConstitution.
- **Related:** 32_DeploymentGuide, 29_AdminSpecification.
- **Usage:** When implementing monitoring; when setting up dashboards.

### 27_BackupAndRecovery
- **Purpose:** Backup strategy, RPO/RTO, recovery procedures.
- **Keywords:** backup, recovery, RPO, RTO, Supabase, drill, critical data.
- **Dependencies:** 19_DatabaseDesign, 24_PlatformOperationsConstitution.
- **Related:** 28_ReleaseManagement.
- **Usage:** When planning backups; when testing recovery.

### 28_ReleaseManagement
- **Purpose:** Release workflow, rollback, incident lifecycle, postmortems.
- **Keywords:** release, trunk-based, versioning, rollback, incident, postmortem, SEV-1.
- **Dependencies:** 25_DeploymentArchitecture, 24_PlatformOperationsConstitution.
- **Related:** 30_DevelopmentGuideline, 32_DeploymentGuide.
- **Usage:** When releasing; when responding to incidents; when writing postmortems.

### 29_AdminSpecification
- **Purpose:** Admin panel modules (10), workflows, RBAC, audit.
- **Keywords:** admin, dashboard, users, tools, content, SEO, analytics, feature flags, audit, settings, system health.
- **Dependencies:** 23_RBAC, 12_ToolManifestSpecification.
- **Related:** 46_AI_ADMIN_TEMPLATE, 23_RBAC.
- **Usage:** When building admin features; when implementing admin workflows.

### 30_DevelopmentGuideline
- **Purpose:** Branching, PRs, CI, code review, DoD, quality gates, AI rules.
- **Keywords:** development, PR, review, CI, DoD, quality gates, trunk-based, conventional commits.
- **Dependencies:** 08_CodingStandards, 31_TestingStrategy.
- **Related:** 35_AI_DevelopmentWorkflow, 40_DefinitionOfReady.
- **Usage:** When writing code; when reviewing PRs; when promoting to Stable.

### 31_TestingStrategy
- **Purpose:** Testing pyramid, frameworks, coverage targets, accessibility/performance testing.
- **Keywords:** testing, Vitest, Playwright, Testing Library, axe-core, Lighthouse CI, coverage, unit, integration, E2E.
- **Dependencies:** 08_CodingStandards.
- **Related:** 30_DevelopmentGuideline, 45_AI_TOOL_TEMPLATE.
- **Usage:** When writing tests; when setting up CI; when checking coverage.

### 32_DeploymentGuide
- **Purpose:** Step-by-step deployment procedures, env vars, troubleshooting.
- **Keywords:** deployment, env vars, local dev, preview, production, rollback, secrets, troubleshooting.
- **Dependencies:** 25_DeploymentArchitecture.
- **Related:** 28_ReleaseManagement.
- **Usage:** When deploying; when troubleshooting; when configuring env vars.

### 33_AI_Guideline
- **Purpose:** AI roles (9), behavior rules (10), collaboration patterns.
- **Keywords:** AI, roles, Architecture Guardian, Code Reviewer, rules, never guess, reference docs, consult ADR.
- **Dependencies:** 00_Project_Charter §3 LOCK-09, §4 EC-11.
- **Related:** 34_ZAI_Context, 35_AI_DevelopmentWorkflow, 48_AI_SESSION_START.
- **Usage:** When defining AI behavior; when reviewing AI output.

### 34_ZAI_Context
- **Purpose:** Permanent project memory; comprehensive context for AI.
- **Keywords:** context, memory, vision, architecture, governance, conventions, workflow, future.
- **Dependencies:** All documents (summary of all).
- **Related:** 42_AI_MASTER_CONTEXT, 48_AI_SESSION_START.
- **Usage:** Load as context for new AI conversations; when AI needs project overview.

### 35_AI_DevelopmentWorkflow
- **Purpose:** Mandatory 10-step implementation workflow.
- **Keywords:** workflow, governance, ADR, plan, approval, implement, self-review, docs, quality gates.
- **Dependencies:** 33_AI_Guideline.
- **Related:** 30_DevelopmentGuideline, 40_DefinitionOfReady.
- **Usage:** Every AI implementation task follows this workflow. No bypassing.

### 36_ProjectBootstrapRoadmap
- **Purpose:** Complete implementation roadmap (21 milestones).
- **Keywords:** roadmap, milestones, Sprint 0, foundation, auth, database, tool engine, tools.
- **Dependencies:** All governance docs.
- **Related:** 37_MVPImplementationPlan, 39_SprintPlanning, 50_IMPLEMENTATION_SEQUENCE.
- **Usage:** When planning implementation order; when tracking milestones.

### 37_MVPImplementationPlan
- **Purpose:** Phase 1 MVP: 20 tools with evaluation matrix.
- **Keywords:** MVP, tools, P0, P1, P2, image, PDF, developer, text, converters, SEO, calculators.
- **Dependencies:** 36_ProjectBootstrapRoadmap.
- **Related:** 38_ProjectBacklog, 39_SprintPlanning.
- **Usage:** When prioritizing tools; when planning MVP scope.

### 38_ProjectBacklog
- **Purpose:** Prioritized backlog (P0-P3) by domain with estimates.
- **Keywords:** backlog, P0, P1, P2, P3, platform, auth, admin, tool engine, registry, analytics, search, SEO, monitoring.
- **Dependencies:** 37_MVPImplementationPlan.
- **Related:** 39_SprintPlanning, 40_DefinitionOfReady.
- **Usage:** When sprint planning; when estimating work; when prioritizing.

### 39_SprintPlanning
- **Purpose:** First 10 sprints with goals, deliverables, risks, DoD.
- **Keywords:** sprint, planning, goals, deliverables, risks, DoD, duration.
- **Dependencies:** 38_ProjectBacklog.
- **Related:** 36_ProjectBootstrapRoadmap, 50_IMPLEMENTATION_SEQUENCE.
- **Usage:** When planning sprints; when tracking progress.

### 40_DefinitionOfReady
- **Purpose:** Checklist for when work is allowed to begin.
- **Keywords:** ready, checklist, documentation, ADR, dependencies, acceptance criteria, tests, security, SEO, accessibility.
- **Dependencies:** 30_DevelopmentGuideline.
- **Related:** 38_ProjectBacklog, 41_ProjectChecklist.
- **Usage:** Before starting any backlog item; verify all criteria met.

### 41_ProjectChecklist
- **Purpose:** Master operational checklist (14 sections).
- **Keywords:** checklist, setup, infrastructure, documentation, development, testing, SEO, analytics, security, accessibility, deployment, launch, growth, marketplace, enterprise.
- **Dependencies:** All documents.
- **Related:** 40_DefinitionOfReady, 51_PROJECT_HEALTH_DASHBOARD.
- **Usage:** Throughout project lifecycle; verifying completeness.

### 42_AI_MASTER_CONTEXT
- **Purpose:** Complete executive summary (~3,500 words). AI understands project by reading only this.
- **Keywords:** master context, executive summary, vision, architecture, governance, stack, manifest, Tool Engine, SEO, analytics, deployment.
- **Dependencies:** All documents (compressed summary).
- **Related:** 48_AI_SESSION_START, 34_ZAI_Context.
- **Usage:** ALWAYS load first in every AI conversation.

### 43_AI_IMPLEMENTATION_RULES
- **Purpose:** All governance converted to concise rules with references.
- **Keywords:** rules, architecture, engineering, product, SEO, analytics, security, performance, UI, testing, deployment.
- **Dependencies:** 00_Project_Charter (all governance).
- **Related:** 42_AI_MASTER_CONTEXT, 44_AI_DECISION_TREE.
- **Usage:** When checking if code complies with governance; quick reference.

### 44_AI_DECISION_TREE
- **Purpose:** Decision trees for common AI implementation decisions.
- **Keywords:** decision tree, component, database, auth, SEO, analytics, API, manifest, tool, admin, performance, security, deployment.
- **Dependencies:** 43_AI_IMPLEMENTATION_RULES.
- **Related:** 45_AI_TOOL_TEMPLATE, 46_AI_ADMIN_TEMPLATE.
- **Usage:** When making implementation decisions; when unsure which path to take.

### 45_AI_TOOL_TEMPLATE
- **Purpose:** Canonical tool implementation template.
- **Keywords:** tool template, folder structure, manifest, stages, tests, DoD, common mistakes.
- **Dependencies:** 12_ToolManifestSpecification, 14_ACD.
- **Related:** 13_FBRD, 44_AI_DECISION_TREE.
- **Usage:** When creating a new tool; when scaffolding tool code.

### 46_AI_ADMIN_TEMPLATE
- **Purpose:** Canonical admin module implementation template.
- **Keywords:** admin template, page structure, permissions, server actions, audit, accessibility, testing.
- **Dependencies:** 29_AdminSpecification, 23_RBAC.
- **Related:** 44_AI_DECISION_TREE, 45_AI_TOOL_TEMPLATE.
- **Usage:** When creating a new admin module.

### 47_AI_PROMPT_LIBRARY
- **Purpose:** Categorized library of reusable prompts (16 categories).
- **Keywords:** prompts, create tool, refactor, review, tests, documentation, migration, admin, fix bugs, SEO, accessibility, bundle, analytics, API, database.
- **Dependencies:** All AI context docs.
- **Related:** 48_AI_SESSION_START.
- **Usage:** When starting a specific type of task; copy and customize prompt.

### 48_AI_SESSION_START
- **Purpose:** Standard prompt for every new AI conversation.
- **Keywords:** session start, initialization, protocol, mandatory, governance, ADR, approval.
- **Dependencies:** 42_AI_MASTER_CONTEXT.
- **Related:** 33_AI_Guideline, 35_AI_DevelopmentWorkflow.
- **Usage:** Paste at start of EVERY new AI conversation.

### 49_AI_CONTEXT_INDEX
- **Purpose:** Fast navigation index (this document).
- **Keywords:** index, lookup, navigation, keywords, dependencies, usage.
- **Dependencies:** All documents.
- **Related:** 42_AI_MASTER_CONTEXT.
- **Usage:** When AI needs to find the right document for a topic.

### 50_IMPLEMENTATION_SEQUENCE
- **Purpose:** Definitive implementation order with phases, objectives, exit criteria.
- **Keywords:** sequence, implementation order, phases, Sprint 0, infrastructure, tools, launch, growth, marketplace.
- **Dependencies:** 36_ProjectBootstrapRoadmap, 39_SprintPlanning.
- **Related:** 37_MVPImplementationPlan, 51_PROJECT_HEALTH_DASHBOARD.
- **Usage:** When planning implementation; when tracking progress.

### 51_PROJECT_HEALTH_DASHBOARD
- **Purpose:** Living project dashboard (documentation, implementation, architecture, debt, coverage, scores).
- **Keywords:** dashboard, health, status, ADR count, tools, coverage, performance, accessibility, SEO, analytics, testing, security, deployment, risks, milestones.
- **Dependencies:** All documents.
- **Related:** 41_ProjectChecklist, 50_IMPLEMENTATION_SEQUENCE.
- **Usage:** Periodic project health assessment; stakeholder reporting.
