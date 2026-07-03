# 24 — Platform Operations Constitution

> **Status:** 🟢 Approved (🔧 Constitutional)
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** POC-01 through POC-10 (expanded from `00_Project_Charter` §7)

---

## 1. Purpose

This Platform Operations Constitution expands the ten Platform Operations Constitution articles (POC-01 through POC-10) established in `00_Project_Charter` §7 into operational detail. Where the charter establishes the articles as binding commitments, this document defines what each article means in practice: what it requires, what it forbids, how it's enforced, and how it interacts with the other governance layers.

The POC is the fifth governance tier, sitting below the Architectural Locks (§3), Engineering Constitution (§4), Product Constitution (§5), and Data & Growth Architecture (§6), and above all technical documents. It binds every deployment, monitoring configuration, backup procedure, security control, incident response, and cost consideration with the same authority. **Operational decisions are architectural decisions** — a deployment that violates POC-01 through POC-10 cannot proceed to production.

## 2. Scope

### 2.1 In Scope
- Detailed expansion of each POC article (POC-01 through POC-10).
- Enforcement mechanisms for each article.
- Interaction between POC and other governance layers.
- Operational audit checklist for production deployment.
- Exception process.

### 2.2 Out of Scope
- Deployment topology details → `25_DeploymentArchitecture`.
- Observability implementation → `26_ObservabilitySpecification`.
- Backup procedures → `27_BackupAndRecovery`.
- Release workflow → `28_ReleaseManagement`.

## 3. POC Articles (Detailed)

### 3.1 POC-01 — Reliability First

**Binding text:** The platform MUST continue operating despite partial failures (DB, analytics, AI, storage, third-party API). Graceful degradation is mandatory.

**Operational meaning:** Every external dependency has a documented degradation path. Tools continue functioning (LOCK-02, LOCK-06). Non-critical features degrade gracefully (history unavailable, analytics queued, AI shows retry). The platform never shows a blank page or generic 500 error.

**Enforcement:** Pre-deployment checklist verifies degradation paths. `26_ObservabilitySpecification` monitors dependency health. Incidents trigger POC-07 lifecycle.

### 3.2 POC-02 — Observability by Default

**Binding text:** Every subsystem exposes logs, metrics, health checks, error reports, performance measurements. Built in, not bolted on.

**Operational meaning:** Every serverless function logs structured JSON. Every API route emits duration + status metrics. Every tool execution emits analytics events (PC-07). Health check endpoints at `/api/health` for each subsystem. Error tracking via Sentry. Performance via Vercel Analytics + Lighthouse CI.

**Enforcement:** Code review verifies logging. CI runs Lighthouse. `26_ObservabilitySpecification` defines standards.

### 3.3 POC-03 — Release Strategy

**Binding text:** Predictable workflow: Local → Development → Preview → Production. Every deployment reproducible.

**Operational meaning:** Four environments: Local (developer machine), Development (shared staging), Preview (per-PR deployment), Production. Every deployment from CI/CD pipeline (GitHub Actions → Vercel). No manual deployments. Every deployment tagged with git SHA.

**Enforcement:** CI/CD pipeline is the only deployment path. Manual production deploys forbidden. `28_ReleaseManagement` defines workflow.

### 3.4 POC-04 — Rollback Strategy

**Binding text:** Every deployment supports rollback. Procedures documented. DB migrations forward-compatible when possible.

**Operational meaning:** Vercel's instant rollback for application code. DB migrations are additive (new columns, new tables) wherever possible. Breaking migrations follow multi-step pattern (add → deploy → backfill → deploy → drop). Rollback procedures documented per service.

**Enforcement:** Pre-deployment checklist verifies rollback plan. `28_ReleaseManagement` §Rollback documents procedures.

### 3.5 POC-05 — Backup & Recovery

**Binding text:** Critical data has documented backup/recovery. RPO and RTO defined.

**Operational meaning:** Supabase automated daily backups (free tier: 7-day retention). Phase 2+: Point-in-time recovery (Pro tier). RPO: 24 hours (daily backup). RTO: 4 hours (time to restore). Recovery procedures documented and tested quarterly.

**Enforcement:** `27_BackupAndRecovery` documents procedures. Quarterly recovery drills.

### 3.6 POC-06 — Operational Security

**Binding text:** Least privilege for env vars, service accounts, deploy tokens, DB creds, admin access. Sensitive ops auditable.

**Operational meaning:** Env vars in Vercel (never committed). Service accounts per environment. Deploy tokens per environment. DB credentials via Supabase (RLS enforced). Admin access via RBAC (`23_RBAC`). All sensitive operations audited (DGA-07).

**Enforcement:** `secretlint` in pre-commit. Vercel access reviewed monthly. `23_RBAC` enforces admin access. Audit logs immutable.

### 3.7 POC-07 — Incident Management

**Binding text:** Standard lifecycle: Detected → Acknowledged → Investigating → Mitigated → Resolved → Postmortem. Significant incidents produce docs + ADRs.

**Operational meaning:** Incidents detected via monitoring (POC-08) or user reports. Acknowledged within 15 minutes (business hours). Investigating: root cause analysis. Mitigated: service restored. Resolved: root cause fixed. Postmortem: written within 48 hours, published internally, ADR if architectural change needed.

**Enforcement:** `28_ReleaseManagement` §Incident Management defines lifecycle. Postmortems reviewed in weekly engineering meeting.

### 3.8 POC-08 — Monitoring Standards

**Binding text:** Minimum monitoring: uptime, response time, error rate, build status, deploy status, API health, DB health. Dashboard-ready.

**Operational meaning:** Uptime monitoring (UptimeRobot or Vercel). Response time (Vercel Analytics). Error rate (Sentry). Build status (GitHub Actions). Deploy status (Vercel). API health (`/api/health` endpoints). DB health (Supabase dashboard). All metrics on admin dashboard.

**Enforcement:** `26_ObservabilitySpecification` defines monitoring standards. Admin dashboard shows all metrics.

### 3.9 POC-09 — Cost Awareness

**Binding text:** Infrastructure monitored for cost efficiency (compute, storage, DB, bandwidth, build minutes). Optimize for sustainable growth.

**Operational meaning:** Monthly cost review (Vercel, Supabas, Sentry dashboards). Cost per MAU tracked. Alert at 80% of free tier limits. Architecture decisions consider cost impact. Optimize before upgrading to paid tier.

**Enforcement:** Monthly cost report in engineering meeting. `26_ObservabilitySpecification` §Cost Monitoring defines tracking.

### 3.10 POC-10 — Future Enterprise Operations

**Binding text:** Operational model supports enterprise migration without architectural redesign.

**Operational meaning:** Free-tier infrastructure (Vercel, Supabase, GitHub) is swappable. Migration paths documented (`04_TechStack` §Upgrade Paths). No free-tier-specific optimizations that block migration. Enterprise features (SSO, audit export, custom SLAs) architecturally prepared.

**Enforcement:** `25_DeploymentArchitecture` §Enterprise Migration documents path. Architecture review verifies no free-tier lock-in.

## 4. Standards

### 4.1 Pre-Deployment Checklist
Before any production deployment:
- [ ] All tests pass (unit, integration, E2E).
- [ ] Lighthouse scores within budget (performance ≥90, accessibility ≥95, SEO ≥95).
- [ ] Rollback plan documented.
- [ ] Observability verified (logs, metrics, health checks).
- [ ] No secrets in code (`secretlint` passes).
- [ ] ADR updated if architectural change.
- [ ] Feature flags configured if gradual rollout.

### 4.2 Incident Severity Levels
| Level | Definition | Response Time |
|-------|-----------|---------------|
| SEV-1 | Platform down; all users affected | 15 minutes |
| SEV-2 | Major feature broken; many users affected | 1 hour |
| SEV-3 | Minor feature broken; few users affected | 4 hours |
| SEV-4 | Cosmetic issue; no user impact | Next sprint |

## 5. Best Practices

### 5.1 When Deploying to Production
1. Verify all pre-deployment checklist items.
2. Deploy via CI/CD (never manual).
3. Monitor dashboard for 30 minutes post-deploy.
4. If issues detected: rollback immediately, investigate after.
5. Document deployment in release notes.

### 5.2 When Responding to Incidents
1. Acknowledge within SLA.
2. Communicate status to affected users.
3. Mitigate first, root-cause later.
4. Document timeline.
5. Write postmortem within 48 hours.
6. Create ADR if architectural change needed.

## 6. Dependencies

- Depends on `00_Project_Charter` §7 — source of POC articles.
- `06_ArchitectureDecisionRecords` — ADR-074 through ADR-083.
- `25_DeploymentArchitecture`, `26_ObservabilitySpecification`, `27_BackupAndRecovery`, `28_ReleaseManagement` — operationalize POC articles.

## 7. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Platform Operations Constitution. Expanded POC-01 through POC-10 with operational detail, enforcement mechanisms, pre-deployment checklist, incident severity levels. |

## 8. Cross References

- `00_Project_Charter` §7 — Source of POC articles (binding text).
- `02_SAD` §Graceful Degradation — Implements POC-01.
- `06_ArchitectureDecisionRecords` — ADR-074 through ADR-083.
- `23_RBAC` — Implements POC-06 (operational security).
- `25_DeploymentArchitecture` — Implements POC-03, POC-04, POC-10.
- `26_ObservabilitySpecification` — Implements POC-02, POC-08, POC-09.
- `27_BackupAndRecovery` — Implements POC-05.
- `28_ReleaseManagement` — Implements POC-03, POC-04, POC-07.
- `32_DeploymentGuide` — Operational deployment guide.
