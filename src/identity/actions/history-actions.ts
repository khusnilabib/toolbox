// src/identity/actions/history-actions.ts — Server actions for tool history persistence.
// Phase 2 Sprint 6 — History persistence.
//
// All actions require an authenticated user. When Supabase is not configured
// or the user is not signed in, actions return `{ success: false, error }`
// so the UI can degrade gracefully (LOCK-07: guest-first).

'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/identity/lib/supabase-server';
import { isSupabaseConfigured } from '@/shared/config/env';

export interface HistoryEntryInput {
  toolSlug: string;
  toolCategory: string;
  inputSummary: string;
  outputSummary: string;
  status: 'success' | 'failed' | 'cancelled';
  durationMs: number;
}

export interface HistoryActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

const NOT_CONFIGURED = 'History persistence is not configured on this deployment.';

/**
 * Save a tool execution entry to the authenticated user's history.
 */
export async function saveHistoryEntry(entry: HistoryEntryInput): Promise<HistoryActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'You must be signed in to save history.' };

  const { data, error } = await client
    .from('tool_history')
    .insert({
      user_id: user.id,
      tool_slug: entry.toolSlug,
      tool_category: entry.toolCategory,
      input_summary: entry.inputSummary.slice(0, 500),
      output_summary: entry.outputSummary.slice(0, 500),
      status: entry.status,
      duration_ms: entry.durationMs,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: 'Failed to save history entry.' };
  }

  revalidatePath('/dashboard');
  return { success: true, id: data.id };
}

/**
 * Fetch the most recent history entries for the current user.
 */
export async function getRecentHistory(limit = 20): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    toolSlug: string;
    toolCategory: string;
    inputSummary: string;
    outputSummary: string;
    status: string;
    durationMs: number;
    createdAt: string;
  }>;
  error?: string;
}> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { data, error } = await client
    .from('tool_history')
    .select('id, tool_slug, tool_category, input_summary, output_summary, status, duration_ms, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: 'Failed to fetch history.' };

  return {
    success: true,
    data: (data ?? []).map((r) => ({
      id: r.id,
      toolSlug: r.tool_slug,
      toolCategory: r.tool_category,
      inputSummary: r.input_summary,
      outputSummary: r.output_summary,
      status: r.status,
      durationMs: r.duration_ms,
      createdAt: r.created_at,
    })),
  };
}

/**
 * Delete a single history entry (owned by the current user).
 */
export async function deleteHistoryEntry(id: string): Promise<HistoryActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await client.from('tool_history').delete().eq('id', id).eq('user_id', user.id);

  if (error) return { success: false, error: 'Failed to delete entry.' };

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Clear all history entries for the current user.
 */
export async function clearAllHistory(): Promise<HistoryActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await client.from('tool_history').delete().eq('user_id', user.id);

  if (error) return { success: false, error: 'Failed to clear history.' };

  revalidatePath('/dashboard');
  return { success: true };
}
