// src/shared/components/site-footer.tsx — Sticky site footer.

import Link from 'next/link';
import { PageContainer } from './page-container';
import { categories } from '@/shared/config/categories';
import { routes } from '@/shared/config/routes';
import { siteConfig } from '@/shared/config/site-config';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <PageContainer className="py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">{siteConfig.name}</p>
            <p className="text-xs text-muted-foreground">{siteConfig.description}</p>
          </div>
          <nav aria-label="Footer categories" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <ul className="space-y-1">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={routes.category(c.slug)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer resources" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Resources
            </p>
            <ul className="space-y-1">
              <li>
                <Link href={routes.tools} className="text-sm text-muted-foreground hover:text-foreground">
                  All tools
                </Link>
              </li>
              <li>
                <Link href={routes.admin} className="text-sm text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              </li>
              <li>
                <Link href={routes.health} className="text-sm text-muted-foreground hover:text-foreground">
                  Health check
                </Link>
              </li>
            </ul>
          </nav>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Privacy
            </p>
            <p className="text-xs text-muted-foreground">
              All core tools run client-side. Your files never leave your browser unless explicitly
              required.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {year} {siteConfig.name}. All rights reserved.
        </div>
      </PageContainer>
    </footer>
  );
}
