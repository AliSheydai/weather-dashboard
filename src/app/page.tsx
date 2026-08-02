"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherSidebar } from "@/components/weather/WeatherSidebar";
import { Cloud, Droplets, Wind, Thermometer, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchHealth } from "@/services/api";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("New York");
  const [serverStatus, setServerStatus] = useState<string>("checking...");

  useEffect(() => {
    fetchHealth()
      .then((data) => setServerStatus(data.status))
      .catch(() => setServerStatus("offline"));
  }, []);

  return (
    <DashboardLayout
      sidebar={
        <WeatherSidebar
          onCitySelect={setSelectedCity}
          selectedCity={selectedCity}
        />
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              HOME • {selectedCity.toUpperCase()}
            </p>
            <h2 className="text-3xl font-bold mt-1">{selectedCity}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              <span
                className={
                  serverStatus === "ok"
                    ? "text-green-500"
                    : "text-yellow-500"
                }
              >
                Server: {serverStatus}
              </span>
            </div>
            <nav className="flex gap-4">
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                Browse
              </button>
              <button className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary text-sm">
                Map
              </button>
              <button className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary text-sm">
                Metrics
              </button>
            </nav>
          </div>
        </div>

        {/* Main Weather Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-8xl font-bold">21°</div>
                <p className="text-xl text-muted-foreground mt-2">
                  Cloudy conditions
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Feels like 19°
                </p>
              </div>
              <Cloud className="h-32 w-32 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Thermometer className="h-4 w-4" />
                Feels Like
              </div>
              <div className="text-2xl font-bold">19°</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Droplets className="h-4 w-4" />
                Humidity
              </div>
              <div className="text-2xl font-bold">73%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Wind className="h-4 w-4" />
                Wind
              </div>
              <div className="text-2xl font-bold">12 km/h</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Cloud className="h-4 w-4" />
                UV Index
              </div>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Moderate</p>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Forecast */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Hourly Forecast</h3>
            <div className="grid grid-cols-6 gap-4">
              {["Now", "14:00", "15:00", "16:00", "17:00", "18:00"].map(
                (hour, i) => (
                  <div key={hour} className="text-center">
                    <div className="text-sm text-muted-foreground">{hour}</div>
                    <Cloud className="h-6 w-6 mx-auto my-2" />
                    <div className="font-medium">{21 - i}°</div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Forecast */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Weekly Forecast</h3>
            <div className="space-y-3">
              {[
                { day: "Today", icon: "🌧️", low: 15, high: 21 },
                { day: "Mon", icon: "☁️", low: 15, high: 24 },
                { day: "Tue", icon: "☀️", low: 15, high: 21 },
                { day: "Wed", icon: "☀️", low: 16, high: 23 },
                { day: "Thu", icon: "🌧️", low: 14, high: 20 },
              ].map((d) => (
                <div
                  key={d.day}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="w-16 font-medium">{d.day}</div>
                  <div className="w-8 text-center">{d.icon}</div>
                  <div className="w-12 text-right text-sm text-muted-foreground">
                    {d.low}°
                  </div>
                  <div className="flex-1 mx-4 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                      style={{
                        marginLeft: `${((d.low - 10) / 20) * 100}%`,
                        width: `${((d.high - d.low) / 20) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-12 text-right font-medium">{d.high}°</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
