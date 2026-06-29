// src/shared/lib/seo.ts — Metadata builders, JSON-LD, sitemap & robots (LOCK-08, DGA-03).

import type { Metadata } from 'next';
import type {
  BreadcrumbItem,
  FAQItem,
  SitemapEntry,
  ToolManifest,
  ToolSEOConfig,
} from '@packages/types';
import { siteConfig } from '@/shared/config/site-config';

/**
 * Build a Next.js Metadata object from a ToolManifest's SEO config.
 */
export function buildMetadata(manifest: ToolManifest): Metadata {
  const seo = manifest.seo;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl },
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: seo.canonicalUrl,
      siteName: siteConfig.name,
      images: [{ url: seo.openGraph.image }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterCard.title,
      description: seo.twitterCard.description,
      images: [seo.twitterCard.image],
    },
  };
}

export function buildHomeMetadata(): Metadata {
  return {
    title: `${siteConfig.name} — ${siteConfig.description}`,
    description: siteConfig.description,
    alternates: { canonical: siteConfig.url },
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
    },
  };
}

export function buildCanonical(path: string): string {
  const base = siteConfig.url.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * JSON-LD SoftwareApplication structured data for a tool.
 */
export function buildSoftwareApplicationJsonLd(manifest: ToolManifest): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    ...manifest.seo.structuredData,
  };
}

/**
 * JSON-LD FAQPage structured data for a tool.
 */
export function buildFaqJsonLd(faq: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * JSON-LD BreadcrumbList structured data.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Combine the structured data blocks for a tool into a single array
 * suitable for embedding as `<script type="application/ld+json">`.
 */
export function buildToolStructuredData(manifest: ToolManifest): Record<string, unknown>[] {
  return [
    buildSoftwareApplicationJsonLd(manifest),
    buildFaqJsonLd(manifest.seo.faq),
    buildBreadcrumbJsonLd(manifest.seo.breadcrumb),
  ];
}

/**
 * Generate sitemap entries from a list of manifests.
 */
export function generateSitemap(manifests: ToolManifest[], lastModified = new Date()): SitemapEntry[] {
  const entries: SitemapEntry[] = [
    {
      url: siteConfig.url,
      lastModified: lastModified.toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
  for (const manifest of manifests) {
    entries.push({
      url: `${siteConfig.url}/tools/${manifest.category}/${manifest.slug}`,
      lastModified: lastModified.toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }
  return entries;
}

/**
 * Generate a robots.txt body for the platform.
 */
export function generateRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
  ].join('\n');
}

/**
 * Helper: extract the SEO config subset for use by the registry codegen.
 */
export function extractSeoMeta(seo: ToolSEOConfig): {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
} {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    canonicalUrl: seo.canonicalUrl,
  };
}
