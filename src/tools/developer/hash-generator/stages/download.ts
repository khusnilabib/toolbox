// src/tools/developer/hash-generator/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => ({
  kind: 'text',
  text: output.hash,
  filename: 'hash.txt',
  mimeType: 'text/plain',
});
