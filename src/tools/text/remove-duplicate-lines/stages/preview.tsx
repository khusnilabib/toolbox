// src/tools/text/remove-duplicate-lines/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output, onDownload, onModify }) => {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Meta label="Original lines" value={`${output.originalLines}`} />
        <Meta label="Unique lines" value={`${output.uniqueLines}`} />
        <Meta label="Removed" value={`${output.removedCount}`} />
      </dl>
      <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
        <code className="font-mono whitespace-pre-wrap">{output.result}</code>
      </pre>
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-foreground">{value}</dd>
    </div>
  );
}
