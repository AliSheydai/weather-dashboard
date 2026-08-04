"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CloudSun,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Compass,
  Map,
  BarChart3,
  MapPin,
  Plus,
  LocateFixed,
  RefreshCw,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Flame,
  Thermometer,
  Droplets,
  Leaf,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useIsMobile } from "@/hooks/use-mobile";

// Types
interface CityData {
  name: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  isFavorite?: boolean;
}

interface HistoryItem {
  id: string;
  city: string;
  searchedAt: string;
}

interface PremiumSidebarProps {
  onCitySelect: (city: string) => void;
  selectedCity: string;
  onSearch?: (city: string) => void;
  isLoading?: boolean;
  recentCities?: CityData[];
  favoriteCities?: CityData[];
  searchHistory?: HistoryItem[];
  onToggleFavorite?: (city: string) => void;
  onRemoveFavorite?: (city: string) => void;
  isAuthenticated?: boolean;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  onLogout?: () => void;
  onSettings?: () => void;
  onRefresh?: () => void;
  onUseLocation?: () => void;
  currentWeather?: {
    city: string;
    temperature: number;
    condition: string;
    aqi?: number;
    aqiStatus?: string;
  } | null;
}

// Navigation items
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Browse", icon: Compass, id: "browse" },
  { label: "Map", icon: Map, id: "map" },
  { label: "Metrics", icon: BarChart3, id: "metrics" },
];

// Collections
const COLLECTIONS = [
  { label: "Summer Destinations", icon: Sun, id: "summer" },
  { label: "Rainy Places", icon: CloudRain, id: "rainy" },
  { label: "Snow Cities", icon: Snowflake, id: "snow" },
  { label: "Windy Spots", icon: Wind, id: "windy" },
];

// Explore stats
const EXPLORE_STATS = [
  { label: "Hottest City", value: "Dubai", emoji: "🔥" },
  { label: "Coldest City", value: "Reykjavik", emoji: "❄️" },
  { label: "Rainiest City", value: "Mumbai", emoji: "🌧️" },
  { label: "Best Air Quality", value: "Zurich", emoji: "🌿" },
];

// Simple tooltip component for collapsed state
function SidebarTooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.top + rect.height / 2 });
    }
    setShow(true);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      className="relative">
      {children}
      {show && (
        <div
          className="fixed left-[76px] z-[100] px-2.5 py-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
          style={{ top: position.top, transform: "translateY(-50%)" }}>
          {content}
        </div>
      )}
    </div>
  );
}

export function PremiumSidebar({
  onCitySelect,
  selectedCity,
  onSearch,
  isLoading,
  favoriteCities = [],
  searchHistory = [],
  isAuthenticated = false,
  userName = "User",
  userEmail = "user@example.com",
  userAvatar,
  onLogout,
  onSettings,
  onRefresh,
  onUseLocation,
  currentWeather,
}: PremiumSidebarProps) {
  const { isOpen, toggle } = useSidebarStore();
  const isMobile = useIsMobile();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("browse");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [userDropdownPos, setUserDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target) &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Track button position for portal dropdown
  useLayoutEffect(() => {
    if (!userMenuOpen || !userButtonRef.current) return;
    const rect = userButtonRef.current.getBoundingClientRect();
    setUserDropdownPos({
      top: rect.top - 8,
      left: rect.left,
      width: rect.width,
    });
  }, [userMenuOpen]);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Default cities if no favorites
  const defaultCities: CityData[] = [
    {
      name: "New York",
      temperature: 22,
      condition: "Cloudy",
      high: 29,
      low: 15,
    },
    { name: "London", temperature: 18, condition: "Rainy", high: 21, low: 12 },
    { name: "Tokyo", temperature: 28, condition: "Clear", high: 32, low: 24 },
    { name: "Paris", temperature: 20, condition: "Sunny", high: 25, low: 16 },
    { name: "Berlin", temperature: 19, condition: "Cloudy", high: 23, low: 14 },
  ];

  const cities = favoriteCities.length > 0 ? favoriteCities : defaultCities;

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("clear") || c.includes("sunny")) return "☀️";
    if (c.includes("cloud")) return "☁️";
    if (c.includes("rain")) return "🌧️";
    if (c.includes("snow")) return "❄️";
    if (c.includes("thunder")) return "⛈️";
    return "🌤️";
  };

  // Sidebar width
  const expandedWidth = 280;
  const collapsedWidth = 72;

  // Desktop sidebar
  const sidebarContent = (
    <motion.div
      className="h-full flex flex-col bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.06] overflow-hidden"
      initial={false}
      animate={{ width: isOpen ? expandedWidth : collapsedWidth }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}>
      <div className="p-4 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <AnimatePresence mode="wait">
            {isOpen && (
              <>
                {/* Brand Row */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                  <CloudSun className="h-5 w-5 text-white" />
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold text-white tracking-tight">
                    Weather
                  </h1>
                  <p className="text-[9px] text-white/25 uppercase tracking-[0.15em]">
                    Dashboard
                  </p>
                </motion.div>
              </>
            )}
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all shrink-0">
              {isOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none mb-2">
        {/* Main Navigation */}
        <nav className="px-2 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            const btn = (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all ${
                  isActive
                    ? "bg-indigo-500/15 text-white shadow-lg shadow-indigo-500/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}>
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[13px] font-medium truncate whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );

            if (!isOpen) {
              return (
                <SidebarTooltip key={item.id} content={item.label}>
                  {btn}
                </SidebarTooltip>
              );
            }
            return btn;
          })}
        </nav>

        {/* Saved Cities Section */}
        {/* <div className="px-2 py-1">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1.5 flex items-center gap-2">
                <MapPin className="h-3 w-3 text-white/20" />
                <h3 className="text-[10px] font-medium text-white/25 uppercase tracking-widest">
                  Saved Cities
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            {cities.map((city) => {
              const isSelected = selectedCity === city.name;
              const btn = (
                <button
                  key={city.name}
                  onClick={() => onCitySelect(city.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    isSelected
                      ? "bg-indigo-500/15 border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                      : "hover:bg-white/[0.04] border border-transparent"
                  }`}>
                  <div className="text-lg shrink-0">
                    {getWeatherIcon(city.condition)}
                  </div>
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 min-w-0 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-white truncate">
                            {city.name}
                          </div>
                          <div className="text-[10px] text-white/30">
                            {city.condition}
                          </div>
                        </div>
                        {city.temperature > 0 && (
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-sm font-bold text-white">
                              {city.temperature}°
                            </div>
                            <div className="text-[10px] text-white/20">
                              H:{city.high}° L:{city.low}°
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );

              if (!isOpen) {
                return (
                  <SidebarTooltip
                    key={city.name}
                    content={
                      <>
                        <div className="font-medium">{city.name}</div>
                        <div className="text-white/50">
                          {city.condition} · {city.temperature}°
                        </div>
                      </>
                    }>
                    {btn}
                  </SidebarTooltip>
                );
              }
              return btn;
            })}
          </div>
        </div> */}

        {/* Quick Actions */}
        <div className="px-2 py-2">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1.5 flex items-center gap-2">
                <h3 className="text-[10px] font-medium text-white/25 uppercase tracking-widest">
                  Quick Actions
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
          <div className={`flex ${isOpen ? "gap-1.5 px-1" : "flex-col gap-1"}`}>
            {[
              { icon: Plus, label: "Add City", action: () => {} },
              {
                icon: LocateFixed,
                label: "Location",
                action: onUseLocation || (() => {}),
              },
              {
                icon: RefreshCw,
                label: "Refresh",
                action: onRefresh || (() => {}),
              },
            ].map((btn) => {
              const button = (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className={`${isOpen ? "flex-1" : "w-full"} flex items-center justify-center gap-2 py-2 px-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all`}>
                  <btn.icon className="h-3.5 w-3.5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] font-medium uppercase tracking-wider whitespace-nowrap">
                        {btn.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );

              if (!isOpen) {
                return (
                  <SidebarTooltip key={btn.label} content={btn.label}>
                    {button}
                  </SidebarTooltip>
                );
              }
              return button;
            })}
          </div>
        </div>

        {/* Collections Section */}
        <div className="px-2 py-1">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1.5 flex items-center gap-2">
                <h3 className="text-[10px] font-medium text-white/25 uppercase tracking-widest">
                  Collections
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            {COLLECTIONS.map((collection) => {
              const button = (
                <button
                  key={collection.id}
                  className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
                  <collection.icon className="h-[18px] w-[18px] shrink-0" />
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[13px] font-medium truncate whitespace-nowrap">
                        {collection.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );

              if (!isOpen) {
                return (
                  <SidebarTooltip
                    key={collection.id}
                    content={collection.label}>
                    {button}
                  </SidebarTooltip>
                );
              }
              return button;
            })}
          </div>
        </div>

        {/* Explore Section */}
        <div className="px-2 py-1">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1.5 flex items-center gap-2">
                <h3 className="text-[10px] font-medium text-white/25 uppercase tracking-widest">
                  Explore
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            {EXPLORE_STATS.map((stat) => {
              const el = (
                <div
                  key={stat.label}
                  className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-white/30">
                  <span className="text-base shrink-0">{stat.emoji}</span>
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="text-[11px] text-white/25 truncate">
                          {stat.label}
                        </span>
                        <span className="text-[12px] font-medium text-white/50">
                          {stat.value}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );

              if (!isOpen) {
                return (
                  <SidebarTooltip
                    key={stat.label}
                    content={`${stat.emoji} ${stat.label}: ${stat.value}`}>
                    {el}
                  </SidebarTooltip>
                );
              }
              return el;
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Section */}
      <div className="shrink-0 border-t border-white/[0.06]">
        {/* Live Weather Widget */}
        <div className="px-2 py-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <div className="flex items-center gap-2">
              <div className="text-xl">
                {getWeatherIcon(currentWeather?.condition || "Clear")}
              </div>
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-0">
                    <div className="text-[9px] font-semibold text-indigo-400/80 uppercase tracking-wider">
                      Now in {currentWeather?.city || selectedCity}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {currentWeather?.temperature ?? "--"}°C
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      {currentWeather?.aqi !== undefined && (
                        <>
                          <span>AQI {currentWeather.aqi}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{currentWeather?.condition || "Loading..."}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* User Profile / Sign In Section */}
        <div className="px-2 pb-2" ref={userMenuRef}>
          {isAuthenticated ? (
            <div className="relative">
              <button
                ref={userButtonRef}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-w-0 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-white truncate">
                          {userName}
                        </div>
                        <div className="text-[10px] text-white/25 truncate">
                          {userEmail}
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-white/25 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* User Dropdown (portaled to body to escape sidebar's backdrop-blur) */}
              {createPortal(
                <AnimatePresence>
                  {userMenuOpen && isOpen && (
                    <motion.div
                      ref={userDropdownRef}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        bottom: window.innerHeight - userDropdownPos.top,
                        left: userDropdownPos.left,
                        width: userDropdownPos.width,
                      }}
                      className="fixed mb-1 bg-[#09090d] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl z-50">
                      <button
                        onClick={() => {
                          onSettings?.();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors">
                        <User className="h-4 w-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          onSettings?.();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors">
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors">
                        <Thermometer className="h-4 w-4" />
                        Temperature Unit
                      </button>
                      <div className="h-px bg-white/[0.06]" />
                      <button
                        onClick={() => {
                          onLogout?.();
                          setUserMenuOpen(false);
                          router.push("/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 transition-all">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <LogIn className="h-4 w-4 text-indigo-400" />
              </div>
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-indigo-400">
                      Sign In
                    </div>
                    <div className="text-[10px] text-indigo-400/50">
                      Access your account
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={toggle}
            />
            <motion.aside
              initial={{ x: -expandedWidth }}
              animate={{ x: 0 }}
              exit={{ x: -expandedWidth }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 flex flex-col"
              style={{ width: expandedWidth }}>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return sidebarContent;
}
