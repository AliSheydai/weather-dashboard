"use client";

import { useMemo } from "react";

interface MiniSunTimelineProps {
  sunrise: string;
  sunset: string;
}

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 6;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h + m / 60;
}

export function MiniSunTimeline({ sunrise, sunset }: MiniSunTimelineProps) {
  const sunriseH = parseTime(sunrise);
  const sunsetH = parseTime(sunset);
  const now = new Date();
  const currentH = now.getHours() + now.getMinutes() / 60;
  const dayLength = sunsetH - sunriseH;
  const sunProgress = Math.max(0, Math.min(1, (currentH - sunriseH) / dayLength));
  const isDaytime = currentH >= sunriseH && currentH <= sunsetH;

  const sunrisePct = (sunriseH / 24) * 100;
  const sunsetPct = (sunsetH / 24) * 100;
  const dayWidthPct = ((sunsetH - sunriseH) / 24) * 100;

  const sunPosition = useMemo(() => {
    if (!isDaytime) return null;
    return sunrisePct + sunProgress * dayWidthPct;
  }, [isDaytime, sunrisePct, sunProgress, dayWidthPct]);

  return (
    <div className="w-full mt-1">
      {/* Timeline bar */}
      <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        {/* Night zones */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-transparent to-indigo-900/30" />
        {/* Daylight zone */}
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-amber-500/40 via-amber-400/20 to-purple-500/40 rounded-full"
          style={{ left: `${sunrisePct}%`, width: `${dayWidthPct}%` }}
        />
        {/* Sun position dot */}
        {sunPosition !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]"
            style={{ left: `${sunPosition}%` }}
          />
        )}
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-amber-400/60">{sunrise}</span>
        <span className="text-[9px] text-purple-400/60">{sunset}</span>
      </div>
    </div>
  );
}
