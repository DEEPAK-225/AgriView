
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutomationRules } from '@/contexts/AutomationRulesContext';
import type { AutomationRulesState, SensorType } from '@/types/automation';
import { ALL_SENSORS, getDefaultAutomationRules } from '@/types/automation';
import { SensorAutomationForm } from '@/components/settings/sensor-automation-form';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';

// Zod schema for validation
const actuatorActionSchema = z.object({
  actuator: z.enum(['none', 'pump', 'fan', 'valve', 'vent']),
  targetState: z.enum(['on', 'off', 'open', 'close']).optional(),
  targetAngle: z.coerce.number().min(0).max(180).optional(),
}).refine(data => {
  if (data.actuator === 'vent') return data.targetAngle !== undefined;
  if (data.actuator === 'pump' || data.actuator === 'fan') return data.targetState === 'on' || data.targetState === 'off';
  if (data.actuator === 'valve') return data.targetState === 'open' || data.targetState === 'close';
  if (data.actuator === 'none') return true;
  return false;
}, { message: "Invalid action for selected actuator" });

const sensorRuleSettingsSchema = z.object({
  threshold: z.coerce.number().optional(),
  action: actuatorActionSchema,
});

const sensorAutomationRuleSchema = z.object({
  sensorType: z.enum(ALL_SENSORS as [SensorType, ...SensorType[]]),
  enabled: z.boolean(),
  minRule: sensorRuleSettingsSchema,
  maxRule: sensorRuleSettingsSchema,
});

const automationRulesFormSchema = z.object({
  temperature: sensorAutomationRuleSchema,
  humidity: sensorAutomationRuleSchema,
  soilMoisture: sensorAutomationRuleSchema,
  lightIntensity: sensorAutomationRuleSchema,
  methaneLevel: sensorAutomationRuleSchema, // Added methaneLevel
});


export default function AutomationSettingsPage() {
  const { rules, updateRule, isLoading, getRule } = useAutomationRules();
  const { toast } = useToast();

  const methods = useForm<AutomationRulesState>({
    resolver: zodResolver(automationRulesFormSchema),
    defaultValues: getDefaultAutomationRules(), // Initialize with defaults
  });

  useEffect(() => {
    if (!isLoading) {
      // Once rules are loaded from context (e.g. localStorage), reset the form
      // Ensure all sensor types from ALL_SENSORS are present in the loaded rules,
      // merging with defaults if necessary.
      const currentDefaults = getDefaultAutomationRules();
      const mergedRules: AutomationRulesState = {} as AutomationRulesState;
      ALL_SENSORS.forEach(sensor => {
        mergedRules[sensor] = {
          ...currentDefaults[sensor], // Start with default for this sensor
          ...(rules[sensor] || {}),    // Override with loaded rule if exists
        };
      });
      methods.reset(mergedRules);
    }
  }, [isLoading, rules, methods]);


  const onSubmit = (data: AutomationRulesState) => {
    // Update rules in context
    ALL_SENSORS.forEach(sensorType => {
      if (data[sensorType]) { // Ensure data for sensorType exists before updating
        updateRule(sensorType, data[sensorType]);
      }
    });
    toast({
      title: "Settings Saved",
      description: "Automation rules have been updated.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col items-center gap-6 p-4 pt-20 md:p-8 md:pt-24">
          <p>Loading automation settings...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-6 p-4 pt-20 md:p-8 md:pt-24">
        <div className="w-full max-w-3xl">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/settings" passHref legacyBehavior>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Settings
              </Button>
            </Link>
            <Button type="submit" form="automation-form" className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              Save All Rules
            </Button>
          </div>

          <FormProvider {...methods}>
            <form id="automation-form" onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
              {ALL_SENSORS.map((sensorType) => (
                <Card key={sensorType} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold capitalize">
                      {sensorType.replace(/([A-Z])/g, ' $1')} Automation
                    </CardTitle>
                    <CardDescription>
                      Set automated actions based on {sensorType.replace(/([A-Z])/g, ' $1').toLowerCase()} levels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SensorAutomationForm sensorType={sensorType} />
                  </CardContent>
                </Card>
              ))}
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
}
