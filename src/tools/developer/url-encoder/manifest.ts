// src/tools/developer/url-encoder/manifest.ts

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

const slug = 'url-encoder';
const category = 'developer' as const;
const title = 'URL Encoder / Decoder';
const description =
  'Percent-encode text for safe URL usage or decode percent-encoded URLs back to plain text — runs entirely in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Percent-encode or decode a string for safe transport in URLs.',
  userProblem:
    'I need to safely encode special characters into a URL, or decode a percent-encoded URL back to readable text.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'Input text is required.' },
    { field: 'text', type: 'maxSize', value: 10485760, message: 'Input must be under 10 MB.' },
    { field: 'mode', type: 'custom', value: 'encode|decode', message: 'Mode must be "encode" or "decode".' },
  ],
  successCriteria: 'A URL-encoded or decoded string is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'URL Encoder / Decoder — Percent-Encoding Online Free',
    description:
      'Percent-encode or decode URLs in your browser. Handles Unicode and special characters. No upload, no account.',
    keywords: ['url encoder', 'url decoder', 'percent encoding', 'encode url', 'decode url'],
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
      ['Is my input uploaded?', 'No. Encoding and decoding run entirely in your browser.'],
      ['Does this handle Unicode characters?', 'Yes. encodeURIComponent handles UTF-8 characters correctly.'],
      ['What happens if I decode an invalid string?', 'An error message is shown and you can correct the input.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['base64-encoder', 'json-formatter', 'jwt-decoder', 'hash-generator'],
  analytics: {
    events: [{ name: 'url_processed', trigger: 'after processing' }],
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
