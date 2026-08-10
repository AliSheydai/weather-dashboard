"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type Accent = "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet";

const ACCENT_STYLES: Record<
  Accent,
  { icon: string; iconBg: string; ring: string; glow: string }
> = {
  indigo: {
    icon: "text-indigo-300",
    iconBg: "bg-indigo-400/10",
    ring: "group-hover:ring-indigo-400/20",
    glow: "group-hover:shadow-indigo-500/10",
  },
  emerald: {
    icon: "text-emerald-300",
    iconBg: "bg-emerald-400/10",
    ring: "group-hover:ring-emerald-400/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  amber: {
    icon: "text-amber-300",
    iconBg: "bg-amber-400/10",
    ring: "group-hover:ring-amber-400/20",
    glow: "group-hover:shadow-amber-500/10",
  },
  rose: {
    icon: "text-rose-300",
    iconBg: "bg-rose-400/10",
    ring: "group-hover:ring-rose-400/20",
    glow: "group-hover:shadow-rose-500/10",
  },
  sky: {
    icon: "text-sky-300",
    iconBg: "bg-sky-400/10",
    ring: "group-hover:ring-sky-400/20",
    glow: "group-hover:shadow-sky-500/10",
  },
  violet: {
    icon: "text-violet-300",
    iconBg: "bg-violet-400/10",
    ring: "group-hover:ring-violet-400/20",
    glow: "group-hover:shadow-violet-500/10",
  },
};

interface Trend {
  /** Signed percent or absolute change, e.g. 12.4 or -3.1 */
  value: number;
  /** What the number is relative to, e.g. "vs last week" */
  label?: string;
}

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  trend?: Trend;
  accent?: Accent;
  extra?: ReactNode;
  onShowMore?: () => void;
  index?: number;
  loading?: boolean;
}

export function MetricCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  accent = "indigo",
  extra,
  onShowMore,
  index = 0,
  loading = false,
}: MetricCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const a = ACCENT_STYLES[accent];

  if (loading) {
    return <MetricCardSkeleton />;
  }

  const isPositive = trend ? trend.value > 0 : null;
  const isNeutral = trend ? trend.value === 0 : null;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: prefersReducedMotion ? 0 : index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={`group relative flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 ring-1 ring-transparent transition-all duration-300 ease-out hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 ${a.ring} ${a.glow}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-lg ${a.iconBg} ${a.icon} transition-transform duration-300 group-hover:scale-105`}
          >
            <div className="w-3.5 h-3.5 [&>svg]:w-3.5 [&>svg]:h-3.5">
              {icon}
            </div>
          </div>
          <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">
            {title}
          </span>
        </div>

        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
              isNeutral
                ? "text-white/40 bg-white/[0.04]"
                : isPositive
                ? "text-emerald-300 bg-emerald-400/10"
                : "text-rose-300 bg-rose-400/10"
            }`}
          >
            {!isNeutral && (
              <svg
                viewBox="0 0 10 10"
                className={`w-2 h-2 ${isPositive ? "" : "rotate-180"}`}
                fill="currentColor"
              >
                <path d="M5 1l4 4.5H1L5 1z" />
              </svg>
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[26px] leading-none font-medium text-white tracking-tight tabular-nums">
          {value}
        </div>
        <p className="text-xs text-white/40 mt-1.5">
          {subtitle}
          {trend?.label && (
            <span className="text-white/25"> · {trend.label}</span>
          )}
        </p>
        {extra && <div className="mt-2">{extra}</div>}
      </div>

      {/* Show More */}
      {onShowMore && (
        <button
          onClick={onShowMore}
          className="mt-auto pt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400/70 hover:text-indigo-300 focus-visible:text-indigo-300 transition-colors uppercase tracking-wider text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm w-fit"
        >
          Show more
          <svg
            viewBox="0 0 10 10"
            className="w-2.5 h-2.5 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 1.5L7 5l-4 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="relative flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 overflow-hidden">
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-7 h-7 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="w-16 h-2.5 rounded-full bg-white/[0.06] animate-pulse" />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="w-20 h-6 rounded-md bg-white/[0.06] animate-pulse" />
        <div className="w-28 h-2.5 rounded-full bg-white/[0.05] animate-pulse" />
      </div>
    </div>
  );
}