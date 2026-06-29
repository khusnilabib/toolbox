import { describe, it, expect } from 'vitest';
import { convertCase, removeDuplicateLines, sortLines, countText, diffText } from '@/tools/text/_shared/lib/text-utils';

describe('text-utils', () => {
  it('convertCase', () => {
    expect(convertCase('hello', 'upper')).toBe('HELLO');
    expect(convertCase('HELLO', 'lower')).toBe('hello');
    expect(convertCase('hello world', 'title')).toBe('Hello World');
  });

  it('removeDuplicateLines', () => {
    const result = removeDuplicateLines('a\nb\na\nc');
    expect(result).toBe('a\nb\nc');
  });

  it('sortLines', () => {
    expect(sortLines('c\na\nb')).toBe('a\nb\nc');
    expect(sortLines('c\na\nb', 'desc')).toBe('c\nb\na');
  });

  it('countText', () => {
    const stats = countText('hello world');
    expect(stats.characters).toBe(11);
    expect(stats.words).toBe(2);
  });

  it('diffText', () => {
    const diff = diffText('a\nb', 'a\nc');
    expect(diff.length).toBeGreaterThan(0);
  });
});
