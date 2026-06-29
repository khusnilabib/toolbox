// src/tools/pdf/pdf-protect/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output }) => {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        <iframe
          src={output.previewUrl}
          title="Protected PDF preview"
          className="h-[480px] w-full"
        />
      </div>
    </div>
  );
};
