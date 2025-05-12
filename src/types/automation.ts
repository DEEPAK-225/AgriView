
export type SensorType = 'temperature' | 'humidity' | 'soilMoisture' | 'lightIntensity' | 'methaneLevel';
export type ActuatorDevice = 'pump' | 'valve' | 'fan' | 'vent';

export interface PumpFanAction {
  actuator: 'pump' | 'fan';
  targetState: 'on' | 'off';
}

export interface ValveAction {
  actuator: 'valve';
  targetState: 'open' | 'close';
}

export interface VentAction {
  actuator: 'vent';
  targetAngle: number; // 0-180
}

export type ActuatorAction = PumpFanAction | ValveAction | VentAction | { actuator: 'none' };

export interface SensorRuleSettings {
  threshold?: number; // Min or Max threshold value
  action: ActuatorAction;
}

export interface SensorAutomationRule {
  sensorType: SensorType;
  enabled: boolean;
  minRule: SensorRuleSettings; // Action if value is LESS THAN threshold
  maxRule: SensorRuleSettings; // Action if value is GREATER THAN threshold
}

export type AutomationRulesState = Record<SensorType, SensorAutomationRule>;

export const ALL_SENSORS: SensorType[] = ['temperature', 'humidity', 'soilMoisture', 'lightIntensity', 'methaneLevel'];
export const ALL_ACTUATORS: (ActuatorDevice | 'none')[] = ['none', 'pump', 'fan', 'valve', 'vent'];

export const getDefaultAutomationRules = (): AutomationRulesState => ({
  temperature: {
    sensorType: 'temperature',
    enabled: false,
    minRule: { action: { actuator: 'none' } },
    maxRule: { action: { actuator: 'none' } },
  },
  humidity: {
    sensorType: 'humidity',
    enabled: false,
    minRule: { action: { actuator: 'none' } },
    maxRule: { action: { actuator: 'none' } },
  },
  soilMoisture: {
    sensorType: 'soilMoisture',
    enabled: false,
    minRule: { action: { actuator: 'none' } },
    maxRule: { action: { actuator: 'none' } },
  },
  lightIntensity: {
    sensorType: 'lightIntensity',
    enabled: false,
    minRule: { action: { actuator: 'none' } },
    maxRule: { action: { actuator: 'none' } },
  },
  methaneLevel: {
    sensorType: 'methaneLevel',
    enabled: false,
    minRule: { action: { actuator: 'none' } }, // Typically, methane will only have a max rule for safety
    maxRule: { action: { actuator: 'none' } },
  },
});
