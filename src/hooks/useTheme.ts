import { useCallback, useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../db/repositories/settingsRepo';
import type { Theme } from '../types/models';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function initialTheme(): Theme {
  const stored = getSettings().theme;
  if (stored === 'light' || stored === 'dark') return stored;
  return systemPrefersDark() ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      saveSettings({ theme: next });
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
