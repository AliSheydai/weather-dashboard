"use client";

import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
}

interface MiniAvgTempChartProps {
  actualTemp: number;
  feelsLike: number;
  daily?: DailyData[];
}

function generate7DayData(todayAvg: number, daily?: DailyData[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today + i) % 7;
    const dayData = daily?.[i];
    const avg = dayData
      ? Math.round((dayData.minTemp + dayData.maxTemp) / 2)
      : Math.round(todayAvg + (Math.sin(i / 7 * Math.PI * 2) * 4));
    return { day: days[dayIndex], avg };
  });
}

export function MiniAvgTempChart({ actualTemp, feelsLike, daily }: MiniAvgTempChartProps) {
  const todayAvg = Math.round((actualTemp + feelsLike) / 2);
  const data = useMemo(() => generate7DayData(todayAvg, daily), [todayAvg, daily]);

  return (
    <div className="flex justify-center">
      <ResponsiveContainer width={140} height={45}>
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#f97316"
            strokeWidth={1.5}
            dot={false}
            animationBegin={200}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
