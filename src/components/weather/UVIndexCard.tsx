"use client";

import { Sun } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface UVIndexCardProps {
  value: number;
  status: string;
}

export function UVIndexCard({ value, status }: UVIndexCardProps) {
  const percentage = Math.min((value / 11) * 100, 100);

  return (
    <WeatherCard title="UV Index" icon={<Sun className="h-4 w-4" />}>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <p className="text-sm text-[#94a3b8] mb-4">{status}</p>
      <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-[#475569]">0</span>
        <span className="text-xs text-[#475569]">11+</span>
      </div>
    </WeatherCard>
  );
}
