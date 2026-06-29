// src/tools/pdf/pdf-unlock/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async () => {
  // pdf-lib cannot decrypt or remove password protection from PDFs. It can
  // load encrypted PDFs with ignoreEncryption, but it cannot produce a
  // decrypted output. This tool is in development and will use a WASM-based
  // decryption library (e.g. qpdf-wasm or pdfcpu-wasm) in a future release.
  throw new Error(
    'PDF unlocking (decryption) is not supported by pdf-lib. ' +
      'pdf-lib cannot remove password protection from encrypted PDFs. ' +
      'This tool is in development and will use a WASM-based decryption engine in a future release.',
  );
};
