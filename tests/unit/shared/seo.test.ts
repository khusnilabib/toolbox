// tests/unit/shared/seo.test.ts — Unit tests for SEO helpers
import { describe, it, expect } from 'vitest';
import { getSeoMeta } from '@/generated/seo-meta';
import { allManifests } from '@/generated/registry';

describe('SEO metadata generation', () => {
  it('every tool has an SeoMetaEntry', () => {
    for (const m of allManifests) {
      const seo = getSeoMeta(m.category, m.slug);
      expect(seo, `Missing SEO meta for ${m.category}/${m.slug}`).toBeDefined();
      expect(seo!.slug).toBe(m.slug);
      expect(seo!.category).toBe(m.category);
      expect(seo!.title).toBeTruthy();
      expect(seo!.description).toBeTruthy();
      expect(seo!.canonicalUrl).toContain(m.category);
      expect(seo!.canonicalUrl).toContain(m.slug);
    }
  });

  it('every canonical URL is absolute', () => {
    for (const m of allManifests) {
      const seo = getSeoMeta(m.category, m.slug);
      expect(seo!.canonicalUrl).toMatch(/^https?:\/\//);
    }
  });

  it('openGraph has required fields', () => {
    for (const m of allManifests) {
      const seo = getSeoMeta(m.category, m.slug);
      expect(seo!.openGraph.title).toBeTruthy();
      expect(typeof seo!.openGraph.type).toBe('string');
    }
  });

  it('twitterCard has required fields', () => {
    for (const m of allManifests) {
      const seo = getSeoMeta(m.category, m.slug);
      expect(seo!.twitterCard.card).toBeTruthy();
      expect(seo!.twitterCard.title).toBeTruthy();
    }
  });
});
