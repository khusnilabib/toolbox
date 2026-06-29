// src/tools/developer/uuid-generator/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { generateUuids } from '../../_shared/lib/dev-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { count } = ctx.input;
  const uuids = generateUuids(count);
  return {
    uuids,
    count: uuids.length,
  };
};
