"use client";

import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniFeelsLikeChartProps {
  actualTemp: number;
  feelsLike: number;
}

function generateHourlyData(actual: number, feels: number): { a: number; f: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    const variation = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2) * 3;
    const a = Math.round((actual + variation) * 10) / 10;
    const f = Math.round((feels + variation * 1.2) * 10) / 10;
    return { a, f };
  });
}

export function MiniFeelsLikeChart({ actualTemp, feelsLike }: MiniFeelsLikeChartProps) {
  const data = useMemo(() => generateHourlyData(actualTemp, feelsLike), [actualTemp, feelsLike]);

  return (
    <div className="flex justify-center">
      <ResponsiveContainer width={140} height={45}>
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="a"
            stroke="#f97316"
            strokeWidth={1.5}
            dot={false}
            animationBegin={200}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="f"
            stroke="#06b6d4"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            animationBegin={400}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
