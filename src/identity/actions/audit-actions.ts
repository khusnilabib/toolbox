// src/identity/actions/audit-actions.ts — Server actions for audit logging.
// Phase 2 Sprint 6 — Audit logs (append-only).
//
// Audit log entries are written via the service role when configured.
// Users can read their own audit entries; only server-side code can write.

'use server';

import { createSupabaseServerClient } from '@/identity/lib/supabase-server';
import { isSupabaseConfigured } from '@/shared/config/env';

export interface AuditLogInput {
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Write an audit log entry. Called from server actions and API routes.
 *
 * NOTE: This function is fire-and-forget — failures are logged but do not
 * propagate to the caller, because audit log failures must never break
 * the primary user flow.
 */
export async function writeAuditLog(input: AuditLogInput): Promise<AuditLogResult> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Not configured.' };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: 'Not configured.' };

  const {
    data: { user },
  } = await client.auth.getUser();

  try {
    const { data, error } = await client
      .from('audit_logs')
      .insert({
        user_id: user?.id ?? null,
        action: input.action.slice(0, 100),
        resource_type: input.resourceType?.slice(0, 100) ?? null,
        resource_id: input.resourceId?.slice(0, 200) ?? null,
        metadata: input.metadata ?? {},
        ip_address: input.ipAddress ?? null,
        user_agent: input.userAgent?.slice(0, 500) ?? null,
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[audit] Failed to write audit log:', error.message);
      return { success: false, error: 'Failed to write audit log.' };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.warn('[audit] Exception while writing audit log:', err);
    return { success: false, error: 'Audit log exception.' };
  }
}

/**
 * Get recent audit log entries for the current user.
 */
export async function getRecentAuditLogs(limit = 50): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>;
  error?: string;
}> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Not configured.' };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: 'Not configured.' };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { data, error } = await client
    .from('audit_logs')
    .select('id, action, resource_type, resource_id, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: 'Failed to fetch audit logs.' };

  return {
    success: true,
    data: (data ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      resourceType: r.resource_type,
      resourceId: r.resource_id,
      metadata: (r.metadata as Record<string, unknown>) ?? {},
      createdAt: r.created_at,
    })),
  };
}
