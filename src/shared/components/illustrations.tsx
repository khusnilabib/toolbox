// src/shared/components/illustrations.tsx — Custom SVG illustration system.
// Phase 3 Sprint UI 2.0 — Shared visual language: monochrome geometric + blue accent.
// All illustrations use the same stroke width, grid, and color palette.

import type { ReactNode } from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
}

const STROKE = 'hsl(var(--muted-foreground))';
const STROKE_LIGHT = 'hsl(var(--muted-foreground) / 0.4)';
const ACCENT = 'hsl(var(--accent))';
const ACCENT_LIGHT = 'hsl(var(--accent) / 0.2)';
const BG = 'hsl(var(--muted) / 0.5)';

/** Shared wrapper for consistent sizing and centering */
function IllustrationWrapper({ children, size = 120, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

/** 404 — Lost in space */
export function NotFoundIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Background circle */}
        <circle cx="60" cy="60" r="50" stroke={STROKE_LIGHT} strokeWidth="1" strokeDasharray="4 4" />
        {/* Large 404 text */}
        <text x="60" y="68" textAnchor="middle" fontSize="32" fontWeight="700" fill={STROKE} opacity="0.3" fontFamily="Inter, sans-serif">
          404
        </text>
        {/* Accent dots */}
        <circle cx="30" cy="30" r="3" fill={ACCENT} opacity="0.6" />
        <circle cx="92" cy="88" r="2" fill={ACCENT} opacity="0.5" />
        <circle cx="100" cy="36" r="2.5" fill={ACCENT} opacity="0.4" />
        {/* Compass needle */}
        <path d="M60 20 L64 28 L60 26 L56 28 Z" fill={ACCENT} />
      </svg>
    </IllustrationWrapper>
  );
}

/** 500 — Error state */
export function ErrorIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Background hexagon */}
        <path d="M60 12 L100 36 L100 84 L60 108 L20 84 L20 36 Z" stroke={STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 3" />
        {/* Warning triangle */}
        <path d="M60 32 L84 76 L36 76 Z" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinejoin="round" fill="hsl(var(--destructive) / 0.05)" />
        {/* Exclamation */}
        <path d="M60 48 L60 62" stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="70" r="2" fill="hsl(var(--destructive))" />
      </svg>
    </IllustrationWrapper>
  );
}

/** Empty Search — No results */
export function EmptySearchIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Magnifying glass */}
        <circle cx="52" cy="52" r="28" stroke={STROKE} strokeWidth="2" />
        <path d="M72 72 L96 96" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
        {/* Question mark inside */}
        <path d="M48 44 Q52 40 56 44 Q56 48 52 50 L52 56" stroke={STROKE_LIGHT} strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="52" cy="62" r="1.5" fill={STROKE_LIGHT} />
        {/* Accent sparkles */}
        <path d="M88 28 L90 32 L94 34 L90 36 L88 40 L86 36 L82 34 L86 32 Z" fill={ACCENT} opacity="0.5" />
        <circle cx="28" cy="88" r="2" fill={ACCENT} opacity="0.4" />
      </svg>
    </IllustrationWrapper>
  );
}

/** Empty Favorites — Heart outline */
export function EmptyFavoritesIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Heart outline */}
        <path
          d="M60 92 C60 92 28 72 28 48 C28 36 38 28 48 28 C54 28 58 32 60 36 C62 32 66 28 72 28 C82 28 92 36 92 48 C92 72 60 92 60 92 Z"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={ACCENT_LIGHT}
        />
        {/* Plus indicator */}
        <circle cx="84" cy="40" r="10" fill={ACCENT} />
        <path d="M84 36 L84 44 M80 40 L88 40" stroke="hsl(var(--background))" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IllustrationWrapper>
  );
}

/** Empty History — Clock */
export function EmptyHistoryIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Clock circle */}
        <circle cx="60" cy="60" r="36" stroke={STROKE} strokeWidth="2" />
        {/* Clock hands */}
        <path d="M60 40 L60 60 L76 68" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        {/* Tick marks */}
        <path d="M60 28 L60 32 M92 60 L88 60 M60 92 L60 88 M28 60 L32 60" stroke={STROKE_LIGHT} strokeWidth="2" strokeLinecap="round" />
        {/* Accent dot at center */}
        <circle cx="60" cy="60" r="3" fill={ACCENT} />
      </svg>
    </IllustrationWrapper>
  );
}

/** Empty Dashboard — Empty grid */
export function EmptyDashboardIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Grid cards */}
        <rect x="24" y="28" width="32" height="24" rx="4" stroke={STROKE} strokeWidth="2" fill={BG} />
        <rect x="64" y="28" width="32" height="24" rx="4" stroke={STROKE} strokeWidth="2" fill={BG} />
        <rect x="24" y="60" width="32" height="32" rx="4" stroke={STROKE} strokeWidth="2" fill={BG} />
        <rect x="64" y="60" width="32" height="32" rx="4" stroke={STROKE_LIGHT} strokeWidth="2" strokeDasharray="3 3" />
        {/* Plus on last card */}
        <path d="M80 72 L80 80 M76 76 L84 76" stroke={STROKE_LIGHT} strokeWidth="2" strokeLinecap="round" />
        {/* Accent dot */}
        <circle cx="40" cy="40" r="2" fill={ACCENT} />
      </svg>
    </IllustrationWrapper>
  );
}

/** No Internet — Disconnected */
export function NoInternetIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* WiFi waves */}
        <path d="M28 56 Q60 24 92 56" stroke={STROKE} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M40 68 Q60 48 80 68" stroke={STROKE_LIGHT} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M48 80 Q60 68 72 80" stroke={STROKE_LIGHT} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Slash */}
        <path d="M28 92 L92 28" stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeLinecap="round" />
        {/* Accent dot */}
        <circle cx="60" cy="88" r="3" fill={ACCENT} opacity="0.6" />
      </svg>
    </IllustrationWrapper>
  );
}

/** No Results — Empty document */
export function NoResultsIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Document */}
        <path d="M36 24 L72 24 L84 36 L84 96 L36 96 Z" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" fill={BG} />
        {/* Folded corner */}
        <path d="M72 24 L72 36 L84 36" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" />
        {/* Lines (faded) */}
        <path d="M44 48 L76 48 M44 56 L76 56 M44 64 L64 64" stroke={STROKE_LIGHT} strokeWidth="2" strokeLinecap="round" />
        {/* Magnifying glass overlay */}
        <circle cx="78" cy="80" r="12" stroke={ACCENT} strokeWidth="2" fill="hsl(var(--background))" />
        <path d="M87 89 L96 98" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </IllustrationWrapper>
  );
}

/** Coming Soon — Rocket */
export function ComingSoonIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Rocket body */}
        <path d="M60 24 C68 32 72 44 72 56 L72 72 L48 72 L48 56 C48 44 52 32 60 24 Z" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" fill={BG} />
        {/* Window */}
        <circle cx="60" cy="48" r="6" stroke={ACCENT} strokeWidth="2" fill={ACCENT_LIGHT} />
        {/* Fins */}
        <path d="M48 64 L40 76 L48 72 Z" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" fill={BG} />
        <path d="M72 64 L80 76 L72 72 Z" stroke={STROKE} strokeWidth="2" strokeLinejoin="round" fill={BG} />
        {/* Flame */}
        <path d="M56 72 L60 84 L64 72" stroke="hsl(var(--warning))" strokeWidth="2" strokeLinecap="round" fill="hsl(var(--warning) / 0.2)" />
        {/* Stars */}
        <circle cx="32" cy="40" r="1.5" fill={ACCENT} opacity="0.6" />
        <circle cx="92" cy="52" r="1.5" fill={ACCENT} opacity="0.5" />
        <circle cx="96" cy="32" r="1" fill={ACCENT} opacity="0.4" />
      </svg>
    </IllustrationWrapper>
  );
}

/** Maintenance — Wrench */
export function MaintenanceIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Gear */}
        <circle cx="60" cy="60" r="24" stroke={STROKE} strokeWidth="2" fill={BG} />
        <circle cx="60" cy="60" r="8" stroke={STROKE} strokeWidth="2" fill="none" />
        {/* Gear teeth */}
        <path d="M60 24 L60 32 M60 88 L60 96 M24 60 L32 60 M88 60 L96 60 M36 36 L42 42 M78 78 L84 84 M84 36 L78 42 M42 78 L36 84" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        {/* Accent center */}
        <circle cx="60" cy="60" r="3" fill={ACCENT} />
      </svg>
    </IllustrationWrapper>
  );
}

/** Upload Empty — Cloud upload */
export function UploadEmptyIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Cloud */}
        <path
          d="M36 72 C28 72 24 64 24 56 C24 48 32 44 36 44 C36 32 48 24 60 24 C72 24 84 32 84 44 C92 44 96 52 96 60 C96 68 88 72 84 72 L36 72 Z"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={BG}
        />
        {/* Upload arrow */}
        <path d="M60 44 L60 64 M52 52 L60 44 L68 52" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IllustrationWrapper>
  );
}

/** Processing — Spinning gear */
export function ProcessingIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Outer ring */}
        <circle cx="60" cy="60" r="40" stroke={STROKE_LIGHT} strokeWidth="2" strokeDasharray="8 4" />
        {/* Spinning arc */}
        <path
          d="M60 20 A40 40 0 0 1 100 60"
          stroke={ACCENT}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          style={{ transformOrigin: 'center', animation: 'spin 1s linear infinite' }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {/* Center dot */}
        <circle cx="60" cy="60" r="4" fill={ACCENT} className="processing-pulse" />
      </svg>
    </IllustrationWrapper>
  );
}

/** Success — Checkmark */
export function SuccessIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Circle */}
        <circle cx="60" cy="60" r="40" stroke="hsl(142 71% 45%)" strokeWidth="2" fill="hsl(142 71% 45% / 0.05)" />
        {/* Checkmark */}
        <path
          d="M44 60 L54 70 L76 48"
          stroke="hsl(142 71% 45%)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="success-draw"
        />
      </svg>
    </IllustrationWrapper>
  );
}

/** Generic Error — Broken */
export function GenericErrorIllustration({ size = 120, className }: IllustrationProps) {
  return (
    <IllustrationWrapper size={size} className={className}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Broken plug */}
        <rect x="40" y="36" width="40" height="24" rx="4" stroke={STROKE} strokeWidth="2" fill={BG} />
        <path d="M48 36 L48 28 M56 36 L56 28 M64 36 L64 28 M72 36 L72 28" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        <path d="M48 60 L48 68 M72 60 L72 68" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
        {/* Lightning bolt (disconnect) */}
        <path d="M60 68 L52 84 L60 84 L56 96 L68 80 L60 80 L64 68 Z" fill="hsl(var(--warning))" opacity="0.8" />
      </svg>
    </IllustrationWrapper>
  );
}

/** State container — wraps illustration + title + description + action */
export interface StateContainerProps {
  illustration: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function StateContainer({ illustration, title, description, action }: StateContainerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
      <div className="mb-6">{illustration}</div>
      <h3 className="text-lg font-semibold text-foreground text-balance">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
