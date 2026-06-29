// src/tools/image/image-crop/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import {
  canvasToBlob,
  createCanvas,
  getExtensionFromMime,
  loadImage,
} from '../../_shared/lib/image-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, x, y, width, height } = ctx.input;
  const loaded = await loadImage(file);
  // Clamp crop region to image bounds.
  const sx = Math.max(0, Math.min(x, loaded.width - 1));
  const sy = Math.max(0, Math.min(y, loaded.height - 1));
  const sw = Math.max(1, Math.min(width, loaded.width - sx));
  const sh = Math.max(1, Math.min(height, loaded.height - sy));
  const canvas = createCanvas(sw, sh);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not acquire canvas 2D context.');
  context.drawImage(loaded.image, sx, sy, sw, sh, 0, 0, sw, sh);
  const outMime = file.type === 'image/svg+xml' ? 'image/png' : file.type;
  const blob = await canvasToBlob(canvas, outMime, 0.92);
  const ext = getExtensionFromMime(outMime);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return {
    blob,
    filename: `${baseName}-cropped.${ext}`,
    mimeType: outMime,
    width: sw,
    height: sh,
    originalSize: file.size,
    outputSize: blob.size,
  };
};
