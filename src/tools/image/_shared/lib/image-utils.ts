// src/tools/image/_shared/lib/image-utils.ts — Pure image helpers (LOCK-06: browser-only).

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
];

export const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25 MB

export interface LoadedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export function loadImage(file: File | Blob | string): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = typeof file === 'string' ? file : URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const result: LoadedImage = {
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      if (typeof file !== 'string') URL.revokeObjectURL(url);
      resolve(result);
    };
    image.onerror = () => {
      if (typeof file !== 'string') URL.revokeObjectURL(url);
      reject(new Error('Failed to load image.'));
    };
    image.src = url;
  });
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to Blob conversion failed.'));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export function getExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
  };
  return map[mime] ?? 'png';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function compressionRatio(originalBytes: number, compressedBytes: number): number {
  if (originalBytes === 0) return 0;
  return (1 - compressedBytes / originalBytes) * 100;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `Unsupported image type "${file.type}". Supported: ${ACCEPTED_IMAGE_TYPES.join(', ')}.`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `File is too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_IMAGE_SIZE)}.`;
  }
  return null;
}
