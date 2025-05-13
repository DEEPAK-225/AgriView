
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useFarmData } from "@/hooks/useFarmData"; // Added
import { Loader2 } from "lucide-react"; // Added
import { cn } from "@/lib/utils"; // Added

export function MethaneGasLevel() {
  const { sensorData, loading: farmDataLoading, error: farmDataError } = useFarmData(); // Use hook
  const [methaneLevel, setMethaneLevel] = useState(300); // Default to 0
  const threshold = 10000; // ppm, example threshold
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (sensorData && typeof sensorData.methaneLevel === 'number') {
      setMethaneLevel(sensorData.methaneLevel);
    }
  }, [sensorData]);


  if (!isClient || farmDataLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Methane Gas Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex items-center justify-center p-8">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (farmDataError) {
     return (
       <Card className="shadow-lg">
         <CardHeader>
           <CardTitle className="text-xl font-semibold text-destructive">Methane Gas Level Error</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-destructive">Could not load data: {farmDataError.message}</p>
         </CardContent>
       </Card>
     );
  }

  const progressValue = methaneLevel ? (methaneLevel / threshold) * 100 : 0;
  const status = methaneLevel <= threshold ? "safe" : "danger";
  const badgeVariant = status === "safe" ? "default" : "destructive";
  const badgeText = status === "safe" ? "Safe" : "Alert";
  const progressBarColorClass = status === "safe" ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500";


  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Methane Gas Level</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-lg font-medium text-primary">
            {methaneLevel !== undefined ? methaneLevel.toFixed(2) : '--'} ppm
          </span>
          <Badge 
            variant={badgeVariant} 
            className={cn(
                status === 'safe' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300',
                'dark:bg-opacity-20' // Ensure badge background is visible in dark mode
            )}
           >
            {badgeText}
          </Badge>
        </div>
        <Progress 
            value={Math.min(progressValue, 100)} 
            aria-label={`${methaneLevel} ppm Methane Level`} 
            className={cn("h-3", progressBarColorClass)} 
        />
        <div className="text-xs text-muted-foreground text-right">
          Threshold: {threshold} ppm
        </div>
      </CardContent>
    </Card>
  );
}
