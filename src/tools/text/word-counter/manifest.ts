// src/tools/text/word-counter/manifest.ts

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
});

const outputSchema = z.object({
  characters: z.number(),
  charactersNoSpaces: z.number(),
  words: z.number(),
  sentences: z.number(),
  paragraphs: z.number(),
  lines: z.number(),
  readingTimeMinutes: z.number(),
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

const slug = 'word-counter';
const category = 'text' as const;
const title = 'Word Counter';
const description =
  'Count words, characters, sentences, paragraphs, and lines in your text, and estimate reading time — entirely in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Compute common text statistics for a body of text.',
  userProblem:
    'I need to know how many words, characters, sentences, or paragraphs are in a piece of text — and roughly how long it takes to read.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'Input text is required.' },
    { field: 'text', type: 'maxSize', value: 10485760, message: 'Input must be under 10 MB.' },
  ],
  successCriteria: 'A set of text statistics (counts and reading time) is produced.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Word Counter — Count Words, Characters & Reading Time Online',
    description:
      'Count words, characters (with and without spaces), sentences, paragraphs, and lines in your text. Estimates reading time. Runs locally in your browser.',
    keywords: ['word counter', 'character count', 'count words', 'reading time', 'text statistics'],
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
      ['Is my text uploaded?', 'No. Counting runs entirely in your browser.'],
      ['How is reading time estimated?', 'Using an average reading speed of 200 words per minute.'],
      ['Are characters with and without spaces counted separately?', 'Yes. Both counts are reported.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['case-converter', 'remove-duplicate-lines', 'sort-lines', 'text-diff'],
  analytics: {
    events: [{ name: 'text_counted', trigger: 'after processing' }],
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
