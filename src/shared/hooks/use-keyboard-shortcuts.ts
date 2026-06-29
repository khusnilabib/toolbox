// src/shared/hooks/use-keyboard-shortcuts.ts — Global keyboard shortcuts.
// Phase 3 Sprint 6 — UX Polish.
//
// Registers global keyboard shortcuts for common actions:
// - Cmd/Ctrl + K: Open command palette
// - Cmd/Ctrl + /: Show shortcuts help
// - Cmd/Ctrl + ,: Open settings
// - g then h: Go home
// - g then d: Go to dashboard
// - /: Focus search
// - ?: Show keyboard shortcuts help

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandPaletteStore } from './use-command-palette-store';

export interface ShortcutHandler {
  combo: string;
  description: string;
  handler: (e: KeyboardEvent) => void;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const setOpen = useCommandPaletteStore((s) => s.setOpen);

  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;
    const DOUBLE_KEY_WINDOW = 500;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');
      const isContentEditable = target?.isContentEditable ?? false;
      const isTyping = isInput || isContentEditable;

      // Cmd/Ctrl + K → Command palette (always works)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // Cmd/Ctrl + / → Focus first heading (accessibility aid)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        const h1 = document.querySelector('h1');
        if (h1 instanceof HTMLElement) {
          h1.setAttribute('tabindex', '-1');
          h1.focus();
        }
        return;
      }

      // Skip remaining shortcuts when user is typing
      if (isTyping) return;

      // / → Focus search input
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const search = document.querySelector('input[type="search"], input[role="searchbox"]');
        if (search instanceof HTMLInputElement) {
          search.focus();
        }
        return;
      }

      // ? → Show shortcuts help (dispatch custom event)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('shortcuts:show-help'));
        return;
      }

      // g + h/d → navigation (double-key shortcut, like GitHub)
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const now = Date.now();
        if (lastKey === 'g' && now - lastKeyTime < DOUBLE_KEY_WINDOW) {
          // double g — ignore
        }
        lastKey = 'g';
        lastKeyTime = now;
        return;
      }

      if (lastKey === 'g' && Date.now() - lastKeyTime < DOUBLE_KEY_WINDOW) {
        if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          router.push('/');
          lastKey = '';
          return;
        }
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          router.push('/dashboard');
          lastKey = '';
          return;
        }
        if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          router.push('/login');
          lastKey = '';
          return;
        }
      }

      lastKey = e.key.toLowerCase();
      lastKeyTime = Date.now();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, setOpen]);
}

export const SHORTCUT_DOCUMENTATION: Array<{ keys: string; description: string }> = [
  { keys: '⌘ K', description: 'Open command palette' },
  { keys: '⌘ /', description: 'Focus page heading (accessibility)' },
  { keys: '/', description: 'Focus search (when not typing)' },
  { keys: '?', description: 'Show keyboard shortcuts help' },
  { keys: 'g h', description: 'Go to homepage' },
  { keys: 'g d', description: 'Go to dashboard' },
  { keys: 'g l', description: 'Go to login page' },
  { keys: '⌘ Z', description: 'Undo last destructive action' },
];
