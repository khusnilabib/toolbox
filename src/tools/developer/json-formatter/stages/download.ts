// src/tools/developer/json-formatter/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => ({
  kind: 'text',
  text: output.formatted,
  filename: 'formatted.json',
  mimeType: 'application/json',
});
