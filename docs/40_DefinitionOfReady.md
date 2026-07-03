# 40 — Definition of Ready

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** EC-01 (Documentation First), PC-02 (Product Contract)

---

## 1. Purpose

This document defines **when work is allowed to begin** on any backlog item. A backlog item is "Ready" when it satisfies all criteria in this checklist. Work on items that are not Ready is forbidden — this prevents starting implementation with incomplete requirements, which leads to rework and quality issues.

## 2. Definition of Ready Checklist

Before any backlog item can be pulled into a sprint, ALL of the following must be true:

### 2.1 Documentation Complete

- [ ] Item has a clear description in `38_ProjectBacklog`.
- [ ] If new tool: FBRD entry drafted per `13_FBRD` template.
- [ ] If architectural change: ADR written or referenced.
- [ ] Relevant documentation reviewed (`34_ZAI_Context`, related docs).
- [ ] Documentation updates planned (EC-01).

### 2.2 ADR References Verified

- [ ] Searched `06_ArchitectureDecisionRecords` for relevant ADRs.
- [ ] All applicable ADRs cited in the item.
- [ ] If new architectural decision: ADR drafted and approved.
- [ ] No conflict with existing ADRs (or supersession proposed).

### 2.3 Dependencies Identified

- [ ] All dependencies on other backlog items identified.
- [ ] Dependencies completed or scheduled.
- [ ] External dependencies (packages, services) identified.
- [ ] No blocked dependencies.

### 2.4 Acceptance Criteria Defined

- [ ] Clear, testable acceptance criteria written.
- [ ] Criteria reviewed by product owner / Chief Architect.
- [ ] Criteria cover functional and non-functional requirements.
- [ ] Criteria include PC-03 completion items (if tool).
- [ ] Criteria include PC-04 quality gates (if tool promotion).

### 2.5 Tests Planned

- [ ] Unit test cases identified.
- [ ] Integration test cases identified (if applicable).
- [ ] E2E test scenarios defined (if user-facing).
- [ ] Accessibility test planned (if UI).
- [ ] Performance test planned (if performance-sensitive).
- [ ] Test fixtures identified or planned.

### 2.6 Performance Impact Reviewed

- [ ] Bundle size impact estimated.
- [ ] Lazy loading plan defined (if applicable).
- [ ] Performance budget verified (`08_CodingStandards` §Performance Budget).
- [ ] Lighthouse target confirmed (Performance ≥90).

### 2.7 Security Reviewed

- [ ] Input validation plan (Zod schemas).
- [ ] Output sanitization plan.
- [ ] Auth/permission requirements identified.
- [ ] No secrets in code (secretlint).
- [ ] RLS policies planned (if DB access).
- [ ] No known security vulnerabilities in dependencies.

### 2.8 SEO Reviewed

- [ ] If tool: manifest `seo` field planned.
- [ ] Target keywords researched.
- [ ] Title and description drafted (within character limits).
- [ ] FAQ items planned (min 3).
- [ ] Breadcrumb planned.
- [ ] Structured data (JSON-LD) planned.
- [ ] Canonical URL defined.

### 2.9 Accessibility Reviewed

- [ ] WCAG AA conformance planned.
- [ ] Keyboard navigation plan.
- [ ] Screen reader considerations.
- [ ] Focus management plan.
- [ ] Color contrast verified (design tokens).
- [ ] Reduced motion plan.
- [ ] Touch target sizes (≥44x44px on mobile).

## 3. Ready Approval Process

```
1. Item author completes checklist.
   ↓
2. Chief Architect or designated reviewer verifies.
   ↓
3. If all criteria met: item marked "Ready" in backlog.
   ↓
4. If criteria not met: feedback provided; item revised.
   ↓
5. Only "Ready" items can be pulled into sprints.
```

## 4. Standards

### 4.1 No Work Without Ready
No engineering work begins on an item until it is marked "Ready." This includes:
- No code written.
- No branches created.
- No files modified.

### 4.2 Ready Can Be Re-evaluated
If circumstances change (new dependency, new ADR, new governance), a "Ready" item can be re-evaluated and potentially marked "Not Ready" again.

### 4.3 Ready ≠ Done
"Ready" means work can begin. "Done" (PC-03) means work is complete. These are different checkpoints.

## 5. Best Practices

### 5.1 When Preparing an Item for Ready
1. Start with documentation (EC-01).
2. Search ADRs thoroughly.
3. Write clear acceptance criteria.
4. Plan tests early.
5. Review with Chief Architect.

### 5.2 When Reviewing for Ready
1. Verify all checklist items.
2. Challenge assumptions.
3. Verify ADR references.
4. Ensure acceptance criteria are testable.
5. Check for missing dependencies.

## 6. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Definition of Ready. 9-section checklist: documentation, ADR references, dependencies, acceptance criteria, tests, performance, security, SEO, accessibility. |

## 7. Cross References

- `00_Project_Charter` §4 EC-01 — Documentation First.
- `06_ArchitectureDecisionRecords` — ADR repository to search.
- `13_FBRD` — Feature requirement template.
- `30_DevelopmentGuideline` — PR workflow (after Ready).
- `38_ProjectBacklog` — Where items are tracked.
- `41_ProjectChecklist` — Master checklist.
