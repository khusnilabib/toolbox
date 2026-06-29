// src/tools/pdf/pdf-rotate/manifest.ts

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
import { inputStage } from './stages/input';
import { validationStage } from './stages/validation';
import { processingStage } from './stages/processing';
import { previewStage } from './stages/preview';
import { downloadStage } from './stages/download';

export const MAX_PDF_SIZE = 52428800; // 50 MB
export const ACCEPTED_PDF_TYPES = ['application/pdf'];

export const inputSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => ACCEPTED_PDF_TYPES.includes(f.type), { message: 'Only PDF files are supported.' }),
  angle: z.union([z.literal(90), z.literal(180), z.literal(270)]),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
  pageCount: z.number(),
  angle: z.number(),
  previewUrl: z.string(),
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

const slug = 'pdf-rotate';
const category = 'pdf' as const;
const title = 'PDF Rotator';
const description =
  'Rotate every page of a PDF by 90, 180, or 270 degrees — all in your browser, with no upload required.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Rotate all pages of a PDF document by 90°, 180°, or 270°.',
  userProblem: 'I need to fix the orientation of a PDF without uploading it.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'file', type: 'required', message: 'A PDF file is required.' },
    { field: 'file', type: 'maxSize', value: MAX_PDF_SIZE, message: 'PDF must be under 50 MB.' },
    {
      field: 'file',
      type: 'format',
      value: ACCEPTED_PDF_TYPES.join(','),
      message: 'Only PDF files are supported.',
    },
    { field: 'angle', type: 'custom', value: '90|180|270', message: 'Angle must be 90, 180, or 270.' },
  ],
  successCriteria: 'A rotated PDF file is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'PDF Rotator — Rotate PDF Pages Online Free',
    description:
      'Rotate all pages of a PDF by 90, 180, or 270 degrees. Runs locally in your browser. No upload, no account.',
    keywords: ['pdf rotator', 'rotate pdf', 'rotate pdf pages', 'pdf rotation', 'turn pdf'],
    canonicalUrl: buildCanonical(category, slug),
    openGraph: { title, description, image: buildOgImage(category, slug), type: 'website' },
    twitterCard: { card: 'summary_large_image', title, description, image: buildOgImage(category, slug) },
    structuredData: {
      '@type': 'SoftwareApplication',
      name: title,
      applicationCategory: 'DocumentManagement',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    faq: makeFaq([
      ['Is my PDF uploaded to a server?', 'No. The PDF is rotated entirely in your browser.'],
      ['Are all pages rotated, or just some?', 'Every page in the document is rotated by the chosen angle.'],
      ['Can I rotate by a custom angle like 45°?', 'This tool supports right-angle rotations (90/180/270) to avoid distorting pages.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-extract-pages'],
  analytics: {
    events: [{ name: 'pdf_rotate_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
