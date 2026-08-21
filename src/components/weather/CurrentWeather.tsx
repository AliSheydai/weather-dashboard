"use client";

import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";

interface CurrentWeatherProps {
  temperature: number;
  condition: string;
  description: string;
  feelsLike: number;
  icon?: string;
}

export function CurrentWeather({
  temperature,
  condition,
  description,
  feelsLike,
}: CurrentWeatherProps) {
  const { convert } = useTemperatureUnit();

  const getWeatherIcon = () => {
    const c = condition.toLowerCase();
    if (c.includes("clear") || c.includes("sunny"))
      return <Sun className="h-24 w-24 text-yellow-400" />;
    if (c.includes("cloud"))
      return <Cloud className="h-24 w-24 text-[#94a3b8]" />;
    if (c.includes("rain"))
      return <CloudRain className="h-24 w-24 text-blue-400" />;
    if (c.includes("snow"))
      return <CloudSnow className="h-24 w-24 text-white" />;
    if (c.includes("thunder"))
      return <CloudLightning className="h-24 w-24 text-purple-400" />;
    return <Cloud className="h-24 w-24 text-[#94a3b8]" />;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-[#141420] to-purple-500/10 border border-white/[0.08] p-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex items-center justify-between">
        {/* Temperature and condition */}
        <div>
          <div className="text-8xl font-bold text-white tracking-tighter">
            {convert(temperature)}°
          </div>
          <p className="text-xl text-[#94a3b8] mt-2 capitalize">{description}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
              <span className="text-[#94a3b8]">Feels like</span>
              <span className="text-white font-medium">{convert(feelsLike)}°</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#475569]" />
            <div className="text-sm text-[#64748b]">{getCurrentTime()}</div>
          </div>
        </div>

        {/* Weather Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl scale-150" />
          {getWeatherIcon()}
        </div>
      </div>
    </div>
  );
}
