// src/shared/components/ads/ad-provider.tsx — Centralized Advertisement System.
// Sprint 12 Phase 1 — Supports Google AdSense, Ezoic (future), Media.net (future).
// Ads never interrupt tool execution. Layout space reserved to prevent CLS.

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type AdNetwork = 'adsense' | 'ezoic' | 'medianet' | 'none';

interface AdProviderConfig {
  network: AdNetwork;
  adsenseClient?: string;
  enabled: boolean;
}

interface AdContextValue {
  network: AdNetwork;
  enabled: boolean;
}

const AdContext = createContext<AdContextValue>({ network: 'none', enabled: false });

export function AdProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AdProviderConfig>({ network: 'none', enabled: false });

  useEffect(() => {
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    if (client) {
      queueMicrotask(() => {
        setConfig({ network: 'adsense', adsenseClient: client, enabled: true });
      });
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <AdContext.Provider value={{ network: config.network, enabled: config.enabled }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAdContext() {
  return useContext(AdContext);
}
