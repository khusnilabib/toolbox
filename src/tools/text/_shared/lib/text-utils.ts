// src/tools/text/_shared/lib/text-utils.ts — Pure text helpers.

export type CaseKind =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant';

export function convertCase(input: string, kind: CaseKind): string {
  switch (kind) {
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    case 'title':
      return input.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case 'sentence': {
      const lower = input.toLowerCase();
      return lower.replace(/(^\s*\w)|[.!?]\s+\w/g, (m) => m.toUpperCase());
    }
    case 'camel':
      return toCamelOrPascal(input, false);
    case 'pascal':
      return toCamelOrPascal(input, true);
    case 'snake':
      return tokenize(input).join('_').toLowerCase();
    case 'kebab':
      return tokenize(input).join('-').toLowerCase();
    case 'constant':
      return tokenize(input).join('_').toUpperCase();
    default:
      return input;
  }
}

function tokenize(input: string): string[] {
  // Split on non-alphanumeric, then split camelCase boundaries.
  const rough = input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  return rough;
}

function toCamelOrPascal(input: string, pascal: boolean): string {
  const tokens = tokenize(input);
  return tokens
    .map((t, i) => {
      const lower = t.toLowerCase();
      if (i === 0 && !pascal) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

export function removeDuplicateLines(input: string, caseSensitive = true): string {
  const lines = input.split(/\r?\n/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(line);
    }
  }
  return out.join('\n');
}

export type SortOrder = 'asc' | 'desc';
export type SortKind = 'lexicographic' | 'numeric' | 'length';

export function sortLines(input: string, order: SortOrder = 'asc', kind: SortKind = 'lexicographic'): string {
  const lines = input.split(/\r?\n/);
  const compare = (a: string, b: string): number => {
    let result = 0;
    if (kind === 'numeric') {
      result = Number(a) - Number(b);
      if (Number.isNaN(result)) result = a.localeCompare(b);
    } else if (kind === 'length') {
      result = a.length - b.length;
      if (result === 0) result = a.localeCompare(b);
    } else {
      result = a.localeCompare(b);
    }
    return order === 'asc' ? result : -result;
  };
  return [...lines].sort(compare).join('\n');
}

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
}

export function countText(input: string): TextStats {
  const trimmed = input.trim();
  const characters = input.length;
  const charactersNoSpaces = input.replace(/\s/g, '').length;
  const words = trimmed ? (trimmed.match(/\S+/g) ?? []).length : 0;
  const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) ?? []).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
  const lines = input === '' ? 0 : input.split(/\r?\n/).length;
  // ~200 words per minute reading speed.
  const readingTimeMinutes = Math.max(words > 0 ? 1 / 60 : 0, words / 200);
  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes: Math.round(readingTimeMinutes * 60) / 60,
  };
}

export type DiffKind = 'equal' | 'added' | 'removed' | 'changed';

export interface DiffLine {
  kind: DiffKind;
  left?: string;
  right?: string;
  lineNumber: number;
}

export function diffText(left: string, right: string): DiffLine[] {
  const leftLines = left.split(/\r?\n/);
  const rightLines = right.split(/\r?\n/);
  const maxLen = Math.max(leftLines.length, rightLines.length);
  const result: DiffLine[] = [];
  for (let i = 0; i < maxLen; i += 1) {
    const l = leftLines[i];
    const r = rightLines[i];
    if (l === undefined && r !== undefined) {
      result.push({ kind: 'added', right: r, lineNumber: i + 1 });
    } else if (l !== undefined && r === undefined) {
      result.push({ kind: 'removed', left: l, lineNumber: i + 1 });
    } else if (l === r) {
      result.push({ kind: 'equal', left: l, right: r, lineNumber: i + 1 });
    } else {
      result.push({ kind: 'changed', left: l, right: r, lineNumber: i + 1 });
    }
  }
  return result;
}
