// src/tools/developer/json-formatter/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { formatJson } from '../../_shared/lib/dev-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { text, indent } = ctx.input;
  try {
    const formatted = formatJson(text, indent);
    return {
      formatted,
      valid: true,
      sizeBytes: new Blob([formatted]).size,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      formatted: '',
      valid: false,
      error: message,
      sizeBytes: 0,
    };
  }
};
