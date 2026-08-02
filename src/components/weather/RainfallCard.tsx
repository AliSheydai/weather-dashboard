"use client";

import { CloudRain } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface RainfallCardProps {
  value: number;
}

export function RainfallCard({ value }: RainfallCardProps) {
  return (
    <WeatherCard title="Rainfall" icon={<CloudRain className="h-4 w-4" />}>
      <div className="text-3xl font-bold text-white">{value} mm</div>
      <p className="text-sm text-[#94a3b8] mt-1">
        {value === 0 ? "No rainfall expected" : "in the last 24 hours"}
      </p>
    </WeatherCard>
  );
}
