// @packages/tool-engine/src/types.ts
// Tool Engine stage contracts (LOCK-03 Tool Engine Philosophy).
// Implements: 02_SAD §6.1, 12_ToolManifestSpecification §5.1.

import type { ComponentType } from 'react';
import type { ZodSchema } from 'zod';
import type { ToolError } from '@packages/types';

// ─── Stage Context ───────────────────────────────────────────
export interface StageContext<TInput = unknown> {
  input: TInput;
  signal?: AbortSignal;
  onProgress?: (percent: number, message?: string) => void;
  /** Tool Engine hook invocations (middleware-aware). */
  emit?: (eventName: string, payload?: Record<string, unknown>) => void;
}

// ─── Stage Contracts ─────────────────────────────────────────
export type InputStage<TInput = unknown> = (
  ctx: StageContext<TInput>,
) => Promise<TInput> | TInput;

export type ValidationStage<TInput = unknown> = (
  input: unknown,
) => Promise<{ success: true; data: TInput } | { success: false; errors: ToolError[] }>;

export type ProcessingStage<TInput = unknown, TOutput = unknown> = (
  ctx: StageContext<TInput>,
) => Promise<TOutput>;

export interface PreviewStageProps<TOutput = unknown> {
  output: TOutput;
  onDownload?: () => void;
  onModify?: () => void;
}

export type PreviewStage<TOutput = unknown> = ComponentType<PreviewStageProps<TOutput>>;

export interface DownloadResult {
  kind: 'file' | 'text';
  blob?: Blob;
  text?: string;
  filename: string;
  mimeType: string;
}

export type DownloadStage<TOutput = unknown> = (
  output: TOutput,
  ctx?: StageContext<TOutput>,
) => Promise<DownloadResult> | DownloadResult;

export interface HistoryEntry<TOutput = unknown> {
  id: string;
  slug: string;
  timestamp: number;
  input: unknown;
  output?: TOutput;
}

export type HistoryStage<TOutput = unknown> = (
  entry: HistoryEntry<TOutput>,
) => Promise<void> | void;

export interface ShareResult {
  url: string;
  qrCode?: string;
}

export type ShareStage<TOutput = unknown> = (
  output: TOutput,
  ctx?: StageContext<TOutput>,
) => Promise<ShareResult> | ShareResult;

// ─── Tool Stages Aggregate ───────────────────────────────────
export interface ToolStages<TInput = unknown, TOutput = unknown> {
  input: InputStage<TInput>;
  validation: ValidationStage<TInput>;
  processing: ProcessingStage<TInput, TOutput>;
  preview: PreviewStage<TOutput>;
  download: DownloadStage<TOutput>;
  history?: HistoryStage<TOutput>;
  share?: ShareStage<TOutput>;
}

// ─── Tool Engine Phase & State ───────────────────────────────
export type ToolEnginePhase =
  | 'idle'
  | 'input'
  | 'validation'
  | 'processing'
  | 'preview'
  | 'download'
  | 'complete'
  | 'error'
  | 'cancelled';

export interface ToolEngineState<TOutput = unknown> {
  phase: ToolEnginePhase;
  output: TOutput | null;
  error: ToolError | null;
  progress: number;
  history: HistoryEntry<TOutput>[];
}

// ─── Stage Hooks (side-effects around stages) ────────────────
export interface StageHook<TInput = unknown, TOutput = unknown> {
  beforeStage?: (phase: ToolEnginePhase, ctx: StageContext<TInput>) => Promise<void> | void;
  afterStage?: (
    phase: ToolEnginePhase,
    ctx: StageContext<TInput>,
    result: TOutput | TInput | null,
  ) => Promise<void> | void;
  onError?: (phase: ToolEnginePhase, error: ToolError) => Promise<void> | void;
}

// ─── Middleware (pipeline interceptor) ───────────────────────
export interface Middleware<TInput = unknown, TOutput = unknown> {
  (ctx: StageContext<TInput>, next: () => Promise<TOutput>): Promise<TOutput>;
}

// ─── Tool Engine Options ─────────────────────────────────────
export interface ToolEngineOptions<TInput = unknown, TOutput = unknown> {
  retries?: number;
  retryDelayMs?: number;
  hooks?: StageHook<TInput, TOutput>[];
  middleware?: Middleware<TInput, TOutput>[];
  /** Auto-emit standard analytics events (PC-07). */
  autoAnalytics?: boolean;
  /** Optional input/output schema for runtime validation. */
  inputSchema?: ZodSchema<TInput>;
  outputSchema?: ZodSchema<TOutput>;
}
