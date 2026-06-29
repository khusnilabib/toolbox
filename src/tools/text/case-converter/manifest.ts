// src/tools/text/case-converter/manifest.ts

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
  mode: z.enum(['upper', 'lower', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab']).default('upper'),
});

const outputSchema = z.object({
  result: z.string(),
  originalLength: z.number(),
  resultLength: z.number(),
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

const slug = 'case-converter';
const category = 'text' as const;
const title = 'Case Converter';
const description =
  'Convert text to UPPER, lower, Title Case, Sentence case, camelCase, PascalCase, snake_case, or kebab-case — entirely in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Transform text between common casing conventions.',
  userProblem:
    'I have text in one casing style and need to convert it to another (e.g., for code identifiers or document headings).',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'Input text is required.' },
    { field: 'text', type: 'maxSize', value: 10485760, message: 'Input must be under 10 MB.' },
    {
      field: 'mode',
      type: 'custom',
      value: 'upper|lower|title|sentence|camel|pascal|snake|kebab',
      message: 'Mode must be one of the supported casing styles.',
    },
  ],
  successCriteria: 'The converted text is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Case Converter - Free Online Text Case Tool',
    description:
      'Convert text to UPPER, lower, Title Case, Sentence case, camelCase, PascalCase, snake_case, or kebab-case. Runs locally in your browser.',
    keywords: ['case converter', 'uppercase', 'lowercase', 'camelcase', 'snake case', 'kebab case'],
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
      ['Is my text uploaded?', 'No. Conversion runs entirely in your browser.'],
      ['Which casing styles are supported?', 'UPPER, lower, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.'],
      ['What is the maximum input size?', 'Up to 10 MB of text per request.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['word-counter', 'remove-duplicate-lines', 'sort-lines', 'text-diff'],
  analytics: {
    events: [{ name: 'case_converted', trigger: 'after processing' }],
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
