// src/tools/pdf/pdf-merge/manifest.ts

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
  files: z
    .array(z.instanceof(File))
    .min(2, { message: 'At least 2 PDF files are required to merge.' })
    .max(20, { message: 'A maximum of 20 PDF files can be merged at once.' })
    .refine((files) => files.every((f) => ACCEPTED_PDF_TYPES.includes(f.type)), {
      message: 'All files must be PDFs.',
    }),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
  pageCount: z.number(),
  sizeBytes: z.number(),
  previewUrl: z.string(),
  fileNames: z.array(z.string()),
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

const slug = 'pdf-merge';
const category = 'pdf' as const;
const title = 'PDF Merger';
const description =
  'Merge multiple PDF files into a single document — all in your browser, with no upload required.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Combine two or more PDF files into one combined PDF document.',
  userProblem: 'I need to combine multiple PDF files into one without uploading them to a server.',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'files', type: 'required', message: 'At least 2 PDF files are required.' },
    { field: 'files', type: 'maxSize', value: MAX_PDF_SIZE, message: 'Each PDF must be under 50 MB.' },
    {
      field: 'files',
      type: 'format',
      value: ACCEPTED_PDF_TYPES.join(','),
      message: 'Only PDF files are supported.',
    },
    { field: 'files', type: 'custom', value: '2-20', message: 'Provide between 2 and 20 PDF files.' },
  ],
  successCriteria: 'A single merged PDF file is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'PDF Merger — Combine PDF Files Online Free',
    description:
      'Merge multiple PDF files into one document. Runs locally in your browser. No upload, no account, no watermark.',
    keywords: ['pdf merger', 'merge pdf', 'combine pdf', 'join pdf', 'pdf combiner'],
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
      ['Is my PDF uploaded to a server?', 'No. Files are merged entirely in your browser.'],
      ['How many PDFs can I merge at once?', 'Between 2 and 20 PDF files per merge.'],
      [
        'Does merging preserve bookmarks and forms?',
        'Pages are copied; interactive elements like form fields may not be fully preserved.',
      ],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['pdf-split', 'pdf-rotate', 'pdf-compress', 'pdf-extract-pages'],
  analytics: {
    events: [{ name: 'pdf_merge_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
