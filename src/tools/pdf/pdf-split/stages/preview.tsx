// src/tools/pdf/pdf-split/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output }) => {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        <iframe
          src={output.previewUrl}
          title="Split PDF preview"
          className="h-[480px] w-full"
        />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-2">
        <Meta label="Pages extracted" value={String(output.extractedCount)} />
        <Meta label="Page range" value={output.pageRange} />
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
