// src/shared/lib/clarity.ts — Microsoft Clarity integration (heatmaps, session recording).

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

let initialised = false;

/**
 * Initialize Microsoft Clarity. Only runs in the browser and only if a project ID
 * is configured. Respects consent — call after user grants analytics consent.
 */
export function initClarity(): void {
  if (typeof window === 'undefined' || initialised) return;
  if (!CLARITY_PROJECT_ID) return;

  // Clarity snippet (official)
  (function (c: typeof window, l: Document, a: string, r: string) {
    const w = c as unknown as { clarity?: ((...args: unknown[]) => void) & { q?: unknown[] } };
    const doc = l as Document & { [key: string]: unknown };
    w.clarity = w.clarity || function (...args: unknown[]) {
      const fn = w.clarity as ((...a: unknown[]) => void) & { q?: unknown[] };
      fn.q = fn.q || [];
      fn.q.push(args);
    };
    const script = doc.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
    const firstScript = doc.getElementsByTagName(r)[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  })(window, document, 'clarity', 'script');

  initialised = true;
}

/**
 * Set Clarity custom tag (e.g., user ID, plan type).
 */
export function setClarityTag(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { clarity?: (...args: unknown[]) => void };
  w.clarity?.('set', key, value);
}

/**
 * Start Clarity consent — call after user grants analytics consent.
 */
export function startClarity(): void {
  initClarity();
}
