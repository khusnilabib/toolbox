// src/tools/pdf/pdf-unlock/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import { unlockPdf } from '../../_shared/lib/pdf-utils';
import type { ToolInput, ToolOutput } from '../manifest';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async ({ input, signal, onProgress }) => {
  if (signal?.aborted) throw new Error('Cancelled by user');
  onProgress?.(10, 'Loading decryption engine');
  const blob = await unlockPdf(input.file, input.password);
  if (signal?.aborted) throw new Error('Cancelled by user');
  onProgress?.(100, 'PDF unlocked');
  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
  };
};
