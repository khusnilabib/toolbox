// src/tools/text/case-converter/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { convertCase, type CaseKind } from '../../_shared/lib/text-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text, mode } = ctx.input;
  const result = convertCase(text, mode as CaseKind);
  return {
    result,
    originalLength: text.length,
    resultLength: result.length,
  };
};
