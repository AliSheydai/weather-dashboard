"use client";

import { ReactNode } from "react";

interface WeatherCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WeatherCard({
  title,
  icon,
  children,
  className = "",
}: WeatherCardProps) {
  return (
    <div
      className={`rounded-2xl bg-[#141420] border border-white/[0.08] p-5 hover:border-white/[0.12] transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-[#64748b]">{icon}</div>
        <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
