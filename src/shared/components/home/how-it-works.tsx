// src/shared/components/home/how-it-works.tsx — How it works section.

import { MousePointer, Settings2, Download, ShieldCheck } from 'lucide-react';
import { PageContainer } from '@/shared/components/page-container';
import { SectionHeading } from '@/shared/components/section-heading';

const STEPS = [
  {
    icon: MousePointer,
    title: 'Pick a tool',
    description: 'Browse the catalogue or search. Every tool is one click away — no sign-up, no install.',
    step: '01',
  },
  {
    icon: Settings2,
    title: 'Configure & run',
    description: 'Provide your input. Processing happens locally in your browser. No server round-trip.',
    step: '02',
  },
  {
    icon: Download,
    title: 'Download result',
    description: 'Preview the output, then download. Your file is generated locally — never uploaded.',
    step: '03',
  },
  {
    icon: ShieldCheck,
    title: 'Stay private',
    description: 'Your data never leaves your device. No tracking, no analytics on tool input or output.',
    step: '04',
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="bg-muted/30">
      <PageContainer className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Workflow"
          title="How it works"
          description="Four steps. Zero friction. Your data stays yours."
        />

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.step} className="relative">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {step.step}
                  </span>
                  <step.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
