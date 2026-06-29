// src/tools/pdf/pdf-split/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import {
  loadPdf,
  savePdfBlob,
  getPageCount,
  parsePageRange,
  extractPages,
} from '../../_shared/lib/pdf-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, pageRange } = ctx.input;
  // Lazy-load pdf-lib via shared utils (LOCK-06).
  const doc = await loadPdf(file);
  const pageCount = await getPageCount(doc);

  const ranges = parsePageRange(pageRange);
  const indices: number[] = [];
  for (const range of ranges) {
    const start = range[0]!;
    const end = range[1]!;
    for (let page = start; page <= end; page++) {
      if (page > pageCount) {
        throw new Error(
          `Page ${page} is out of range. The document has ${pageCount} page${pageCount === 1 ? '' : 's'}.`,
        );
      }
      indices.push(page - 1); // 1-based → 0-based
    }
  }

  const extracted = await extractPages(doc, indices);
  const blob = await savePdfBlob(extracted);
  const previewUrl = URL.createObjectURL(blob);
  return {
    blob,
    extractedCount: indices.length,
    pageRange,
    previewUrl,
  };
};
