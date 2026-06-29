// src/shared/components/home/why-choose-us.tsx — Why choose us section.

import { Zap, ShieldCheck, Globe, Accessibility, GitBranch, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/shared/components/page-container';
import { SectionHeading } from '@/shared/components/section-heading';

const VALUES = [
  {
    icon: Zap,
    title: 'Instant',
    description: 'Tools run in your browser. No server round-trip, no waiting. Sub-second execution on modern hardware.',
  },
  {
    icon: ShieldCheck,
    title: 'Private',
    description: 'Your data never leaves your device for core tools. No uploads, no server-side processing, no tracking.',
  },
  {
    icon: Globe,
    title: 'Free',
    description: 'No account required. No paywalls on core tasks. No hidden premium tier. Just tools that work.',
  },
  {
    icon: Accessibility,
    title: 'Accessible',
    description: 'WCAG 2.1 AA compliant. Keyboard-first navigation. Screen reader support. Respects reduced motion.',
  },
  {
    icon: GitBranch,
    title: 'Open',
    description: 'Built on open standards. Transparent architecture. No vendor lock-in. Your tools stay yours.',
  },
  {
    icon: Heart,
    title: 'Crafted',
    description: 'Every tool follows a standardized 7-stage lifecycle. Consistent UX. Predictable behavior.',
  },
];

export function WhyChooseUs() {
  return (
    <section aria-labelledby="values-heading" className="border-b border-border bg-background">
      <PageContainer className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Principles"
          title="Built for trust"
          description="Privacy, speed, and accessibility are architectural locks — not features."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <Card key={value.title} className="card-interactive">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <value.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
