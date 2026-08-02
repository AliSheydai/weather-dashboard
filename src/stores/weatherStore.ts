import { create } from "zustand";

interface CurrentWeather {
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const [weatherRes, hourlyRes, dailyRes] = await Promise.all([
        fetch(`${API_URL}/weather/current?city=${encodeURIComponent(city)}`, { headers }),
        fetch(`${API_URL}/weather/hourly?city=${encodeURIComponent(city)}`),
        fetch(`${API_URL}/weather/forecast?city=${encodeURIComponent(city)}`),
      ]);

      if (!weatherRes.ok) {
        throw new Error("City not found");
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
      set({
        error: error instanceof Error ? error.message : "Failed to fetch weather",
        isLoading: false,
      });
    }
  },
}));
