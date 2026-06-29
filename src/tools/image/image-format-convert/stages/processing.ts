import type { ProcessingStage } from '@packages/tool-engine';
import type { ToolInput, ToolOutput } from '../manifest';
import { loadImage, createCanvas, canvasToBlob } from '@/tools/image/_shared/lib/image-utils';

export const processingStage: ProcessingStage<ToolInput, ToolOutput> = async (ctx) => {
  const { file, targetFormat, quality } = ctx.input;
  const img = await loadImage(file);
  const canvas = createCanvas(img.width, img.height);
  const canvasCtx = canvas.getContext('2d');
  if (!canvasCtx) throw new Error('Could not get canvas context');
  canvasCtx.drawImage(img.image, 0, 0);
  if (targetFormat === 'image/jpeg') {
    canvasCtx.globalCompositeOperation = 'destination-over';
    canvasCtx.fillStyle = '#FFFFFF';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const blob = await canvasToBlob(canvas, targetFormat, quality / 100);
  return {
    blob,
    filename: `converted.${targetFormat.split('/')[1]}`,
    mimeType: targetFormat,
    width: img.width,
    height: img.height,
    originalSize: file.size,
    outputSize: blob.size,
  };
};
