# 45 — AI Tool Template

> **Purpose:** Canonical implementation template for every tool. AI can implement a new tool with minimal prompting by following this template.
> **Last Updated:** 2026-06-28 · **Revision:** 1.0.0

---

## 1. Folder Structure

```
src/tools/[category]/[slug]/
├── manifest.ts              # MANDATORY — ToolManifest (aggregate root)
├── index.ts                 # MANDATORY — re-exports manifest
├── stages/
│   ├── input.ts             # MANDATORY — InputStage
│   ├── validation.ts        # MANDATORY — ValidationStage (Zod)
│   ├── processing.ts        # MANDATORY — ProcessingStage (browser or server)
│   ├── preview.tsx          # MANDATORY — PreviewStage (React component)
│   ├── download.ts          # MANDATORY — DownloadStage
│   ├── history.ts           # OPTIONAL — HistoryStage
│   └── share.ts             # OPTIONAL — ShareStage
├── components/              # OPTIONAL — tool-specific UI
│   ├── InputForm.tsx
│   ├── ProcessingProgress.tsx
│   └── ResultDisplay.tsx
├── hooks/                   # OPTIONAL — tool-specific hooks
├── lib/                     # OPTIONAL — tool-specific pure utils
├── tests/
│   ├── stages.test.ts       # MANDATORY — unit tests per stage
│   ├── e2e.test.ts          # MANDATORY — E2E test
│   └── accessibility.test.ts # MANDATORY — axe-core test
└── README.md                # MANDATORY for complex tools
```

## 2. Manifest Template

```typescript
// src/tools/[category]/[slug]/manifest.ts
import { z } from 'zod';
import type { ToolManifest } from '@packages/tool-engine';
import { inputStage } from './stages/input';
import { validationStage } from './stages/validation';
import { processingStage } from './stages/processing';
import { Preview } from './stages/preview';
import { downloadStage } from './stages/download';

const inputSchema = z.object({
  // Define input fields with validation
  file: z.instanceof(File),
  // ... other fields
});

const outputSchema = z.object({
  // Define output fields
  blob: z.instanceof(Blob),
  // ... other fields
});

export const manifest: ToolManifest = {
  // Identity
  manifestVersion: '1.0.0',
  slug: '[slug]',
  category: '[category]',
  title: '[Tool Name]',
  description: '[50-160 char SEO description]',
  lifecycle: 'development', // concept|planned|design|development|testing|beta|stable|deprecated|archived
  version: '1.0.0',

  // Product Contract (PC-02)
  purpose: '[One sentence: what the tool does]',
  userProblem: '[The problem the user is solving]',
  inputSchema,
  outputSchema,
  validationRules: [
    { field: 'file', type: 'required', message: '[user-facing message]' },
    { field: 'file', type: 'maxSize', value: 10485760, message: 'File must be under 10MB.' },
  ],
  successCriteria: '[What constitutes success]',
  failureStates: [
    {
      kind: 'validation',
      cause: 'file_too_large',
      userMessage: {
        what: '[What happened in plain language]',
        why: '[Why it happened]',
        howToFix: '[Actionable guidance to fix it]',
      },
    },
  ],
  emptyStates: [
    { scenario: 'no_input', title: '[Title]', description: '[Description]', cta: { label: '[Label]', action: 'upload' } },
  ],
  loadingStates: [
    { scenario: 'processing', title: '[Title]', description: '[Description]', estimatedDuration: 800 },
  ],

  // Execution (LOCK-02)
  execution: 'browser', // or 'server' — justify if server
  stages: {
    input: inputStage,
    validation: validationStage,
    processing: processingStage,
    preview: Preview,
    download: downloadStage,
    // history: historyStage,  // optional
    // share: shareStage,      // optional
  },

  // SEO (LOCK-08, DGA-03)
  seo: {
    searchIntent: 'transactional',
    title: '[50-60 char SEO title]',
    description: '[150-160 char meta description]',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    canonicalUrl: 'https://example.com/tools/[category]/[slug]',
    openGraph: {
      title: '[OG title]',
      description: '[OG description]',
      image: 'https://example.com/og/[slug].png',
      type: 'website',
    },
    twitterCard: {
      card: 'summary_large_image',
      title: '[Twitter title]',
      description: '[Twitter description]',
      image: 'https://example.com/og/[slug].png',
    },
    structuredData: {
      '@type': 'SoftwareApplication',
      name: '[Tool Name]',
      applicationCategory: '[Category]',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    faq: [
      { question: '[Q1]', answer: '[A1]' },
      { question: '[Q2]', answer: '[A2]' },
      { question: '[Q3]', answer: '[A3]' },
    ],
    breadcrumb: [
      { name: 'Home', url: 'https://example.com' },
      { name: '[Category] Tools', url: 'https://example.com/tools/[category]' },
      { name: '[Tool Name]', url: 'https://example.com/tools/[category]/[slug]' },
    ],
  },

  // Discoverability (PC-09)
  relatedTools: ['[related-slug-1]', '[related-slug-2]', '[related-slug-3]'],

  // Analytics (PC-07)
  analytics: {
    events: [
      // Tool-specific custom events (beyond standard 10)
    ],
    funnelSteps: ['tool_viewed', 'tool_started', 'processing_completed', 'download_completed'],
  },

  // Limits
  limits: {
    maxInputSize: 10485760,  // 10MB
    maxOutputSize: 10485760,
    maxProcessingTime: 30000,  // 30s
    requiresAuth: false,  // LOCK-07: usually false
    premiumOnly: false,   // PC-06: core must be free
  },
};

export default manifest;
```

## 3. Stage Templates

### 3.1 Input Stage

```typescript
// stages/input.ts
import type { InputStage } from '@packages/tool-engine';

export const inputStage: InputStage<TInput> = async (context) => {
  // Accept raw input from user (file, text, params)
  // Return structured input object
  // No validation here — that's validation stage
};
```

### 3.2 Validation Stage

```typescript
// stages/validation.ts
import { inputSchema } from '../manifest';
import type { ValidationStage } from '@packages/tool-engine';

export const validationStage: ValidationStage<TInput> = (input, context) => {
  const result = inputSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
};
```

### 3.3 Processing Stage

```typescript
// stages/processing.ts
import type { ProcessingStage } from '@packages/tool-engine';

export const processingStage: ProcessingStage<TInput, TOutput> = async (input, context) => {
  // Core tool logic
  // Browser-side: use Canvas, Web Crypto, etc.
  // Server-side: call API route
  // Respect context.signal for cancellation
  // Return output matching outputSchema
};
```

### 3.4 Preview Stage

```typescript
// stages/preview.tsx
import type { PreviewStageProps } from '@packages/tool-engine';

export function Preview({ output, onAccept, onReject }: PreviewStageProps<TOutput>) {
  return (
    <div>
      {/* Render output for user inspection */}
      <button onClick={onAccept}>Download</button>
      <button onClick={onReject}>Modify</button>
    </div>
  );
}
```

### 3.5 Download Stage

```typescript
// stages/download.ts
import type { DownloadStage } from '@packages/tool-engine';

export const downloadStage: DownloadStage<TOutput> = async (output, context) => {
  return {
    kind: 'file',
    blob: output.blob,
    filename: `[slug]-output.${output.format}`,
    mimeType: output.mimeType,
  };
};
```

## 4. Test Templates

### 4.1 Stage Unit Tests

```typescript
// tests/stages.test.ts
import { describe, it, expect } from 'vitest';
import { processingStage } from '../stages/processing';

describe('[Tool Name] processing stage', () => {
  it('produces correct output for valid input', async () => {
    const input = { /* mock input */ };
    const output = await processingStage(input, mockContext);
    expect(output).toMatchObject({ /* expected output */ });
  });

  it('handles edge case', async () => {
    // Test edge case
  });
});
```

### 4.2 E2E Test

```typescript
// tests/e2e.test.ts
import { test, expect } from '@playwright/test';

test('user can use [tool name]', async ({ page }) => {
  await page.goto('/tools/[category]/[slug]');
  // Upload file / enter input
  // Click process
  // Verify preview
  // Click download
  // Verify download
});
```

## 5. Definition of Done Checklist (PC-03)

- [ ] Upload/Input implemented
- [ ] Validation implemented (Zod)
- [ ] Processing stage implemented
- [ ] Preview component implemented
- [ ] Download/Copy implemented
- [ ] Error Handling (PC-08: what/why/how)
- [ ] Success Feedback (toast)
- [ ] Accessibility (WCAG AA, keyboard, screen reader, reduced motion)
- [ ] Mobile Support (360px, 44px touch targets)
- [ ] SEO (all manifest.seo fields, JSON-LD valid)
- [ ] Analytics (all events emitting)
- [ ] Documentation (README, manifest accurate)
- [ ] Tests (unit + E2E + accessibility)

## 6. Common Mistakes

1. **Hardcoding SEO in page** → Use manifest.seo field. (DGA-03)
2. **Using `any` type** → Use `unknown` + Zod narrowing. (EC-08)
3. **Not lazy-loading tool code** → Use dynamic import. (EC-07)
4. **Forgetting PC-08 error format** → Every error: what/why/how. No stack traces.
5. **Duplicate component** → Search @packages/ui first. (EC-03)
6. **Missing related tools** → Min 3 in manifest. (PC-09)
7. **Missing FAQ** → Min 3 in manifest. (LOCK-08)
8. **Requiring auth for core workflow** → Guest can complete. (LOCK-07)
9. **Not testing accessibility** → axe-core test required. (EC-06)
10. **Skipping documentation** → Update README + docs in same PR. (EC-01)
