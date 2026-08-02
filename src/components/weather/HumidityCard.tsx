"use client";

import { Droplets } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface HumidityCardProps {
  value: number;
}

export function HumidityCard({ value }: HumidityCardProps) {
  const getStatus = (humidity: number) => {
    if (humidity < 30) return "Dry";
    if (humidity < 60) return "Comfortable";
    if (humidity < 80) return "Moderate";
    return "High";
  };

  return (
    <WeatherCard title="Humidity" icon={<Droplets className="h-4 w-4" />}>
      <div className="text-3xl font-bold text-white">{value}%</div>
      <p className="text-sm text-[#94a3b8] mt-1">{getStatus(value)}</p>
      <div className="mt-4 h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </WeatherCard>
  );
}
