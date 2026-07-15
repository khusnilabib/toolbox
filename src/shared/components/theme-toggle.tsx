// src/shared/components/theme-toggle.tsx — Light/dark theme toggle.

'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/shared/hooks/use-theme';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="size-9"
    >
      <Moon aria-hidden className="dark:hidden" />
      <Sun aria-hidden className="hidden dark:block" />
    </Button>
  );
}
