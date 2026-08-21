"use client";

import { motion } from "framer-motion";
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
import { useCallback, useEffect } from "react";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon?: string;
}

interface WeeklyForecastCompactProps {
  data: DailyData[];
  selectedDayIndex: number;
  onDaySelect: (index: number) => void;
}

const getWeatherIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes("clear") || c.includes("sunny"))
    return <Sun className="h-3.5 w-3.5 text-amber-400" />;
  if (c.includes("drizzle"))
    return <CloudDrizzle className="h-3.5 w-3.5 text-blue-400" />;
  if (c.includes("rain"))
    return <CloudRain className="h-3.5 w-3.5 text-blue-400" />;
  if (c.includes("snow"))
    return <CloudSnow className="h-3.5 w-3.5 text-white" />;
  if (c.includes("thunder"))
    return <CloudLightning className="h-3.5 w-3.5 text-purple-400" />;
  if (c.includes("cloud") || c.includes("overcast"))
    return <Cloud className="h-3.5 w-3.5 text-slate-400" />;
  return <Sun className="h-3.5 w-3.5 text-amber-400" />;
};

export function WeeklyForecastCompact({
  data,
  selectedDayIndex,
  onDaySelect,
}: WeeklyForecastCompactProps) {
  const { convert } = useTemperatureUnit();
  const allTemps = data.flatMap((d) => [d.minTemp, d.maxTemp]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp || 1;

  const canGoPrev = selectedDayIndex > 0;
  const canGoNext = selectedDayIndex < data.length - 1;

  const handlePrev = useCallback(() => {
    if (canGoPrev) onDaySelect(selectedDayIndex - 1);
  }, [canGoPrev, selectedDayIndex, onDaySelect]);

  const handleNext = useCallback(() => {
    if (canGoNext) onDaySelect(selectedDayIndex + 1);
  }, [canGoNext, selectedDayIndex, onDaySelect]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handlePrev, handleNext]);

  return (
    <div className="h-full rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col">
      <h3 className="text-[10px] font-medium text-white/30 uppercase tracking-widest mb-3">
        Weekly Overview
      </h3>

      {/* Day navigation */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-medium px-1">
            {selectedDayIndex === 0 ? "Today" : data[selectedDayIndex]?.day}
          </span>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <span className="text-[10px] text-white/15">
          {selectedDayIndex + 1} / {data.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-0">
        {data.map((day, i) => {
          const isSelected = i === selectedDayIndex;
          const lowPos = ((day.minTemp - minTemp) / tempRange) * 100;
          const highPos = ((day.maxTemp - minTemp) / tempRange) * 100;
          const barWidth = highPos - lowPos;

          return (
            <motion.button
              key={i}
              onClick={() => onDaySelect(i)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`group flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-all ${
                isSelected
                  ? "bg-white/[0.08]"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              <span
                className={`w-9 text-[11px] font-medium ${
                  isSelected ? "text-white" : "text-white/50"
                }`}
              >
                {i === 0 ? "Today" : day.day}
              </span>
              <div className="w-5 flex justify-center">
                {getWeatherIcon(day.condition)}
              </div>
              <span className="w-6 text-right text-[11px] text-white/30">
                {convert(day.minTemp)}°
              </span>
              <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden relative mx-0.5">
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
              <span className="w-6 text-right text-[11px] font-medium text-white/70">
                {convert(day.maxTemp)}°
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
