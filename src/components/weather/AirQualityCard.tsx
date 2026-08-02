"use client";

import { Wind } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface AirQualityCardProps {
  aqi: number;
  status: string;
}

export function AirQualityCard({ aqi, status }: AirQualityCardProps) {
  const percentage = Math.min((aqi / 300) * 100, 100);

  const getStatusColor = (value: number) => {
    if (value <= 50) return "from-green-500 to-green-400";
    if (value <= 100) return "from-yellow-500 to-yellow-400";
    if (value <= 150) return "from-orange-500 to-orange-400";
    if (value <= 200) return "from-red-500 to-red-400";
    return "from-purple-500 to-purple-400";
  };

  return (
    <WeatherCard title="Air Quality" icon={<Wind className="h-4 w-4" />}>
      <div className="flex items-end gap-2 mb-2">
        <div className="text-3xl font-bold text-white">{aqi}</div>
        <div className="text-sm text-[#94a3b8] mb-1">{status}</div>
      </div>
      <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getStatusColor(aqi)} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </WeatherCard>
  );
}
