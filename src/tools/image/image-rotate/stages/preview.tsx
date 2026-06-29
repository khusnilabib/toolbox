// src/tools/image/image-rotate/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';
import { formatFileSize } from '../../_shared/lib/image-utils';

export const previewStage: PreviewStage<ToolOutput> = ({ output }) => {
  const url = URL.createObjectURL(output.blob);
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Rotated image preview"
          className="mx-auto max-h-96 w-auto object-contain"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Meta label="Dimensions" value={`${output.width} × ${output.height}`} />
        <Meta label="Size" value={formatFileSize(output.outputSize)} />
        <Meta label="Format" value={output.mimeType} />
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
