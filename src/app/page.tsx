"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WeatherSidebar } from "@/components/weather/WeatherSidebar";
import { UnifiedWeatherCard } from "@/components/weather/UnifiedWeatherCard";
import { MetricsGrid } from "@/components/weather/MetricsGrid";
import { WeeklyForecastCompact } from "@/components/weather/WeeklyForecastCompact";
import { useWeather } from "@/hooks/useWeather";
import { useAuthStore } from "@/stores/authStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const {
    selectedCity,
    weather,
    hourly,
    daily,
    isLoading,
    error,
    favorites,
    searchCity,
    selectCity,
    toggleFavorite,
    isFavorite,
    retry,
  } = useWeather();

  const { user, isAuthenticated, logout, initialize } = useAuthStore();
  const { history } = useHistoryStore();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Reset day selection when city changes
  useEffect(() => {
    setSelectedDayIndex(0);
  }, [selectedCity]);

  const favoriteCities = favorites.map((fav) => ({
    name: fav.city,
    temperature: 0,
    condition: "Unknown",
    high: 0,
    low: 0,
    isFavorite: true,
  }));

  const handleRemoveFavorite = (cityName: string) => {
    const fav = favorites.find((f) => f.city === cityName);
    if (fav && token) {
      toggleFavorite(cityName);
    }
  };

  return (
    <DashboardLayout
      sidebar={
        <WeatherSidebar
          onCitySelect={selectCity}
          selectedCity={selectedCity}
          onSearch={searchCity}
          isLoading={isLoading}
          favoriteCities={favoriteCities}
          searchHistory={history}
          onToggleFavorite={toggleFavorite}
          onRemoveFavorite={handleRemoveFavorite}
          isAuthenticated={isAuthenticated}
          userName={user?.name || "Guest"}
          userEmail={user?.email || "guest@example.com"}
          userAvatar={user?.avatar}
          onLogout={logout}
          onSettings={() => {}}
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
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400/60" />
            <p className="text-xs text-white/30 uppercase tracking-widest">
              Loading weather data
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Unable to load weather
            </h3>
            <p className="text-xs text-white/40">{error}</p>
            <button
              onClick={retry}
              className="flex items-center gap-2 px-4 py-2 bg-white/6 text-white/60 rounded-xl hover:bg-white/10 transition-colors text-xs border border-white/6"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Weather Content — Three-tier layout */}
      {weather && !isLoading && !error && (
        <div className="h-full flex flex-col gap-3 animate-fade-in overflow-auto lg:overflow-hidden">
          {/* Tier 1: Unified Weather Card (~45%) */}
          <div className="lg:flex-45 min-h-0 lg:min-h-0">
            <UnifiedWeatherCard
              temperature={weather.temperature}
              condition={weather.condition}
              description={weather.description}
              feelsLike={weather.feelsLike}
              hourly={hourly}
              daily={daily}
              selectedDayIndex={selectedDayIndex}
              onDayChange={setSelectedDayIndex}
            />
          </div>

          {/* Tier 2: Metrics Grid + Weekly Forecast (~55%) */}
          <div className="lg:flex-55 min-h-0 flex flex-col lg:flex-row gap-3">
            {/* Metrics Grid — 9 cards in 3x3 */}
            <div className="lg:flex-3 min-w-0">
              <MetricsGrid
                uvIndex={3}
                uvStatus="Moderate"
                sunrise={weather.sunrise}
                sunset={weather.sunset}
                visibility={weather.visibility}
                feelsLike={weather.feelsLike}
                actualTemp={weather.temperature}
                rainfall={0}
                windSpeed={weather.windSpeed}
                windDirection="NW"
                aqi={56}
                aqiStatus="Moderate"
                humidity={weather.humidity}
              />
            </div>

            {/* Weekly Forecast — compact column */}
            <div className="lg:flex-1 min-w-0">
              <WeeklyForecastCompact
                data={daily}
                selectedDayIndex={selectedDayIndex}
                onDaySelect={setSelectedDayIndex}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
