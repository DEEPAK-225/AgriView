'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme(); // theme can be 'light', 'dark', or 'system'
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely check window
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null to avoid SSR issues with window access
    // A disabled button with a default icon is a good placeholder.
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  // Determine the current *effectively applied* theme (light or dark)
  // This is important because the `theme` state from context could be 'system'.
  let isEffectivelyDark: boolean;
  if (theme === 'system') {
    isEffectivelyDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isEffectivelyDark = theme === 'dark';
  }

  const handleToggle = () => {
    // If the currently applied theme is dark, switch to light.
    // Otherwise (if currently applied theme is light), switch to dark.
    // This will explicitly set the theme to 'light' or 'dark', overriding 'system' preference.
    if (isEffectivelyDark) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  // The Sun and Moon icons' visibility is controlled by Tailwind's dark variants,
  // which react to the presence of the '.dark' class on the <html> element.
  // The ThemeProvider ensures this class is set correctly.
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={isEffectivelyDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
