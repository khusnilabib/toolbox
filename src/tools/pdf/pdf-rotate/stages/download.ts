// src/tools/pdf/pdf-rotate/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => ({
  kind: 'file',
  blob: output.blob,
  filename: 'rotated.pdf',
  mimeType: 'application/pdf',
});
