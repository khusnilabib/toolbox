// src/tools/developer/base64-encoder/manifest.ts

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
  mode: z.enum(['encode', 'decode']).default('encode'),
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

const slug = 'base64-encoder';
const category = 'developer' as const;
const title = 'Base64 Encoder / Decoder';
const description =
  'Encode text to Base64 or decode Base64 back to text — UTF-8 safe, runs entirely in your browser, no upload required.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Convert text to Base64 or decode Base64 back to UTF-8 text.',
  userProblem:
    'I need to safely encode or decode Base64 strings (e.g., for data URIs, tokens, or basic transport) without using a server.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'Input text is required.' },
    { field: 'text', type: 'maxSize', value: 10485760, message: 'Input must be under 10 MB.' },
    { field: 'mode', type: 'custom', value: 'encode|decode', message: 'Mode must be "encode" or "decode".' },
  ],
  successCriteria: 'A Base64-encoded or decoded string is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Base64 Encoder / Decoder — Online Free Tool',
    description:
      'Encode text to Base64 or decode Base64 back to text. UTF-8 safe. Runs locally in your browser. No upload, no account.',
    keywords: ['base64 encoder', 'base64 decoder', 'encode base64', 'decode base64', 'base64 online'],
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
      ['Is my data uploaded?', 'No. Encoding and decoding happen entirely in your browser.'],
      ['Does this handle Unicode?', 'Yes. UTF-8 input is correctly encoded and decoded.'],
      ['What is the maximum input size?', 'Up to 10 MB per request.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['url-encoder', 'json-formatter', 'jwt-decoder', 'hash-generator'],
  analytics: {
    events: [{ name: 'base64_processed', trigger: 'after processing' }],
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
