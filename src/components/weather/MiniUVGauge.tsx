"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

interface MiniUVGaugeProps {
  uvIndex: number;
}

const GAUGE_COLORS = [
  "#22c55e",
  "#22c55e",
  "#eab308",
  "#eab308",
  "#eab308",
  "#f97316",
  "#f97316",
  "#ef4444",
  "#ef4444",
  "#ef4444",
  "#a855f7",
  "#a855f7",
];

function getUVColor(uv: number): string {
  if (uv <= 2) return "#22c55e";
  if (uv <= 5) return "#eab308";
  if (uv <= 7) return "#f97316";
  if (uv <= 10) return "#ef4444";
  return "#a855f7";
}

function GaugeNeedle({
  cx,
  cy,
  outerRadius,
  uv,
}: {
  cx: number;
  cy: number;
  outerRadius: number;
  uv: number;
}) {
  const angle = 180 - (Math.min(uv, 12) / 12) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleLength = outerRadius * 0.7;
  const tipX = cx + needleLength * Math.cos(rad);
  const tipY = cy - needleLength * Math.sin(rad);

  return (
    <g>
      <circle cx={cx} cy={cy} r={2.5} fill="white" opacity={0.8} />
      <line
        x1={cx}
        y1={cy}
        x2={tipX}
        y2={tipY}
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.8}
      />
      <circle cx={tipX} cy={tipY} r={1.5} fill={getUVColor(uv)} />
    </g>
  );
}

export function MiniUVGauge({ uvIndex }: MiniUVGaugeProps) {
  const clampedUV = Math.min(uvIndex, 12);

  const gaugeData = useMemo(
    () => [
      { name: "value", value: clampedUV },
      { name: "empty", value: 12 - clampedUV },
    ],
    [clampedUV]
  );

  return (
    <div className="flex justify-center">
      <PieChart width={140} height={75}>
        {GAUGE_COLORS.map((color, i) => {
          const segAngle = 180 / 12;
          const startAngle = 180 - i * segAngle;
          const endAngle = startAngle - segAngle;
          return (
            <Pie
              key={i}
              data={[{ value: 1 }]}
              cx={70}
              cy={75}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={36}
              outerRadius={50}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} opacity={i <= Math.floor(uvIndex) ? 0.5 : 0.08} />
            </Pie>
          );
        })}
        <Pie
          data={gaugeData}
          cx={70}
          cy={75}
          startAngle={180}
          endAngle={0}
          innerRadius={38}
          outerRadius={48}
          dataKey="value"
          stroke="none"
          animationBegin={200}
          animationDuration={800}
        >
          <Cell fill={getUVColor(uvIndex)} opacity={0.85} />
          <Cell fill="transparent" />
        </Pie>
        <GaugeNeedle cx={70} cy={75} outerRadius={45} uv={uvIndex} />
      </PieChart>
    </div>
  );
}
