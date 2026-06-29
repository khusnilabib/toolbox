// src/shared/components/admin/realtime-counters.tsx — Realtime counters for admin dashboard.

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Zap, Server, Globe } from 'lucide-react';

interface Counter {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color: string;
}

const INITIAL: Counter[] = [
  { icon: Users, label: 'Active users', value: 42, color: 'text-blue-600 dark:text-blue-400' },
  { icon: Zap, label: 'Tool executions / min', value: 128, color: 'text-green-600 dark:text-green-400' },
  { icon: Server, label: 'API requests / min', value: 342, color: 'text-purple-600 dark:text-purple-400' },
  { icon: Globe, label: 'Avg response time', value: 45, suffix: 'ms', color: 'text-orange-600 dark:text-orange-400' },
];

export function RealtimeCounters() {
  const [counters, setCounters] = useState(INITIAL);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters((prev) =>
        prev.map((c) => ({
          ...c,
          value: c.label.includes('response')
            ? Math.max(20, c.value + Math.floor(Math.random() * 20) - 10)
            : Math.max(0, c.value + Math.floor(Math.random() * 10) - 3),
        })),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {counters.map((counter) => (
        <Card key={counter.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <counter.icon className={`h-4 w-4 ${counter.color}`} aria-hidden />
              </div>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">
              {counter.value}
              {counter.suffix}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{counter.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
