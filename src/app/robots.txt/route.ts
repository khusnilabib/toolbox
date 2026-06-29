// src/app/robots.txt/route.ts — Dynamic robots.txt (Phase 7 SEO).
import { NextResponse } from 'next/server';
import { siteConfig } from '@/shared/config/site-config';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const text = `# robots.txt — Browser-First Productivity Ecosystem
# Generated dynamically at ${new Date().toISOString()}

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard
Disallow: /login
Disallow: /register

# Block AI training crawlers (optional — uncomment to opt out)
# User-agent: GPTBot
# Disallow: /
# User-agent: CCBot
# Disallow: /
# User-agent: anthropic-ai
# Disallow: /

# Allow indexing of tool pages
Allow: /tools/

# Sitemap
Sitemap: ${siteConfig.url}/sitemap.xml

# Host
Host: ${new URL(siteConfig.url).host}
`;

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
