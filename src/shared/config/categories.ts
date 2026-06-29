// src/shared/config/categories.ts — Category metadata (LOCK-04, DGA-04).

import type { ToolCategoryConfig } from '@packages/types';

export const categories: ToolCategoryConfig[] = [
  {
    slug: 'image',
    name: 'Image Tools',
    description: 'Resize, compress, crop, rotate, and convert images directly in your browser.',
    icon: 'image',
    order: 1,
  },
  {
    slug: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, split, compress, rotate, extract, protect, and unlock PDF documents.',
    icon: 'file-text',
    order: 2,
  },
  {
    slug: 'developer',
    name: 'Developer Tools',
    description: 'JSON, Base64, URL, JWT, UUID, and hash utilities for everyday engineering.',
    icon: 'code',
    order: 3,
  },
  {
    slug: 'text',
    name: 'Text Tools',
    description: 'Convert case, dedupe, sort, count, and diff text instantly.',
    icon: 'type',
    order: 4,
  },
  {
    slug: 'converters',
    name: 'Converters',
    description: 'Convert between file formats and data representations.',
    icon: 'arrow-left-right',
    order: 5,
  },
  {
    slug: 'seo',
    name: 'SEO Tools',
    description: 'Inspect, audit, and improve search-engine optimisation signals.',
    icon: 'search',
    order: 6,
  },
  {
    slug: 'calculators',
    name: 'Calculators',
    description: 'Practical calculators for everyday numeric problems.',
    icon: 'calculator',
    order: 7,
  },
];

export function getCategory(slug: string): ToolCategoryConfig | undefined {
  return categories.find((c) => c.slug === slug);
}
