"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Eye, ArrowDown, ArrowUp, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface VisibilityModalProps {
  visibility: number;
}

function generateHourlyVisibility(
  currentVis: number
): { hour: string; visibility: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    // Visibility often lower at dawn/dusk, best midday
    const hourFactor =
      i >= 0 && i <= 5
        ? 0.7 + Math.random() * 0.15 // Lower at night/dawn
        : i >= 6 && i <= 10
        ? 0.8 + (i - 6) * 0.05 // Improving morning
        : i >= 11 && i <= 16
        ? 1.0 + Math.random() * 0.1 // Peak midday
        : 0.85 - (i - 16) * 0.03 + Math.random() * 0.1; // Declining evening
    const noise = (Math.random() - 0.5) * 2;
    const vis = Math.round(
      Math.max(0.5, Math.min(30, currentVis * hourFactor + noise)) * 10
    ) / 10;
    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      visibility: vis,
    };
  });
}

function getVisibilityStatus(vis: number): {
  label: string;
  color: string;
  level: number;
} {
  if (vis < 1) return { label: "Poor", color: "#ef4444", level: 0 };
  if (vis < 4) return { label: "Moderate", color: "#eab308", level: 1 };
  if (vis < 10) return { label: "Good", color: "#22c55e", level: 2 };
  return { label: "Excellent", color: "#06b6d4", level: 3 };
}

function getFogRisk(vis: number, minVis: number): {
  level: string;
  color: string;
  description: string;
} {
  if (minVis < 1)
    return {
      level: "High",
      color: "#ef4444",
      description: "Dense fog expected during low-visibility periods",
    };
  if (minVis < 4)
    return {
      level: "Moderate",
      color: "#eab308",
      description: "Light fog or mist possible, especially at dawn",
    };
  return {
    level: "Low",
    color: "#22c55e",
    description: "Clear conditions expected throughout the day",
  };
}

function getVisibilityInsight(vis: number, minVis: number): string {
  if (vis < 1)
    return "Visibility is extremely poor. Do not drive unless absolutely necessary. If driving is required, use fog lights, reduce speed significantly, and increase following distance. Flight operations may be suspended. Stay indoors if possible.";
  if (vis < 4)
    return "Visibility is reduced. Drive with caution — use low-beam headlights (not high beams in fog), reduce speed, and allow extra following distance. Outdoor activities like hiking or cycling are not recommended. Check flight status before heading to the airport.";
  if (vis < 10)
    return "Good visibility for most activities. Driving conditions are normal, though some haze may be present at distance. Suitable for outdoor activities, running, and cycling. Minor visibility reduction may affect distant scenic views.";
  return "Excellent visibility — crystal clear conditions. Perfect for all outdoor activities including driving, cycling, hiking, and photography. Great conditions for scenic views and long-distance observation. No weather-related visibility concerns.";
}

// Gauge data for radial visibility indicator
function getGaugeData(vis: number) {
  const capped = Math.min(vis, 20);
  return [
    { name: "value", value: capped },
    { name: "empty", value: 20 - capped },
  ];
}

const GAUGE_ZONES = [
  { label: "Poor", color: "#ef4444", max: 1 },
  { label: "Moderate", color: "#eab308", max: 4 },
  { label: "Good", color: "#22c55e", max: 10 },
  { label: "Excellent", color: "#06b6d4", max: 20 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const status = getVisibilityStatus(val);
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-0.5">{label}</p>
        <p className="text-white font-medium text-sm">{val} km</p>
        <p className="text-[10px] mt-0.5" style={{ color: status.color }}>
          {status.label}
        </p>
      </div>
    );
  }
  return null;
};

export function VisibilityModal({ visibility }: VisibilityModalProps) {
  const hourlyData = useMemo(
    () => generateHourlyVisibility(visibility),
    [visibility]
  );

  const minVis = useMemo(
    () => Math.min(...hourlyData.map((d) => d.visibility)),
    [hourlyData]
  );
  const maxVis = useMemo(
    () => Math.max(...hourlyData.map((d) => d.visibility)),
    [hourlyData]
  );
  const avgVis = useMemo(
    () =>
      Math.round(
        (hourlyData.reduce((sum, d) => sum + d.visibility, 0) / 24) * 10
      ) / 10,
    [hourlyData]
  );

  const status = getVisibilityStatus(visibility);
  const fogRisk = getFogRisk(visibility, minVis);
  const gaugeData = useMemo(() => getGaugeData(visibility), [visibility]);

  const stats = [
    {
      label: "Current",
      value: `${visibility} km`,
      icon: <Eye className="w-3.5 h-3.5" />,
      color: status.color,
    },
    {
      label: "Daily Min",
      value: `${minVis} km`,
      icon: <ArrowDown className="w-3.5 h-3.5" />,
      color: "text-white",
    },
    {
      label: "Daily Max",
      value: `${maxVis} km`,
      icon: <ArrowUp className="w-3.5 h-3.5" />,
      color: "text-white",
    },
    {
      label: "Fog Risk",
      value: fogRisk.level,
      icon:
        fogRisk.level === "Low" ? (
          <CheckCircle className="w-3.5 h-3.5" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5" />
        ),
      color: fogRisk.color,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-light text-white tracking-tight">
          {visibility}
          <span className="text-lg text-white/30 ml-1">km</span>
        </div>
        <div>
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${status.color}15`,
              color: status.color,
              border: `1px solid ${status.color}30`,
            }}
          >
            {status.label}
          </span>
          <p className="text-xs text-white/30 mt-1">
            {visibility >= 10
              ? "Crystal clear conditions"
              : visibility >= 5
              ? "Minor atmospheric haze"
              : visibility >= 2
              ? "Reduced — exercise caution"
              : "Poor — hazardous conditions"}
          </p>
        </div>
      </div>

      {/* Radial Gauge + 24h Chart side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Radial Gauge */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Visibility Gauge
          </p>
          <div className="flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={130}>
                <PieChart>
                  {/* Background zones */}
                  {GAUGE_ZONES.map((zone, i) => {
                    const prevMax = i === 0 ? 0 : GAUGE_ZONES[i - 1].max;
                    const startAngle =
                      180 - (prevMax / 20) * 180;
                    const endAngle =
                      180 - (zone.max / 20) * 180;
                    return (
                      <Pie
                        key={zone.label}
                        data={[{ value: 1 }]}
                        cx="50%"
                        cy="100%"
                        startAngle={startAngle}
                        endAngle={endAngle}
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell
                          fill={zone.color}
                          opacity={
                            visibility >= prevMax && visibility <= zone.max
                              ? 0.5
                              : visibility > zone.max
                              ? 0.3
                              : 0.08
                          }
                        />
                      </Pie>
                    );
                  })}
                  {/* Fill arc */}
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={72}
                    outerRadius={93}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={800}
                  >
                    <Cell fill={status.color} opacity={0.7} />
                    <Cell fill="transparent" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center value */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
                <p className="text-2xl font-light text-white">{visibility}</p>
                <p className="text-[9px] text-white/25">km</p>
              </div>
            </div>
          </div>
          {/* Zone labels */}
          <div className="flex justify-between text-[9px] mt-1 px-2">
            {GAUGE_ZONES.map((zone) => (
              <span key={zone.label} style={{ color: `${zone.color}80` }}>
                {zone.label}
              </span>
            ))}
          </div>
        </div>

        {/* 24h Line Chart */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
            24-Hour Visibility
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="visGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={status.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={status.color} stopOpacity={0} />
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
                tickFormatter={(v: number) => `${v}`}
              />
              {/* Poor visibility threshold */}
              <ReferenceLine
                y={4}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeOpacity={0.2}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="visibility"
                stroke={status.color}
                strokeWidth={2}
                fill="url(#visGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: status.color,
                  stroke: "white",
                  strokeWidth: 1.5,
                }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fog Risk Card */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${fogRisk.color}10`,
            border: `1px solid ${fogRisk.color}20`,
          }}
        >
          {fogRisk.level === "Low" ? (
            <CheckCircle
              className="w-5 h-5"
              style={{ color: fogRisk.color }}
            />
          ) : (
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: fogRisk.color }}
            />
          )}
        </div>
        <div>
          <p className="text-xs text-white/50 font-medium">
            Fog Risk: {fogRisk.level}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">
            {fogRisk.description}
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
            <p
              className="text-sm font-medium"
              style={
                typeof stat.color === "string" && stat.color.startsWith("#")
                  ? { color: stat.color }
                  : {}
              }
            >
              <span className={stat.color.startsWith?.("#") ? "" : stat.color}>
                {stat.value}
              </span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="rounded-xl bg-gradient-to-r from-teal-500/[0.06] to-sky-500/[0.06] border border-teal-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <p className="text-[10px] text-teal-400/70 uppercase tracking-widest font-medium">
            Visibility Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {getVisibilityInsight(visibility, minVis)}
        </p>
      </div>
    </div>
  );
}
