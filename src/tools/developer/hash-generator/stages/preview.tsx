// src/tools/developer/hash-generator/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output, onDownload, onModify }) => {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-2">
          <dt className="text-muted-foreground">Algorithm</dt>
          <dd className="mt-1 font-mono text-foreground">{output.algorithm}</dd>
        </div>
        <div className="rounded-md border border-border bg-card p-2">
          <dt className="text-muted-foreground">Input length</dt>
          <dd className="mt-1 font-mono text-foreground">{output.inputLength} chars</dd>
        </div>
      </dl>
      <div>
        <div className="mb-1 text-xs text-muted-foreground">Hash (hex)</div>
        <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <code className="font-mono break-all whitespace-pre-wrap">{output.hash}</code>
        </pre>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Download
        </button>
        <button
          type="button"
          onClick={onModify}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Modify
        </button>
      </div>
    </div>
  );
};
