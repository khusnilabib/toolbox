// src/shared/components/seo-head.tsx — SEO head component (Phase 7 SEO).
// Renders canonical, OpenGraph, Twitter Card, JSON-LD, and other meta tags
// for any page based on a tool manifest or static SEO config.

import type { ReactElement } from 'react';
import type { ToolManifest } from '@packages/types';
import { siteConfig } from '@/shared/config/site-config';
import {
  organizationJsonLd,
  websiteJsonLd,
  toolPageJsonLd,
  serializeJsonLd,
} from '@/shared/lib/json-ld';

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  // For tool pages, pass the manifest to emit SoftwareApplication JSON-LD
  toolManifest?: ToolManifest;
  // For the homepage, emit Organization + WebSite JSON-LD
  homepage?: boolean;
  // OpenGraph image override
  ogImage?: string;
  noIndex?: boolean;
}

export function SeoHead(props: SeoHeadProps): ReactElement {
  const {
    title,
    description,
    canonicalUrl,
    keywords = [],
    toolManifest,
    homepage = false,
    ogImage,
    noIndex = false,
  } = props;

  const canonical = canonicalUrl ?? siteConfig.url;
  const image = ogImage ?? `${siteConfig.url}/og-default.svg`;

  // Build JSON-LD blocks
  const jsonLdBlocks: string[] = [];
  if (homepage) {
    jsonLdBlocks.push(serializeJsonLd(organizationJsonLd()));
    jsonLdBlocks.push(serializeJsonLd(websiteJsonLd()));
  }
  if (toolManifest) {
    for (const block of toolPageJsonLd(toolManifest)) {
      jsonLdBlocks.push(serializeJsonLd(block));
    }
  }

  return (
    <>
      {/* Primary meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* OpenGraph */}
      <meta property="og:type" content={toolManifest ? 'article' : 'website'} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Mobile + Icons */}
      <meta name="theme-color" content="#0a0a0a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteConfig.shortName} />

      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title={`${siteConfig.name} — RSS Feed`} href="/feed.xml" />

      {/* Sitemap */}
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

      {/* JSON-LD */}
      {jsonLdBlocks.map((block, idx) => (
        <script
          key={`json-ld-${idx}`}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}
    </>
  );
}
