// src/tools/developer/json-formatter/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output, onDownload, onModify }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            output.valid
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {output.valid ? 'Valid JSON' : 'Invalid JSON'}
        </span>
        <span className="text-xs text-muted-foreground">{output.sizeBytes} bytes</span>
      </div>
      {output.valid ? (
        <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
          <code className="font-mono">{output.formatted}</code>
        </pre>
      ) : (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          {output.error ?? 'Unknown error'}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={!output.valid}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
