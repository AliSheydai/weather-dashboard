"use client";

import { Search, Bell, Loader2, Clock, TrendingUp } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/stores/sidebarStore";
import { NotificationBell } from "@/components/header/NotificationBell";

const POPULAR_CITIES = [
  "New York", "London", "Tokyo", "Paris", "Berlin", "Sydney", "Dubai",
  "Singapore", "Toronto", "Mumbai", "Los Angeles", "Chicago", "San Francisco",
  "Miami", "Rome", "Madrid", "Barcelona", "Amsterdam", "Seoul", "Bangkok",
  "Istanbul", "Cairo", "Moscow", "Beijing", "Shanghai", "Hong Kong",
  "Melbourne", "Auckland", "São Paulo", "Buenos Aires", "Mexico City",
];

interface DashboardHeaderProps {
  city: string;
  onSearch?: (city: string) => void;
  isLoading?: boolean;
  searchHistory?: { id: string; city: string; searchedAt: string }[];
  token?: string | null;
  isAuthenticated?: boolean;
}

export function DashboardHeader({
  city,
  onSearch,
  isLoading,
  searchHistory = [],
  token = null,
  isAuthenticated = false,
}: DashboardHeaderProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [searchDropdownPos, setSearchDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Recent cities from history
  const recentCities = useMemo(() => {
    const seen = new Set<string>();
    return searchHistory
      .filter((item) => {
        if (seen.has(item.city.toLowerCase())) return false;
        seen.add(item.city.toLowerCase());
        return true;
      })
      .slice(0, 5)
      .map((item) => item.city);
  }, [searchHistory]);

  // Filter suggestions
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return POPULAR_CITIES.filter(
      (c) => c.toLowerCase().includes(lowerQuery) && c.toLowerCase() !== lowerQuery
    ).slice(0, 6);
  }, [query]);

  const showRecent = !query.trim() && recentCities.length > 0 && isOpen;
  const showSuggestions = query.trim().length > 0 && suggestions.length > 0;
  const dropdownItems = showRecent ? recentCities : suggestions;
  const isDropdownOpen = isOpen && (showRecent || showSuggestions);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track input position for portal dropdown
  useLayoutEffect(() => {
    if (!isDropdownOpen || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setSearchDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, [isDropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleSelect = (cityName: string) => {
    setQuery("");
    setIsOpen(false);
    if (onSearch) onSearch(cityName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < dropdownItems.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : dropdownItems.length - 1));
        break;
      case "Enter":
        if (selectedIndex >= 0 && selectedIndex < dropdownItems.length) {
          e.preventDefault();
          handleSelect(dropdownItems[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      {/* Location */}
      <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
        <span className="text-xs text-white/25 uppercase tracking-widest font-medium">
          Home
        </span>
        <span className="text-white/10">/</span>
        <span className="text-xs text-white/80 font-semibold uppercase tracking-wider">
          {city}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-auto px-4" ref={containerRef}>
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 group-focus-within:text-indigo-400 transition-colors" />
          {isLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city or airport"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-9 pl-10 pr-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />

          {/* Dropdown (portaled to body to escape header's backdrop-blur) */}
          {createPortal(
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  ref={searchDropdownRef}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{ top: searchDropdownPos.top, left: searchDropdownPos.left, width: searchDropdownPos.width }}
                  className="fixed mt-1 bg-[#09090d] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl shadow-black/50 z-50"
                >
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-white/[0.06]">
                    {showRecent ? (
                      <>
                        <Clock className="h-3 w-3 text-white/25" />
                        <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Recent</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 text-white/25" />
                        <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Suggestions</span>
                      </>
                    )}
                  </div>
                  <div className="py-1 max-h-[240px] overflow-y-auto">
                    {dropdownItems.map((item, index) => (
                      <button
                        key={item}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                          index === selectedIndex
                            ? "bg-indigo-500/15 text-white"
                            : "text-white/50 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {showRecent ? (
                          <Clock className="h-3.5 w-3.5 text-white/25 shrink-0" />
                        ) : (
                          <Search className="h-3.5 w-3.5 text-white/25 shrink-0" />
                        )}
                        <span className="truncate">{item}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </form>
      </div>

      {/* Utility Icons */}
      <div className="flex items-center gap-1 min-w-[120px] justify-end">
        <NotificationBell token={token} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
