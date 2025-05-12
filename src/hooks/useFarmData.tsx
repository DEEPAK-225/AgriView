
'use client';

import { useState, useEffect, createContext, useContext, type ReactNode, useCallback } from 'react';
import { ref, onValue, off, type DatabaseReference, set } from 'firebase/database';
import { database as firebaseDatabaseFromLib } from '@/lib/firebase'; 
import type { FarmData, DeviceSettings, SensorReadings, SystemInfo } from '@/types/farm';

interface FarmDataContextType {
  farmId: string;
  devices: DeviceSettings | null;
  sensorData: SensorReadings | null;
  system: SystemInfo | null;
  loading: boolean;
  error: Error | null;
  updateDeviceSetting: <K extends keyof DeviceSettings>(deviceId: K, value: DeviceSettings[K]) => Promise<void>;
  setFarmId: (id: string) => void;
}

const FarmDataContext = createContext<FarmDataContextType | undefined>(undefined);

const DEFAULT_FARM_ID = '1'; 

export function FarmDataProvider({ children }: { children: ReactNode }) {
  const [farmId, setFarmIdState] = useState<string>(DEFAULT_FARM_ID);
  const [devices, setDevices] = useState<DeviceSettings | null>(null);
  const [sensorData, setSensorData] = useState<SensorReadings | null>(null);
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("[useFarmData] useEffect triggered. Current Farm ID:", farmId);

    if (!farmId) {
      console.warn("[useFarmData] Farm ID is not set. Aborting Firebase connection.");
      setLoading(false);
      setError(new Error("Farm ID is not set."));
      setDevices(null);
      setSensorData(null);
      setSystem(null); 
      return;
    }
    
    if (!firebaseDatabaseFromLib) {
        console.warn("[useFarmData] Firebase Database instance is not available (null). Check Firebase initialization in src/lib/firebase.ts and console for earlier errors.");
        setLoading(false);
        setError(new Error("Firebase Database is not initialized. Check Firebase configuration and console logs."));
        setDevices(null);
        setSensorData(null);
        setSystem(null);
        return;
    }

    setLoading(true);
    setError(null);
    const dbPath = `farms/${farmId}`;
    console.log(`[useFarmData] Attempting to set up Firebase listener for path: ${dbPath}`);

    const farmDataRef: DatabaseReference = ref(firebaseDatabaseFromLib, dbPath);

    const onFarmDataValue = onValue(farmDataRef, (snapshot) => {
      const data = snapshot.val() as FarmData | null; 
      console.log("[useFarmData] Firebase data received from path", dbPath, ":", data);

      if (data) {
        setDevices(data.devices || null);
        setSensorData(data.sensorData || null);
        setSystem(data.system || null); 
        if (!data.devices) console.warn("[useFarmData] Received data but 'devices' field is missing or null.");
        if (!data.sensorData) console.warn("[useFarmData] Received data but 'sensorData' field is missing or null.");
        if (!data.system) console.warn("[useFarmData] Received data but 'system' field is missing or null.");
      } else {
        console.warn(`[useFarmData] No data found at path ${dbPath} for farm ID: ${farmId}. Snapshot was null or empty.`);
        setDevices(null);
        setSensorData(null);
        setSystem(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("[useFarmData] Error fetching farm data for farm ID", farmId, "from path", dbPath, ":", err);
      setError(err as Error);
      setLoading(false);
    });

    return () => {
      console.log(`[useFarmData] Cleaning up Firebase listener for path ${dbPath}`);
      off(farmDataRef, 'value', onFarmDataValue);
    };
  }, [farmId]); 

  const updateDeviceSetting = useCallback(async <K extends keyof DeviceSettings>(deviceId: K, value: DeviceSettings[K]) => {
    console.log(`[useFarmData] updateDeviceSetting called for ${String(deviceId)} with value:`, value);
    if (!farmId) {
      console.error("[useFarmData] Farm ID is not set. Cannot update device setting.");
      throw new Error("Farm ID is not set.");
    }
    if (!firebaseDatabaseFromLib) {
      console.error("[useFarmData] Firebase Database is not initialized. Cannot update device setting.");
      throw new Error("Firebase Database is not initialized. Check configuration.");
    }
    try {
      const deviceSettingRef = ref(firebaseDatabaseFromLib, `farms/${farmId}/devices/${String(deviceId)}`);
      await set(deviceSettingRef, value);
      console.log(`[useFarmData] Successfully updated ${String(deviceId)} in Firebase.`);
      // Optimistically update local state
      setDevices(prev => {
          const currentDevices = prev || {} as DeviceSettings;
          // Create a new object for the state update
          const newDevices = { ...currentDevices, [deviceId]: value };
          return newDevices;
      });
    } catch (err) {
      console.error(`[useFarmData] Error updating device setting ${String(deviceId)} for farm ID ${farmId}:`, err);
      throw err; 
    }
  }, [farmId]);

  const setFarmId = useCallback((id: string) => {
    console.log("[useFarmData] setFarmId called with ID:", id);
    setFarmIdState(id);
  }, []);

  const contextValue: FarmDataContextType = { 
    farmId, 
    devices, 
    sensorData, 
    system, 
    loading, 
    error, 
    updateDeviceSetting, 
    setFarmId 
  };

  return (
    <FarmDataContext.Provider value={contextValue}>
      {children}
    </FarmDataContext.Provider>
  );
}

export function useFarmData(): FarmDataContextType {
  const context = useContext(FarmDataContext);
  if (context === undefined) {
    throw new Error('useFarmData must be used within a FarmDataProvider');
  }
  return context;
}
