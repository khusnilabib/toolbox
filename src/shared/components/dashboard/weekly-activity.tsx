// src/shared/components/dashboard/weekly-activity.tsx — Weekly activity chart (CSS-only).

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ACTIVITY = [3, 7, 5, 8, 6, 4, 2];

export function WeeklyActivity() {
  const max = Math.max(...ACTIVITY);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Weekly activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {ACTIVITY.map((value, idx) => {
            const height = max > 0 ? (value / max) * 100 : 0;
            const isToday = idx === new Date().getDay() - 1;
            return (
              <div key={DAYS[idx]} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isToday ? 'bg-accent' : 'bg-muted-foreground/30'
                    }`}
                    style={{ height: `${height}%`, minHeight: value > 0 ? '4px' : '0' }}
                    title={`${DAYS[idx]}: ${value} executions`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{DAYS[idx]}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {ACTIVITY.reduce((a, b) => a + b, 0)} executions this week
        </p>
      </CardContent>
    </Card>
  );
}
