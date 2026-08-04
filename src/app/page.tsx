"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { PremiumSidebar } from "@/components/weather/PremiumSidebar";
import { TemperatureCard } from "@/components/weather/TemperatureCard";
import { MetricsGrid } from "@/components/weather/MetricsGrid";
import { WeeklyForecastCompact } from "@/components/weather/WeeklyForecastCompact";
import { useWeather } from "@/hooks/useWeather";
import { useAuthStore } from "@/stores/authStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
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
    retry,
  } = useWeather();

  const { user, isAuthenticated, logout, initialize } = useAuthStore();
  const { history } = useHistoryStore();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

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
        <PremiumSidebar
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
          onLogout={handleLogout}
          onSettings={() => {}}
          onRefresh={retry}
          currentWeather={weather ? {
            city: weather.city,
            temperature: weather.temperature,
            condition: weather.condition,
            aqi: (weather as any).aqi,
            aqiStatus: (weather as any).aqiStatus,
          } : null}
        />
      }
      header={
        <DashboardHeader
          city={selectedCity}
          onSearch={searchCity}
          isLoading={isLoading}
          searchHistory={history}
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
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-white/60 rounded-xl hover:bg-white/[0.1] transition-colors text-xs border border-white/[0.06]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Weather Content — Two-column layout */}
      {weather && !isLoading && !error && (() => {
        const selectedDay = daily[selectedDayIndex];
        const isToday = selectedDayIndex === 0;

        // Derive metric values from selected day's data
        const dayHumidity = selectedDay?.humidity ?? weather.humidity;
        const dayWindSpeed = selectedDay?.windSpeed ?? weather.windSpeed;
        const dayWindDir = selectedDay?.windDirection ?? "NW";
        const dayVisibility = selectedDay?.visibility ?? weather.visibility;
        const dayRainfall = selectedDay?.rainfall ?? 0;
        const dayFeelsLike = isToday
          ? weather.feelsLike
          : Math.round(((selectedDay?.maxTemp ?? 0) + (selectedDay?.minTemp ?? 0)) / 2);
        const dayUvIndex = isToday ? (weather as any).uvIndex ?? 3 : Math.max(0, Math.min(11, ((weather as any).uvIndex ?? 3) + selectedDayIndex - 3));
        const dayAqi = isToday ? (weather as any).aqi ?? 56 : Math.max(0, Math.min(300, ((weather as any).aqi ?? 56) + (selectedDayIndex * 5) - 15));
        const dayAqiStatus = dayAqi <= 50 ? "Good" : dayAqi <= 100 ? "Moderate" : dayAqi <= 150 ? "Unhealthy SG" : "Unhealthy";

        return (
          <div className="h-full flex flex-col lg:flex-row gap-3 animate-fade-in overflow-auto lg:overflow-hidden">
            {/* Left Column: Temperature + Weekly Forecast */}
            <div className="lg:w-[38%] flex flex-col gap-3 min-h-0 lg:min-h-0">
              {/* Temperature Card — height = 1 sub-card row */}
              <div className="flex-[1] min-h-0">
                <TemperatureCard
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

              {/* Weekly Forecast — height = 2 sub-card rows */}
              <div className="flex-[2] min-h-0">
                <WeeklyForecastCompact
                  data={daily}
                  selectedDayIndex={selectedDayIndex}
                  onDaySelect={setSelectedDayIndex}
                />
              </div>
            </div>

            {/* Right Column: Metrics Grid 3x3 */}
            <div className="lg:flex-1 min-h-0">
              <MetricsGrid
                uvIndex={dayUvIndex}
                uvStatus={dayUvIndex <= 2 ? "Low" : dayUvIndex <= 5 ? "Moderate" : dayUvIndex <= 7 ? "High" : "Very High"}
                sunrise={weather.sunrise}
                sunset={weather.sunset}
                visibility={dayVisibility}
                feelsLike={dayFeelsLike}
                actualTemp={isToday ? weather.temperature : Math.round(((selectedDay?.maxTemp ?? 0) + (selectedDay?.minTemp ?? 0)) / 2)}
                rainfall={dayRainfall}
                windSpeed={dayWindSpeed}
                windDirection={dayWindDir}
                aqi={dayAqi}
                aqiStatus={dayAqiStatus}
                humidity={dayHumidity}
                daily={daily}
              />
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
