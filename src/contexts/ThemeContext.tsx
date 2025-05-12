'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_THEME_KEY = 'agriview_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system'); // Initial default, will be updated by useEffect

  // Effect to set initial theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme | null;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      setThemeState(storedTheme);
    } else {
      setThemeState('system');
    }
  }, []);


  const applyTheme = useCallback((selectedTheme: Theme) => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (selectedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(selectedTheme);
    }
  }, []);

  // Effect to apply theme when theme state changes
  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== 'undefined') {
       localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    }
  }, [theme, applyTheme]);

  // Listener for system theme changes if 'system' is selected
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') { // Only re-apply if current preference is 'system'
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
