# 25 — Deployment Architecture

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** POC-01 (Reliability), POC-03 (Release Strategy), POC-04 (Rollback), POC-06 (Operational Security), POC-10 (Enterprise Operations); EC-12 (Enterprise Readiness)

---

## 1. Purpose

This Deployment Architecture document defines the **environments, deployment pipeline, topology, and secrets management** for [PROJECT_NAME]. It implements POC-03 (predictable release workflow), POC-04 (rollback strategy), POC-06 (operational security — least privilege), and POC-10 (future enterprise operations without redesign).

## 2. Scope

### 2.1 In Scope
- Environment definitions (Local, Development, Preview, Production).
- Deployment pipeline (GitHub → CI → Vercel).
- Topology (Edge, Serverless, Supabase).
- Secrets management.
- Enterprise migration path.
- Rollback procedures (reference to `28_ReleaseManagement`).

### 2.2 Out of Scope
- Release workflow details → `28_ReleaseManagement`.
- Observability → `26_ObservabilitySpecification`.
- Backup → `27_BackupAndRecovery`.
- CI/CD pipeline configuration → `30_DevelopmentGuideline`.

## 3. Architectural Decisions

### AD-01 — Four Environments

**Context.** POC-03 mandates Local → Development → Preview → Production. Each environment has a distinct purpose.

**Decision.**
| Environment | Purpose | URL | Auth |
|-------------|---------|-----|------|
| Local | Developer machine; running `pnpm dev` | `localhost:3000` | N/A |
| Development | Shared staging; integration testing | `dev.example.com` | Basic auth |
| Preview | Per-PR deployment; review | `<sha>.preview.example.com` | Vercel password |
| Production | Live site | `example.com` | Public |

**Consequences:** Every PR gets a preview deployment. Development is always stable (main branch). Production deploys are tagged.

### AD-02 — Vercel as Deployment Platform

**Context.** `04_TechStack` AD-10 selects Vercel. Deployment architecture must align.

**Decision.** Vercel handles: build, CDN, Edge functions, serverless functions, preview deployments, instant rollback. GitHub Actions handles: CI checks (lint, test, build), security scanning, deployment triggers.

### AD-03 — Secrets Management

**Context.** POC-06 mandates least privilege for secrets. Secrets must never be committed.

**Decision.** Secrets stored in Vercel environment variables (encrypted at rest). Three scopes: Preview (preview deploys only), Development (dev environment), Production (production only). `.env.local` for local development (gitignored). `secretlint` in pre-commit hook. No secrets in client bundles (`NEXT_PUBLIC_` prefix only for public vars).

### AD-04 — Enterprise Migration Path (POC-10)

**Context.** POC-10 mandates operational model supports enterprise migration without redesign.

**Decision.** Architecture is portable:
- **Vercel → self-hosted:** Next.js is portable; Dockerfile + Node server.
- **Supabase → dedicated Postgres:** Drizzle schemas portable; connection config changes.
- **GitHub Actions → Jenkins/CircleCI:** CI scripts are standard shell commands.
- Migration documented in `32_DeploymentGuide` §Enterprise Migration.

## 4. Deployment Topology

```
┌─────────────────────────────────────────────────────┐
│                    User's Browser                     │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
                         ▼
          ┌──────────────────────────────┐
          │     Vercel Edge Network       │
          │  (CDN + Edge Middleware)      │
          └──────────┬───────────┬────────┘
                     │           │
          ┌──────────▼──┐  ┌────▼──────────────┐
          │  Static     │  │  Serverless        │
          │  Assets     │  │  Functions (Node)  │
          │  (immutable)│  │  - API routes      │
          └─────────────┘  │  - Server actions  │
                           └──────────┬──────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
             ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
             │  Supabase   │  │  External   │  │  Sentry     │
             │  Postgres   │  │  APIs (AI)  │  │  (Errors)   │
             │  Auth       │  └─────────────┘  └─────────────┘
             │  Storage    │
             └─────────────┘
```

## 5. Deployment Pipeline

```
1. Developer pushes to feature branch
   ↓
2. GitHub Actions CI:
   - Lint (ESLint, Prettier)
   - Type check (tsc --noEmit)
   - Unit tests (Vitest)
   - Build verification
   - Security scan (secretlint, npm audit)
   ↓
3. Developer opens PR
   ↓
4. Vercel creates Preview deployment
   ↓
5. Reviewer tests on Preview URL
   ↓
6. PR approved → merged to main
   ↓
7. Vercel deploys to Development
   ↓
8. Vercel deploys to Production (after manual approval or auto-deploy)
   ↓
9. Post-deploy monitoring (30 min watch)
```

## 6. Standards

### 6.1 Environment Standards
- Each environment has isolated Supabase project (Phase 2+; Phase 1 shares dev/prod).
- Environment variables never shared across environments.
- Production env vars require admin access to view.

### 6.2 Deployment Standards
- All deploys via CI/CD; no manual deploys to production.
- Every deploy tagged with git SHA.
- Production deploys require passing CI + manual approval (Phase 2+).
- Rollback available within 1 click (Vercel dashboard).

### 6.3 Secrets Standards
- `.env.local` gitignored.
- `secretlint` in pre-commit.
- No secrets in client bundles.
- Secrets rotated quarterly (Phase 2+).

## 7. Best Practices

### 7.1 When Deploying
1. Verify CI passes.
2. Test on Preview deployment.
3. Merge to main.
4. Monitor post-deploy dashboard.
5. If issues: rollback via Vercel dashboard.

### 7.2 When Managing Secrets
1. Add to Vercel env vars (never commit).
2. Use `NEXT_PUBLIC_` prefix only for client-safe values.
3. Document in `.env.example` (without values).
4. Rotate quarterly.

## 8. Future Expansion

### 8.1 Multi-Region (Phase 3+)
- Vercel Edge functions in multiple regions.
- Supabase read replicas.
- Geographic latency optimization.

### 8.2 Blue-Green Deployments (Phase 3+)
- Two production environments.
- Instant switch via DNS.
- Zero-downtime deployments.

### 8.3 Enterprise Self-Hosted (Phase 4+)
- Docker Compose / Kubernetes deployment.
- On-premise Postgres.
- Enterprise SSO integration.

## 9. Dependencies

- Depends on `00_Project_Charter` §7 POC-01, POC-03, POC-04, POC-06, POC-10.
- Depends on `04_TechStack` AD-10 (Vercel), AD-03 (Supabase).
- `06_ArchitectureDecisionRecords` — ADR-074, ADR-076, ADR-077, ADR-079, ADR-083.
- `26_ObservabilitySpecification` — Post-deploy monitoring.
- `28_ReleaseManagement` — Release workflow and rollback.
- `32_DeploymentGuide` — Operational deployment guide.

## 10. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Deployment Architecture. Defined four environments, Vercel deployment pipeline, topology, secrets management, enterprise migration path. |

## 11. Cross References

- `00_Project_Charter` §7 POC-01, POC-03, POC-04, POC-06, POC-10 — Implemented.
- `02_SAD` AD-06 — Edge-first deployment topology (this document operationalizes it).
- `04_TechStack` AD-10, AD-03 — Vercel and Supabase.
- `06_ArchitectureDecisionRecords` — ADR-074 (Reliability), ADR-076 (Release Strategy), ADR-077 (Rollback), ADR-079 (Operational Security), ADR-083 (Enterprise Operations).
- `23_RBAC` — Admin access to deployment configs.
- `26_ObservabilitySpecification` — Post-deploy monitoring.
- `28_ReleaseManagement` — Release workflow and rollback procedures.
- `32_DeploymentGuide` — Operational deployment guide.
