// src/shared/components/ads/ad-components.tsx — Reusable ad components.
// Sprint 12 Phase 1 — All ads reserve layout space to prevent CLS.

'use client';

import { useEffect, useRef } from 'react';
import { useAdContext } from './ad-provider';

interface AdBaseProps {
  slot?: string;
  className?: string;
  /** Reserved height to prevent CLS */
  minHeight: number;
  label?: string;
}

function AdBase({ slot, className, minHeight, label = 'Advertisement' }: AdBaseProps) {
  const { enabled, network } = useAdContext();
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!enabled || !slot || network !== 'adsense') return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle.push({});
    } catch {
      // AdSense not loaded yet — no-op
    }
  }, [enabled, slot, network]);

  if (!enabled) {
    // Reserve space even when ads disabled to prevent CLS when enabled
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20 ${className ?? ''}`}
        style={{ minHeight }}
        aria-hidden
      >
        <span className="text-xs text-muted-foreground/40">{label} (disabled)</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center ${className ?? ''}`}
      style={{ minHeight }}
    >
      <span className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/50">{label}</span>
      {network === 'adsense' && slot ? (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : null}
    </div>
  );
}

/** 728×90 leaderboard — homepage between sections, category below hero */
export function AdBanner({ slot, className }: { slot?: string; className?: string }) {
  return <AdBase slot={slot} className={className} minHeight={90} label="Advertisement" />;
}

/** 300×250 rectangle — sidebar, category pages */
export function AdRectangle({ slot, className }: { slot?: string; className?: string }) {
  return <AdBase slot={slot} className={className} minHeight={250} label="Advertisement" />;
}

/** 160×600 sidebar — desktop only */
export function AdSidebar({ slot, className }: { slot?: string; className?: string }) {
  return <AdBase slot={slot} className={className} minHeight={600} label="Advertisement" />;
}

/** In-article responsive — tool pages below result */
export function AdInArticle({ slot, className }: { slot?: string; className?: string }) {
  return <AdBase slot={slot} className={className} minHeight={120} label="Advertisement" />;
}

/** Between tools on category grid — subtle, never interrupts */
export function AdBetweenTools({ slot, className }: { slot?: string; className?: string }) {
  return <AdBase slot={slot} className={className} minHeight={100} label="Sponsored" />;
}
