
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Leaf, Sun, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart"; // Removed ChartTooltip, ChartTooltipContent as they are not used
import { Area, AreaChart, ResponsiveContainer } from "recharts"; // Removed CartesianGrid, XAxis, YAxis for cleaner look
import type { ChartConfig } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { useFarmData } from "@/hooks/useFarmData"; // Added

// Static initial data for chart structure and fallback
const fallbackSensorVisuals = {
  temperature: {
    unit: "°C",
    trend: "N/A",
    trendDirection: "neutral" as "neutral" | "up" | "down",
    historical: [
      { day: "Mon", value: 26 }, { day: "Tue", value: 27 }, { day: "Wed", value: 25 },
      { day: "Thu", value: 28 }, { day: "Fri", value: 29 }, { day: "Sat", value: 27.5 },
      { day: "Sun", value: 28.5 },
    ],
  },
  humidity: {
    unit: "%",
    trend: "N/A",
    trendDirection: "neutral" as "neutral" | "up" | "down",
    historical: [
      { day: "Mon", value: 70 }, { day: "Tue", value: 68 }, { day: "Wed", value: 72 },
      { day: "Thu", value: 65 }, { day: "Fri", value: 63 }, { day: "Sat", value: 66 },
      { day: "Sun", value: 65 },
    ],
  },
  soilMoisture: {
    unit: "%",
    trend: "N/A",
    trendDirection: "neutral" as "neutral" | "up" | "down",
    historical: [
      { day: "Mon", value: 35 }, { day: "Tue", value: 38 }, { day: "Wed", value: 32 },
      { day: "Thu", value: 40 }, { day: "Fri", value: 45 }, { day: "Sat", value: 39 },
      { day: "Sun", value: 42 },
    ],
  },
  lightIntensity: {
    unit: "%",
    trend: "N/A",
    trendDirection: "neutral" as "neutral" | "up" | "down",
    historical: [
      { day: "Mon", value: 70 }, { day: "Tue", value: 75 }, { day: "Wed", value: 80 },
      { day: "Thu", value: 88 }, { day: "Fri", value: 82 }, { day: "Sat", value: 85 },
      { day: "Sun", value: 85 },
    ],
  },
};

const chartConfig = {
  value: {
    label: "Value",
  },
  temperature: {
    label: "Temp",
    color: "hsl(var(--chart-1))",
  },
  humidity: {
    label: "Humidity",
    color: "hsl(var(--chart-2))",
  },
  soilMoisture: {
    label: "Soil",
    color: "hsl(var(--chart-3))",
  },
  lightIntensity: {
    label: "Light",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

interface SensorCardProps {
  title: string;
  icon: React.ElementType;
  currentValue: number | undefined;
  unit: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  historicalData: { day: string; value: number }[];
  chartColorKey: keyof typeof chartConfig;
  isLoading: boolean;
}

function SensorCard({ title, icon: Icon, currentValue, unit, trend, trendDirection, historicalData, chartColorKey, isLoading }: SensorCardProps) {
  const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;
  
  const chartData = Array.isArray(historicalData) ? historicalData : [];
  const displayValue = currentValue !== undefined ? currentValue.toFixed(1) : '--';

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-4xl font-bold"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div className="text-4xl font-bold">{displayValue}{unit}</div>
        )}
        <div className="text-xs text-muted-foreground flex items-center">
          <TrendIcon className={`h-4 w-4 mr-1 ${trendDirection === "up" ? "text-green-500" : trendDirection === "down" ? "text-red-500" : ""}`} />
          {trend}
        </div>
        <div className="h-[80px] w-full mt-2">
          <ChartContainer config={chartConfig} className="h-full w-full p-0">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`fill${chartColorKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${chartColorKey})`} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={`var(--color-${chartColorKey})`} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  dataKey="value"
                  type="natural"
                  fill={`url(#fill${chartColorKey})`}
                  stroke={`var(--color-${chartColorKey})`}
                  stackId="a"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SensorDisplay() {
  const [isClient, setIsClient] = useState(false);
  const { sensorData, loading: farmDataLoading, error: farmDataError } = useFarmData();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Basic skeleton or null for SSR to avoid hydration issues with charts
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-5 w-5 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-10 w-1/2 bg-muted rounded mb-1"></div>
              <div className="h-3 w-3/4 bg-muted rounded mb-2"></div>
              <div className="h-[80px] w-full bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (farmDataError) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader><CardTitle className="text-sm text-destructive">Error</CardTitle></CardHeader>
            <CardContent><p className="text-destructive text-xs">Failed to load data.</p></CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const getSensorCardProps = (
    sensorKey: keyof SensorReadings,
    title: string,
    icon: React.ElementType,
    fallbackVisuals: typeof fallbackSensorVisuals[keyof typeof fallbackSensorVisuals],
    chartColorKey: keyof typeof chartConfig
  ) => ({
    title,
    icon,
    currentValue: sensorData?.[sensorKey] as number | undefined,
    unit: fallbackVisuals.unit,
    trend: fallbackVisuals.trend,
    trendDirection: fallbackVisuals.trendDirection,
    historicalData: fallbackVisuals.historical,
    chartColorKey,
    isLoading: farmDataLoading,
  });


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SensorCard 
        {...getSensorCardProps('temperature', "Temperature", Thermometer, fallbackSensorVisuals.temperature, "temperature")}
      />
      <SensorCard 
        {...getSensorCardProps('humidity', "Humidity", Droplets, fallbackSensorVisuals.humidity, "humidity")}
      />
      <SensorCard 
        {...getSensorCardProps('soilMoisture', "Soil Moisture", Leaf, fallbackSensorVisuals.soilMoisture, "soilMoisture")}
      />
      <SensorCard 
        {...getSensorCardProps('lightIntensity', "Light", Sun, fallbackSensorVisuals.lightIntensity, "lightIntensity")}
      />
    </div>
  );
}

// Define SensorReadings type for clarity, matching Firebase structure
interface SensorReadings {
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  lightIntensity?: number;
  methaneLevel?: number;
  timestamp?: number;
}
