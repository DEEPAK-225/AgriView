
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplet, Fan, Settings2, SlidersHorizontal, Power, AlertCircle, Loader2, ThermometerIcon } from 'lucide-react'; 
import { useSettings } from '@/contexts/SettingsContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { useFarmData } from '@/hooks/useFarmData';
import { useToast } from '@/hooks/use-toast';
import type { DeviceSettings } from '@/types/farm';


export function ActuatorControl() {
  const { devices, loading: devicesLoading, error: devicesError, updateDeviceSetting, farmId } = useFarmData();
  const { isGlobalAutomationEnabled } = useSettings();
  const { toast } = useToast();
  
  const [localAutomationMode, setLocalAutomationMode] = useState(true); 

  const [pumpState, setPumpState] = useState(false);
  const [valveState, setValveState] = useState(false); 
  const [fanState, setFanState] = useState(false);
  
  // Vent slider specific states
  const [greenhouseVentPosition, setGreenhouseVentPosition] = useState<number[]>([0]); 
  const [isUserDraggingVent, setIsUserDraggingVent] = useState(false);
  const justCommittedAngleVentRef = useRef<number | null>(null);

  const [currentVentSpeed, setCurrentVentSpeed] = useState<number>(20);
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (devices) {
      setPumpState(devices.pump ?? false);
      setValveState(devices.valve ?? false);
      setFanState(devices.fan ?? false);
      
      const deviceAngle = devices.ventAngle ?? 0;

      if (isUserDraggingVent) {
        // User is dragging, gVP is controlled by onValueChange.
        // Clear any stale justCommittedAngle ref if user starts new interaction.
        if (justCommittedAngleVentRef.current !== null) justCommittedAngleVentRef.current = null;
      } else {
        // User is NOT dragging.
        if (justCommittedAngleVentRef.current !== null) {
          // A value was just committed by the user.
          // We expect gVP to be at justCommittedAngleVentRef.current.
          // We also expect deviceAngle to eventually match this.
          if (deviceAngle === justCommittedAngleVentRef.current) {
            // Firebase has confirmed the committed value.
            if (greenhouseVentPosition[0] !== deviceAngle) {
              setGreenhouseVentPosition([deviceAngle]);
            }
            justCommittedAngleVentRef.current = null; // Reset the flag
          } else {
            // Firebase (deviceAngle) has not yet confirmed the justCommittedAngle.
            // DO NOT revert gVP to the old deviceAngle. Ensure gVP is at the committed value.
            if (greenhouseVentPosition[0] !== justCommittedAngleVentRef.current) {
               setGreenhouseVentPosition([justCommittedAngleVentRef.current]);
            }
          }
        } else {
          // No recent commit, or it has been confirmed. Normal sync.
          if (greenhouseVentPosition[0] !== deviceAngle) {
            setGreenhouseVentPosition([deviceAngle]);
          }
        }
      }
      setCurrentVentSpeed(devices.ventSpeed ?? 20);
    }
  }, [devices, isUserDraggingVent, greenhouseVentPosition]); // greenhouseVentPosition is needed here for the logic involving justCommittedAngleVentRef

  useEffect(() => {
    if (!isGlobalAutomationEnabled) {
      setLocalAutomationMode(false); 
    }
  }, [isGlobalAutomationEnabled]);

  const effectiveAutoMode = isGlobalAutomationEnabled && localAutomationMode;

  useEffect(() => {
    if (devices && typeof devices.autoMode === 'boolean' && devices.autoMode !== effectiveAutoMode && farmId) {
      updateDeviceSetting('autoMode', effectiveAutoMode)
        .catch(e => {
          console.error("Failed to sync autoMode to Firebase:", e);
          toast({ title: "Sync Error", description: "Could not sync automation mode to device.", variant: "destructive" });
        });
    }
  }, [effectiveAutoMode, devices, updateDeviceSetting, farmId, toast]);


  const handleSwitchChange = async <K extends keyof Pick<DeviceSettings, 'pump' | 'valve' | 'fan'>>(
    key: K, 
    value: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(value); 
    if (!farmId) {
        toast({ title: "Error", description: "Farm ID not set.", variant: "destructive"});
        setter(!value); 
        return;
    }
    try {
      await updateDeviceSetting(key, value);
    } catch (e) {
      console.error(`Failed to update ${String(key)}:`, e);
      toast({ title: "Update Failed", description: `Could not update ${String(key)}.`, variant: "destructive"});
      setter(!value); 
    }
  };
  
  const handleVentPositionCommit = (committedSliderValue: number[]) => {
    const newAngle = committedSliderValue[0];
    if (!farmId) {
      toast({ title: "Error", description: "Farm ID not set.", variant: "destructive"});
      return;
    }
    if (devices?.ventAngle !== newAngle) {
      updateDeviceSetting('ventAngle', newAngle)
        .catch(e => {
          console.error(`Failed to update ventAngle:`, e);
          toast({ title: "Update Failed", description: `Could not update vent angle.`, variant: "destructive"});
        });
    }
  };

  const controlsDisabled = effectiveAutoMode || devicesLoading;


  if (!isClient || devicesLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Device Control Panel</CardTitle>
          <CardDescription>Loading device controls...</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
           <div className="flex items-center justify-center col-span-full p-8">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
           </div>
        </CardContent>
      </Card>
    );
  }

  if (devicesError) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-destructive">Device Control Panel Error</CardTitle>
          <CardDescription className="text-destructive">Could not load device controls: {devicesError.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Device Control Panel</CardTitle>
        {!isGlobalAutomationEnabled && (
            <Alert variant="default" className="mt-2 bg-amber-500/10 border-amber-500/30 text-amber-700">
                <AlertCircle className="h-4 w-4 !text-amber-700" />
                <AlertTitle className="text-amber-700">Global Automation Disabled</AlertTitle>
                <CardDescription className="!text-amber-600">
                    System-wide automation is turned off in settings. All devices are in manual mode.
                </CardDescription>
            </Alert>
        )}
         {isGlobalAutomationEnabled && (
             <CardDescription>
                Manage your farm's irrigation, ventilation, and other automated systems. Current vent speed: {currentVentSpeed}ms/°.
            </CardDescription>
         )}
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-6">
          <div className={`flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-lg ${controlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex items-center space-x-3">
               <Droplet className="h-6 w-6 text-primary" />
               <div>
                 <Label htmlFor="pump-switch" className="text-base font-medium">Water Pump</Label>
                 <p className="text-xs text-muted-foreground">{pumpState ? "On" : "Off"}</p>
               </div>
            </div>
            <Switch
              id="pump-switch"
              checked={pumpState}
              onCheckedChange={(checked) => handleSwitchChange('pump', checked, setPumpState)}
              aria-label="Toggle Water Pump"
              disabled={controlsDisabled}
            />
          </div>
          <div className={`flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-lg ${controlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <div className="flex items-center space-x-3">
               {/* Using ThermometerIcon as a placeholder for Valve, replace if a better one is found or use Settings2 */}
               <ThermometerIcon className="h-6 w-6 text-primary" /> 
               <div>
                <Label htmlFor="valve-switch" className="text-base font-medium">Water Valve</Label>
                <p className="text-xs text-muted-foreground">{valveState ? "Open" : "Closed"}</p>
               </div>
             </div>
             <Switch
               id="valve-switch"
               checked={valveState}
               onCheckedChange={(checked) => handleSwitchChange('valve', checked, setValveState)}
               aria-label="Toggle Water Valve"
               disabled={controlsDisabled}
             />
          </div>
          <div className={`flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-lg ${controlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <div className="flex items-center space-x-3">
               <Fan className="h-6 w-6 text-primary" />
               <div>
                <Label htmlFor="fan-switch" className="text-base font-medium">Ventilation Fan</Label>
                <p className="text-xs text-muted-foreground">{fanState ? "On" : "Off"}</p>
               </div>
             </div>
             <Switch
               id="fan-switch"
               checked={fanState}
               onCheckedChange={(checked) => handleSwitchChange('fan', checked, setFanState)}
               aria-label="Toggle Ventilation Fan"
               disabled={controlsDisabled}
             />
          </div>
        </div>

        <div className="space-y-8">
           <div className={`p-3 bg-secondary/30 rounded-lg ${controlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <div className="flex items-center justify-between mb-1">
                <Label htmlFor="vent-slider" className="text-base font-medium flex items-center">
                  <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
                  Greenhouse Vent Position
                </Label>
                <span className="text-sm font-semibold text-primary">{greenhouseVentPosition[0]}°</span>
             </div>
             <Slider
                 id="vent-slider"
                 min={0}
                 max={180}
                 step={1}
                 value={greenhouseVentPosition}
                 onValueChange={(newValue) => {
                   if (!isUserDraggingVent && !controlsDisabled) setIsUserDraggingVent(true);
                   setGreenhouseVentPosition(newValue);
                 }}
                 onValueCommit={(committedValue) => {
                   if (isUserDraggingVent) setIsUserDraggingVent(false);
                   justCommittedAngleVentRef.current = committedValue[0];
                   handleVentPositionCommit(committedValue);
                 }}
                 className="w-full"
                 aria-label="Greenhouse Vent Position Slider"
                 disabled={controlsDisabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                <span>Closed (0°)</span>
                <span>Open (180°)</span>
              </div>
           </div>

           <div className="p-3 bg-secondary/30 rounded-lg">
             <div className="flex items-center justify-between mb-2">
                <Label htmlFor="local-automation-switch" className="text-base font-medium flex items-center">
                    <Power className="h-5 w-5 mr-2 text-primary"/>
                    Device Panel Automation
                </Label>
                <Switch
                  id="local-automation-switch"
                  checked={localAutomationMode}
                  onCheckedChange={setLocalAutomationMode}
                  aria-label="Toggle Local Device Automation Mode"
                  disabled={!isGlobalAutomationEnabled} 
                />
             </div>
             <p className="text-xs text-muted-foreground mb-3">
                {isGlobalAutomationEnabled 
                  ? "Enable for this panel's devices to operate based on automation rules. Disable for manual control."
                  : "Global automation is off. Enable it in settings to use local device automation."}
             </p>
             <Tabs value={effectiveAutoMode ? "auto" : "manual"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                        value="manual" 
                        onClick={() => setLocalAutomationMode(false)} 
                        disabled={!isGlobalAutomationEnabled && localAutomationMode}
                    >
                        Manual
                    </TabsTrigger>
                    <TabsTrigger 
                        value="auto" 
                        onClick={() => setLocalAutomationMode(true)} 
                        disabled={!isGlobalAutomationEnabled}
                    >
                        Auto
                    </TabsTrigger>
                </TabsList>
            </Tabs>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
