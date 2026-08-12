"use client";

import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

interface MiniRainfallChartProps {
  rainfall: number;
}

function generateHourlyRain(total: number): { v: number }[] {
  const peak = Math.max(total, 0.5);
  return Array.from({ length: 24 }, (_, i) => {
    let v = 0;
    if (i >= 4 && i <= 16) {
      const normalized = (i - 4) / 6;
      const bellCurve = Math.exp(-Math.pow(normalized - 1, 2) * 3);
      v = Math.round(peak * bellCurve * 100) / 100;
    }
    return { v: Math.max(0, v) };
  });
}

export function MiniRainfallChart({ rainfall }: MiniRainfallChartProps) {
  const data = useMemo(() => generateHourlyRain(rainfall), [rainfall]);

  return (
    <div className="flex justify-center">
      <ResponsiveContainer width={140} height={45}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="miniRainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <Bar
            dataKey="v"
            fill="url(#miniRainGrad)"
            radius={[1, 1, 0, 0]}
            animationBegin={200}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
