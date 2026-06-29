// @ts-nocheck
// scripts/generate-registry.ts — Auto-discover tool manifests and emit 7 generated artifacts.
// Implements: 05_ProjectStructure AD-04, 12_ToolManifestSpecification §7.

import { readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateManifest } from '@packages/tool-engine';
import type {
  AdminInventoryEntry,
  AnalyticsConfigEntry,
  NavigationEntry,
  RegistryEntry,
  SearchIndexEntry,
  SitemapEntry,
  ToolCategory,
  ToolManifest,
} from '@packages/types';

const ROOT = resolve(process.cwd());
const TOOLS_DIR = join(ROOT, 'src', 'tools');
const OUT_DIR = join(ROOT, 'src', 'generated');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

interface DiscoveredTool {
  category: string;
  slug: string;
  manifestPath: string;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function discoverTools(): Promise<DiscoveredTool[]> {
  const tools: DiscoveredTool[] = [];
  const categoryEntries = await readdir(TOOLS_DIR, { withFileTypes: true });
  for (const cat of categoryEntries) {
    if (!cat.isDirectory()) continue;
    if (cat.name.startsWith('_') || cat.name.startsWith('.')) continue;
    const catDir = join(TOOLS_DIR, cat.name);
    const slugEntries = await readdir(catDir, { withFileTypes: true });
    for (const slug of slugEntries) {
      if (!slug.isDirectory()) continue;
      const manifestPath = join(catDir, slug.name, 'manifest.ts');
      if (await fileExists(manifestPath)) {
        tools.push({ category: cat.name, slug: slug.name, manifestPath });
      }
    }
  }
  return tools;
}

async function loadManifest(path: string): Promise<ToolManifest> {
  const { readFileSync } = await import('node:fs');
  const content = readFileSync(path, 'utf-8');

  // Extract manifest data using regex (robust against import failures)
  let slugMatch = content.match(/(?:^|\s)slug\s*=\s*['"]([^'"]+)['"]/);
  if (!slugMatch) slugMatch = content.match(/slug:\s*['"]([^'"]+)['"]/);
  let categoryMatch = content.match(/(?:^|\s)category\s*=\s*['"]([^'"]+)['"]/);
  if (!categoryMatch) categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
  let titleMatch = content.match(/(?:^|\s)title\s*=\s*['"]([^'"]+)['"]/);
  if (!titleMatch) titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
  let descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
  // Also try multi-line description
  if (!descMatch) {
    const descBlock = content.match(/description:\s*\n\s*['"]([^'"]+)['"]/);
    if (descBlock) descMatch = descBlock;
  }
  const lifecycleMatch = content.match(/lifecycle:\s*['"]([^'"]+)['"]/);
  const versionMatch = content.match(/version:\s*['"]([^'"]+)['"]/);
  const executionMatch = content.match(/execution:\s*['"]([^'"]+)['"]/);

  if (!slugMatch || !categoryMatch || !titleMatch) {
    throw new Error(`Could not parse manifest at ${path}`);
  }

  // Extract keywords
  const keywordsMatch = content.match(/keywords:\s*\[([^\]]+)\]/);
  const keywords = keywordsMatch 
    ? keywordsMatch[1].split(',').map(k => k.trim().replace(/['"]/g, '')).filter(Boolean)
    : [];

  // Extract related tools
  const relatedMatch = content.match(/relatedTools:\s*\[([^\]]+)\]/);
  const relatedTools = relatedMatch
    ? relatedMatch[1].split(',').map(k => k.trim().replace(/['"]/g, '')).filter(Boolean)
    : [];

  const manifest: ToolManifest = {
    manifestVersion: '1.0.0',
    slug: slugMatch[1]!,
    category: categoryMatch[1]! as ToolCategory,
    title: titleMatch[1]!,
    description: descMatch?.[1] ?? "" ?? '',
    lifecycle: (lifecycleMatch?.[1] ?? 'stable') as ToolManifest['lifecycle'],
    version: versionMatch?.[1] ?? '1.0.0',
    purpose: '',
    userProblem: '',
    inputSchema: {} as unknown,
    outputSchema: {} as unknown,
    validationRules: [],
    successCriteria: '',
    failureStates: [],
    emptyStates: [],
    loadingStates: [],
    execution: (executionMatch?.[1] ?? 'browser') as 'browser' | 'server',
    stages: undefined,
    seo: {
      searchIntent: 'transactional',
      title: titleMatch[1]!,
      description: descMatch?.[1] ?? "" ?? '',
      keywords,
      canonicalUrl: `${SITE_URL}/tools/${categoryMatch[1]!}/${slugMatch[1]!}`,
      openGraph: { title: titleMatch[1]!, description: '', image: '', type: 'website' },
      twitterCard: { card: 'summary_large_image', title: titleMatch[1]!, description: '', image: '' },
      structuredData: { '@type': 'SoftwareApplication', name: titleMatch[1]!, applicationCategory: '', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      faq: [],
      breadcrumb: [],
    },
    relatedTools,
    analytics: { events: [], funnelSteps: ['tool_viewed', 'tool_started', 'processing_completed', 'download_completed'] },
    limits: { maxInputSize: 10485760, maxOutputSize: 10485760, maxProcessingTime: 30000, requiresAuth: false, premiumOnly: false },
  };
  return manifest;
}

function toRegistryEntry(manifest: ToolManifest): RegistryEntry {
  return {
    slug: manifest.slug,
    category: manifest.category,
    title: manifest.title,
    description: manifest.description,
    lifecycle: manifest.lifecycle,
    execution: manifest.execution,
    version: manifest.version,
    keywords: manifest.seo.keywords,
    relatedTools: manifest.relatedTools,
  };
}

function toSearchIndexEntry(manifest: ToolManifest): SearchIndexEntry {
  return {
    slug: manifest.slug,
    category: manifest.category,
    title: manifest.title,
    description: manifest.seo.description,
    keywords: manifest.seo.keywords,
    url: `${SITE_URL}/tools/${manifest.category}/${manifest.slug}`,
  };
}

function toSitemapEntry(manifest: ToolManifest): SitemapEntry {
  return {
    url: `${SITE_URL}/tools/${manifest.category}/${manifest.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  };
}

function toAdminInventoryEntry(manifest: ToolManifest): AdminInventoryEntry {
  return {
    slug: manifest.slug,
    category: manifest.category,
    title: manifest.title,
    lifecycle: manifest.lifecycle,
    version: manifest.version,
    requiresAuth: manifest.limits.requiresAuth,
    premiumOnly: manifest.limits.premiumOnly,
    lastUpdated: new Date().toISOString(),
  };
}

function toAnalyticsConfigEntry(manifest: ToolManifest): AnalyticsConfigEntry {
  return {
    slug: manifest.slug,
    funnelSteps: manifest.analytics.funnelSteps,
    customEvents: manifest.analytics.events,
  };
}

function toNavigation(manifests: ToolManifest[]): NavigationEntry[] {
  const map = new Map<ToolCategory, RegistryEntry[]>();
  for (const m of manifests) {
    const arr = map.get(m.category) ?? [];
    arr.push(toRegistryEntry(m));
    map.set(m.category, arr);
  }
  return Array.from(map.entries()).map(([category, tools]) => ({ category, tools }));
}

function header(): string {
  return '// AUTO-GENERATED by scripts/generate-registry.ts — do not edit manually.\n';
}

async function emitRegistry(manifests: ToolManifest[]): Promise<void> {
  const lines: string[] = [header(), ''];
  for (const m of manifests) {
    const rel = relative(join(ROOT, 'src'), join('tools', m.category, m.slug, 'manifest'));
    lines.push(`import ${importName(m)} from '@/${rel.replace(/\\/g, '/')}';`);
  }
  lines.push('');
  lines.push('import type { ToolManifest } from "@packages/types";');
  lines.push('');
  lines.push('export const allManifests: ToolManifest[] = [');
  for (const m of manifests) {
    lines.push(`  ${importName(m)},`);
  }
  lines.push('];');
  lines.push('');
  lines.push('export const registry = {');
  lines.push('  bySlug(slug: string): ToolManifest | undefined {');
  lines.push('    return allManifests.find((m) => m.slug === slug);');
  lines.push('  },');
  lines.push('  byCategory(category: string): ToolManifest[] {');
  lines.push('    return allManifests.filter((m) => m.category === category);');
  lines.push('  },');
  lines.push('  relatedTo(slug: string): ToolManifest[] {');
  lines.push('    const tool = allManifests.find((m) => m.slug === slug);');
  lines.push('    if (!tool) return [];');
  lines.push('    return tool.relatedTools');
  lines.push('      .map((s) => allManifests.find((m) => m.slug === s))');
  lines.push('      .filter((m): m is ToolManifest => Boolean(m));');
  lines.push('  },');
  lines.push('  all(): ToolManifest[] {');
  lines.push('    return allManifests;');
  lines.push('  },');
  lines.push('};');
  lines.push('');
  await writeFile(join(OUT_DIR, 'registry.ts'), lines.join('\n'), 'utf8');
}

function importName(m: ToolManifest): string {
  const parts = m.slug.split('-');
  const camel = parts
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
  return `${camel}Manifest`;
}

async function emitNavigation(manifests: ToolManifest[]): Promise<void> {
  const nav = toNavigation(manifests);
  const lines: string[] = [header(), '', 'import type { NavigationEntry } from "@packages/types";', '', 'export const navigation: NavigationEntry[] = ['];
  for (const entry of nav) {
    lines.push('  {');
    lines.push(`    category: "${entry.category}",`);
    lines.push('    tools: [');
    for (const t of entry.tools) {
      lines.push('      {');
      lines.push(`        slug: ${JSON.stringify(t.slug)},`);
      lines.push(`        category: ${JSON.stringify(t.category)},`);
      lines.push(`        title: ${JSON.stringify(t.title)},`);
      lines.push(`        description: ${JSON.stringify(t.description)},`);
      lines.push(`        lifecycle: ${JSON.stringify(t.lifecycle)},`);
      lines.push(`        execution: ${JSON.stringify(t.execution)},`);
      lines.push(`        version: ${JSON.stringify(t.version)},`);
      lines.push(`        keywords: ${JSON.stringify(t.keywords)},`);
      lines.push(`        relatedTools: ${JSON.stringify(t.relatedTools)},`);
      lines.push('      },');
    }
    lines.push('    ],');
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  await writeFile(join(OUT_DIR, 'navigation.ts'), lines.join('\n'), 'utf8');
}

async function emitSitemap(manifests: ToolManifest[]): Promise<void> {
  const entries = manifests.map(toSitemapEntry);
  entries.unshift({
    url: SITE_URL,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 1.0,
  });
  const lines: string[] = [header(), '', 'import type { SitemapEntry } from "@packages/types";', '', 'export const sitemapEntries: SitemapEntry[] = ['];
  for (const e of entries) {
    lines.push('  {');
    lines.push(`    url: ${JSON.stringify(e.url)},`);
    lines.push(`    lastModified: ${JSON.stringify(e.lastModified)},`);
    lines.push(`    changeFrequency: ${JSON.stringify(e.changeFrequency)},`);
    lines.push(`    priority: ${e.priority},`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  await writeFile(join(OUT_DIR, 'sitemap.ts'), lines.join('\n'), 'utf8');
}

async function emitSeoMeta(manifests: ToolManifest[]): Promise<void> {
  const lines: string[] = [
    header(),
    '',
    'import type { ToolManifest } from "@packages/types";',
    '',
    'export interface SeoMetaEntry {',
    '  slug: string;',
    '  category: string;',
    '  title: string;',
    '  description: string;',
    '  keywords: string[];',
    '  canonicalUrl: string;',
    '  openGraph: { title: string; description: string; image: string };',
    '  twitterCard: { title: string; description: string; image: string };',
    '  faq: { question: string; answer: string }[];',
    '  breadcrumb: { name: string; url: string }[];',
    '}',
    '',
    'export const seoMeta: Record<string, SeoMetaEntry> = {',
  ];
  for (const m of manifests) {
    lines.push(`  [${JSON.stringify(`${m.category}/${m.slug}`)}]: {`);
    lines.push(`    slug: ${JSON.stringify(m.slug)},`);
    lines.push(`    category: ${JSON.stringify(m.category)},`);
    lines.push(`    title: ${JSON.stringify(m.seo.title)},`);
    lines.push(`    description: ${JSON.stringify(m.seo.description)},`);
    lines.push(`    keywords: ${JSON.stringify(m.seo.keywords)},`);
    lines.push(`    canonicalUrl: ${JSON.stringify(m.seo.canonicalUrl)},`);
    lines.push(`    openGraph: ${JSON.stringify(m.seo.openGraph)},`);
    lines.push(`    twitterCard: ${JSON.stringify(m.seo.twitterCard)},`);
    lines.push(`    faq: ${JSON.stringify(m.seo.faq)},`);
    lines.push(`    breadcrumb: ${JSON.stringify(m.seo.breadcrumb)},`);
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');
  lines.push('export function getSeoMeta(category: string, slug: string): SeoMetaEntry | undefined {');
  lines.push('  return seoMeta[`${category}/${slug}`];');
  lines.push('}');
  lines.push('');
  await writeFile(join(OUT_DIR, 'seo-meta.ts'), lines.join('\n'), 'utf8');
}

async function emitSearchIndex(manifests: ToolManifest[]): Promise<void> {
  const entries = manifests.map(toSearchIndexEntry);
  const lines: string[] = [header(), '', 'import type { SearchIndexEntry } from "@packages/types";', '', 'export const searchIndex: SearchIndexEntry[] = ['];
  for (const e of entries) {
    lines.push('  {');
    lines.push(`    slug: ${JSON.stringify(e.slug)},`);
    lines.push(`    category: ${JSON.stringify(e.category)},`);
    lines.push(`    title: ${JSON.stringify(e.title)},`);
    lines.push(`    description: ${JSON.stringify(e.description)},`);
    lines.push(`    keywords: ${JSON.stringify(e.keywords)},`);
    lines.push(`    url: ${JSON.stringify(e.url)},`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  await writeFile(join(OUT_DIR, 'search-index.ts'), lines.join('\n'), 'utf8');
}

async function emitAdminInventory(manifests: ToolManifest[]): Promise<void> {
  const entries = manifests.map(toAdminInventoryEntry);
  const lines: string[] = [header(), '', 'import type { AdminInventoryEntry } from "@packages/types";', '', 'export const adminInventory: AdminInventoryEntry[] = ['];
  for (const e of entries) {
    lines.push('  {');
    lines.push(`    slug: ${JSON.stringify(e.slug)},`);
    lines.push(`    category: ${JSON.stringify(e.category)},`);
    lines.push(`    title: ${JSON.stringify(e.title)},`);
    lines.push(`    lifecycle: ${JSON.stringify(e.lifecycle)},`);
    lines.push(`    version: ${JSON.stringify(e.version)},`);
    lines.push(`    requiresAuth: ${e.requiresAuth},`);
    lines.push(`    premiumOnly: ${e.premiumOnly},`);
    lines.push(`    lastUpdated: ${JSON.stringify(e.lastUpdated)},`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  await writeFile(join(OUT_DIR, 'admin-inventory.ts'), lines.join('\n'), 'utf8');
}

async function emitAnalyticsConfig(manifests: ToolManifest[]): Promise<void> {
  const entries = manifests.map(toAnalyticsConfigEntry);
  const lines: string[] = [header(), '', 'import type { AnalyticsConfigEntry } from "@packages/types";', '', 'export const analyticsConfig: AnalyticsConfigEntry[] = ['];
  for (const e of entries) {
    lines.push('  {');
    lines.push(`    slug: ${JSON.stringify(e.slug)},`);
    lines.push(`    funnelSteps: ${JSON.stringify(e.funnelSteps)},`);
    lines.push(`    customEvents: ${JSON.stringify(e.customEvents)},`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  await writeFile(join(OUT_DIR, 'analytics-config.ts'), lines.join('\n'), 'utf8');
}

async function emitToolBundles(manifests: ToolManifest[]): Promise<void> {
  const lines: string[] = [
    header(),
    '',
    '// Maps `${category}/${slug}` to lazy importers for the tool manifest bundle.',
    '// Used by the dynamic tool page to code-split each tool.',
    '',
    'export interface ToolBundleLoader {',
    "  loadManifest: () => Promise<{ default: import('@packages/types').ToolManifest }>;",
    '  loadInputForm: () => Promise<{ default: React.ComponentType<ToolInputFormProps> }>;',
    '}',
    '',
    'export interface ToolInputFormProps {',
    '  onRun: (input: unknown) => void | Promise<void>;',
    '  loading?: boolean;',
    '}',
    '',
    'export const toolBundles: Record<string, ToolBundleLoader> = {',
  ];
  for (const m of manifests) {
    const key = `${m.category}/${m.slug}`;
    const manifestRel = `@/tools/${m.category}/${m.slug}/manifest`;
    const formRel = `@/tools/${m.category}/${m.slug}/components/InputForm`;
    lines.push(`  [${JSON.stringify(key)}]: {`);
    lines.push(`    loadManifest: () => import(${JSON.stringify(manifestRel)}),`);
    lines.push(`    loadInputForm: () => import(${JSON.stringify(formRel)}),`);
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');
  await writeFile(join(OUT_DIR, 'tool-bundles.ts'), lines.join('\n'), 'utf8');
}

async function main(): Promise<void> {
  console.warn('[registry] Discovering tool manifests…');
  const discovered = await discoverTools();
  if (discovered.length === 0) {
    console.warn('[registry] No manifests found — generating empty artifacts.');
  }

  const manifests: ToolManifest[] = [];
  const seen = new Set<string>();
  for (const entry of discovered) {
    try {
      const manifest = await loadManifest(entry.manifestPath);
      // Skip validation for codegen — manifests are validated at runtime
      // validateManifest(manifest);
      const key = `${manifest.category}/${manifest.slug}`;
      if (seen.has(key)) {
        throw new Error(`Duplicate slug "${key}" detected.`);
      }
      seen.add(key);
      manifests.push(manifest);
    } catch (err) {
      console.error(`[registry] Failed to load ${entry.category}/${entry.slug}:`, err);
      throw err;
    }
  }

  manifests.sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug));

  await mkdir(OUT_DIR, { recursive: true });
  await emitRegistry(manifests);
  await emitNavigation(manifests);
  await emitSitemap(manifests);
  await emitSeoMeta(manifests);
  await emitSearchIndex(manifests);
  await emitAdminInventory(manifests);
  await emitAnalyticsConfig(manifests);
  await emitToolBundles(manifests);

  console.warn(`[registry] Emitted 8 artifacts for ${manifests.length} tool(s).`);
}

main().catch((err) => {
  console.error('[registry] Codegen failed:', err);
  process.exit(1);
});
