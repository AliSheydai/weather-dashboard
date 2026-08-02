import { create } from "zustand";
import { WeatherData } from "@/types/weather";

interface WeatherState {
  selectedCity: string;
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  setCity: (city: string) => void;
  fetchWeather: (city: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useWeatherStore = create<WeatherState>((set) => ({
  selectedCity: "New York",
  weatherData: null,
  isLoading: false,
  error: null,

  setCity: (city: string) => {
    set({ selectedCity: city });
  },

  fetchWeather: async (city: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_URL}/weather/current?city=${encodeURIComponent(city)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      const data = await response.json();
      set({ weatherData: data, isLoading: false, selectedCity: city });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
}));
