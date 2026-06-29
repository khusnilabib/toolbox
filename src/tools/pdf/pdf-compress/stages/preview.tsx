// src/tools/pdf/pdf-compress/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const previewStage: PreviewStage<ToolOutput> = ({ output }) => {
  const ratio = output.compressionRatio;
  const ratioLabel = ratio >= 0 ? `-${ratio.toFixed(1)}%` : `+${(-ratio).toFixed(1)}%`;
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        <iframe
          src={output.previewUrl}
          title="Compressed PDF preview"
          className="h-[480px] w-full"
        />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <Meta label="Original" value={formatFileSize(output.originalSize)} />
        <Meta label="Compressed" value={formatFileSize(output.compressedSize)} />
        <Meta label="Change" value={ratioLabel} />
      </dl>
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
