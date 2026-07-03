# 27 — Backup and Recovery

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** POC-05 (Backup & Recovery), EC-08 (Security by Default), DGA-01 (Database as Product Service)

---

## 1. Purpose

This Backup and Recovery document defines **backup strategy, recovery objectives, and procedures** for [PROJECT_NAME]. It implements POC-05 (critical data has documented backup/recovery with defined RPO and RTO).

## 2. Scope

### 2.1 In Scope
- Backup strategy (what, when, where).
- Recovery Point Objective (RPO) and Recovery Time Objective (RTO).
- Recovery procedures.
- Backup verification and testing.
- Enterprise disaster recovery (Phase 3+).

### 2.2 Out of Scope
- Database schema → `19_DatabaseDesign`.
- Deployment topology → `25_DeploymentArchitecture`.
- Incident management → `28_ReleaseManagement`.

## 3. Architectural Decisions

### AD-01 — Supabase Automated Backups

**Context.** Supabase provides automated daily backups on free tier (7-day retention). This is sufficient for Phase 1.

**Decision.** Rely on Supabase automated daily backups for Phase 1. Phase 2+: Supabase Pro tier for point-in-time recovery (7-day PITR, 30-day backups).

### AD-02 — Defined RPO and RTO

**Context.** POC-05 mandates defined recovery objectives.

**Decision.**
- **RPO (Recovery Point Objective):** 24 hours (daily backup). Max data loss: 1 day.
- **RTO (Recovery Time Objective):** 4 hours. Max downtime during recovery.
- Phase 2+: RPO reduced to 1 hour (PITR). RTO reduced to 1 hour.

### AD-03 — Backup Verification

**Context.** Untested backups are untrusted backups.

**Decision.** Quarterly recovery drill: restore backup to staging environment, verify data integrity, document recovery time. Drill results recorded in engineering meeting notes.

### AD-04 — Critical Data Identification

**Context.** Not all data needs the same backup urgency. DGA-01 mandates only long-term-value data is persisted.

**Decision.** Critical data (must backup):
- `identity.users` — user accounts.
- `identity.history_entries` — user history.
- `identity.favorites` — user favorites.
- `content.articles` — published content.
- `platform_ops.audit_entries` — audit logs (compliance).
- `platform_ops.feature_flags` — flag configurations.
- `analytics.daily_aggregates` — growth metrics.

Non-critical data (regeneratable):
- `analytics.events` (raw events, 90-day retention; aggregates persist).
- `platform_ops.system_health_checks` (transient).
- Tool manifests (in code, backed by Git).

## 4. Recovery Procedures

### 4.1 Database Recovery (Supabase)

```
1. Identify recovery point (which backup to restore).
   ↓
2. Contact Supabase support (free tier) OR use dashboard (Pro tier).
   ↓
3. Supabase restores backup to a new project.
   ↓
4. Verify data integrity:
   - Check user count.
   - Check recent articles.
   - Check audit entries.
   ↓
5. Update application to point to restored project.
   ↓
6. Verify application functionality.
   ↓
7. Document recovery in incident report (POC-07).
```

### 4.2 Code Recovery (Git)

```
1. Identify last known good commit.
   ↓
2. Revert to that commit (git revert or rollback deploy).
   ↓
3. Deploy via CI/CD.
   ↓
4. Verify functionality.
```

### 4.3 Configuration Recovery (Vercel Env Vars)

```
1. Identify lost configuration.
   ↓
2. Restore from documentation (.env.example + team knowledge).
   ↓
3. Re-add to Vercel env vars.
   ↓
4. Redeploy.
```

## 5. Standards

### 5.1 Backup Standards
- Daily automated backup (Supabase).
- 7-day retention (free tier); 30-day retention (Pro tier, Phase 2+).
- Quarterly recovery drill.
- Backup status checked in monthly ops review.

### 5.2 Recovery Standards
- RPO: 24 hours (Phase 1); 1 hour (Phase 2+).
- RTO: 4 hours (Phase 1); 1 hour (Phase 2+).
- Recovery procedures documented and accessible.
- Recovery drill results documented.

### 5.3 Data Classification Standards
- Critical data: user accounts, history, favorites, content, audit, flags, aggregates.
- Non-critical data: raw events, health checks, manifests (in Git).

## 6. Best Practices

### 6.1 When Adding New Data
1. Classify as critical or non-critical.
2. If critical: verify included in Supabase backup (automatic).
3. Document in this file's critical data list.

### 6.2 When Testing Recovery
1. Schedule quarterly drill.
2. Restore to staging (not production).
3. Verify data integrity.
4. Measure recovery time (compare to RTO).
5. Document results.
6. Improve procedures if RTO exceeded.

## 7. Future Expansion

### 7.1 Point-in-Time Recovery (Phase 2+)
- Supabase Pro tier.
- RPO reduced to 1 hour.
- Recovery to any point in last 7 days.

### 7.2 Multi-Region Backup (Phase 3+)
- Cross-region replication.
- Disaster recovery for regional outage.
- RTO reduced to 30 minutes.

### 7.3 Enterprise Disaster Recovery (Phase 4+)
- Dedicated DR environment.
- Automated failover.
- Custom RPO/RTO per enterprise contract.

## 8. Dependencies

- Depends on `00_Project_Charter` §7 POC-05.
- Depends on `04_TechStack` AD-03 (Supabase).
- `06_ArchitectureDecisionRecords` — ADR-078.
- `19_DatabaseDesign` — Database schema being backed up.
- `25_DeploymentArchitecture` — Deployment environment for recovery.
- `28_ReleaseManagement` — Incident management for recovery scenarios.

## 9. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Backup and Recovery. Defined Supabase automated backups, RPO (24h) and RTO (4h), recovery procedures, critical data classification, quarterly recovery drill. |

## 10. Cross References

- `00_Project_Charter` §7 POC-05 — Implemented.
- `04_TechStack` AD-03 — Supabase provides backup infrastructure.
- `06_ArchitectureDecisionRecords` — ADR-078 (Backup & Recovery).
- `19_DatabaseDesign` — Database schema being backed up.
- `25_DeploymentArchitecture` — Recovery environment.
- `28_ReleaseManagement` — Incident management for recovery scenarios.
- `32_DeploymentGuide` — Operational backup verification.
