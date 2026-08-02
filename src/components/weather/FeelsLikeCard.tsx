"use client";

import { Thermometer } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface FeelsLikeCardProps {
  value: number;
  actual: number;
}

export function FeelsLikeCard({ value, actual }: FeelsLikeCardProps) {
  const diff = value - actual;
  const status =
    diff > 0
      ? `+${diff}° warmer than actual`
      : diff < 0
      ? `${diff}° cooler than actual`
      : "Same as actual";

  return (
    <WeatherCard title="Feels Like" icon={<Thermometer className="h-4 w-4" />}>
      <div className="text-3xl font-bold text-white">{value}°</div>
      <p className="text-sm text-[#94a3b8] mt-1">{status}</p>
    </WeatherCard>
  );
}
