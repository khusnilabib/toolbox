// src/tools/text/word-counter/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { countText } from '../../_shared/lib/text-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text } = ctx.input;
  return countText(text);
};
