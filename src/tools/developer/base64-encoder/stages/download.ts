// src/tools/developer/base64-encoder/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => ({
  kind: 'text',
  text: output.result,
  filename: 'result.txt',
  mimeType: 'text/plain',
});
