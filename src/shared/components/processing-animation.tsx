// src/shared/components/processing-animation.tsx — Beautiful processing + success animations.
// Phase 3 Sprint UI 2.0.

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProcessingAnimationProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}

export function ProcessingAnimation({ status, message, progress = 0 }: ProcessingAnimationProps) {
  if (status === 'idle') return null;

  return (
    <div
      className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {status === 'processing' && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Outer ring */}
            <div className="h-16 w-16 rounded-full border-2 border-muted" />
            {/* Spinning arc */}
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-accent border-t-transparent" style={{ animationDuration: '0.8s' }} />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 animate-pulse rounded-full bg-accent" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{message ?? 'Processing...'}</p>
            {progress > 0 && (
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">{Math.round(progress)}%</p>
            )}
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-3 animate-scale-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden />
          </div>
          <p className="text-sm font-medium">{message ?? 'Done!'}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <span className="text-2xl font-bold text-destructive">!</span>
          </div>
          <p className="text-sm font-medium text-destructive">{message ?? 'Something went wrong'}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Shimmer loading skeleton for tool preview areas.
 */
export function PreviewSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer h-4 rounded"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Success checkmark with draw animation.
 */
export function SuccessCheckmark({ size = 48 }: { size?: number }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setDrawn(true));
  }, []);

  return (
    <div
      className="flex items-center justify-center rounded-full bg-green-500/10"
      style={{ width: size + 16, height: size + 16 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="hsl(142 71% 45%)"
          strokeWidth="3"
          className={cn('transition-all duration-300', drawn ? 'opacity-100' : 'opacity-0')}
        />
        <path
          d="M16 24 L22 30 L32 18"
          stroke="hsl(142 71% 45%)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('transition-all duration-500 ease-out', drawn ? 'opacity-100' : 'opacity-0')}
          style={{
            strokeDasharray: 30,
            strokeDashoffset: drawn ? 0 : 30,
            transitionDelay: '200ms',
          }}
        />
      </svg>
    </div>
  );
}
