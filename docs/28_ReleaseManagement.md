# 28 — Release Management

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** POC-03 (Release Strategy), POC-04 (Rollback Strategy), POC-07 (Incident Management)

---

## 1. Purpose

This Release Management document defines the **release workflow, rollback procedures, and incident management lifecycle** for [PROJECT_NAME]. It implements POC-03 (predictable release workflow), POC-04 (rollback strategy), and POC-07 (incident management lifecycle).

## 2. Scope

### 2.1 In Scope
- Release workflow (branch → PR → CI → deploy).
- Versioning strategy.
- Rollback procedures.
- Incident management lifecycle.
- Postmortem process.
- Release notes.

### 2.2 Out of Scope
- Environment topology → `25_DeploymentArchitecture`.
- CI/CD configuration → `30_DevelopmentGuideline`.
- Backup/recovery → `27_BackupAndRecovery`.

## 3. Architectural Decisions

### AD-01 — Trunk-Based Development

**Context.** Long-lived feature branches create merge conflicts and delay feedback. Trunk-based development (short-lived branches, frequent merges) enables faster delivery.

**Decision.** Trunk-based development with short-lived feature branches. Branches merged within 2-3 days. Feature flags (DGA-06) gate incomplete features in production. `main` branch is always deployable.

### AD-02 — Semantic Versioning

**Context.** Without versioning, releases are ambiguous. Semver is the industry standard.

**Decision.** Platform version follows semver: `MAJOR.MINOR.PATCH`. Phase 1: 0.x.y (pre-1.0, breaking changes allowed). Phase 2+: 1.0.0+ (breaking changes require major bump). Tool versions are independent (per manifest's `version` field).

### AD-03 — Instant Rollback via Vercel

**Context.** POC-04 mandates every deployment supports rollback. Long rollback procedures extend downtime.

**Decision.** Vercel's instant rollback for application code: one click in Vercel dashboard reverts to previous deployment. DB migrations follow forward-compatible pattern (additive first; breaking changes multi-step). Rollback documented per service.

### AD-04 — Incident Lifecycle (POC-07)

**Context.** POC-07 mandates standard incident lifecycle. Without it, incidents are chaotic.

**Decision.** Standard lifecycle:
1. **Detected:** Monitoring alert or user report.
2. **Acknowledged:** On-call engineer acknowledges within SLA.
3. **Investigating:** Root cause analysis.
4. **Mitigated:** Service restored (may not be root-caused yet).
5. **Resolved:** Root cause fixed.
6. **Postmortem:** Written within 48 hours; published internally; ADR if architectural change.

## 4. Release Workflow

### 4.1 Feature Branch Workflow

```
1. Create branch: feature/[description] or fix/[description]
   ↓
2. Develop locally (pnpm dev)
   ↓
3. Run checks: pnpm lint && pnpm test && pnpm build
   ↓
4. Commit with conventional commit message
   ↓
5. Push branch
   ↓
6. CI runs: lint, type-check, unit tests, build, security scan
   ↓
7. Open PR to main
   ↓
8. Vercel creates Preview deployment
   ↓
9. Reviewer tests on Preview URL
   ↓
10. Reviewer approves PR
    ↓
11. Merge to main (squash merge)
    ↓
12. Vercel deploys to Development → Production
    ↓
13. Post-deploy monitoring (30 min)
```

### 4.2 Conventional Commits

```
feat: add image resize tool
fix: correct PDF merge order bug
docs: update API convention
refactor: extract validation logic
chore: update dependencies
```

### 4.3 Release Notes

- Auto-generated from commit messages (Phase 2+).
- Manual release notes for major features.
- Published in GitHub Releases.
- Linked in admin dashboard.

## 5. Rollback Procedures

### 5.1 Application Code Rollback

```
1. Detect issue (monitoring alert or user report)
   ↓
2. Go to Vercel dashboard → Deployments
   ↓
3. Find last known good deployment
   ↓
4. Click "Instant Rollback"
   ↓
5. Verify service restored
   ↓
6. Document rollback in incident report
   ↓
7. Investigate root cause (post-rollback)
```

### 5.2 Database Migration Rollback

**Forward-compatible migrations (preferred):**
- Additive changes (new column, new table) are safe; no rollback needed.
- If new code doesn't work, rollback application code; old code ignores new columns.

**Breaking migrations (multi-step):**
1. Add new column alongside old.
2. Deploy code writing to both.
3. Backfill new column from old.
4. Deploy code reading from new only.
5. Drop old column (after verification period).

**Emergency rollback of breaking migration:**
- If step 4 or 5 fails: restore from backup (POC-05), accept data loss since last backup.

## 6. Incident Management

### 6.1 Incident Lifecycle

| Stage | Action | SLA |
|-------|--------|-----|
| Detected | Alert triggered or user report | N/A |
| Acknowledged | On-call acknowledges | SEV-1: 15min, SEV-2: 1hr, SEV-3: 4hr |
| Investigating | Root cause analysis | Ongoing |
| Mitigated | Service restored | ASAP |
| Resolved | Root cause fixed | SEV-1: 24hr, SEV-2: 72hr, SEV-3: next sprint |
| Postmortem | Written and published | Within 48hr of resolution |

### 6.2 Incident Communication

- **Internal:** Slack/Discord incident channel.
- **External (SEV-1/SEV-2):** Status page update within 30 minutes.
- **Post-incident:** Postmortem published; affected users notified if data loss.

### 6.3 Postmortem Process

```
1. Incident resolved
   ↓
2. Postmortem author assigned (not the person who caused it)
   ↓
3. Postmortem written within 48 hours:
   - Timeline of events
   - Root cause
   - Contributing factors
   - What went well
   - What went poorly
   - Action items (with owners and deadlines)
   ↓
4. Postmortem reviewed in weekly engineering meeting
   ↓
5. Action items tracked to completion
   ↓
6. ADR created if architectural change needed (POC-07)
```

## 7. Standards

### 7.1 Release Standards
- `main` branch always deployable.
- Feature branches merged within 2-3 days.
- All CI checks pass before merge.
- Squash merge with conventional commit message.
- Post-deploy monitoring for 30 minutes.

### 7.2 Rollback Standards
- Rollback available within 1 click (Vercel).
- Rollback documented in incident report.
- DB migrations forward-compatible whenever possible.
- Breaking migrations follow multi-step pattern.

### 7.3 Incident Standards
- Standard lifecycle per AD-04.
- Postmortem within 48 hours.
- Postmortem includes action items.
- ADR created if architectural change needed.
- Status page updated for SEV-1/SEV-2.

## 8. Best Practices

### 8.1 When Releasing
1. Verify CI passes.
2. Test on Preview deployment.
3. Merge to main.
4. Monitor post-deploy (30 min).
5. If issues: rollback immediately.

### 8.2 When Responding to Incidents
1. Acknowledge within SLA.
2. Mitigate first, root-cause later.
3. Communicate status.
4. Document timeline.
5. Write postmortem within 48 hours.

### 8.3 When Writing Postmortems
- Blameless (focus on systems, not people).
- Include timeline.
- Identify root cause.
- List action items with owners.
- Publish internally.

## 9. Future Expansion

### 9.1 Release Train (Phase 2+)
- Scheduled releases (weekly or biweekly).
- Release manager role.
- Formal release notes.

### 9.2 Canary Deployments (Phase 3+)
- Gradual rollout to percentage of users.
- Automatic rollback on error rate spike.
- Feature flag integration (DGA-06).

### 9.3 Chaos Engineering (Phase 4+)
- Regular chaos exercises.
- Verify degradation paths (POC-01).
- Build resilience confidence.

## 10. Dependencies

- Depends on `00_Project_Charter` §7 POC-03, POC-04, POC-07.
- `06_ArchitectureDecisionRecords` — ADR-076, ADR-077, ADR-080.
- `25_DeploymentArchitecture` — Deployment environments.
- `26_ObservabilitySpecification` — Monitoring for incident detection.
- `27_BackupAndRecovery` — Recovery for severe incidents.
- `30_DevelopmentGuideline` — CI/CD and PR workflow.

## 11. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Release Management. Defined trunk-based development, semantic versioning, instant rollback via Vercel, incident lifecycle (Detected → Acknowledged → Investigating → Mitigated → Resolved → Postmortem), postmortem process. |

## 12. Cross References

- `00_Project_Charter` §7 POC-03, POC-04, POC-07 — Implemented.
- `06_ArchitectureDecisionRecords` — ADR-076 (Release Strategy), ADR-077 (Rollback Strategy), ADR-080 (Incident Management).
- `24_PlatformOperationsConstitution` — Expands POC articles.
- `25_DeploymentArchitecture` — Deployment environments.
- `26_ObservabilitySpecification` — Monitoring for incident detection.
- `27_BackupAndRecovery` — Recovery for severe incidents.
- `30_DevelopmentGuideline` — CI/CD and PR workflow.
- `32_DeploymentGuide` — Operational deployment procedures.
