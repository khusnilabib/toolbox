# 29 — Admin Specification

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-11 (Admin Philosophy), LOCK-12 (Feature Lifecycle), DGA-06 (Feature Flags), DGA-07 (Auditability), POC-08 (Monitoring Standards)

---

## 1. Purpose

This Admin Specification defines the **admin panel modules, screens, and workflows** for [PROJECT_NAME]. It implements LOCK-11 (admin as operational control center, not just a CMS), LOCK-12 (feature lifecycle management), DGA-06 (feature flags management), DGA-07 (audit trail), and POC-08 (monitoring dashboard).

## 2. Scope

### 2.1 In Scope
- Admin panel route structure (`/admin`).
- Admin modules (Dashboard, Users, Tools, Content, SEO, Analytics, Feature Flags, Audit, Settings).
- Admin workflows (tool publish, feature flag toggle, user role change).
- Admin RBAC enforcement.
- Admin analytics dashboard.
- Admin audit trail.

### 2.2 Out of Scope
- RBAC role definitions → `23_RBAC`.
- Feature flag architecture → DGA-06, `24_PlatformOperationsConstitution`.
- Audit log schema → `19_DatabaseDesign`.
- Analytics pipeline → `17_AnalyticsArchitecture`.

## 3. Architectural Decisions

### AD-01 — Admin is Operational Control Center (LOCK-11)

**Context.** LOCK-11 mandates admin is not just a CMS but the operational control center. This requires more than CRUD interfaces.

**Decision.** Admin panel includes operational modules: Dashboard (real-time metrics), Feature Flags, System Health, Audit Trail, Logs — in addition to content management (Users, Tools, Articles, SEO). Admin accessible at `/admin`, protected by RBAC (minimum `editor` role; most modules require `admin`).

### AD-02 — Admin Modules

**Context.** Without defined modules, admin grows organically and becomes disorganized.

**Decision.** Admin modules:

| Module | Purpose | Min Role |
|--------|---------|----------|
| Dashboard | Real-time metrics, system health, recent activity | editor |
| Users | User list, profile view, role management | admin |
| Tools | Tool inventory, lifecycle management | admin |
| Content | Articles, media, taxonomy management | editor |
| SEO | SEO metadata review, sitemap status | editor |
| Analytics | Growth metrics, funnel analysis | admin |
| Feature Flags | Flag management, A/B experiments | admin |
| Audit Trail | Immutable audit log viewer | admin |
| Settings | Platform configuration | admin |
| System Health | Dependency status, error tracking | admin |

### AD-03 — Every Admin Action Audited (DGA-07)

**Context.** DGA-07 mandates every admin action is auditable.

**Decision.** Every write action in admin (create, update, delete, publish, toggle, role change) creates an audit entry in `platform_ops.audit_entries`. Audit entries are immutable, include before/after state, and are viewable in the Audit Trail module.

## 4. Admin Modules (Detailed)

### 4.1 Dashboard

**Content:**
- Real-time uptime status (green/yellow/red).
- Response time chart (24h).
- Error rate chart (24h).
- Active users (real-time).
- Recent deploys list.
- Recent audit entries.
- System health checks (DB, auth, storage, API).
- Cost summary (Vercel, Supabase, Sentry).

### 4.2 Users

**Features:**
- User list (paginated, searchable, filterable by role).
- User detail view (profile, history count, favorites count, subscription status).
- Role change (requires `super_admin` for admin+ roles).
- User suspension/deletion (GDPR-compliant soft delete).
- Export user data (GDPR right).

### 4.3 Tools

**Features:**
- Tool inventory (from generated admin-inventory.ts).
- Tool lifecycle management: promote Testing → Beta → Stable (PC-04 quality gates).
- Tool deprecation: set lifecycle to `deprecated`, set successor slug.
- Tool archival: set lifecycle to `archived`.
- SEO metadata review (from manifest).
- Analytics per tool (views, completion rate, downloads).

### 4.4 Content

**Features:**
- Article list (paginated, filterable by status).
- Article editor (Markdown, SEO metadata, publish/schedule).
- Media library (upload, manage, alt text).
- Taxonomy management (tags, categories).

### 4.5 SEO

**Features:**
- Per-tool SEO metadata review.
- Sitemap status (last generated, URL count).
- Structured data validator.
- Internal linking graph.
- Search Console integration (Phase 2+).

### 4.6 Analytics

**Features:**
- Growth metrics dashboard (DGA-09).
- Tool popularity chart.
- Conversion funnel (viewed → started → completed → downloaded).
- Registration rate.
- Search success rate.
- Return visits.

### 4.7 Feature Flags (DGA-06)

**Features:**
- Flag list (key, enabled, rollout %, targeting rules).
- Flag editor (toggle, set rollout %, set targeting).
- A/B experiment setup (variant assignment, traffic allocation).
- Flag history (audit trail of changes).

### 4.8 Audit Trail (DGA-07)

**Features:**
- Audit entry list (paginated, filterable by action, actor, date).
- Audit entry detail (before/after state, IP, user agent).
- Export (for compliance).
- Immutable (no edit/delete).

### 4.9 Settings

**Features:**
- Platform name, URL, social handles.
- Ad network configuration.
- Analytics provider configuration.
- Feature flag defaults.
- Email configuration (Resend).

### 4.10 System Health

**Features:**
- Dependency status (database, auth, storage, edge, external APIs).
- Error tracking (Sentry integration, recent errors).
- Performance metrics (Vercel Analytics, Lighthouse scores).
- Deployment status (recent deploys, current version).

## 5. Admin Workflows

### 5.1 Tool Promotion (Testing → Beta → Stable)

```
1. Admin navigates to Tools module
   ↓
2. Selects tool in "Testing" lifecycle
   ↓
3. Clicks "Promote to Beta"
   - Requires: admin role
   - Audited: action=admin_tool_published, before=testing, after=beta
   ↓
4. For Beta → Stable:
   - PC-04 Quality Gates verified:
     ✅ Functional review
     ✅ Accessibility review
     ✅ Performance review
     ✅ SEO review
     ✅ Security review
     ✅ Documentation review
     ✅ UX review
   - All gates must pass
   - Audited
```

### 5.2 Feature Flag Toggle

```
1. Admin navigates to Feature Flags module
   ↓
2. Selects flag
   ↓
3. Toggles enabled/disabled OR adjusts rollout %
   - Requires: admin role
   - Audited: action=admin_feature_flag_toggled
   - Takes effect at Edge Middleware (next request)
```

### 5.3 User Role Change

```
1. Admin navigates to Users module
   ↓
2. Selects user
   ↓
3. Changes role (e.g., user → editor)
   - Requires: super_admin for admin+ roles
   - Audited: action=admin_user_role_changed, before/after
   - JWT refreshed (user's next request has new role)
   - Notification email sent to user
```

## 6. Standards

### 6.1 Admin UI Standards
- Uses design system (LOCK-10, EC-10).
- Dark/light mode supported.
- Mobile-responsive (though admin primarily desktop).
- Accessible (WCAG AA).

### 6.2 Admin Security Standards
- Minimum `editor` role to access `/admin`.
- Module-specific role requirements (per AD-02).
- Every write action audited (DGA-07).
- Session timeout (30 minutes inactivity).
- CSRF protection on all forms.

### 6.3 Admin Data Standards
- Tool inventory from generated registry (not manual).
- Analytics from Analytics Context (not ad-hoc queries).
- Audit entries immutable.

## 7. Best Practices

### 7.1 When Adding an Admin Module
1. Identify which role can access it.
2. Implement RBAC check.
3. Ensure all write actions are audited.
4. Use design system components.
5. Add to admin navigation.

### 7.2 When Managing Tools
1. Verify PC-04 quality gates before promoting to Stable.
2. Document deprecation reason.
3. Set successor slug when deprecating.
4. Monitor post-promotion analytics.

## 8. Future Expansion

### 8.1 Admin API (Phase 3+)
- Public admin API for programmatic management.
- API keys for CI/CD integration.

### 8.2 Multi-Tenant Admin (Phase 3+)
- Per-tenant admin views.
- Tenant admin role.

### 8.3 Marketplace Admin (Phase 4+)
- Plugin review and approval.
- Publisher verification.
- Rating/review moderation.

## 9. Dependencies

- Depends on `00_Project_Charter` §3 LOCK-11, LOCK-12, §6 DGA-06, DGA-07, §7 POC-08.
- `06_ArchitectureDecisionRecords` — ADR-011, ADR-012, ADR-069, ADR-070, ADR-081.
- `12_ToolManifestSpecification` — Tool inventory source.
- `17_AnalyticsArchitecture` — Analytics data.
- `19_DatabaseDesign` — Audit entries, feature flags schema.
- `23_RBAC` — Role definitions and enforcement.
- `26_ObservabilitySpecification` — Dashboard metrics.

## 10. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Admin Specification. Defined 10 admin modules (Dashboard, Users, Tools, Content, SEO, Analytics, Feature Flags, Audit Trail, Settings, System Health), admin workflows (tool promotion, flag toggle, role change), RBAC enforcement, audit logging. |

## 11. Cross References

- `00_Project_Charter` §3 LOCK-11, LOCK-12, §6 DGA-06, DGA-07, §7 POC-08 — Implemented.
- `06_ArchitectureDecisionRecords` — ADR-011 (Admin Philosophy), ADR-012 (Feature Lifecycle), ADR-069 (Feature Flags), ADR-070 (Auditability), ADR-081 (Monitoring Standards).
- `12_ToolManifestSpecification` — Tool inventory from manifest.
- `16_EventSchemaSpecification` — Admin analytics events.
- `17_AnalyticsArchitecture` — Analytics data for dashboard.
- `19_DatabaseDesign` §Platform Ops — Audit entries, feature flags schema.
- `23_RBAC` — Role definitions enforced in admin.
- `24_PlatformOperationsConstitution` — POC-08 monitoring dashboard.
- `26_ObservabilitySpecification` — Dashboard metrics source.
