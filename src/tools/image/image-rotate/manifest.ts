// src/tools/image/image-rotate/manifest.ts

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
  angle: z.enum(['90', '180', '270']),
  flip: z.enum(['none', 'horizontal', 'vertical']).default('none'),
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

const slug = 'image-rotate';
const category = 'image' as const;
const title = 'Image Rotator';
const description =
  'Rotate images by 90, 180, or 270 degrees and optionally flip them — all locally in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Rotate an image by 90°, 180°, or 270°, with optional horizontal/vertical flip.',
  userProblem: 'I need to fix the orientation of an image without uploading it.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'file', type: 'required', message: 'An image file is required.' },
    { field: 'file', type: 'maxSize', value: MAX_IMAGE_SIZE, message: 'Image must be under 25 MB.' },
    { field: 'file', type: 'format', value: ACCEPTED_IMAGE_TYPES.join(','), message: 'Unsupported image type.' },
    { field: 'angle', type: 'custom', value: '90|180|270', message: 'Angle must be 90, 180, or 270.' },
  ],
  successCriteria: 'A rotated image file is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Image Rotator — Rotate & Flip Images Online',
    description:
      'Rotate images by 90, 180, or 270 degrees and flip horizontally or vertically. Runs locally in your browser.',
    keywords: ['image rotator', 'rotate image', 'flip image', 'rotate png', 'rotate jpg'],
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
      ['Can I flip the image too?', 'Yes — choose horizontal or vertical flip in addition to rotation.'],
      ['What about custom angles like 45°?', 'This tool focuses on right-angle rotations. Custom angles may distort the image.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['image-resize', 'image-compress', 'image-crop', 'image-format-convert'],
  analytics: {
    events: [{ name: 'rotate_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
