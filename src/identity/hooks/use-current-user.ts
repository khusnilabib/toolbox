// src/identity/hooks/use-current-user.ts — Client auth state hook.
//
// Subscribes to the Supabase browser client's auth state and exposes the
// current platform user. Guest-first: when Supabase is not configured the
// hook returns `{ user: null, loading: false }` immediately so every page
// still renders for anonymous visitors.

'use client';

import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/identity/lib/supabase-client';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface UseCurrentUserResult {
  user: User | null;
  loading: boolean;
  /** Re-fetch the user imperatively (e.g. after a server-action sign-in). */
  refresh: () => Promise<void>;
}

function toUser(session: Session | null): User | null {
  const u = session?.user;
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? '',
    role: (u.app_metadata?.['role'] as string | undefined) ?? 'user',
  };
}

/**
 * Subscribe to the Supabase auth state and return the current user.
 */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async (): Promise<void> => {
    const client = getSupabaseBrowser();
    if (!client) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await client.auth.getSession();
      setUser(toUser(data.session));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const client = getSupabaseBrowser();
    if (!client) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Initial resolve (avoids a flash of `loading` if a session is cached).
    let active = true;
    client.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUser(toUser(data.session));
      })
      .catch(() => {
        if (!active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Subscribe to subsequent auth changes (sign-in, sign-out, token refresh).
    const { data: sub } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(toUser(session));
        setLoading(false);
      },
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, refresh };
}
