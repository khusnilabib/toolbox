// src/tools/pdf/pdf-compress/manifest.ts

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
  quality: z.number().int().min(1).max(100),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
  originalSize: z.number(),
  compressedSize: z.number(),
  compressionRatio: z.number(),
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

const slug = 'pdf-compress';
const category = 'pdf' as const;
const title = 'PDF Compressor';
const description =
  'Compress a PDF by re-saving it with packed object streams — all in your browser, with no upload required.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Reduce the file size of a PDF by re-saving it with compressed object streams.',
  userProblem: 'I need to make a PDF file smaller for email or web upload without uploading it.',
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
    { field: 'quality', type: 'custom', value: '1-100', message: 'Quality must be between 1 and 100.' },
  ],
  successCriteria: 'A smaller (or re-packed) PDF file is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'PDF Compressor — Reduce PDF File Size Online Free',
    description:
      'Compress PDF files by re-packing object streams. Runs locally in your browser. No upload, no account.',
    keywords: ['pdf compressor', 'compress pdf', 'reduce pdf size', 'pdf optimizer', 'shrink pdf'],
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
      ['Is my PDF uploaded to a server?', 'No. The PDF is compressed entirely in your browser.'],
      [
        'How much can I expect the file to shrink?',
        'Results vary. Re-packing object streams often helps; already-compressed PDFs may not shrink much.',
      ],
      [
        'Does the quality slider affect the output?',
        'pdf-lib performs lossless re-saving. The slider is accepted for API symmetry but does not lossily recompress images.',
      ],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['pdf-merge', 'pdf-split', 'pdf-rotate', 'pdf-extract-pages'],
  analytics: {
    events: [{ name: 'pdf_compress_completed', trigger: 'after processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
