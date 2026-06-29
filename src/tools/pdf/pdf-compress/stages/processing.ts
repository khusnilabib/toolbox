// src/tools/pdf/pdf-compress/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { loadPdf, savePdfBlob } from '../../_shared/lib/pdf-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, quality } = ctx.input;
  void quality; // Reserved: pdf-lib re-save is lossless; quality is accepted for API symmetry.
  const originalSize = file.size;

  // Lazy-load pdf-lib via shared utils (LOCK-06) and re-save the document.
  // pdf-lib's save() packs objects into compressed object streams by default,
  // which can shrink files — especially those with redundant or uncompressed
  // objects. Already-compressed PDFs may not shrink further.
  const doc = await loadPdf(file);
  const blob = await savePdfBlob(doc);
  const compressedSize = blob.size;
  const compressionRatio =
    originalSize === 0 ? 0 : (1 - compressedSize / originalSize) * 100;
  const previewUrl = URL.createObjectURL(blob);
  return {
    blob,
    originalSize,
    compressedSize,
    compressionRatio,
    previewUrl,
  };
};
