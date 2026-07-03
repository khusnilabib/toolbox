# 46 — AI Admin Template

> **Purpose:** Canonical implementation template for every admin module.
> **Last Updated:** 2026-06-28 · **Revision:** 1.0.0

---

## 1. Page Structure

```
src/app/(admin)/admin/[module]/
├── page.tsx                  # List view
├── [id]/page.tsx             # Detail view (if applicable)
├── new/page.tsx              # Create form (if applicable)
├── components/
│   ├── [Module]Table.tsx     # Data table
│   ├── [Module]Form.tsx      # Create/edit form
│   └── [Module]Detail.tsx    # Detail view
└── tests/
    └── [module].test.tsx     # Tests
```

**Server actions in:** `src/platform-ops/application/actions/[module].ts`

## 2. Permissions

```typescript
// Every admin page must check RBAC
import { requirePermission } from '@/shared/lib/auth-server';

// Page-level (in layout or page)
export default async function AdminModulePage() {
  await requirePermission('[module]:read');
  // ...
}

// Action-level (in server action)
'use server';
export async function createModuleItem(input: unknown) {
  const user = await requirePermissionWithAudit(
    '[module]:write',
    'admin_[module]_created',
    { type: '[module]', id: item.id }
  );
  // ...
}
```

**Minimum roles per module:**
| Module | Read | Write |
|--------|------|-------|
| Dashboard | editor | N/A |
| Users | admin | super_admin |
| Tools | editor | admin |
| Content | editor | editor |
| SEO | editor | editor |
| Analytics | admin | N/A |
| Feature Flags | admin | admin |
| Audit Trail | admin | N/A (read-only) |
| Settings | admin | admin |
| System Health | admin | N/A |

## 3. Server Actions

```typescript
// src/platform-ops/application/actions/[module].ts
'use server';

import { z } from 'zod';
import { requirePermission, requirePermissionWithAudit } from '@/shared/lib/auth-server';
import { [module]Repository } from '@/platform-ops/infrastructure/repositories/[module]-repository';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  // ... fields
});

export async function create[Module](input: unknown) {
  // 1. Validate input
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_FAILED', details: parsed.error.issues } };
  }

  // 2. Check permission + audit
  const user = await requirePermissionWithAudit(
    '[module]:write',
    'admin_[module]_created',
    { type: '[module]', id: 'pending' }
  );

  // 3. Execute
  const item = await [module]Repository.create(parsed.data);

  // 4. Return
  return { data: item };
}

export async function update[Module](id: string, input: unknown) {
  const parsed = createSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { error: { code: 'VALIDATION_FAILED', details: parsed.error.issues } };
  }

  const user = await requirePermissionWithAudit(
    '[module]:write',
    'admin_[module]_updated',
    { type: '[module]', id }
  );

  const before = await [module]Repository.findById(id);
  const after = await [module]Repository.update(id, parsed.data);

  // Audit includes before/after
  await auditWithBeforeAfter(user, 'admin_[module]_updated', { type: '[module]', id }, before, after);

  return { data: after };
}

export async function delete[Module](id: string) {
  const user = await requirePermissionWithAudit(
    '[module]:delete',
    'admin_[module]_deleted',
    { type: '[module]', id }
  );

  await [module]Repository.delete(id);
  return { data: { id } };
}
```

## 4. Validation

- All input validated with Zod schemas.
- Schema defined at top of server action file.
- TypeScript types inferred from Zod.
- No `any` in inputs or outputs.

## 5. Audit

Every write action (create, update, delete, toggle, publish) MUST:
1. Call `requirePermissionWithAudit()` (not just `requirePermission()`).
2. Include `action` name (e.g., `admin_feature_flag_toggled`).
3. Include `resourceType` and `resourceId`.
4. For updates: include `beforeState` and `afterState` in audit entry.

Audit entries are **immutable** (no UPDATE or DELETE). Stored in `platform_ops.audit_entries`. Retained 7 years.

## 6. Analytics

Admin actions emit events per `16_EventSchemaSpecification`:
- `admin_tool_published` / `admin_tool_deprecated`
- `admin_seo_updated`
- `admin_user_role_changed`
- `admin_settings_modified`
- `admin_feature_flag_toggled`

These are server-side events (not client-side analytics). Emitted via `ServerAnalytics` service.

## 7. Error Handling

```typescript
// Consistent error format (per 20_APIConvention)
return { error: { code: 'VALIDATION_FAILED', message: '...', details: [...] } };
return { error: { code: 'UNAUTHORIZED' } };
return { error: { code: 'PERMISSION_DENIED' } };
return { error: { code: 'NOT_FOUND' } };
return { error: { code: 'CONFLICT' } };
return { error: { code: 'INTERNAL_ERROR' } };
```

Client-side: display errors via `ErrorDisplay` component (PC-08: what/why/how).

## 8. Accessibility

- Table has proper `<thead>`, `<tbody>`, `<th scope>`.
- Form fields have associated `<label>`.
- Buttons have `aria-label` if icon-only.
- Modals trap focus; Escape closes.
- Keyboard navigation works (Tab, Enter, Escape).
- Color contrast ≥4.5:1.

## 9. Testing

```typescript
// tests/[module].test.tsx
import { test, expect } from '@playwright/test';

test('admin can view [module] list', async ({ page }) => {
  // Login as admin
  await page.goto('/admin/[module]');
  await expect(page.locator('h1')).toContainText('[Module]');
  await expect(page.locator('table')).toBeVisible();
});

test('admin can create [module] item', async ({ page }) => {
  await page.goto('/admin/[module]/new');
  await page.fill('[name=name]', 'Test Item');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/admin\/[module]/);
  await expect(page.locator('text=Test Item')).toBeVisible();
});

test('non-admin cannot access [module]', async ({ page }) => {
  // Login as regular user
  await page.goto('/admin/[module]');
  await expect(page).toHaveURL(/\/login/);
});
```

## 10. Definition of Done

- [ ] Page structure created per template.
- [ ] RBAC enforced (minimum role check).
- [ ] Server actions with Zod validation.
- [ ] Every write action audited (DGA-07).
- [ ] Error handling consistent (20_APIConvention format).
- [ ] Accessible (WCAG AA).
- [ ] Tests written (list, create, update, delete, permission denial).
- [ ] Uses design system components (EC-10).
- [ ] Mobile-responsive (though admin primarily desktop).
- [ ] Documentation updated (14_ACD or 29_AdminSpecification).
