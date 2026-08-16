import { apiFetch } from "@/lib/apiConfig";

export async function fetchHealth(): Promise<{ status: string }> {
  const response = await apiFetch("/health");
  if (!response.ok) {
    throw new Error("Failed to fetch health status");
  }
  return response.json();
}

export async function fetchWeather(city: string) {
  const response = await apiFetch(
    `/weather/current?city=${encodeURIComponent(city)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
}
