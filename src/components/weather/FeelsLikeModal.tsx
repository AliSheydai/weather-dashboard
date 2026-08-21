"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Thermometer, Wind, Droplets, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { TemperatureUnit } from "@/lib/temperature";

interface FeelsLikeModalProps {
  feelsLike: number;
  actualTemp: number;
}

function generateHourlyData(
  actualTemp: number,
  feelsLike: number
): { hour: string; actual: number; feelsLike: number; diff: number }[] {
  const baseDiff = feelsLike - actualTemp;
  return Array.from({ length: 24 }, (_, i) => {
    // Temperature varies through the day
    const tempVariation =
      -3 * Math.cos(((i - 14) / 24) * 2 * Math.PI); // Peaks around 2 PM
    const actual = Math.round((actualTemp + tempVariation) * 10) / 10;

    // Feels-like difference varies too (wind/humidity effect changes)
    const diffVariation = Math.sin(i * 0.3) * 1.5 + (Math.random() - 0.5) * 1;
    const hourlyDiff = baseDiff + diffVariation;
    const fl = Math.round((actual + hourlyDiff) * 10) / 10;

    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      actual,
      feelsLike: fl,
      diff: Math.round((fl - actual) * 10) / 10,
    };
  });
}

function getFeelsLikeDriver(
  diff: number,
  humidity: number
): { factor: string; description: string } {
  if (diff > 2)
    return {
      factor: "Humidity",
      description:
        "High humidity is making it feel warmer than actual temperature. Moisture in the air reduces the body's ability to cool through sweating.",
    };
  if (diff < -2)
    return {
      factor: "Wind Chill",
      description:
        "Wind is making it feel cooler than actual temperature. Moving air accelerates heat loss from exposed skin, increasing the perceived cold.",
    };
  return {
    factor: "Balanced",
    description:
      "Wind and humidity effects are minimal. The perceived temperature is close to the actual reading.",
  };
}

function getFeelsLikeInsight(
  diff: number,
  feelsLike: number,
  actualTemp: number,
  unit: TemperatureUnit = "C"
): string {
  const absDiff = Math.abs(diff);
  const threshold = unit === "F" ? 5 : 3;
  if (diff > threshold)
    return `It feels ${absDiff}° warmer than the actual ${actualTemp}°${unit} due to high humidity. Your body works harder to cool down in these conditions. Stay hydrated, wear light breathable clothing, and take breaks in air-conditioned spaces during peak heat.`;
  if (diff > 0)
    return `Slightly warmer perception (+${diff}°) due to moderate humidity. Conditions are comfortable for most activities. Light clothing is appropriate. Keep water accessible for outdoor activities.`;
  if (diff > -threshold)
    return `Feels approximately the same as the actual temperature. Wind and humidity are balanced, creating stable perceived conditions. Standard clothing recommendations apply for the current ${actualTemp}°${unit}.`;
  return `It feels ${absDiff}° colder than the actual ${actualTemp}°${unit} due to wind chill. Layer up to retain body heat, especially when exposed to wind. Cover extremities (hands, ears) as they lose heat fastest. Wind-resistant outer layers are recommended.`;
}

const CustomTooltip = ({ active, payload, label, unit = "C" }: any) => {
  if (active && payload && payload.length) {
    const actual = payload.find((p: any) => p.dataKey === "actual");
    const feels = payload.find((p: any) => p.dataKey === "feelsLike");
    const diff = feels && actual ? feels.value - actual.value : 0;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-1">{label}</p>
        <div className="space-y-0.5">
          <p className="text-orange-400 text-sm">
            Actual: {actual?.value}°{unit}
          </p>
          <p className="text-cyan-400 text-sm">
            Feels Like: {feels?.value}°{unit}
          </p>
          <div className="border-t border-white/[0.06] pt-1 mt-1">
            <p
              className="text-xs font-medium"
              style={{
                color:
                  diff > (unit === "F" ? 3.6 : 2)
                    ? "#f97316"
                    : diff < (unit === "F" ? -3.6 : -2)
                    ? "#06b6d4"
                    : "rgba(255,255,255,0.5)",
              }}
            >
              Difference: {diff > 0 ? "+" : ""}
              {diff.toFixed(1)}°{unit}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function FeelsLikeModal({
  feelsLike,
  actualTemp,
}: FeelsLikeModalProps) {
  const { convert, convertDiff, unit, unitSymbol } = useTemperatureUnit();

  const convertedActual = convert(actualTemp);
  const convertedFeelsLike = convert(feelsLike);

  const hourlyData = useMemo(
    () => generateHourlyData(convertedActual, convertedFeelsLike),
    [convertedActual, convertedFeelsLike]
  );

  const currentDiff = convertedFeelsLike - convertedActual;
  const maxDiff = useMemo(
    () => Math.max(...hourlyData.map((d) => Math.abs(d.diff))),
    [hourlyData]
  );
  const minDiff = useMemo(
    () => Math.min(...hourlyData.map((d) => d.diff)),
    [hourlyData]
  );
  const maxDiffVal = useMemo(
    () => Math.max(...hourlyData.map((d) => d.diff)),
    [hourlyData]
  );
  const avgDiff = useMemo(
    () =>
      Math.round(
        (hourlyData.reduce((sum, d) => sum + d.diff, 0) / 24) * 10
      ) / 10,
    [hourlyData]
  );

  const diffThreshold = unit === "F" ? 3.6 : 2;
  const driver = getFeelsLikeDriver(currentDiff, 50);

  const diffColor =
    currentDiff > diffThreshold
      ? "#f97316"
      : currentDiff < -diffThreshold
      ? "#06b6d4"
      : "#a78bfa";

  const stats = [
    {
      label: "Feels Like",
      value: `${convertedFeelsLike}°`,
      icon: <Thermometer className="w-3.5 h-3.5" />,
      color: "text-cyan-400",
    },
    {
      label: "Max Difference",
      value: `${maxDiffVal > 0 ? "+" : ""}${maxDiffVal.toFixed(1)}°`,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      color: "text-orange-400",
    },
    {
      label: "Min Difference",
      value: `${minDiff > 0 ? "+" : ""}${minDiff.toFixed(1)}°`,
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      color: "text-cyan-400",
    },
    {
      label: "Avg Difference",
      value: `${avgDiff > 0 ? "+" : ""}${avgDiff.toFixed(1)}°`,
      icon:
        driver.factor === "Humidity" ? (
          <Droplets className="w-3.5 h-3.5" />
        ) : (
          <Wind className="w-3.5 h-3.5" />
        ),
      color: "text-white",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-light text-white tracking-tight">
              {convertedFeelsLike}
            </span>
            <span className="text-xl text-white/30 mb-1">{unitSymbol}</span>
          </div>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mt-1">
            Feels Like
          </p>
        </div>
        <div className="h-12 w-px bg-white/[0.06]" />
        <div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-light text-white/60">
              {convertedActual}
            </span>
            <span className="text-lg text-white/20 mb-0.5">{unitSymbol}</span>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">
            Actual
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${diffColor}15`,
              color: diffColor,
              border: `1px solid ${diffColor}30`,
            }}
          >
            {currentDiff > 0 ? "+" : ""}
            {currentDiff}° difference
          </span>
        </div>
      </div>

      {/* Primary: Dual Line Chart */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          24-Hour Temperature Comparison
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={hourlyData}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
              tickFormatter={(v: number) => `${v}°`}
            />
            {/* Shade areas where difference > threshold */}
            {hourlyData.map((d, i) => {
              if (Math.abs(d.diff) > (unit === "F" ? 5 : 3) && i > 0) {
                return (
                  <ReferenceArea
                    key={`shade-${i}`}
                    x1={hourlyData[Math.max(0, i - 1)].hour}
                    x2={d.hour}
                    fill={d.diff > 0 ? "#f97316" : "#06b6d4"}
                    fillOpacity={0.04}
                    strokeOpacity={0}
                  />
                );
              }
              return null;
            })}
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#f97316",
                stroke: "white",
                strokeWidth: 1.5,
              }}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="feelsLike"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#06b6d4",
                stroke: "white",
                strokeWidth: 1.5,
              }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-400 rounded-full" />
            <span className="text-[10px] text-white/30">Actual Temp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="text-[10px] text-white/30">Feels Like</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-orange-400/10 rounded-sm" />
            <span className="text-[10px] text-white/20">
              ±{unit === "F" ? "5°F" : "3°C"} difference zone
            </span>
          </div>
        </div>
      </div>

      {/* Driving Factor */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${diffColor}10`,
            border: `1px solid ${diffColor}20`,
          }}
        >
          {driver.factor === "Humidity" ? (
            <Droplets className="w-5 h-5" style={{ color: diffColor }} />
          ) : driver.factor === "Wind Chill" ? (
            <Wind className="w-5 h-5" style={{ color: diffColor }} />
          ) : (
            <Thermometer className="w-5 h-5" style={{ color: diffColor }} />
          )}
        </div>
        <div>
          <p className="text-xs text-white/50 font-medium">
            Primary Factor: {driver.factor}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">
            {driver.description}
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3 text-center"
          >
            <div className="flex items-center justify-center text-white/20 mb-2">
              {stat.icon}
            </div>
            <p className="text-xs text-white/25 mb-1">{stat.label}</p>
            <p className={`text-sm font-medium ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="rounded-xl bg-gradient-to-r from-cyan-500/[0.06] to-orange-500/[0.06] border border-cyan-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <p className="text-[10px] text-cyan-400/70 uppercase tracking-widest font-medium">
            Temperature Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {getFeelsLikeInsight(currentDiff, convertedFeelsLike, convertedActual, unit)}
        </p>
      </div>
    </div>
  );
}
