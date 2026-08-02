"use client";

import { Sunrise, Sunset } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface SunriseCardProps {
  sunrise: string;
  sunset: string;
}

export function SunriseCard({ sunrise, sunset }: SunriseCardProps) {
  return (
    <WeatherCard title="Sunrise" icon={<Sunrise className="h-4 w-4" />}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sunrise className="h-5 w-5 text-orange-400" />
            <span className="text-xs text-[#64748b]">Sunrise</span>
          </div>
          <div className="text-2xl font-bold text-white">{sunrise}</div>
        </div>
        <div className="w-px h-12 bg-white/[0.08]" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sunset className="h-5 w-5 text-purple-400" />
            <span className="text-xs text-[#64748b]">Sunset</span>
          </div>
          <div className="text-2xl font-bold text-white">{sunset}</div>
        </div>
      </div>
      {/* Timeline visualization */}
      <div className="mt-4 h-2 bg-[#1e1e2e] rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-500 to-purple-500 opacity-30" />
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
          style={{ width: "60%" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
          style={{ left: "60%" }}
        />
      </div>
    </WeatherCard>
  );
}
