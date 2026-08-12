"use client";

import { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface MiniWindRadarProps {
  windSpeed: number;
  windDirection: string;
}

function generateWindRoseData(dominantDir: string, speed: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dirIndex = dirs.indexOf(dominantDir);
  return dirs.map((direction, i) => {
    const dist = Math.min(Math.abs(i - dirIndex), 8 - Math.abs(i - dirIndex));
    const frequency = Math.max(5, speed * (1 - dist * 0.12));
    return { direction, frequency: Math.round(frequency) };
  });
}

export function MiniWindRadar({ windSpeed, windDirection }: MiniWindRadarProps) {
  const data = useMemo(
    () => generateWindRoseData(windDirection, windSpeed),
    [windDirection, windSpeed]
  );

  return (
    <div className="flex justify-center">
      <ResponsiveContainer width={140} height={55}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar
            dataKey="frequency"
            stroke="#818cf8"
            strokeWidth={1.5}
            fill="#818cf8"
            fillOpacity={0.2}
            animationBegin={200}
            animationDuration={800}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
