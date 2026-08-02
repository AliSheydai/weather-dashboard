"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherSidebar } from "@/components/weather/WeatherSidebar";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchHealth } from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  visibility: number;
  icon: string;
  sunrise: string;
  sunset: string;
}

interface HourlyData {
  hour: string;
  temperature: number;
  condition: string;
  icon: string;
}

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("New York");
  const [serverStatus, setServerStatus] = useState<string>("checking...");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => setServerStatus(data.status))
      .catch(() => setServerStatus("offline"));
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [weatherRes, hourlyRes, dailyRes] = await Promise.all([
          fetch(
            `${API_URL}/weather/current?city=${encodeURIComponent(selectedCity)}`
          ),
          fetch(
            `${API_URL}/weather/hourly?city=${encodeURIComponent(selectedCity)}`
          ),
          fetch(
            `${API_URL}/weather/forecast?city=${encodeURIComponent(selectedCity)}`
          ),
        ]);

        if (!weatherRes.ok) {
          throw new Error("City not found");
        }

        const weatherData = await weatherRes.json();
        const hourlyData = await hourlyRes.json();
        const dailyData = await dailyRes.json();

        setWeather(weatherData);
        setHourly(hourlyData);
        setDaily(dailyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedCity]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
      case "sunny":
        return "☀️";
      case "clouds":
      case "cloudy":
        return "☁️";
      case "rain":
      case "rainy":
        return "🌧️";
      case "snow":
        return "❄️";
      case "thunderstorm":
        return "⛈️";
      default:
        return "🌤️";
    }
  };

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
            <h2 className="text-3xl font-bold mt-1">
              {weather?.city || selectedCity}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              <span
                className={
                  serverStatus === "ok" ? "text-green-500" : "text-yellow-500"
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading weather data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try another city name
              </p>
            </CardContent>
          </Card>
        )}

        {/* Weather Content */}
        {weather && !isLoading && (
          <>
            {/* Main Weather Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-8xl font-bold">
                      {weather.temperature}°
                    </div>
                    <p className="text-xl text-muted-foreground mt-2 capitalize">
                      {weather.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Feels like {weather.feelsLike}°
                    </p>
                  </div>
                  <div className="text-9xl">
                    {getWeatherIcon(weather.condition)}
                  </div>
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
                  <div className="text-2xl font-bold">{weather.feelsLike}°</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Droplets className="h-4 w-4" />
                    Humidity
                  </div>
                  <div className="text-2xl font-bold">{weather.humidity}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Wind className="h-4 w-4" />
                    Wind
                  </div>
                  <div className="text-2xl font-bold">
                    {weather.windSpeed} km/h
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Cloud className="h-4 w-4" />
                    Visibility
                  </div>
                  <div className="text-2xl font-bold">
                    {weather.visibility} km
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Forecast */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Hourly Forecast</h3>
                <div className="grid grid-cols-6 gap-4">
                  {hourly.slice(0, 6).map((hour, i) => (
                    <div key={i} className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {hour.hour}
                      </div>
                      <div className="text-2xl my-2">
                        {getWeatherIcon(hour.condition)}
                      </div>
                      <div className="font-medium">{hour.temperature}°</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Forecast */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Weekly Forecast</h3>
                <div className="space-y-3">
                  {daily.map((day, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="w-16 font-medium">{day.day}</div>
                      <div className="w-8 text-center">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="w-12 text-right text-sm text-muted-foreground">
                        {day.minTemp}°
                      </div>
                      <div className="flex-1 mx-4 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                          style={{
                            marginLeft: `${((day.minTemp - 10) / 30) * 100}%`,
                            width: `${((day.maxTemp - day.minTemp) / 30) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="w-12 text-right font-medium">
                        {day.maxTemp}°
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
