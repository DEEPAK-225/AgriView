
import { Header } from "@/components/layout/header";
import { SensorDisplay } from "@/components/dashboard/sensor-display";
import { ActuatorControl } from "@/components/dashboard/actuator-control";
import { MethaneGasLevel } from "@/components/dashboard/methane-gas-level";
// import { SystemStatus } from "@/components/system/system-status"; // Removed
import { AICropAdviser } from "@/components/dashboard/ai-crop-adviser"; // Added

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        
        {/* Sensor Data Section */}
        <section aria-labelledby="sensor-data-heading">
          {/* <h2 id="sensor-data-heading" className="sr-only">Sensor Data</h2> */}
          <SensorDisplay />
        </section>

        {/* Methane Gas Level Section */}
        <section aria-labelledby="methane-gas-heading">
          {/* <h2 id="methane-gas-heading" className="sr-only">Methane Gas Level</h2> */}
          <MethaneGasLevel />
        </section>

        {/* Control and Status Section */}
        <section aria-labelledby="control-status-heading" className="grid gap-6 lg:grid-cols-3">
          {/* <h2 id="control-status-heading" className="sr-only">Device Control and System Status</h2> */}
          <div className="lg:col-span-2">
            <ActuatorControl />
          </div>
          <div className="lg:col-span-1">
            {/* <SystemStatus /> */} {/* Replaced */}
            <AICropAdviser />   {/* Added */}
          </div>
        </section>
        
      </main>
    </div>
  );
}
