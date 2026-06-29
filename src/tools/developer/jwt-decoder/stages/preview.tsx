// src/tools/developer/jwt-decoder/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output, onDownload, onModify }) => {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Header</h3>
        <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <code className="font-mono">{output.header}</code>
        </pre>
      </section>
      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Payload</h3>
        <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <code className="font-mono">{output.payload}</code>
        </pre>
      </section>
      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Signature</div>
          <div className="mt-1 break-all font-mono text-xs">{output.signature}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Expires at</div>
          <div className="mt-1 font-mono text-xs">
            {output.expiresAt ?? 'No exp claim'}
          </div>
        </div>
      </section>
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
