// src/tools/image/image-crop/manifest.ts

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
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().int().min(1).max(20000),
  height: z.number().int().min(1).max(20000),
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

const slug = 'image-crop';
const category = 'image' as const;
const title = 'Image Cropper';
const description =
  'Crop images to a specific region by setting position and dimensions — entirely in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Crop an image to a rectangular region defined by position and size.',
  userProblem: 'I need to crop an image to a specific region without uploading it.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'file', type: 'required', message: 'An image file is required.' },
    { field: 'file', type: 'maxSize', value: MAX_IMAGE_SIZE, message: 'Image must be under 25 MB.' },
    { field: 'file', type: 'format', value: ACCEPTED_IMAGE_TYPES.join(','), message: 'Unsupported image type.' },
    { field: 'width', type: 'custom', value: '1-20000', message: 'Width must be between 1 and 20000.' },
    { field: 'height', type: 'custom', value: '1-20000', message: 'Height must be between 1 and 20000.' },
  ],
  successCriteria: 'A cropped image file is produced with the requested region and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'Image Cropper — Crop Images Online Free',
    description:
      'Crop images to exact pixel regions by setting position and size. Runs locally in your browser. No upload, no account.',
    keywords: ['image cropper', 'crop image', 'crop png', 'crop jpg', 'image region'],
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
      ['How do I specify the crop region?', 'Set the X and Y of the top-left corner, plus width and height in pixels.'],
      ['What image formats are supported?', 'PNG, JPEG, WebP, GIF, BMP, and SVG.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['image-resize', 'image-compress', 'image-rotate', 'image-format-convert'],
  analytics: {
    events: [{ name: 'crop_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
