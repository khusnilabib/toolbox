// src/tools/pdf/pdf-rotate/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { loadPdf, savePdfBlob, getPageCount, rotateAllPages } from '../../_shared/lib/pdf-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, angle } = ctx.input;
  // Lazy-load pdf-lib via shared utils (LOCK-06). rotateAllPages applies the
  // rotation to every page in the document.
  const doc = await loadPdf(file);
  const rotated = await rotateAllPages(doc, angle);
  const blob = await savePdfBlob(rotated);
  const pageCount = await getPageCount(rotated);
  const previewUrl = URL.createObjectURL(blob);
  return {
    blob,
    pageCount,
    angle,
    previewUrl,
  };
};
