// src/shared/components/command-palette.tsx — Command palette (Cmd+K / Ctrl+K).
// Phase 3 Sprint 6 — UX Polish.
//
// Provides fuzzy search across all tools, recent items, and quick actions.
// Opens via Cmd+K (Mac) or Ctrl+K (Windows/Linux).

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { searchIndex } from '@/generated/search-index';
import type { SearchIndexEntry } from '@packages/types';
import { navigation } from '@/generated/navigation';
import { useCommandPaletteStore } from '@/shared/hooks/use-command-palette-store';

const RECENT_KEY = 'cmd-recent';
const MAX_RECENT = 5;

interface RecentItem {
  slug: string;
  category: string;
  title: string;
  url: string;
}

function loadRecent(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentItem[];
  } catch {
    return [];
  }
}

function saveRecent(items: RecentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    // localStorage might be unavailable (private mode) — fail silently
  }
}

function pushRecent(item: RecentItem): void {
  const current = loadRecent().filter((r) => r.slug !== item.slug);
  const next = [item, ...current].slice(0, MAX_RECENT);
  saveRecent(next);
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPaletteStore();
  const router = useRouter();
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [search, setSearch] = useState('');

  // Load recent items on mount and when palette opens
  useEffect(() => {
    if (open) {
      // Defer to next tick to avoid synchronous setState during effect commit
      const items = loadRecent();
      queueMicrotask(() => setRecent(items));
    }
  }, [open]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Use functional update to avoid stale-closure dependency on `open`
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpen]);

  // Escape closes the palette (CommandDialog already handles this internally,
  // but we also clear the search input on close).
  useEffect(() => {
    if (!open) {
      queueMicrotask(() => setSearch(''));
    }
  }, [open]);

  const goTo = useCallback(
    (entry: SearchIndexEntry) => {
      pushRecent({
        slug: entry.slug,
        category: entry.category,
        title: entry.title,
        url: entry.url,
      });
      setOpen(false);
      router.push(entry.url);
    },
    [router, setOpen],
  );

  // Filter search results by query (simple substring match for client-side).
  const filtered = useMemo(() => {
    if (!search.trim()) return searchIndex.slice(0, 8);
    const q = search.toLowerCase();
    return searchIndex
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.slug.includes(q) ||
          e.category.includes(q) ||
          e.keywords.some((k) => k.toLowerCase().includes(q)),
      )
      .slice(0, 12);
  }, [search]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search tools, categories, or actions…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {recent.length > 0 && !search.trim() && (
          <>
            <CommandGroup heading="Recent">
              {recent.map((r) => (
                <CommandItem
                  key={`recent-${r.slug}`}
                  value={`recent-${r.slug}`}
                  onSelect={() => {
                    router.push(r.url);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2 text-muted-foreground">★</span>
                  <span>{r.title}</span>
                  <CommandShortcut>{r.category}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Tools">
          {filtered.map((entry) => (
            <CommandItem
              key={`${entry.category}-${entry.slug}`}
              value={`${entry.slug} ${entry.title} ${entry.category}`}
              onSelect={() => goTo(entry)}
            >
              <span className="mr-2 text-muted-foreground">▸</span>
              <span className="flex-1">{entry.title}</span>
              <CommandShortcut className="capitalize">{entry.category}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        {filtered.length === 0 && search.trim() && (
          <CommandGroup heading="Categories">
            {navigation.map((nav) => (
              <CommandItem
                key={`cat-${nav.category}`}
                value={`category-${nav.category}`}
                onSelect={() => {
                  router.push(`/tools/${nav.category}`);
                  setOpen(false);
                }}
              >
                <span className="mr-2 text-muted-foreground">⊞</span>
                <span className="flex-1 capitalize">{nav.category} tools</span>
                <CommandShortcut>{nav.tools.length} tools</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="go-home"
            onSelect={() => {
              router.push('/');
              setOpen(false);
            }}
          >
            <span className="mr-2 text-muted-foreground">⌂</span>
            <span>Go to homepage</span>
            <CommandShortcut>Home</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="go-dashboard"
            onSelect={() => {
              router.push('/dashboard');
              setOpen(false);
            }}
          >
            <span className="mr-2 text-muted-foreground">▦</span>
            <span>Open dashboard</span>
            <CommandShortcut>Dashboard</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="go-login"
            onSelect={() => {
              router.push('/login');
              setOpen(false);
            }}
          >
            <span className="mr-2 text-muted-foreground">⚿</span>
            <span>Sign in</span>
            <CommandShortcut>Login</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
