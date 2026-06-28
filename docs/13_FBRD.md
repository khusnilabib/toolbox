# 13 — Feature-Based Requirements Document (FBRD)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-03 (Tool Engine), LOCK-05 (Plugin-Ready), LOCK-12 (Feature Lifecycle); EC-04 (Tool Template Standard); PC-01 (One Problem), PC-02 (Product Contract)

---

## 1. Purpose

This Feature-Based Requirements Document defines the **per-feature requirement template** that every tool in [PROJECT_NAME] must satisfy before development begins. Where `12_ToolManifestSpecification` defines the canonical schema, this document defines the **process** for turning a tool concept into a complete, implementable specification.

The FBRD exists because tool ideas are cheap; well-specified tools are expensive. Without a structured requirements process, tools get built with vague goals, missing edge cases, and inconsistent quality. The FBRD template forces tool authors to think through all 13 PC-02 product contract fields, all 13 PC-03 completion items, and all 7 PC-04 quality gates BEFORE writing code. This upfront investment prevents the much larger cost of fixing incomplete tools later.

Every tool in `28_Backlog` must have a corresponding FBRD entry before it can enter `Development` lifecycle state. The FBRD entry is the prerequisite for creating the tool's `manifest.ts` file. This document defines the template; specific tool entries live in `28_Backlog` and per-tool READMEs.

## 2. Scope

### 2.1 In Scope

- The FBRD template (sections every tool spec must include).
- Tool concept → Planned → Design lifecycle transitions.
- How FBRD entries map to manifest fields.
- How FBRD entries map to quality gates (PC-04).
- Tool registry: how FBRD entries are tracked.
- Examples of well-specified FBRD entries.

### 2.2 Out of Scope

- The manifest schema itself → `12_ToolManifestSpecification`.
- Specific tool backlog → `28_Backlog`.
- UI patterns → `15_UDS`.
- Component APIs → `14_ACD`.
- PR workflow → `22_DevelopmentGuideline`.

## 3. Architectural Decisions

### AD-01 — FBRD Entry is Prerequisite for Development

**Context.** Without a structured requirements phase, tools get built with incomplete specs, leading to rework and quality issues.

**Decision.** Every tool must have an FBRD entry before entering `Development` lifecycle state. The FBRD entry satisfies PC-02 (Product Contract) at the requirements level, before code is written.

**Implements:** PC-01, PC-02, LOCK-12 (Feature Lifecycle — `Design` state requires FBRD entry).

### AD-02 — FBRD Template Mirrors Manifest Schema

**Context.** If FBRD template and manifest schema diverge, requirements don't match implementation.

**Decision.** FBRD template sections map 1:1 to ToolManifest fields. The FBRD entry is the human-readable precursor to the machine-readable manifest.

**Implements:** EC-02 (One Source of Truth), PC-02.

### AD-03 — FBRD Entries Live in Backlog

**Context.** FBRD entries could live in a separate doc or per-tool files. Centralizing in `28_Backlog` ensures visibility and prioritization.

**Decision.** Tool FBRD entries are summarized in `28_Backlog` with full entries in per-tool READMEs (created when the tool enters `Planned` lifecycle).

**Implements:** EC-01 (Documentation First).

## 4. Design Principles

### P1 — Spec Before Code
No tool enters Development without a complete FBRD entry. Specs are reviewed and approved.

### P2 — One Problem Per Tool
FBRD entry must state the ONE problem the tool solves. Multi-problem tools are split.

### P3 — Complete Contract
FBRD entry must include all PC-02 product contract fields. Partial specs don't pass review.

### P4 — Quality Gates Planned Upfront
FBRD entry plans for all 7 PC-04 quality gates. Gates aren't a surprise at promotion time.

### P5 — Discoverability Designed In
FBRD entry identifies related tools before implementation. Discoverability is not an afterthought.

## 5. FBRD Template

Every tool's FBRD entry MUST include the following sections. The template mirrors `12_ToolManifestSpecification` fields.

### 5.1 Tool Identity

```markdown
## Tool: [Tool Name]

- **Slug:** [kebab-case-slug]
- **Category:** [image | pdf | developer | text | converters | seo | calculators | utility | ai]
- **Title:** [Human-readable title]
- **Description:** [One-sentence description, 50-160 chars for SEO]
- **Lifecycle:** [concept | planned | design | development | testing | beta | stable]
- **Version:** [semver, e.g., 1.0.0]
```

### 5.2 Product Contract (PC-02)

```markdown
### Product Contract

**Purpose:** [One sentence: what the tool does]

**User Problem:** [The problem the user is solving. 20-300 chars.]

**Inputs:**
- [Input 1]: [type, constraints]
- [Input 2]: [type, constraints]

**Outputs:**
- [Output 1]: [type, description]
- [Output 2]: [type, description]

**Validation Rules:**
- [Field]: [rule], message: "[user-facing message]"
- [Field]: [rule], message: "[user-facing message]"

**Processing Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Success Criteria:** [What constitutes success]

**Failure States:**
- [Failure 1]: what="[plain language]", why="[reason]", howToFix="[actionable guidance]"
- [Failure 2]: what="[plain language]", why="[reason]", howToFix="[actionable guidance]"

**Empty States:**
- [Scenario]: title="[title]", description="[description]", cta=[{label, action}]

**Loading States:**
- [Scenario]: title="[title]", description="[description]", estimatedDuration=[ms]
```

### 5.3 Execution Classification (LOCK-02)

```markdown
### Execution

**Mode:** [browser | server]

**Rationale:** [Why this mode? If server, why can't it run in browser?]

**Browser-side libraries:** [List of libraries used, with bundle size]
**Server-side dependencies:** [If server mode, list external services]
```

### 5.4 SEO Configuration (LOCK-08)

```markdown
### SEO

**Search Intent:** [informational | transactional | navigational]

**Target Keywords:** [3-10 keywords]

**Title Tag:** [≤60 chars]

**Meta Description:** [≤160 chars]

**Canonical URL:** [URL]

**Open Graph:** [title, description, image URL]

**Twitter Card:** [card type, title, description, image]

**Structured Data:** [JSON-LD type, e.g., SoftwareApplication]

**FAQ (min 3):**
1. Q: [question] A: [answer]
2. Q: [question] A: [answer]
3. Q: [question] A: [answer]

**Breadcrumb:** [Home > Category > Tool]
```

### 5.5 Discoverability (PC-09)

```markdown
### Discoverability

**Related Tools (min 3):**
- [slug-1] — [why related]
- [slug-2] — [why related]
- [slug-3] — [why related]

**Suggested Workflows (optional):**
- [Workflow name]: [tool-1] → [tool-2] → [tool-3] — [description]
```

### 5.6 Analytics Configuration (PC-07)

```markdown
### Analytics

**Standard Events (emitted automatically by Tool Engine):**
- tool_viewed, tool_started, validation_failed, processing_started,
- processing_completed, download_attempted, download_completed,
- registration_prompt_viewed, registration_completed, tool_shared

**Custom Events (tool-specific):**
- [event_name]: trigger="[when]", payload={[schema]}

**Funnel Steps:**
1. tool_viewed
2. tool_started
3. processing_completed
4. download_completed
```

### 5.7 Limits & Constraints

```markdown
### Limits

- **Max Input Size:** [bytes]
- **Max Output Size:** [bytes]
- **Max Processing Time:** [ms]
- **Rate Limit Per User:** [requests/hour, optional]
- **Requires Auth:** [true/false — usually false per LOCK-07]
- **Premium Only:** [true/false — must be value-add per PC-06]
```

### 5.8 Completion Standard Checklist (PC-03)

```markdown
### Completion Standard (PC-03)

- [ ] Upload/Input implemented
- [ ] Validation implemented (Zod)
- [ ] Processing stage implemented
- [ ] Preview component implemented
- [ ] Download/Copy implemented
- [ ] Error Handling (PC-08 compliant)
- [ ] Success Feedback
- [ ] Accessibility (WCAG AA, keyboard, screen reader, reduced motion)
- [ ] Mobile Support (360px viewport, 44x44px touch targets)
- [ ] SEO (all fields above implemented)
- [ ] Analytics (all events emitting)
- [ ] Documentation (README complete)
- [ ] Tests (unit + E2E + accessibility)
```

### 5.9 Quality Gates Plan (PC-04)

```markdown
### Quality Gates Plan (PC-04)

- [ ] **Functional review:** [reviewer role], criteria: [all features work]
- [ ] **Accessibility review:** [reviewer role], criteria: [WCAG AA, Lighthouse ≥95]
- [ ] **Performance review:** [reviewer role], criteria: [Lighthouse ≥90, bundle <200KB]
- [ ] **SEO review:** [reviewer role], criteria: [all SEO fields valid, structured data valid]
- [ ] **Security review:** [reviewer role], criteria: [input validation, no secrets, RLS]
- [ ] **Documentation review:** [reviewer role], criteria: [README complete, ADRs updated]
- [ ] **UX review:** [reviewer role], criteria: [PC-05 layout, PC-08 errors, mobile usable]
```

## 6. Tool Registry

The Tool Registry tracks all tools and their lifecycle states. It's derived from manifests at build time (per `05_ProjectStructure` AD-04) and also tracked in `28_Backlog` for planning purposes.

### 6.1 Registry Entry (per tool)

```markdown
| Slug | Category | Title | Lifecycle | Version | Last Updated |
|------|----------|-------|-----------|---------|--------------|
| image-resize | image | Image Resizer | stable | 1.0.0 | 2026-06-28 |
```

### 6.2 Lifecycle Transitions

```
Concept → Planned → Design → Development → Testing → Beta → Stable → Deprecated → Archived
```

**Transition criteria:**
- **Concept → Planned:** FBRD entry drafted; tool added to `28_Backlog`.
- **Planned → Design:** FBRD entry reviewed; SEO keywords researched; related tools identified.
- **Design → Development:** FBRD entry approved; manifest.ts created; folder scaffolded.
- **Development → Testing:** Implementation complete; unit tests pass; manifest validated.
- **Testing → Beta:** All 13 PC-03 items implemented; deployed to staging.
- **Beta → Stable:** All 7 PC-04 quality gates passed.
- **Stable → Deprecated:** Tool replaced or sunset; deprecation notice added.
- **Deprecated → Archived:** Tool removed from navigation; redirects to successor.

## 7. Standards

### 7.1 FBRD Entry Standards
- Every tool in `28_Backlog` has an FBRD entry (summary in backlog, full in per-tool README).
- FBRD entry must be approved before `Design → Development` transition.
- FBRD entry is the source of truth for the manifest; if they diverge, FBRD wins (update manifest).

### 7.2 FBRD Review Standards
- Reviewer: Chief Architect or designated tool reviewer.
- Review criteria: PC-01 (single problem), PC-02 (complete contract), PC-03 (completion plan), PC-04 (quality gates plan), LOCK-02 (execution mode justified).
- Review outcome: Approved / Needs Revision / Rejected.

### 7.3 FBRD Evolution Standards
- FBRD entries can be updated during development as understanding evolves.
- Material changes (new inputs, new failure states, new limits) require re-review.
- FBRD entry is archived with the tool when it reaches `Archived` lifecycle.

## 8. Best Practices

### 8.1 When Drafting an FBRD Entry
1. Start with PC-01: what ONE problem does this tool solve?
2. Draft the product contract (PC-02) — all 13 fields.
3. Classify execution mode (LOCK-02): can it run in browser? If not, justify.
4. Plan SEO (LOCK-08): research keywords, draft title/description.
5. Identify related tools (PC-09): browse existing tools in same category.
6. Plan analytics (PC-07): what custom events beyond the standard 10?
7. Set limits conservatively.
8. Plan for all 7 quality gates (PC-04).
9. Review with Chief Architect.
10. Only then: create manifest.ts and folder.

### 8.2 When Reviewing an FBRD Entry
- Verify PC-01: is this really one problem?
- Verify PC-02: are all 13 contract fields complete?
- Verify LOCK-02: is execution mode justified?
- Verify PC-09: are related tools sensible?
- Verify PC-04: is the quality gates plan realistic?
- Check for scope creep: is this tool trying to do too much?
- Check for duplication: does an existing tool already solve this?

### 8.3 When Updating an FBRD Entry
- Bump version field.
- Document what changed and why.
- Re-review if material changes.

## 9. Examples

### 9.1 Example: Image Resizer FBRD Entry (Summary)

```markdown
## Tool: Image Resizer

- **Slug:** image-resize
- **Category:** image
- **Title:** Image Resizer
- **Description:** Resize images to any dimensions instantly in your browser. Free, private, no upload required.
- **Lifecycle:** stable
- **Version:** 1.0.0

### Product Contract
**Purpose:** Resize an image to specific width and height dimensions.
**User Problem:** I need an image at a specific size for a profile picture, thumbnail, or print layout.
**Inputs:** Image file (PNG/JPEG/WebP, ≤10MB), width (1-10000px), height (1-10000px), maintain-aspect-ratio (boolean).
**Outputs:** Resized image (same format), with new dimensions.
**Validation Rules:** File required, ≤10MB, supported formats only; dimensions 1-10000px.
**Processing Steps:** Decode image → resize via Canvas → encode → return blob.
**Success Criteria:** Output image has exact specified dimensions.
**Failure States:** file_too_large (what/why/how), invalid_format, decode_failure.
**Empty States:** no_input (upload CTA).
**Loading States:** processing (progress, ~800ms).

### Execution
**Mode:** browser
**Rationale:** Canvas API provides native image manipulation; no server needed.
**Browser-side libraries:** None (native Canvas API).

### SEO
**Search Intent:** transactional
**Target Keywords:** image resizer, resize image, image dimensions, resize photo online
**FAQ:** (1) Is it free? Yes. (2) Are images uploaded? No. (3) What formats? PNG/JPEG/WebP.
[... full SEO per template]

### Discoverability
**Related Tools:** image-compress, image-crop, image-format-convert.

### Analytics
**Custom Events:** aspect_ratio_toggled.
**Funnel:** tool_viewed → tool_started → processing_completed → download_completed.

### Limits
- Max Input Size: 10MB
- Max Output Size: 10MB
- Max Processing Time: 30s
- Requires Auth: false
- Premium Only: false

### Completion Standard
[All 13 items checked]

### Quality Gates Plan
[All 7 gates planned]
```

## 10. Future Expansion

### 10.1 FBRD Automation (Phase 2+)
- FBRD entries could be authored in a structured format (YAML/JSON) that auto-generates a manifest skeleton.
- Reduces boilerplate; ensures template compliance.

### 10.2 FBRD Templates Per Category (Phase 2+)
- Image tools, PDF tools, developer tools may have category-specific FBRD templates extending the base.
- Reduces repetition; captures category conventions.

### 10.3 FBRD Review Workflow (Phase 2+)
- Formal review workflow in admin panel (per `21_AdminSpecification`).
- Tracks review state, reviewer, feedback.

## 11. Dependencies

### 11.1 Document Dependencies
- Depends on `00_Project_Charter` §3, §4, §5 — LOCKs, ECs, PCs the FBRD enforces.
- Depends on `12_ToolManifestSpecification` — schema the FBRD mirrors.
- Depends on `11_ProductConstitution` — PC-01, PC-02, PC-03, PC-04.
- `06_ArchitectureDecisionRecords` — ADR-054, ADR-055, ADR-056, ADR-057.
- `14_ACD` — components the FBRD references.
- `15_UDS` — UX patterns the FBRD plans for.
- `18_SEOSpecification` — SEO field standards.
- `22_DevelopmentGuideline` — PR workflow.
- `28_Backlog` — where FBRD summaries live.

### 11.2 External Dependencies
- None.

### 11.3 Assumptions
- Tool authors read this template before drafting FBRD entries.
- Reviewers enforce the template.

## 12. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial FBRD. Defined per-feature requirement template mirroring ToolManifest schema, lifecycle transitions, review standards, example FBRD entry. |

## 13. Cross References

- `00_Project_Charter` §3 LOCK-03, LOCK-05, LOCK-12; §5 PC-01, PC-02, PC-03, PC-04 — Implemented.
- `02_SAD` AD-02, AD-03 — Tool Engine and Registry consuming FBRD-driven manifests.
- `06_ArchitectureDecisionRecords` — ADR-054 (One Problem), ADR-055 (Product Contract), ADR-056 (Completion), ADR-057 (Quality Gates).
- `07_FolderStructure` §Tool Folder Template — Where FBRD-driven tools live.
- `11_ProductConstitution` — PC-01 through PC-04 expanded.
- `12_ToolManifestSpecification` — Schema the FBRD mirrors.
- `14_ACD` — Components referenced in FBRD.
- `15_UDS` — UX patterns planned in FBRD.
- `18_SEOSpecification` — SEO standards FBRD enforces.
- `22_DevelopmentGuideline` — PR workflow for FBRD review.
- `25_AI_Guideline` — AI must follow FBRD template (LOCK-09, EC-11).
- `28_Backlog` — Where FBRD summaries live.
