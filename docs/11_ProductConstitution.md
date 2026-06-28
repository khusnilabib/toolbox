# 11 — Product Constitution

> **Status:** 🟢 Approved (📋 Constitutional)
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** PC-01 through PC-10 (expanded from `00_Project_Charter` §5)

---

## 1. Purpose

This Product Constitution document expands the ten Product Constitution articles (PC-01 through PC-10) established in `00_Project_Charter` §5 into operational detail. Where the charter establishes the articles as binding commitments, this document defines what each article means in practice: what it requires, what it forbids, how it's enforced, and how it interacts with the other governance layers.

The Product Constitution is the third governance tier, sitting below the Architectural Locks (§3 of charter) and Engineering Constitution (§4 of charter) and above all technical documents. It binds every tool, present and future, with the same authority. The rationale for treating product decisions as architectural decisions is simple: at 1,000+ tools, inconsistent product behavior fragments the user experience and makes the platform feel like a patchwork rather than a cohesive ecosystem. A user who learns the layout on one tool should immediately understand every other tool.

**Product decisions are architectural decisions.** A tool that violates PC-01 through PC-10 cannot be promoted to Stable status (PC-04) and may be blocked from Beta depending on severity. This document is the authoritative reference for what each article requires; ADR-054 through ADR-063 in `06_ArchitectureDecisionRecords` provide the formal architectural decision records.

## 2. Scope

### 2.1 In Scope

- Detailed expansion of each PC article (PC-01 through PC-10).
- Enforcement mechanisms for each article.
- Interaction between Product Constitution and other governance layers.
- Worked examples for each article.
- Exceptions and how to request them.
- Audit checklist for tool promotion (PC-04).

### 2.2 Out of Scope

- The canonical ToolManifest schema → `12_ToolManifestSpecification`.
- Specific tool implementations → `13_FBRD` and per-tool specs.
- UI/UX interaction patterns → `15_UDS`.
- Code review process → `22_DevelopmentGuideline`.
- Testing strategy → `23_TestingStrategy`.

## 3. Architectural Decisions

### AD-01 — Product Constitution as Governance Tier 3

**Context.** Without a product-level governance layer, product decisions are made ad hoc per tool. Over time, tools diverge in how they handle errors, layout, analytics, monetization, and discoverability. The platform feels inconsistent.

**Decision.** Establish the Product Constitution as the third governance tier, with binding authority over all product behavior. Priority order: Architectural Locks > Engineering Constitution > Product Constitution > Technical Documents. Product decisions require charter-level authority to amend.

**Implements:** All PC articles.

### AD-02 — Every Article Maps to Specific ADR

**Context.** Each PC article is a binding commitment. Without a corresponding ADR, the article's rationale and alternatives are lost.

**Decision.** Each PC article has a corresponding ADR (ADR-054 through ADR-063) that records context, decision, consequences, alternatives, and future review triggers.

**Implements:** EC-01 (Documentation First).

## 4. Design Principles

### P1 — One Tool, One Problem
Every tool solves exactly one user problem. Multi-feature tools fragment intent and SEO.

### P2 — Contract-Driven
Every tool has a formal product contract encoded in its manifest. No contract, no tool.

### P3 — Consistency Enables Scale
1,000+ tools feel like one ecosystem because every tool follows the same layout, analytics, error patterns, and discoverability rules.

### P4 — Quality Is Earned, Not Assumed
Stable status requires passing 7 quality gates. Tools don't become Stable by aging; they become Stable by meeting objective criteria.

### P5 — User Value Before Revenue
Monetization never interrupts task completion. Revenue follows value demonstration.

### P6 — Errors Are Recoverable
Every error explains what, why, how to fix. Users can self-recover.

### P7 — Discovery Is Mandatory
Every tool helps users discover more tools. The ecosystem grows engagement naturally.

## 5. Product Constitution Articles (Detailed)

### 5.1 PC-01 — Every Tool Solves One Problem

**Binding text (from `00_Project_Charter` §5):**
> Each tool MUST solve exactly one clearly defined user problem. Avoid feature creep. One page. One intent. One outcome.

**Operational meaning:**
- A tool has ONE primary user intent, stated in its manifest's `purpose` field.
- A tool's `slug` and `title` clearly communicate that single intent (e.g., `image-resize` not `image-toolkit`).
- A tool's Processing stage produces ONE primary output type (with optional secondary outputs like metadata, but not multiple distinct transformations).
- If a tool naturally does multiple things (e.g., image resize + compress), it's split into multiple tools.

**What it forbids:**
- "Swiss army knife" tools that combine unrelated functions.
- "Mode" selectors that change what a tool does.
- Tools whose name doesn't predict their behavior.

**Enforcement:**
- Tool manifest validation: `purpose` field is a single sentence.
- Code review: reviewer verifies the tool does ONE thing.
- PC-04 quality gate: Functional review checks single-intent compliance.

**Examples:**
- ✅ `image-resize` — changes image dimensions. Single intent.
- ✅ `image-compress` — reduces image file size. Single intent.
- ❌ `image-toolkit` — resizes, compresses, converts, watermarks. Multi-intent (split into 4 tools).
- ✅ `pdf-merge` — combines multiple PDFs into one. Single intent.
- ✅ `pdf-split` — splits one PDF into multiple. Single intent.

**Interaction with other articles:**
- PC-09 (Discoverability): Multi-step workflows span multiple tools; each tool is single-intent but related tools are linked.
- LOCK-08 (SEO): One intent per page = higher search relevance.

**Exceptions:** None. If a tool genuinely needs to do multiple things, propose a "workflow" concept via ADR (not a multi-feature tool).

---

### 5.2 PC-02 — Every Tool Has a Product Contract

**Binding text:**
> Every tool MUST define: Purpose, User Problem, Inputs, Outputs, Validation Rules, Processing Steps, Success Criteria, Failure States, Empty States, Loading States, SEO Intent, Related Tools, Analytics Events. No tool exists without this contract.

**Operational meaning:**
Every tool's manifest (per `12_ToolManifestSpecification`) MUST include:

| Contract Field | Manifest Field | Description |
|---------------|----------------|-------------|
| Purpose | `purpose` | One-sentence statement of what the tool does. |
| User Problem | `userProblem` | The problem the user is trying to solve. |
| Inputs | `inputSchema` (Zod) | Schema of accepted inputs. |
| Outputs | `outputSchema` (Zod) | Schema of produced outputs. |
| Validation Rules | `validationRules` | Specific validation constraints (size limits, format restrictions). |
| Processing Steps | `stages.processing` | The Processing stage implementation. |
| Success Criteria | `successCriteria` | What constitutes a successful execution. |
| Failure States | `failureStates` | Enumerated failure modes with user-facing messages. |
| Empty States | `emptyStates` | UI when no input has been provided yet. |
| Loading States | `loadingStates` | UI during processing. |
| SEO Intent | `seo.searchIntent` | Informational / Transactional / Navigational. |
| Related Tools | `relatedTools` | Slugs of related tools for discoverability (PC-09). |
| Analytics Events | `analytics.events` | List of analytics events the tool emits (PC-07). |

**What it forbids:**
- Tools with incomplete manifests.
- Tools where behavior is undocumented (if it's not in the contract, it doesn't exist).
- Tools with implicit inputs/outputs not in the schema.

**Enforcement:**
- Build-time manifest validation against Zod schema.
- CI fails if manifest is incomplete.
- PC-04 quality gate: Documentation review verifies contract completeness.

**Interaction with other articles:**
- PC-03 (Completion Standard): Contract is the foundation; completion standard verifies implementation matches contract.
- PC-07 (Analytics): Analytics events are part of the contract.
- PC-10 (Product Scalability): Manifest is the metadata source for codegen.

---

### 5.3 PC-03 — Tool Completion Standard

**Binding text:**
> A tool is only considered complete if it provides: Upload/Input, Validation, Processing, Preview, Download/Copy, Error Handling, Success Feedback, Accessibility, Mobile Support, SEO, Analytics, Documentation, Tests. All 13 items mandatory.

**Operational meaning:**
The 13 mandatory items:

| # | Item | Requirement |
|---|------|-------------|
| 1 | Upload/Input | Tool accepts user input via form, file upload, or URL. |
| 2 | Validation | Input validated with Zod; invalid input returns typed error. |
| 3 | Processing | Tool Engine Processing stage implemented (browser or server per manifest). |
| 4 | Preview | Result previewed before download; user can inspect. |
| 5 | Download/Copy | Result downloadable (file) or copyable (text); per LOCK-07, no registration required for download. |
| 6 | Error Handling | All error paths produce typed errors with user-facing messages (PC-08). |
| 7 | Success Feedback | Successful execution shows clear success state (toast, highlight, etc.). |
| 8 | Accessibility | WCAG 2.1 AA conformance; keyboard nav, screen reader, focus visibility, reduced motion (EC-06). |
| 9 | Mobile Support | Tool usable on 360px viewport; touch targets ≥44x44px. |
| 10 | SEO | Per `18_SEOSpecification`: metadata, structured data, FAQ, related tools, breadcrumb. |
| 11 | Analytics | Emits all PC-07 required events. |
| 12 | Documentation | Tool README documents purpose, inputs, outputs, edge cases. |
| 13 | Tests | Unit tests for stages; E2E test for workflow; accessibility test. |

**What it forbids:**
- Tools missing any of the 13 items.
- Tools with "TODO" or "coming soon" for any item.
- Tools that work on desktop but not mobile.

**Enforcement:**
- PC-04 quality gates verify each item.
- CI checks for tests, SEO metadata, analytics events.
- Manual review for accessibility, mobile, UX.

**Interaction with other articles:**
- PC-04 (Quality Gates): Completion standard is the baseline; quality gates verify it.
- EC-04 (Tool Template): Template scaffolds all 13 items.

---

### 5.4 PC-04 — Product Quality Gates

**Binding text:**
> A feature cannot reach Stable unless it passes: Functional review, Accessibility review, Performance review, SEO review, Security review, Documentation review, UX review. Quality gates are mandatory.

**Operational meaning:**
Seven quality gates, each with objective criteria:

| # | Gate | Criteria | Reviewer |
|---|------|----------|----------|
| 1 | Functional | All manifest-declared features work as specified; tests pass. | Engineer (peer) |
| 2 | Accessibility | WCAG 2.1 AA; Lighthouse accessibility ≥95; keyboard nav tested; screen reader tested. | Engineer (trained) |
| 3 | Performance | Lighthouse performance ≥90; bundle size within budget; TTFB <500ms. | Engineer |
| 4 | SEO | All `18_SEOSpecification` requirements met; structured data valid; unique metadata. | SEO reviewer |
| 5 | Security | Input validation; no secrets in client; RLS policies; no XSS vectors. | Security reviewer |
| 6 | Documentation | Tool README complete; ADRs updated if architectural change; manifest accurate. | Tech writer or engineer |
| 7 | UX | Layout follows PC-05; error states follow PC-08; success feedback present; mobile usable. | UX reviewer or designer |

**Promotion workflow:**
1. Tool is in `Testing` or `Beta` lifecycle state.
2. Author requests promotion to `Stable` via PR.
3. Each gate reviewer signs off (or rejects with feedback).
4. All 7 gates pass → promote to `Stable` (update manifest `lifecycle` field).
5. Any gate fails → address feedback; re-request.

**What it forbids:**
- Self-promotion to Stable without all 7 sign-offs.
- Skipping gates "because it's a small change."

**Enforcement:**
- Admin panel tracks lifecycle transitions; requires sign-off records.
- Audit trail (LOCK-11) records who signed off and when.
- Code review checklist includes gate verification.

**Interaction with other articles:**
- PC-03 (Completion Standard): Completion is the baseline; gates verify completion plus additional quality.
- LOCK-12 (Feature Lifecycle): Gates are the criteria for promotion to Stable.

---

### 5.5 PC-05 — UX Consistency

**Binding text:**
> Every tool page follows the same layout: Hero → Tool → Result → FAQ → Related Tools → Documentation → Feedback → Footer. Users should never relearn navigation between tools.

**Operational meaning:**
Canonical tool page layout (top to bottom):

```
┌─────────────────────────────────┐
│ 1. Hero                         │  Title, one-line description, breadcrumb
├─────────────────────────────────┤
│ 2. Tool                         │  Input form, processing controls
├─────────────────────────────────┤
│ 3. Result                       │  Preview, download button, success state
├─────────────────────────────────┤
│ 4. FAQ                          │  Per LOCK-08; min 3 Q&As
├─────────────────────────────────┤
│ 5. Related Tools                │  Per PC-09; min 3 related tools
├─────────────────────────────────┤
│ 6. Documentation                │  Tool-specific docs, how-to guides
├─────────────────────────────────┤
│ 7. Feedback                     │  "Was this helpful?" widget
├─────────────────────────────────┤
│ 8. Footer                       │  Site-wide footer
└─────────────────────────────────┘
```

**What it forbids:**
- Reordering sections (e.g., FAQ before Tool).
- Omitting sections (except Documentation, which can be minimal for simple tools).
- Custom layouts per tool.

**Enforcement:**
- `ToolLayout` component (`14_ACD`) renders the canonical layout.
- Code review verifies use of `ToolLayout`.
- PC-04 UX gate checks layout compliance.

**Interaction with other articles:**
- LOCK-10 (Design Philosophy): Layout uses design system tokens.
- EC-10 (Design System Governance): No ad hoc layout elements.

---

### 5.6 PC-06 — Monetization Philosophy

**Binding text:**
> Revenue MUST never interrupt task completion. Advertising or premium prompts may appear only after value has been demonstrated. Core functionality remains free. Premium provides convenience, not necessity.

**Operational meaning:**
- Core tool workflow (Input → Validation → Processing → Preview → Download) is always free.
- Ads appear only AFTER the result is shown (in the Result section or below).
- Premium prompts appear only for value-adds: batch processing, cloud sync, AI features, higher file size limits.
- No paywalls mid-workflow.
- No "registration required to download" (per LOCK-07).

**What it forbids:**
- Ads before the result.
- Paywalls on core functionality.
- Forced registration to complete a task.
- Premium features that are necessary for basic use (e.g., "premium required to download full resolution").

**Enforcement:**
- Code review: reviewer verifies no monetization in core workflow.
- PC-04 UX gate: checks monetization placement.

**Interaction with other articles:**
- LOCK-07 (Guest-First): Reinforces no registration before value.
- `01_BRD` §4.1: Monetization standards operationalize this.

---

### 5.7 PC-07 — Analytics Standard

**Binding text:**
> Every tool MUST emit consistent events. Minimum events: Tool Viewed, Tool Started, Validation Failed, Processing Started, Processing Completed, Download Attempted, Download Completed, Registration Prompt Viewed, Registration Completed, Tool Shared.

**Operational meaning:**
Mandatory analytics events (all tools emit these):

| Event Name | Trigger | Payload |
|-----------|---------|---------|
| `tool_viewed` | User lands on tool page | `{ toolSlug, referrer, locale }` |
| `tool_started` | User begins input (uploads file, types text) | `{ toolSlug, inputType }` |
| `validation_failed` | Input validation fails | `{ toolSlug, field, errorKind }` |
| `processing_started` | Processing stage begins | `{ toolSlug, inputSummary }` |
| `processing_completed` | Processing stage completes successfully | `{ toolSlug, durationMs, outputSummary }` |
| `download_attempted` | User clicks download/copy button | `{ toolSlug, outputFormat }` |
| `download_completed` | Download/copy succeeds | `{ toolSlug, outputSize }` |
| `registration_prompt_viewed` | Registration prompt shown | `{ toolSlug, trigger }` |
| `registration_completed` | User completes registration | `{ toolSlug, method }` |
| `tool_shared` | User shares tool (link copy, social) | `{ toolSlug, shareMethod }` |

**What it forbids:**
- Tools emitting custom event names instead of standard ones.
- Tools omitting any of the 10 mandatory events.
- Tools sending PII in event payloads (only userId if authenticated).

**Enforcement:**
- Tool Engine emits events automatically; tools don't write custom analytics code.
- Manifest declares which events the tool emits (for tools with optional events like `tool_shared`).
- CI verifies manifest's analytics configuration.

**Interaction with other articles:**
- PC-02 (Product Contract): Analytics events are part of the contract.
- PC-10 (Product Scalability): Analytics config derived from manifest.

---

### 5.8 PC-08 — Error Experience

**Binding text:**
> Every error MUST: explain what happened, explain why, explain how to fix it. Never expose technical stack traces.

**Operational meaning:**
Every error has three components:

1. **What happened** (plain language): "The image you uploaded is too large."
2. **Why** (if known): "The maximum file size is 10MB; your file is 25MB."
3. **How to fix it** (actionable): "Please upload a smaller image, or use the Image Compressor tool first."

**Error types** (from `02_SAD` §6.3):
- `validation` — input validation failed.
- `processing` — tool logic failed (recoverable or not).
- `quota_exceeded` — user hit usage limit.
- `auth_required` — feature requires registration.
- `server_unavailable` — backend service down.

Each error type has a user-facing message template; tools fill in specifics.

**What it forbids:**
- Generic "Something went wrong" messages.
- Raw stack traces or technical error codes visible to users.
- Errors without recovery guidance.
- Errors that blame the user ("You entered invalid input").

**Enforcement:**
- Tool Engine maps errors to user-facing messages.
- Code review: reviewer verifies error messages meet the three-component standard.
- PC-04 UX gate: checks error experience.

**Interaction with other articles:**
- EC-05 (Progressive Enhancement): Errors are graceful degradation points.

---

### 5.9 PC-09 — Feature Discoverability

**Binding text:**
> Every tool MUST help users discover additional tools. Methods: Related Tools, Suggested Workflows, Category Navigation, Search, Recently Used, Popular Tools. The ecosystem should naturally expand user engagement.

**Operational meaning:**
Six discoverability methods (all tools implement at least the first three):

| Method | Requirement | Implementation |
|--------|-------------|----------------|
| Related Tools | Min 3 related tools listed in Result section. | Manifest `relatedTools` field; rendered by `RelatedTools` component. |
| Suggested Workflows | If tool is part of a workflow (e.g., resize → compress → convert), suggest next steps. | Manifest `suggestedWorkflows` field (optional in Phase 1). |
| Category Navigation | Tool page links to its category page. | Breadcrumb (LOCK-08) + sidebar. |
| Search | Tool is searchable in site search. | Auto-indexed from manifest (PC-10). |
| Recently Used | If authenticated, show recently used tools. | Identity Context history; UI in header. |
| Popular Tools | Site-wide popular tools shown on category pages. | Derived from Analytics Context (PC-07). |

**What it forbids:**
- Tools with no related tools declared.
- Tools that don't link to their category.
- Dead-end pages (no path to other tools).

**Enforcement:**
- Manifest validation: `relatedTools` array has ≥3 entries.
- Code review: verifies Related Tools section present.
- PC-04 SEO gate: checks internal linking.

**Interaction with other articles:**
- LOCK-08 (SEO): Internal linking strengthens SEO.
- PC-05 (UX Consistency): Related Tools section is part of canonical layout.

---

### 5.10 PC-10 — Product Scalability

**Binding text:**
> Every new tool should require minimal engineering effort. The Tool Manifest MUST contain enough metadata to automatically generate: Navigation, SEO, Sitemap, Categories, Search Index, Admin Inventory, Analytics Configuration. Metadata-first development is mandatory.

**Operational meaning:**
Adding a tool = creating a folder with `manifest.ts` + stage files. The build-time codegen (`05_ProjectStructure` AD-04) automatically:

| Generated Artifact | Source Manifest Field |
|--------------------|-----------------------|
| Navigation entries | `category`, `slug`, `title` |
| SEO metadata | `seo` (title, description, OG, Twitter Card, JSON-LD) |
| Sitemap entries | `slug`, `category`, `lastModified` |
| Category taxonomies | `category` |
| Search index | `title`, `description`, `keywords`, `faq` |
| Admin inventory | All manifest fields |
| Analytics configuration | `analytics.events` |

**What it forbids:**
- Manual registration of tools in navigation, sitemap, or admin.
- Tools that require infrastructure changes outside their own folder.
- Hardcoded tool lists anywhere in the codebase.

**Enforcement:**
- CI verifies generated files match manifests (`scripts/verify-registry.ts`).
- Code review: reviewer verifies no manual registration.
- PC-04 Documentation gate: checks manifest completeness.

**Interaction with other articles:**
- LOCK-05 (Plugin-Ready): Manifest is the plugin contract.
- PC-02 (Product Contract): Manifest encodes the contract.
- EC-04 (Tool Template): Template ensures manifest completeness.

## 6. Standards

### 6.1 Article Enforcement Standards
- Every PC article is binding on every tool.
- Violations block promotion to Beta or Stable (per article severity).
- Exceptions require ADR approval.

### 6.2 Article Interaction Standards
- PC articles are complementary; tools must satisfy ALL articles simultaneously.
- When articles appear to conflict (e.g., PC-05 layout vs. PC-09 discoverability), the canonical layout (PC-05) includes discoverability sections (PC-09).

### 6.3 Article Evolution Standards
- New PC articles require charter amendment (`00_Project_Charter` §5).
- Article modifications require charter amendment.
- Article interpretation clarifications can be made in this document via revision bump.

## 7. Best Practices

### 7.1 When Designing a New Tool
1. Define the ONE problem the tool solves (PC-01).
2. Draft the product contract (PC-02) — all 13 fields.
3. Plan the 13 completion items (PC-03).
4. Plan for all 7 quality gates (PC-04) before requesting promotion.
5. Use the canonical layout (PC-05).
6. Place monetization only after result (PC-06).
7. Plan the 10 analytics events (PC-07).
8. Draft error messages with what/why/how (PC-08).
9. Identify 3+ related tools (PC-09).
10. Ensure manifest is complete for codegen (PC-10).

### 7.2 When Reviewing a Tool PR
- Verify PC-01: single intent?
- Verify PC-02: contract complete in manifest?
- Verify PC-03: all 13 items present?
- For promotion to Stable: verify all 7 gates passed (PC-04).
- Verify PC-05: uses `ToolLayout`?
- Verify PC-06: no monetization in core workflow?
- Verify PC-07: emits all 10 events (or delegates to Tool Engine)?
- Verify PC-08: error messages meet three-component standard?
- Verify PC-09: ≥3 related tools declared?
- Verify PC-10: manifest complete enough for codegen?

### 7.3 When Requesting an Exception
1. Write an ADR proposing the exception with rationale.
2. Reference the PC article being excepted.
3. Explain why the exception doesn't undermine the article's intent.
4. Get Chief Architect approval.
5. Document the exception in the tool's README.

## 8. Examples

### 8.1 Example: Image Resizer Tool

**PC-01 (One Problem):** Resizes images to specified dimensions. Single intent.

**PC-02 (Contract):**
- Purpose: "Resize an image to specific width and height."
- User Problem: "I need an image at a specific size for a profile picture / thumbnail / print."
- Inputs: Image file (PNG, JPEG, WebP), target width, target height, optional maintain-aspect-ratio flag.
- Outputs: Resized image file (same format as input).
- Validation Rules: File ≤10MB; dimensions 1-10000px; supported formats only.
- Processing Steps: Decode image → resize via Canvas → encode → return blob.
- Success Criteria: Output image has exact specified dimensions.
- Failure States: `validation` (invalid file), `processing` (decode failure), `quota_exceeded` (file too large).
- Empty States: "Upload an image to resize" with upload icon.
- Loading States: Progress bar during resize.
- SEO Intent: Transactional (user wants to DO something).
- Related Tools: `image-compress`, `image-crop`, `image-format-convert`.
- Analytics Events: All 10 standard events.

**PC-03 (Completion):** All 13 items implemented.

**PC-04 (Gates):** Passed all 7 gates; promoted to Stable.

**PC-05 (Layout):** Uses `ToolLayout` with all 8 sections.

**PC-06 (Monetization):** No ads before result. Ad appears after download. Premium upsell for batch resize (not blocking single resize).

**PC-07 (Analytics):** Emits all 10 events via Tool Engine.

**PC-08 (Errors):**
- File too large: "Your image is too large (25MB). The maximum size is 10MB. Try the Image Compressor first to reduce its size."
- Invalid format: "This file format isn't supported (GIF). Supported formats are PNG, JPEG, and WebP. Convert your image to one of these formats first."

**PC-09 (Discoverability):** Related Tools section shows Image Compress, Image Crop, Image Format Convert.

**PC-10 (Scalability):** Manifest complete; codegen generates nav, SEO, sitemap, search, admin automatically.

## 9. Future Expansion

### 9.1 New PC Articles
As the platform evolves, new PC articles may be needed (e.g., PC-11 for internationalization, PC-12 for collaboration). Each requires charter amendment per `00_Project_Charter` §12.

### 9.2 Article Refinement
Existing articles may need operational refinement. Refinements that don't change binding text are made via revision bump to this document. Refinements that change binding text require charter amendment.

### 9.3 Tool-Specific PC Extensions
Some tool categories may need additional product rules (e.g., AI tools need disclosure requirements). These are added as appendices to this document, not as new PC articles.

## 10. Dependencies

### 10.1 Document Dependencies
- Depends on `00_Project_Charter` §5 — source of PC articles.
- Depends on `01_BRD` — business context for monetization (PC-06).
- Depends on `02_SAD` — Tool Engine implementing PC-02, PC-03, PC-07.
- Depends on `05_ProjectStructure` — registry codegen implementing PC-10.
- `06_ArchitectureDecisionRecords` — ADR-054 through ADR-063.
- `12_ToolManifestSpecification` — canonical schema implementing PC-02, PC-07, PC-09, PC-10.
- `13_FBRD` — per-feature requirements referencing PC-01, PC-02.
- `14_ACD` — components implementing PC-05, PC-08.
- `15_UDS` — UX patterns implementing PC-05, PC-08.
- `18_SEOSpecification` — SEO implementing PC-09.
- `19_UserFlow` — user flows implementing PC-06.
- `21_AdminSpecification` — admin implementing PC-04 (lifecycle), PC-07 (analytics), PC-10 (inventory).
- `22_DevelopmentGuideline` — quality gates implementing PC-04, completion standard PC-03.
- `23_TestingStrategy` — testing implementing PC-03.

### 10.2 External Dependencies
- None. Product Constitution is governance, not implementation.

### 10.3 Assumptions
- Team accepts the discipline of product-level governance.
- Tool authors read this document before creating tools.

## 11. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Product Constitution. Expanded PC-01 through PC-10 with operational detail, enforcement mechanisms, worked examples, and interaction with other governance layers. |

## 12. Cross References

- `00_Project_Charter` §5 — Source of PC articles (binding text).
- `01_BRD` §4.1 — Monetization standards operationalizing PC-06.
- `02_SAD` §6 — Tool Engine implementing PC-02, PC-03, PC-07.
- `05_ProjectStructure` §Tool Registry Pattern — Codegen implementing PC-10.
- `06_ArchitectureDecisionRecords` — ADR-054 through ADR-063 (formal ADRs for each PC article).
- `12_ToolManifestSpecification` — Canonical schema encoding PC-02 contract.
- `13_FBRD` — Per-feature requirements implementing PC-01, PC-02.
- `14_ACD` — `ToolLayout` component implementing PC-05; error components implementing PC-08.
- `15_UDS` — Tool page layout implementing PC-05; error states implementing PC-08.
- `18_SEOSpecification` — Internal linking implementing PC-09.
- `19_UserFlow` — Monetization touchpoints implementing PC-06.
- `21_AdminSpecification` — Feature lifecycle (PC-04), analytics (PC-07), inventory (PC-10).
- `22_DevelopmentGuideline` — Quality gates (PC-04), definition of done (PC-03).
- `23_TestingStrategy` — Testing for completion standard (PC-03).
- `25_AI_Guideline` — AI must follow Product Constitution (LOCK-09, EC-11).
- `28_Backlog` — Every backlog tool must satisfy all PC articles.
