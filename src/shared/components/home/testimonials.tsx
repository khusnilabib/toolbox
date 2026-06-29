// src/shared/components/home/testimonials.tsx — Testimonials placeholder section.

import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageContainer } from '@/shared/components/page-container';
import { SectionHeading } from '@/shared/components/section-heading';

const TESTIMONIALS = [
  {
    quote: 'Finally, a PDF merger that doesn\'t ask me to sign up or upload my files to some random server. It just works.',
    name: 'Anonymous User',
    role: 'Designer',
    initials: 'AU',
  },
  {
    quote: 'I use the JSON formatter daily. The fact that it runs locally means I can use it for sensitive data without worry.',
    name: 'Anonymous Developer',
    role: 'Backend Engineer',
    initials: 'AD',
  },
  {
    quote: 'The image compressor is faster than the desktop app I was paying for. And it respects my privacy.',
    name: 'Anonymous Creator',
    role: 'Content Creator',
    initials: 'AC',
  },
];

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="border-b border-border bg-background">
      <PageContainer className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Community"
          title="Loved by makers"
          description="Real feedback from real users who value their privacy."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <Card key={idx} className="card-interactive">
              <CardContent className="flex flex-col gap-4 p-6">
                <Quote className="h-6 w-6 text-accent" aria-hidden />
                <blockquote className="flex-1 text-sm text-foreground text-pretty">
                  "{t.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Testimonials shown are illustrative. Join our community of privacy-conscious makers.
        </p>
      </PageContainer>
    </section>
  );
}
