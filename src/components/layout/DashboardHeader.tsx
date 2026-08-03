"use client";

import { Compass, Map, BarChart3, Search, Bell } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      {/* Location */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs text-white/25 uppercase tracking-widest font-medium">
          Home
        </span>
        <span className="text-white/10">/</span>
        <span className="text-xs text-white/80 font-semibold uppercase tracking-wider">
          {city}
        </span>
      </div>

      {/* Navigation Pills */}
      <nav className="flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-0.5 border border-white/[0.04]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/[0.08] rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`h-3.5 w-3.5 relative z-10 ${
                  isActive ? "text-indigo-400" : "text-white/30"
                }`}
              />
              <span
                className={`relative z-10 ${
                  isActive ? "text-white/90" : "text-white/30"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Utility Icons */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
          <Search className="h-4 w-4" />
        </button>
        <button className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all relative">
          <Bell className="h-4 w-4" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>
      </div>
    </div>
  );
}
