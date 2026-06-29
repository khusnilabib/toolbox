import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64, urlEncode, urlDecode, generateUuid } from '@/tools/developer/_shared/lib/dev-utils';

describe('dev-utils', () => {
  describe('Base64', () => {
    it('encodes', () => { expect(encodeBase64('hello')).toBe('aGVsbG8='); });
    it('decodes', () => { expect(decodeBase64('aGVsbG8=')).toBe('hello'); });
    it('round-trips', () => {
      const text = 'Hello, World!';
      expect(decodeBase64(encodeBase64(text))).toBe(text);
    });
  });

  describe('URL encode/decode', () => {
    it('encodes', () => { expect(urlEncode('hello world')).toBe('hello%20world'); });
    it('decodes', () => { expect(urlDecode('hello%20world')).toBe('hello world'); });
  });

  describe('generateUuid', () => {
    it('generates a string', () => {
      const uuid = generateUuid();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBeGreaterThan(10);
    });
    it('generates unique', () => {
      expect(generateUuid()).not.toBe(generateUuid());
    });
  });
});
