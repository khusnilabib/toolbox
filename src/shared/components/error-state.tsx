// src/shared/components/error-state.tsx — Error state (PC-08 Error Experience).

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ToolError } from '@packages/types';

export interface ErrorStateProps {
  error?: ToolError | null;
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  error,
  title,
  description,
  retry,
  className,
}: ErrorStateProps) {
  const what = error?.userMessage.what ?? title ?? 'Something went wrong';
  const why = error?.userMessage.why;
  const howToFix = error?.userMessage.howToFix ?? description ?? 'Please try again.';
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{what}</p>
          {why ? <p className="text-xs text-muted-foreground">{why}</p> : null}
          <p className="text-sm text-muted-foreground">{howToFix}</p>
        </div>
      </div>
      {retry ? (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
