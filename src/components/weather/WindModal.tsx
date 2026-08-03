"use client";

import { useMemo, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Wind as WindIcon, ArrowUp, Gauge, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface WindModalProps {
  windSpeed: number;
  windDirection: string;
}

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

// Generate wind rose data based on dominant direction
function generateWindRoseData(
  dominantDir: string,
  speed: number
): { direction: string; frequency: number; speed: number }[] {
  const dirIndex = DIRECTIONS.indexOf(dominantDir);
  return DIRECTIONS.map((dir, i) => {
    const diff = Math.min(
      Math.abs(i - dirIndex),
      8 - Math.abs(i - dirIndex)
    );
    // Higher frequency near dominant direction
    const frequency = Math.max(
      5,
      Math.round(100 - diff * 12 + Math.random() * 10)
    );
    const avgSpeed = Math.max(1, speed - diff * 1.5 + Math.random() * 2);
    return {
      direction: dir,
      frequency,
      speed: Math.round(avgSpeed * 10) / 10,
    };
  });
}

// Generate 24h wind speed data
function generateHourlyWind(
  baseSpeed: number
): { hour: string; speed: number; gust: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    // Wind typically stronger during day, calmer at night
    const hourFactor =
      i >= 6 && i <= 18
        ? 1 + 0.3 * Math.sin(((i - 6) / 12) * Math.PI)
        : 0.6 + Math.random() * 0.2;
    const speed = Math.round(baseSpeed * hourFactor * (0.8 + Math.random() * 0.4) * 10) / 10;
    const gust = Math.round(speed * (1.3 + Math.random() * 0.4) * 10) / 10;
    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      speed: Math.max(0, speed),
      gust: Math.max(0, gust),
    };
  });
}

const directionAngles: Record<string, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
};

function getWindDescription(speed: number): string {
  if (speed < 5) return "Calm";
  if (speed < 12) return "Light breeze";
  if (speed < 20) return "Moderate wind";
  if (speed < 30) return "Fresh wind";
  if (speed < 40) return "Strong wind";
  return "High wind warning";
}

function getWindInsight(speed: number, direction: string): string {
  if (speed < 5)
    return "Winds are calm today. Excellent conditions for outdoor dining, cycling, or any wind-sensitive activities. No concerns for driving or walking.";
  if (speed < 12)
    return `Light ${direction.toLowerCase()}erly breeze makes for comfortable outdoor conditions. Good for most activities including running, cycling, and outdoor sports. Kites may need extra effort to fly.`;
  if (speed < 20)
    return `Moderate winds from the ${direction} may affect cycling and running pace. Secure loose items outdoors. Good conditions for sailing and wind sports. Driving should not be significantly affected.`;
  if (speed < 30)
    return `Fresh ${direction.toLowerCase()}erly winds may make outdoor activities challenging. Be cautious with umbrellas and lightweight items. Driving high-profile vehicles requires extra care. Consider indoor alternatives.`;
  return `Strong ${direction.toLowerCase()}erly winds pose safety risks. Avoid outdoor activities if possible. Secure all outdoor furniture and equipment. Driving may be hazardous, especially for high-profile vehicles.`;
}

const SpeedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-white font-medium text-sm">
            {p.name === "speed" ? "Wind" : "Gust"}: {p.value} km/h
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WindModal({ windSpeed, windDirection }: WindModalProps) {
  const [hoveredDir, setHoveredDir] = useState<string | null>(null);

  const windRoseData = useMemo(
    () => generateWindRoseData(windDirection, windSpeed),
    [windDirection, windSpeed]
  );
  const hourlyData = useMemo(
    () => generateHourlyWind(windSpeed),
    [windSpeed]
  );

  const gustSpeed = useMemo(
    () => Math.round(windSpeed * 1.5 * 10) / 10,
    [windSpeed]
  );
  const dailyAvg = useMemo(
    () =>
      Math.round(
        (hourlyData.reduce((sum, d) => sum + d.speed, 0) / 24) * 10
      ) / 10,
    [hourlyData]
  );

  const stats = [
    {
      label: "Current Speed",
      value: `${windSpeed} km/h`,
      icon: <WindIcon className="w-3.5 h-3.5" />,
    },
    {
      label: "Gust Speed",
      value: `${gustSpeed} km/h`,
      icon: <Activity className="w-3.5 h-3.5" />,
    },
    {
      label: "Dominant Dir",
      value: windDirection,
      icon: (
        <div
          className="w-3.5 h-3.5"
          style={{
            transform: `rotate(${directionAngles[windDirection] || 0}deg)`,
          }}
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </div>
      ),
    },
    {
      label: "Daily Average",
      value: `${dailyAvg} km/h`,
      icon: <Gauge className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-light text-white tracking-tight">
          {windSpeed}
          <span className="text-lg text-white/30 ml-1">km/h</span>
        </div>
        <div>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {getWindDescription(windSpeed)}
          </span>
          <p className="text-xs text-white/30 mt-1">
            Direction: {windDirection} (
            {directionAngles[windDirection] || 0}°)
          </p>
        </div>
      </div>

      {/* Primary: Wind Rose Chart */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          Wind Rose — Direction Frequency
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={windRoseData}>
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="direction"
              tick={({ payload, x, y, textAnchor }: any) => {
                const isHovered = hoveredDir === payload.value;
                const isDominant = payload.value === windDirection;
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fill={
                      isHovered
                        ? "#818cf8"
                        : isDominant
                        ? "#a5b4fc"
                        : "rgba(255,255,255,0.3)"
                    }
                    fontSize={11}
                    fontWeight={isDominant ? 600 : 400}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredDir(payload.value)}
                    onMouseLeave={() => setHoveredDir(null)}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <PolarRadiusAxis
              tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9 }}
              axisLine={false}
              domain={[0, 100]}
            />
            <Radar
              name="frequency"
              dataKey="frequency"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={0.15}
              strokeWidth={1.5}
              animationDuration={800}
              dot={{ r: 3, fill: "#818cf8", fillOpacity: 0.6 }}
              activeDot={{ r: 5, fill: "#818cf8", stroke: "white", strokeWidth: 1 }}
            />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
                      <p className="text-indigo-400 font-medium text-sm mb-1">
                        {data.direction}
                      </p>
                      <p className="text-white/50 text-[10px]">
                        Frequency: {data.frequency}%
                      </p>
                      <p className="text-white/50 text-[10px]">
                        Avg Speed: {data.speed} km/h
                      </p>
                      {data.direction === windDirection && (
                        <p className="text-indigo-400 text-[10px] mt-1 font-medium">
                          Dominant direction
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary Charts: Speed + Gust side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Wind Speed by Hour */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
            Wind Speed (24h)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hourlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval={5}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip content={<SpeedTooltip />} />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#818cf8",
                  stroke: "white",
                  strokeWidth: 1.5,
                }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gust Speed by Hour */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
            Gust Speed (24h)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="gustGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval={5}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip content={<SpeedTooltip />} />
              <Area
                type="monotone"
                dataKey="gust"
                stroke="#f472b6"
                strokeWidth={1.5}
                fill="url(#gustGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#f472b6",
                  stroke: "white",
                  strokeWidth: 1.5,
                }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compass */}
      <div className="flex items-center justify-center">
        <div className="relative w-28 h-28">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-2 rounded-full border border-white/[0.04]" />
          {/* Direction labels */}
          {DIRECTIONS.map((dir, i) => {
            const angle = (i * 45 - 90) * (Math.PI / 180);
            const radius = 50;
            const x = 56 + radius * Math.cos(angle);
            const y = 56 + radius * Math.sin(angle);
            const isDominant = dir === windDirection;
            return (
              <span
                key={dir}
                className="absolute text-[10px] font-medium"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: "translate(-50%, -50%)",
                  color: isDominant
                    ? "#818cf8"
                    : "rgba(255,255,255,0.2)",
                }}
              >
                {dir}
              </span>
            );
          })}
          {/* Arrow pointing in wind direction */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{
                rotate: directionAngles[windDirection] || 0,
              }}
              transition={{ type: "spring", damping: 15 }}
              className="relative"
            >
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[20px] border-b-indigo-400" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-indigo-400/30" />
            </motion.div>
          </div>
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
            <p className="text-sm font-medium text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-500/[0.06] to-sky-500/[0.06] border border-indigo-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <p className="text-[10px] text-indigo-400/70 uppercase tracking-widest font-medium">
            Wind Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {getWindInsight(windSpeed, windDirection)}
        </p>
      </div>
    </div>
  );
}
