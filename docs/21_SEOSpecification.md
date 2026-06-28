# 21 — SEO Specification

> **Status:** 🟢 Approved
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** LOCK-08 (SEO Constitution), DGA-03 (SEO Metadata as Structured Data), PC-09 (Feature Discoverability), PC-10 (Product Scalability)

---

## 1. Purpose

This SEO Specification defines **how SEO is implemented across [PROJECT_NAME]** — from manifest-driven metadata generation to structured data, sitemaps, and internal linking. It implements LOCK-08 (SEO Constitution), DGA-03 (SEO Metadata as Structured Data — manifest is canonical source), and supports PC-09 (Feature Discoverability via internal linking) and PC-10 (Product Scalability — metadata-first).

SEO is the primary acquisition channel through Phase 2 (`01_BRD` §6.1). Without a structured SEO architecture, the platform can't compete for search traffic. This document ensures every tool page is a fully-optimized landing page, with metadata generated from the Tool Manifest (not hardcoded), structured data for rich snippets, sitemaps for crawlability, and internal linking for authority flow.

The key architectural commitment is **manifest-driven SEO** (DGA-03): all SEO metadata originates from the Tool Manifest, is consumed by build-time codegen, and is rendered as static HTML. No runtime SEO computation, no hardcoded metadata in components, no drift between manifest and page.

## 2. Scope

### 2.1 In Scope

- SEO metadata fields per tool page.
- Tool Manifest SEO field structure (reference to `12_ToolManifestSpecification`).
- Build-time SEO metadata generation.
- JSON-LD structured data (SoftwareApplication, FAQPage, BreadcrumbList).
- Open Graph and Twitter Card tags.
- Canonical URLs.
- Sitemap generation.
- robots.txt configuration.
- Internal linking strategy.
- SEO analytics and monitoring.

### 2.2 Out of Scope

- Tool Manifest schema (full) → `12_ToolManifestSpecification`.
- Build-time codegen pattern → `05_ProjectStructure` AD-04.
- Content Context articles SEO → `19_DatabaseDesign` §Content.
- Analytics events for SEO → `16_EventSchemaSpecification`.
- Admin SEO management → `24_AdminSpecification`.

## 3. Architectural Decisions

### AD-01 — Manifest is Canonical Source for All SEO (DGA-03)

**Context.** SEO metadata is often scattered: title in component, description in config, structured data in a separate file. This leads to inconsistency and stale metadata.

**Decision.** The Tool Manifest's `seo` field is the single source of truth for all SEO metadata. No SEO values are hardcoded in pages. Build-time codegen (`05_ProjectStructure` AD-04) consumes the manifest and generates per-route SEO metadata, injected into HTML at SSR time.

**Implements:** DGA-03, LOCK-08, PC-10, EC-02 (One Source of Truth).

### AD-02 — Structured Data via JSON-LD

**Context.** Structured data helps search engines understand page content. Three formats exist: Microdata, RDFa, JSON-LD. Google recommends JSON-LD.

**Decision.** All structured data uses JSON-LD format, injected via `<script type="application/ld+json">` in page head. Three schema types per tool page:
- `SoftwareApplication` — describes the tool.
- `FAQPage` — lists FAQ Q&As.
- `BreadcrumbList` — navigation hierarchy.

**Implements:** LOCK-08, DGA-03.

### AD-03 — Sitemap Generated from Manifest

**Context.** Sitemaps must be kept up-to-date as tools are added/removed. Manual sitemaps go stale.

**Decision.** Sitemap is generated at build time from the tool registry (which is generated from manifests). Sitemap includes all `stable` and `beta` tools, category pages, and content articles. Submitted to Google Search Console and Bing Webmaster Tools.

**Implements:** LOCK-08, PC-10 (metadata-first), DGA-03.

### AD-04 — Internal Linking via Related Tools (PC-09)

**Context.** Internal linking strengthens SEO authority flow and keeps users in the ecosystem. Without structured related tools, linking is ad hoc.

**Decision.** Every tool page links to its `relatedTools` (declared in manifest). Codegen generates bidirectional links. Category pages link to all tools in category. Articles link to relevant tools. This creates a dense internal linking graph.

**Implements:** PC-09, LOCK-08, DGA-03.

### AD-05 — Canonical URLs Prevent Duplication

**Context.** Duplicate content (same page accessible via multiple URLs) hurts SEO. Without canonical URLs, search engines may index wrong version.

**Decision.** Every page has a canonical URL declared in manifest (`seo.canonicalUrl`) and rendered as `<link rel="canonical">`. No trailing slashes (consistent). No query parameters in canonical (except for pagination, which uses `rel="prev"`/`rel="next"`).

**Implements:** LOCK-08.

### AD-06 — SSR for SEO-Critical Pages

**Context.** Client-side rendered pages are poorly indexed by search engines (despite improvements, SSR is more reliable).

**Decision.** All tool pages, category pages, and content articles are server-side rendered (SSR) or statically generated (SSG). Next.js App Router handles this via Server Components. No client-only rendering for SEO-critical content.

**Implements:** LOCK-08, EC-07 (Performance Budget — SSR also faster for users).

## 4. Design Principles

### P1 — Manifest is Canonical
All SEO originates from the manifest. No hardcoded SEO anywhere.

### P2 — Structured Data Everywhere
Every page has JSON-LD structured data for rich snippets.

### P3 — Build-Time Generation
SEO metadata generated at build time, not runtime. Fast, consistent, never stale.

### P4 — Internal Linking is Mandatory
Every tool links to related tools. Every category links to its tools. Articles link to tools.

### P5 — SSR for Indexability
SEO-critical pages are server-rendered. No client-only rendering for content.

### P6 — Performance is SEO
Core Web Vitals are ranking signals. SEO budget aligns with performance budget (EC-07).

## 5. SEO Metadata Fields (Per Tool Page)

Every tool page's SEO is defined by the manifest's `seo` field (per `12_ToolManifestSpecification` §6.4):

### 5.1 Title Tag

- **Field:** `seo.title`
- **Length:** 50-60 characters (Google truncates at ~60).
- **Format:** `[Tool Name] - [Benefit] | [PROJECT_NAME]`
- **Example:** `Image Resizer - Free Online Image Resize Tool | [PROJECT_NAME]`

### 5.2 Meta Description

- **Field:** `seo.description`
- **Length:** 150-160 characters.
- **Content:** Action-oriented, includes primary keyword, mentions "free" and "private" where applicable.
- **Example:** `Resize PNG, JPEG, and WebP images to any dimensions. Free, private, browser-based. No upload required. Try our fast image resizer.`

### 5.3 Keywords

- **Field:** `seo.keywords`
- **Count:** 3-10 keywords.
- **Note:** Meta keywords tag is ignored by Google but used by some search engines and internal search.

### 5.4 Canonical URL

- **Field:** `seo.canonicalUrl`
- **Format:** Full URL, no trailing slash, no query params.
- **Example:** `https://example.com/tools/image/image-resize`

### 5.5 Open Graph

- **Fields:** `seo.openGraph.{title, description, image, type}`
- **Image:** 1200x630px, under 1MB.
- **Example:**
  ```json
  {
    "title": "Image Resizer - Free & Private",
    "description": "Resize images in your browser. No upload required.",
    "image": "https://example.com/og/image-resize.png",
    "type": "website"
  }
  ```

### 5.6 Twitter Card

- **Fields:** `seo.twitterCard.{card, title, description, image}`
- **Card type:** `summary_large_image` for tools.
- **Example:**
  ```json
  {
    "card": "summary_large_image",
    "title": "Image Resizer - Free & Private",
    "description": "Resize images in your browser. No upload required.",
    "image": "https://example.com/og/image-resize.png"
  }
  ```

### 5.7 Structured Data (JSON-LD)

Three JSON-LD blocks per tool page:

#### SoftwareApplication

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Image Resizer",
  "applicationCategory": "ImageProcessing",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": 1247
  }
}
```

#### FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this image resizer free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, completely free with no registration required."
      }
    },
    {
      "@type": "Question",
      "name": "Are my images uploaded to a server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. All processing happens in your browser. Your images never leave your device."
      }
    }
  ]
}
```

#### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Image Tools",
      "item": "https://example.com/tools/image"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Image Resizer",
      "item": "https://example.com/tools/image/image-resize"
    }
  ]
}
```

### 5.8 FAQ

- **Field:** `seo.faq`
- **Count:** Minimum 3 Q&As (per LOCK-08).
- **Content:** Real questions users have; not fabricated.
- **Used for:** FAQ rich snippets in search results; FAQPage structured data.

### 5.9 Breadcrumb

- **Field:** `seo.breadcrumb`
- **Count:** Minimum 2 items (Home → Category → Tool).
- **Used for:** Breadcrumb rich snippets; BreadcrumbList structured data; visual breadcrumb in page.

### 5.10 Search Intent

- **Field:** `seo.searchIntent`
- **Values:** `informational` | `transactional` | `navigational`.
- **Used for:** Content strategy; SEO monitoring; analytics segmentation.
- **Tools are typically `transactional`** (user wants to DO something).

## 6. Build-Time SEO Generation

### 6.1 Codegen Script

The `scripts/generate-registry.ts` script (per `05_ProjectStructure` AD-04) generates `src/generated/seo-meta.ts`:

```typescript
// src/generated/seo-meta.ts (AUTO-GENERATED)

export const seoMeta: Record<string, SEOConfig> = {
  '/tools/image/image-resize': {
    title: 'Image Resizer - Free Online Image Resize Tool | [PROJECT_NAME]',
    description: 'Resize PNG, JPEG, and WebP images to any dimensions...',
    canonicalUrl: 'https://example.com/tools/image/image-resize',
    openGraph: { /* ... */ },
    twitterCard: { /* ... */ },
    structuredData: [/* SoftwareApplication, FAQPage, BreadcrumbList */],
    keywords: ['image resizer', 'resize image', /* ... */],
  },
  // ... one entry per tool
};
```

### 6.2 SSR Rendering

```typescript
// src/app/(public)/tools/[category]/[slug]/page.tsx

import { seoMeta } from '@/generated/seo-meta';
import { registry } from '@/generated/registry';

export async function generateMetadata({ params }) {
  const path = `/tools/${params.category}/${params.slug}`;
  const seo = seoMeta[path];

  if (!seo) return {};

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl },
    openGraph: seo.openGraph,
    twitter: seo.twitterCard,
    other: {
      'application/ld+json': seo.structuredData.map(sd => JSON.stringify(sd)),
    },
  };
}
```

## 7. Sitemap Generation

### 7.1 Sitemap Structure

```typescript
// src/generated/sitemap.ts (AUTO-GENERATED)

export const sitemapEntries = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' },
  { url: '/tools', priority: 0.9, changeFrequency: 'daily' },
  { url: '/tools/image', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/tools/image/image-resize', priority: 0.8, changeFrequency: 'monthly' },
  { url: '/tools/image/image-compress', priority: 0.8, changeFrequency: 'monthly' },
  // ... all tools
  { url: '/blog', priority: 0.7, changeFrequency: 'daily' },
  { url: '/blog/how-to-resize-images', priority: 0.6, changeFrequency: 'monthly' },
  // ... all articles
];
```

### 7.2 Sitemap Route

```typescript
// src/app/sitemap.ts

import { sitemapEntries } from '@/generated/sitemap';

export default function sitemap() {
  return sitemapEntries.map(entry => ({
    url: `https://example.com${entry.url}`,
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
```

### 7.3 robots.txt

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /settings

Sitemap: https://example.com/sitemap.xml
```

## 8. Internal Linking Strategy (PC-09)

### 8.1 Tool Page Links

Every tool page links to:
- **Related tools** (from manifest's `relatedTools`) — in "Related Tools" section.
- **Category page** — in breadcrumb and "Browse [Category]" link.
- **Homepage** — in breadcrumb and header logo.
- **Popular tools** — in footer or sidebar (from analytics, DGA-09).

### 8.2 Category Page Links

Every category page links to:
- **All tools in category** — in main grid.
- **Other categories** — in sidebar.
- **Homepage** — in breadcrumb.

### 8.3 Article Links

Every article links to:
- **Tools mentioned in article** — inline links.
- **Related articles** — at end of article.
- **Category page** — for tools discussed.

### 8.4 Bidirectional Links

If tool A lists tool B as related, tool B's page shows tool A in "Related Tools" (unless B explicitly excludes A). Generated at build time.

## 9. SEO Analytics and Monitoring

### 9.1 SEO Events (per `16_EventSchemaSpecification`)

- `page_viewed` — for all page views (feeds SEO traffic analysis).
- `search_result_clicked` — for search-driven traffic.

### 9.2 Growth Metrics (per `17_AnalyticsArchitecture`)

- **Organic Traffic:** Page views with `referrer` containing search engine.
- **Tool Popularity:** Views per tool (DGA-09).
- **Search Success Rate:** Internal search → result click rate.

### 9.3 External Monitoring

- **Google Search Console:** Index status, search queries, click-through rates.
- **Bing Webmaster Tools:** Same for Bing.
- **Lighthouse SEO score:** ≥95 required (per `08_CodingStandards`).

## 10. Standards

### 10.1 SEO Metadata Standards
- Every tool page has complete `seo` field in manifest.
- Title 50-60 chars; description 150-160 chars.
- Min 3 FAQ items; min 2 breadcrumb items.
- All URLs canonical (no duplicates).

### 10.2 Structured Data Standards
- JSON-LD format only.
- Validated via Schema.org validator.
- Three schema types per tool page (SoftwareApplication, FAQPage, BreadcrumbList).

### 10.3 Sitemap Standards
- Generated at build time.
- Includes all `stable` and `beta` tools.
- Submitted to Google and Bing.
- Updated on every deploy.

### 10.4 Internal Linking Standards
- Every tool has min 3 related tools.
- Bidirectional links generated.
- No orphan pages (every page linked from at least one other).

## 11. Best Practices

### 11.1 When Adding a Tool
1. Fill all `seo` fields in manifest.
2. Research target keywords (Google Keyword Planner, Ahrefs, SEMrush).
3. Write unique title and description (no duplicates).
4. Write min 3 FAQ items with real questions.
5. Set canonical URL.
6. Create OG image (1200x630px).
7. Verify structured data with Schema.org validator.
8. Run Lighthouse SEO audit.

### 11.2 When Optimizing SEO
- Monitor Search Console for query opportunities.
- Update title/description if CTR is low.
- Add FAQ items for emerging questions.
- Improve internal linking for high-value pages.

### 11.3 When Debugging SEO
- Check `view-source:` for rendered HTML.
- Verify JSON-LD with Schema.org validator.
- Check canonical URL is correct.
- Verify sitemap includes the page.
- Run Lighthouse SEO audit.

## 12. Future Expansion

### 12.1 Programmatic SEO (Phase 2+)
- Generate landing pages from templates (e.g., "Convert [X] to [Y]").
- Each generated page has unique value-add content (not thin content).

### 12.2 International SEO (Phase 2+)
- Per-language sitemaps.
- `hreflang` tags for language variants.
- Localized structured data.

### 12.3 AI Search Optimization (Phase 3+)
- Optimize for AI-generated search results (Perplexity, Google SGE).
- Structured data for AI consumption.
- Conversational FAQ format.

### 12.4 Video SEO (Phase 3+)
- Video sitemaps for tutorial videos.
- VideoObject structured data.

## 13. Dependencies

### 13.1 Document Dependencies
- Depends on `00_Project_Charter` §3 LOCK-08, §6 DGA-03, §5 PC-09, PC-10.
- Depends on `12_ToolManifestSpecification` §SEO — manifest field structure.
- Depends on `05_ProjectStructure` AD-04 — codegen pattern.
- `06_ArchitectureDecisionRecords` — ADR-066.
- `14_ACD` — `Breadcrumb`, `FAQ` components.
- `16_EventSchemaSpecification` — SEO analytics events.
- `17_AnalyticsArchitecture` — SEO growth metrics.
- `18_SearchArchitecture` — Search indexes from manifest.
- `24_AdminSpecification` — SEO management in admin.

### 13.2 External Dependencies
- Next.js Metadata API (SSR SEO).
- Schema.org (structured data vocabulary).
- Google Search Console, Bing Webmaster Tools (monitoring).

### 13.3 Assumptions
- Manifest `seo` field comprehensive enough for all SEO needs.
- Build-time generation sufficient (no runtime SEO needed).
- Google continues to honor JSON-LD structured data.

## 14. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial SEO Specification. Defined manifest-driven SEO (DGA-03), JSON-LD structured data (SoftwareApplication, FAQPage, BreadcrumbList), sitemap generation, internal linking strategy, SEO analytics, Lighthouse SEO standards. |

## 15. Cross References

- `00_Project_Charter` §3 LOCK-08, §6 DGA-03, §5 PC-09, PC-10 — Implemented.
- `02_SAD` AD-03 — Tool Registry (source for SEO metadata).
- `05_ProjectStructure` AD-04 — Codegen generates SEO metadata.
- `06_ArchitectureDecisionRecords` — ADR-066 (SEO Metadata as Structured Data), ADR-008 (SEO Constitution), ADR-062 (Feature Discoverability).
- `12_ToolManifestSpecification` §SEO — Manifest field definitions.
- `14_ACD` — `Breadcrumb`, `FAQ`, `RelatedTools` components.
- `15_UDS` — Tool page layout (Hero, FAQ, Related sections).
- `16_EventSchemaSpecification` — `page_viewed`, `search_result_clicked` events.
- `17_AnalyticsArchitecture` — Organic traffic, search success metrics.
- `18_SearchArchitecture` — Search index from manifest (DGA-04).
- `24_AdminSpecification` — SEO management in admin panel.
- `28_AI_Guideline` — AI must follow SEO standards (LOCK-09, EC-11).
