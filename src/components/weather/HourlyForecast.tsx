"use client";

import { Cloud, Sun, CloudRain, CloudSnow } from "lucide-react";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";

interface HourlyData {
  hour: string;
  temperature: number;
  condition: string;
  icon?: string;
}

interface HourlyForecastProps {
  data: HourlyData[];
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  const { convert } = useTemperatureUnit();

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

  return (
    <div className="rounded-2xl bg-[#141420] border border-white/[0.08] p-5">
      <h3 className="text-sm font-semibold text-[#94a3b8] mb-4 uppercase tracking-wider">
        Hourly Forecast
      </h3>
      <div className="grid grid-cols-6 gap-3">
        {data.slice(0, 6).map((hour, i) => (
          <div
            key={i}
            className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
              i === 0
                ? "bg-indigo-500/10 border border-indigo-500/20"
                : "hover:bg-white/[0.04]"
            }`}
          >
            <div
              className={`text-xs font-medium mb-2 ${
                i === 0 ? "text-indigo-400" : "text-[#64748b]"
              }`}
            >
              {i === 0 ? "Now" : hour.hour}
            </div>
            <div className="my-2">{getWeatherIcon(hour.condition)}</div>
            <div className="text-sm font-bold text-white">
              {convert(hour.temperature)}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
