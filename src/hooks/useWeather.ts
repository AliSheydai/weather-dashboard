"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useFavoritesStore } from "@/stores/favoritesStore";

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

export function useWeather() {
  const [selectedCity, setSelectedCity] = useState("New York");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token, isAuthenticated } = useAuthStore();
  const { fetchHistory } = useHistoryStore();
  const { favorites, fetchFavorites, addFavorite, removeFavorite } =
    useFavoritesStore();

  const fetchWeatherData = useCallback(
    async (city: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const [weatherRes, hourlyRes, dailyRes] = await Promise.all([
          fetch(
            `${API_URL}/weather/current?city=${encodeURIComponent(city)}`,
            { headers }
          ),
          fetch(
            `${API_URL}/weather/hourly?city=${encodeURIComponent(city)}`
          ),
          fetch(
            `${API_URL}/weather/forecast?city=${encodeURIComponent(city)}`
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
        setSelectedCity(weatherData.city || city);

        // Refresh history after successful search
        if (isAuthenticated && token) {
          fetchHistory(token);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [token, isAuthenticated, fetchHistory]
  );

  const searchCity = useCallback(
    (city: string) => {
      fetchWeatherData(city);
    },
    [fetchWeatherData]
  );

  const selectCity = useCallback(
    (city: string) => {
      setSelectedCity(city);
      fetchWeatherData(city);
    },
    [fetchWeatherData]
  );

  const toggleFavorite = useCallback(
    async (city: string) => {
      if (!token || !isAuthenticated) return;

      const existingFavorite = favorites.find((f) => f.city === city);
      if (existingFavorite) {
        await removeFavorite(token, existingFavorite.id);
      } else {
        await addFavorite(token, city);
      }
    },
    [token, isAuthenticated, favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (city: string) => {
      return favorites.some((f) => f.city === city);
    },
    [favorites]
  );

  // Initial fetch
  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, []);

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchHistory(token);
      fetchFavorites(token);
    }
  }, [isAuthenticated, token, fetchHistory, fetchFavorites]);

  return {
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
    retry: () => fetchWeatherData(selectedCity),
  };
}
