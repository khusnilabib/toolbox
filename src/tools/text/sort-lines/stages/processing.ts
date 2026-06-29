// src/tools/text/sort-lines/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { sortLines } from '../../_shared/lib/text-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text, mode } = ctx.input;

  let result: string;
  if (mode === 'random') {
    const lines = text.split(/\r?\n/);
    // Fisher–Yates shuffle.
    for (let i = lines.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j]!, lines[i]!];
    }
    result = lines.join('\n');
  } else if (mode === 'asc') {
    result = sortLines(text, 'asc', 'lexicographic');
  } else if (mode === 'desc') {
    result = sortLines(text, 'desc', 'lexicographic');
  } else if (mode === 'length-asc') {
    result = sortLines(text, 'asc', 'length');
  } else {
    // length-desc
    result = sortLines(text, 'desc', 'length');
  }

  const lineCount = result === '' ? 0 : result.split(/\r?\n/).length;
  return { result, lineCount };
};
