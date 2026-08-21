"use client";

import { useAuthStore } from "@/stores/authStore";
import {
  TemperatureUnit,
  convertTemperature,
  convertTempDiff,
  formatTemperature,
  formatDegree,
} from "@/lib/temperature";
import { useCallback } from "react";

export function useTemperatureUnit() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateTemperatureUnit = useAuthStore(
    (state) => state.updateTemperatureUnit
  );

  // Authenticated user's preference, localStorage cache, or default to Celsius
  const storedUnit =
    typeof window !== "undefined"
      ? (localStorage.getItem("temperature_unit") as TemperatureUnit | null)
      : null;

  const unit: TemperatureUnit =
    (isAuthenticated && user?.temperatureUnit) ||
    user?.temperatureUnit ||
    storedUnit ||
    "C";

  const convert = useCallback(
    (celsius: number) => convertTemperature(celsius, unit),
    [unit]
  );

  const convertDiff = useCallback(
    (diffCelsius: number) => convertTempDiff(diffCelsius, unit),
    [unit]
  );

  const format = useCallback(
    (celsius: number) => formatTemperature(celsius, unit),
    [unit]
  );

  const setUnit = useCallback(
    async (newUnit: TemperatureUnit) => {
      if (unit === newUnit) return;
      await updateTemperatureUnit(newUnit);
    },
    [unit, updateTemperatureUnit]
  );

  return {
    unit,
    isCelsius: unit === "C",
    isFahrenheit: unit === "F",
    unitSymbol: `°${unit}`,
    convert,
    convertDiff,
    format,
    formatDegree,
    setUnit,
  };
}
