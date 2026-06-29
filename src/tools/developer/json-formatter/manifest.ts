// src/tools/developer/json-formatter/manifest.ts

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
  text: z.string().min(1, 'JSON input is required.'),
  indent: z.number().int().min(1).max(8).default(2),
});

const outputSchema = z.object({
  formatted: z.string(),
  valid: z.boolean(),
  error: z.string().optional(),
  sizeBytes: z.number(),
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

const slug = 'json-formatter';
const category = 'developer' as const;
const title = 'JSON Formatter';
const description =
  'Format and validate JSON in your browser. Pretty-print with adjustable indent, catch syntax errors instantly — no upload required.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Pretty-print and validate a JSON string with a configurable indent.',
  userProblem:
    'I have a compact or malformed JSON string and need to format it readably and check whether it is valid.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'JSON input is required.' },
    { field: 'text', type: 'maxSize', value: 1048576, message: 'JSON input must be under 1 MB.' },
    { field: 'indent', type: 'custom', value: '1-8', message: 'Indent must be between 1 and 8 spaces.' },
  ],
  successCriteria: 'A formatted (or error-flagged) JSON string is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'JSON Formatter — Validate & Pretty-Print JSON Online Free',
    description:
      'Format, validate, and pretty-print JSON directly in your browser. Adjustable indent. No upload, no account. Runs locally.',
    keywords: ['json formatter', 'pretty print json', 'json validator', 'format json', 'json beautifier'],
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
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    faq: makeFaq([
      ['Is my JSON uploaded to a server?', 'No. JSON is parsed and formatted entirely in your browser.'],
      ['What is the maximum input size?', 'Up to 1 MB of JSON text per request.'],
      ['Does this validate JSON?', 'Yes. If the input is invalid, the error message is shown and the valid flag is false.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['base64-encoder', 'url-encoder', 'jwt-decoder', 'hash-generator'],
  analytics: {
    events: [{ name: 'json_formatted', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: {
    maxInputSize: 1048576,
    maxOutputSize: 10485760,
    maxProcessingTime: 5000,
    requiresAuth: false,
    premiumOnly: false,
  },
};

export default manifest;
