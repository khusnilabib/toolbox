// src/tools/developer/jwt-decoder/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { decodeJwt } from '../../_shared/lib/dev-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { token } = ctx.input;
  const decoded = decodeJwt(token);
  const header = JSON.stringify(decoded.header, null, 2);
  const payload = JSON.stringify(decoded.payload, null, 2);

  // Extract a human-readable expiry date if the payload contains an `exp` claim.
  let expiresAt: string | undefined;
  if (
    decoded.payload &&
    typeof decoded.payload === 'object' &&
    'exp' in decoded.payload
  ) {
    const exp = (decoded.payload as Record<string, unknown>).exp;
    if (typeof exp === 'number') {
      expiresAt = new Date(exp * 1000).toISOString();
    }
  }

  return {
    header,
    payload,
    signature: decoded.signature,
    expiresAt,
  };
};
