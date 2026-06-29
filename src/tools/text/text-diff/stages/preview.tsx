// src/tools/text/text-diff/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

const KIND_STYLES: Record<string, string> = {
  equal: 'bg-muted/20 text-foreground',
  added: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200',
  removed: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200',
  changed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200',
};

const KIND_LABEL: Record<string, string> = {
  equal: ' ',
  added: '+',
  removed: '-',
  changed: '~',
};

export const previewStage: PreviewStage<ToolOutput> = ({ output, onDownload, onModify }) => {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Meta label="Added" value={`${output.addedCount}`} />
        <Meta label="Removed" value={`${output.removedCount}`} />
        <Meta label="Unchanged" value={`${output.unchangedCount}`} />
      </dl>
      <div className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/30 text-xs">
        {output.diffLines.length === 0 ? (
          <div className="p-4 text-muted-foreground">No lines to compare.</div>
        ) : (
          output.diffLines.map((line) => (
            <div key={line.lineNumber} className={`flex gap-2 px-3 py-0.5 font-mono ${KIND_STYLES[line.kind]}`}>
              <span className="w-8 shrink-0 text-right text-muted-foreground">{line.lineNumber}</span>
              <span className="w-4 shrink-0">{KIND_LABEL[line.kind]}</span>
              <span className="whitespace-pre-wrap break-all">
                {line.kind === 'added'
                  ? line.right ?? ''
                  : line.kind === 'removed'
                    ? line.left ?? ''
                    : line.kind === 'changed'
                      ? `${line.left ?? ''} → ${line.right ?? ''}`
                      : (line.left ?? '')}
              </span>
            </div>
          ))
        )}
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-foreground">{value}</dd>
    </div>
  );
}
