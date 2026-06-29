import { describe, it, expect } from 'vitest';
import { parsePageRange } from '@/tools/pdf/_shared/lib/pdf-utils';

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
    const result = parsePageRange('1');
    expect(() => parsePageRange("abc")).toThrow();
  });
});
