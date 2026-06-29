// src/tools/developer/uuid-generator/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output, onDownload, onModify }) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Generated {output.count} UUID{output.count === 1 ? '' : 's'}.
      </p>
      <ul className="max-h-80 space-y-1 overflow-auto rounded-lg border border-border bg-muted/30 p-3 text-xs">
        {output.uuids.map((uuid) => (
          <li key={uuid} className="font-mono break-all">
            {uuid}
          </li>
        ))}
      </ul>
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
