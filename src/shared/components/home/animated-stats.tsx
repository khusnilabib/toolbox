// src/shared/components/home/animated-stats.tsx — Animated statistics counter.

'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, ShieldCheck, Zap, Globe } from 'lucide-react';

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { icon: Wrench, value: 23, suffix: '+', label: 'Production tools' },
  { icon: ShieldCheck, value: 100, suffix: '%', label: 'Private by design' },
  { icon: Zap, value: 0, suffix: 'ms', label: 'Server round-trip' },
  { icon: Globe, value: 4, suffix: '', label: 'Tool categories' },
];

function useCountUp(target: number, durationMs = 1200, start: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, start]);
  return count;
}

export function AnimatedStats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          queueMicrotask(() => setVisible(true));
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="stats-heading" className="border-b border-border bg-background">
      <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
      <div ref={ref} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} start={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, start }: { stat: Stat; start: boolean }) {
  const count = useCountUp(stat.value, 1200, start);
  const Icon = stat.icon;
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight tabular-nums">
            {stat.value === 0 ? '<1' : count}
            {stat.suffix}
          </div>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
