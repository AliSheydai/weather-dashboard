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
  ReferenceArea,
} from "recharts";
import { Droplets, ArrowDown, ArrowUp, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface HumidityModalProps {
  humidity: number;
}

function generateHourlyHumidity(
  currentHumidity: number
): { hour: string; humidity: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    // Humidity typically higher at night/dawn, lower during afternoon
    const hourFactor =
      i >= 0 && i <= 6
        ? 1.15 - i * 0.02 // Higher at night
        : i >= 7 && i <= 14
        ? 0.85 + (i - 7) * 0.01 // Rising slightly in afternoon
        : 1.0 + (i - 14) * 0.03; // Rising in evening
    const noise = (Math.random() - 0.5) * 8;
    const humidity = Math.round(
      Math.max(15, Math.min(95, currentHumidity * hourFactor + noise))
    );
    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      humidity,
    };
  });
}

function getComfortStatus(humidity: number): {
  label: string;
  color: string;
  description: string;
} {
  if (humidity < 20)
    return {
      label: "Very Dry",
      color: "#f97316",
      description: "Extremely dry air",
    };
  if (humidity < 30)
    return {
      label: "Dry",
      color: "#eab308",
      description: "Below comfortable range",
    };
  if (humidity <= 60)
    return {
      label: "Comfortable",
      color: "#22c55e",
      description: "Ideal humidity range",
    };
  if (humidity <= 75)
    return {
      label: "Moderate",
      color: "#eab308",
      description: "Slightly humid",
    };
  return {
    label: "Humid",
    color: "#ef4444",
    description: "High humidity — may feel muggy",
  };
}

function getHumidityInsight(
  humidity: number,
  minH: number,
  maxH: number
): string {
  if (humidity < 30)
    return `Air is very dry at ${humidity}%. This can cause dry skin, irritated eyes, and static electricity. Consider using a humidifier indoors. Drink plenty of water and moisturize exposed skin. Wooden furniture and musical instruments may need extra care.`;
  if (humidity <= 60)
    return `Humidity levels are in the comfortable range at ${humidity}%. This is ideal for most indoor and outdoor activities. Air quality feels pleasant, and there's minimal risk of heat-related discomfort. ${
      maxH - minH > 20
        ? "Note that humidity varies significantly today — prepare for changing conditions."
        : "Conditions remain stable throughout the day."
    }`;
  if (humidity <= 75)
    return `Humidity is moderately high at ${humidity}%. You may notice slightly sticky conditions, especially during physical activity. Take breaks and stay hydrated. Indoor spaces may benefit from ventilation or dehumidification.`;
  return `Humidity is high at ${humidity}%, making it feel muggy and uncomfortable. Physical exertion may feel harder as sweat evaporates less efficiently. Stay hydrated, seek air-conditioned spaces, and limit strenuous outdoor activities. Watch for signs of heat exhaustion.`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const status = getComfortStatus(val);
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-0.5">{label}</p>
        <p className="text-white font-medium text-sm">{val}%</p>
        <p className="text-[10px] mt-0.5" style={{ color: status.color }}>
          {status.label}
        </p>
      </div>
    );
  }
  return null;
};

export function HumidityModal({ humidity }: HumidityModalProps) {
  const hourlyData = useMemo(
    () => generateHourlyHumidity(humidity),
    [humidity]
  );

  const minHumidity = useMemo(
    () => Math.min(...hourlyData.map((d) => d.humidity)),
    [hourlyData]
  );
  const maxHumidity = useMemo(
    () => Math.max(...hourlyData.map((d) => d.humidity)),
    [hourlyData]
  );
  const avgHumidity = useMemo(
    () =>
      Math.round(
        hourlyData.reduce((sum, d) => sum + d.humidity, 0) / 24
      ),
    [hourlyData]
  );

  const status = getComfortStatus(humidity);

  const stats = [
    {
      label: "Current",
      value: `${humidity}%`,
      icon: <Droplets className="w-3.5 h-3.5" />,
      color: "text-blue-400",
    },
    {
      label: "Daily Min",
      value: `${minHumidity}%`,
      icon: <ArrowDown className="w-3.5 h-3.5" />,
      color: "text-white",
    },
    {
      label: "Daily Max",
      value: `${maxHumidity}%`,
      icon: <ArrowUp className="w-3.5 h-3.5" />,
      color: "text-white",
    },
    {
      label: "Average",
      value: `${avgHumidity}%`,
      icon: <Activity className="w-3.5 h-3.5" />,
      color: "text-white",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-light text-white tracking-tight">
          {humidity}
          <span className="text-lg text-white/30 ml-0.5">%</span>
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
          <p className="text-xs text-white/30 mt-1">{status.description}</p>
        </div>
      </div>

      {/* Comfort meter */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            Comfort Range
          </p>
          <p className="text-[10px] text-white/20">30% – 60%</p>
        </div>
        <div className="relative h-3 bg-white/[0.04] rounded-full overflow-hidden">
          {/* Comfort zone background */}
          <div
            className="absolute top-0 bottom-0 bg-green-500/10 border-x border-green-500/20"
            style={{ left: "30%", width: "30%" }}
          />
          {/* Current position */}
          <div
            className="absolute top-0 bottom-0 rounded-full transition-all"
            style={{
              width: `${humidity}%`,
              background: `linear-gradient(90deg, ${status.color}60, ${status.color})`,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-white/15 mt-1">
          <span>0%</span>
          <span>30%</span>
          <span>60%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Primary: Area Chart with Comfort Zone */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          24-Hour Humidity
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
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
              domain={[0, 100]}
              width={30}
              tickFormatter={(v: number) => `${v}%`}
            />
            {/* Comfort zone band */}
            <ReferenceArea
              y1={30}
              y2={60}
              fill="#22c55e"
              fillOpacity={0.04}
              stroke="#22c55e"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
            {/* Comfort zone labels */}
            <ReferenceLine
              y={30}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.2}
              label={{
                value: "30%",
                position: "right",
                fill: "rgba(34,197,94,0.3)",
                fontSize: 9,
              }}
            />
            <ReferenceLine
              y={60}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.2}
              label={{
                value: "60%",
                position: "right",
                fill: "rgba(34,197,94,0.3)",
                fontSize: 9,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#humidityGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#3b82f6",
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
            <p className={`text-sm font-medium ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/[0.06] to-cyan-500/[0.06] border border-blue-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-[10px] text-blue-400/70 uppercase tracking-widest font-medium">
            Humidity Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {getHumidityInsight(humidity, minHumidity, maxHumidity)}
        </p>
      </div>
    </div>
  );
}
