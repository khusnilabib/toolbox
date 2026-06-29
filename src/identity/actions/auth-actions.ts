// src/identity/actions/auth-actions.ts — Server actions for authentication.
//
// All actions return `{ success: boolean; error?: string; url?: string }`.
// `url` is returned by `signInWithGoogle` so the client can navigate to the
// OAuth provider (server actions cannot navigate the browser themselves).
//
// Guest-first: when Supabase is not configured, every action returns a clear
// `error` so the UI can surface a helpful message without crashing.

'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/identity/lib/supabase-server';
import { isSupabaseConfigured } from '@/shared/config/env';

export interface AuthActionResult {
  success: boolean;
  error?: string;
  /** OAuth URL (Google sign-in). Client navigates to this URL. */
  url?: string;
}

const NOT_CONFIGURED =
  'Authentication is not configured on this deployment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.';

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (m.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (m.includes('password')) {
    return 'Password must be at least 6 characters.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Could not reach the authentication service. Please try again.';
  }
  return message;
}

/**
 * Sign in with email + password.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, error: friendlyError(error.message) };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Sign up with email + password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const { data, error } = await client.auth.signUp({ email, password });
  if (error) {
    return { success: false, error: friendlyError(error.message) };
  }
  // If email confirmation is required, no session is returned.
  if (!data.session) {
    return {
      success: true,
      error: 'Check your email to confirm your account, then sign in.',
    };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Start Google OAuth. Returns the provider URL for the client to navigate to.
 */
export async function signInWithGoogle(): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/`,
    },
  });
  if (error) {
    return { success: false, error: friendlyError(error.message) };
  }
  return { success: true, url: data.url };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) return { success: false, error: NOT_CONFIGURED };
  const client = await createSupabaseServerClient();
  if (!client) return { success: false, error: NOT_CONFIGURED };

  const { error } = await client.auth.signOut();
  if (error) {
    return { success: false, error: friendlyError(error.message) };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}
