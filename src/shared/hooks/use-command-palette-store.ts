// src/shared/hooks/use-command-palette-store.ts — Zustand store for command palette.
// Phase 3 Sprint 6 — UX Polish.

'use client';

import { create } from 'zustand';

interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggle: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set, get) => ({
  open: false,
  setOpen: (open) =>
    set((state) => ({
      open: typeof open === 'function' ? open(state.open) : open,
    })),
  toggle: () => set({ open: !get().open }),
}));
