// src/tools/developer/base64-encoder/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { decodeBase64, encodeBase64 } from '../../_shared/lib/dev-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text, mode } = ctx.input;
  const result = mode === 'encode' ? encodeBase64(text) : decodeBase64(text);
  return {
    result,
    originalLength: text.length,
    resultLength: result.length,
  };
};
