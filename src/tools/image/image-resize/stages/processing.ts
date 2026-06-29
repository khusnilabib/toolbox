// src/tools/image/image-resize/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import {
  canvasToBlob,
  createCanvas,
  getExtensionFromMime,
  loadImage,
} from '../../_shared/lib/image-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, width, height, scale, maintainAspect } = ctx.input;
  const loaded = await loadImage(file);
  let targetW = loaded.width;
  let targetH = loaded.height;

  if (scale !== undefined) {
    targetW = Math.round(loaded.width * (scale / 100));
    targetH = Math.round(loaded.height * (scale / 100));
  } else if (width !== undefined && height !== undefined) {
    targetW = width;
    targetH = height;
  } else if (width !== undefined) {
    targetW = width;
    targetH = maintainAspect ? Math.round((width / loaded.width) * loaded.height) : loaded.height;
  } else if (height !== undefined) {
    targetH = height;
    targetW = maintainAspect ? Math.round((height / loaded.height) * loaded.width) : loaded.width;
  }

  const canvas = createCanvas(targetW, targetH);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not acquire canvas 2D context.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(loaded.image, 0, 0, targetW, targetH);

  const outMime = file.type === 'image/svg+xml' ? 'image/png' : file.type;
  const blob = await canvasToBlob(canvas, outMime, 0.92);
  const ext = getExtensionFromMime(outMime);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return {
    blob,
    filename: `${baseName}-${targetW}x${targetH}.${ext}`,
    mimeType: outMime,
    width: targetW,
    height: targetH,
    originalSize: file.size,
    outputSize: blob.size,
  };
};
