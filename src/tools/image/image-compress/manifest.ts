// src/tools/image/image-compress/manifest.ts

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
  quality: z.number().min(1).max(100),
  outputFormat: z.enum(['original', 'image/jpeg', 'image/webp']).default('original'),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
  filename: z.string(),
  mimeType: z.string(),
  originalSize: z.number(),
  outputSize: z.number(),
  width: z.number(),
  height: z.number(),
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

const slug = 'image-compress';
const category = 'image' as const;
const title = 'Image Compressor';
const description =
  'Compress JPG, PNG, and WebP images by adjusting quality — all locally in your browser. Reduce file size without uploading.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Reduce the file size of an image by adjusting its compression quality.',
  userProblem: 'I need to make an image file smaller for email or web upload.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'file', type: 'required', message: 'An image file is required.' },
    { field: 'file', type: 'maxSize', value: MAX_IMAGE_SIZE, message: 'Image must be under 25 MB.' },
    { field: 'file', type: 'format', value: ACCEPTED_IMAGE_TYPES.join(','), message: 'Unsupported image type.' },
    { field: 'quality', type: 'custom', value: '1-100', message: 'Quality must be between 1 and 100.' },
  ],
  successCriteria: 'A smaller image file is produced with the requested quality and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Image Compressor — Reduce Image File Size Online',
    description:
      'Compress JPG, PNG, and WebP images by adjusting quality. Runs locally in your browser. No upload, no account.',
    keywords: ['image compressor', 'compress image', 'reduce image size', 'compress jpg', 'compress png'],
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
      ['What quality should I choose?', 'Start at 80 and decrease until you reach your target size.'],
      ['Does compression work for PNG?', 'PNG is lossless; for big savings on photos, export as JPEG or WebP.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['image-resize', 'image-crop', 'image-rotate', 'image-format-convert'],
  analytics: {
    events: [{ name: 'compress_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
