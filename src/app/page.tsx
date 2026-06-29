// src/app/page.tsx — Landing page (hero, brand values, featured categories).

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/shared/components/hero';
import { PageContainer } from '@/shared/components/page-container';
import { SectionHeading } from '@/shared/components/section-heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categories } from '@/shared/config/categories';
import { routes } from '@/shared/config/routes';
import { organizationJsonLd, websiteJsonLd } from '@/shared/lib/json-ld';

export default function HomePage() {
  const orgLd = organizationJsonLd();
  const siteLd = websiteJsonLd();

  return (
    <>
      {/* JSON-LD: Organization + WebSite with SearchAction */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />

      <Hero />
      <section aria-labelledby="categories-heading" className="border-b border-border">
        <PageContainer className="py-14">
          <SectionHeading
            eyebrow="Catalogue"
            title="Browse by category"
            description="A growing collection of focused tools. Each tool solves exactly one problem."
          />
          <ul
            id="categories-heading"
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={routes.category(c.slug)}
                  className="group block rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section aria-labelledby="values-heading" className="bg-muted/30">
        <PageContainer className="py-14">
          <SectionHeading
            eyebrow="Principles"
            title="Built for trust"
            description="Privacy, speed, and accessibility are architectural locks — not features."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Privacy by default</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Core tools run client-side. Your data never touches a server unless the tool
                  explicitly requires it.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">No accounts required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Get value instantly. Registration is only suggested when it adds clear value to
                  your workflow.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Accessible & fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  WCAG AA, keyboard-first navigation, reduced-motion support, and minimal JS payload
                  on every page.
                </p>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
