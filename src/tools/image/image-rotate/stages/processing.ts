// src/tools/image/image-rotate/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import {
  canvasToBlob,
  createCanvas,
  getExtensionFromMime,
  loadImage,
} from '../../_shared/lib/image-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, angle, flip } = ctx.input;
  const loaded = await loadImage(file);
  const angleNum = Number(angle);
  const swap = angleNum === 90 || angleNum === 270;
  const outW = swap ? loaded.height : loaded.width;
  const outH = swap ? loaded.width : loaded.height;
  const canvas = createCanvas(outW, outH);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not acquire canvas 2D context.');
  context.translate(outW / 2, outH / 2);
  context.rotate((angleNum * Math.PI) / 180);
  if (flip === 'horizontal') context.scale(-1, 1);
  if (flip === 'vertical') context.scale(1, -1);
  context.drawImage(loaded.image, -loaded.width / 2, -loaded.height / 2, loaded.width, loaded.height);
  const outMime = file.type === 'image/svg+xml' ? 'image/png' : file.type;
  const blob = await canvasToBlob(canvas, outMime, 0.92);
  const ext = getExtensionFromMime(outMime);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return {
    blob,
    filename: `${baseName}-rotated-${angle}.${ext}`,
    mimeType: outMime,
    width: outW,
    height: outH,
    originalSize: file.size,
    outputSize: blob.size,
  };
};
