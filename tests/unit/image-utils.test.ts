import { describe, it, expect } from 'vitest';
import { getExtensionFromMime, formatFileSize, compressionRatio, validateImageFile, ACCEPTED_IMAGE_TYPES } from '@/tools/image/_shared/lib/image-utils';

describe('image-utils', () => {
  it('getExtensionFromMime', () => {
    expect(getExtensionFromMime('image/png')).toBe('png');
    expect(getExtensionFromMime('image/jpeg')).toBe('jpg');
    expect(getExtensionFromMime('image/webp')).toBe('webp');
  });

  it('formatFileSize', () => {
    expect(formatFileSize(500)).toContain('B');
    expect(formatFileSize(1024)).toContain('KB');
    expect(formatFileSize(1024 * 1024)).toContain('MB');
  });

  it('compressionRatio', () => {
    expect(compressionRatio(1000, 500)).toBe(50);
  });

  it('validateImageFile accepts valid type', () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], 'test.png', { type: 'image/png' });
    expect(validateImageFile(file)).toBeNull();
  });

  it('validateImageFile rejects invalid type', () => {
    const file = new File([new Uint8Array([0x47, 0x49, 0x46])], 'test.pdf', { type: 'application/pdf' });
    const result = validateImageFile(file);
    expect(result).not.toBeNull();
    expect(result).toContain('Unsupported');
  });

  it('ACCEPTED_IMAGE_TYPES contains expected types', () => {
    expect(ACCEPTED_IMAGE_TYPES).toContain('image/png');
    expect(ACCEPTED_IMAGE_TYPES).toContain('image/jpeg');
    expect(ACCEPTED_IMAGE_TYPES).toContain('image/webp');
  });
});
