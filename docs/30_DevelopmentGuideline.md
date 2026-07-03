# 30 — Development Guideline

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** EC-01 (Documentation First), EC-11 (AI Collaboration), PC-03 (Tool Completion Standard), PC-04 (Quality Gates)

---

## 1. Purpose

This Development Guideline defines the **development workflow, branching strategy, PR process, code review, and definition of done** for [PROJECT_NAME]. It implements EC-01 (documentation first), EC-11 (AI collaboration rules), PC-03 (tool completion standard), and PC-04 (quality gates).

## 2. Scope

### 2.1 In Scope
- Branching strategy (trunk-based).
- PR workflow (open, review, merge).
- Code review checklist.
- Definition of Done (PC-03).
- Quality gates (PC-04).
- AI-assisted development rules (EC-11).
- CI/CD pipeline configuration.

### 2.2 Out of Scope
- Coding standards → `08_CodingStandards`.
- Testing strategy → `31_TestingStrategy`.
- Release management → `28_ReleaseManagement`.
- Deployment architecture → `25_DeploymentArchitecture`.

## 3. Architectural Decisions

### AD-01 — Trunk-Based Development

**Context.** Short-lived branches with frequent merges enable faster feedback and reduce merge conflicts.

**Decision.** Trunk-based development. Feature branches (`feature/[description]`) or fix branches (`fix/[description]`) merged to `main` within 2-3 days. `main` is always deployable. Feature flags (DGA-06) gate incomplete features.

### AD-02 — PR-Based Code Review

**Context.** Without mandatory review, code quality depends on individual discipline.

**Decision.** Every change requires a PR. PR must be reviewed by at least one other engineer before merge. CI must pass. Documentation must be updated (EC-01). ADR must be updated if architectural change.

### AD-03 — Definition of Done (PC-03)

**Context.** PC-03 mandates 13 completion items. Without a formal "definition of done," tools ship incomplete.

**Decision.** A tool is "done" when ALL 13 items are complete:
1. Upload/Input implemented.
2. Validation implemented (Zod).
3. Processing stage implemented.
4. Preview component implemented.
5. Download/Copy implemented.
6. Error Handling (PC-08 compliant).
7. Success Feedback.
8. Accessibility (WCAG AA, keyboard, screen reader, reduced motion).
9. Mobile Support (360px viewport, 44x44px touch targets).
10. SEO (all `21_SEOSpecification` requirements).
11. Analytics (all PC-07 events emitting).
12. Documentation (README complete, ADRs updated).
13. Tests (unit + E2E + accessibility).

### AD-04 — Quality Gates (PC-04)

**Context.** PC-04 mandates 7 quality gates before promotion to Stable.

**Decision.** Tool cannot reach `Stable` lifecycle without passing:
1. **Functional review:** All manifest-declared features work; tests pass.
2. **Accessibility review:** WCAG AA; Lighthouse ≥95; keyboard/screen reader tested.
3. **Performance review:** Lighthouse ≥90; bundle within budget; TTFB <500ms.
4. **SEO review:** All `21_SEOSpecification` requirements; structured data valid.
5. **Security review:** Input validation; no secrets; RLS policies.
6. **Documentation review:** README complete; ADRs updated; manifest accurate.
7. **UX review:** PC-05 layout; PC-08 errors; mobile usable.

### AD-05 — AI-Assisted Development (EC-11)

**Context.** EC-11 mandates AI preserves consistency, references docs, asks before assuming.

**Decision.** AI-assisted development rules:
- AI must search existing components before creating new (EC-03).
- AI must reference ADRs before proposing architectural changes.
- AI must not introduce dependencies without approval (LOCK-09).
- AI must not change architecture/folder conventions without approval.
- AI must update documentation in the same PR as code (EC-01).
- AI must ask before assuming when uncertain.

## 4. Branching Strategy

### 4.1 Branch Naming

```
feature/[description]    # New feature (e.g., feature/image-resize-tool)
fix/[description]        # Bug fix (e.g., fix/pdf-merge-order)
docs/[description]       # Documentation only (e.g., docs/update-api-convention)
chore/[description]      # Maintenance (e.g., chore/update-dependencies)
```

### 4.2 Commit Messages (Conventional Commits)

```
feat: add image resize tool
fix: correct PDF merge order bug
docs: update API convention
refactor: extract validation logic
chore: update dependencies
test: add E2E test for image resize
```

### 4.3 Merge Strategy

- **Squash merge:** All commits in branch squashed into one commit on `main`.
- **Commit message:** PR title (conventional commit format).
- **Branch cleanup:** Branch deleted after merge.

## 5. PR Workflow

### 5.1 Opening a PR

```
1. Create branch from main
   ↓
2. Develop and test locally
   ↓
3. Run: pnpm lint && pnpm test && pnpm build
   ↓
4. Update documentation (EC-01)
   ↓
5. Commit with conventional commit message
   ↓
6. Push branch
   ↓
7. Open PR with description:
   - What changed
   - Why
   - How to test
   - Screenshots (if UI change)
   - Documentation updated? (Y/N)
   - ADR updated? (Y/N)
   ↓
8. CI runs: lint, type-check, unit tests, build, security scan
   ↓
9. Vercel creates Preview deployment
   ↓
10. Request review
```

### 5.2 Reviewing a PR

Reviewer checklist (per `08_CodingStandards` §13):
- [ ] Architecture & Boundaries: No boundary violations; no `any`; file size within limits.
- [ ] Type Safety: Zod at boundaries; no unjustified `as` or `!`.
- [ ] Security: Input validated; output sanitized; no secrets; RBAC checks.
- [ ] Performance: Bundle within budget; lazy loading; no unnecessary re-renders.
- [ ] Testing: Tests added; coverage maintained; E2E for user flows.
- [ ] Design System: No inline styles; tokens used; dark mode; accessibility.
- [ ] Documentation: Docs updated; ADR updated if architectural; JSDoc for public APIs.
- [ ] DRY & Reuse: No duplication; existing components extended.
- [ ] PC-01 (if new tool): Single problem?
- [ ] PC-03 (if new tool): All 13 completion items?

### 5.3 Merging a PR

```
1. All CI checks pass
   ↓
2. At least one approval from reviewer
   ↓
3. Documentation verified updated (EC-01)
   ↓
4. Squash merge to main
   ↓
5. Branch deleted
   ↓
6. Vercel deploys (Preview → Development → Production)
   ↓
7. Post-deploy monitoring (30 min)
```

## 6. CI/CD Pipeline

### 6.1 GitHub Actions Workflow

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit
      - run: pnpm secretlint

  lighthouse:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      # Lighthouse CI against Vercel Preview deployment
      - run: pnpm lhci
```

### 6.2 Pre-Commit Hooks (Husky + lint-staged)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{md,json}": ["prettier --write"]
  }
}
```

## 7. Standards

### 7.1 Development Standards
- `main` always deployable.
- Feature branches merged within 2-3 days.
- All PRs require review.
- Documentation updated in same PR (EC-01).
- ADR updated if architectural change.

### 7.2 Quality Gate Standards
- 7 gates must pass before `Stable` promotion (PC-04).
- Each gate has objective criteria.
- Gate reviewers documented.
- Gate failures block promotion.

### 7.3 AI Collaboration Standards
- AI searches existing components before creating (EC-03).
- AI references ADRs before architectural proposals.
- AI asks before assuming.
- AI doesn't introduce dependencies without approval.

## 8. Best Practices

### 8.1 When Starting a New Tool
1. Read `13_FBRD` template.
2. Draft FBRD entry (PC-02 product contract).
3. Get FBRD approved.
4. Create tool folder from template.
5. Implement manifest.
6. Implement stages.
7. Write tests.
8. Open PR.
9. Pass quality gates (PC-04).
10. Promote to Stable.

### 8.2 When Reviewing Code
- Use the review checklist (§5.2).
- Be constructive, not critical.
- Verify documentation updated.
- Test on Preview deployment.
- Approve only when fully satisfied.

### 8.3 When Using AI
- Provide AI with relevant docs.
- Verify AI follows conventions (LOCK-09).
- Review AI-generated code carefully.
- Don't let AI introduce dependencies without approval.

## 9. Future Expansion

### 9.1 Automated Quality Gates (Phase 2+)
- Lighthouse CI blocks PR if score below budget.
- axe-core accessibility CI.
- Bundle size CI.

### 9.2 Staging Environment (Phase 2+)
- Dedicated staging environment for QA.
- Automated smoke tests post-deploy.

### 9.3 Feature Branch Testing (Phase 3+)
- Automated E2E tests on Preview deployments.
- Visual regression testing.

## 10. Dependencies

- Depends on `00_Project_Charter` §4 EC-01, EC-11, §5 PC-03, PC-04.
- `06_ArchitectureDecisionRecords` — ADR-013, ADR-023, ADR-056, ADR-057.
- `08_CodingStandards` — Code review checklist.
- `13_FBRD` — Tool feature requirements.
- `28_ReleaseManagement` — Release workflow.
- `31_TestingStrategy` — Testing standards.

## 11. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Development Guideline. Defined trunk-based development, PR workflow, code review checklist, definition of done (PC-03), quality gates (PC-04), AI-assisted development rules (EC-11), CI/CD pipeline. |

## 12. Cross References

- `00_Project_Charter` §4 EC-01, EC-11, §5 PC-03, PC-04 — Implemented.
- `06_ArchitectureDecisionRecords` — ADR-013 (Documentation First), ADR-023 (AI Collaboration), ADR-056 (Completion Standard), ADR-057 (Quality Gates).
- `08_CodingStandards` §13 — Code review checklist.
- `13_FBRD` — Tool feature template (prerequisite for development).
- `22_UserFlow` — User flows tested during development.
- `28_ReleaseManagement` — Release workflow after development.
- `31_TestingStrategy` — Testing standards during development.
- `33_AI_Guideline` — AI collaboration detailed.
