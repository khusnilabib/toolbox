import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createPdfToolkit } from 'pdfstudio';
import { parsePageRange, protectPdf, unlockPdf } from '@/tools/pdf/_shared/lib/pdf-utils';

describe('pdf-utils', () => {
  it('parsePageRange single', () => {
    const result = parsePageRange('1');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('parsePageRange range', () => {
    const result = parsePageRange('1-3');
    expect(result).toBeDefined();
  });

  it('parsePageRange throws for invalid', () => {
    expect(() => parsePageRange('abc')).toThrow();
  });

  it('protects and unlocks a real PDF with AES encryption', async () => {
    const source = await PDFDocument.create();
    source.addPage([320, 240]);
    const sourceBytes = await source.save();
    const password = 'correct-horse-battery-staple';

    const protectedPdf = await protectPdf(
      new Blob([sourceBytes as BlobPart], { type: 'application/pdf' }),
      password,
    );
    const toolkit = await createPdfToolkit();
    expect(await toolkit.isEncrypted(protectedPdf)).toBe(true);
    await expect(toolkit.unlock(protectedPdf, { password: 'incorrect' })).rejects.toThrow();

    const unlockedPdf = await unlockPdf(protectedPdf, password);
    expect(await toolkit.isEncrypted(unlockedPdf)).toBe(false);
    expect(await toolkit.pageCount(unlockedPdf)).toBe(1);
  }, 30_000);
});
