// src/shared/components/dashboard/profile-completion.tsx — Profile completion widget.

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

const STEPS = [
  { label: 'Create account', done: true },
  { label: 'Verify email', done: true },
  { label: 'Set display name', done: false },
  { label: 'Add avatar', done: false },
  { label: 'Complete profile', done: false },
];

export function ProfileCompletion() {
  const completed = STEPS.filter((s) => s.done).length;
  const percentage = Math.round((completed / STEPS.length) * 100);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Profile completion</h3>
          <span className="text-lg font-bold tabular-nums">{percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Steps */}
        <ul className="mt-4 space-y-2">
          {STEPS.map((step) => (
            <li key={step.label} className="flex items-center gap-2 text-xs">
              {step.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" aria-hidden />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              )}
              <span className={step.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>

        {percentage < 100 ? (
          <Button size="sm" variant="outline" className="mt-4 w-full">
            Complete profile
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
