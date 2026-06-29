// src/tools/developer/jwt-decoder/stages/download.ts

import type { DownloadStage } from '@packages/tool-engine';
import type { ToolOutput } from '../manifest';

export const downloadStage: DownloadStage<ToolOutput> = async (output) => {
  const text = JSON.stringify(
    {
      header: JSON.parse(output.header),
      payload: JSON.parse(output.payload),
      signature: output.signature,
      expiresAt: output.expiresAt ?? null,
    },
    null,
    2,
  );
  return {
    kind: 'text',
    text,
    filename: 'jwt-decoded.json',
    mimeType: 'application/json',
  };
};
