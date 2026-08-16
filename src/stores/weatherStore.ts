import { create } from "zustand";
import { apiFetch } from "@/lib/apiConfig";

interface CurrentWeather {
  city: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  feelsLike: number;
  visibility: number;
  uvIndex: number;
  aqi: number;
  aqiStatus: string;
  rainfall: number;
  icon: string;
  sunrise: string;
  sunset: string;
  sunriseTimestamp: number;
  sunsetTimestamp: number;
  timezone: number;
}

interface HourlyData {
  hour: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  rainfall: number;
  feelsLike: number;
}

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  rainfall: number;
}

interface WeatherState {
  selectedCity: string;
  current: CurrentWeather | null;
  hourly: HourlyData[];
  daily: DailyData[];
  isLoading: boolean;
  error: string | null;
  setCity: (city: string) => void;
  fetchAllWeather: (city: string, token?: string) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  selectedCity: "New York",
  current: null,
  hourly: [],
  daily: [],
  isLoading: false,
  error: null,

  setCity: (city: string) => {
    set({ selectedCity: city });
  },

  fetchAllWeather: async (city: string, token?: string) => {
    set({ isLoading: true, error: null });
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection.");
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const [weatherRes, hourlyRes, dailyRes] = await Promise.all([
        apiFetch(`/weather/current?city=${encodeURIComponent(city)}`, { headers }),
        apiFetch(`/weather/hourly?city=${encodeURIComponent(city)}`),
        apiFetch(`/weather/forecast?city=${encodeURIComponent(city)}`),
      ]);

      if (!weatherRes.ok) {
        if (weatherRes.status === 404) {
          throw new Error(`City "${city}" not found. Please check the city name.`);
        }
        if (weatherRes.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        if (weatherRes.status >= 500) {
          throw new Error("Server is temporarily unavailable. Please try again later.");
        }
        throw new Error("Failed to fetch weather data. Please try again.");
      }

      const current = await weatherRes.json();
      const hourly = await hourlyRes.json();
      const daily = await dailyRes.json();

      set({
        current,
        hourly,
        daily,
        selectedCity: current.city || city,
        isLoading: false,
      });
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        set({
          error: "Unable to connect to the server. Please check if the backend is running.",
          isLoading: false,
        });
      } else {
        set({
          error: error instanceof Error ? error.message : "Failed to fetch weather",
          isLoading: false,
        });
      }
    }
  },
}));
