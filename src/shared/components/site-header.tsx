// src/shared/components/site-header.tsx — Top-level site header with nav + search + theme toggle.

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Search, X, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PageContainer } from './page-container';
import { ThemeToggle } from './theme-toggle';
import { routes } from '@/shared/config/routes';
import { categories } from '@/shared/config/categories';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <PageContainer className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="px-4 pt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </SheetTitle>
              <nav className="mt-2 flex flex-col gap-1 px-2" aria-label="Mobile navigation">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={routes.category(c.slug)}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link
            href={routes.home}
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <Wrench className="h-5 w-5" aria-hidden />
            <span>Toolbox</span>
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.slug}
                href={routes.category(c.slug)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <form
            role="search"
            className="relative hidden max-w-xs flex-1 md:block"
            onSubmit={(e) => e.preventDefault()}
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search tools…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tools"
              className="h-9 pl-9"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </form>
          <ThemeToggle />
        </div>
      </PageContainer>
    </header>
  );
}
