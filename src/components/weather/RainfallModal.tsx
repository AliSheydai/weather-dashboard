"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  CloudRain,
  Clock,
  Droplets,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

interface RainfallModalProps {
  rainfall: number;
}

function generateHourlyRain(
  totalRain: number
): { hour: string; rain: number }[] {
  if (totalRain === 0) {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      rain: 0,
    }));
  }

  // Distribute rainfall across afternoon/evening hours (typical pattern)
  const rainHours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const weights = rainHours.map(
    (_, i) => Math.exp(-Math.pow((i - 4) / 2.5, 2)) + Math.random() * 0.2
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  return Array.from({ length: 24 }, (_, i) => {
    const rainIdx = rainHours.indexOf(i);
    const rain =
      rainIdx >= 0
        ? Math.round(((weights[rainIdx] / totalWeight) * totalRain) * 10) / 10
        : Math.random() < 0.05
        ? Math.round(Math.random() * 0.3 * 10) / 10
        : 0;
    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      rain: Math.max(0, rain),
    };
  });
}

function generate7DayRainfall(
  todayRain: number
): { day: string; rain: number; cumulative: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  let cumulative = 0;

  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today + i) % 7;
    const rain =
      i === 0
        ? todayRain
        : Math.round((Math.random() * 8 + (Math.random() < 0.4 ? 0 : 1)) * 10) / 10;
    cumulative += rain;
    return {
      day: i === 0 ? "Today" : days[dayIndex],
      rain,
      cumulative: Math.round(cumulative * 10) / 10,
    };
  });
}

function getPeakHour(hourlyData: { hour: string; rain: number }[]): string {
  const peak = hourlyData.reduce((max, d) => (d.rain > max.rain ? d : max));
  return peak.rain > 0 ? peak.hour : "—";
}

function getRainProbability(rainfall: number): number {
  if (rainfall === 0) return 5;
  if (rainfall < 1) return 30;
  if (rainfall < 3) return 55;
  if (rainfall < 5) return 70;
  if (rainfall < 10) return 85;
  return 95;
}

function getRainInsight(
  rainfall: number,
  peakHour: string,
  hourlyData: { hour: string; rain: number }[]
): string {
  if (rainfall === 0)
    return "No rainfall is expected today. Clear skies provide excellent conditions for all outdoor activities. No need to carry an umbrella or rain gear. A great day for picnics, hiking, or any outdoor plans.";

  const rainHours = hourlyData.filter((d) => d.rain > 0.2).length;
  const peakVal = hourlyData.find((d) => d.hour === peakHour)?.rain || 0;

  if (rainfall < 2)
    return `Light rain is expected today, mainly around ${peakHour}. Total accumulation is minimal at ${rainfall}mm. Carry a light umbrella just in case. Outdoor activities are still feasible with brief indoor breaks during showers.`;
  if (rainfall < 5)
    return `Moderate rainfall is expected, with the heaviest showers around ${peakHour} (${peakVal.toFixed(1)}mm). Plan indoor activities during peak rain hours. If going out, bring waterproof clothing and an umbrella. Roads may be slippery — drive with caution.`;
  return `Heavy rainfall is expected today with ${rainfall}mm total accumulation. The heaviest rain is forecast around ${peakHour} with ${peakVal.toFixed(1)}mm in a single hour. Avoid unnecessary travel during peak hours. Watch for localized flooding in low-lying areas. Carry waterproof gear and plan indoor alternatives.`;
}

const RainTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-0.5">{label}</p>
        <p className="text-white font-medium text-sm">
          {payload[0].value.toFixed(1)} mm
        </p>
      </div>
    );
  }
  return null;
};

const CumulativeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-white/50 text-[10px] mb-1">{data.day}</p>
        <p className="text-blue-400 text-sm">
          Daily: {data.rain.toFixed(1)} mm
        </p>
        <p className="text-cyan-400 text-sm">
          Cumulative: {data.cumulative.toFixed(1)} mm
        </p>
      </div>
    );
  }
  return null;
};

export function RainfallModal({ rainfall }: RainfallModalProps) {
  const hourlyData = useMemo(
    () => generateHourlyRain(rainfall),
    [rainfall]
  );
  const weeklyData = useMemo(
    () => generate7DayRainfall(rainfall),
    [rainfall]
  );
  const peakHour = useMemo(() => getPeakHour(hourlyData), [hourlyData]);
  const weeklyTotal = useMemo(
    () => Math.round(weeklyData.reduce((sum, d) => sum + d.rain, 0) * 10) / 10,
    [weeklyData]
  );
  const rainProb = getRainProbability(rainfall);

  const stats = [
    {
      label: "Rain Today",
      value: `${rainfall} mm`,
      icon: <CloudRain className="w-3.5 h-3.5" />,
      color: "text-blue-400",
    },
    {
      label: "Peak Hour",
      value: peakHour,
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "text-white",
    },
    {
      label: "Precip Prob",
      value: `${rainProb}%`,
      icon: <Droplets className="w-3.5 h-3.5" />,
      color: rainProb > 50 ? "text-blue-400" : "text-white",
    },
    {
      label: "Weekly Total",
      value: `${weeklyTotal} mm`,
      icon: <Calendar className="w-3.5 h-3.5" />,
      color: "text-white",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-light text-white tracking-tight">
          {rainfall}
          <span className="text-lg text-white/30 ml-1">mm</span>
        </div>
        <div>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {rainfall === 0
              ? "No Rain"
              : rainfall < 2
              ? "Light Rain"
              : rainfall < 5
              ? "Moderate Rain"
              : "Heavy Rain"}
          </span>
          <p className="text-xs text-white/30 mt-1">
            {rainfall === 0
              ? "Clear conditions expected"
              : `Expected around ${peakHour}`}
          </p>
        </div>
      </div>

      {/* Primary: Hourly Rainfall Bar Chart */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          Hourly Precipitation (mm)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData} barCategoryGap="10%">
            <defs>
              <linearGradient id="rainBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
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
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip content={<RainTooltip />} cursor={false} />
            <Bar
              dataKey="rain"
              fill="url(#rainBar)"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary: 7-Day Cumulative */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
          7-Day Cumulative Rainfall
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="cumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
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
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip content={<CumulativeTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#cumulativeGrad)"
              dot={{
                r: 3,
                fill: "#06b6d4",
                stroke: "white",
                strokeWidth: 1,
              }}
              activeDot={{
                r: 5,
                fill: "#06b6d4",
                stroke: "white",
                strokeWidth: 1.5,
              }}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rain probability indicator */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            Precipitation Probability
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: rainProb > 50 ? "#3b82f6" : "rgba(255,255,255,0.5)" }}
          >
            {rainProb}%
          </p>
        </div>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${rainProb}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500/50 to-blue-400"
          />
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
      <div className="rounded-xl bg-gradient-to-r from-blue-500/[0.06] to-cyan-500/[0.06] border border-blue-500/[0.08] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-[10px] text-blue-400/70 uppercase tracking-widest font-medium">
            Rainfall Insight
          </p>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {getRainInsight(rainfall, peakHour, hourlyData)}
        </p>
      </div>
    </div>
  );
}
