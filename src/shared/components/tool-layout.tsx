// src/shared/components/tool-layout.tsx — Premium universal Tool Layout.
// Phase 4 Sprint UI 1.0 — Redesigned with 12 sections.

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Share2,
  Star,
  Clock,
  Bookmark,
  Wrench,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageContainer } from './page-container';
import { SectionHeading } from './section-heading';
import { ToolContentRenderer } from '@/shared/components/tool-content-renderer';
import { getToolContent } from '@/shared/lib/tool-content';
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
    <main className="flex-1 animate-page-enter">
      {/* 1. Hero with breadcrumb */}
      <section
        aria-labelledby="tool-hero-title"
        className="border-b border-border bg-gradient-mesh"
      >
        <PageContainer className="py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href={routes.home} className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link href={routes.category(manifest.category)} className="capitalize transition-colors hover:text-foreground">
                  {manifest.category}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3 w-3" />
              </li>
              <li className="text-foreground">{manifest.title}</li>
            </ol>
          </nav>

          {/* Title + badges */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">{manifest.category}</Badge>
                <Badge variant="outline" className="capitalize">{manifest.lifecycle}</Badge>
                <Badge variant="outline">
                  {manifest.execution === 'browser' ? (
                    <>
                      <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                      Runs locally
                    </>
                  ) : (
                    'Server-side'
                  )}
                </Badge>
                <Badge variant="outline">
                  <Zap className="mr-1 h-3 w-3" aria-hidden />
                  v{manifest.version}
                </Badge>
              </div>

              <h1
                id="tool-hero-title"
                className="text-3xl font-bold tracking-tight text-balance sm:text-4xl"
              >
                {manifest.title}
              </h1>

              <p className="max-w-2xl text-base text-muted-foreground text-pretty">
                {manifest.description}
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Private
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Instant
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Free
                </span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Star className="mr-2 h-4 w-4" aria-hidden />
                Favorite
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" aria-hidden />
                Share
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. Tool card with input/preview/download */}
      <section aria-labelledby="tool-section-title" className="border-b border-border bg-background">
        <PageContainer className="py-8 sm:py-12">
          <h2 id="tool-section-title" className="sr-only">
            {manifest.title} tool
          </h2>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main tool area */}
            <div className="min-w-0">
              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Wrench className="h-4 w-4" aria-hidden />
                    </div>
                    <CardTitle className="text-base">Tool</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {children}
                </CardContent>
              </Card>

              {/* Result section (if provided) */}
              {result ? (
                <Card className="mt-6">
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="text-base">Result</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {result}
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Sidebar (1/3 width) */}
            <aside className="space-y-6">
              {/* Recent history */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Recent
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Your recent tool executions will appear here.
                  </p>
                </CardContent>
              </Card>

              {/* Tool info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tool info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-mono">{manifest.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lifecycle</span>
                    <span className="capitalize">{manifest.lifecycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max input</span>
                    <span className="font-mono">{(manifest.limits.maxInputSize / 1024 / 1024).toFixed(0)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth required</span>
                    <span>{manifest.limits.requiresAuth ? 'Yes' : 'No'}</span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </PageContainer>
      </section>

      {/* 3. Knowledge base content (if available) */}
      {(() => {
        const content = getToolContent(manifest.slug);
        if (!content) {
          // Fallback to old static intro
          return (
            <section aria-labelledby="intro-heading" className="border-b border-border bg-muted/30">
              <PageContainer className="py-12">
                <div className="mx-auto max-w-3xl">
                  <SectionHeading eyebrow="About" title={`About ${manifest.title}`} />
                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground text-pretty">
                    <p>{manifest.description} This tool runs entirely in your browser.</p>
                  </div>
                </div>
              </PageContainer>
            </section>
          );
        }
        return (
          <section aria-labelledby="content-heading" className="border-b border-border bg-muted/30">
            <PageContainer className="py-12 sm:py-16">
              <div className="mx-auto max-w-4xl">
                <h2 id="content-heading" className="sr-only">{manifest.title} guide</h2>
                <ToolContentRenderer content={content} />
              </div>
            </PageContainer>
          </section>
        );
      })()}

      {/* 4. FAQ */}
      {manifest.seo.faq.length > 0 ? (
        <section aria-labelledby="faq-heading" className="border-b border-border bg-background">
          <PageContainer className="py-12 sm:py-16">
            <SectionHeading
              eyebrow="Help"
              title="Frequently asked questions"
              description="Everything you need to know about this tool."
            />
            <div className="mx-auto mt-8 max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {manifest.seo.faq.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </PageContainer>
        </section>
      ) : null}

      {/* 5. Related tools */}
      {related && related.length > 0 ? (
        <section aria-labelledby="related-heading" className="bg-muted/30">
          <PageContainer className="py-12 sm:py-16">
            <SectionHeading
              eyebrow="Discover"
              title="Related tools"
              description="Tools that work well with this one."
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 4).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={routes.tool(tool.category, tool.slug)}
                    className="group block h-full"
                  >
                    <Card className="card-interactive h-full">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-foreground">{tool.title}</h3>
                        <Badge variant="outline" className="mt-1.5 text-xs capitalize">
                          {tool.category}
                        </Badge>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </PageContainer>
        </section>
      ) : null}
    </main>
  );
}
