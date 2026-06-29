// src/tools/pdf/pdf-unlock/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => ({
  kind: 'file',
  blob: output.blob,
  filename: 'unlocked.pdf',
  mimeType: 'application/pdf',
});
