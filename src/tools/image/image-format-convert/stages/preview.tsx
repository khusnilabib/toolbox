'use client';
import type { PreviewStageProps } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export function previewStage({ output, onDownload, onModify }: PreviewStageProps<ToolOutput>) {
  const url = URL.createObjectURL(output.blob);
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Converted image preview" className="max-h-96 rounded-lg border border-border" />
      </div>
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>{output.mimeType}</span>
        <span>{output.width}x{output.height}</span>
        <span>{(output.outputSize / 1024).toFixed(1)} KB</span>
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={onDownload} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Download</button>
        <button onClick={onModify} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Modify</button>
      </div>
    </div>
  );
}
