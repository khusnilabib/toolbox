// src/tools/image/image-compress/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';
import { formatFileSize } from '../../_shared/lib/image-utils';

export const previewStage: PreviewStage<ToolOutput> = ({ output }) => {
  const url = URL.createObjectURL(output.blob);
  const saved = output.originalSize === 0 ? 0 : (1 - output.outputSize / output.originalSize) * 100;
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Compressed image preview"
          className="mx-auto max-h-96 w-auto object-contain"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Meta label="Original" value={formatFileSize(output.originalSize)} />
        <Meta label="Compressed" value={formatFileSize(output.outputSize)} />
        <Meta label="Saved" value={saved >= 0 ? `${saved.toFixed(1)}%` : `+${(-saved).toFixed(1)}%`} />
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
