// src/shared/lib/download-manager.ts — Browser download helper.

import type { DownloadResult } from '@packages/tool-engine';

/**
 * Trigger a browser download for a DownloadResult returned by a tool's DownloadStage.
 */
export function triggerDownload(result: DownloadResult): void {
  if (typeof window === 'undefined') return;
  const blob =
    result.kind === 'file'
      ? result.blob ?? new Blob([result.text ?? ''], { type: result.mimeType })
      : new Blob([result.text ?? ''], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick to ensure the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Convenience wrapper to build a DownloadResult for a text payload.
 */
export function buildTextDownload(text: string, filename: string, mimeType = 'text/plain'): DownloadResult {
  return { kind: 'text', text, filename, mimeType };
}

/**
 * Convenience wrapper to build a DownloadResult for a file payload.
 */
export function buildFileDownload(blob: Blob, filename: string, mimeType: string): DownloadResult {
  return { kind: 'file', blob, filename, mimeType };
}

/**
 * Singleton manager — exposes a small API for the UI layer.
 */
export const downloadManager = {
  trigger: triggerDownload,
  text: buildTextDownload,
  file: buildFileDownload,
};
