"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Plus,
  Search,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useCityModalStore } from "@/stores/cityModalStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useWeatherStore } from "@/stores/weatherStore";
import { useAuthStore } from "@/stores/authStore";
import { apiFetch } from "@/lib/apiConfig";
import Link from "next/link";

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
  "Hong Kong",
  "Melbourne",
  "Zurich",
];

export function AddCityModal() {
  const { isOpen, closeModal } = useCityModalStore();
  const { token, isAuthenticated } = useAuthStore();
  const { favorites, fetchFavorites, addFavorite, removeFavorite, isLoading: isFavLoading } =
    useFavoritesStore();
  const { fetchAllWeather, setCity } = useWeatherStore();

  const [citySearch, setCitySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync favorites and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setCitySearch("");
      setIsDropdownOpen(false);

      if (token || isAuthenticated) {
        fetchFavorites(token || undefined);
      }

      // Auto-focus input after modal transition
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, token, isAuthenticated, fetchFavorites]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter autocomplete suggestions based on user input
  const suggestions = useMemo(() => {
    const query = citySearch.trim().toLowerCase();
    if (!query) return [];
    return POPULAR_CITIES.filter(
      (city) =>
        city.toLowerCase().includes(query) &&
        !favorites.some((f) => f.city.toLowerCase() === city.toLowerCase())
    ).slice(0, 5);
  }, [citySearch, favorites]);

  // Add / Validate city handler
  const handleAddCity = async (cityName?: string) => {
    const targetCity = (cityName || citySearch).trim();

    if (!targetCity) {
      setErrorMsg("Please enter a city name to search");
      return;
    }

    // Check duplicate in saved cities (case-insensitive)
    const isDuplicate = favorites.some(
      (f) => f.city.toLowerCase() === targetCity.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg(`"${targetCity}" is already in your saved cities`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsDropdownOpen(false);

    try {
      // Step 1: Validate existence via weather API
      const weatherRes = await apiFetch(
        `/weather/current?city=${encodeURIComponent(targetCity)}`
      );

      if (!weatherRes.ok) {
        if (weatherRes.status === 404) {
          throw new Error(
            `City "${targetCity}" not found. Please check the spelling.`
          );
        }
        if (weatherRes.status === 429) {
          throw new Error("Too many requests. Please wait a moment.");
        }
        throw new Error("Unable to validate city. Please try again later.");
      }

      const weatherData = await weatherRes.json();
      const verifiedCityName = weatherData.city || targetCity;

      // Step 2: Add to favorites
      await addFavorite(token || undefined, verifiedCityName);

      // Step 3: Success feedback
      setCitySearch("");
      setSuccessMsg(`"${verifiedCityName}" added to saved cities!`);

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMsg(null);
      }, 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add city. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select city -> close modal and load weather on dashboard
  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    fetchAllWeather(cityName, token || undefined);
    closeModal();
  };

  // Remove city from saved cities
  const handleRemoveCity = async (e: React.MouseEvent, favId: string, cityName: string) => {
    e.stopPropagation();
    try {
      await removeFavorite(token || undefined, favId);
      if (successMsg) setSuccessMsg(null);
    } catch {
      setErrorMsg(`Failed to remove "${cityName}"`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#0c0c14] border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[88vh] z-10"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 -translate-y-1/2 w-64 h-36 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-64 h-36 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Add & Manage Cities
                </h2>
                <p className="text-xs text-white/40">
                  Search, validate, and pin cities for instant dashboard access
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white flex items-center justify-center transition-colors border border-white/[0.06]"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Search & Add City Form */}
            <div ref={searchContainerRef} className="relative space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block">
                Add New City
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setIsDropdownOpen(true);
                      setErrorMsg(null);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCity();
                      }
                    }}
                    placeholder="Search city name (e.g., Paris, Tokyo, Berlin)..."
                    disabled={isSubmitting}
                    className="w-full h-11 pl-10 pr-9 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
                  />
                  {citySearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCitySearch("");
                        setErrorMsg(null);
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/70 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCity()}
                  disabled={isSubmitting || !citySearch.trim()}
                  className="px-4 h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:pointer-events-none shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add City</span>
                    </>
                  )}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {isDropdownOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#141420] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-white/30 border-b border-white/[0.04]">
                    Suggested Locations
                  </div>
                  <div className="py-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAddCity(suggestion)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                        <span className="text-[10px] text-indigo-400/80 flex items-center gap-1">
                          <Plus className="h-3 w-3" /> Add
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Feedback Banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Success Feedback Banner */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Saved Cities Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-white/70 uppercase tracking-wider">
                <span>Saved Cities</span>
                <span className="text-[11px] font-normal text-white/40 normal-case">
                  {favorites.length} {favorites.length === 1 ? "location" : "locations"}
                </span>
              </div>

              {isFavLoading && favorites.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                  <span className="text-xs text-white/40">Loading saved cities...</span>
                </div>
              ) : favorites.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.08] text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-white/30 border border-white/[0.04]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-white/80">No saved cities yet</p>
                    <p className="text-xs text-white/30 mt-1">
                      Search and add your favorite cities above for instant 1-click dashboard access.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-0.5">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      onClick={() => handleSelectCity(fav.city)}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/30 cursor-pointer transition-all shadow-sm hover:shadow-indigo-500/5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {fav.city}
                          </div>
                          <div className="text-[10px] text-white/30 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            <span>Quick Switch</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveCity(e, fav.id, fav.city)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1"
                        title={`Remove ${fav.city}`}
                        aria-label={`Remove ${fav.city}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guest notice */}
            {!isAuthenticated && (
              <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between text-xs text-indigo-300/80">
                <span>Sign in to sync your saved cities across devices.</span>
                <Link
                  href="/login"
                  onClick={closeModal}
                  className="text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Sign In</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between shrink-0">
            <div className="text-[11px] text-white/30">
              Click any city to switch dashboard view immediately.
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
