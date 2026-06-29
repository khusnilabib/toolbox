// src/tools/developer/url-encoder/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { urlDecode, urlEncode } from '../../_shared/lib/dev-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text, mode } = ctx.input;
  const result = mode === 'encode' ? urlEncode(text) : urlDecode(text);
  return { result };
};
