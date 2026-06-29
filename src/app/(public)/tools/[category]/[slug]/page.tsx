// src/app/(public)/tools/[category]/[slug]/page.tsx — Dynamic tool page (AD-06).

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ToolLayout } from '@/shared/components/tool-layout';
import { allManifests, registry } from '@/generated/registry';
import { buildMetadata } from '@/shared/lib/seo';
import { ToolRuntime } from './tool-runtime';
import { categories } from '@/shared/config/categories';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

/**
 * Pre-render every known tool page at build time (AD-06).
 */
export async function generateStaticParams() {
  return allManifests.map((m) => ({ category: m.category, slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const manifest = registry.byCategory(category).find((m) => m.slug === slug);
  if (!manifest) return {};
  return buildMetadata(manifest);
}

export default async function ToolPage({ params }: PageProps) {
  const { category, slug } = await params;
  // Validate category against the canonical list.
  if (!categories.some((c) => c.slug === category)) {
    notFound();
  }
  const manifest = registry.byCategory(category).find((m) => m.slug === slug);
  if (!manifest) {
    notFound();
  }
  const related = registry.relatedTo(slug);

  return (
    <ToolLayout manifest={manifest} related={related}>
      <ToolRuntime category={category} slug={slug} />
    </ToolLayout>
  );
}
