// src/shared/lib/search.ts — Search index & adapter (DGA-04).

import type { SearchIndexEntry, ToolCategory } from '@packages/types';

export interface SearchAdapter {
  index(entries: SearchIndexEntry[]): Promise<void> | void;
  search(query: string, options?: { category?: ToolCategory; limit?: number }): Promise<SearchResult[]>;
}

export interface SearchResult {
  slug: string;
  category: ToolCategory;
  title: string;
  description: string;
  url: string;
  score: number;
  matchedFields: string[];
}

/**
 * In-memory search adapter — instant, category, related, fuzzy (simple substring + token scoring).
 * Adequate for Phase 1 scale (≤1,000 tools).
 */
export class InMemorySearchAdapter implements SearchAdapter {
  private entries: SearchIndexEntry[] = [];

  index(entries: SearchIndexEntry[]): void {
    this.entries = entries;
  }

  async search(query: string, options: { category?: ToolCategory; limit?: number } = {}): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase();
    const limit = options.limit ?? 12;
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const results: SearchResult[] = [];
    for (const entry of this.entries) {
      if (options.category && entry.category !== options.category) continue;
      const title = entry.title.toLowerCase();
      const description = entry.description.toLowerCase();
      const keywords = entry.keywords.map((k) => k.toLowerCase());
      const slug = entry.slug.toLowerCase();
      const matchedFields: string[] = [];
      let score = 0;
      if (slug === q) {
        score += 100;
        matchedFields.push('slug');
      }
      if (title.includes(q)) {
        score += 50;
        matchedFields.push('title');
      }
      for (const token of tokens) {
        if (title.includes(token)) score += 10;
        if (description.includes(token)) score += 5;
        if (slug.includes(token)) score += 8;
        if (keywords.some((k) => k.includes(token))) {
          score += 7;
          matchedFields.push('keywords');
        }
      }
      if (score > 0) {
        results.push({
          slug: entry.slug,
          category: entry.category,
          title: entry.title,
          description: entry.description,
          url: entry.url,
          score,
          matchedFields: Array.from(new Set(matchedFields)),
        });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

let provider: SearchAdapter | null = null;

export function getSearchProvider(): SearchAdapter {
  if (!provider) provider = new InMemorySearchAdapter();
  return provider;
}

export function setSearchProvider(adapter: SearchAdapter): void {
  provider = adapter;
}
