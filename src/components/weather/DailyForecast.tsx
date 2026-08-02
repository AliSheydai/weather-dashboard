"use client";

import { Cloud, Sun, CloudRain, CloudSnow } from "lucide-react";

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon?: string;
}

interface DailyForecastProps {
  data: DailyData[];
}

export function DailyForecast({ data }: DailyForecastProps) {
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("clear") || c.includes("sunny"))
      return <Sun className="h-5 w-5 text-yellow-400" />;
    if (c.includes("cloud"))
      return <Cloud className="h-5 w-5 text-[#94a3b8]" />;
    if (c.includes("rain"))
      return <CloudRain className="h-5 w-5 text-blue-400" />;
    if (c.includes("snow"))
      return <CloudSnow className="h-5 w-5 text-white" />;
    return <Cloud className="h-5 w-5 text-[#94a3b8]" />;
  };

  // Find min and max across all days for scaling
  const allTemps = data.flatMap((d) => [d.minTemp, d.maxTemp]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="rounded-2xl bg-[#141420] border border-white/[0.08] p-5">
      <h3 className="text-sm font-semibold text-[#94a3b8] mb-4 uppercase tracking-wider">
        Weekly Forecast
      </h3>
      <div className="space-y-2">
        {data.map((day, i) => {
          const lowPosition = ((day.minTemp - minTemp) / tempRange) * 100;
          const highPosition = ((day.maxTemp - minTemp) / tempRange) * 100;
          const barWidth = highPosition - lowPosition;

          return (
            <div
              key={i}
              className={`flex items-center py-2.5 px-3 rounded-xl transition-colors ${
                i === 0
                  ? "bg-indigo-500/10 border border-indigo-500/20"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              <div
                className={`w-16 text-sm font-medium ${
                  i === 0 ? "text-indigo-400" : "text-white"
                }`}
              >
                {i === 0 ? "Today" : day.day}
              </div>
              <div className="w-8 flex justify-center">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="w-12 text-right text-sm text-[#64748b]">
                {day.minTemp}°
              </div>
              <div className="flex-1 mx-4 h-2 bg-[#1e1e2e] rounded-full overflow-hidden relative">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 rounded-full transition-all"
                  style={{
                    left: `${lowPosition}%`,
                    width: `${barWidth}%`,
                  }}
                />
              </div>
              <div className="w-12 text-right text-sm font-medium text-white">
                {day.maxTemp}°
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
