// src/identity/lib/supabase-client.ts — Browser Supabase client (guest-first).
//
// Uses `createBrowserClient` from `@supabase/ssr`. Reads
// `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the
// environment. When Supabase is not configured (missing/placeholder creds) the
// factory returns `null` so the rest of the app can degrade gracefully —
// guests can still use every core tool without an account.

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/shared/config/env';

export type BrowserSupabaseClient = SupabaseClient;

/**
 * Create a new browser Supabase client. Returns `null` when Supabase is not
 * configured (or when called during SSR) so callers can short-circuit auth
 * flows without throwing.
 */
export function createSupabaseBrowserClient(): BrowserSupabaseClient | null {
  // Browser-only: createBrowserClient touches document.cookie.
  if (typeof window === 'undefined') return null;
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
    },
  });
}

let cached: BrowserSupabaseClient | null | undefined;

/**
 * Resolve the singleton browser client imperatively. Preferred inside hooks
 * and event handlers. `null` when Supabase is not configured.
 */
export function getSupabaseBrowser(): BrowserSupabaseClient | null {
  if (cached === undefined) {
    cached = createSupabaseBrowserClient();
  }
  return cached;
}

/**
 * Singleton browser Supabase client. Lazily initialised on first access via
 * `getSupabaseBrowser()`. `null` when Supabase is not configured or when
 * running on the server.
 *
 * NOTE: prefer `getSupabaseBrowser()` in code paths that may run before
 * module evaluation completes (rare). This export covers the common case.
 */
export const supabaseBrowser: BrowserSupabaseClient | null = getSupabaseBrowser();
