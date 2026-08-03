"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
} from "lucide-react";

interface HourlyData {
  hour: string;
  temperature: number;
  condition: string;
  icon?: string;
}

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon?: string;
}

interface UnifiedWeatherCardProps {
  temperature: number;
  condition: string;
  description: string;
  feelsLike: number;
  hourly: HourlyData[];
  daily: DailyData[];
  selectedDayIndex: number;
  onDayChange: (index: number) => void;
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

export function UnifiedWeatherCard({
  temperature,
  condition,
  description,
  feelsLike,
  hourly,
  daily,
  selectedDayIndex,
  onDayChange,
}: UnifiedWeatherCardProps) {
  const [direction, setDirection] = useState(0);

  const canGoPrev = selectedDayIndex > 0;
  const canGoNext = selectedDayIndex < daily.length - 1;

  const handlePrev = useCallback(() => {
    if (canGoPrev) {
      setDirection(-1);
      onDayChange(selectedDayIndex - 1);
    }
  }, [canGoPrev, selectedDayIndex, onDayChange]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      setDirection(1);
      onDayChange(selectedDayIndex + 1);
    }
  }, [canGoNext, selectedDayIndex, onDayChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handlePrev, handleNext]);

  const selectedDay = daily[selectedDayIndex];
  const todayTemp = daily[0]?.maxTemp ?? temperature;

  const allTemps = daily.flatMap((d) => [d.minTemp, d.maxTemp]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp || 1;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-indigo-950/40 border border-white/[0.06] backdrop-blur-xl">
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/[0.07] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/[0.05] rounded-full blur-[80px] pointer-events-none" />

      <div className="relative h-full flex flex-col p-4 sm:p-6">
        {/* Top row: Current weather + Daily forecast */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
          {/* Left: Current Temperature */}
          <div className="flex flex-col justify-center sm:w-[45%] shrink-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={selectedDayIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-start gap-1">
                  <span className="text-[5.5rem] font-extralight text-white leading-none tracking-tighter">
                    {selectedDayIndex === 0
                      ? temperature
                      : Math.round((selectedDay.maxTemp + selectedDay.minTemp) / 2)}
                  </span>
                  <span className="text-2xl font-extralight text-white/40 mt-3">
                    °C
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-lg text-white/80 font-light capitalize">
                    {selectedDayIndex === 0 ? description : selectedDay.condition}
                  </span>
                </div>
                {selectedDayIndex === 0 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
                    <span>Feels like {feelsLike}°</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>
                      H:{todayTemp}° L:{daily[0]?.minTemp}°
                    </span>
                  </div>
                )}
                {selectedDayIndex !== 0 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
                    <span>
                      H:{selectedDay.maxTemp}° L:{selectedDay.minTemp}°
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Daily Forecast List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-white/30 uppercase tracking-widest">
                7-Day Forecast
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-0.5">
              {daily.map((day, i) => {
                const isSelected = i === selectedDayIndex;
                const lowPos = ((day.minTemp - minTemp) / tempRange) * 100;
                const highPos = ((day.maxTemp - minTemp) / tempRange) * 100;
                const barWidth = highPos - lowPos;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > selectedDayIndex ? 1 : -1);
                      onDayChange(i);
                    }}
                    className={`group flex items-center gap-3 py-1.5 px-2.5 rounded-lg transition-all ${
                      isSelected
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className={`w-10 text-xs font-medium ${
                        isSelected ? "text-white" : "text-white/50"
                      }`}
                    >
                      {i === 0 ? "Today" : day.day}
                    </span>
                    <div className="w-5 flex justify-center">
                      {getWeatherIcon(day.condition, "sm")}
                    </div>
                    <span className="w-7 text-right text-xs text-white/30">
                      {day.minTemp}°
                    </span>
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden relative mx-1">
                      <div
                        className="absolute h-full rounded-full transition-all duration-500"
                        style={{
                          left: `${lowPos}%`,
                          width: `${barWidth}%`,
                          background: `linear-gradient(90deg, #6366f1, ${
                            day.maxTemp > 25 ? "#f97316" : "#818cf8"
                          })`,
                        }}
                      />
                    </div>
                    <span className="w-7 text-right text-xs font-medium text-white/70">
                      {day.maxTemp}°
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom: Hourly Forecast */}
        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <h3 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-3">
            Hourly
          </h3>
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {hourly.slice(0, 8).map((h, i) => (
              <div
                key={i}
                className={`flex flex-col items-center flex-1 min-w-[56px] py-2 px-1 rounded-xl transition-colors ${
                  i === 0
                    ? "bg-white/[0.08]"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <span
                  className={`text-[10px] font-medium mb-1.5 ${
                    i === 0 ? "text-indigo-400" : "text-white/30"
                  }`}
                >
                  {i === 0 ? "Now" : h.hour}
                </span>
                {getWeatherIcon(h.condition, "sm")}
                <span className="text-xs font-semibold text-white/80 mt-1.5">
                  {h.temperature}°
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
