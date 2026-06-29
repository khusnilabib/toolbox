// src/tools/pdf/_shared/lib/pdf-utils.ts — Pure PDF helpers backed by pdf-lib (lazy-loaded, LOCK-06).

export async function loadPdf(data: Uint8Array | ArrayBuffer | Blob): Promise<import('pdf-lib').PDFDocument> {
  const { PDFDocument } = await import('pdf-lib');
  if (data instanceof Blob) {
    const buffer = await data.arrayBuffer();
    return PDFDocument.load(buffer, { ignoreEncryption: true });
  }
  return PDFDocument.load(data, { ignoreEncryption: true });
}

export async function savePdfBlob(doc: import('pdf-lib').PDFDocument): Promise<Blob> {
  const bytes = await doc.save();
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}

export async function getPageCount(doc: import('pdf-lib').PDFDocument): Promise<number> {
  return doc.getPageCount();
}

export async function rotateAllPages(
  doc: import('pdf-lib').PDFDocument,
  angle: 90 | 180 | 270,
): Promise<import('pdf-lib').PDFDocument> {
  const { degrees } = await import('pdf-lib');
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }
  return doc;
}

export async function extractPages(
  doc: import('pdf-lib').PDFDocument,
  pageIndices: number[],
): Promise<import('pdf-lib').PDFDocument> {
  const { PDFDocument } = await import('pdf-lib');
  const out = await PDFDocument.create();
  const copied = await out.copyPages(doc, pageIndices);
  for (const page of copied) out.addPage(page);
  return out;
}

export async function splitPdf(
  doc: import('pdf-lib').PDFDocument,
  ranges: number[][],
): Promise<import('pdf-lib').PDFDocument[]> {
  const { PDFDocument } = await import('pdf-lib');
  const results: import('pdf-lib').PDFDocument[] = [];
  for (const range of ranges) {
    const out = await PDFDocument.create();
    const indices = range.map((p) => p - 1); // 1-based → 0-based
    const copied = await out.copyPages(doc, indices);
    for (const page of copied) out.addPage(page);
    results.push(out);
  }
  return results;
}

/**
 * Parse a page-range string like "1-3, 5, 8-10" into an array of inclusive ranges.
 * Returns array of [start, end] (1-based, inclusive).
 */
export function parsePageRange(input: string): number[][] {
  const parts = input
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const ranges: number[][] = [];
  for (const part of parts) {
    const dash = part.indexOf('-');
    if (dash === -1) {
      const n = Number(part);
      if (!Number.isFinite(n) || n < 1) throw new Error(`Invalid page number: "${part}"`);
      ranges.push([n, n]);
    } else {
      const start = Number(part.slice(0, dash));
      const end = Number(part.slice(dash + 1));
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range: "${part}"`);
      }
      ranges.push([start, end]);
    }
  }
  return ranges;
}

export async function mergePdfs(files: Uint8Array[]): Promise<import('pdf-lib').PDFDocument> {
  const { PDFDocument } = await import('pdf-lib');
  const out = await PDFDocument.create();
  for (const bytes of files) {
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copied = await out.copyPages(src, src.getPageIndices());
    for (const page of copied) out.addPage(page);
  }
  return out;
}
