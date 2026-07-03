# 32 — Deployment Guide

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** POC-01, POC-03, POC-04, POC-06; EC-12 (Enterprise Readiness)

---

## 1. Purpose

This Deployment Guide provides **operational, step-by-step procedures** for deploying [PROJECT_NAME]. It complements `25_DeploymentArchitecture` (which defines the architecture) with actionable instructions for developers and operators.

## 2. Environment Setup

### 2.1 Prerequisites

- Node.js 20+
- pnpm 9+
- Git
- Vercel CLI (`npm i -g vercel`)
- Supabase CLI (`npm i -g supabase`)
- GitHub account with repo access

### 2.2 Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd [project-name]

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Fill in .env.local (see §3)
# Generate Drizzle migrations
pnpm drizzle-kit generate

# Run database migrations
pnpm drizzle-kit migrate

# Generate tool registry
pnpm gen:registry

# Start dev server
pnpm dev
```

Open `http://localhost:3000`.

### 2.3 Supabase Project Setup

1. Create Supabase project at https://supabase.com.
2. Note project URL and anon key.
3. Note service role key (server-only).
4. Run migrations: `pnpm drizzle-kit migrate`.
5. Enable RLS policies (in Supabase dashboard or via migration).

## 3. Required Environment Variables

### 3.1 Server-Only Variables

```bash
# Supabase
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Sentry (error tracking)
SENTRY_DSN=https://[key]@sentry.io/[project]

# Stripe (Phase 2+)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (email, Phase 2+)
RESEND_API_KEY=re_...
```

### 3.2 Client-Safe Variables (NEXT_PUBLIC_)

```bash
# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Site config
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_SITE_NAME=[PROJECT_NAME]

# Analytics (Phase 2+)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
NEXT_PUBLIC_POSTHOG_API_KEY=phc_...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com

# Sentry (client-side)
NEXT_PUBLIC_SENTRY_DSN=https://[key]@sentry.io/[project]
```

### 3.3 Environment Variable Management

- **Local:** `.env.local` (gitignored).
- **Vercel Preview:** Vercel dashboard → Settings → Environment Variables → Preview.
- **Vercel Production:** Vercel dashboard → Settings → Environment Variables → Production.
- **Never commit secrets.** `secretlint` in pre-commit hook.

## 4. Local Development

### 4.1 Starting Dev Server

```bash
pnpm dev
```

- Runs Next.js dev server with hot reload.
- Drizzle migrations applied automatically.
- Tool registry generated on start.

### 4.2 Useful Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server (after build)
pnpm lint             # ESLint + Prettier check
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests (Playwright)
pnpm gen:registry     # Generate tool registry from manifests
pnpm drizzle-kit generate  # Generate DB migration from schema
pnpm drizzle-kit migrate   # Run DB migrations
pnpm new-tool [category] [slug]  # Scaffold new tool
```

### 4.3 Debugging

- React DevTools for component inspection.
- Next.js DevTools for routing/server components.
- Supabase dashboard for DB inspection.
- `pnpm dev:debug` for Node.js debugger.

## 5. Preview Deployment

### 5.1 Automatic Preview on PR

Every PR automatically creates a Vercel Preview deployment:
1. Push branch to GitHub.
2. Open PR.
3. Vercel creates preview deployment at `<sha>.vercel.app`.
4. Preview URL posted as PR comment.
5. Preview uses Preview environment variables.

### 5.2 Manual Preview Deployment

```bash
vercel  # Deploy to preview
```

## 6. Production Deployment

### 6.1 Automatic Production Deployment

Production deploys automatically when PR is merged to `main`:
1. PR approved and merged.
2. GitHub Actions CI runs (lint, test, build, security).
3. Vercel deploys to Production.
4. Post-deploy monitoring (30 min).

### 6.2 Manual Production Deployment (Emergency)

```bash
vercel --prod  # Deploy to production manually
```

Use only for emergency fixes. Document in incident report.

## 7. Rollback Procedures

### 7.1 Application Code Rollback (Vercel)

```
1. Go to Vercel dashboard → Deployments.
2. Find last known good deployment.
3. Click "Instant Rollback".
4. Verify service restored.
5. Document in incident report (POC-07).
```

### 7.2 CLI Rollback

```bash
vercel rollback [deployment-url]
```

### 7.3 Database Migration Rollback

**Forward-compatible migrations:** No rollback needed (old code ignores new columns).

**Breaking migrations:** Restore from backup (POC-05). Accept data loss since last backup.

## 8. Secrets Management

### 8.1 Adding a New Secret

1. Add to Vercel dashboard (Settings → Environment Variables).
2. Add to `.env.example` (without value, documented).
3. Add to `.env.local` (for local dev, gitignored).
4. Verify `secretlint` passes.

### 8.2 Rotating Secrets

1. Generate new secret in provider (Supabase, Stripe, etc.).
2. Update Vercel environment variables.
3. Update `.env.local`.
4. Redeploy.
5. Verify service works.
6. Revoke old secret.

### 8.3 Secret Security

- `secretlint` in pre-commit hook.
- No secrets in client bundles (only `NEXT_PUBLIC_` vars).
- Vercel env vars encrypted at rest.
- Access to production env vars restricted to admins.

## 9. Deployment Checklist

### Pre-Deployment

- [ ] All CI checks pass (lint, type-check, unit tests, build).
- [ ] E2E tests pass on Preview deployment.
- [ ] Lighthouse scores within budget (performance ≥90, accessibility ≥95, SEO ≥95).
- [ ] No secrets in code (`secretlint` passes).
- [ ] Documentation updated (EC-01).
- [ ] ADR updated if architectural change.
- [ ] Rollback plan documented.
- [ ] Database migrations reviewed (if applicable).
- [ ] Feature flags configured (if gradual rollout).

### Post-Deployment

- [ ] Monitor dashboard for 30 minutes.
- [ ] Verify health check endpoint (`/api/health`).
- [ ] Verify error rate normal (Sentry).
- [ ] Verify response time normal (Vercel Analytics).
- [ ] If issues: rollback immediately (§7).

## 10. Release Checklist

### Pre-Release

- [ ] All P0 and P1 backlog items complete.
- [ ] All PC-04 quality gates passed for new tools.
- [ ] All tools meet PC-03 completion standard (13 items).
- [ ] SEO metadata validated (Schema.org validator).
- [ ] Sitemap generated and submitted.
- [ ] robots.txt configured.
- [ ] Analytics events verified.
- [ ] Backup verified (POC-05).
- [ ] Recovery drill completed (quarterly).

### Release

- [ ] Merge to main.
- [ ] Vercel deploys to Production.
- [ ] Post-deploy monitoring.
- [ ] Notify team in Slack/Discord.
- [ ] Update status page.

### Post-Release

- [ ] Monitor for 24 hours.
- [ ] Collect user feedback.
- [ ] Document any incidents (POC-07).
- [ ] Update roadmap if needed.

## 11. Troubleshooting

### 11.1 Build Fails

```
Error: Build failed.
```

**Solutions:**
- Check CI logs for specific error.
- Run `pnpm build` locally to reproduce.
- Check for TypeScript errors (`pnpm type-check`).
- Check for ESLint errors (`pnpm lint`).
- Verify dependencies installed (`pnpm install --frozen-lockfile`).

### 11.2 Database Connection Fails

```
Error: Database connection failed.
```

**Solutions:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in env vars.
- Check Supabase dashboard for project status.
- Verify migrations applied (`pnpm drizzle-kit migrate`).
- Check RLS policies (might block access).

### 11.3 Tool Registry Out of Sync

```
Error: Generated files don't match manifests.
```

**Solutions:**
- Run `pnpm gen:registry`.
- Commit generated files.
- Verify CI passes (`scripts/verify-registry.ts`).

### 11.4 Authentication Not Working

```
Error: Auth fails; users can't log in.
```

**Solutions:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Check Supabase Auth settings (email/OAuth enabled).
- Verify redirect URLs in Supabase dashboard.
- Check Edge Middleware (auth check).

### 11.5 Analytics Not Firing

```
Error: Analytics events not appearing in provider dashboard.
```

**Solutions:**
- Verify consent given (cookie banner).
- Check adapter initialization (env vars set).
- Verify event validation (Zod schema).
- Check IndexedDB queue (events queued offline).

### 11.6 High Error Rate Post-Deploy

**Immediate action:**
1. Rollback via Vercel dashboard (§7.1).
2. Investigate in Sentry.
3. Document in incident report (POC-07).
4. Fix root cause.
5. Re-deploy after fix.

### 11.7 Performance Regression

**Detection:** Lighthouse CI fails; Lighthouse score <90.

**Solutions:**
- Check bundle size (`pnpm build` output).
- Verify lazy loading.
- Check for unnecessary dependencies.
- Profile with React DevTools.

## 12. Standards

### 12.1 Deployment Standards
- All deploys via CI/CD (no manual production deploys except emergencies).
- Every deploy tagged with git SHA.
- Pre-deployment checklist completed.
- Post-deploy monitoring for 30 minutes.

### 12.2 Secrets Standards
- `.env.local` gitignored.
- `secretlint` in pre-commit.
- No secrets in client bundles.
- Secrets rotated quarterly (Phase 2+).

### 12.3 Rollback Standards
- Rollback available within 1 click (Vercel).
- Rollback documented in incident report.
- DB migrations forward-compatible whenever possible.

## 13. Dependencies

- Depends on `25_DeploymentArchitecture` — architecture this guide operationalizes.
- Depends on `26_ObservabilitySpecification` — post-deploy monitoring.
- Depends on `27_BackupAndRecovery` — recovery procedures.
- Depends on `28_ReleaseManagement` — release workflow.
- `06_ArchitectureDecisionRecords` — ADR-074, ADR-076, ADR-077, ADR-079.

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Deployment Guide. Defined environment setup, env vars, local dev, preview/production deploy, rollback procedures, secrets management, deployment/release checklists, troubleshooting. |

## 15. Cross References

- `00_Project_Charter` §7 POC-01, POC-03, POC-04, POC-06 — Implemented.
- `04_TechStack` — Technologies deployed.
- `06_ArchitectureDecisionRecords` — ADR-074, ADR-076, ADR-077, ADR-079.
- `19_DatabaseDesign` — Database migrations.
- `25_DeploymentArchitecture` — Deployment architecture.
- `26_ObservabilitySpecification` — Post-deploy monitoring.
- `27_BackupAndRecovery` — Recovery procedures.
- `28_ReleaseManagement` — Release workflow.
- `30_DevelopmentGuideline` — CI/CD pipeline.
