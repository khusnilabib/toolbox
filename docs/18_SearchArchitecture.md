# 18 — Search Architecture

> **Status:** 🟢 Approved (📈 Constitutional)
> **Document Owner:** Chief Architect
> **Last Updated:** 2026-06-28
> **Revision:** 1.0.0
> **Implements:** DGA-04 (Search Architecture), PC-09 (Feature Discoverability), LOCK-05 (Plugin-Ready — manifest-driven index)

---

## 1. Purpose

This Search Architecture document defines **how search works across [PROJECT_NAME]** — from index generation to query execution to result rendering. It implements DGA-04 (search supports instant, category, related, popular, recent, synonyms, fuzzy, tags) and PC-09 (feature discoverability).

Search is critical at 1,000+ tools. Without effective search, users can't find what they need; they leave; engagement drops; SEO authority drops. The search architecture ensures users can find any tool in <100ms via multiple search modes, with indexes generated automatically from the Tool Manifest (per DGA-04 and PC-10 — metadata-first development).

The architecture is build-time-first: search indexes are generated from manifests at build time, shipped as static assets, and queried client-side. This means no server cost for search queries, no cold-start latency, and indexes never go stale (regenerated on every build). For Phase 3+ when server-side search may be needed for advanced features (personalization, ML ranking), the architecture supports a hybrid approach.

## 2. Scope

### 2.1 In Scope

- Search index generation from Tool Manifest.
- Search modes: instant, category, related, popular, recently used, synonyms, fuzzy, tags.
- Client-side search engine selection (Pagefind, FlexSearch, Lunr).
- Index structure and fields.
- Search UI components and interaction patterns.
- Search analytics events.
- Server-side search preparation (Phase 3+).
- Multi-language search (Phase 2+).

### 2.2 Out of Scope

- Tool Manifest schema → `12_ToolManifestSpecification`.
- Specific search UI components → `14_ACD`.
- Search analytics event schema → `16_EventSchemaSpecification`.
- Admin search management → `24_AdminSpecification`.
- A/B testing search algorithms → `24_AdminSpecification` §Feature Flags.

## 3. Architectural Decisions

### AD-01 — Build-Time Index Generation from Manifest

**Context.** Search indexes can be generated at build time (from manifests) or at runtime (via API). Runtime adds latency and server cost; build-time is static and fast. DGA-04 mandates indexes generated from Tool Manifest; PC-10 mandates metadata-first development.

**Decision.** Search indexes are generated at build time by `scripts/generate-search-index.ts`, which consumes the tool registry (itself generated from manifests per `05_ProjectStructure` AD-04). The script produces a static search index shipped to the browser. No server-side search in Phase 1.

**Implements:** DGA-04, PC-10, LOCK-05 (manifest-driven), EC-07 (Performance Budget — no server cost).

### AD-02 — Client-Side Search Engine

**Context.** Multiple client-side search libraries exist: Pagefind (static site search), FlexSearch (fast fuzzy), Lunr (full-featured). Each has tradeoffs in index size, query speed, and features.

**Decision.** Use **Pagefind** as the primary client-side search engine for Phase 1. Pagefind is designed for static sites, generates a compact index, and supports fuzzy matching and field weighting. It's used by Vercel, Cloudflare, and other developer-focused sites. Evaluate FlexSearch or Lunr if Pagefind's features prove insufficient.

**Implements:** EC-07 (Performance — Pagefind is fast and compact), EC-03 (Component Reuse — use existing library, don't build custom).

### AD-03 — Multi-Mode Search

**Context.** DGA-04 mandates search supports: instant, category, related, popular, recently used, synonyms, fuzzy, tags. Each mode has different data sources and query patterns.

**Decision.** Implement search modes as composable functions:
- **Instant Search:** Pagefind query as user types (debounced 150ms).
- **Category Search:** Filter by `category` field in manifest.
- **Related Tools:** Lookup by `relatedTools` field in manifest.
- **Popular Tools:** From Analytics Context daily aggregates (DGA-09).
- **Recently Used:** From Identity Context user history (if authenticated).
- **Synonyms:** Configurable synonym map; applied at query time.
- **Fuzzy Matching:** Pagefind built-in fuzzy matching.
- **Tags:** Filter by `seo.keywords` field in manifest.

**Implements:** DGA-04, PC-09.

### AD-04 — Search Index Structure

**Context.** Index structure determines what fields are searchable and how results are ranked.

**Decision.** Search index per tool includes:
- `slug` (exact match, URL)
- `title` (high weight)
- `description` (medium weight)
- `category` (filter)
- `keywords` (medium weight, multiple)
- `faq` (low weight, question + answer text)
- `purpose` (medium weight)
- `userProblem` (medium weight)
- `lifecycle` (filter; only `stable` and `beta` in search by default)
- `popularityScore` (from analytics; for ranking)
- `url` (for result link)

**Implements:** DGA-04, LOCK-08 (SEO — search index doubles as SEO content source).

### AD-05 — Search Analytics Events

**Context.** PC-07 and DGA-09 require search analytics: search success rate, popular queries, click-through rate.

**Decision.** Search emits events per `16_EventSchemaSpecification`:
- `search_performed` — when user types and submits query.
- `search_result_clicked` — when user clicks a result.
- `search_abandoned` — when user types but doesn't click (after 30s).

These events feed the "Search Success Rate" growth metric (DGA-09).

**Implements:** PC-07, DGA-09, DGA-02.

### AD-06 — Search UI Patterns

**Context.** Search UI varies: modal overlay, header dropdown, dedicated page. Inconsistent UI confuses users.

**Decision.** Search UI patterns (per `15_UDS`):
- **Header search (desktop):** Expanding input in header; results dropdown.
- **Header search (mobile):** Search icon in header; opens full-screen search.
- **Dedicated search page:** `/search?q=[query]` for shareable search URLs.
- **Empty state:** When no query, show popular tools and recent searches.
- **No results state:** Suggest related categories and popular tools.

**Implements:** PC-05 (UX Consistency), PC-09.

## 4. Design Principles

### P1 — Build-Time, Not Runtime
Indexes are static assets. No server cost, no cold start, never stale.

### P2 — Multiple Search Modes
Users find tools differently; support instant, category, related, popular, recent, fuzzy, tags.

### P3 — Fast as Possible
Search results in <100ms. Debounce input. Lazy-load index.

### P4 — Analytics-Driven Ranking
Popular tools rank higher. Search success rate informs algorithm tuning.

### P5 — Accessible
Search is keyboard navigable, screen reader compatible, ARIA-labeled.

### P6 — Mobile-First
Search works perfectly on 360px viewport. Touch-friendly results.

## 5. Search Index Generation

### 5.1 Index Generation Script

```typescript
// scripts/generate-search-index.ts

import { registry } from '@/generated/registry';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  faq: { question: string; answer: string }[];
  purpose: string;
  userProblem: string;
  lifecycle: string;
  popularityScore: number;
  url: string;
}

async function generateSearchIndex() {
  const entries: SearchIndexEntry[] = [];

  for (const manifest of registry.all()) {
    // Skip non-searchable lifecycle states
    if (['concept', 'planned', 'archived'].includes(manifest.lifecycle)) continue;

    // Fetch popularity score from analytics (best-effort)
    const popularityScore = await getPopularityScore(manifest.slug);

    entries.push({
      slug: manifest.slug,
      title: manifest.title,
      description: manifest.description,
      category: manifest.category,
      keywords: manifest.seo.keywords,
      faq: manifest.seo.faq,
      purpose: manifest.purpose,
      userProblem: manifest.userProblem,
      lifecycle: manifest.lifecycle,
      popularityScore,
      url: `/tools/${manifest.category}/${manifest.slug}`,
    });
  }

  // Write index for Pagefind
  const indexDir = join(process.cwd(), 'public', 'search-index');
  mkdirSync(indexDir, { recursive: true });

  for (const entry of entries) {
    writeFileSync(
      join(indexDir, `${entry.slug}.json`),
      JSON.stringify(entry)
    );
  }

  // Pagefind indexes the JSON files
  console.log(`Generated search index for ${entries.length} tools`);
}

generateSearchIndex();
```

### 5.2 Generated Artifacts

```
public/search-index/
├── image-resize.json
├── image-compress.json
├── pdf-merge.json
├── ...
└── (one JSON per tool)
```

Pagefind consumes these JSON files at build time and produces a compact search index in `public/pagefind/`.

### 5.3 Index Refresh

- Index regenerated on every `pnpm build`.
- CI verifies index matches manifests.
- Index versioned with build; cached at CDN.

## 6. Search Modes (Detailed)

### 6.1 Instant Search

**Trigger:** User types in search input (debounced 150ms).

**Implementation:**
```typescript
import { search } from '@/shared/lib/search-client';

async function instantSearch(query: string) {
  if (query.length < 2) return [];

  const results = await search(query, {
    limit: 10,
    fuzzy: true,
    weighting: {
      title: 10,
      description: 5,
      keywords: 3,
      faq: 1,
    },
  });

  return results;
}
```

### 6.2 Category Search

**Trigger:** User clicks a category in navigation.

**Implementation:**
```typescript
import { registry } from '@/generated/registry';

function categorySearch(category: string) {
  return registry.byCategory(category)
    .filter(t => ['stable', 'beta'].includes(t.lifecycle))
    .sort((a, b) => popularityScore(b.slug) - popularityScore(a.slug));
}
```

### 6.3 Related Tools

**Trigger:** User views a tool page; "Related Tools" section.

**Implementation:**
```typescript
import { registry } from '@/generated/registry';

function relatedTools(slug: string) {
  const tool = registry.bySlug(slug);
  if (!tool) return [];

  return tool.relatedTools
    .map(s => registry.bySlug(s))
    .filter(Boolean)
    .filter(t => ['stable', 'beta'].includes(t.lifecycle));
}
```

### 6.4 Popular Tools

**Trigger:** Homepage, category pages, search empty state.

**Implementation:**
```typescript
import { getPopularTools } from '@/analytics/application/services/popular-tools';

async function popularTools(limit = 10) {
  // From Analytics Context daily_aggregates (DGA-09)
  return getPopularTools({ period: '7d', limit });
}
```

### 6.5 Recently Used

**Trigger:** Search empty state, if authenticated.

**Implementation:**
```typescript
import { getRecentlyUsed } from '@/identity/application/services/history';

async function recentlyUsed(userId: string, limit = 5) {
  // From Identity Context history_entries
  return getRecentlyUsed(userId, limit);
}
```

### 6.6 Synonyms

**Trigger:** Query expansion at search time.

**Implementation:**
```typescript
// src/shared/config/search-synonyms.ts

export const synonyms: Record<string, string[]> = {
  'resize': ['scale', 'shrink', 'enlarge', 'dimensions'],
  'compress': ['reduce', 'optimize', 'minify'],
  'convert': ['transform', 'change'],
  'pdf': ['document'],
  'image': ['photo', 'picture', 'pic'],
  // ...
};

function expandQuery(query: string): string {
  const words = query.split(/\s+/);
  const expanded = words.flatMap(word => [word, ...(synonyms[word.toLowerCase()] || [])]);
  return expanded.join(' ');
}
```

### 6.7 Fuzzy Matching

**Trigger:** Automatic in Pagefind.

**Configuration:**
```typescript
// Pagefind config
const searchOptions = {
  fuzzy: true,  // Enables fuzzy matching
};
```

### 6.8 Tags

**Trigger:** User clicks a keyword tag on a tool page.

**Implementation:**
```typescript
import { registry } from '@/generated/registry';

function searchByTag(tag: string) {
  return registry.all()
    .filter(t => t.seo.keywords.includes(tag))
    .filter(t => ['stable', 'beta'].includes(t.lifecycle));
}
```

## 7. Search UI Components

### 7.1 `SearchInput`

**Purpose:** Header search input with instant results dropdown.

**Contract:**
```typescript
interface SearchInputProps {
  placeholder?: string;  // Default "Search tools..."
  autoFocus?: boolean;
}
```

**Behavior:**
- Expanding input in header (desktop).
- Full-screen overlay on mobile.
- Debounced instant search (150ms).
- Results dropdown with tool cards.
- Keyboard navigation (arrow keys, Enter, Escape).

### 7.2 `SearchResults`

**Purpose:** Renders search results list.

**Contract:**
```typescript
interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  onSelect: (slug: string) => void;
}
```

### 7.3 `SearchPage`

**Purpose:** Dedicated search page at `/search`.

**Contract:**
```typescript
// Renders full search experience
// URL: /search?q=[query]
// SSR-friendly for shareable URLs
```

### 7.4 `EmptySearchState`

**Purpose:** Shown when no query entered.

**Content:**
- Popular tools (from analytics).
- Recently used (if authenticated).
- All categories.

### 7.5 `NoResultsState`

**Purpose:** Shown when search returns no results.

**Content:**
- "No tools found for '[query]'"
- Suggested categories.
- Popular tools.
- Search tips (try fewer words, synonyms).

## 8. Search Analytics

### 8.1 Events Emitted

Per `16_EventSchemaSpecification`:

```typescript
// User types and submits query
analytics.emit('search_performed', {
  query: 'resize image',
  resultCount: 5,
  resultsShown: 5,
});

// User clicks a result
analytics.emit('search_result_clicked', {
  query: 'resize image',
  clickedToolSlug: 'image-resize',
  position: 1,
});

// User types but doesn't click (after 30s)
analytics.emit('search_abandoned', {
  query: 'resize image',
  resultCount: 5,
});
```

### 8.2 Growth Metrics Derived

Per `17_AnalyticsArchitecture` §9:

- **Search Success Rate:** `COUNT(search_result_clicked) / COUNT(search_performed)`.
- **Popular Queries:** `COUNT(*) GROUP BY query ORDER BY count DESC LIMIT 100`.
- **Zero-Result Queries:** Queries with `resultCount = 0` (informs content gaps).

## 9. Standards

### 9.1 Index Generation Standards
- Index generated on every build.
- Index includes all `stable` and `beta` tools.
- Index excludes `concept`, `planned`, `archived` tools.
- Index fields per AD-04.

### 9.2 Search Performance Standards
- Instant search results: <100ms.
- Index size: <500KB gzipped (for 1,000 tools).
- Index lazy-loaded on first search interaction.
- Debounce: 150ms.

### 9.3 Search UI Standards
- Keyboard navigable (arrow keys, Enter, Escape).
- Screen reader compatible (ARIA labels).
- Mobile-friendly (full-screen overlay).
- Loading state during index fetch.

### 9.4 Search Analytics Standards
- All search interactions emit events per `16_EventSchemaSpecification`.
- Events feed growth metrics (DGA-09).
- Zero-result queries tracked for content gap analysis.

## 10. Best Practices

### 10.1 When Adding a New Tool
- No search-specific work; manifest drives index.
- Verify tool appears in search after build.
- Add related tools to manifest's `relatedTools` field.

### 10.2 When Tuning Search Ranking
- Adjust weighting in `instantSearch` config.
- A/B test via feature flags (DGA-06).
- Monitor search success rate metric.

### 10.3 When Adding Synonyms
- Add to `src/shared/config/search-synonyms.ts`.
- Verify expansion doesn't over-broaden results.
- Monitor zero-result queries for new synonym candidates.

### 10.4 When Debugging Search
- Use `search.debug()` to log queries and results.
- Check Pagefind index in `public/pagefind/`.
- Verify manifest fields are indexed correctly.

## 11. Future Expansion

### 11.1 Server-Side Search (Phase 3+)
- For personalization (results ranked by user history).
- For ML-powered relevance.
- Hybrid: client-side for instant, server-side for personalized.

### 11.2 Multi-Language Search (Phase 2+)
- Per-language indexes.
- Language detection from query.
- Cross-language search (search "image resizer" finds Spanish "redimensionar imagen").

### 11.3 Voice Search (Phase 4+)
- Voice input via Web Speech API.
- Natural language query understanding.

### 11.4 Search API (Phase 3+)
- Public search API for integrations.
- Powered by server-side search.

### 11.5 Visual Search (Phase 4+)
- Search by image (find tools that process similar images).
- Upload image → suggest relevant tools.

## 12. Dependencies

### 12.1 Document Dependencies
- Depends on `00_Project_Charter` §6 DGA-04.
- Depends on `12_ToolManifestSpecification` — index source.
- Depends on `05_ProjectStructure` AD-04 — codegen pattern.
- `06_ArchitectureDecisionRecords` — ADR-067.
- `14_ACD` — Search UI components.
- `15_UDS` — Search interaction patterns.
- `16_EventSchemaSpecification` — Search analytics events.
- `17_AnalyticsArchitecture` — Popular tools data source.
- `19_DatabaseDesign` §Analytics Context — Popularity scores.

### 12.2 External Dependencies
- Pagefind (client-side search engine).
- Supabase Postgres (popularity scores via analytics).

### 12.3 Assumptions
- Pagefind scales to 1,000+ tools with acceptable index size.
- Client-side search performance adequate through Phase 2.
- Synonyms maintained manually (no ML synonym discovery in Phase 1).

## 13. Revision History

| Revision | Date | Author | Change |
|----------|------|--------|--------|
| 1.0.0 | 2026-06-28 | Chief Architect | Initial Search Architecture. Defined build-time index generation from manifests, Pagefind as client-side engine, 8 search modes (instant/category/related/popular/recent/synonyms/fuzzy/tags), search UI components, search analytics events. |

## 14. Cross References

- `00_Project_Charter` §6 DGA-04, §5 PC-09 — Implemented.
- `02_SAD` AD-03 — Tool Registry (source for search index).
- `05_ProjectStructure` AD-04 — Codegen pattern for index generation.
- `06_ArchitectureDecisionRecords` — ADR-067 (Search Architecture), ADR-062 (Feature Discoverability).
- `12_ToolManifestSpecification` — Manifest fields indexed.
- `14_ACD` — `SearchInput`, `SearchResults`, `SearchPage` components.
- `15_UDS` — Search interaction patterns.
- `16_EventSchemaSpecification` — `search_performed`, `search_result_clicked`, `search_abandoned` events.
- `17_AnalyticsArchitecture` — Popular tools data source (DGA-09).
- `19_DatabaseDesign` §Analytics Context — Popularity score storage.
- `24_AdminSpecification` — Search analytics dashboard.
- `28_AI_Guideline` — AI must follow search architecture (LOCK-09, EC-11).
