// src/tools/image/image-format-convert/manifest.ts

import { z } from 'zod';
import type { ToolManifest } from '@packages/types';
import type { ToolStages } from '@packages/tool-engine';
import {
  DEFAULT_EMPTY_STATES,
  DEFAULT_FAILURE_STATES,
  DEFAULT_FUNNEL_STEPS,
  DEFAULT_LIMITS,
  DEFAULT_LOADING_STATES,
  buildCanonical,
  buildOgImage,
  buildToolBreadcrumb,
  makeFaq,
} from '@/shared/lib/manifest-helpers';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '../_shared/lib/image-utils';
import { inputStage } from './stages/input';
import { validationStage } from './stages/validation';
import { processingStage } from './stages/processing';
import { previewStage } from './stages/preview';
import { downloadStage } from './stages/download';

export const inputSchema = z.object({
  file: z.instanceof(File).refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), {
    message: 'Unsupported image type.',
  }),
  targetFormat: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  quality: z.number().min(1).max(100).default(90),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
  filename: z.string(),
  mimeType: z.string(),
  width: z.number(),
  height: z.number(),
  originalSize: z.number(),
  outputSize: z.number(),
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

const slug = 'image-format-convert';
const category = 'image' as const;
const title = 'Image Format Converter';
const description =
  'Convert images between PNG, JPEG, and WebP formats — entirely in your browser with no uploads.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Convert an image between PNG, JPEG, and WebP formats.',
  userProblem: 'I need to convert an image from one format to another without uploading it.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'file', type: 'required', message: 'An image file is required.' },
    { field: 'file', type: 'maxSize', value: MAX_IMAGE_SIZE, message: 'Image must be under 25 MB.' },
    { field: 'file', type: 'format', value: ACCEPTED_IMAGE_TYPES.join(','), message: 'Unsupported image type.' },
    { field: 'targetFormat', type: 'custom', value: 'png|jpeg|webp', message: 'Target format must be PNG, JPEG, or WebP.' },
  ],
  successCriteria: 'An image in the target format is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Image Format Converter — PNG, JPG, WebP Online',
    description:
      'Convert images between PNG, JPEG, and WebP. Runs locally in your browser. No upload, no account.',
    keywords: ['image converter', 'convert png to jpg', 'convert jpg to png', 'convert to webp', 'image format'],
    canonicalUrl: buildCanonical(category, slug),
    openGraph: { title, description, image: buildOgImage(category, slug), type: 'website' },
    twitterCard: { card: 'summary_large_image', title, description, image: buildOgImage(category, slug) },
    structuredData: {
      '@type': 'SoftwareApplication',
      name: title,
      applicationCategory: 'ImageApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    faq: makeFaq([
      ['Is my image uploaded to a server?', 'No. The image is processed entirely in your browser.'],
      ['Which formats are supported?', 'You can convert to PNG, JPEG, or WebP. Source may be PNG, JPEG, WebP, GIF, BMP, or SVG.'],
      ['Why does my transparent PNG become black when converting to JPEG?', 'JPEG has no alpha channel; transparent areas are filled with white. Use PNG or WebP for transparency.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['image-resize', 'image-compress', 'image-crop', 'image-rotate'],
  analytics: {
    events: [{ name: 'convert_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
