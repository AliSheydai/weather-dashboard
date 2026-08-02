"use client";

import { Eye } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface VisibilityCardProps {
  value: number;
}

export function VisibilityCard({ value }: VisibilityCardProps) {
  const getStatus = (km: number) => {
    if (km >= 10) return "Excellent";
    if (km >= 5) return "Good";
    if (km >= 2) return "Moderate";
    return "Poor";
  };

  return (
    <WeatherCard title="Visibility" icon={<Eye className="h-4 w-4" />}>
      <div className="text-3xl font-bold text-white">{value} km</div>
      <p className="text-sm text-[#94a3b8] mt-1">{getStatus(value)}</p>
    </WeatherCard>
  );
}
