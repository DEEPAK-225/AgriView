
'use client';

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Cog } from "lucide-react"; // Added Cog

export default function SettingsPage() {
  const { isGlobalAutomationEnabled, toggleGlobalAutomation } = useSettings();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-6 p-4 pt-20 md:p-8 md:pt-24">
        <div className="w-full max-w-md">
          <Link href="/" passHref legacyBehavior>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Global Automation</CardTitle>
              <CardDescription>
                Configure system-wide automation preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2 rounded-lg border bg-card p-4 shadow-sm">
                <Label htmlFor="global-automation-switch" className="text-base font-medium">
                  Enable Global Automation
                </Label>
                <Switch
                  id="global-automation-switch"
                  checked={isGlobalAutomationEnabled}
                  onCheckedChange={toggleGlobalAutomation}
                  aria-label="Toggle Global Automation"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When global automation is disabled, all devices will operate in manual mode,
                and individual automation settings on the dashboard will be overridden and disabled.
                When enabled, you can configure automation for devices on the dashboard or set up detailed rules.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Detailed Automation Rules</CardTitle>
              <CardDescription>
                Set up specific sensor thresholds and actuator responses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/automation" passHref legacyBehavior>
                <Button className="w-full">
                  <Cog className="mr-2 h-4 w-4" />
                  Configure Automation Rules
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                Define rules for how actuators should respond to changes in sensor readings (e.g., turn on pump if soil moisture is low).
              </p>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
