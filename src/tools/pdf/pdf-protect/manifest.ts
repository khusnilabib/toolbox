// src/tools/pdf/pdf-protect/manifest.ts

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

const slug = 'pdf-protect';
const category = 'pdf' as const;
const title = 'PDF Protector';
const description =
  'Add AES-256 password protection to a PDF locally in your browser.';

export const manifest: ToolManifest = {
  manifestVersion: '1.0.0',
  slug,
  category,
  title,
  description,
  lifecycle: 'stable',
  version: '1.0.0',
  purpose: 'Encrypt a PDF with a password to restrict opening and permissions.',
  userProblem: 'I need to password-protect a PDF before sharing it.',
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
  successCriteria: 'A password-protected PDF file is produced and downloadable.',
  failureStates: DEFAULT_FAILURE_STATES,
  emptyStates: DEFAULT_EMPTY_STATES,
  loadingStates: DEFAULT_LOADING_STATES,
  execution: 'browser',
  stages,
  seo: {
    searchIntent: 'transactional',
    title: 'PDF Protector — Password Protect PDF Online',
    description:
      'Add AES-256 password protection to a PDF locally in your browser. Your document is never uploaded.',
    keywords: ['pdf protector', 'password protect pdf', 'encrypt pdf', 'secure pdf', 'pdf password'],
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
      ['How is my PDF protected?', 'The tool applies standards-compliant AES-256 encryption using qpdf compiled to WebAssembly.'],
      ['Is my PDF uploaded to a server?', 'No. Encryption runs entirely in your browser.'],
      ['Can the password be recovered?', 'No. Keep the password safe because this tool does not store or recover it.'],
    ]),
    breadcrumb: buildToolBreadcrumb(category, slug, title),
  },
  relatedTools: ['pdf-unlock', 'pdf-merge', 'pdf-split', 'pdf-compress'],
  analytics: {
    events: [{ name: 'pdf_protect_attempted', trigger: 'on processing' }],
    funnelSteps: DEFAULT_FUNNEL_STEPS,
  },
  limits: DEFAULT_LIMITS,
};

export default manifest;
