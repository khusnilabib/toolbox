// src/tools/developer/uuid-generator/manifest.ts

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
  count: z.number().int().min(1).max(100).default(1),
});

const outputSchema = z.object({
  uuids: z.array(z.string()),
  count: z.number(),
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

const slug = 'uuid-generator';
const category = 'developer' as const;
const title = 'UUID Generator';
const description =
  'Generate one or more RFC 4122 v4 UUIDs securely in your browser using the Web Crypto API. No upload required.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Generate cryptographically random RFC 4122 version 4 UUIDs.',
  userProblem:
    'I need one or more unique identifiers (UUIDs) for database keys, request IDs, or other purposes without exposing them to a server.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'count', type: 'custom', value: '1-100', message: 'Count must be between 1 and 100.' },
  ],
  successCriteria: 'The requested number of UUIDs are generated and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'UUID Generator — RFC 4122 v4 UUIDs Online Free',
    description:
      'Generate up to 100 RFC 4122 v4 UUIDs at once. Uses Web Crypto API for cryptographically secure randomness. No upload, no account.',
    keywords: ['uuid generator', 'guid generator', 'uuid v4', 'random uuid', 'rfc 4122'],
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
      ['Are the UUIDs cryptographically random?', 'Yes. We use the Web Crypto API when available, with a secure fallback.'],
      ['Which UUID version is generated?', 'RFC 4122 version 4 (random).'],
      ['How many UUIDs can I generate at once?', 'Up to 100 per request.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['hash-generator', 'base64-encoder', 'json-formatter', 'jwt-decoder'],
  analytics: {
    events: [{ name: 'uuids_generated', trigger: 'after processing' }],
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
