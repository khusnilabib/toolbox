// src/shared/components/tool-content-renderer.tsx — Renders structured content for SEO.
// Sprint 14 Phase 2 — Dynamic content engine.

import { CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import type { ToolContent } from '@/shared/lib/tool-content';

export function ToolContentRenderer({ content }: { content: ToolContent }) {
  return (
    <div className="space-y-10">
      {/* Introduction */}
      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Introduction</h2>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{content.introduction}</p>
      </section>

      {/* What it does + Why use it */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="mb-2 text-base font-semibold">What it does</h3>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{content.whatItDoes}</p>
        </section>
        <section>
          <h3 className="mb-2 text-base font-semibold">Why use it</h3>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{content.whyUseIt}</p>
        </section>
      </div>

      {/* Features + Benefits */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="mb-3 text-base font-semibold">Features</h3>
          <ul className="space-y-2">
            {content.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-3 text-base font-semibold">Benefits</h3>
          <ul className="space-y-2">
            {content.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Use cases */}
      <section>
        <h3 className="mb-3 text-base font-semibold">Common use cases</h3>
        <ul className="space-y-1.5">
          {content.useCases.map((u, i) => (
            <li key={i} className="text-sm text-muted-foreground">
              <span className="mr-2 text-accent">→</span>{u}
            </li>
          ))}
        </ul>
      </section>

      {/* Step-by-step guide */}
      <section>
        <h3 className="mb-3 text-base font-semibold">How to use this tool</h3>
        <ol className="space-y-2">
          {content.stepByStep.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Examples */}
      <section>
        <h3 className="mb-3 text-base font-semibold">Examples</h3>
        <div className="space-y-3">
          {content.examples.map((ex, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Input</p>
                  <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm font-mono">{ex.input}</code>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Output</p>
                  <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm font-mono break-all">{ex.output}</code>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{ex.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best practices + Common mistakes */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="mb-3 text-base font-semibold">Best practices</h3>
          <ul className="space-y-2">
            {content.bestPractices.map((bp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                {bp}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-3 text-base font-semibold">Common mistakes</h3>
          <ul className="space-y-2">
            {content.commonMistakes.map((cm, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                {cm}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Limitations */}
      <section>
        <h3 className="mb-3 text-base font-semibold">Limitations</h3>
        <ul className="space-y-1.5">
          {content.limitations.map((l, i) => (
            <li key={i} className="text-sm text-muted-foreground">
              <span className="mr-2 text-muted-foreground/50">•</span>{l}
            </li>
          ))}
        </ul>
      </section>

      {/* Privacy statement */}
      <section className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold">Privacy statement</h3>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">{content.privacyStatement}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
