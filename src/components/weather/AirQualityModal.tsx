"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Gauge,
  Heart,
  Shield,
  AlertTriangle,
  Wind,
} from "lucide-react";
import { motion } from "framer-motion";

interface AirQualityModalProps {
  aqi: number;
  aqiStatus: string;
}

const AQI_CATEGORIES = [
  { label: "Good", min: 0, max: 50, color: "#22c55e", advice: "Air quality is satisfactory. Enjoy outdoor activities." },
  { label: "Moderate", min: 51, max: 100, color: "#eab308", advice: "Acceptable air quality. Unusually sensitive people should limit prolonged outdoor exertion." },
  { label: "USG", min: 101, max: 150, color: "#f97316", advice: "Unhealthy for sensitive groups. People with heart/lung disease, older adults, and children should reduce prolonged outdoor exertion." },
  { label: "Unhealthy", min: 151, max: 200, color: "#ef4444", advice: "Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion." },
  { label: "Very Unhealthy", min: 201, max: 300, color: "#a855f7", advice: "Health alert. Everyone may experience more serious health effects. Avoid all outdoor activities." },
  { label: "Hazardous", min: 301, max: 500, color: "#7f1d1d", advice: "Health emergency. The entire population is affected. Stay indoors with air purification." },
];

function getAQICategory(aqi: number) {
  return (
    AQI_CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max) ||
    AQI_CATEGORIES[5]
  );
}

// Simulate pollutant breakdown based on AQI
function getPollutantData(aqi: number) {
  const factor = aqi / 50;
  return [
    {
      name: "PM2.5",
      value: Math.round(12 * factor + Math.random() * 5),
      unit: "µg/m³",
      limit: 35,
    },
    {
      name: "PM10",
      value: Math.round(25 * factor + Math.random() * 8),
      unit: "µg/m³",
      limit: 150,
    },
    {
      name: "NO₂",
      value: Math.round(15 * factor + Math.random() * 4),
      unit: "ppb",
      limit: 100,
    },
    {
      name: "O₃",
      value: Math.round(30 * factor + Math.random() * 10),
      unit: "ppb",
      limit: 70,
    },
    {
      name: "SO₂",
      value: Math.round(5 * factor + Math.random() * 2),
      unit: "ppb",
      limit: 75,
    },
    {
      name: "CO",
      value: Math.round(0.5 * factor * 10 + Math.random() * 2) / 10,
      unit: "ppm",
      limit: 9,
    },
  ];
}

function getDominantPollutant(aqi: number): string {
  if (aqi <= 50) return "PM2.5";
  if (aqi <= 100) return "PM2.5";
  if (aqi <= 150) return "O₃";
  if (aqi <= 200) return "PM2.5";
  return "PM2.5";
}

function getHealthRec(aqi: number): string {
  if (aqi <= 50)
    return "No special precautions needed. Ideal conditions for all outdoor activities including exercise, sports, and recreation.";
  if (aqi <= 100)
    return "Generally safe for most people. Those with respiratory sensitivities should monitor symptoms during prolonged outdoor exercise.";
  if (aqi <= 150)
    return "Reduce prolonged outdoor exertion if you have asthma, heart disease, or are in a sensitive group. Consider moving intense workouts indoors.";
  if (aqi <= 200)
    return "Avoid prolonged outdoor exertion. Move activities indoors or reschedule. Wear an N95 mask if outdoor exposure is unavoidable.";
  return "Stay indoors with windows closed. Use air purifiers if available. Avoid all outdoor physical activities. Seek medical attention if experiencing symptoms.";
}

// Gauge data
function getGaugeData(aqi: number) {
  const capped = Math.min(aqi, 300);
  return [
    { name: "value", value: capped },
    { name: "empty", value: 300 - capped },
  ];
}

const POLLUTANT_COLORS = [
  "#3b82f6", // PM2.5
  "#8b5cf6", // PM10
  "#f97316", // NO₂
  "#06b6d4", // O₃
  "#eab308", // SO₂
  "#ec4899", // CO
];

const BarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white font-medium text-sm mb-1">{data.name}</p>
        <p className="text-white/60 text-xs">
          {data.value} {data.unit}
        </p>
        <p className="text-white/30 text-[10px] mt-1">
          Limit: {data.limit} {data.unit}
        </p>
        <div className="mt-1">
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((data.value / data.limit) * 100, 100)}%`,
                backgroundColor:
                  data.value / data.limit > 0.8
                    ? "#ef4444"
                    : data.value / data.limit > 0.5
                    ? "#eab308"
                    : "#22c55e",
              }}
            />
          </div>
          <p className="text-[9px] text-white/20 mt-0.5">
            {Math.round((data.value / data.limit) * 100)}% of limit
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function AirQualityModal({ aqi, aqiStatus }: AirQualityModalProps) {
  const category = getAQICategory(aqi);
  const pollutantData = useMemo(() => getPollutantData(aqi), [aqi]);
  const dominantPollutant = getDominantPollutant(aqi);
  const gaugeData = useMemo(() => getGaugeData(aqi), [aqi]);

  const stats = [
    {
      label: "AQI Value",
      value: `${aqi}`,
      icon: <Gauge className="w-3.5 h-3.5" />,
      color: category.color,
    },
    {
      label: "Category",
      value: category.label,
      icon: <Shield className="w-3.5 h-3.5" />,
      color: category.color,
    },
    {
      label: "Dominant",
      value: dominantPollutant,
      icon: <Wind className="w-3.5 h-3.5" />,
      color: "text-white",
    },
    {
      label: "Health",
      value:
        aqi <= 50
          ? "Good"
          : aqi <= 100
          ? "Fair"
          : aqi <= 150
          ? "Poor"
          : "Bad",
      icon:
        aqi <= 100 ? (
          <Heart className="w-3.5 h-3.5" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5" />
        ),
      color: aqi <= 50 ? "#22c55e" : aqi <= 100 ? "#eab308" : "#ef4444",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="text-5xl font-light tracking-tight"
          style={{ color: category.color }}
        >
          {aqi}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
                border: `1px solid ${category.color}30`,
              }}
            >
              {aqiStatus}
            </span>
          </div>
          <p className="text-xs text-white/30 mt-1 max-w-[250px]">
            {category.advice}
          </p>
        </div>
      </div>

      {/* Primary: Radial AQI Gauge */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
          AQI Scale (EPA Standard)
        </p>
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={280} height={150}>
              <PieChart>
                {/* Color zone segments */}
                {AQI_CATEGORIES.map((cat, i) => {
                  const segAngle = 180 / 6;
                  const startAngle = 180 - i * segAngle;
                  const endAngle = startAngle - segAngle;
                  return (
                    <Pie
                      key={cat.label}
                      data={[{ value: 1 }]}
                      cx="50%"
                      cy="100%"
                      startAngle={startAngle}
                      endAngle={endAngle}
                      innerRadius={85}
                      outerRadius={115}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell
                        fill={cat.color}
                        opacity={
                          aqi >= cat.min && aqi <= cat.max ? 0.6 : 0.12
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
                  innerRadius={87}
                  outerRadius={113}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={800}
                >
                  <Cell fill={category.color} opacity={0.8} />
                  <Cell fill="transparent" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center value */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="text-3xl font-light text-white">{aqi}</p>
              <p
                className="text-xs font-medium"
                style={{ color: category.color }}
              >
                {category.label}
              </p>
            </div>
          </div>
        </div>
        {/* Category labels */}
        <div className="flex justify-between text-[9px] px-4 -mt-2">
          {AQI_CATEGORIES.map((cat) => (
            <span
              key={cat.label}
              style={{
                color:
                  aqi >= cat.min && aqi <= cat.max
                    ? cat.color
                    : "rgba(255,255,255,0.15)",
                fontWeight:
                  aqi >= cat.min && aqi <= cat.max ? 600 : 400,
              }}
            >
              {cat.label}
            </span>
          ))}
        </div>
      </div>

      {/* Secondary: Pollutant Breakdown */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          Pollutant Breakdown
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={pollutantData}
            layout="vertical"
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<BarTooltip />} cursor={false} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={800}>
              {pollutantData.map((entry, index) => {
                const ratio = entry.value / entry.limit;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ratio > 0.8
                        ? "#ef4444"
                        : ratio > 0.5
                        ? "#eab308"
                        : POLLUTANT_COLORS[index]
                    }
                    fillOpacity={0.7}
                    stroke={
                      ratio > 0.8
                        ? "#ef4444"
                        : ratio > 0.5
                        ? "#eab308"
                        : POLLUTANT_COLORS[index]
                    }
                    strokeOpacity={0.3}
                    strokeWidth={1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Health Recommendation */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${category.color}10`,
            border: `1px solid ${category.color}20`,
          }}
        >
          {aqi <= 100 ? (
            <Heart className="w-5 h-5" style={{ color: category.color }} />
          ) : (
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: category.color }}
            />
          )}
        </div>
        <div>
          <p className="text-xs text-white/50 font-medium">
            Health Recommendation
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">{getHealthRec(aqi)}</p>
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
      <div className="rounded-xl bg-gradient-to-r from-emerald-500/[0.06] to-amber-500/[0.06] border border-emerald-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: category.color }}
          />
          <p
            className="text-[10px] uppercase tracking-widest font-medium"
            style={{ color: `${category.color}90` }}
          >
            Air Quality Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {aqi <= 50
            ? `Air quality is excellent at AQI ${aqi}. All outdoor activities are safe without restrictions. This is an ideal day for running, cycling, or any outdoor exercise. No need for air filtration indoors.`
            : aqi <= 100
            ? `Air quality is moderate at AQI ${aqi}. Most people can continue normal activities. If you experience unusual coughing or throat irritation during outdoor exercise, consider moving indoors. ${dominantPollutant} is the primary pollutant.`
            : aqi <= 150
            ? `Air quality is unhealthy for sensitive groups at AQI ${aqi}. People with asthma, COPD, or heart conditions should limit outdoor exposure. Children and older adults should reduce prolonged outdoor exertion. ${dominantPollutant} levels are elevated.`
            : `Air quality is unhealthy at AQI ${aqi}. Everyone should reduce outdoor activities. Wear an N95 mask if going outside is necessary. Keep windows closed and run air purifiers indoors. ${dominantPollutant} is the main concern.`}
        </p>
      </div>
    </div>
  );
}
