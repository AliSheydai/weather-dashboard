"use client";

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
import { useWeather } from "@/hooks/useWeather";
import { useAuthStore } from "@/stores/authStore";
import { useHistoryStore } from "@/stores/historyStore";
import { Loader2, AlertCircle, RefreshCw, Star } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("browse");

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

  const { user, isAuthenticated, logout } = useAuthStore();
  const { history, clearHistory } = useHistoryStore();
  const token = useAuthStore((state) => state.token);

  // Convert favorites to CityData format for sidebar
  const favoriteCities = favorites.map((fav) => ({
    name: fav.city,
    temperature: 0,
    condition: "Unknown",
    high: 0,
    low: 0,
    isFavorite: true,
  }));

  const handleClearHistory = () => {
    if (token) {
      clearHistory(token);
    }
  };

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
          onClearHistory={handleClearHistory}
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
              onClick={retry}
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
        <div className="space-y-6 animate-fade-in">
          {/* Current Weather with Favorite Button */}
          <div className="relative">
            <CurrentWeather
              temperature={weather.temperature}
              condition={weather.condition}
              description={weather.description}
              feelsLike={weather.feelsLike}
            />
            {/* Favorite Button */}
            {isAuthenticated && (
              <button
                onClick={() => toggleFavorite(weather.city)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                title={
                  isFavorite(weather.city)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Star
                  className={`h-5 w-5 ${
                    isFavorite(weather.city)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white"
                  }`}
                />
              </button>
            )}
          </div>

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
            <FeelsLikeCard
              value={weather.feelsLike}
              actual={weather.temperature}
            />
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
