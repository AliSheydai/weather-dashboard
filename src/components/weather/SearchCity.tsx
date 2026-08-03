"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Loader2, Clock, TrendingUp } from "lucide-react";

interface HistoryItem {
  id: string;
  city: string;
  searchedAt: string;
}

interface SearchCityProps {
  onSearch: (city: string) => void;
  onCitySelect?: (city: string) => void;
  isLoading?: boolean;
  searchHistory?: HistoryItem[];
}

const POPULAR_CITIES = [
  "New York",
  "London",
  "Tokyo",
  "Paris",
  "Berlin",
  "Sydney",
  "Dubai",
  "Singapore",
  "Toronto",
  "Mumbai",
  "Los Angeles",
  "Chicago",
  "San Francisco",
  "Miami",
  "Rome",
  "Madrid",
  "Barcelona",
  "Amsterdam",
  "Seoul",
  "Bangkok",
  "Istanbul",
  "Cairo",
  "Moscow",
  "Beijing",
  "Shanghai",
  "Hong Kong",
  "Melbourne",
  "Auckland",
  "São Paulo",
  "Buenos Aires",
  "Mexico City",
  "Lima",
  "Bogotá",
  "Santiago",
  "Johannesburg",
  "Nairobi",
  "Lagos",
  "Cape Town",
  "Reykjavik",
  "Oslo",
  "Stockholm",
  "Copenhagen",
  "Helsinki",
  "Vienna",
  "Prague",
  "Warsaw",
  "Lisbon",
  "Athens",
  "Zurich",
  "Geneva",
];

export function SearchCity({
  onSearch,
  onCitySelect,
  isLoading,
  searchHistory = [],
}: SearchCityProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get unique recent cities from history
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

  // Filter suggestions based on query
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return POPULAR_CITIES.filter(
      (city) =>
        city.toLowerCase().includes(lowerQuery) &&
        city.toLowerCase() !== lowerQuery
    ).slice(0, 6);
  }, [query]);

  // Items to show in dropdown
  const showRecent = !query.trim() && recentCities.length > 0 && isOpen;
  const showSuggestions = query.trim().length > 0 && suggestions.length > 0;
  const dropdownItems = showRecent ? recentCities : suggestions;
  const isDropdownOpen = isOpen && (showRecent || showSuggestions);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const handleSelect = (city: string) => {
    setQuery(city);
    setIsOpen(false);
    if (onCitySelect) {
      onCitySelect(city);
    } else {
      onSearch(city);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < dropdownItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : dropdownItems.length - 1
        );
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
    <div ref={containerRef} className="relative px-4 pt-4 pb-1">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] group-focus-within:text-indigo-400 transition-colors" />
          {isLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for a city or airport"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-10 pl-10 pr-10 bg-[#141420] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </form>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-[#1a1a2e] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl shadow-black/50 z-50">
          {/* Section header */}
          <div className="px-3 py-2 flex items-center gap-2 border-b border-white/[0.06]">
            {showRecent ? (
              <>
                <Clock className="h-3 w-3 text-[#64748b]" />
                <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">
                  Recent Searches
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3 text-[#64748b]" />
                <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">
                  Suggestions
                </span>
              </>
            )}
          </div>

          {/* Items */}
          <div className="py-1 max-h-[240px] overflow-y-auto">
            {dropdownItems.map((city, index) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  index === selectedIndex
                    ? "bg-indigo-500/15 text-white"
                    : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {showRecent ? (
                  <Clock className="h-3.5 w-3.5 text-[#64748b] shrink-0" />
                ) : (
                  <Search className="h-3.5 w-3.5 text-[#64748b] shrink-0" />
                )}
                <span className="truncate">{city}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
