
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AutomationRulesState, SensorType, SensorAutomationRule } from '@/types/automation';
import { getDefaultAutomationRules } from '@/types/automation';

interface AutomationRulesContextType {
  rules: AutomationRulesState;
  updateRule: (sensorType: SensorType, newRule: Partial<SensorAutomationRule>) => void;
  setRuleEnabled: (sensorType: SensorType, enabled: boolean) => void;
  getRule: (sensorType: SensorType) => SensorAutomationRule;
  isLoading: boolean;
}

const AutomationRulesContext = createContext<AutomationRulesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'agriview_automation_rules';

export function AutomationRulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<AutomationRulesState>(getDefaultAutomationRules());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRules = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedRules) {
        setRules(JSON.parse(storedRules));
      } else {
        setRules(getDefaultAutomationRules());
      }
    } catch (error) {
      console.error("Failed to load automation rules from localStorage:", error);
      setRules(getDefaultAutomationRules());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rules));
      } catch (error) {
        console.error("Failed to save automation rules to localStorage:", error);
      }
    }
  }, [rules, isLoading]);

  const updateRule = useCallback((sensorType: SensorType, newRuleData: Partial<SensorAutomationRule>) => {
    setRules(prevRules => ({
      ...prevRules,
      [sensorType]: {
        ...prevRules[sensorType],
        ...newRuleData,
      },
    }));
  }, []);

  const setRuleEnabled = useCallback((sensorType: SensorType, enabled: boolean) => {
    setRules(prevRules => ({
      ...prevRules,
      [sensorType]: {
        ...prevRules[sensorType],
        enabled,
      },
    }));
  }, []);

  const getRule = useCallback((sensorType: SensorType): SensorAutomationRule => {
    return rules[sensorType];
  }, [rules]);


  return (
    <AutomationRulesContext.Provider value={{ rules, updateRule, setRuleEnabled, getRule, isLoading }}>
      {children}
    </AutomationRulesContext.Provider>
  );
}

export function useAutomationRules(): AutomationRulesContextType {
  const context = useContext(AutomationRulesContext);
  if (context === undefined) {
    throw new Error('useAutomationRules must be used within an AutomationRulesProvider');
  }
  return context;
}
