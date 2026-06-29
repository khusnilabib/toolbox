import { describe, it, expect } from 'vitest';
import { registry } from '@/generated/registry';

describe('Tool Registry', () => {
  it('contains tools', () => {
    const all = registry.all();
    expect(all.length).toBeGreaterThan(0);
  });

  it('finds tool by slug', () => {
    const tool = registry.bySlug('image-resize');
    expect(tool).toBeDefined();
    expect(tool!.slug).toBe('image-resize');
    expect(tool!.category).toBe('image');
  });

  it('returns undefined for unknown slug', () => {
    expect(registry.bySlug('nonexistent')).toBeUndefined();
  });

  it('filters by category', () => {
    const imageTools = registry.byCategory('image');
    expect(imageTools.length).toBe(5);
  });

  it('finds related tools', () => {
    const related = registry.relatedTo('image-resize');
    expect(related.length).toBeGreaterThan(0);
  });
});
