// src/tools/developer/hash-generator/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { generateHash, type HashAlgorithm } from '../../_shared/lib/dev-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text, algorithm } = ctx.input;
  const hash = await generateHash(text, algorithm.toLowerCase() as HashAlgorithm);
  return {
    hash,
    algorithm,
    inputLength: text.length,
  };
};
