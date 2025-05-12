
'use client';

import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import type { SensorType, ActuatorDevice, ActuatorAction } from '@/types/automation';
import { ALL_ACTUATORS } from '@/types/automation';

interface SensorAutomationFormProps {
  sensorType: SensorType;
}

const getActuatorSpecificControl = (
  control: any, // from useFormContext
  namePrefix: string, // e.g., "temperature.minRule.action"
  selectedActuator: ActuatorDevice | 'none'
) => {
  switch (selectedActuator) {
    case 'pump':
    case 'fan':
      return (
        <FormField
          control={control}
          name={`${namePrefix}.targetState`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="on">Turn On</SelectItem>
                  <SelectItem value="off">Turn Off</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case 'valve':
      return (
        <FormField
          control={control}
          name={`${namePrefix}.targetState`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="open">Open Valve</SelectItem>
                  <SelectItem value="close">Close Valve</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case 'vent':
      return (
        <FormField
          control={control}
          name={`${namePrefix}.targetAngle`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Vent Angle (°)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0-180" 
                  {...field} 
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    default:
      return null;
  }
};


export function SensorAutomationForm({ sensorType }: SensorAutomationFormProps) {
  const { control, setValue, getValues } = useFormContext(); // Access form context

  const fieldIsEnabled = `${sensorType}.enabled`;
  const minRulePrefix = `${sensorType}.minRule`;
  const maxRulePrefix = `${sensorType}.maxRule`;

  const minActuator = useWatch({ control, name: `${minRulePrefix}.action.actuator` });
  const maxActuator = useWatch({ control, name: `${maxRulePrefix}.action.actuator` });
  
  const isEnabled = useWatch({control, name: fieldIsEnabled});

  // Effect to clear specific action fields when actuator changes to 'none' or a different type
  const handleActuatorChange = (rulePrefix: string, newActuator: ActuatorDevice | 'none') => {
    setValue(`${rulePrefix}.action.targetState`, undefined, {shouldValidate: true});
    setValue(`${rulePrefix}.action.targetAngle`, undefined, {shouldValidate: true});

    // Set default action based on new actuator type
    if (newActuator === 'pump' || newActuator === 'fan') {
      setValue(`${rulePrefix}.action.targetState`, 'on');
    } else if (newActuator === 'valve') {
      setValue(`${rulePrefix}.action.targetState`, 'open');
    } else if (newActuator === 'vent') {
       const currentAngle = getValues(`${rulePrefix}.action.targetAngle`);
       // Ensure targetAngle is initialized if it's undefined or NaN
       if (currentAngle === undefined || currentAngle === null || isNaN(Number(currentAngle))) {
        setValue(`${rulePrefix}.action.targetAngle`, 0); 
       }
    }
  };

  const getPlaceholder = (ruleType: 'min' | 'max') => {
    if (sensorType === 'temperature') return ruleType === 'min' ? '15' : '30';
    if (sensorType === 'methaneLevel') return ruleType === 'min' ? '5' : '50'; // Methane in PPM, e.g.
    return ruleType === 'min' ? '30' : '70'; // Default for humidity, soilMoisture, lightIntensity (%)
  }


  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name={fieldIsEnabled}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Enable Automation for {sensorType.replace(/([A-Z])/g, ' $1')}</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {isEnabled && (
        <>
          {/* Minimum Threshold Rule - or Low Value Rule */}
          <div className="space-y-3 p-4 border rounded-md bg-secondary/30">
            <h4 className="font-medium">Low {sensorType.replace(/([A-Z])/g, ' $1')} Rule (If value &lt; threshold)</h4>
            <FormField
              control={control}
              name={`${minRulePrefix}.threshold`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Threshold Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={`e.g., ${getPlaceholder('min')}`} 
                      {...field} 
                      value={field.value ?? ''} // Ensure controlled input: undefined/null becomes empty string
                      onChange={e => {
                        // Pass string to RHF; Zod resolver will coerce to number or handle validation
                        field.onChange(e.target.value === '' ? undefined : e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${minRulePrefix}.action.actuator`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actuator to Control</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleActuatorChange(minRulePrefix, value as ActuatorDevice | 'none');
                    }} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select actuator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_ACTUATORS.map(act => (
                        <SelectItem key={act} value={act} className="capitalize">{act}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {getActuatorSpecificControl(control, `${minRulePrefix}.action`, minActuator)}
          </div>

          {/* Maximum Threshold Rule - or High Value Rule */}
          <div className="space-y-3 p-4 border rounded-md bg-secondary/30">
            <h4 className="font-medium">High {sensorType.replace(/([A-Z])/g, ' $1')} Rule (If value &gt; threshold)</h4>
            <FormField
              control={control}
              name={`${maxRulePrefix}.threshold`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>High Threshold Value</FormLabel>
                  <FormControl>
                     <Input 
                      type="number" 
                      placeholder={`e.g., ${getPlaceholder('max')}`} 
                      {...field}
                      value={field.value ?? ''} // Ensure controlled input
                      onChange={e => {
                        field.onChange(e.target.value === '' ? undefined : e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${maxRulePrefix}.action.actuator`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actuator to Control</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleActuatorChange(maxRulePrefix, value as ActuatorDevice | 'none');
                    }} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select actuator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_ACTUATORS.map(act => (
                        <SelectItem key={act} value={act} className="capitalize">{act}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {getActuatorSpecificControl(control, `${maxRulePrefix}.action`, maxActuator)}
          </div>
        </>
      )}
    </div>
  );
}

