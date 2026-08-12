"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

interface MiniAQIGaugeProps {
  aqi: number;
}

const AQI_CATEGORIES = [
  { max: 50, color: "#22c55e" },
  { max: 100, color: "#eab308" },
  { max: 150, color: "#f97316" },
  { max: 200, color: "#ef4444" },
  { max: 250, color: "#a855f7" },
  { max: 300, color: "#7f1d1d" },
];

function getAQIColor(aqi: number): string {
  for (const cat of AQI_CATEGORIES) {
    if (aqi <= cat.max) return cat.color;
  }
  return "#7f1d1d";
}

function GaugeNeedle({
  cx,
  cy,
  outerRadius,
  aqi,
}: {
  cx: number;
  cy: number;
  outerRadius: number;
  aqi: number;
}) {
  const ratio = Math.min(aqi, 300) / 300;
  const angle = 180 - ratio * 180;
  const rad = (angle * Math.PI) / 180;
  const len = outerRadius * 0.7;
  const tipX = cx + len * Math.cos(rad);
  const tipY = cy - len * Math.sin(rad);

  return (
    <g>
      <circle cx={cx} cy={cy} r={2.5} fill="white" opacity={0.8} />
      <line
        x1={cx} y1={cy} x2={tipX} y2={tipY}
        stroke="white" strokeWidth={1.5} strokeLinecap="round" opacity={0.8}
      />
      <circle cx={tipX} cy={tipY} r={1.5} fill={getAQIColor(aqi)} />
    </g>
  );
}

export function MiniAQIGauge({ aqi }: MiniAQIGaugeProps) {
  const clamped = Math.min(aqi, 300);
  const gaugeData = useMemo(
    () => [
      { name: "value", value: clamped },
      { name: "empty", value: 300 - clamped },
    ],
    [clamped]
  );

  const segCount = AQI_CATEGORIES.length;
  const segAngle = 180 / segCount;

  return (
    <div className="flex justify-center">
      <PieChart width={140} height={75}>
        {AQI_CATEGORIES.map((cat, i) => {
          const startAngle = 180 - i * segAngle;
          const endAngle = startAngle - segAngle;
          return (
            <Pie
              key={i}
              data={[{ value: 1 }]}
              cx={70} cy={75}
              startAngle={startAngle} endAngle={endAngle}
              innerRadius={36} outerRadius={50}
              dataKey="value" stroke="none"
            >
              <Cell fill={cat.color} opacity={aqi >= cat.max - 50 ? 0.5 : 0.08} />
            </Pie>
          );
        })}
        <Pie
          data={gaugeData}
          cx={70} cy={75}
          startAngle={180} endAngle={0}
          innerRadius={38} outerRadius={48}
          dataKey="value" stroke="none"
          animationBegin={200} animationDuration={800}
        >
          <Cell fill={getAQIColor(aqi)} opacity={0.85} />
          <Cell fill="transparent" />
        </Pie>
        <GaugeNeedle cx={70} cy={75} outerRadius={45} aqi={aqi} />
      </PieChart>
    </div>
  );
}
