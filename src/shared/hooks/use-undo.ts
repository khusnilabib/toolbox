// src/shared/hooks/use-undo.ts — Undo actions hook.
// Phase 3 Sprint 6 — UX Polish.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UndoEntry {
  description: string;
  undo: () => void | Promise<void>;
}

const undoStack: UndoEntry[] = [];
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

async function performUndoLast(): Promise<void> {
  const entry = undoStack.pop();
  if (entry) {
    try {
      await entry.undo();
    } catch (err) {
      console.warn('[undo] Undo failed:', err);
    }
    notifyListeners();
  }
}

export interface UseUndoResult {
  registerUndo: (description: string, undo: () => void | Promise<void>) => () => void;
  canUndo: boolean;
  undoLast: () => Promise<void>;
  clearHistory: () => void;
  history: UndoEntry[];
}

export function useUndo(): UseUndoResult {
  const [, forceRender] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const listener = () => {
      tickRef.current += 1;
      forceRender(tickRef.current);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (undoStack.length > 0) {
          e.preventDefault();
          void performUndoLast();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const registerUndo = useCallback((description: string, undo: () => void | Promise<void>) => {
    const entry: UndoEntry = { description, undo };
    undoStack.push(entry);
    notifyListeners();
    return () => {
      const idx = undoStack.indexOf(entry);
      if (idx >= 0) undoStack.splice(idx, 1);
      notifyListeners();
    };
  }, []);

  const undoLast = useCallback(() => performUndoLast(), []);

  const clearHistory = useCallback(() => {
    undoStack.length = 0;
    notifyListeners();
  }, []);

  return {
    registerUndo,
    canUndo: undoStack.length > 0,
    undoLast,
    clearHistory,
    history: undoStack,
  };
}
