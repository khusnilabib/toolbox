// src/shared/components/home/final-cta.tsx — CTA + newsletter combined (Sprint UI 3.0).

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/shared/components/page-container';
import { routes } from '@/shared/config/routes';

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="bg-background">
      <PageContainer className="py-16 sm:py-20">
        <Card className="overflow-hidden border-border bg-gradient-mesh">
          <CardContent className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            {/* Left — CTA */}
            <div className="space-y-4">
              <h2 id="cta-heading" className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                Ready to work privately?
              </h2>
              <p className="text-sm text-muted-foreground text-pretty">
                Browse 23 tools that respect your privacy. No sign-up required.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6">
                  <Link href={routes.tools}>
                    Browse all tools
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6">
                  <Link href="/about">
                    Learn more
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
                  No sign-up
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
                  No tracking
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Free forever
                </span>
              </div>
            </div>

            {/* Right — Newsletter */}
            <div className="rounded-xl border border-border bg-background/50 p-6">
              <h3 className="text-sm font-semibold">Get notified about new tools</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                One email per month. No spam. Unsubscribe anytime.
              </p>
              <form className="mt-4 flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="h-10"
                  aria-label="Email address"
                />
                <Button type="submit" size="sm" className="h-10">
                  Subscribe
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </section>
  );
}
