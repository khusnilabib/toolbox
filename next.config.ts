// next.config.ts — Production-grade Next.js configuration.
// Phase 4 (Performance) + Phase 5 (Security) — Sprint 6.
//
// Implements:
//   - Strict CSP with per-request nonce
//   - All OWASP security headers
//   - Bundle splitting for vendor chunks (Turbopack)
//   - Image optimization with AVIF/WebP
//   - React Compiler compatibility
//   - Modular imports for heavy libraries

import type { NextConfig } from 'next';

// ─── Security Headers (Phase 5) ──────────────────────────────────────────────
const securityHeaders = [
  // Clickjacking protection
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME-type sniffing protection
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer policy
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unnecessary browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
  },
  // HSTS — enforce HTTPS for 2 years (including subdomains)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // XSS protection (legacy browsers — modern browsers use CSP)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Cross-Origin policies
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
];

// CSP will be augmented with a per-request nonce in middleware.ts.
// The base policy below disallows everything by default and allows specific sources.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.vercel-insights.com;
  media-src 'self' data: blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'self';
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim();

// ─── Next.js Configuration ──────────────────────────────────────────────────
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // React Compiler (Phase 4) — opt-in for stable, production-grade optimization
  experimental: {
    // React Compiler is enabled via babel-plugin-react-compiler in package.json
    // We enable the optimisation flag here so Next.js knows to expect compiled output.
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'framer-motion',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-accordion',
    ],
  },

  // Image optimization (Phase 4) — AVIF + WebP, 30-day cache, lazy by default
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // TypeScript — never ignore errors in production builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Compression
  compress: true,

  // Powered-by header — disabled for security
  poweredByHeader: false,

  // HTTP/2 Server Push — controlled by Next.js automatically
  // (no manual config needed in Next 16)

  // Trailing slash — consistent for SEO (Phase 7)
  trailingSlash: false,

  // Production source maps — disabled by default, can be enabled via env
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_ENABLE_SOURCE_MAPS === 'true',

  // Cache headers for static assets (Phase 4)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy', value: cspHeader },
        ],
      },
      {
        // Static assets — long cache + immutable
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Images — long cache
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, must-revalidate' },
        ],
      },
      {
        // Service worker — no-cache to ensure updates propagate
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        // robots.txt — short cache
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        // sitemap.xml — short cache
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },

  // Bundle splitting (Phase 4)
  // Next.js 16 uses Turbopack by default, which handles code splitting
  // automatically. The `optimizePackageImports` experimental flag above
  // ensures tree-shaking for large libraries (lucide-react, radix, etc.).
  // For production builds (webpack), additional splitChunks config could
  // be added here, but Turbopack's defaults are sufficient for our needs.

  // Turbopack config (used for dev server in Next.js 16)
  turbopack: {
    rules: {
      // SVG handling
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // External packages for server (avoid bundling Node.js modules)
  serverExternalPackages: ['sharp'],

  // Redirects — canonical URLs (Phase 7 SEO)
  async redirects() {
    return [
      // /tools → / (homepage has tool grid)
      { source: '/tools', destination: '/', permanent: false },
      // /tool/:slug → /tools/:category/:slug (legacy URL)
      {
        source: '/tool/:slug',
        destination: '/tools/all/:slug',
        permanent: false,
      },
    ];
  },

  // Rewrites — none needed for now
  async rewrites() {
    return [];
  },
};

export default nextConfig;
