// src/tools/text/text-diff/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => {
  const lines = output.diffLines.map((line) => {
    const prefix =
      line.kind === 'added' ? '+ ' : line.kind === 'removed' ? '- ' : line.kind === 'changed' ? '~ ' : '  ';
    const content =
      line.kind === 'added'
        ? (line.right ?? '')
        : line.kind === 'removed'
          ? (line.left ?? '')
          : line.kind === 'changed'
            ? `${line.left ?? ''} -> ${line.right ?? ''}`
            : (line.left ?? '');
    return `${prefix}${content}`;
  });
  const summary = [
    `--- Summary ---`,
    `Added: ${output.addedCount}`,
    `Removed: ${output.removedCount}`,
    `Unchanged: ${output.unchangedCount}`,
    ``,
    `--- Diff ---`,
    ...lines,
  ];
  return {
    kind: 'text',
    text: summary.join('\n'),
    filename: 'diff.txt',
    mimeType: 'text/plain',
  };
};
