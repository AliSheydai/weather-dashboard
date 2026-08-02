"use client";

import { SearchCity } from "./SearchCity";
import { CityList } from "./CityList";
import { UserProfile } from "../user/UserProfile";
import { MapPin, Star, Clock, Trash2 } from "lucide-react";

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

interface WeatherSidebarProps {
  onCitySelect: (city: string) => void;
  selectedCity: string;
  onSearch: (city: string) => void;
  isLoading?: boolean;
  recentCities?: CityData[];
  favoriteCities?: CityData[];
  searchHistory?: HistoryItem[];
  onToggleFavorite?: (city: string) => void;
  onRemoveFavorite?: (city: string) => void;
  onClearHistory?: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  onLogout?: () => void;
  onSettings?: () => void;
}

export function WeatherSidebar({
  onCitySelect,
  selectedCity,
  onSearch,
  isLoading,
  recentCities = [],
  favoriteCities = [],
  searchHistory = [],
  onToggleFavorite,
  onRemoveFavorite,
  onClearHistory,
  userName = "User",
  userEmail = "user@example.com",
  userAvatar,
  onLogout,
  onSettings,
}: WeatherSidebarProps) {
  // Default cities if none provided
  const defaultCities: CityData[] = [
    { name: "New York", temperature: 22, condition: "Cloudy", high: 29, low: 15 },
    { name: "London", temperature: 18, condition: "Rainy", high: 21, low: 12 },
    { name: "Tokyo", temperature: 28, condition: "Clear", high: 32, low: 24 },
    { name: "Paris", temperature: 20, condition: "Sunny", high: 25, low: 16 },
    { name: "Berlin", temperature: 19, condition: "Cloudy", high: 23, low: 14 },
  ];

  const cities = recentCities.length > 0 ? recentCities : defaultCities;

  // Convert history items to CityData format for display
  const historyCities: CityData[] = searchHistory.map((item) => ({
    name: item.city,
    temperature: 0,
    condition: "Unknown",
    high: 0,
    low: 0,
  }));

  // Get unique history cities (latest search per city)
  const uniqueHistoryCities = historyCities.reduce((acc, city) => {
    if (!acc.find((c) => c.name === city.name)) {
      acc.push(city);
    }
    return acc;
  }, [] as CityData[]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Weather</h1>
            <p className="text-[10px] text-[#64748b] uppercase tracking-wider">
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchCity onSearch={onSearch} isLoading={isLoading} />

      {/* Favorites Section */}
      {favoriteCities.length > 0 && (
        <div className="px-2 pt-2">
          <div className="px-3 py-2 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-yellow-400" />
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Favorites
            </h3>
          </div>
          <CityList
            cities={favoriteCities}
            selectedCity={selectedCity}
            onSelect={onCitySelect}
            onToggleFavorite={onToggleFavorite}
            onRemove={onRemoveFavorite}
          />
        </div>
      )}

      {/* Search History Section */}
      {searchHistory.length > 0 && (
        <div className="px-2 pt-2">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#64748b]" />
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Recent Searches
              </h3>
            </div>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="p-1 rounded hover:bg-white/[0.04] transition-colors"
                title="Clear history"
              >
                <Trash2 className="h-3.5 w-3.5 text-[#64748b] hover:text-red-400" />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {uniqueHistoryCities.slice(0, 5).map((city) => (
              <button
                key={city.name}
                onClick={() => onCitySelect(city.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCity === city.name
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-[#94a3b8] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent/Default Cities */}
      <div className="flex-1 overflow-hidden flex flex-col pt-2">
        <div className="px-5 py-2 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[#64748b]" />
          <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            {searchHistory.length > 0 ? "Popular Cities" : "Popular Cities"}
          </h3>
        </div>
        <CityList
          cities={cities}
          selectedCity={selectedCity}
          onSelect={onCitySelect}
          onToggleFavorite={onToggleFavorite}
        />
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-white/[0.08]">
        <UserProfile
          name={userName}
          email={userEmail}
          avatar={userAvatar}
          onLogout={onLogout}
          onSettings={onSettings}
        />
      </div>
    </div>
  );
}
