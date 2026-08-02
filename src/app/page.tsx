"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WeatherSidebar } from "@/components/weather/WeatherSidebar";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { UVIndexCard } from "@/components/weather/UVIndexCard";
import { SunriseCard } from "@/components/weather/SunriseCard";
import { VisibilityCard } from "@/components/weather/VisibilityCard";
import { FeelsLikeCard } from "@/components/weather/FeelsLikeCard";
import { WindCard } from "@/components/weather/WindCard";
import { AirQualityCard } from "@/components/weather/AirQualityCard";
import { HumidityCard } from "@/components/weather/HumidityCard";
import { RainfallCard } from "@/components/weather/RainfallCard";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("browse");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (city: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [weatherRes, hourlyRes, dailyRes] = await Promise.all([
        fetch(`${API_URL}/weather/current?city=${encodeURIComponent(city)}`),
        fetch(`${API_URL}/weather/hourly?city=${encodeURIComponent(city)}`),
        fetch(`${API_URL}/weather/forecast?city=${encodeURIComponent(city)}`),
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
      setSelectedCity(weatherData.city || city);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, []);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    fetchWeatherData(city);
  };

  const handleSearch = (city: string) => {
    fetchWeatherData(city);
  };

  return (
    <DashboardLayout
      sidebar={
        <WeatherSidebar
          onCitySelect={handleCitySelect}
          selectedCity={selectedCity}
          onSearch={handleSearch}
          isLoading={isLoading}
          userName="Ali"
          userEmail="ali@example.com"
          onLogout={() => {
            /* Handle logout */
          }}
          onSettings={() => {
            /* Handle settings */
          }}
        />
      }
      header={
        <DashboardHeader
          city={selectedCity}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
    >
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
            <p className="text-[#94a3b8]">Loading weather data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Unable to load weather
            </h3>
            <p className="text-[#94a3b8]">{error}</p>
            <button
              onClick={() => fetchWeatherData(selectedCity)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Weather Content */}
      {weather && !isLoading && !error && (
        <div className="space-y-6">
          {/* Current Weather */}
          <CurrentWeather
            temperature={weather.temperature}
            condition={weather.condition}
            description={weather.description}
            feelsLike={weather.feelsLike}
          />

          {/* Hourly Forecast */}
          <HourlyForecast data={hourly} />

          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UVIndexCard value={3} status="Moderate" />
            <SunriseCard sunrise={weather.sunrise} sunset={weather.sunset} />
            <WindCard speed={weather.windSpeed} direction="NW" />
            <HumidityCard value={weather.humidity} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FeelsLikeCard value={weather.feelsLike} actual={weather.temperature} />
            <VisibilityCard value={weather.visibility} />
            <AirQualityCard aqi={56} status="Moderate" />
            <RainfallCard value={0} />
          </div>

          {/* Daily Forecast */}
          <DailyForecast data={daily} />
        </div>
      )}
    </DashboardLayout>
  );
}
