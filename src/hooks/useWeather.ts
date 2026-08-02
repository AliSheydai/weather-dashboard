"use client";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useWeatherStore } from "@/stores/weatherStore";

export function useWeather() {
  const {
    selectedCity,
    current: weather,
    hourly,
    daily,
    isLoading,
    error,
    fetchAllWeather,
    setCity,
  } = useWeatherStore();

  const { token, isAuthenticated } = useAuthStore();
  const { fetchHistory } = useHistoryStore();
  const { favorites, fetchFavorites, addFavorite, removeFavorite } =
    useFavoritesStore();

  const fetchWeatherData = useCallback(
    async (city: string) => {
      await fetchAllWeather(city, token || undefined);

      // Refresh history after successful search
      if (isAuthenticated && token) {
        fetchHistory(token);
      }
    },
    [fetchAllWeather, token, isAuthenticated, fetchHistory]
  );

  const searchCity = useCallback(
    (city: string) => {
      fetchWeatherData(city);
    },
    [fetchWeatherData]
  );

  const selectCity = useCallback(
    (city: string) => {
      setCity(city);
      fetchWeatherData(city);
    },
    [setCity, fetchWeatherData]
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
