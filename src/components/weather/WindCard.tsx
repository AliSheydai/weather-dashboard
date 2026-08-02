"use client";

import { Wind, Compass } from "lucide-react";
import { WeatherCard } from "./WeatherCard";

interface WindCardProps {
  speed: number;
  direction?: string;
}

export function WindCard({ speed, direction = "N" }: WindCardProps) {
  const getDirectionAngle = (dir: string) => {
    const directions: Record<string, number> = {
      N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
    };
    return directions[dir] || 0;
  };

  return (
    <WeatherCard title="Wind" icon={<Wind className="h-4 w-4" />}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-white">{speed}</div>
          <div className="text-sm text-[#94a3b8]">km/h</div>
        </div>
        <div className="relative w-16 h-16">
          <Compass className="w-16 h-16 text-[#1e1e2e]" />
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform"
            style={{ transform: `rotate(${getDirectionAngle(direction)}deg)` }}
          >
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-indigo-400" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white mt-0.5">
              {direction}
            </span>
          </div>
        </div>
      </div>
    </WeatherCard>
  );
}
