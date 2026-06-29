// src/shared/components/tool-form-shell.tsx — Shared form wrapper for tool input forms.

'use client';

import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToolFormShellProps {
  title?: string;
  description?: string;
  onSubmit: () => void;
  submitLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function ToolFormShell({
  title,
  description,
  onSubmit,
  submitLabel = 'Run',
  loading = false,
  disabled = false,
  children,
  className,
}: ToolFormShellProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled && !loading) onSubmit();
      }}
      className={cn('space-y-4', className)}
    >
      {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {children}
      <div className="pt-2">
        <Button type="submit" disabled={disabled || loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
          {loading ? 'Processing…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
