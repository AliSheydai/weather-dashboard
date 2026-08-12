"use client";

import { useMemo } from "react";
import { AreaChart, Area, ReferenceLine, ResponsiveContainer } from "recharts";

interface MiniHumidityChartProps {
  humidity: number;
}

function generateHourlyHumidity(current: number): { h: number; v: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    let v = current;
    if (i >= 0 && i < 6) v = current + 8 - i;
    else if (i >= 6 && i < 12) v = current - (i - 6) * 2;
    else if (i >= 12 && i < 18) v = current - 6 + (i - 12) * 1.5;
    else v = current + 3 - (i - 18) * 1.5;
    return { h: i, v: Math.max(10, Math.min(100, Math.round(v))) };
  });
}

export function MiniHumidityChart({ humidity }: MiniHumidityChartProps) {
  const data = useMemo(() => generateHourlyHumidity(humidity), [humidity]);

  return (
    <div className="flex justify-center">
      <ResponsiveContainer width={140} height={45}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="2 2" opacity={0.3} />
          <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="2 2" opacity={0.3} />
          <defs>
            <linearGradient id="miniHumidityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke="#3b82f6"
            strokeWidth={1.5}
            fill="url(#miniHumidityGrad)"
            dot={false}
            animationBegin={200}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
