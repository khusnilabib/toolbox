# 35 — AI Development Workflow

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-09 (AI Development Constitution), EC-01 (Documentation First), EC-11 (AI Collaboration Rules)

---

## 1. Purpose

This document defines the **mandatory implementation workflow** for all AI-assisted development in [PROJECT_NAME]. It implements LOCK-09 (AI consistency discipline) and EC-11 (AI collaboration rules). No implementation may bypass this workflow.

## 2. The 10-Step Workflow

### Step 1: Read Governance

**Before any implementation, AI MUST read the relevant governance layers:**

1. Read `00_Project_Charter` §3 (Architectural Locks) — identify which LOCKs apply.
2. Read `00_Project_Charter` §4 (Engineering Constitution) — identify which ECs apply.
3. Read `00_Project_Charter` §5 (Product Constitution) — identify which PCs apply.
4. Read `00_Project_Charter` §6 (Data & Growth Architecture) — identify which DGAs apply.
5. Read `00_Project_Charter` §7 (Platform Operations Constitution) — identify which POCs apply.

**Output:** AI states which governance articles apply to the task.

**Example:**
> "This task involves adding a new tool. Applicable governance: LOCK-02 (browser-first), LOCK-03 (Tool Engine), LOCK-05 (manifest-driven), PC-01 (one problem), PC-02 (product contract), PC-03 (completion standard), PC-04 (quality gates), PC-07 (analytics), DGA-03 (SEO from manifest)."

### Step 2: Read ADR

**Before any architectural decision, AI MUST consult the ADR repository:**

1. Read `06_ArchitectureDecisionRecords` §6 (ADR Index).
2. Search for ADRs related to the task.
3. Identify relevant ADRs (e.g., ADR-026 for Tool Engine, ADR-027 for Registry, ADR-055 for Product Contract).
4. Read the full text of relevant ADRs.

**Output:** AI cites the ADRs that govern the implementation.

**Example:**
> "Relevant ADRs: ADR-026 (Tool Engine as Standardized Lifecycle Pipeline), ADR-027 (Tool Registry for Auto-Discovery), ADR-055 (Every Tool Has a Product Contract), ADR-066 (SEO Metadata as Structured Data)."

### Step 3: Read Related Documents

**AI MUST read all technical documents relevant to the task:**

1. Read `12_ToolManifestSpecification` (if adding/modifying a tool).
2. Read `13_FBRD` (for feature requirements template).
3. Read `07_FolderStructure` §Tool Folder Template.
4. Read `14_ACD` (for reusable components).
5. Read `08_CodingStandards` (for code quality rules).
6. Read any other relevant docs.

**Output:** AI lists the documents read and key takeaways.

### Step 4: Validate Dependencies

**AI MUST validate that all dependencies are in place:**

1. Check existing components in `@packages/ui` (EC-03).
2. Check existing utilities in `@packages/utils`.
3. Check existing hooks in `@/shared/hooks`.
4. Check existing tools for patterns to follow.
5. Verify required packages installed (`package.json`).
6. Verify DB migrations current (if DB-related).

**Output:** AI lists dependencies (existing or needed).

### Step 5: Propose Implementation Plan

**AI MUST propose a detailed implementation plan before coding:**

1. Summarize what will be built.
2. List files to be created/modified.
3. List components to be reused (EC-03).
4. List tests to be written.
5. List documentation to be updated (EC-01).
6. Identify potential risks or trade-offs.
7. Estimate complexity (simple/medium/complex).

**Output:** Written implementation plan.

**Example:**
> "Implementation Plan for Image Resizer tool:
> - Create `src/tools/image/image-resize/` folder.
> - Files: manifest.ts, stages/{input,validation,processing,preview,download}.ts, components/InputForm.tsx, tests/stages.test.ts, tests/e2e.test.ts.
> - Reuse: FileDropzone, ToolLayout, ErrorDisplay from @/shared/components.
> - Tests: unit tests for each stage; E2E for full workflow; accessibility test.
> - Docs: update README tool count; no ADR needed (follows existing pattern).
> - Complexity: Medium (Canvas API processing, standard pattern).
> - Risks: Large image files may cause memory issues; mitigated by 10MB limit in manifest."

### Step 6: Wait for Approval

**AI MUST NOT implement without human approval:**

1. Present the implementation plan.
2. Wait for explicit approval ("go ahead", "approved", etc.).
3. If modifications requested: revise plan and re-present.
4. If rejected: do not implement; ask for clarification.

**Output:** AI waits. No code written until approval received.

**Rule:** "No implementation should bypass this workflow." (Per user mandate.)

### Step 7: Implement

**After approval, AI implements following the plan:**

1. Create/modify files per the approved plan.
2. Follow coding standards (`08_CodingStandards`).
3. Use design system components (EC-10).
4. Write TypeScript strict code.
5. Validate all IO with Zod (EC-08).
6. Follow Tool Engine lifecycle (LOCK-03).
7. Implement all 13 PC-03 completion items.
8. Write tests alongside implementation (EC-09).

**Output:** Code written, tests written.

### Step 8: Self-Review

**AI MUST self-review its implementation before requesting human review:**

1. Run `pnpm lint` — fix all issues.
2. Run `pnpm type-check` — fix all type errors.
3. Run `pnpm test` — verify all tests pass.
4. Run `pnpm build` — verify build succeeds.
5. Review against `08_CodingStandards` §13 checklist.
6. Verify governance compliance (LOCKs, ECs, PCs, DGAs, POCs).
7. Check for duplication (EC-02, EC-03).
8. Verify accessibility (WCAG AA).
9. Verify performance (bundle size, lazy loading).
10. Verify security (input validation, no secrets).

**Output:** Self-review report. Fix any issues found.

### Step 9: Update Documentation

**AI MUST update documentation in the same PR as code (EC-01):**

1. Update tool README (if tool added/modified).
2. Update `docs/` if architectural change.
3. Update ADR if architectural decision changed.
4. Update revision history in modified docs.
5. Verify cross-references are live.
6. Update generated files if manifest changed (`pnpm gen:registry`).

**Output:** Documentation updated; revision history bumped.

### Step 10: Verify Quality Gates

**AI MUST verify all applicable quality gates (PC-04) before requesting promotion:**

1. **Functional:** All manifest-declared features work; tests pass.
2. **Accessibility:** WCAG AA; Lighthouse ≥95; keyboard/screen reader tested.
3. **Performance:** Lighthouse ≥90; bundle <200KB; TTFB <500ms.
4. **SEO:** All `21_SEOSpecification` requirements; structured data valid.
5. **Security:** Input validated; no secrets; RLS policies.
6. **Documentation:** README complete; ADRs updated; manifest accurate.
7. **UX:** PC-05 layout; PC-08 errors; mobile usable.

**Output:** Quality gate verification report. Any failures must be fixed before promotion to Stable.

## 3. Workflow Enforcement

### 3.1 No Bypassing

This workflow is mandatory. No implementation may bypass it. If a task seems too small for the full workflow, AI MUST still:
- Read applicable governance (Step 1).
- Check ADR repository (Step 2).
- Propose plan (Step 5) — even if brief.
- Wait for approval (Step 6).
- Self-review (Step 8).
- Update docs if needed (Step 9).

### 3.2 Exceptions

Exceptions require Chief Architect approval and ADR documentation. Examples:
- Emergency hotfix (may skip Steps 5-6, but must do Steps 7-10).
- Trivial typo fix (may skip Steps 1-6, but must do Step 8).

### 3.3 Audit Trail

AI should document which steps were followed. This can be in the PR description:
> "Followed AI Development Workflow: Steps 1-10 complete. Governance: LOCK-02, LOCK-03, PC-02. ADRs: ADR-026, ADR-027. Quality gates: all 7 passed."

## 4. Standards

### 4.1 Workflow Compliance Standards
- Every AI implementation follows all 10 steps.
- No bypassing without documented exception.
- Steps documented in PR description.

### 4.2 Documentation Standards
- Step 1 output: list of applicable governance articles.
- Step 2 output: list of relevant ADRs.
- Step 5 output: written implementation plan.
- Step 8 output: self-review report.
- Step 10 output: quality gate verification.

## 5. Best Practices

### 5.1 For AI
- Be thorough in Steps 1-4; rushing leads to rework.
- Be detailed in Step 5; vague plans get rejected.
- Be honest in Step 8; self-review catches issues before human review.
- Be complete in Step 9; documentation is mandatory.

### 5.2 For Human Reviewers
- Verify Steps 1-4 were done (governance cited, ADRs referenced).
- Review Step 5 plan before approving.
- Check Step 8 self-review report.
- Verify Step 9 documentation updated.
- Confirm Step 10 quality gates passed.

## 6. Dependencies

- Depends on `00_Project_Charter` §3 LOCK-09, §4 EC-01, EC-11.
- `06_ArchitectureDecisionRecords` — consulted in Step 2.
- `08_CodingStandards` — followed in Step 7, checked in Step 8.
- `12_ToolManifestSpecification` — read in Step 3 for tools.
- `30_DevelopmentGuideline` — PR workflow.
- `33_AI_Guideline` — AI behavior rules.
- `34_ZAI_Context` — Project memory for context.

## 7. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial AI Development Workflow. Defined mandatory 10-step workflow: Read Governance → Read ADR → Read Docs → Validate Dependencies → Propose Plan → Wait for Approval → Implement → Self-Review → Update Docs → Verify Quality Gates. |

## 8. Cross References

- `00_Project_Charter` §3 LOCK-09, §4 EC-01, EC-11 — Implemented.
- `06_ArchitectureDecisionRecords` — Consulted in Step 2.
- `08_CodingStandards` §13 — Self-review checklist (Step 8).
- `12_ToolManifestSpecification` — Read in Step 3 for tools.
- `13_FBRD` — Feature requirements template.
- `30_DevelopmentGuideline` — PR workflow and quality gates.
- `33_AI_Guideline` — AI behavior rules.
- `34_ZAI_Context` — Project memory.
