// src/tools/text/text-diff/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { diffText } from '../../_shared/lib/text-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text1, text2 } = ctx.input;
  const diffLines = diffText(text1, text2);
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;
  for (const line of diffLines) {
    if (line.kind === 'added') addedCount += 1;
    else if (line.kind === 'removed') removedCount += 1;
    else if (line.kind === 'equal') unchangedCount += 1;
    else if (line.kind === 'changed') {
      addedCount += 1;
      removedCount += 1;
    }
  }
  return {
    diffLines,
    addedCount,
    removedCount,
    unchangedCount,
  };
};
