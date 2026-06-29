// src/tools/image/image-compress/stages/processing.ts

import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import {
  canvasToBlob,
  createCanvas,
  getExtensionFromMime,
  loadImage,
} from '../../_shared/lib/image-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, quality, outputFormat } = ctx.input;
  const loaded = await loadImage(file);
  const canvas = createCanvas(loaded.width, loaded.height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not acquire canvas 2D context.');
  // For JPEG output, fill white background to handle transparency.
  const targetMime =
    outputFormat === 'original'
      ? file.type === 'image/png'
        ? 'image/png'
        : file.type === 'image/webp'
          ? 'image/webp'
          : 'image/jpeg'
      : outputFormat;
  if (targetMime === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, loaded.width, loaded.height);
  }
  context.drawImage(loaded.image, 0, 0, loaded.width, loaded.height);
  const blob = await canvasToBlob(canvas, targetMime, quality / 100);
  const ext = getExtensionFromMime(targetMime);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return {
    blob,
    filename: `${baseName}-compressed.${ext}`,
    mimeType: targetMime,
    originalSize: file.size,
    outputSize: blob.size,
    width: loaded.width,
    height: loaded.height,
  };
};
