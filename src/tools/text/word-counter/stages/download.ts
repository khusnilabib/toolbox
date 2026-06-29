// src/tools/text/word-counter/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => {
  const lines = [
    `Characters: ${output.characters}`,
    `Characters (no spaces): ${output.charactersNoSpaces}`,
    `Words: ${output.words}`,
    `Sentences: ${output.sentences}`,
    `Paragraphs: ${output.paragraphs}`,
    `Lines: ${output.lines}`,
    `Reading time (minutes): ${output.readingTimeMinutes}`,
  ];
  return {
    kind: 'text',
    text: lines.join('\n'),
    filename: 'word-count.txt',
    mimeType: 'text/plain',
  };
};
