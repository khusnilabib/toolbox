// src/app/feed.xml/route.ts — RSS feed (Phase 7 SEO).
// Provides an RSS feed of newly added tools and updates.

import { NextResponse } from 'next/server';
import { allManifests } from '@/generated/registry';
import { siteConfig } from '@/shared/config/site-config';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const now = new Date().toISOString();

  const items = allManifests
    .map((m) => `    <item>
      <title>${escapeXml(m.title)}</title>
      <link>${siteConfig.url}/tools/${m.category}/${m.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/tools/${m.category}/${m.slug}</guid>
      <description>${escapeXml(m.description)}</description>
      <category>${escapeXml(m.category)}</category>
      <pubDate>${now}</pubDate>
    </item>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} — New Tools</title>
    <link>${siteConfig.url}</link>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Latest tools added to the browser-first productivity ecosystem.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>Next.js 16</generator>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
