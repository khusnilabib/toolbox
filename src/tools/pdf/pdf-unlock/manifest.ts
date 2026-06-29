// src/tools/pdf/pdf-unlock/manifest.ts

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
  password: z.string().min(1, { message: 'A password is required.' }),
});

const outputSchema = z.object({
  blob: z.instanceof(Blob),
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

const slug = 'pdf-unlock';
const category = 'pdf' as const;
const title = 'PDF Unlocker';
const description =
  'Remove password protection from a PDF — coming soon. Currently in development due to library limitations.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'development',
  version: '0.1.0',
  purpose: 'Remove password protection from an encrypted PDF using the correct password.',
  userProblem: 'I have a password-protected PDF and want to remove the restriction for my own use.',
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
    { field: 'password', type: 'required', message: 'A password is required.' },
  ],
  successCriteria: 'An unlocked (decrypted) PDF file is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'PDF Unlocker — Remove PDF Password Online',
    description:
      'Remove password protection from a PDF. In development — pdf-lib cannot decrypt PDFs; a WASM-based engine is planned.',
    keywords: ['pdf unlocker', 'remove pdf password', 'decrypt pdf', 'unlock pdf', 'pdf password remover'],
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
      ['Is this tool available yet?', 'Not yet. It is in development due to decryption limitations in pdf-lib.'],
      ['Can I unlock a PDF without knowing the password?', 'No. You must provide the correct password to legally remove protection from your own document.'],
      ['Is my PDF uploaded to a server?', 'No. When released, decryption will run entirely in your browser.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['pdf-protect', 'pdf-merge', 'pdf-split', 'pdf-rotate'],
  analytics: {
    events: [{ name: 'pdf_unlock_attempted', trigger: 'on processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
