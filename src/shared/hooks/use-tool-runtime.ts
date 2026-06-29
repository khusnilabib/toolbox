// src/shared/hooks/use-tool-runtime.ts — React runtime for the ToolEngine.

'use client';

import { useCallback, useRef, useState } from 'react';
import { ToolEngine } from '@packages/tool-engine';
import type {
  DownloadResult,
  ToolEnginePhase,
  ToolStages,
} from '@packages/tool-engine';
import type { ToolError } from '@packages/types';
import { useAnalytics } from './use-analytics';

export interface UseToolRuntimeResult<TInput, TOutput> {
  phase: ToolEnginePhase;
  progress: number;
  output: TOutput | null;
  error: ToolError | null;
  run: (input: TInput) => Promise<TOutput | null>;
  download: () => Promise<DownloadResult | null>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Hook that wraps a ToolStages bundle and exposes the engine state to the UI.
 */
export function useToolRuntime<TInput, TOutput>(
  slug: string,
  stages: ToolStages<TInput, TOutput>,
  category?: string,
): UseToolRuntimeResult<TInput, TOutput> {
  const { trackStandard } = useAnalytics();
  const engineRef = useRef<ToolEngine<TInput, TOutput> | null>(null);
  const [phase, setPhase] = useState<ToolEnginePhase>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [output, setOutput] = useState<TOutput | null>(null);
  const [error, setError] = useState<ToolError | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new ToolEngine<TInput, TOutput>(stages, { autoAnalytics: true });
    }
    return engineRef.current;
  }, [stages]);

  const run = useCallback(
    async (input: TInput): Promise<TOutput | null> => {
      trackStandard('tool_started', { slug }, { tool: slug, category });
      try {
        setPhase('input');
        setError(null);
        setProgress(0);
        const result = await getEngine().execute(input);
        setOutput(result);
        setPhase('preview');
        trackStandard('processing_completed', { slug }, { tool: slug, category });
        return result;
      } catch (err) {
        const toolError =
          err && typeof err === 'object' && 'kind' in err
            ? (err as ToolError)
            : {
                kind: 'processing' as const,
                cause: err instanceof Error ? err.message : String(err),
                userMessage: {
                  what: 'Processing failed',
                  howToFix: 'Please try again.',
                },
              };
        setError(toolError);
        setPhase('error');
        trackStandard('validation_failed', { slug, error: toolError.cause }, { tool: slug, category });
        return null;
      }
    },
    [getEngine, trackStandard, slug, category],
  );

  const download = useCallback(async (): Promise<DownloadResult | null> => {
    if (!output) return null;
    trackStandard('download_attempted', { slug }, { tool: slug, category });
    try {
      const result = await getEngine().download(output);
      trackStandard('download_completed', { slug, filename: result.filename }, { tool: slug, category });
      setPhase('complete');
      return result;
    } catch (err) {
      const cause = err instanceof Error ? err.message : String(err);
      setError({
        kind: 'processing',
        cause,
        userMessage: { what: 'Download failed', howToFix: 'Please try again.' },
      });
      setPhase('error');
      return null;
    }
  }, [output, getEngine, trackStandard, slug, category]);

  const cancel = useCallback(() => {
    getEngine().cancel();
    setPhase('cancelled');
  }, [getEngine]);

  const reset = useCallback(() => {
    setPhase('idle');
    setProgress(0);
    setOutput(null);
    setError(null);
  }, []);

  return { phase, progress, output, error, run, download, cancel, reset };
}
