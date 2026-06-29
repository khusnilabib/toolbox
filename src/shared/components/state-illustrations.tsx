// src/shared/components/state-illustrations.tsx — CSS/SVG illustrations for states.
// Phase 9 Sprint UI 2.0 — No external images, pure CSS/SVG.

import type { ReactNode } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
}

/** Empty box illustration — for empty states */
export function EmptyBoxIllustration({ size = 80, className }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="16" y="28" width="48" height="36" rx="4" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M16 28 L40 16 L64 28" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 16 L40 64" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/** Search illustration — for no search results */
export function SearchIllustration({ size = 80, className }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="36" cy="36" r="20" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
      <path d="M52 52 L64 64" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 36 L44 36" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Error illustration — for error states */
export function ErrorIllustration({ size = 80, className }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="40" cy="40" r="28" stroke="hsl(var(--destructive))" strokeWidth="2" />
      <path d="M28 28 L52 52 M52 28 L28 52" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 404 illustration — for not found */
export function NotFoundIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 120 72"
      fill="none"
      className={className}
      aria-hidden
    >
      <text x="60" y="48" textAnchor="middle" fontSize="40" fontWeight="700" fill="hsl(var(--muted-foreground))" opacity="0.3">
        404
      </text>
      <circle cx="30" cy="20" r="3" fill="hsl(var(--accent))" opacity="0.5" />
      <circle cx="90" cy="56" r="2" fill="hsl(var(--accent))" opacity="0.5" />
      <circle cx="100" cy="24" r="2.5" fill="hsl(var(--accent))" opacity="0.4" />
    </svg>
  );
}

/** Offline illustration — for offline state */
export function OfflineIllustration({ size = 80, className }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden
    >
      <path d="M16 32 Q40 12 64 32" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 44 Q40 28 56 44" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M32 56 Q40 48 48 56" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M20 60 L60 20" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Permission denied illustration */
export function LockIllustration({ size = 80, className }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="24" y="36" width="32" height="28" rx="4" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
      <path d="M30 36 V28 Q30 18 40 18 Q50 18 50 28 V36" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="48" r="3" fill="hsl(var(--muted-foreground))" />
      <path d="M40 51 V58" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Loading spinner — animated */
export function LoadingSpinner({ size = 32, className }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="12" stroke="hsl(var(--muted))" strokeWidth="3" />
      <path
        d="M16 4 A12 12 0 0 1 28 16"
        stroke="hsl(var(--accent))"
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          transformOrigin: 'center',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

/** State container — wraps illustration + text */
export interface StateContainerProps {
  illustration: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function StateContainer({ illustration, title, description, action }: StateContainerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="mb-4">{illustration}</div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
