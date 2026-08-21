"use client";

import { Thermometer } from "lucide-react";
import { WeatherCard } from "./WeatherCard";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";

interface FeelsLikeCardProps {
  value: number;
  actual: number;
}

export function FeelsLikeCard({ value, actual }: FeelsLikeCardProps) {
  const { convert } = useTemperatureUnit();
  const convertedValue = convert(value);
  const convertedActual = convert(actual);
  const diff = convertedValue - convertedActual;
  const status =
    diff > 0
      ? `+${diff}° warmer than actual`
      : diff < 0
      ? `${diff}° cooler than actual`
      : "Same as actual";

  return (
    <WeatherCard title="Feels Like" icon={<Thermometer className="h-4 w-4" />}>
      <div className="text-3xl font-bold text-white">{convertedValue}°</div>
      <p className="text-sm text-[#94a3b8] mt-1">{status}</p>
    </WeatherCard>
  );
}
