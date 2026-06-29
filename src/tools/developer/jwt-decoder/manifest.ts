// src/tools/developer/jwt-decoder/manifest.ts

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
  token: z.string().min(1, 'A JWT token is required.'),
});

const outputSchema = z.object({
  header: z.string(),
  payload: z.string(),
  signature: z.string(),
  expiresAt: z.string().optional(),
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

const slug = 'jwt-decoder';
const category = 'developer' as const;
const title = 'JWT Decoder';
const description =
  'Decode JSON Web Token (JWT) header, payload, and signature in your browser. Inspect expiry — no upload, no signature verification.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Decode a JWT into its header, payload, and signature segments.',
  userProblem:
    'I have a JWT and need to inspect its header and payload (including expiry) without sending it to a server.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'token', type: 'required', message: 'A JWT token is required.' },
    { field: 'token', type: 'custom', value: '3 segments', message: 'Token must have 3 dot-separated segments.' },
    { field: 'token', type: 'maxSize', value: 10485760, message: 'Token must be under 10 MB.' },
  ],
  successCriteria: 'The JWT header, payload, and signature are decoded and viewable, and optionally the expiry date.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'JWT Decoder — Decode JSON Web Tokens Online Free',
    description:
      'Decode JWT header, payload, and signature in your browser. See expiry instantly. No upload, no account, no signature verification.',
    keywords: ['jwt decoder', 'decode jwt', 'json web token', 'jwt inspector', 'jwt payload'],
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
      ['Is my JWT uploaded to a server?', 'No. Decoding happens entirely in your browser.'],
      ['Does this verify the JWT signature?', 'No. This tool decodes the token; it does not verify the signature against a secret.'],
      ['What happens if the token is malformed?', 'A descriptive error message is shown so you can fix the input.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['base64-encoder', 'json-formatter', 'url-encoder', 'hash-generator'],
  analytics: {
    events: [{ name: 'jwt_decoded', trigger: 'after processing' }],
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
