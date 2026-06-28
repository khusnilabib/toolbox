# 23 — RBAC (Role-Based Access Control)

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-11 (Admin Philosophy), EC-08 (Security by Default), DGA-07 (Auditability)

---

## 1. Purpose

This RBAC document defines **roles, permissions, and enforcement points** for [PROJECT_NAME]. It implements LOCK-11 (admin as operational control center with RBAC from Phase 1), EC-08 (Security by Default — least privilege), and DGA-07 (Auditability — every permission change audited).

RBAC is the security backbone of the platform. Without it, every feature would have to implement its own access control, leading to inconsistencies and security gaps. This document establishes the canonical role hierarchy, the permission model, and the enforcement points (Edge Middleware, server actions, API routes, database RLS) that ensure access control is applied consistently and auditably.

The architecture enforces RBAC at multiple layers (defense in depth per EC-08): Edge Middleware for route-level checks, server actions for action-level checks, and database RLS for row-level checks. This means even if one layer is bypassed, others catch unauthorized access. Every permission check is audited (DGA-07), providing a complete trail of who did what.

## 2. Scope

### 2.1 In Scope

- Role definitions (guest, user, premium, editor, admin, super_admin).
- Permission model (roles → permissions → resources → actions).
- Enforcement points (Edge Middleware, server actions, API routes, RLS).
- Role assignment and management.
- Permission checking utilities.
- Audit logging for permission changes.
- Multi-tenancy preparation (Phase 3+).
- Publisher role preparation (Phase 4, DGA-10).

### 2.2 Out of Scope

- Authentication mechanism (JWT, OAuth) → `04_TechStack` AD-03 (Supabase Auth).
- Database RLS policies → `19_DatabaseDesign`.
- Admin UI for role management → `24_AdminSpecification`.
- API authentication → `20_APIConvention`.
- User flows for login/registration → `22_UserFlow`.

## 3. Architectural Decisions

### AD-01 — Six-Role Hierarchy

**Context.** Too few roles limit access control granularity; too many roles create management complexity. The platform needs roles that cover guest users, authenticated users, premium subscribers, content editors, administrators, and super-administrators.

**Decision.** Six roles in a hierarchy:

| Role | Level | Description |
|------|-------|-------------|
| `guest` | 0 | Unauthenticated visitor. Can use tools, browse. |
| `user` | 1 | Authenticated free user. Can save history, favorites. |
| `premium` | 2 | Paid subscriber. Has AI features, batch, cloud sync, no ads. |
| `editor` | 3 | Content editor. Can create/edit articles, manage SEO. |
| `admin` | 4 | Platform administrator. Can manage users, tools, settings, feature flags. |
| `super_admin` | 5 | Full access. Can manage admins, system config, danger zone. |

Each role inherits permissions of lower roles (e.g., `premium` has all `user` permissions plus premium-specific).

**Implements:** LOCK-11, EC-08 (least privilege — users get minimum needed).

### AD-02 — Permission Model: Role → Permission → Resource → Action

**Context.** Simple role checks (`if user.role === 'admin'`) don't scale to fine-grained permissions. A full RBAC model (role → permission → resource → action) is more flexible.

**Decision.** Permission model:
- **Role:** Assigned to user (e.g., `admin`).
- **Permission:** Granular action on a resource (e.g., `tool:publish`, `user:role:change`).
- **Resource:** What's being acted on (e.g., `tool`, `user`, `article`, `feature_flag`).
- **Action:** What operation (e.g., `read`, `write`, `delete`, `publish`).

Permissions are derived from role. Role-to-permission mapping is defined in code (not DB) for Phase 1; may move to DB in Phase 3+ for dynamic permission management.

```typescript
const rolePermissions: Record<Role, Permission[]> = {
  guest: ['tool:read', 'tool:execute', 'page:read'],
  user: ['tool:read', 'tool:execute', 'page:read', 'history:write', 'favorite:write'],
  premium: [/* user permissions + */ 'tool:batch', 'tool:ai', 'cloud:sync'],
  editor: [/* user permissions + */ 'article:write', 'article:publish', 'seo:edit'],
  admin: [/* editor permissions + */ 'tool:publish', 'tool:deprecate', 'user:read', 'feature_flag:manage', 'audit:read'],
  super_admin: [/* admin permissions + */ 'user:role:change', 'admin:manage', 'system:config'],
};
```

**Implements:** EC-08, LOCK-11.

### AD-03 — Enforcement at Three Layers (Defense in Depth)

**Context.** Single-layer access control is bypassable. Defense in depth requires multiple checks.

**Decision.** RBAC enforced at three layers:

1. **Edge Middleware (route-level):** Checks role before page renders. Redirects unauthorized users (e.g., guest trying to access `/admin` → redirect to login).
2. **Server Action / API Route (action-level):** Checks permission before executing action. Returns 403 if unauthorized.
3. **Database RLS (row-level):** Enforces row-level access at DB layer. Even if app-level check is bypassed, DB denies access.

**Implements:** EC-08 (Security by Default — defense in depth), DGA-07 (auditability).

### AD-04 — Every Permission Check Audited (DGA-07)

**Context.** DGA-07 mandates every admin action is auditable. Without audit logging, permission abuse is undetectable.

**Decision.** Every permission check that succeeds (for admin actions) is logged to `platform_ops.audit_entries`. Audit entry includes: actor, action, resource, before/after state, timestamp, IP, user agent. Audit logs are immutable (per `19_DatabaseDesign` AD-05).

**Implements:** DGA-07, EC-08.

### AD-05 — JWT Contains Role (No DB Call for Auth Check)

**Context.** Checking user's role on every request via DB call is expensive and violates LOCK-06 (database optional).

**Decision.** User's role is included in JWT claims (set by Supabase Auth trigger on role change). Edge Middleware and server actions read role from JWT; no DB call needed for auth check. DB is only queried for permission changes (which are audited).

**Implements:** LOCK-06, EC-07 (Performance — no DB call per request).

### AD-06 — Role Changes Require Admin + Audit

**Context.** Role changes (e.g., promoting user to editor) are sensitive. Without controls, any admin could grant super_admin.

**Decision.** Role changes:
- `user` → `premium`: Automated via Stripe webhook (subscription activated).
- `user` → `editor`: Requires `admin` role.
- `editor` → `admin`: Requires `super_admin` role.
- `admin` → `super_admin`: Requires `super_admin` role + second super_admin approval (Phase 2+).
- Any demotion: Requires `super_admin` role.

All role changes audited with before/after state.

**Implements:** EC-08, DGA-07.

## 4. Design Principles

### P1 — Least Privilege
Users get minimum permissions needed for their role. No blanket permissions.

### P2 — Defense in Depth
Access control at multiple layers. One bypass doesn't compromise security.

### P3 — Audit Everything
Every permission check (for admin actions) is logged. Immutable audit trail.

### P4 — No DB for Auth Check
Role in JWT. Auth check is fast and doesn't depend on DB availability.

### P5 — Hierarchical Roles
Higher roles inherit lower role permissions. Simple to reason about.

### P6 — Forward-Compatible
Role model supports future roles (publisher for marketplace, tenant_admin for multi-tenancy).

## 5. Role Definitions (Detailed)

### 5.1 `guest` (Level 0)

**Who:** Unauthenticated visitors.

**Permissions:**
- `tool:read` — View tool pages.
- `tool:execute` — Use tools (browser-side per LOCK-02).
- `page:read` — View public pages (homepage, category, blog, articles).
- `search:use` — Use search.

**Cannot:**
- Save history (prompted to register).
- Save favorites (prompted to register).
- Access admin.
- Use premium features (prompted to upgrade).

### 5.2 `user` (Level 1)

**Who:** Authenticated free users.

**Permissions:**
- All `guest` permissions, plus:
- `history:write` — Save tool executions to history.
- `history:read` — View own history.
- `history:delete` — Delete own history entries.
- `favorite:write` — Save/remove favorites.
- `favorite:read` — View own favorites.
- `profile:read` — View own profile.
- `profile:update` — Update own profile.

**Cannot:**
- Use premium features (batch, AI, cloud sync).
- Access admin.
- Edit content.

### 5.3 `premium` (Level 2)

**Who:** Paid subscribers.

**Permissions:**
- All `user` permissions, plus:
- `tool:batch` — Batch processing (multiple files at once).
- `tool:ai` — AI-powered features.
- `cloud:sync` — Sync history/favorites across devices.
- `premium:features` — All premium-gated features.
- `ads:removed` — No advertisements shown.

**Cannot:**
- Access admin.
- Edit content.

### 5.4 `editor` (Level 3)

**Who:** Content team members.

**Permissions:**
- All `user` permissions, plus:
- `article:write` — Create/edit articles.
- `article:publish` — Publish/unpublish articles.
- `article:delete` — Delete articles.
- `media:upload` — Upload media assets.
- `media:manage` — Manage media library.
- `seo:edit` — Edit SEO metadata for articles.
- `taxonomy:manage` — Manage tags and categories.

**Cannot:**
- Manage tools (publish/deprecate).
- Manage users.
- Access system settings.

### 5.5 `admin` (Level 4)

**Who:** Platform administrators.

**Permissions:**
- All `editor` permissions, plus:
- `tool:publish` — Promote tool to Stable lifecycle.
- `tool:deprecate` — Deprecate tools.
- `tool:archive` — Archive tools.
- `user:read` — View all users.
- `user:update` — Update user profiles (not role).
- `feature_flag:manage` — Create/update feature flags.
- `advertisement:manage` — Manage ad placements.
- `audit:read` — View audit logs.
- `analytics:read` — View analytics dashboards.
- `settings:read` — View system settings.
- `settings:update` — Update non-critical settings.

**Cannot:**
- Change user roles.
- Manage other admins.
- Access danger zone (delete platform data).

### 5.6 `super_admin` (Level 5)

**Who:** Project owners / Chief Architect.

**Permissions:**
- All `admin` permissions, plus:
- `user:role:change` — Change any user's role.
- `admin:manage` — Create/remove admin accounts.
- `system:config` — Modify system configuration.
- `danger_zone:access` — Access destructive operations (delete data, reset).
- `audit:delete` — (Theoretically) delete audit entries (requires 2-person rule in Phase 2+).

## 6. Permission Checking Utilities

### 6.1 `hasPermission(user, permission)`

```typescript
// src/shared/lib/auth.ts

import type { User, Permission, Role } from '@packages/types';
import { rolePermissions } from './role-permissions';

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

export function hasRole(user: User | null, ...roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function hasRoleLevel(user: User | null, minLevel: number): boolean {
  if (!user) return false;
  return roleLevel[user.role] >= minLevel;
}
```

### 6.2 `requirePermission(permission)` (Server-Side)

```typescript
// src/shared/lib/auth-server.ts

import { hasPermission } from './auth';
import { audit } from '@/platform-ops/application/services/audit';

export async function requirePermission(permission: Permission): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError({ code: 'UNAUTHORIZED' });
  }
  if (!hasPermission(user, permission)) {
    throw new AuthError({ code: 'PERMISSION_DENIED' });
  }
  return user;
}

export async function requirePermissionWithAudit(
  permission: Permission,
  action: string,
  resource: { type: string; id: string }
): Promise<User> {
  const user = await requirePermission(permission);
  await audit({
    actorUserId: user.id,
    action,
    resourceType: resource.type,
    resourceId: resource.id,
  });
  return user;
}
```

## 7. Enforcement Points

### 7.1 Edge Middleware (Route-Level)

```typescript
// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, hasRoleLevel } from '@/shared/lib/edge-auth';

const routeProtection: Record<string, number> = {
  '/admin': 4,        // admin level
  '/admin/users': 5,  // super_admin level
  '/dashboard': 1,    // user level
  '/settings': 1,     // user level
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Find matching protection rule
  const requiredLevel = Object.entries(routeProtection)
    .filter(([route]) => path.startsWith(route))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1];

  if (!requiredLevel) return NextResponse.next();

  // Verify JWT
  const token = request.cookies.get('auth-token')?.value;
  const user = token ? await verifyJWT(token) : null;

  if (!user || !hasRoleLevel(user, requiredLevel)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

### 7.2 Server Action (Action-Level)

```typescript
// src/platform-ops/application/actions/toggle-feature-flag.ts

'use server';

import { requirePermissionWithAudit } from '@/shared/lib/auth-server';

export async function toggleFeatureFlag(flagKey: string, enabled: boolean) {
  const user = await requirePermissionWithAudit(
    'feature_flag:manage',
    'admin_feature_flag_toggled',
    { type: 'feature_flag', id: flagKey }
  );

  const flag = await featureFlagRepository.update(flagKey, {
    enabled,
    updatedBy: user.id,
  });

  return { data: flag };
}
```

### 7.3 Database RLS (Row-Level)

Per `19_DatabaseDesign` §5. RLS policies enforce row-level access at the database layer, independent of application-level checks.

## 8. Role Assignment

### 8.1 Automatic Role Assignment

- New user registration: `user` role (default).
- Premium subscription activated (Stripe webhook): `premium` role.
- Premium subscription canceled: `user` role (at period end).

### 8.2 Manual Role Assignment (Admin)

- `editor` role: Assigned by `admin` or `super_admin` via admin panel.
- `admin` role: Assigned by `super_admin` only.
- `super_admin` role: Assigned by existing `super_admin` (Phase 2+ requires 2-person approval).

### 8.3 Role Change Flow

```
1. Admin initiates role change in admin panel
   ↓
2. Admin panel calls server action: changeUserRole(userId, newRole)
   ↓
3. Server action:
   - requirePermissionWithAudit('user:role:change', ...)
   - Verify admin has authority for newRole (e.g., can't grant super_admin unless super_admin)
   - Update user.role in DB
   - Audit log entry (before/after)
   - Update JWT claims (force re-auth on next request)
   - Send notification email to user
   ↓
4. User's next request: JWT refreshed with new role
```

## 9. Audit Logging (DGA-07)

### 9.1 Audited Actions

Every action requiring `editor` level or higher is audited:

| Action | Permission Required | Audited |
|--------|---------------------|---------|
| Article publish | `article:publish` | ✅ |
| Tool publish | `tool:publish` | ✅ |
| Tool deprecate | `tool:deprecate` | ✅ |
| SEO update | `seo:edit` | ✅ |
| User role change | `user:role:change` | ✅ |
| Feature flag toggle | `feature_flag:manage` | ✅ |
| Settings modify | `settings:update` | ✅ |
| User profile update (by admin) | `user:update` | ✅ |

### 9.2 Audit Entry Structure

Per `19_DatabaseDesign` §5.3:

```typescript
{
  actorUserId: 'uuid',
  action: 'admin_user_role_changed',
  resourceType: 'user',
  resourceId: 'user-uuid',
  beforeState: { role: 'user' },
  afterState: { role: 'editor' },
  ipAddress: '203.0.113.42',
  userAgent: 'Mozilla/5.0...',
  timestamp: '2026-06-28T10:00:00Z',
}
```

### 9.3 Audit Log Access

- `admin` and `super_admin` can read audit logs via admin panel.
- Audit logs are immutable (no UPDATE/DELETE).
- Retained for 7 years (compliance).
- Exportable for compliance audits.

## 10. Standards

### 10.1 Role Standards
- Six roles only; new roles require ADR.
- Role hierarchy: higher inherits lower.
- Role stored in `identity.users.role` field.
- Role included in JWT claims.

### 10.2 Permission Standards
- Permissions are granular (`resource:action`).
- Permissions derived from role (not per-user).
- Permission checks via `hasPermission()` utility.
- No direct role checks in business logic (`if user.role === 'admin'`); use `hasPermission(user, '...')`.

### 10.3 Enforcement Standards
- Edge Middleware for route-level.
- Server actions for action-level.
- RLS for row-level.
- All three layers active (defense in depth).

### 10.4 Audit Standards
- Every admin action audited.
- Audit entries immutable.
- Audit entries include before/after state.
- Audit logs retained 7 years.

## 11. Best Practices

### 11.1 When Adding a New Permission
1. Add to `Permission` type in `@packages/types`.
2. Add to appropriate role in `rolePermissions` mapping.
3. Use `hasPermission()` in server action.
4. Add audit logging if admin action.
5. Update this document via PR.

### 11.2 When Checking Permissions
- Use `hasPermission(user, 'resource:action')`, not `user.role === 'admin'`.
- Use `requirePermission()` in server actions (throws on denial).
- Use `requirePermissionWithAudit()` for admin actions.

### 11.3 When Changing a User's Role
- Verify you have authority for the target role.
- Audit the change with before/after.
- Force JWT refresh.
- Send notification email.

### 11.4 When Debugging Permission Issues
- Check user's role in JWT (decode at jwt.io).
- Check `rolePermissions` mapping.
- Check Edge Middleware for route protection.
- Check server action for permission check.
- Check RLS policies for row-level access.

## 12. Future Expansion

### 12.1 Dynamic Permissions (Phase 3+)
- Permissions stored in DB, not code.
- Custom roles creatable by super_admin.
- Per-team permissions.

### 12.2 Multi-Tenancy Roles (Phase 3+)
- `tenant_admin` role for team/workspace admins.
- Per-tenant role assignments.
- Cross-tenant access controls.

### 12.3 Publisher Role (Phase 4, DGA-10)
- `publisher` role for marketplace tool publishers.
- Permissions: `tool:publish:own` (publish own tools), `tool:manage:own`.
- Verified publisher badge.

### 12.4 Two-Person Rule (Phase 2+)
- Critical actions (super_admin grant, audit deletion) require two admins.
- Reduces insider threat risk.

### 12.5 SSO Role Mapping (Phase 3+)
- Enterprise SSO (SAML, SCIM).
- Role mapping from IdP claims.
- Auto-provisioning on SSO login.

## 13. Dependencies

### 13.1 Document Dependencies
- Depends on `00_Project_Charter` §3 LOCK-11, §4 EC-08, §6 DGA-07.
- Depends on `04_TechStack` AD-03 (Supabase Auth for JWT).
- Depends on `19_DatabaseDesign` §5 (RLS policies, audit table).
- `06_ArchitectureDecisionRecords` — ADR-011, ADR-020, ADR-070.
- `20_APIConvention` — API auth and permission checks.
- `22_UserFlow` — User flows reference roles.
- `24_AdminSpecification` — Admin role management UI.
- `27_DeploymentGuide` — Edge Middleware deployment.

### 13.2 External Dependencies
- Supabase Auth (JWT issuance, role claims).
- Postgres RLS (row-level enforcement).

### 13.3 Assumptions
- Six roles sufficient through Phase 2.
- JWT-based auth check adequate (no per-request DB call).
- RLS performance acceptable.

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial RBAC. Defined six-role hierarchy (guest/user/premium/editor/admin/super_admin), permission model (role→permission→resource→action), three-layer enforcement (Edge Middleware, server actions, RLS), audit logging for all admin actions, JWT-based role claims. |

## 15. Cross References

- `00_Project_Charter` §3 LOCK-11, §4 EC-08, §6 DGA-07 — Implemented.
- `02_SAD` §9.2 — Authorization cross-cutting concern (this document implements it).
- `06_ArchitectureDecisionRecords` — ADR-011 (Admin Philosophy), ADR-020 (Security by Default), ADR-070 (Auditability).
- `04_TechStack` AD-03 — Supabase Auth provides JWT with role claims.
- `19_DatabaseDesign` §5 — RLS policies enforce row-level access.
- `20_APIConvention` §7 — API authentication and authorization.
- `22_UserFlow` — User flows reference role-based access.
- `24_AdminSpecification` — Admin panel for role management.
- `27_DeploymentGuide` — Edge Middleware deployment.
- `28_AI_Guideline` — AI must follow RBAC (LOCK-09, EC-11).
