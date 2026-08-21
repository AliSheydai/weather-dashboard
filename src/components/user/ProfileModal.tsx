"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User as UserIcon,
  Thermometer,
  MapPin,
  Check,
  Loader2,
  Trash2,
  Plus,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useProfileModalStore, ProfileTab } from "@/stores/profileModalStore";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useWeatherStore } from "@/stores/weatherStore";
import { apiFetch } from "@/lib/apiConfig";

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

export function ProfileModal() {
  const { isOpen, activeTab, closeModal, setActiveTab } = useProfileModalStore();
  const { user, token, isAuthenticated, updateProfile, fetchProfile } = useAuthStore();
  const { unit, setUnit } = useTemperatureUnit();
  const { favorites, fetchFavorites, addFavorite, removeFavorite, isLoading: isFavLoading } =
    useFavoritesStore();
  const { fetchAllWeather, setCity } = useWeatherStore();

  // Username form state
  const [username, setUsername] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Saved cities search & add state
  const [citySearch, setCitySearch] = useState("");
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [citySuccess, setCitySuccess] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync state when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (user?.name) {
        setUsername(user.name);
      } else {
        setUsername("");
      }
      setNameSuccess(false);
      setNameError(null);
      setCityError(null);
      setCitySuccess(null);
      setCitySearch("");

      if (isAuthenticated && token) {
        fetchProfile();
        fetchFavorites(token);
      }
    }
  }, [isOpen, user?.name, isAuthenticated, token, fetchProfile, fetchFavorites]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // Close city autocomplete dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter city suggestions
  const citySuggestions = useMemo(() => {
    if (!citySearch.trim()) return [];
    const query = citySearch.toLowerCase();
    return POPULAR_CITIES.filter(
      (c) =>
        c.toLowerCase().includes(query) &&
        !favorites.some((f) => f.city.toLowerCase() === c.toLowerCase())
    ).slice(0, 5);
  }, [citySearch, favorites]);

  // Username update submit
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setNameError("Username cannot be empty");
      return;
    }
    if (trimmed.length < 2) {
      setNameError("Username must be at least 2 characters");
      return;
    }
    if (trimmed.length > 50) {
      setNameError("Username cannot exceed 50 characters");
      return;
    }

    setIsSavingName(true);
    setNameError(null);
    setNameSuccess(false);

    try {
      await updateProfile({ name: trimmed });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3500);
    } catch (err: any) {
      setNameError(err.message || "Failed to update username");
    } finally {
      setIsSavingName(false);
    }
  };

  // Add new favorite city with weather API validation
  const handleAddCity = async (cityNameToAdd?: string) => {
    const targetCity = (cityNameToAdd || citySearch).trim();
    if (!targetCity) {
      setCityError("Please enter a city name");
      return;
    }

    // Check if already in favorites
    const exists = favorites.some(
      (f) => f.city.toLowerCase() === targetCity.toLowerCase()
    );
    if (exists) {
      setCityError(`"${targetCity}" is already in your saved cities`);
      return;
    }

    setIsAddingCity(true);
    setCityError(null);
    setCitySuccess(null);
    try {
      // Validate existence via weather API
      const res = await apiFetch(`/weather/current?city=${encodeURIComponent(targetCity)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`City "${targetCity}" not found. Please check the spelling.`);
        }
        throw new Error("Failed to validate city. Please try again.");
      }
      const data = await res.json();
      const verifiedCity = data.city || targetCity;

      await addFavorite(token || undefined, verifiedCity);
      setCitySearch("");
      setIsSearchOpen(false);
      setCitySuccess(`"${verifiedCity}" added to saved cities!`);
      setTimeout(() => setCitySuccess(null), 3500);
    } catch (err: any) {
      setCityError(err.message || "Failed to add city");
    } finally {
      setIsAddingCity(false);
    }
  };

  // Select city -> close modal and update dashboard
  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    fetchAllWeather(cityName, token || undefined);
    closeModal();
  };

  // Remove favorite city
  const handleRemoveCity = async (e: React.MouseEvent, favId: string) => {
    e.stopPropagation();
    try {
      await removeFavorite(token || undefined, favId);
    } catch {
      setCityError("Failed to remove city");
    }
  };

  const displayName = user?.name || "Guest User";
  const displayEmail = user?.email || "No email connected";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const isNameUnchanged = username.trim() === (user?.name || "");

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

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-[#0c0c14] border border-white/[0.08] rounded-2xl md:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-1/4 -translate-y-1/2 w-72 h-40 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-72 h-40 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 shrink-0">
                {initials}
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                  Profile Settings
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Preferences
                  </span>
                </h2>
                <p className="text-xs text-white/40 truncate max-w-xs">{displayEmail}</p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 px-6 pt-4 pb-2 border-b border-white/[0.06] bg-white/[0.01] shrink-0">
            <button
              onClick={() => setActiveTab("general")}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === "general"
                  ? "text-white bg-white/[0.08] shadow-sm"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Account</span>
              {activeTab === "general" && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute inset-0 border border-indigo-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("units")}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === "units"
                  ? "text-white bg-white/[0.08] shadow-sm"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
              }`}
            >
              <Thermometer className="h-3.5 w-3.5" />
              <span>Units (°{unit})</span>
              {activeTab === "units" && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute inset-0 border border-indigo-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("cities")}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === "cities"
                  ? "text-white bg-white/[0.08] shadow-sm"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Saved Cities ({favorites.length})</span>
              {activeTab === "cities" && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute inset-0 border border-indigo-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
            {/* TAB 1: ACCOUNT & USERNAME */}
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* User Identity Card */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-purple-500/20 shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {displayName}
                    </div>
                    <div className="text-xs text-white/40 truncate">{displayEmail}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Authenticated
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Username Form */}
                <form onSubmit={handleSaveUsername} className="space-y-4">
                  <div>
                    <label
                      htmlFor="username-input"
                      className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2"
                    >
                      Display Username
                    </label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        id="username-input"
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setNameError(null);
                          setNameSuccess(false);
                        }}
                        placeholder="Enter your name"
                        maxLength={50}
                        className="w-full h-11 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-white/30">
                      Your username is displayed across the navigation bar and personalized greetings.
                    </p>
                  </div>

                  {/* Feedback Messages */}
                  {nameSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2"
                    >
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Username updated successfully and synchronized.</span>
                    </motion.div>
                  )}

                  {nameError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{nameError}</span>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingName || isNameUnchanged || !username.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {isSavingName ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 2: TEMPERATURE UNIT SETTINGS */}
            {activeTab === "units" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    Temperature Scale Preference
                  </h3>
                  <p className="text-xs text-white/40 mb-4">
                    Choose your preferred temperature unit. All weather metrics across the dashboard will convert instantly and automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Celsius Card */}
                  <button
                    type="button"
                    onClick={() => setUnit("C")}
                    className={`relative text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      unit === "C"
                        ? "bg-gradient-to-br from-indigo-950/40 via-indigo-900/20 to-purple-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            unit === "C"
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                              : "bg-white/[0.06] text-white/60"
                          }`}
                        >
                          °C
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Celsius</div>
                          <span className="text-[10px] text-indigo-400 font-medium">
                            Metric System
                          </span>
                        </div>
                      </div>

                      {unit === "C" && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-white/50 leading-relaxed">
                      Standard temperature unit used internationally in science and by most countries worldwide.
                    </p>
                  </button>

                  {/* Fahrenheit Card */}
                  <button
                    type="button"
                    onClick={() => setUnit("F")}
                    className={`relative text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      unit === "F"
                        ? "bg-gradient-to-br from-indigo-950/40 via-indigo-900/20 to-purple-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            unit === "F"
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                              : "bg-white/[0.06] text-white/60"
                          }`}
                        >
                          °F
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Fahrenheit</div>
                          <span className="text-[10px] text-indigo-400 font-medium">
                            Imperial System
                          </span>
                        </div>
                      </div>

                      {unit === "F" && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-white/50 leading-relaxed">
                      Commonly used in the United States, Bahamas, Cayman Islands, and Liberia.
                    </p>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 mt-4">
                  <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                  <p className="text-xs text-white/50">
                    Switching temperature units converts current temperature, high/low, feels-like, and forecasts seamlessly.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SAVED CITIES MANAGEMENT */}
            {activeTab === "cities" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    Manage Saved Cities
                  </h3>
                  <p className="text-xs text-white/40 mb-3">
                    Search and pin your favorite cities for quick navigation. Click any city to load its real-time weather.
                  </p>
                </div>

                {/* Add City Search Bar */}
                <div ref={searchContainerRef} className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={citySearch}
                        onChange={(e) => {
                          setCitySearch(e.target.value);
                          setIsSearchOpen(true);
                          setCityError(null);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCity();
                          }
                        }}
                        placeholder="Search city to add (e.g. Paris, Tokyo)..."
                        className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCity()}
                      disabled={isAddingCity || !citySearch.trim()}
                      className="px-4 h-10 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:pointer-events-none shrink-0"
                    >
                      {isAddingCity ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Autocomplete suggestions dropdown */}
                  {isSearchOpen && citySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#141420] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-20">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-white/30 border-b border-white/[0.04]">
                        Suggested Cities
                      </div>
                      <div className="py-1">
                        {citySuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              handleAddCity(suggestion);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                              <span>{suggestion}</span>
                            </div>
                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                              <Plus className="h-3 w-3" /> Add
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {cityError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{cityError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {citySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{citySuccess}</span>
                  </div>
                )}

                {/* Saved Cities List */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider flex items-center justify-between">
                    <span>Saved Locations</span>
                    <span>{favorites.length} pinned</span>
                  </div>

                  {isFavLoading && favorites.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                      <span className="text-xs text-white/40">Loading saved cities...</span>
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.08] text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/30">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">No saved cities yet</p>
                        <p className="text-xs text-white/30 mt-0.5">
                          Search and add your favorite cities above for instant 1-click access.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {favorites.map((fav) => (
                        <div
                          key={fav.id}
                          onClick={() => handleSelectCity(fav.city)}
                          className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/30 cursor-pointer transition-all"
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
                            onClick={(e) => handleRemoveCity(e, fav.id)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Remove from saved"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between shrink-0">
            <div className="text-[11px] text-white/30">
              Changes sync automatically across devices.
            </div>
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
