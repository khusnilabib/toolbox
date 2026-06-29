// src/tools/developer/uuid-generator/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => ({
  kind: 'text',
  text: output.uuids.join('\n'),
  filename: 'uuids.txt',
  mimeType: 'text/plain',
});
