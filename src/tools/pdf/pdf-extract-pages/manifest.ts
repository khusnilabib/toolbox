// src/tools/pdf/pdf-extract-pages/manifest.ts

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
  pageRange: z
    .string()
    .min(1, { message: 'A page range is required.' })
    .refine((v) => v.trim().length > 0, { message: 'Page range cannot be empty.' }),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
  extractedCount: z.number(),
  pageRange: z.string(),
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

const slug = 'pdf-extract-pages';
const category = 'pdf' as const;
const title = 'PDF Page Extractor';
const description =
  'Extract specific pages from a PDF by range and save them as a new document — all in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Extract a selection of pages from a PDF into a new PDF document.',
  userProblem: 'I need to pull specific pages out of a PDF without uploading it.',
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
    {
      field: 'pageRange',
      type: 'custom',
      value: 'e.g. 1-3, 5, 8-10',
      message: 'Use a valid page range such as "1-3, 5, 8-10".',
    },
  ],
  successCriteria: 'A new PDF containing the extracted pages is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'PDF Page Extractor — Extract PDF Pages Online Free',
    description:
      'Extract specific pages from a PDF by range and save them as a new document. Runs locally in your browser.',
    keywords: ['extract pdf pages', 'pdf page extractor', 'pull pdf pages', 'pdf extract', 'pdf pages'],
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
      ['Is my PDF uploaded to a server?', 'No. Pages are extracted entirely in your browser.'],
      ['How do I specify which pages to extract?', 'Use a range like "1-3, 5, 8-10" (1-based, inclusive).'],
      ['Does extraction preserve the original file?', 'Yes. The original PDF is untouched; a new file is produced.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['pdf-split', 'pdf-merge', 'pdf-rotate', 'pdf-compress'],
  analytics: {
    events: [{ name: 'pdf_extract_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
