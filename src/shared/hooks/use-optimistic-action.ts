// src/shared/hooks/use-optimistic-action.ts — Optimistic UI hook for server actions.
// Phase 3 Sprint 6 — UX Polish.
//
// Wraps a server action with optimistic state updates. The hook:
// 1. Applies the optimistic update immediately
// 2. Calls the server action
// 3. Reverts on failure
// 4. Confirms on success

'use client';

import { useCallback, useState, useTransition } from 'react';

export interface OptimisticActionOptions<TData, TPayload> {
  // The server action to call
  action: (payload: TPayload) => Promise<{ success: boolean; error?: string; data?: TData }>;
  // Apply the optimistic update to local state
  applyOptimistic: (data: TData, payload: TPayload) => TData;
  // Revert the optimistic update on failure (default: revert to previous state)
  revertOnFailure?: boolean;
  // Called on success
  onSuccess?: (data: TData, payload: TPayload) => void;
  // Called on failure
  onError?: (error: string, payload: TPayload) => void;
}

export interface OptimisticActionResult<TData, TPayload> {
  data: TData;
  error: string | null;
  isPending: boolean;
  execute: (payload: TPayload) => Promise<void>;
  setData: (updater: (prev: TData) => TData) => void;
}

export function useOptimisticAction<TData, TPayload>(
  initialData: TData,
  options: OptimisticActionOptions<TData, TPayload>,
): OptimisticActionResult<TData, TPayload> {
  const { action, applyOptimistic, revertOnFailure = true, onSuccess, onError } = options;
  const [data, setData] = useState<TData>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const execute = useCallback(
    async (payload: TPayload) => {
      const previous = data;
      setError(null);

      // Apply optimistic update synchronously
      const optimistic = applyOptimistic(data, payload);
      setData(optimistic);

      await new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            const result = await action(payload);
            if (result.success) {
              if (result.data !== undefined) {
                setData(result.data);
              }
              onSuccess?.(result.data ?? optimistic, payload);
            } else {
              if (revertOnFailure) setData(previous);
              const msg = result.error ?? 'Action failed';
              setError(msg);
              onError?.(msg, payload);
            }
          } catch (err) {
            if (revertOnFailure) setData(previous);
            const msg = err instanceof Error ? err.message : 'Unexpected error';
            setError(msg);
            onError?.(msg, payload);
          } finally {
            resolve();
          }
        });
      });
    },
    [action, applyOptimistic, data, onSuccess, onError, revertOnFailure],
  );

  const setDataExplicit = useCallback((updater: (prev: TData) => TData) => {
    setData(updater);
  }, []);

  return { data, error, isPending, execute, setData: setDataExplicit };
}
