// src/app/(public)/tools/[category]/[slug]/tool-runtime.tsx — Client runtime for the dynamic tool page.

'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { ToolEngine } from '@packages/tool-engine';
import type { DownloadResult, ToolStages } from '@packages/tool-engine';
import type { ToolManifest, ToolError } from '@packages/types';
import { toolBundles, type ToolInputFormProps } from '@/generated/tool-bundles';
import { FullPageLoading } from '@/shared/components/loading';
import { ErrorState } from '@/shared/components/error-state';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { triggerDownload } from '@/shared/lib/download-manager';
import { notificationService } from '@/shared/lib/notification-service';
import { useAnalytics } from '@/shared/hooks/use-analytics';

interface ToolRuntimeProps {
  category: string;
  slug: string;
}

type Phase = 'input' | 'processing' | 'preview' | 'download' | 'error';

export function ToolRuntime({ category, slug }: ToolRuntimeProps) {
  const key = `${category}/${slug}`;
  const bundle = toolBundles[key];
  const { trackStandard } = useAnalytics();

  const [manifest, setManifest] = useState<ToolManifest | null>(null);
  const [InputForm, setInputForm] = useState<React.ComponentType<ToolInputFormProps> | null>(null);
  const [phase, setPhase] = useState<Phase>('input');
  const [output, setOutput] = useState<unknown>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [engine, setEngine] = useState<ToolEngine<unknown, unknown> | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!bundle) return;
    queueMicrotask(() => {
      setManifest(null);
      setInputForm(null);
    });
    Promise.all([bundle.loadManifest(), bundle.loadInputForm()])
      .then(([m, f]) => {
        if (cancelled) return;
        setManifest(m.default);
        setInputForm(() => f.default);
        const stages = (m.default.stages as ToolStages<unknown, unknown> | undefined);
        if (stages) {
          setEngine(new ToolEngine<unknown, unknown>(stages, { autoAnalytics: true }));
        }
        trackStandard('tool_viewed', { slug }, { tool: slug, category });
      })
      .catch((err) => {
        const cause = err instanceof Error ? err.message : String(err);
        setError({ kind: 'unexpected', cause, userMessage: { what: 'Failed to load tool.', howToFix: 'Please refresh the page.' } });
        setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [bundle, slug, category, trackStandard]);

  if (!bundle) {
    return <ErrorState title="Tool not found" description="This tool is not registered in the platform." />;
  }
  if (error) {
    return <ErrorState error={error} retry={() => window.location.reload()} />;
  }
  if (!manifest || !InputForm || !engine) {
    return <FullPageLoading label={`Loading ${slug}…`} />;
  }

  const handleRun = async (input: unknown) => {
    setPhase('processing');
    setError(null);
    try {
      const result = await engine.execute(input);
      setOutput(result);
      setPhase('preview');
    } catch (err) {
      const toolError =
        err && typeof err === 'object' && 'kind' in err
          ? (err as ToolError)
          : {
              kind: 'processing' as const,
              cause: err instanceof Error ? err.message : String(err),
              userMessage: { what: 'Processing failed.', howToFix: 'Please try again.' },
            };
      setError(toolError);
      setPhase('error');
    }
  };

  const handleDownload = async () => {
    if (!output) return;
    setPhase('download');
    try {
      const result: DownloadResult = await engine.download(output);
      triggerDownload(result);
      notificationService.success('Download ready', { description: result.filename });
      setPhase('preview');
    } catch (err) {
      const cause = err instanceof Error ? err.message : String(err);
      setError({ kind: 'processing', cause, userMessage: { what: 'Download failed.', howToFix: 'Please try again.' } });
      setPhase('error');
    }
  };

  const handleReset = () => {
    setOutput(null);
    setError(null);
    setPhase('input');
  };

  const Preview = (manifest.stages as ToolStages<unknown, unknown> | undefined)?.preview;

  return (
    <div className="space-y-4">
      {phase === 'error' && error ? (
        <ErrorState error={error} retry={handleReset} />
      ) : null}

      {phase === 'input' || phase === 'processing' ? (
        <InputForm onRun={handleRun} loading={phase === 'processing'} />
      ) : null}

      {phase === 'preview' && output && Preview ? (
        <div className="space-y-4">
          <Preview output={output} onDownload={handleDownload} onModify={handleReset} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Download
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              Modify
            </Button>
          </div>
        </div>
      ) : null}

      {phase === 'download' ? <FullPageLoading label="Preparing download…" /> : null}
    </div>
  );
}
