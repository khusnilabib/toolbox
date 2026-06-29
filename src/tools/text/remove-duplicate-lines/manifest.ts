// src/tools/text/remove-duplicate-lines/manifest.ts

import { z } from 'zod';
import type { ToolManifest } from '@packages/types';
import type { ToolStages } from '@packages/tool-engine';
import {
  DEFAULT_EMPTY_STATES,
  DEFAULT_FAILURE_STATES,
  DEFAULT_FUNNEL_STEPS,
  DEFAULT_LOADING_STATES,
  buildCanonical,
  buildOgImage,
  buildToolBreadcrumb,
  makeFaq,
} from '@/shared/lib/manifest-helpers';
import { inputStage } from './stages/input';
import { validationStage } from './stages/validation';
import { processingStage } from './stages/processing';
import { previewStage } from './stages/preview';
import { downloadStage } from './stages/download';

export const inputSchema = z.object({
  text: z.string().min(1, 'Input text is required.'),
  caseSensitive: z.boolean().default(true),
});

const outputSchema = z.object({
  result: z.string(),
  originalLines: z.number(),
  uniqueLines: z.number(),
  removedCount: z.number(),
});

export type ToolInput = z.infer<typeof inputSchema>;
export type ToolOutput = z.infer<typeof outputSchema>;

const stages: ToolStages<ToolInput, ToolOutput> = {
  input: inputStage,
  validation: validationStage,
  processing: processingStage,
  preview: previewStage,
  download: downloadStage,
};

const slug = 'remove-duplicate-lines';
const category = 'text' as const;
const title = 'Remove Duplicate Lines';
const description =
  'Remove duplicate lines from any text — optionally case-insensitive — and keep the first occurrence of each. Runs entirely in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Deduplicate lines of text while preserving order.',
  userProblem:
    'I have a list of lines (e.g., a CSV column or log) with duplicate entries and want to remove the duplicates.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'Input text is required.' },
    { field: 'text', type: 'maxSize', value: 10485760, message: 'Input must be under 10 MB.' },
  ],
  successCriteria: 'A deduplicated text is produced with a count of removed lines.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Remove Duplicate Lines — Online Free Deduplication Tool',
    description:
      'Remove duplicate lines from text, optionally case-insensitive, while preserving order. Runs locally in your browser. No upload, no account.',
    keywords: ['remove duplicate lines', 'deduplicate lines', 'unique lines', 'remove duplicates', 'dedupe text'],
    canonicalUrl: buildCanonical(category, slug),
    openGraph: {
      title,
      description,
      image: buildOgImage(category, slug),
      type: 'website',
    },
    twitterCard: {
      card: 'summary_large_image',
      title,
      description,
      image: buildOgImage(category, slug),
    },
    structuredData: {
      '@type': 'SoftwareApplication',
      name: title,
      applicationCategory: 'TextEditor',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    faq: makeFaq([
      ['Is my text uploaded?', 'No. Deduplication runs entirely in your browser.'],
      ['Does this preserve the order of lines?', 'Yes. The first occurrence of each line is kept in its original position.'],
      ['Can I deduplicate case-insensitively?', 'Yes. Toggle the caseSensitive option off to treat lines case-insensitively.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['sort-lines', 'case-converter', 'word-counter', 'text-diff'],
  analytics: {
    events: [{ name: 'duplicates_removed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: {
    maxInputSize: 10485760,
    maxOutputSize: 10485760,
    maxProcessingTime: 5000,
    requiresAuth: false,
    premiumOnly: false,
  },
};

export default manifest;
