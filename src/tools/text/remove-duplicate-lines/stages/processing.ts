// src/tools/text/remove-duplicate-lines/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { removeDuplicateLines } from '../../_shared/lib/text-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text, caseSensitive } = ctx.input;
  const originalLines = text === '' ? 0 : text.split(/\r?\n/).length;
  const result = removeDuplicateLines(text, caseSensitive);
  const uniqueLines = result === '' ? 0 : result.split(/\r?\n/).length;
  return {
    result,
    originalLines,
    uniqueLines,
    removedCount: Math.max(0, originalLines - uniqueLines),
  };
};
