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

/**
 * Overlay gradient for text readability on top of the background image.
 * Day images are bright so we use a dark gradient from bottom;
 * Night/sunset images are already dark but we still add a subtle vignette.
 */
function getOverlayStyle(isDay: boolean, isSunset: boolean): string {
  if (isSunset) {
    // Sunset: warm dark gradient from bottom + slight top darkening
    return "bg-gradient-to-t from-black/70 via-black/30 to-black/20";
  }
  if (isDay) {
    // Day: strong bottom gradient so white/dark text remains readable
    return "bg-gradient-to-t from-black/65 via-black/25 to-black/10";
  }
  // Night: moderate overlay — images are already dark
  return "bg-gradient-to-t from-black/60 via-black/20 to-black/10";
}

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
  const { isDay, isSunset } = background;

  // Preload next background image when it changes
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

  const overlayClass = getOverlayStyle(isDay, isSunset);

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-white/[0.08]">
      {/* Background image — animated cross-fade when image URL changes */}
      <AnimatePresence initial={false}>
        <motion.div
          key={background.image}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background.image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Readability gradient overlay */}
      <div className={`absolute inset-0 ${overlayClass} transition-opacity duration-500`} />

      {/* Subtle ambient vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] pointer-events-none rounded-2xl" />

      {/* Content */}
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
                <span className="text-[3rem] sm:text-[4rem] lg:text-[5rem] font-light leading-none tracking-tighter text-white drop-shadow-lg">
                  {displayTemp}
                </span>
                <span className="text-xl font-light mt-2 text-white/60 drop-shadow">
                  °C
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-base font-medium capitalize text-white/90 drop-shadow">
                  {displayCondition}
                </span>
              </div>
              {selectedDayIndex === 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
                  <span>Feels like {displayFeelsLike}°</span>
                  <span className="w-1 h-1 rounded-full bg-white/25" />
                  <span>
                    H:{todayTemp}° L:{daily[0]?.minTemp}°
                  </span>
                </div>
              )}
              {selectedDayIndex !== 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
                  <span>
                    H:{selectedDay.maxTemp}° L:{selectedDay.minTemp}°
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hourly Forecast */}
        <div className="border-t border-white/[0.12] pt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevHour}
              disabled={
                selectedHourIndex !== null && selectedHourIndex <= 0
              }
              className="p-1 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0 text-white/40 hover:text-white/70 hover:bg-white/[0.08]"
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
                          ? "bg-white/[0.15] ring-1 ring-white/20"
                          : "hover:bg-white/[0.08]"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium mb-1 ${
                          isActive ? "text-white font-bold" : "text-white/40"
                        }`}
                      >
                        {isFirst ? "Now" : h.hour}
                      </span>
                      {getWeatherIcon(h.condition, "sm", isDay)}
                      <span className="text-[11px] font-semibold mt-1 text-white/80">
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
              className="p-1 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0 text-white/40 hover:text-white/70 hover:bg-white/[0.08]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
