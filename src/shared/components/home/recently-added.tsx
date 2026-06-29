// src/shared/components/home/recently-added.tsx — Recently added tools section.

import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/shared/components/page-container';
import { SectionHeading } from '@/shared/components/section-heading';
import { allManifests } from '@/generated/registry';
import { routes } from '@/shared/config/routes';

export function RecentlyAdded() {
  const recent = [...allManifests].slice(-4);

  return (
    <section aria-labelledby="recent-heading" className="bg-muted/30">
      <PageContainer className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="New"
          title="Recently added"
          description="The latest tools to join the platform."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((tool) => (
            <li key={tool.slug}>
              <Link href={routes.tool(tool.category, tool.slug)} className="group block h-full">
                <Card className="card-interactive h-full">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      <span>New</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{tool.title}</h3>
                      <Badge variant="outline" className="mt-1.5 text-xs capitalize">
                        {tool.category}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    <ArrowUpRight
                      className="mt-auto h-4 w-4 text-muted-foreground transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
