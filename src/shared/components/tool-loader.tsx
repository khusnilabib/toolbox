'use client';

import { Loading } from '@/shared/components/loading';
import { EmptyState } from '@/shared/components/empty-state';
import { registry } from '@/generated/registry';
import type { ComponentType } from 'react';

/**
 * Dynamic Tool Loader — Per P4.
 * Loads tools from the generated registry at runtime.
 */
export function ToolLoader({ slug }: { slug: string }) {
  const manifest = registry.bySlug(slug);

  if (!manifest) {
    return (
      <EmptyState
        title="Tool not found"
        description={`The tool "${slug}" does not exist in the registry.`}
      />
    );
  }

  // In scaffold phase, tools don't have stage implementations yet.
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-6">
        <h3 className="font-semibold">{manifest.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{manifest.description}</p>
        <div className="mt-4">
          <Loading label="Preparing tool..." />
        </div>
      </div>
    </div>
  );
}

export type ToolComponent = ComponentType<Record<string, unknown>>;
