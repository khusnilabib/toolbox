// src/shared/components/tool-layout.tsx — Universal Tool Layout (PC-05 UX Consistency).
// 9 sections: Hero → Tool → Result → FAQ → Related → Docs → Feedback → Footer (external).

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from './page-container';
import { SectionHeading } from './section-heading';
import type { ToolManifest } from '@packages/types';
import { routes } from '@/shared/config/routes';

export interface ToolLayoutProps {
  manifest: ToolManifest;
  /** The interactive tool widget (input + processing + preview). */
  children: ReactNode;
  /** Optional result section content (shown after successful processing). */
  result?: ReactNode;
  /** Related tool manifests (max 4 shown). */
  related?: ToolManifest[];
}

export function ToolLayout({ manifest, children, result, related }: ToolLayoutProps) {
  return (
    <main className="flex-1">
      {/* 1. Hero */}
      <section
        aria-labelledby="tool-hero-title"
        className="border-b border-border bg-background"
      >
        <PageContainer className="py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <li>
                <Link href={routes.home} className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link href={routes.category(manifest.category)} className="capitalize hover:text-foreground">
                  {manifest.category}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li className="text-foreground">{manifest.title}</li>
            </ol>
          </nav>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">{manifest.category}</Badge>
              <Badge variant="outline" className="capitalize">{manifest.lifecycle}</Badge>
              <Badge variant="outline">{manifest.execution === 'browser' ? 'Runs locally' : 'Server-side'}</Badge>
            </div>
            <h1 id="tool-hero-title" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {manifest.title}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {manifest.description}
            </p>
          </div>
        </PageContainer>
      </section>

      {/* 2. Tool */}
      <section aria-label={`${manifest.title} tool`} className="border-b border-border">
        <PageContainer className="py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tool</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </PageContainer>
      </section>

      {/* 3. Result */}
      {result ? (
        <section aria-label="Result" className="border-b border-border bg-muted/30">
          <PageContainer className="py-8">
            <SectionHeading eyebrow="Output" title="Result" />
            <div className="mt-4">{result}</div>
          </PageContainer>
        </section>
      ) : null}

      {/* 4. FAQ */}
      <section aria-label="Frequently asked questions" className="border-b border-border">
        <PageContainer className="py-10">
          <SectionHeading
            eyebrow="Help"
            title="Frequently asked questions"
            description="Everything you need to know about this tool."
          />
          <Accordion type="single" collapsible className="mt-6">
            {manifest.seo.faq.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </PageContainer>
      </section>

      {/* 5. Related */}
      {related && related.length > 0 ? (
        <section aria-label="Related tools" className="border-b border-border bg-muted/30">
          <PageContainer className="py-10">
            <SectionHeading
              eyebrow="Discover"
              title="Related tools"
              description="Suggested next steps based on this tool."
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 4).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={routes.tool(tool.category, tool.slug)}
                    className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
                  >
                    <p className="text-sm font-semibold text-foreground">{tool.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tool.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </PageContainer>
        </section>
      ) : null}

      {/* 6. Docs (purpose + success criteria) */}
      <section aria-label="Tool documentation" className="border-b border-border">
        <PageContainer className="py-10">
          <SectionHeading eyebrow="Docs" title="How this tool works" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4" aria-hidden />
                  Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{manifest.purpose}</p>
                <p className="mt-3 text-xs text-muted-foreground">{manifest.userProblem}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <HelpCircle className="h-4 w-4" aria-hidden />
                  Success criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{manifest.successCriteria}</p>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* 7. Feedback */}
      <section aria-label="Feedback" className="bg-background">
        <PageContainer className="py-8">
          <div className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Was this tool helpful?</p>
              <p className="text-xs text-muted-foreground">Your feedback helps us improve the platform.</p>
            </div>
            <a
              href="mailto:feedback@toolbox.local?subject=Feedback"
              className="text-sm font-medium text-accent hover:underline"
            >
              Send feedback
            </a>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
