// src/tools/text/word-counter/stages/preview.tsx

'use client';

import type { PreviewStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const previewStage: PreviewStage<ToolOutput> = ({ output, onDownload, onModify }) => {
  const stats: Array<[string, string]> = [
    ['Characters', `${output.characters}`],
    ['Characters (no spaces)', `${output.charactersNoSpaces}`],
    ['Words', `${output.words}`],
    ['Sentences', `${output.sentences}`],
    ['Paragraphs', `${output.paragraphs}`],
    ['Lines', `${output.lines}`],
    ['Reading time (min)', `${output.readingTimeMinutes}`],
  ];
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-card p-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-mono text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
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
