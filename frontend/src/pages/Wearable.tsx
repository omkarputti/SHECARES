import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Watch, Activity, Heart, Footprints, Moon, Flame, CheckCircle2, Link2 } from "lucide-react";
import { useState } from "react";

const Wearable = () => {
  const [connectedDevices] = useState([
    { id: 1, name: "Apple Watch Series 8", type: "Smartwatch", status: "Connected", lastSync: "2 mins ago" },
  ]);

  const availableDevices = [
    { name: "Fitbit", icon: Activity, description: "Track steps, heart rate, and sleep" },
    { name: "Garmin", icon: Activity, description: "Advanced fitness and health metrics" },
    { name: "Samsung Galaxy Watch", icon: Watch, description: "Comprehensive health monitoring" },
    { name: "Oura Ring", icon: Activity, description: "Sleep and readiness tracking" },
  ];

  const healthMetrics = [
    { label: "Steps Today", value: "7,582", icon: Footprints, color: "text-accent" },
    { label: "Heart Rate", value: "72 bpm", icon: Heart, color: "text-red-500" },
    { label: "Sleep Score", value: "85/100", icon: Moon, color: "text-blue-500" },
    { label: "Calories", value: "1,847", icon: Flame, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Wearable Connect</h1>
          <p className="text-muted-foreground">Sync your fitness devices and track your health metrics</p>
        </div>

        {/* Health Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connected Devices */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>Manage your synced wearable devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedDevices.map((device) => (
                <Card key={device.id} className="bg-secondary/30 border-accent">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent/20 rounded-lg">
                          <Watch className="h-6 w-6 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{device.name}</h3>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                          <p className="text-sm text-muted-foreground">{device.type}</p>
                          <p className="text-xs text-muted-foreground">Last synced: {device.lastSync}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Sync Now</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">Disconnect</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4">
                <h3 className="font-semibold mb-4">Available Devices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableDevices.map((device) => (
                    <Card key={device.name} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-3">
                          <device.icon className="h-5 w-5 text-accent" />
                          <div>
                            <h4 className="font-medium">{device.name}</h4>
                            <p className="text-xs text-muted-foreground">{device.description}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Link2 className="mr-2 h-3 w-3" />
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>Configure data synchronization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Auto-Sync Data</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Activity className="mr-2 h-4 w-4" />
                    Activity & Steps
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Heart className="mr-2 h-4 w-4" />
                    Heart Rate
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Moon className="mr-2 h-4 w-4" />
                    Sleep Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Flame className="mr-2 h-4 w-4" />
                    Calories
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-medium">Sync Frequency</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">Real-time</Button>
                  <Button variant="outline" className="w-full" size="sm">Every hour</Button>
                  <Button variant="outline" className="w-full" size="sm">Manual only</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Wearable;
