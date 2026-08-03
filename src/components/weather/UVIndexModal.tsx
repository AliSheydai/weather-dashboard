"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Sun, Shield, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface UVIndexModalProps {
  uvIndex: number;
  uvStatus: string;
}

function getUVColor(uv: number): string {
  if (uv <= 2) return "#22c55e";
  if (uv <= 5) return "#eab308";
  if (uv <= 7) return "#f97316";
  if (uv <= 10) return "#ef4444";
  return "#a855f7";
}

function getUVGradient(uv: number): string[] {
  if (uv <= 2) return ["#22c55e", "#16a34a"];
  if (uv <= 5) return ["#eab308", "#ca8a04"];
  if (uv <= 7) return ["#f97316", "#ea580c"];
  if (uv <= 10) return ["#ef4444", "#dc2626"];
  return ["#a855f7", "#9333ea"];
}

function getSafeDuration(uv: number): string {
  if (uv <= 2) return "60+ minutes";
  if (uv <= 5) return "30–45 minutes";
  if (uv <= 7) return "15–25 minutes";
  if (uv <= 10) return "5–10 minutes";
  return "Less than 5 min";
}

function getInsight(uv: number): string {
  if (uv <= 2)
    return "UV levels are low today. You can safely enjoy outdoor activities without protection for extended periods. No sunscreen is required for most skin types.";
  if (uv <= 5)
    return "UV levels are moderate. Apply SPF 30+ sunscreen and wear sunglasses during peak hours (10 AM – 4 PM). Seek shade during midday if you burn easily.";
  if (uv <= 7)
    return "UV levels are high. Reduce sun exposure between 10 AM and 4 PM. Wear protective clothing, a wide-brimmed hat, and SPF 50+ sunscreen. Reapply every 2 hours.";
  if (uv <= 10)
    return "UV levels are very high. Minimize outdoor activities during midday hours. If you must be outside, seek shade, wear full coverage clothing, and apply generous amounts of SPF 50+ sunscreen.";
  return "UV levels are extreme today. Avoid outdoor activities between 10 AM and 4 PM. Unprotected skin can burn in under 10 minutes. Stay indoors or in complete shade when possible.";
}

// Generate realistic hourly UV data (bell curve peaking at noon)
function generateHourlyUV(currentUV: number): { hour: string; uv: number }[] {
  const peakUV = Math.max(currentUV, 1);
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    // Bell curve: peaks around 12-13, zero at night
    let uv = 0;
    if (hour >= 6 && hour <= 18) {
      const normalized = (hour - 6) / 6; // 0 to 2 over the day hours
      const bellCurve = Math.exp(-Math.pow(normalized - 1, 2) * 2);
      uv = Math.round(peakUV * bellCurve * 10) / 10;
    }
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      uv: Math.max(0, uv),
    };
  });
}

// Gauge data for semi-circle
function getGaugeData(uv: number) {
  const value = Math.min(uv, 12);
  return [
    { name: "value", value: value },
    { name: "empty", value: 12 - value },
  ];
}

const GAUGE_COLORS = [
  "#22c55e", // 0-2 green
  "#22c55e",
  "#eab308", // 3-5 yellow
  "#eab308",
  "#eab308",
  "#f97316", // 6-7 orange
  "#f97316",
  "#ef4444", // 8-10 red
  "#ef4444",
  "#ef4444",
  "#a855f7", // 11+ purple
  "#a855f7",
];

// Custom gauge needle
function GaugeNeedle({
  cx,
  cy,
  innerRadius,
  outerRadius,
  uv,
}: {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  uv: number;
}) {
  const angle = 180 - (Math.min(uv, 12) / 12) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleLength = outerRadius * 0.75;
  const tipX = cx + needleLength * Math.cos(rad);
  const tipY = cy - needleLength * Math.sin(rad);

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
      <line
        x1={cx}
        y1={cy}
        x2={tipX}
        y2={tipY}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.9}
      />
      <circle cx={tipX} cy={tipY} r={2.5} fill={getUVColor(uv)} />
    </g>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-0.5">{label}</p>
        <p className="text-white font-medium text-sm">
          UV {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export function UVIndexModal({ uvIndex, uvStatus }: UVIndexModalProps) {
  const hourlyData = useMemo(() => generateHourlyUV(uvIndex), [uvIndex]);
  const gaugeData = useMemo(() => getGaugeData(uvIndex), [uvIndex]);
  const colors = getUVGradient(uvIndex);
  const peakHour = useMemo(() => {
    const maxEntry = hourlyData.reduce((max, item) =>
      item.uv > max.uv ? item : max
    );
    return maxEntry.hour;
  }, [hourlyData]);

  const maxUV = useMemo(
    () => Math.max(...hourlyData.map((d) => d.uv)),
    [hourlyData]
  );

  const stats = [
    {
      label: "Current UV",
      value: `${uvIndex}`,
      icon: <Sun className="w-3.5 h-3.5" />,
    },
    {
      label: "Peak Time",
      value: peakHour,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      label: "Daily Max",
      value: `${maxUV.toFixed(1)}`,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    {
      label: "Safe Duration",
      value: getSafeDuration(uvIndex),
      icon: <Shield className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header: Current Value + Status Badge */}
      <div className="flex items-center gap-4">
        <div
          className="text-5xl font-light tracking-tight"
          style={{ color: getUVColor(uvIndex) }}
        >
          {uvIndex}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${getUVColor(uvIndex)}15`,
                color: getUVColor(uvIndex),
                border: `1px solid ${getUVColor(uvIndex)}30`,
              }}
            >
              {uvStatus}
            </span>
          </div>
          <p className="text-xs text-white/30 mt-1">
            {uvIndex <= 2
              ? "No protection needed"
              : uvIndex <= 5
              ? "Sunscreen recommended"
              : uvIndex <= 7
              ? "Reduce time in sun"
              : "Avoid midday sun"}
          </p>
        </div>
      </div>

      {/* Primary Chart: Gauge */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[280px]">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              {/* Background segments for color zones */}
              {GAUGE_COLORS.map((color, i) => {
                const segAngle = 180 / 12;
                const startAngle = 180 - i * segAngle;
                const endAngle = startAngle - segAngle;
                return (
                  <Pie
                    key={i}
                    data={[{ value: 1 }]}
                    cx="50%"
                    cy="100%"
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell
                      fill={color}
                      opacity={i <= Math.floor(uvIndex) ? 0.6 : 0.1}
                    />
                  </Pie>
                );
              })}
              {/* Main gauge fill */}
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={82}
                outerRadius={108}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                animationBegin={200}
                animationDuration={800}
              >
                <Cell fill={getUVColor(uvIndex)} opacity={0.85} />
                <Cell fill="transparent" />
              </Pie>
              <g>
                <GaugeNeedle
                  cx={140}
                  cy={160}
                  innerRadius={0}
                  outerRadius={95}
                  uv={uvIndex}
                />
              </g>
            </PieChart>
          </ResponsiveContainer>
          {/* Gauge labels */}
          <div className="flex justify-between text-[10px] text-white/25 -mt-2 px-2">
            <span>0</span>
            <span>3</span>
            <span>6</span>
            <span>9</span>
            <span>12</span>
          </div>
        </div>
      </div>

      {/* Zone legend */}
      <div className="flex items-center justify-center gap-3">
        {[
          { label: "Low", color: "#22c55e", range: "0–2" },
          { label: "Moderate", color: "#eab308", range: "3–5" },
          { label: "High", color: "#f97316", range: "6–7" },
          { label: "Very High", color: "#ef4444", range: "8–10" },
          { label: "Extreme", color: "#a855f7", range: "11+" },
        ].map((zone) => (
          <div key={zone.label} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: zone.color }}
            />
            <span className="text-[10px] text-white/30">{zone.label}</span>
          </div>
        ))}
      </div>

      {/* Secondary Chart: 24h Line Chart */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          24-Hour UV Index
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getUVColor(uvIndex)} stopOpacity={0.3} />
                <stop offset="100%" stopColor={getUVColor(uvIndex)} stopOpacity={0} />
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
              domain={[0, "auto"]}
              width={25}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="uv"
              stroke={getUVColor(uvIndex)}
              strokeWidth={2}
              fill="url(#uvGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: getUVColor(uvIndex),
                stroke: "white",
                strokeWidth: 1.5,
              }}
              animationDuration={1000}
            />
          </AreaChart>
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
            <p className="text-sm font-medium text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-500/[0.06] to-purple-500/[0.06] border border-indigo-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <p className="text-[10px] text-indigo-400/70 uppercase tracking-widest font-medium">
            Weather Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{getInsight(uvIndex)}</p>
      </div>
    </div>
  );
}
