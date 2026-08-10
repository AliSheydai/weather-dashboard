"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWeatherBackground } from "@/lib/weatherBackground";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HourlyData {
  hour: string;
  temperature: number;
  condition: string;
  icon?: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  rainfall: number;
  feelsLike: number;
}

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon?: string;
}

interface TemperatureCardProps {
  temperature: number;
  condition: string;
  description: string;
  feelsLike: number;
  hourly: HourlyData[];
  daily: DailyData[];
  selectedDayIndex: number;
  sunriseTimestamp: number;
  sunsetTimestamp: number;
  timezone: number;
  selectedHourIndex: number | null;
  onHourSelect: (index: number | null) => void;
}

const getWeatherIcon = (condition: string, size: "sm" | "md" | "lg" = "md") => {
  const dims = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-20 w-20";
  const c = condition.toLowerCase();
  if (c.includes("clear") || c.includes("sunny"))
    return <Sun className={`${dims} text-amber-400`} />;
  if (c.includes("drizzle"))
    return <CloudDrizzle className={`${dims} text-blue-400`} />;
  if (c.includes("rain"))
    return <CloudRain className={`${dims} text-blue-400`} />;
  if (c.includes("snow"))
    return <CloudSnow className={`${dims} text-white`} />;
  if (c.includes("thunder"))
    return <CloudLightning className={`${dims} text-purple-400`} />;
  if (c.includes("cloud") || c.includes("overcast"))
    return <Cloud className={`${dims} text-slate-400`} />;
  return <Sun className={`${dims} text-amber-400`} />;
};

export function TemperatureCard({
  temperature,
  condition,
  description,
  feelsLike,
  hourly,
  daily,
  selectedDayIndex,
  sunriseTimestamp,
  sunsetTimestamp,
  timezone,
  selectedHourIndex,
  onHourSelect,
}: TemperatureCardProps) {
  const background = useMemo(
    () => getWeatherBackground(condition, sunriseTimestamp, sunsetTimestamp, timezone),
    [condition, sunriseTimestamp, sunsetTimestamp, timezone]
  );

  useEffect(() => {
    const img = new Image();
    img.src = background.image;
  }, [background.image]);

  const selectedDay = daily[selectedDayIndex];
  const todayTemp = daily[0]?.maxTemp ?? temperature;
  const maxHourIndex = hourly.length - 1;

  const handlePrevHour = () => {
    if (selectedHourIndex === null) {
      onHourSelect(0);
    } else if (selectedHourIndex > 0) {
      onHourSelect(selectedHourIndex - 1);
    }
  };

  const handleNextHour = () => {
    if (selectedHourIndex === null) {
      onHourSelect(0);
    } else if (selectedHourIndex < maxHourIndex) {
      onHourSelect(selectedHourIndex + 1);
    }
  };

  const handleHourClick = (index: number) => {
    onHourSelect(selectedHourIndex === index ? null : index);
  };

  // Determine what temperature/condition to show
  const displayTemp =
    selectedHourIndex !== null && selectedDayIndex === 0
      ? hourly[selectedHourIndex].temperature
      : selectedDayIndex === 0
        ? temperature
        : Math.round((selectedDay.maxTemp + selectedDay.minTemp) / 2);

  const displayCondition =
    selectedHourIndex !== null && selectedDayIndex === 0
      ? hourly[selectedHourIndex].condition
      : selectedDayIndex === 0
        ? description
        : selectedDay.condition;

  const displayFeelsLike =
    selectedHourIndex !== null && selectedDayIndex === 0
      ? hourly[selectedHourIndex].feelsLike
      : feelsLike;

  const variants = {
    enter: { opacity: 0, y: 8 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-white/[0.06] backdrop-blur-xl">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-300 ease-in-out"
        style={{ backgroundImage: `url(${background.image})` }}
      />

      {/* Dark overlay for text readability */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          background.isDay ? "bg-black/25" : "bg-black/45"
        }`}
      />

      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/[0.07] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/[0.05] rounded-full blur-[80px] pointer-events-none" />

      <div className="relative h-full flex flex-col p-5">
        {/* Temperature display */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedDayIndex}-${selectedHourIndex}`}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-start gap-1">
                <span className="text-[3rem] sm:text-[4rem] lg:text-[5rem] font-extralight text-white leading-none tracking-tighter">
                  {displayTemp}
                </span>
                <span className="text-xl font-extralight text-white/40 mt-2">
                  °C
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-base text-white/80 font-light capitalize">
                  {displayCondition}
                </span>
              </div>
              {selectedDayIndex === 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                  <span>Feels like {displayFeelsLike}°</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>
                    H:{todayTemp}° L:{daily[0]?.minTemp}°
                  </span>
                </div>
              )}
              {selectedDayIndex !== 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                  <span>
                    H:{selectedDay.maxTemp}° L:{selectedDay.minTemp}°
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hourly Forecast */}
        <div className="border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevHour}
              disabled={
                selectedHourIndex !== null && selectedHourIndex <= 0
              }
              className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex gap-1 overflow-x-auto scrollbar-none flex-1">
              {hourly.slice(0, 8).map((h, i) => {
                const isActive =
                  selectedHourIndex === i ||
                  (selectedHourIndex === null && i === 0);
                return (
                  <button
                    key={i}
                    onClick={() => handleHourClick(i)}
                    className={`flex flex-col items-center flex-1 min-w-[48px] py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-medium mb-1 ${
                        isActive ? "text-indigo-400" : "text-white/30"
                      }`}
                    >
                      {i === 0 ? "Now" : h.hour}
                    </span>
                    {getWeatherIcon(h.condition, "sm")}
                    <span className="text-[11px] font-semibold text-white/80 mt-1">
                      {h.temperature}°
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleNextHour}
              disabled={
                selectedHourIndex !== null &&
                selectedHourIndex >= maxHourIndex
              }
              className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
