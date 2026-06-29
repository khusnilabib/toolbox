// src/shared/components/home/newsletter.tsx — Newsletter placeholder section.

import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/shared/components/page-container';

export function Newsletter() {
  return (
    <section aria-labelledby="newsletter-heading" className="border-b border-border bg-background">
      <PageContainer className="py-16 sm:py-20">
        <Card className="overflow-hidden border-border bg-gradient-mesh">
          <CardContent className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Mail className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 id="newsletter-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Stay in the loop
                </h2>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  Get notified when we add new tools. No spam, no tracking. Unsubscribe anytime.
                  We send at most one email per month.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
                  New tool announcements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Product updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Privacy-first tips
                </li>
              </ul>
            </div>

            <form className="flex flex-col gap-3">
              <label htmlFor="newsletter-email" className="text-sm font-medium">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-11"
              />
              <Button type="submit" size="lg" className="h-11">
                Subscribe
              </Button>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to receive occasional emails. We never share your address.
              </p>
            </form>
          </CardContent>
        </Card>
      </PageContainer>
    </section>
  );
}
