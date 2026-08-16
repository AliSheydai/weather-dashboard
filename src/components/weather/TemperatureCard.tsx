"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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

const getWeatherIcon = (condition: string, size: "sm" | "md" | "lg" = "md", isDay: boolean = false) => {
  const dims = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-20 w-20";
  const c = condition.toLowerCase();
  if (c.includes("clear") || c.includes("sunny"))
    return <Sun className={`${dims} ${isDay ? "text-amber-600" : "text-amber-400"}`} />;
  if (c.includes("drizzle"))
    return <CloudDrizzle className={`${dims} ${isDay ? "text-blue-600" : "text-blue-400"}`} />;
  if (c.includes("rain"))
    return <CloudRain className={`${dims} ${isDay ? "text-blue-600" : "text-blue-400"}`} />;
  if (c.includes("snow"))
    return <CloudSnow className={`${dims} ${isDay ? "text-slate-700" : "text-white"}`} />;
  if (c.includes("thunder"))
    return <CloudLightning className={`${dims} ${isDay ? "text-purple-600" : "text-purple-400"}`} />;
  if (c.includes("cloud") || c.includes("overcast"))
    return <Cloud className={`${dims} ${isDay ? "text-slate-600" : "text-slate-400"}`} />;
  return <Sun className={`${dims} ${isDay ? "text-amber-600" : "text-amber-400"}`} />;
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
  const isDay = background.isDay;

  useEffect(() => {
    const img = new Image();
    img.src = background.image;
  }, [background.image]);

  const selectedDay = daily[selectedDayIndex];
  const todayTemp = daily[0]?.maxTemp ?? temperature;
  const maxHourIndex = hourly.length - 1;
  const VISIBLE_COUNT = 5;

  // Sliding window start index
  const [windowStart, setWindowStart] = useState(0);
  const maxWindowStart = Math.max(0, hourly.length - VISIBLE_COUNT);

  // Reset window when hour selection or city/day changes
  useEffect(() => {
    setWindowStart(0);
  }, [selectedDayIndex]);

  const handlePrevHour = useCallback(() => {
    if (selectedHourIndex === null) {
      onHourSelect(0);
      setWindowStart(0);
    } else if (selectedHourIndex > 0) {
      const newIndex = selectedHourIndex - 1;
      onHourSelect(newIndex);
      // Shift window left if selection goes before visible range
      if (newIndex < windowStart) {
        setWindowStart(newIndex);
      }
    }
  }, [selectedHourIndex, onHourSelect, windowStart]);

  const handleNextHour = useCallback(() => {
    if (selectedHourIndex === null) {
      onHourSelect(0);
      setWindowStart(0);
    } else if (selectedHourIndex < maxHourIndex) {
      const newIndex = selectedHourIndex + 1;
      onHourSelect(newIndex);
      // Shift window right if selection goes beyond visible range
      if (newIndex >= windowStart + VISIBLE_COUNT) {
        setWindowStart(Math.min(newIndex - VISIBLE_COUNT + 1, maxWindowStart));
      }
    }
  }, [selectedHourIndex, onHourSelect, maxHourIndex, windowStart, maxWindowStart]);

  const handleHourClick = (index: number) => {
    if (selectedHourIndex === index) {
      onHourSelect(null);
    } else {
      onHourSelect(index);
      // Ensure clicked item is visible in window
      if (index < windowStart) {
        setWindowStart(index);
      } else if (index >= windowStart + VISIBLE_COUNT) {
        setWindowStart(Math.min(index - VISIBLE_COUNT + 1, maxWindowStart));
      }
    }
  };

  const visibleHours = hourly.slice(windowStart, windowStart + VISIBLE_COUNT);

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
    <div className={`relative h-full rounded-2xl overflow-hidden border backdrop-blur-xl transition-colors duration-300 ${
      isDay ? "border-slate-900/10" : "border-white/[0.06]"
    }`}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-300 ease-in-out"
        style={{ backgroundImage: `url(${background.image})` }}
      />

      {/* Overlay for text readability */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          isDay ? "bg-white/25 backdrop-brightness-105" : "bg-black/45"
        }`}
      />

      {/* Ambient glow */}
      <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
        isDay ? "bg-amber-500/[0.12]" : "bg-indigo-500/[0.07]"
      }`} />
      <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none ${
        isDay ? "bg-blue-500/[0.08]" : "bg-purple-500/[0.05]"
      }`} />

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
                <span className={`text-[3rem] sm:text-[4rem] lg:text-[5rem] font-light leading-none tracking-tighter ${
                  isDay ? "text-slate-900 font-normal drop-shadow-sm" : "text-white font-extralight"
                }`}>
                  {displayTemp}
                </span>
                <span className={`text-xl font-light mt-2 ${
                  isDay ? "text-slate-700 font-medium" : "text-white/40 font-extralight"
                }`}>
                  °C
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className={`text-base font-medium capitalize ${
                  isDay ? "text-slate-800" : "text-white/80 font-light"
                }`}>
                  {displayCondition}
                </span>
              </div>
              {selectedDayIndex === 0 && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${
                  isDay ? "text-slate-700 font-medium" : "text-white/40"
                }`}>
                  <span>Feels like {displayFeelsLike}°</span>
                  <span className={`w-1 h-1 rounded-full ${isDay ? "bg-slate-700/50" : "bg-white/20"}`} />
                  <span>
                    H:{todayTemp}° L:{daily[0]?.minTemp}°
                  </span>
                </div>
              )}
              {selectedDayIndex !== 0 && (
                <div className={`mt-2 flex items-center gap-2 text-xs ${
                  isDay ? "text-slate-700 font-medium" : "text-white/40"
                }`}>
                  <span>
                    H:{selectedDay.maxTemp}° L:{selectedDay.minTemp}°
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hourly Forecast */}
        <div className={`border-t pt-3 ${isDay ? "border-slate-900/10" : "border-white/[0.06]"}`}>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevHour}
              disabled={
                selectedHourIndex !== null && selectedHourIndex <= 0
              }
              className={`p-1 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0 ${
                isDay
                  ? "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleHours.map((h) => {
                  const realIndex = hourly.indexOf(h);
                  const isActive = selectedHourIndex === realIndex;
                  const isFirst = realIndex === 0;
                  return (
                    <motion.button
                      key={realIndex}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      onClick={() => handleHourClick(realIndex)}
                      className={`flex flex-col items-center flex-1 min-w-0 py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
                        isActive
                          ? isDay ? "bg-black/[0.08]" : "bg-white/[0.08]"
                          : isDay ? "hover:bg-black/[0.04]" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium mb-1 ${
                          isActive
                            ? isDay ? "text-indigo-600 font-bold" : "text-indigo-400"
                            : isDay ? "text-slate-600 font-medium" : "text-white/30"
                        }`}
                      >
                        {isFirst ? "Now" : h.hour}
                      </span>
                      {getWeatherIcon(h.condition, "sm", isDay)}
                      <span className={`text-[11px] font-semibold mt-1 ${
                        isDay ? "text-slate-900" : "text-white/80"
                      }`}>
                        {h.temperature}°
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
            <button
              onClick={handleNextHour}
              disabled={
                selectedHourIndex !== null &&
                selectedHourIndex >= maxHourIndex
              }
              className={`p-1 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0 ${
                isDay
                  ? "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
