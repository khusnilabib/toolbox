// src/tools/text/text-diff/manifest.ts

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
  text1: z.string(),
  text2: z.string(),
});

const outputSchema = z.object({
  diffLines: z.array(
    z.object({
      kind: z.enum(['equal', 'added', 'removed', 'changed']),
      left: z.string().optional(),
      right: z.string().optional(),
      lineNumber: z.number(),
    }),
  ),
  addedCount: z.number(),
  removedCount: z.number(),
  unchangedCount: z.number(),
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

const slug = 'text-diff';
const category = 'text' as const;
const title = 'Text Diff';
const description =
  'Compare two blocks of text line-by-line and highlight additions, removals, and changes — entirely in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Produce a line-by-line diff between two pieces of text.',
  userProblem:
    'I have two versions of a text and want to see which lines were added, removed, or changed.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text1', type: 'maxSize', value: 10485760, message: 'Each text input must be under 10 MB.' },
    { field: 'text2', type: 'maxSize', value: 10485760, message: 'Each text input must be under 10 MB.' },
  ],
  successCriteria: 'A structured diff between the two inputs is produced with summary counts.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Text Diff — Compare Two Texts Line by Line Online Free',
    description:
      'Compare two blocks of text line by line and see additions, removals, and changes. Runs locally in your browser. No upload, no account.',
    keywords: ['text diff', 'compare text', 'line diff', 'text comparison', 'diff tool'],
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
      ['Is my text uploaded?', 'No. Diffing runs entirely in your browser.'],
      ['Is the diff algorithm a true LCS diff?', 'It uses a positional line-by-line comparison; sufficient for most short-text comparisons.'],
      ['Are blank inputs supported?', 'Yes. Comparing against an empty text highlights all lines as added or removed.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['word-counter', 'case-converter', 'remove-duplicate-lines', 'sort-lines'],
  analytics: {
    events: [{ name: 'text_diffed', trigger: 'after processing' }],
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
