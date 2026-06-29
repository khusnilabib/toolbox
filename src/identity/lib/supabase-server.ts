// src/identity/lib/supabase-server.ts — Server Supabase client (cookies-aware).
//
// Uses `createServerClient` from `@supabase/ssr` bound to the Next.js cookies
// store. Returns `null` when Supabase is not configured so server components
// and server actions degrade gracefully (guest-first).

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/shared/config/env';

export type ServerSupabaseClient = SupabaseClient;

/**
 * Create a server-side Supabase client bound to the current request's cookies.
 * Must be called from a Server Component, Route Handler, or Server Action.
 *
 * Returns `null` when Supabase is not configured.
 */
export async function createSupabaseServerClient(): Promise<ServerSupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(changes: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          for (const change of changes) {
            const { name, value, options } = change;
            cookieStore.set(name, value, options as never);
          }
        } catch {
          // The `setAll` method is called from a Server Component where
          // cookies cannot be mutated. This is safe to ignore — the middleware
          // or a Server Action will refresh the session on the next request.
        }
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Resolve the current user on the server (server component / server action).
 * Returns `null` when there is no session or Supabase is not configured.
 */
export async function getServerUser(): Promise<{
  id: string;
  email: string;
  role: string;
} | null> {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? '',
      role: (user.app_metadata?.['role'] as string | undefined) ?? 'user',
    };
  } catch {
    return null;
  }
}
