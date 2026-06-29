// src/tools/pdf/pdf-merge/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const previewStage: PreviewStage<ToolOutput> = ({ output }) => {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        <iframe
          src={output.previewUrl}
          title="Merged PDF preview"
          className="h-[480px] w-full"
        />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <Meta label="Pages" value={String(output.pageCount)} />
        <Meta label="Size" value={formatFileSize(output.sizeBytes)} />
        <Meta label="Files merged" value={String(output.fileNames.length)} />
      </dl>
      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Merged files</p>
        <ul className="mt-1 list-disc pl-4 text-xs text-foreground">
          {output.fileNames.map((name, i) => (
            <li key={`${name}-${i}`} className="font-mono">
              {name}
            </li>
          ))}
        </ul>
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
