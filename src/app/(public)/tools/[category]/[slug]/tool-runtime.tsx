// src/app/(public)/tools/[category]/[slug]/tool-runtime.tsx — Client runtime for the dynamic tool page.
//
// Delegates to the shared, manifest-driven ToolRuntime (Phase 3) so every tool
// page gets the same input-form generation, processing lifecycle, preview,
// download, error/retry, analytics, and recent-tools tracking.

'use client';

export { ToolRuntime as default } from '@/shared/components/tool-runtime';
export { ToolRuntime } from '@/shared/components/tool-runtime';
