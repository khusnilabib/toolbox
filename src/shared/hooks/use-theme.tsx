// src/shared/hooks/use-theme.tsx — Theme provider & hook wrapping next-themes.

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';
import { useTheme as useNextTheme } from 'next-themes';

export type { ThemeProviderProps };

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function useTheme() {
  return useNextTheme();
}
