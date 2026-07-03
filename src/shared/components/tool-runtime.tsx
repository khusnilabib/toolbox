// src/shared/components/tool-runtime.tsx — Generic, manifest-driven tool runtime.
//
// Loads a tool bundle (manifest + stages) from the registry, generates an input
// form from the manifest's Zod `inputSchema`, runs the Tool Engine pipeline,
// and renders the full lifecycle: empty → input → processing → preview →
// download, with error/retry, analytics, and recent-tools tracking.
//
// Phase 3 of the user-platform implementation.

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToolEngine } from '@packages/tool-engine';
import type { DownloadResult, ToolStages } from '@packages/tool-engine';
import type { ToolManifest, ToolError, ValidationRule } from '@packages/types';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Copy,
  Download,
  FileBox,
  Loader2,
  RotateCcw,
  Share2,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { FileDropzone } from '@/shared/components/file-dropzone';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { FeedbackWidget } from '@/shared/components/feedback-widget';
import { toolBundles } from '@/generated/tool-bundles';
import { useAnalytics } from '@/shared/hooks/use-analytics';
import { useRecentTools } from '@/shared/hooks/use-recent-tools';
import { useFavorites } from '@/shared/hooks/use-favorites';
import { triggerDownload } from '@/shared/lib/download-manager';
import { notificationService } from '@/shared/lib/notification-service';
import { cn } from '@/lib/utils';

export interface ToolRuntimeProps {
  category: string;
  slug: string;
}

type Status = 'loading' | 'input' | 'processing' | 'preview' | 'error';

export function ToolRuntime({ category, slug }: ToolRuntimeProps) {
  const key = `${category}/${slug}`;
  const bundle = toolBundles[key];
  const { trackStandard } = useAnalytics();
  const { addRecent } = useRecentTools();
  const { isFavorite, toggleFavorite, hydrated: favHydrated } = useFavorites();

  const [manifest, setManifest] = useState<ToolManifest | null>(null);
  const [engine, setEngine] = useState<ToolEngine<unknown, unknown> | null>(null);
  const [status, setStatus] = useState<Status>(bundle ? 'loading' : 'error');
  const [output, setOutput] = useState<unknown>(null);
  const [error, setError] = useState<ToolError | null>(
    bundle
      ? null
      : {
          kind: 'not_found',
          cause: 'bundle_missing',
          userMessage: {
            what: 'This tool is not registered.',
            howToFix: 'Return to the catalogue and pick a different tool.',
          },
        },
  );
  const [progress, setProgress] = useState(0);
  const [executionMs, setExecutionMs] = useState<number | null>(null);
  const engineRef = useRef<ToolEngine<unknown, unknown> | null>(null);

  // Load the manifest + engine bundle on mount.
  useEffect(() => {
    let cancelled = false;
    if (!bundle) return;
    Promise.resolve(bundle.loadManifest())
      .then((mod) => {
        if (cancelled) return;
        const m = mod.default;
        setManifest(m);
        const stages = m.stages as ToolStages<unknown, unknown> | undefined;
        if (stages) {
          const eng = new ToolEngine<unknown, unknown>(stages, { autoAnalytics: true });
          engineRef.current = eng;
          setEngine(eng);
        }
        setStatus('input');
        trackStandard('tool_viewed', { slug }, { tool: slug, category });
      })
      .catch((err) => {
        if (cancelled) return;
        const cause = err instanceof Error ? err.message : String(err);
        setError({
          kind: 'unexpected',
          cause,
          userMessage: { what: 'Failed to load tool.', howToFix: 'Please refresh the page.' },
        });
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [bundle, slug, category, trackStandard]);

  // Listen for progress events emitted by the Tool Engine.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ percent?: number; message?: string }>).detail;
      if (typeof detail?.percent === 'number') {
        setProgress((p) => Math.max(p, detail.percent!));
      }
    };
    window.addEventListener('tool:progress', handler as EventListener);
    return () => window.removeEventListener('tool:progress', handler as EventListener);
  }, []);

  const handleRun = useCallback(
    async (input: unknown) => {
      const eng = engineRef.current;
      if (!eng) return;
      setStatus('processing');
      setError(null);
      setProgress(0);
      const startTime = performance.now();
      trackStandard('tool_started', { slug }, { tool: slug, category });
      try {
        const result = await eng.execute(input);
        const durationMs = Math.round(performance.now() - startTime);
        setOutput(result);
        setStatus('preview');
        setProgress(100);
        setExecutionMs(durationMs);
        if (manifest) {
          addRecent({ slug, category, title: manifest.title });
        }
        trackStandard('processing_completed', { slug }, { tool: slug, category });
      } catch (err) {
        const toolError =
          err && typeof err === 'object' && 'kind' in err
            ? (err as ToolError)
            : {
                kind: 'processing' as const,
                cause: err instanceof Error ? err.message : String(err),
                userMessage: {
                  what: 'Processing failed.',
                  howToFix: 'Please try again. If the problem persists, refresh the page.',
                },
              };
        setError(toolError);
        setStatus('error');
        trackStandard(
          'validation_failed',
          { slug, error: toolError.cause },
          { tool: slug, category },
        );
      }
    },
    [slug, category, manifest, addRecent, trackStandard],
  );

  const handleDownload = useCallback(async () => {
    const eng = engineRef.current;
    if (!eng || !output) return;
    trackStandard('download_attempted', { slug }, { tool: slug, category });
    try {
      const result: DownloadResult = await eng.download(output);
      triggerDownload(result);
      notificationService.success('Download ready', { description: result.filename });
      trackStandard(
        'download_completed',
        { slug, filename: result.filename },
        { tool: slug, category },
      );
    } catch (err) {
      const cause = err instanceof Error ? err.message : String(err);
      setError({
        kind: 'processing',
        cause,
        userMessage: { what: 'Download failed.', howToFix: 'Please try again.' },
      });
      setStatus('error');
    }
  }, [output, slug, category, trackStandard]);

  const handleReset = useCallback(() => {
    setOutput(null);
    setError(null);
    setProgress(0);
    setStatus('input');
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setProgress(0);
    setStatus('input');
  }, []);

  const favorited = favHydrated && isFavorite(slug);
  const onToggleFavorite = () => {
    if (!manifest) return;
    toggleFavorite({ slug, category, title: manifest.title });
    trackStandard('favorite_toggled', { slug, action: favorited ? 'removed' : 'added' }, { tool: slug, category });
  };

  // ─── Render states ─────────────────────────────────────────
  if (!bundle) {
    return <ErrorState title="Tool not found" description="This tool is not registered in the platform." />;
  }
  if (status === 'loading' || !manifest || !engine) {
    return (
      <div className="flex min-h-[24vh] w-full items-center justify-center">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading {slug}…
        </span>
      </div>
    );
  }

  const Preview = (manifest.stages as ToolStages<unknown, unknown> | undefined)?.preview;
  const favBtn = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      aria-pressed={favorited}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      onClick={onToggleFavorite}
    >
      <Star
        className={cn('h-4 w-4', favorited && 'fill-current text-foreground')}
        aria-hidden
      />
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{manifest.title}</p>
        {favBtn}
      </div>

      {status === 'error' && error ? (
        <ErrorState error={error} retry={handleRetry} />
      ) : null}

      {(status === 'input' || status === 'processing') && manifest ? (
        <ToolInputForm
          manifest={manifest}
          onRun={handleRun}
          loading={status === 'processing'}
          progress={progress}
        />
      ) : null}

      {status === 'preview' && output ? (
        <div className="space-y-4">
          {Preview ? (
            <Preview output={output} onDownload={handleDownload} onModify={handleReset} />
          ) : (
            <Card>
              <CardContent>
                <EmptyState
                  title="Result ready"
                  description="Your output is ready to download."
                />
              </CardContent>
            </Card>
          )}
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleDownload} size="lg" className="h-11 flex-1 sm:flex-none">
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 flex-1 sm:flex-none"
                onClick={async () => {
                  try {
                    const text = typeof output === 'object' && output !== null
                      ? (output as Record<string, unknown>).result as string
                        || (output as Record<string, unknown>).output as string
                        || JSON.stringify(output, null, 2)
                      : String(output);
                    await navigator.clipboard.writeText(text);
                    notificationService.success('Copied to clipboard');
                    trackStandard('result_copied', { slug }, { tool: slug, category });
                  } catch {
                    notificationService.error('Could not copy to clipboard');
                  }
                }}
              >
                <Copy className="mr-2 h-4 w-4" aria-hidden />
                Copy Result
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    try {
                      await navigator.share({ title: manifest.title, url: window.location.href });
                      trackStandard('result_shared', { slug, method: 'native' }, { tool: slug, category });
                    } catch { /* user cancelled */ }
                  } else {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      notificationService.success('Link copied to clipboard');
                      trackStandard('result_shared', { slug, method: 'link' }, { tool: slug, category });
                    } catch { /* ignore */ }
                  }
                }}
                className="gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Modify Input
              </Button>
            </div>
          </div>
          {/* Feedback widget — appears after successful execution */}
          <div className="flex items-center justify-between gap-3">
            <FeedbackWidget toolSlug={slug} toolCategory={category} />
            {executionMs !== null ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                ⚡ {executionMs < 1 ? '<1ms' : `${executionMs}ms`}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Tool Input Form (manifest-driven) ───────────────────────

interface ToolInputFormProps {
  manifest: ToolManifest;
  onRun: (input: unknown) => void | Promise<void>;
  loading?: boolean;
  progress?: number;
}

type FieldKind = 'file' | 'text' | 'textarea' | 'number' | 'slider' | 'select' | 'boolean' | 'unknown';

interface FieldSpec {
  name: string;
  kind: FieldKind;
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  label: string;
  hint?: string;
}

function ToolInputForm({ manifest, onRun, loading, progress = 0 }: ToolInputFormProps) {
  const specs = useMemo(() => buildFieldSpecs(manifest), [manifest]);
  const defaults = useMemo(() => buildDefaultValues(specs), [specs]);

  const inputSchema = manifest.inputSchema as z.ZodType<
    Record<string, unknown>,
    Record<string, unknown>
  >;

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(inputSchema),
    defaultValues: defaults,
    mode: 'onSubmit',
  });

  const onSubmit = form.handleSubmit((values) => {
    return onRun(values);
  });

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void onSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSubmit]);

  // Clear all fields
  const handleClear = useCallback(() => {
    form.reset(buildDefaultValues(specs));
  }, [form, specs]);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {specs.length === 0 ? (
        <EmptyState
          title="Ready to run"
          description="This tool does not require any input. Click Run to continue."
          icon={<FileBox className="h-5 w-5" aria-hidden />}
        />
      ) : null}

      {specs.map((spec) => (
        <FieldRenderer key={spec.name} spec={spec} form={form} disabled={!!loading} />
      ))}

      {loading ? (
        <div className="space-y-2">
          <Progress value={progress} aria-label="Processing progress" />
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {progress > 0 ? `Processing… ${Math.round(progress)}%` : 'Processing…'}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} size="lg" className="flex-1 h-12 text-base font-medium">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : null}
            {loading ? 'Processing…' : 'Run Tool'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 px-4"
            onClick={handleClear}
            disabled={loading}
            aria-label="Clear all fields"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          {manifest.execution === 'browser' ? (
            <span>
              <ShieldCheck className="mr-1 inline h-3 w-3 text-accent" aria-hidden />
              Runs locally
            </span>
          ) : null}
          <span className="text-border">·</span>
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">Ctrl</kbd>
            +
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">Enter</kbd>
            to run
          </span>
        </div>
      </div>
    </form>
  );
}

// ─── Field renderer ──────────────────────────────────────────

function FieldRenderer({
  spec,
  form,
  disabled,
}: {
  spec: FieldSpec;
  form: ReturnType<typeof useForm<Record<string, unknown>>>;
  disabled: boolean;
}) {
  const error = form.formState.errors[spec.name];
  const errorMessage = error && typeof error.message === 'string' ? error.message : undefined;

  switch (spec.kind) {
    case 'file':
      return (
        <div className="space-y-2">
          <Label htmlFor={spec.name}>
            {spec.label}
            {spec.required ? <span className="ml-1 text-destructive">*</span> : null}
          </Label>
          <Controller
            control={form.control}
            name={spec.name}
            render={({ field }) => (
              <FileDropzone
                accept={spec.accept}
                maxSize={spec.maxSize}
                multiple={spec.multiple}
                disabled={disabled}
                onFiles={(files) => field.onChange(spec.multiple ? files : files[0])}
                label={field.value ? 'Replace file' : 'Drop a file here, or click to browse'}
                hint={
                  field.value && field.value instanceof File
                    ? `Selected: ${field.value.name}`
                    : spec.hint ?? 'Files are processed locally in your browser.'
                }
              />
            )}
          />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={spec.name}>
            {spec.label}
            {spec.required ? <span className="ml-1 text-destructive">*</span> : null}
          </Label>
          <Textarea
            id={spec.name}
            disabled={disabled}
            placeholder={spec.hint ?? `Enter ${spec.label.toLowerCase()}`}
            aria-invalid={!!errorMessage}
            {...form.register(spec.name)}
          />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </div>
      );

    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={spec.name}>
            {spec.label}
            {spec.required ? <span className="ml-1 text-destructive">*</span> : null}
          </Label>
          <Input
            id={spec.name}
            disabled={disabled}
            placeholder={spec.hint ?? `Enter ${spec.label.toLowerCase()}`}
            aria-invalid={!!errorMessage}
            {...form.register(spec.name)}
          />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={spec.name}>
            {spec.label}
            {spec.required ? <span className="ml-1 text-destructive">*</span> : null}
          </Label>
          <Input
            id={spec.name}
            type="number"
            inputMode="numeric"
            disabled={disabled}
            min={spec.min}
            max={spec.max}
            step={spec.step}
            placeholder={spec.hint ?? `Enter ${spec.label.toLowerCase()}`}
            aria-invalid={!!errorMessage}
            {...form.register(spec.name, { valueAsNumber: true })}
          />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </div>
      );

    case 'slider': {
      const val = form.watch(spec.name);
      const numVal = typeof val === 'number' ? val : (spec.defaultValue as number) ?? spec.min ?? 0;
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={spec.name}>
              {spec.label}
              {spec.required ? <span className="ml-1 text-destructive">*</span> : null}
            </Label>
            <span className="text-xs font-mono text-muted-foreground">{numVal}</span>
          </div>
          <Controller
            control={form.control}
            name={spec.name}
            render={({ field }) => (
              <Slider
                id={spec.name}
                disabled={disabled}
                min={spec.min}
                max={spec.max}
                step={spec.step}
                value={[typeof field.value === 'number' ? field.value : numVal]}
                onValueChange={(v) => field.onChange(v[0])}
                aria-label={spec.label}
              />
            )}
          />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </div>
      );
    }

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={spec.name}>
            {spec.label}
            {spec.required ? <span className="ml-1 text-destructive">*</span> : null}
          </Label>
          <Controller
            control={form.control}
            name={spec.name}
            render={({ field }) => (
              <Select
                value={typeof field.value === 'string' ? field.value : ''}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger id={spec.name} className="w-full">
                  <SelectValue placeholder={`Select ${spec.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {(spec.options ?? []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
          <div>
            <Label htmlFor={spec.name}>{spec.label}</Label>
            {spec.hint ? <p className="text-xs text-muted-foreground">{spec.hint}</p> : null}
          </div>
          <Controller
            control={form.control}
            name={spec.name}
            render={({ field }) => (
              <Switch
                id={spec.name}
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                aria-label={spec.label}
              />
            )}
          />
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={spec.name}>{spec.label}</Label>
          <Input
            id={spec.name}
            disabled={disabled}
            placeholder="Unsupported field type"
            {...form.register(spec.name)}
          />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </div>
      );
  }
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

// ─── Zod introspection ───────────────────────────────────────
// Zod v4 exposes the schema discriminator via `schema._zod.def.type` (or the
// `.def` / `._def` aliases). We unwrap wrappers (optional/default/nullable/…)
// and read enough of the def to render an appropriate control.

const WRAPPER_TYPES = new Set([
  'optional',
  'default',
  'nullable',
  'prefault',
  'nonoptional',
  'exactoptional',
  'readonly',
  'catch',
  'branded',
]);

interface ZodLike {
  _zod?: { def?: Record<string, unknown> };
  def?: Record<string, unknown>;
  _def?: Record<string, unknown>;
  type?: string;
  safeParse?: (v: unknown) => { success: boolean };
  shape?: Record<string, unknown>;
}

function defOf(schema: unknown): Record<string, unknown> {
  const s = schema as ZodLike;
  return (s?._zod?.def ?? s?.def ?? s?._def ?? {}) as Record<string, unknown>;
}

function typeOf(schema: unknown): string | undefined {
  const s = schema as ZodLike;
  const t = (s?._zod?.def?.type ?? s?.def?.type ?? s?._def?.type) as string | undefined;
  if (typeof t === 'string') return t;
  return typeof s?.type === 'string' ? s.type : undefined;
}

function unwrap(schema: unknown): unknown {
  let current = schema;
  let guard = 0;
  while (guard++ < 12) {
    const t = typeOf(current);
    if (!t) break;
    if (WRAPPER_TYPES.has(t)) {
      const inner = defOf(current)['innerType'];
      if (!inner) break;
      current = inner;
      continue;
    }
    if (t === 'pipe') {
      const def = defOf(current);
      const inner = def['out'] ?? def['in'];
      if (!inner) break;
      current = inner;
      continue;
    }
    break;
  }
  return current;
}

function acceptsFile(schema: unknown): boolean {
  const t = typeOf(schema);
  if (t === 'file') return true;
  if (t === 'custom' || t === 'any' || t === 'unknown') {
    try {
      const s = schema as ZodLike;
      const probe = s.safeParse?.(new File([], 'probe'));
      return probe?.success === true;
    } catch {
      return false;
    }
  }
  return false;
}

function enumOptions(schema: unknown): { label: string; value: string }[] {
  const def = defOf(schema);
  const entries = def['entries'];
  if (entries && typeof entries === 'object') {
    return Object.values(entries as Record<string, unknown>).map((v) => ({
      label: String(v),
      value: String(v),
    }));
  }
  const options = def['options'];
  if (Array.isArray(options)) {
    return options.map((v: unknown) => ({ label: String(v), value: String(v) }));
  }
  const values = def['values'];
  if (Array.isArray(values)) {
    return values.map((v: unknown) => ({ label: String(v), value: String(v) }));
  }
  return [];
}

function numberBounds(schema: unknown): { min?: number; max?: number } {
  const def = defOf(schema);
  const checks = def['checks'];
  let min: number | undefined;
  let max: number | undefined;
  if (Array.isArray(checks)) {
    for (const c of checks) {
      const check = (c as Record<string, unknown>)?.['check'];
      const value = (c as Record<string, unknown>)?.['value'];
      const inclusive = (c as Record<string, unknown>)?.['inclusive'];
      if (typeof value !== 'number') continue;
      if (
        check === 'min' ||
        check === 'greater_than' ||
        check === 'greater_than_or_equal_to'
      ) {
        min = inclusive === false ? value + 1 : value;
      }
      if (
        check === 'max' ||
        check === 'less_than' ||
        check === 'less_than_or_equal_to'
      ) {
        max = inclusive === false ? value - 1 : value;
      }
    }
  }
  // Fallback: v4 stores a `bag` on the internals with computed min/max.
  if (min === undefined || max === undefined) {
    const bag = (schema as { _zod?: { bag?: Record<string, unknown> } })?._zod?.bag;
    if (bag) {
      if (min === undefined && typeof bag['minimum'] === 'number') min = bag['minimum'];
      if (max === undefined && typeof bag['maximum'] === 'number') max = bag['maximum'];
    }
  }
  return { min, max };
}

function extractDefault(schema: unknown): unknown {
  const t = typeOf(schema);
  if (t === 'default' || t === 'prefault') {
    const dv = defOf(schema)['defaultValue'];
    if (typeof dv === 'function') {
      try {
        return (dv as () => unknown)();
      } catch {
        return undefined;
      }
    }
    return dv;
  }
  return undefined;
}

const LONG_TEXT_FIELDS = new Set([
  'text',
  'content',
  'body',
  'input',
  'data',
  'json',
  'value',
  'payload',
  'source',
  'string',
  'a',
  'b',
  'left',
  'right',
]);

function humanize(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function findRule(manifest: ToolManifest, field: string, type: ValidationRule['type']): ValidationRule | undefined {
  return manifest.validationRules.find((r) => r.field === field && r.type === type);
}

function buildFieldSpecs(manifest: ToolManifest): FieldSpec[] {
  const root = manifest.inputSchema as unknown;
  const shape = (root as ZodLike)?.shape ?? (unwrap(root) as ZodLike)?.shape;
  if (!shape || typeof shape !== 'object') return [];

  return Object.entries(shape as Record<string, unknown>).map(([name, fieldSchema]) => {
    const rawDefault = extractDefault(fieldSchema);
    const unwrapped = unwrap(fieldSchema);
    const t = typeOf(unwrapped);
    const required = typeOf(fieldSchema) !== 'optional' && typeOf(fieldSchema) !== 'default';
    const label = humanize(name);

    // File detection (z.instanceof(File) → "custom", or z.file() → "file").
    if (acceptsFile(unwrapped)) {
      const formatRule = findRule(manifest, name, 'format');
      const maxSizeRule = findRule(manifest, name, 'maxSize');
      const element = defOf(unwrapped)['element'];
      const multiple = typeOf(unwrapped) === 'array' || (element !== undefined && acceptsFile(element));
      return {
        name,
        kind: 'file',
        required,
        label,
        accept: typeof formatRule?.value === 'string' ? formatRule.value : undefined,
        maxSize: typeof maxSizeRule?.value === 'number' ? maxSizeRule.value : undefined,
        multiple,
        hint: multiple ? 'One or more files.' : 'A single file.',
      };
    }

    if (t === 'enum' || t === 'literal') {
      const options = enumOptions(unwrapped);
      const dv = rawDefault ?? options[0]?.value;
      return {
        name,
        kind: 'select',
        required,
        label,
        options,
        defaultValue: dv,
      };
    }

    if (t === 'boolean') {
      return {
        name,
        kind: 'boolean',
        required,
        label,
        defaultValue: typeof rawDefault === 'boolean' ? rawDefault : false,
      };
    }

    if (t === 'number' || t === 'int' || t === 'bigint') {
      const { min, max } = numberBounds(unwrapped);
      const hasRange = typeof min === 'number' && typeof max === 'number' && max - min <= 100;
      const dv =
        typeof rawDefault === 'number'
          ? rawDefault
          : hasRange
            ? Math.round((min! + max!) / 2)
            : (min ?? 0);
      return {
        name,
        kind: hasRange ? 'slider' : 'number',
        required,
        label,
        min,
        max,
        step: t === 'int' || t === 'bigint' ? 1 : undefined,
        defaultValue: dv,
      };
    }

    if (t === 'string') {
      const isLong = LONG_TEXT_FIELDS.has(name.toLowerCase());
      return {
        name,
        kind: isLong ? 'textarea' : 'text',
        required,
        label,
        defaultValue: typeof rawDefault === 'string' ? rawDefault : '',
      };
    }

    // Union of literals → select.
    if (t === 'union') {
      const options = defOf(unwrapped)['options'];
      if (Array.isArray(options)) {
        const opts = options
          .map((o: unknown) => {
            const ot = typeOf(o);
            if (ot === 'literal') {
              const v = defOf(o)['value'];
              return { label: String(v), value: String(v) };
            }
            return null;
          })
          .filter((x): x is { label: string; value: string } => x !== null);
        if (opts.length > 0) {
          return {
            name,
            kind: 'select',
            required,
            label,
            options: opts,
            defaultValue: rawDefault ?? opts[0]?.value,
          };
        }
      }
    }

    return {
      name,
      kind: 'unknown',
      required,
      label,
      defaultValue: rawDefault,
    };
  });
}

function buildDefaultValues(specs: FieldSpec[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const spec of specs) {
    if (spec.kind === 'file') continue; // files start empty
    out[spec.name] = spec.defaultValue ?? '';
  }
  return out;
}
