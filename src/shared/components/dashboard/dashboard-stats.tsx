// src/shared/components/dashboard/dashboard-stats.tsx — Dashboard statistics cards.

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Clock, Star, Download, TrendingUp } from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const STATS: StatItem[] = [
  { icon: Wrench, label: 'Tools used', value: 12, change: '+3', trend: 'up' },
  { icon: Clock, label: 'Total executions', value: 47, change: '+8', trend: 'up' },
  { icon: Star, label: 'Favorites', value: 5, change: '+1', trend: 'up' },
  { icon: Download, label: 'Downloads', value: 23, change: '+5', trend: 'up' },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.label} className="card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <stat.icon className="h-4 w-4" aria-hidden />
              </div>
              {stat.change ? (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                }`}>
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  {stat.change}
                </span>
              ) : null}
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">{stat.value}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
