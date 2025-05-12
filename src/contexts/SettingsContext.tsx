
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface SettingsContextType {
  isGlobalAutomationEnabled: boolean;
  toggleGlobalAutomation: () => void;
  setGlobalAutomation: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isGlobalAutomationEnabled, setIsGlobalAutomationEnabled] = useState(true); // Default to true

  const toggleGlobalAutomation = useCallback(() => {
    setIsGlobalAutomationEnabled(prev => !prev);
  }, []);

  const setGlobalAutomation = useCallback((enabled: boolean) => {
    setIsGlobalAutomationEnabled(enabled);
  }, []);

  return (
    <SettingsContext.Provider value={{ isGlobalAutomationEnabled, toggleGlobalAutomation, setGlobalAutomation }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
