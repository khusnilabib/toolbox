// src/tools/pdf/pdf-protect/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import { protectPdf } from '../../_shared/lib/pdf-utils';
import type { ToolInput, ToolOutput } from '../manifest';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async ({ input, signal, onProgress }) => {
  if (signal?.aborted) throw new Error('Cancelled by user');
  onProgress?.(10, 'Loading encryption engine');
  const blob = await protectPdf(input.file, input.password);
  if (signal?.aborted) throw new Error('Cancelled by user');
  onProgress?.(100, 'PDF protected');
  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
  };
};
