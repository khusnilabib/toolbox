// src/shared/hooks/use-feature-flag.ts — React binding for the feature flag service.

'use client';

import { useEffect, useState } from 'react';
import { getFeatureFlagService } from '@/shared/lib/feature-flags';

export function useFeatureFlag(key: string, userId?: string): boolean {
  const service = getFeatureFlagService();
  const [enabled, setEnabled] = useState<boolean>(service.evaluate(key, userId));

  useEffect(() => {
    const initialValue = service.evaluate(key, userId);
    queueMicrotask(() => setEnabled(initialValue));
    const unsubscribe = service.subscribe((flag) => {
      if (flag.key === key) {
        setEnabled(service.evaluate(key, userId));
      }
    });
    return unsubscribe;
  }, [key, userId, service]);

  return enabled;
}
