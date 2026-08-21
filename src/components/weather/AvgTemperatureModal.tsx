"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  ThermometerSun,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { TemperatureUnit } from "@/lib/temperature";

interface AvgTemperatureModalProps {
  actualTemp: number;
  feelsLike: number;
  daily?: { day: string; minTemp: number; maxTemp: number }[];
}

function getSeasonalAvg(): number {
  const month = new Date().getMonth();
  // Approximate seasonal averages for temperate climate in Celsius
  const seasonalAverages = [
    2, 4, 8, 13, 18, 22, 25, 24, 20, 14, 8, 3, // Jan-Dec
  ];
  return seasonalAverages[month];
}

function getSeasonName(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

function generate7DayData(
  todayAvg: number,
  daily?: { day: string; minTemp: number; maxTemp: number }[]
): { day: string; avg: number; min: number; max: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();

  if (daily && daily.length >= 7) {
    return daily.slice(0, 7).map((d, i) => ({
      day: i === 0 ? "Today" : d.day || days[(today + i) % 7],
      avg: Math.round(((d.maxTemp + d.minTemp) / 2) * 10) / 10,
      min: d.minTemp,
      max: d.maxTemp,
    }));
  }

  // Fallback: generate simulated data
  return Array.from({ length: 7 }, (_, i) => {
    const variation = Math.sin(i * 0.9) * 2 + (Math.random() - 0.5) * 1.5;
    const avg = Math.round((todayAvg + (i === 0 ? 0 : variation)) * 10) / 10;
    return {
      day: i === 0 ? "Today" : days[(today + i) % 7],
      avg,
      min: Math.round((avg - 3 - Math.random() * 2) * 10) / 10,
      max: Math.round((avg + 3 + Math.random() * 2) * 10) / 10,
    };
  });
}

function getTempInsight(
  todayAvg: number,
  weeklyAvg: number,
  seasonalAvg: number,
  season: string,
  unit: TemperatureUnit = "C"
): string {
  const diff = todayAvg - seasonalAvg;
  const absDiff = Math.abs(diff);
  const diffThreshold = unit === "F" ? 9 : 5;
  const mildThreshold = unit === "F" ? 3.6 : 2;

  if (diff > diffThreshold)
    return `Temperatures are significantly above the ${season} average by ${absDiff.toFixed(1)}°${unit}. This is unusually warm for this time of year. Stay hydrated, wear light clothing, and limit midday outdoor exposure. Energy costs for cooling may be elevated.`;
  if (diff > mildThreshold)
    return `Temperatures are above the seasonal ${season} norm by ${absDiff.toFixed(1)}°${unit}. Enjoy the warmer conditions — ideal for outdoor activities. Light layers are sufficient. Plants and gardens may need extra watering.`;
  if (diff > -mildThreshold)
    return `Temperatures are near the ${season} average, staying within the normal range. Standard seasonal clothing and activity levels are appropriate. A typical day for this time of year with comfortable conditions.`;
  if (diff > -diffThreshold)
    return `Temperatures are below the ${season} average by ${absDiff.toFixed(1)}°${unit}. Layer up for outdoor activities and ensure indoor heating is adequate. Check on elderly neighbors and bring pets indoors.`;
  return `Temperatures are significantly below the ${season} norm by ${absDiff.toFixed(1)}°${unit}. This is unusually cold — dress in warm layers, limit outdoor exposure, and watch for ice on roads and walkways. Ensure pipes are insulated against freezing.`;
}

const TempTooltip = ({ active, payload, label, unit = "C" }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-1">{data.day}</p>
        {data.avg !== undefined && (
          <p className="text-white font-medium text-sm">
            Avg: {data.avg}°{unit}
          </p>
        )}
        {data.min !== undefined && data.max !== undefined && (
          <div className="flex gap-3 mt-0.5">
            <span className="text-[10px] text-blue-400">
              Low: {data.min}°{unit}
            </span>
            <span className="text-[10px] text-orange-400">
              High: {data.max}°{unit}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const DeviationTooltip = ({ active, payload, label, unit = "C" }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-0.5">{label}</p>
        <p
          className="font-medium text-sm"
          style={{ color: val >= 0 ? "#f97316" : "#3b82f6" }}
        >
          {val > 0 ? "+" : ""}
          {val.toFixed(1)}°{unit} from seasonal avg
        </p>
      </div>
    );
  }
  return null;
};

export function AvgTemperatureModal({
  actualTemp,
  feelsLike,
  daily,
}: AvgTemperatureModalProps) {
  const { convert, convertDiff, unit, unitSymbol } = useTemperatureUnit();

  const convertedActual = convert(actualTemp);
  const convertedFeelsLike = convert(feelsLike);
  const todayAvg = Math.round(((convertedActual + convertedFeelsLike) / 2) * 10) / 10;
  const seasonalAvg = convert(getSeasonalAvg());
  const season = getSeasonName();

  const convertedDaily = useMemo(
    () =>
      daily?.map((d) => ({
        ...d,
        minTemp: convert(d.minTemp),
        maxTemp: convert(d.maxTemp),
      })),
    [daily, convert]
  );

  const week7Data = useMemo(
    () => generate7DayData(todayAvg, convertedDaily),
    [todayAvg, convertedDaily]
  );

  const weeklyAvg = useMemo(
    () =>
      Math.round(
        (week7Data.reduce((sum, d) => sum + d.avg, 0) / 7) * 10
      ) / 10,
    [week7Data]
  );

  const deviationFromSeasonal = Math.round((todayAvg - seasonalAvg) * 10) / 10;

  // Deviation bar chart data
  const deviationData = useMemo(
    () =>
      week7Data.map((d) => ({
        day: d.day,
        deviation: Math.round((d.avg - seasonalAvg) * 10) / 10,
      })),
    [week7Data, seasonalAvg]
  );

  const mildDeviationThreshold = unit === "F" ? 3.6 : 2;

  const stats = [
    {
      label: "Today's Avg",
      value: `${todayAvg}${unitSymbol}`,
      icon: <ThermometerSun className="w-3.5 h-3.5" />,
      color: "text-orange-400",
    },
    {
      label: "Weekly Avg",
      value: `${weeklyAvg}${unitSymbol}`,
      icon: <Calendar className="w-3.5 h-3.5" />,
      color: "text-white",
    },
    {
      label: `${season} Avg`,
      value: `${seasonalAvg}${unitSymbol}`,
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      color: "text-white/60",
    },
    {
      label: "Difference",
      value: `${deviationFromSeasonal > 0 ? "+" : ""}${deviationFromSeasonal.toFixed(1)}°`,
      icon:
        deviationFromSeasonal >= 0 ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        ),
      color:
        deviationFromSeasonal > mildDeviationThreshold
          ? "text-orange-400"
          : deviationFromSeasonal < -mildDeviationThreshold
          ? "text-blue-400"
          : "text-white",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-light text-white tracking-tight">
          {todayAvg}
          <span className="text-lg text-white/30 ml-0.5">{unitSymbol}</span>
        </div>
        <div>
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor:
                deviationFromSeasonal > mildDeviationThreshold
                  ? "rgba(249,115,22,0.1)"
                  : deviationFromSeasonal < -mildDeviationThreshold
                  ? "rgba(59,130,246,0.1)"
                  : "rgba(255,255,255,0.05)",
              color:
                deviationFromSeasonal > mildDeviationThreshold
                  ? "#f97316"
                  : deviationFromSeasonal < -mildDeviationThreshold
                  ? "#3b82f6"
                  : "rgba(255,255,255,0.5)",
              border: `1px solid ${
                deviationFromSeasonal > mildDeviationThreshold
                  ? "rgba(249,115,22,0.2)"
                  : deviationFromSeasonal < -mildDeviationThreshold
                  ? "rgba(59,130,246,0.2)"
                  : "rgba(255,255,255,0.06)"
              }`,
            }}
          >
            {deviationFromSeasonal > 0 ? "+" : ""}
            {deviationFromSeasonal.toFixed(1)}° vs {season} avg
          </span>
          <p className="text-xs text-white/30 mt-1">
            {convertedActual}° actual / {convertedFeelsLike}° feels like
          </p>
        </div>
      </div>

      {/* Primary: 7-Day Temperature Line Chart */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          7-Day Average Temperature
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={week7Data}>
            <defs>
              <linearGradient id="tempLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
              tickFormatter={(v: number) => `${v}°`}
            />
            {/* Seasonal average reference line */}
            <ReferenceLine
              y={seasonalAvg}
              stroke="#a78bfa"
              strokeDasharray="6 4"
              strokeOpacity={0.3}
              label={{
                value: `${season} avg: ${seasonalAvg}°`,
                position: "right",
                fill: "rgba(167,139,250,0.4)",
                fontSize: 9,
              }}
            />
            <Tooltip content={<TempTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: "#f97316",
                stroke: "white",
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 6,
                fill: "#f97316",
                stroke: "white",
                strokeWidth: 2,
              }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-400 rounded-full" />
            <span className="text-[10px] text-white/30">Daily Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-purple-400 rounded-full border-dashed" style={{ borderTop: "1px dashed rgba(167,139,250,0.5)", height: 0 }} />
            <span className="text-[10px] text-white/20">
              {season} Seasonal Average
            </span>
          </div>
        </div>
      </div>

      {/* Secondary: Deviation Bar Chart */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          Deviation from {season} Average
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={deviationData} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
              tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}°`}
            />
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            <Tooltip content={<DeviationTooltip unit={unit} />} cursor={false} />
            <Bar dataKey="deviation" radius={[4, 4, 0, 0]} animationDuration={800}>
              {deviationData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.deviation >= 0 ? "#f97316" : "#3b82f6"}
                  fillOpacity={index === 0 ? 0.7 : 0.3}
                  stroke={
                    entry.deviation >= 0
                      ? "rgba(249,115,22,0.3)"
                      : "rgba(59,130,246,0.3)"
                  }
                  strokeWidth={index === 0 ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
      <div className="rounded-xl bg-gradient-to-r from-orange-500/[0.06] to-amber-500/[0.06] border border-orange-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <p className="text-[10px] text-orange-400/70 uppercase tracking-widest font-medium">
            Temperature Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {getTempInsight(todayAvg, weeklyAvg, seasonalAvg, season, unit)}
        </p>
      </div>
    </div>
  );
}
