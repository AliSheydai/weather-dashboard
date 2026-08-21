"use client";

import { SearchCity } from "./SearchCity";
import { CityList } from "./CityList";
import { UserProfile } from "../user/UserProfile";
import { MapPin, Star, Settings, Pencil } from "lucide-react";
import Link from "next/link";

import { useProfileModalStore } from "@/stores/profileModalStore";

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
  isAuthenticated?: boolean;
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
  isAuthenticated = false,
  userName = "User",
  userEmail = "user@example.com",
  userAvatar,
  onLogout,
  onSettings,
}: WeatherSidebarProps) {
  const { openModal: openProfileModal } = useProfileModalStore();
  const defaultCities: CityData[] = [
    { name: "New York", temperature: 22, condition: "Cloudy", high: 29, low: 15 },
    { name: "London", temperature: 18, condition: "Rainy", high: 21, low: 12 },
    { name: "Tokyo", temperature: 28, condition: "Clear", high: 32, low: 24 },
    { name: "Paris", temperature: 20, condition: "Sunny", high: 25, low: 16 },
    { name: "Berlin", temperature: 19, condition: "Cloudy", high: 23, low: 14 },
  ];

  const cities = recentCities.length > 0 ? recentCities : defaultCities;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Weather</h1>
            <p className="text-[9px] text-white/25 uppercase tracking-[0.15em]">
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchCity
        onSearch={onSearch}
        onCitySelect={onCitySelect}
        isLoading={isLoading}
        searchHistory={searchHistory}
      />

      {/* Favorites Section */}
      {favoriteCities.length > 0 && (
        <div className="px-2 pt-1">
          <div className="px-3 py-1.5 flex items-center gap-2">
            <Star className="h-3 w-3 text-amber-400/60" />
            <h3 className="text-[10px] font-medium text-white/25 uppercase tracking-widest">
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

      {/* Popular Cities */}
      <div className="flex-1 overflow-hidden flex flex-col pt-1">
        <div className="px-5 py-1.5 flex items-center gap-2">
          <h3 className="text-[10px] font-medium text-white/25 uppercase tracking-widest">
            Cities
          </h3>
        </div>
        <CityList
          cities={cities}
          selectedCity={selectedCity}
          onSelect={onCitySelect}
          onToggleFavorite={onToggleFavorite}
        />
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (onSettings) onSettings();
              else openProfileModal("cities");
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Edit</span>
          </button>
          <div className="w-px h-4 bg-white/[0.06]" />
          <button
            onClick={() => {
              if (onSettings) onSettings();
              else openProfileModal("general");
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

