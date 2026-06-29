// src/identity/actions/profile-actions.ts — Server actions for profile management.
// Phase 2 Sprint 6 — Profiles.

'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/identity/lib/supabase-server';
import { isSupabaseConfigured } from '@/shared/config/env';

export interface ProfileUpdateInput {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
}

export interface ProfileActionResult {
  success: boolean;
  error?: string;
  profile?: {
    id: string;
    email: string;
    fullName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    preferences: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
}

const NOT_CONFIGURED = 'Profiles are not configured on this deployment.';

/**
 * Get the current user's profile.
 */
export async function getProfile(): Promise<ProfileActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { data, error } = await client
    .from('profiles')
    .select('id, email, full_name, bio, avatar_url, preferences, created_at, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return { success: false, error: 'Failed to fetch profile.' };
  if (!data) return { success: false, error: 'Profile not found.' };

  return {
    success: true,
    profile: {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      preferences: (data.preferences as Record<string, unknown>) ?? {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(input: ProfileUpdateInput): Promise<ProfileActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.fullName !== undefined) update.full_name = input.fullName.slice(0, 200);
  if (input.bio !== undefined) update.bio = input.bio.slice(0, 2000);
  if (input.avatarUrl !== undefined) update.avatar_url = input.avatarUrl.slice(0, 1000);
  if (input.preferences !== undefined) update.preferences = input.preferences;

  const { data, error } = await client
    .from('profiles')
    .update(update)
    .eq('user_id', user.id)
    .select('id, email, full_name, bio, avatar_url, preferences, created_at, updated_at')
    .single();

  if (error) return { success: false, error: 'Failed to update profile.' };

  revalidatePath('/dashboard');
  return {
    success: true,
    profile: {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      preferences: (data.preferences as Record<string, unknown>) ?? {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}
