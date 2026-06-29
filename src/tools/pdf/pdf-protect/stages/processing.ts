// src/tools/pdf/pdf-protect/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async () => {
  // pdf-lib cannot encrypt or add password protection to PDFs. This tool is
  // in development and will use a WASM-based encryption library (e.g. qpdf-wasm
  // or pdfcpu-wasm) in a future release. Until then, processing is unavailable.
  throw new Error(
    'PDF protection (encryption) is not supported by pdf-lib. ' +
      'pdf-lib cannot encrypt PDFs or add password protection. ' +
      'This tool is in development and will use a WASM-based encryption engine in a future release.',
  );
};
