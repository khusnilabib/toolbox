// src/shared/lib/manifest-helpers.ts — Shared helpers for building tool manifests (EC-03 reuse).

import type { z } from 'zod';
import type {
  BreadcrumbItem,
  EmptyState,
  FAQItem,
  FailureState,
  LoadingState,
  ToolError,
  ToolLimits,
} from '@packages/types';
import { siteConfig } from '@/shared/config/site-config';

export const SITE_BASE = siteConfig.url;

export function buildCanonical(category: string, slug: string): string {
  return `${SITE_BASE}/tools/${category}/${slug}`;
}

export function buildToolBreadcrumb(category: string, slug: string, title: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: SITE_BASE },
    { name: category.charAt(0).toUpperCase() + category.slice(1), url: `${SITE_BASE}/tools/${category}` },
    { name: title, url: buildCanonical(category, slug) },
  ];
}

export function buildOgImage(_category: string, _slug: string): string {
  return `${SITE_BASE}/og-default.svg`;
}

export const DEFAULT_LIMITS: ToolLimits = {
  maxInputSize: 50 * 1024 * 1024,
  maxOutputSize: 100 * 1024 * 1024,
  maxProcessingTime: 60_000,
  requiresAuth: false,
  premiumOnly: false,
};

export const DEFAULT_FUNNEL_STEPS = [
  'tool_viewed',
  'tool_started',
  'processing_completed',
  'download_completed',
];

export const DEFAULT_EMPTY_STATES: EmptyState[] = [
  {
    scenario: 'no_input',
    title: 'No input yet',
    description: 'Provide your input to see the result here.',
  },
];

export const DEFAULT_LOADING_STATES: LoadingState[] = [
  {
    scenario: 'processing',
    title: 'Processing…',
    description: 'Your input is being processed locally in your browser.',
    estimatedDuration: 2000,
  },
];

export const DEFAULT_FAILURE_STATES: FailureState[] = [
  {
    kind: 'validation',
    cause: 'invalid_input',
    userMessage: {
      what: 'Some of the information you provided is not valid.',
      howToFix: 'Please review the highlighted fields and try again.',
    },
  },
  {
    kind: 'processing',
    cause: 'processing_error',
    userMessage: {
      what: 'We could not process your request.',
      howToFix: 'Please try again. If the problem persists, refresh the page.',
    },
  },
];

/**
 * Map a Zod error to an array of ToolError objects (PC-08).
 */
export function mapZodErrors(error: z.ZodError): ToolError[] {
  return error.issues.map((issue) => ({
    kind: 'validation',
    cause: issue.code,
    field: String(issue.path.join('.') || 'unknown'),
    userMessage: {
      what: `Invalid value for "${issue.path.join('.') || 'input'}".`,
      why: issue.message,
      howToFix: 'Please correct the highlighted field and try again.',
    },
  }));
}

export function makeFaq(items: Array<[string, string]>): FAQItem[] {
  return items.map(([question, answer]) => ({ question, answer }));
}
