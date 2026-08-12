"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

interface MiniVisibilityGaugeProps {
  visibility: number;
}

const GAUGE_ZONES = [
  { max: 1, color: "#ef4444" },
  { max: 4, color: "#eab308" },
  { max: 10, color: "#22c55e" },
  { max: 20, color: "#06b6d4" },
];

function getVisColor(vis: number): string {
  if (vis < 1) return "#ef4444";
  if (vis < 4) return "#eab308";
  if (vis < 10) return "#22c55e";
  return "#06b6d4";
}

function buildSegments() {
  const segs: { color: string }[] = [];
  for (const zone of GAUGE_ZONES) {
    const count = zone.max <= 1 ? 2 : zone.max <= 4 ? 3 : zone.max <= 10 ? 5 : 6;
    for (let i = 0; i < count; i++) segs.push({ color: zone.color });
  }
  return segs;
}

const SEGMENTS = buildSegments();

function GaugeNeedle({
  cx,
  cy,
  outerRadius,
  vis,
}: {
  cx: number;
  cy: number;
  outerRadius: number;
  vis: number;
}) {
  const ratio = Math.min(vis, 20) / 20;
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
      <circle cx={tipX} cy={tipY} r={1.5} fill={getVisColor(vis)} />
    </g>
  );
}

export function MiniVisibilityGauge({ visibility }: MiniVisibilityGaugeProps) {
  const clamped = Math.min(visibility, 20);
  const gaugeData = useMemo(
    () => [
      { name: "value", value: clamped },
      { name: "empty", value: 20 - clamped },
    ],
    [clamped]
  );
  const segAngle = 180 / SEGMENTS.length;

  return (
    <div className="flex justify-center">
      <PieChart width={140} height={75}>
        {SEGMENTS.map((seg, i) => {
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
              <Cell fill={seg.color} opacity={i / SEGMENTS.length <= clamped / 20 ? 0.5 : 0.08} />
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
          <Cell fill={getVisColor(visibility)} opacity={0.85} />
          <Cell fill="transparent" />
        </Pie>
        <GaugeNeedle cx={70} cy={75} outerRadius={45} vis={visibility} />
      </PieChart>
    </div>
  );
}
