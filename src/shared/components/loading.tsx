// src/shared/components/loading.tsx — Loading spinner.

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-6 w-6' } as const;

export function Loading({ label = 'Loading…', className, size = 'md' }: LoadingProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)}
    >
      <Loader2 className={cn('animate-spin', sizeMap[size])} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export function FullPageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <Loading label={label} size="lg" />
    </div>
  );
}
