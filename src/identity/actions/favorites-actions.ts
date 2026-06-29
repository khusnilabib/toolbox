// src/identity/actions/favorites-actions.ts — Server actions for favorites persistence.
// Phase 2 Sprint 6 — Favorites persistence.

'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/identity/lib/supabase-server';
import { isSupabaseConfigured } from '@/shared/config/env';

export interface FavoriteInput {
  toolSlug: string;
  toolCategory: string;
}

export interface FavoriteActionResult {
  success: boolean;
  error?: string;
  isFavorite?: boolean;
}

const NOT_CONFIGURED = 'Favorites persistence is not configured on this deployment.';

/**
 * Toggle a tool as favorite for the current user.
 */
export async function toggleFavorite(input: FavoriteInput): Promise<FavoriteActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'You must be signed in to favorite tools.' };

  // Check if already a favorite
  const { data: existing } = await client
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_slug', input.toolSlug)
    .maybeSingle();

  if (existing) {
    // Unfavorite
    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_slug', input.toolSlug);
    if (error) return { success: false, error: 'Failed to unfavorite.' };
    revalidatePath('/dashboard');
    return { success: true, isFavorite: false };
  }

  // Favorite
  const { error } = await client.from('favorites').insert({
    user_id: user.id,
    tool_slug: input.toolSlug,
    tool_category: input.toolCategory,
  });

  if (error) return { success: false, error: 'Failed to favorite.' };

  revalidatePath('/dashboard');
  return { success: true, isFavorite: true };
}

/**
 * Get all favorites for the current user.
 */
export async function getFavorites(): Promise<{
  success: boolean;
  data?: Array<{ toolSlug: string; toolCategory: string; createdAt: string }>;
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
    .from('favorites')
    .select('tool_slug, tool_category, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: 'Failed to fetch favorites.' };

  return {
    success: true,
    data: (data ?? []).map((r) => ({
      toolSlug: r.tool_slug,
      toolCategory: r.tool_category,
      createdAt: r.created_at,
    })),
  };
}

/**
 * Check if a specific tool is favorited by the current user.
 */
export async function isFavorited(toolSlug: string): Promise<{
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, isFavorite: false };

  const { data } = await client
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_slug', toolSlug)
    .maybeSingle();

  return { success: true, isFavorite: Boolean(data) };
}

/**
 * Track a tool view (recently viewed).
 */
export async function trackToolView(input: FavoriteInput): Promise<FavoriteActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  // Upsert: update viewed_at if exists, else insert.
  const { error } = await client
    .from('recently_viewed')
    .upsert(
      {
        user_id: user.id,
        tool_slug: input.toolSlug,
        tool_category: input.toolCategory,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,tool_slug' },
    );

  if (error) return { success: false, error: 'Failed to track view.' };

  return { success: true };
}

/**
 * Get recently viewed tools for the current user.
 */
export async function getRecentlyViewed(limit = 12): Promise<{
  success: boolean;
  data?: Array<{ toolSlug: string; toolCategory: string; viewedAt: string }>;
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
    .from('recently_viewed')
    .select('tool_slug, tool_category, viewed_at')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: 'Failed to fetch recently viewed.' };

  return {
    success: true,
    data: (data ?? []).map((r) => ({
      toolSlug: r.tool_slug,
      toolCategory: r.tool_category,
      viewedAt: r.viewed_at,
    })),
  };
}

/**
 * Record a search query.
 */
export async function recordSearch(query: string, resultCount: number): Promise<FavoriteActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await client.from('search_history').insert({
    user_id: user.id,
    query: query.slice(0, 200),
    result_count: resultCount,
  });

  if (error) return { success: false, error: 'Failed to record search.' };

  return { success: true };
}

/**
 * Record a download.
 */
export async function recordDownload(input: {
  toolSlug: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storagePath?: string;
}): Promise<FavoriteActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await client.from('downloads').insert({
    user_id: user.id,
    tool_slug: input.toolSlug,
    filename: input.filename.slice(0, 255),
    mime_type: input.mimeType.slice(0, 100),
    size_bytes: input.sizeBytes,
    storage_path: input.storagePath,
  });

  if (error) return { success: false, error: 'Failed to record download.' };

  return { success: true };
}

/**
 * Get recent downloads for the current user.
 */
export async function getRecentDownloads(limit = 20): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    toolSlug: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
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
    .from('downloads')
    .select('id, tool_slug, filename, mime_type, size_bytes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: 'Failed to fetch downloads.' };

  return {
    success: true,
    data: (data ?? []).map((r) => ({
      id: r.id,
      toolSlug: r.tool_slug,
      filename: r.filename,
      mimeType: r.mime_type,
      sizeBytes: Number(r.size_bytes),
      createdAt: r.created_at,
    })),
  };
}
