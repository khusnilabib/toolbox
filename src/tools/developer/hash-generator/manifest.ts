// src/tools/developer/hash-generator/manifest.ts

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
  algorithm: z.enum(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']).default('SHA-256'),
});

const outputSchema = z.object({
  hash: z.string(),
  algorithm: z.string(),
  inputLength: z.number(),
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

const slug = 'hash-generator';
const category = 'developer' as const;
const title = 'Hash Generator';
const description =
  'Generate SHA-1, SHA-256, SHA-384, or SHA-512 hashes from text in your browser using the Web Crypto API. No upload required.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Compute a SHA-1/256/384/512 hex digest of arbitrary text.',
  userProblem:
    'I need to compute a cryptographic hash of text (e.g., for integrity checks or fingerprinting) without sending the text to a server.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'text', type: 'required', message: 'Input text is required.' },
    { field: 'text', type: 'maxSize', value: 10485760, message: 'Input must be under 10 MB.' },
    {
      field: 'algorithm',
      type: 'custom',
      value: 'SHA-1|SHA-256|SHA-384|SHA-512',
      message: 'Algorithm must be one of SHA-1, SHA-256, SHA-384, or SHA-512.',
    },
  ],
  successCriteria: 'A hex-encoded hash digest is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Hash Generator — SHA-1 / SHA-256 / SHA-512 Online Free',
    description:
      'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text. Uses Web Crypto API. Runs locally in your browser. No upload, no account.',
    keywords: ['hash generator', 'sha256', 'sha512', 'sha1', 'hash online'],
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
      ['Is my text uploaded?', 'No. Hashing happens entirely in your browser using the Web Crypto API.'],
      ['Which algorithms are supported?', 'SHA-1, SHA-256, SHA-384, and SHA-512.'],
      ['Is SHA-1 safe for security purposes?', 'SHA-1 is considered cryptographically weak; prefer SHA-256 or stronger for security use cases.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['uuid-generator', 'base64-encoder', 'json-formatter', 'jwt-decoder'],
  analytics: {
    events: [{ name: 'hash_generated', trigger: 'after processing' }],
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
