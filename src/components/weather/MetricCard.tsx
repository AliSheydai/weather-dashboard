"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  extra?: ReactNode;
  onShowMore?: () => void;
  index?: number;
}

export function MetricCard({
  icon,
  title,
  value,
  subtitle,
  extra,
  onShowMore,
  index = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="group relative flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-white/30">{icon}</div>
        <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          {title}
        </span>
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-2xl font-light text-white tracking-tight">
          {value}
        </div>
        <p className="text-xs text-white/40 mt-1">{subtitle}</p>
        {extra && <div className="mt-2">{extra}</div>}
      </div>

      {/* Show More */}
      {onShowMore && (
        <button
          onClick={onShowMore}
          className="mt-auto pt-2 text-[10px] font-medium text-indigo-400/60 hover:text-indigo-400 transition-colors uppercase tracking-wider text-left"
        >
          Show More
        </button>
      )}
    </motion.div>
  );
}
