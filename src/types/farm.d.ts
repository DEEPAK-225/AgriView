

export interface DeviceSettings {
  autoMode?: boolean; // Added, should match ESP8266 expectation
  fan?: boolean;
  pump?: boolean;
  valve?: boolean;
  ventAngle?: number;
  ventSpeed?: number; // Added, should match ESP8266 expectation
}

export interface SensorReadings {
  humidity?: number;
  lightIntensity?: number;
  methaneLevel?: number;
  soilMoisture?: number;
  temperature?: number;
  timestamp?: number; 
}

export interface SystemInfo {
    lastUpdate?: number; 
    rssi?: number;
    status?: 'online' | 'offline' | string; 
}

export interface FarmData { 
  devices?: DeviceSettings;
  sensorData?: SensorReadings;
  system?: SystemInfo; 
}

// For the top-level structure in Firebase
export interface FarmsData {
  [farmId: string]: FarmData | null; 
}
