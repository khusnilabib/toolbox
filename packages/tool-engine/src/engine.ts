// @ts-nocheck
// @packages/tool-engine/src/engine.ts
// ToolEngine — orchestrates the standardized 7-stage lifecycle (LOCK-03).
// Implements: 02_SAD §6, PC-07 (auto analytics), PC-08 (error experience).

import type { ToolError } from '@packages/types';
import { generateId } from '@packages/utils';
import type {
  DownloadResult,
  HistoryEntry,
  ShareResult,
  StageContext,
  StageHook,
  ToolEngineOptions,
  ToolEnginePhase,
  ToolEngineState,
  ToolStages,
  Middleware,
} from './types';

const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 250;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emitAnalytics(eventName: string, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload ?? {} }));
  } catch {
    /* no-op */
  }
}

export class ToolEngine<TInput, TOutput> {
  private readonly stages: ToolStages<TInput, TOutput>;
  private readonly options: Required<Omit<ToolEngineOptions<TInput, TOutput>, 'inputSchema' | 'outputSchema'>>;
  private readonly inputSchema?: ToolEngineOptions<TInput, TOutput>['inputSchema'];
  private readonly outputSchema?: ToolEngineOptions<TInput, TOutput>['outputSchema'];
  private abortController: AbortController | null = null;
  private state: ToolEngineState<TOutput> = {
    phase: 'idle',
    output: null,
    error: null,
    progress: 0,
    history: [],
  };

  constructor(stages: ToolStages<TInput, TOutput>, options: ToolEngineOptions<TInput, TOutput> = {}) {
    this.stages = stages;
    this.options = {
      retries: options.retries ?? DEFAULT_RETRIES,
      retryDelayMs: options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
      hooks: options.hooks ?? [],
      middleware: options.middleware ?? [],
      autoAnalytics: options.autoAnalytics ?? true,
    };
    this.inputSchema = options.inputSchema;
    this.outputSchema = options.outputSchema;
  }

  getState(): ToolEngineState<TOutput> {
    return { ...this.state };
  }

  private setState(next: Partial<ToolEngineState<TOutput>>): void {
    this.state = { ...this.state, ...next };
  }

  private async runHooks(
    fn: 'beforeStage' | 'afterStage' | 'onError',
    phase: ToolEnginePhase,
    ctx: StageContext<TInput>,
    result?: unknown,
    error?: ToolError,
  ): Promise<void> {
    for (const hook of this.options.hooks) {
      try {
        if (fn === 'beforeStage' && hook.beforeStage) await hook.beforeStage(phase, ctx);
        if (fn === 'afterStage' && hook.afterStage) await hook.afterStage(phase, ctx, result ?? null);
        if (fn === 'onError' && hook.onError && error) await hook.onError(phase, error);
      } catch {
        // Hooks must never break execution.
      }
    }
  }

  private makeContext(input: TInput): StageContext<TInput> {
    this.abortController = new AbortController();
    return {
      input,
      signal: this.abortController.signal,
      onProgress: (percent, message) => {
        this.setState({ progress: Math.max(this.state.progress, percent) });
        if (this.options.autoAnalytics) emitAnalytics('tool:progress', { percent, message });
      },
      emit: (eventName, payload) => {
        if (this.options.autoAnalytics) emitAnalytics(eventName, payload);
      },
    };
  }

  private async withRetries<R>(phase: ToolEnginePhase, ctx: StageContext<TInput>, run: () => Promise<R>): Promise<R> {
    let attempt = 0;
    let lastError: unknown = null;
    while (attempt <= this.options.retries) {
      if (ctx.signal?.aborted) {
        throw new Error('Cancelled by user');
      }
      try {
        await this.runHooks('beforeStage', phase, ctx);
        const result = await run();
        await this.runHooks('afterStage', phase, ctx, result);
        return result;
      } catch (err) {
        lastError = err;
        attempt += 1;
        if (attempt > this.options.retries) break;
        await sleep(this.options.retryDelayMs * attempt);
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  /**
   * Run input → validation → processing. Returns the validated output.
   *
   * The input stage is typically a placeholder that throws (since input is
   * collected by the UI form). When `input` is already provided by the caller,
   * we skip the input stage and pass `input` directly to validation.
   */
  async execute(input: TInput): Promise<TOutput> {
    this.setState({ phase: 'input', error: null, progress: 0 });
    if (this.options.autoAnalytics) emitAnalytics('tool_started', { phase: 'input' });

    // The input stage is a placeholder that throws "Input stage is handled by the UI form component".
    // When input is already provided by the caller (UI form), we skip the input stage entirely
    // and pass the input directly to validation.
    const resolvedInput: TInput = input;

    this.setState({ phase: 'validation' });
    const validation = await this.stages.validation(resolvedInput);
    if (!validation.success) {
      const errors: ToolError[] = validation.errors;
      if (this.options.autoAnalytics) emitAnalytics('validation_failed', { errors });
      const first = errors[0] ?? {
        kind: 'validation' as const,
        cause: 'validation_failed',
        userMessage: { what: 'Validation failed', howToFix: 'Please review the input.' },
      };
      return this.fail('validation', new Error(first.userMessage.what), first);
    }
    const validated = validation.data;

    this.setState({ phase: 'processing' });
    if (this.options.autoAnalytics) emitAnalytics('processing_started', {});
    const procCtx = this.makeContext(validated);
    try {
      const output = await this.withRetries('processing', procCtx, async () => {
        // Apply middleware chain (outermost first).
        let runner = (): Promise<TOutput> => this.stages.processing(procCtx);
        for (const mw of [...this.options.middleware].reverse()) {
          const next = runner;
          runner = () => mw(procCtx, next);
        }
        const result = await runner();
        if (this.outputSchema) {
          const parsed = this.outputSchema.safeParse(result);
          if (!parsed.success) {
            throw new Error('Output validation failed');
          }
          return parsed.data;
        }
        return result;
      });
      this.setState({ phase: 'preview', output, progress: 100 });
      if (this.options.autoAnalytics) emitAnalytics('processing_completed', {});
      return output;
    } catch (err) {
      return this.fail('processing', err);
    }
  }

  /**
   * Package the output for download (DownloadStage).
   */
  async download(output: TOutput): Promise<DownloadResult> {
    this.setState({ phase: 'download' });
    if (this.options.autoAnalytics) emitAnalytics('download_attempted', {});
    const ctx = this.makeContext(output);
    const result = await this.stages.download(output, ctx);
    if (this.options.autoAnalytics) emitAnalytics('download_completed', { filename: result.filename });
    this.setState({ phase: 'complete' });
    return result;
  }

  /**
   * Persist the entry to history (best-effort). Failure is non-fatal.
   */
  async saveHistory(slug: string, input: TInput, output: TOutput): Promise<HistoryEntry<TOutput> | null> {
    if (!this.stages.history) return null;
    const entry: HistoryEntry<TOutput> = {
      id: generateId('hist'),
      slug,
      timestamp: Date.now(),
      input,
      output,
    };
    try {
      await this.stages.history(entry);
      this.setState({ history: [...this.state.history, entry] });
    } catch {
      return null;
    }
    return entry;
  }

  /**
   * Generate a shareable representation (ShareStage).
   */
  async share(output: TOutput): Promise<ShareResult | null> {
    if (!this.stages.share) return null;
    const ctx = this.makeContext(output);
    const result = await this.stages.share(output, ctx);
    if (this.options.autoAnalytics) emitAnalytics('tool_shared', { url: result.url });
    return result;
  }

  /**
   * Cancel any in-flight execution.
   */
  cancel(): void {
    this.abortController?.abort();
    this.setState({ phase: 'cancelled' });
    if (this.options.autoAnalytics) emitAnalytics('tool_cancelled', {});
  }

  private fail(phase: ToolEnginePhase, err: unknown, override?: ToolError): never {
    const toolError: ToolError = override ?? {
      kind: 'processing',
      cause: err instanceof Error ? err.message : String(err),
      userMessage: {
        what: 'Something went wrong while processing your request.',
        why: err instanceof Error ? err.message : undefined,
        howToFix: 'Please try again. If the problem persists, refresh the page.',
      },
      raw: err,
    };
    this.setState({ phase: 'error', error: toolError });
    if (this.options.hooks.length) {
      void this.runHooks('onError', phase, this.makeContext(null as TInput), undefined, toolError);
    }
    throw toolError;
  }
}
