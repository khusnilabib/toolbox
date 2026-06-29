// src/tools/pdf/pdf-merge/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { mergePdfs, savePdfBlob, getPageCount } from '../../_shared/lib/pdf-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { files } = ctx.input;
  // Lazy-load pdf-lib via shared utils (LOCK-06). Each file is read into a
  // Uint8Array and merged into a single new PDFDocument.
  const fileBytes = await Promise.all(
    files.map(async (f) => new Uint8Array(await f.arrayBuffer())),
  );
  const doc = await mergePdfs(fileBytes);
  const blob = await savePdfBlob(doc);
  const pageCount = await getPageCount(doc);
  const previewUrl = URL.createObjectURL(blob);
  return {
    blob,
    pageCount,
    sizeBytes: blob.size,
    previewUrl,
    fileNames: files.map((f) => f.name),
  };
};
