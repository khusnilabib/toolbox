// src/shared/components/home/trusted-by.tsx — Trusted by section.

import { PageContainer } from '@/shared/components/page-container';

const TRUSTED_BY = [
  'Developer Teams',
  'Design Studios',
  'Content Creators',
  'Privacy Advocates',
  'Open Source Projects',
  'Independent Makers',
];

export function TrustedBy() {
  return (
    <section aria-labelledby="trusted-heading" className="border-b border-border bg-muted/30">
      <PageContainer className="py-10">
        <div className="text-center">
          <h2 id="trusted-heading" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trusted by makers who value privacy
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUSTED_BY.map((name) => (
              <li
                key={name}
                className="text-sm font-medium text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </section>
  );
}
