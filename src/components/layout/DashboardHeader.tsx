"use client";

import { MapPin, Compass, Map, BarChart3 } from "lucide-react";

interface DashboardHeaderProps {
  city: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function DashboardHeader({
  city,
  activeTab = "browse",
  onTabChange,
}: DashboardHeaderProps) {
  const tabs = [
    { id: "browse", label: "Browse", icon: Compass },
    { id: "map", label: "Map", icon: Map },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0d0d14]/80 backdrop-blur-xl">
      {/* Location */}
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-indigo-400" />
        <span className="text-[#94a3b8] font-medium tracking-wide uppercase">
          Home
        </span>
        <span className="text-[#94a3b8]">&bull;</span>
        <span className="text-white font-semibold uppercase tracking-wider">
          {city}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1 bg-[#141420] rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10"
                  : "text-[#94a3b8] hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
