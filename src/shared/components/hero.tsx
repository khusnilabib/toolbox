// src/shared/components/hero.tsx — Landing hero section.

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from './page-container';

export interface HeroProps {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
}

export function Hero({
  title = 'Browser-first productivity tools. Private by default.',
  description = 'Resize images, merge PDFs, format JSON, and dozens more — all running locally in your browser. No accounts, no uploads, no tracking.',
  primaryHref = '/tools',
  primaryLabel = 'Browse all tools',
}: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden border-b border-border bg-background"
    >
      <PageContainer className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-title"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-tight"
          >
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-5 w-5" aria-hidden />}
            title="Instant"
            description="Runs in your browser. No server round-trip, no waiting."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
            title="Private"
            description="Your data never leaves your device for core tools."
          />
          <FeatureCard
            icon={<Globe className="h-5 w-5" aria-hidden />}
            title="Free"
            description="No account required. No paywalls on core tasks."
          />
        </div>
      </PageContainer>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 text-left">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
