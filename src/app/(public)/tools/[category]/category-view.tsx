// src/app/(public)/tools/[category]/category-view.tsx — Interactive category view.
// Phase 4 Sprint UI 2.0 — Client-side filtering, sorting, tag cloud.

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { searchIndex } from '@/generated/search-index';
import { routes } from '@/shared/config/routes';
import { cn } from '@/lib/utils';

type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'popular';
type LifecycleFilter = 'all' | 'stable' | 'beta' | 'development';

export interface CategoryViewProps {
  category: string;
}

export function CategoryView({ category }: CategoryViewProps) {
  // Use searchIndex (serializable, no functions) instead of receiving ToolManifest props from server
  const tools = useMemo(() => {
    return searchIndex
      .filter((entry) => entry.category === category)
      .map((entry) => ({
        slug: entry.slug,
        category: entry.category,
        title: entry.title,
        description: entry.description,
        lifecycle: 'stable' as const,
        seo: { keywords: Array.isArray(entry.keywords) ? entry.keywords : [] },
      }));
  }, [category]);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [lifecycle, setLifecycle] = useState<LifecycleFilter>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const t of tools) {
      for (const kw of t.seo.keywords) tags.add(kw);
    }
    return Array.from(tags).sort();
  }, [tools]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...tools];

    // Lifecycle filter
    if (lifecycle !== 'all') {
      result = result.filter((t) => t.lifecycle === lifecycle);
    }

    // Tag filter
    if (activeTag) {
      result = result.filter((t) => t.seo.keywords.includes(activeTag));
    }

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.seo.keywords.some((k) => k.toLowerCase().includes(q)),
      );
    }

    // Sort
    switch (sort) {
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
        // Simulate: reverse order (last added first)
        result.reverse();
        break;
      case 'popular':
        // Simulate: keep original order
        break;
    }

    return result;
  }, [tools, query, sort, lifecycle, activeTag]);

  const hasFilters = query.trim() || lifecycle !== 'all' || activeTag;

  const clearFilters = () => {
    setQuery('');
    setSort('name-asc');
    setLifecycle('all');
    setActiveTag(null);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              All {category} tools
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length} of {tools.length})
              </span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse our complete {category} toolkit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter..."
                className="h-9 w-44 pl-9"
                aria-label="Filter tools"
              />
            </div>
            <Select value={lifecycle} onValueChange={(v) => setLifecycle(v as LifecycleFilter)}>
              <SelectTrigger className="h-9 w-36" aria-label="Filter by lifecycle">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" aria-hidden />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="h-9 w-40" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {/* Tag cloud */}
        {allTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tags:</span>
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn(
                  'rounded-md border px-2 py-0.5 text-xs transition-colors',
                  activeTag === tag
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground',
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium">No tools match your filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or clearing filters.
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={routes.tool(tool.category, tool.slug)}
                className="group block h-full"
              >
                <Card className="card-interactive h-full">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{tool.title}</h3>
                        <Badge
                          variant={tool.lifecycle === 'stable' ? 'default' : 'outline'}
                          className="mt-1.5 text-xs capitalize"
                        >
                          {tool.lifecycle}
                        </Badge>
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-1">
                      {tool.seo.keywords.slice(0, 3).map((kw) => (
                        <span key={kw} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
