// src/tools/text/sort-lines/manifest.ts

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
  mode: z
    .enum(['asc', 'desc', 'length-asc', 'length-desc', 'random'])
    .default('asc'),
});

const outputSchema = z.object({
  result: z.string(),
  lineCount: z.number(),
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

const slug = 'sort-lines';
const category = 'text' as const;
const title = 'Sort Lines';
const description =
  'Sort lines alphabetically (asc/desc), by length, or randomly — entirely in your browser. Quick and private.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Reorder the lines of a text block according to a chosen sort mode.',
  userProblem:
    'I have a list of lines and want to sort them alphabetically, by length, or shuffle them randomly.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'Input text is required.' },
    { field: 'text', type: 'maxSize', value: 10485760, message: 'Input must be under 10 MB.' },
    {
      field: 'mode',
      type: 'custom',
      value: 'asc|desc|length-asc|length-desc|random',
      message: 'Mode must be one of asc, desc, length-asc, length-desc, or random.',
    },
  ],
  successCriteria: 'A sorted or shuffled version of the input text is produced.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Sort Lines — Alphabetical, by Length, or Random Online Free',
    description:
      'Sort lines of text alphabetically (ascending/descending), by length, or shuffle randomly. Runs locally in your browser. No upload, no account.',
    keywords: ['sort lines', 'alphabetical sort', 'sort text lines', 'random sort', 'sort by length'],
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
      ['Is my text uploaded?', 'No. Sorting runs entirely in your browser.'],
      ['Which sort modes are supported?', 'Alphabetical asc/desc, length asc/desc, and random shuffle.'],
      ['Does random shuffle use a secure RNG?', 'It uses Math.random for performance; suitable for casual shuffling, not cryptography.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['remove-duplicate-lines', 'case-converter', 'word-counter', 'text-diff'],
  analytics: {
    events: [{ name: 'lines_sorted', trigger: 'after processing' }],
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
