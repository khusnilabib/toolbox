# 26 — Observability Specification

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** POC-02 (Observability by Default), POC-08 (Monitoring Standards), POC-09 (Cost Awareness)

---

## 1. Purpose

This Observability Specification defines **how the platform is monitored, logged, and measured**. It implements POC-02 (every subsystem exposes logs, metrics, health checks, error reports, performance), POC-08 (minimum monitoring requirements: uptime, response time, error rate, build/deploy status, API/DB health), and POC-09 (cost awareness monitoring).

## 2. Scope

### 2.1 In Scope
- Structured logging standards.
- Metrics collection (performance, error, usage).
- Health check endpoints.
- Error tracking (Sentry).
- Performance monitoring (Vercel Analytics, Lighthouse).
- Dashboard requirements.
- Cost monitoring.
- Alerting.

### 2.2 Out of Scope
- Analytics events → `16_EventSchemaSpecification`.
- Analytics pipeline → `17_AnalyticsArchitecture`.
- Deployment pipeline → `25_DeploymentArchitecture`.

## 3. Architectural Decisions

### AD-01 — Structured JSON Logging

**Context.** Unstructured logs are hard to query and aggregate. JSON logs are machine-parseable.

**Decision.** All server-side logs are structured JSON: `{ timestamp, level, message, requestId, userId?, toolSlug?, ...context }`. Logs shipped to Vercel logs (free tier) or Axiom (Phase 2+ for better search). No `console.log` in production; use structured logger.

### AD-02 — Health Check Endpoints

**Context.** POC-08 mandates API health and DB health monitoring. Without health endpoints, monitoring can't verify service status.

**Decision.** Health check endpoint at `/api/health` returns:
```json
{
  "status": "healthy" | "degraded" | "down",
  "timestamp": "ISO 8601",
  "checks": {
    "database": { "status": "healthy", "latencyMs": 12 },
    "auth": { "status": "healthy", "latencyMs": 8 },
    "storage": { "status": "healthy", "latencyMs": 15 }
  }
}
```

### AD-03 — Error Tracking via Sentry

**Context.** Without error tracking, production errors are invisible until users complain.

**Decision.** Sentry for client-side and server-side error tracking. Free tier (5k events/month) adequate for Phase 1. Errors include: stack trace, request context, user context (userId only, no PII), release version.

### AD-04 — Performance Monitoring

**Context.** POC-08 mandates response time monitoring. EC-07 mandates performance budgets.

**Decision.** Vercel Analytics for Core Web Vitals (LCP, FID, CLS) and page load times. Lighthouse CI in GitHub Actions for performance regression detection. Performance budget enforced per `08_CodingStandards` §Performance Budget.

## 4. Monitoring Standards (POC-08)

### 4.1 Minimum Monitoring Requirements

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Uptime | UptimeRobot / Vercel | < 99.9% monthly |
| Response Time (TTFB) | Vercel Analytics | P95 > 500ms |
| Error Rate (5xx) | Sentry / Vercel | > 1% of requests |
| Build Status | GitHub Actions | Any failure |
| Deploy Status | Vercel | Failed deploy |
| API Health | `/api/health` endpoint | Any check "down" |
| DB Health | Supabase Dashboard / health check | Connection failure |
| Lighthouse Performance | Lighthouse CI | Score < 90 |
| Lighthouse Accessibility | Lighthouse CI | Score < 95 |
| Lighthouse SEO | Lighthouse CI | Score < 95 |

### 4.2 Dashboard Requirements

Admin dashboard (per `29_AdminSpecification`) shows:
- Real-time uptime status.
- Response time chart (24h, 7d, 30d).
- Error rate chart.
- Recent deploys list.
- Build status.
- API/DB health indicators.
- Cost summary (Vercel, Supabase, Sentry).

## 5. Cost Monitoring (POC-09)

### 5.1 Monthly Cost Review

| Service | Metric | Free Tier Limit | Alert At |
|---------|--------|-----------------|----------|
| Vercel | Bandwidth | 100 GB/mo | 80 GB |
| Vercel | Serverless execution | 100 GB-hrs/mo | 80 GB-hrs |
| Supabase | Database size | 500 MB | 400 MB |
| Supabase | MAU | 50,000 | 40,000 |
| Supabase | Storage | 1 GB | 800 MB |
| Sentry | Events | 5,000/mo | 4,000/mo |
| GitHub Actions | Minutes | 2,000/mo | 1,800/mo |

### 5.2 Cost Optimization
- Monthly cost report in engineering meeting.
- Cost per MAU tracked.
- Optimize before upgrading to paid tier.
- Architecture decisions consider cost impact.

## 6. Alerting

### 6.1 Alert Channels
- **Email:** For non-urgent alerts (cost thresholds, weekly summaries).
- **Slack/Discord:** For urgent alerts (uptime, error rate, deploy failures). (Phase 2+)
- **PagerDuty:** For SEV-1 incidents. (Phase 3+)

### 6.2 Alert Rules
- Uptime down → immediate alert.
- Error rate > 5% → immediate alert.
- Error rate > 1% for 5 min → alert.
- Lighthouse score below budget → alert on PR.
- Cost threshold exceeded → email alert.

## 7. Standards

### 7.1 Logging Standards
- Structured JSON format.
- Log levels: `error`, `warn`, `info`, `debug`.
- No PII in logs (userId only).
- Request ID on every log entry for tracing.
- Logs retained 30 days (Vercel free tier).

### 7.2 Health Check Standards
- `/api/health` endpoint on every environment.
- Returns JSON with status and individual checks.
- Response time < 100ms.
- Checked every 60 seconds by monitoring.

### 7.3 Error Tracking Standards
- Sentry DSN in env vars.
- Source maps uploaded on deploy.
- Release tagging (git SHA).
- No PII in error context.
- Errors triaged within 48 hours.

## 8. Best Practices

### 8.1 When Adding Logging
- Use structured logger (`logger.info({ ... })`), not `console.log`.
- Include request ID for tracing.
- Include relevant context (toolSlug, userId).
- Log at appropriate level (error for failures, info for normal operation).

### 8.2 When Adding Monitoring
- Add health check for any new external dependency.
- Add Sentry breadcrumb for key user actions.
- Add Lighthouse CI check for performance regressions.

## 9. Future Expansion

### 9.1 Distributed Tracing (Phase 3+)
- OpenTelemetry for request tracing across services.
- Jaeger or Datadog for trace visualization.

### 9.2 Real-Time Dashboards (Phase 3+)
- Grafana dashboards for real-time metrics.
- Custom metrics beyond Vercel Analytics.

### 9.3 Log Aggregation (Phase 2+)
- Axiom or Logtail for structured log search.
- Retention > 30 days.

## 10. Dependencies

- Depends on `00_Project_Charter` §7 POC-02, POC-08, POC-09.
- `06_ArchitectureDecisionRecords` — ADR-075, ADR-081, ADR-082.
- `16_EventSchemaSpecification` — Analytics events feed observability.
- `17_AnalyticsArchitecture` — Growth metrics overlap with monitoring.
- `25_DeploymentArchitecture` — Deployment pipeline includes observability setup.
- `29_AdminSpecification` — Admin dashboard displays monitoring data.

## 11. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Observability Specification. Defined structured logging, health checks, error tracking (Sentry), performance monitoring, monitoring standards (POC-08), cost monitoring (POC-09), alerting. |

## 12. Cross References

- `00_Project_Charter` §7 POC-02, POC-08, POC-09 — Implemented.
- `06_ArchitectureDecisionRecords` — ADR-075 (Observability by Default), ADR-081 (Monitoring Standards), ADR-082 (Cost Awareness).
- `08_CodingStandards` §Performance Budget — Performance monitoring enforces budget.
- `16_EventSchemaSpecification` — Analytics events feed observability.
- `17_AnalyticsArchitecture` — Analytics pipeline overlaps with monitoring.
- `25_DeploymentArchitecture` — Deployment includes observability setup.
- `29_AdminSpecification` — Admin dashboard shows monitoring data.
- `32_DeploymentGuide` — Observability configuration in deployment.
