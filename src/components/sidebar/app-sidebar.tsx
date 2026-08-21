"use client";

import * as React from "react";
import {
  CloudSun,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Compass,
  Map,
  BarChart3,
  Plus,
  LocateFixed,
  RefreshCw,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Flame,
  Thermometer,
  CloudDrizzle,
  Leaf,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { NavUser } from "@/components/sidebar/nav-user";
import { useWeatherStore } from "@/stores/weatherStore";
import { useCityModalStore } from "@/stores/cityModalStore";
import { useAuthStore } from "@/stores/authStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiConfig";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, isActive: true, link: "/dashboard" },
  // { title: "Browse", icon: Compass, link: "/browse" },
  // { title: "Map", icon: Map, link: "/map" },
  // { title: "Metrics", icon: BarChart3, link: "/metrics" },
];

const collections = [
  { name: "Summer Destinations", icon: Sun },
  { name: "Rainy Places", icon: CloudRain },
  { name: "Snow Cities", icon: Snowflake },
  { name: "Windy Spots", icon: Wind },
];

const exploreItems = [
  { label: "Hottest City", icon: Flame, city: "Dubai", value: "48°C" },
  { label: "Coldest City", icon: Thermometer, city: "Yakutsk", value: "-38°C" },
  {
    label: "Rainiest City",
    icon: CloudDrizzle,
    city: "Mawsynram",
    value: "11,871mm",
  },
  { label: "Best Air Quality", icon: Leaf, city: "Zurich", value: "AQI 12" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open, toggleSidebar } = useSidebar();
  const [activeNav, setActiveNav] = React.useState("Dashboard");
  const weather = useWeatherStore((s) => s.current);
  const selectedCity = useWeatherStore((s) => s.selectedCity);
  const fetchAllWeather = useWeatherStore((s) => s.fetchAllWeather);
  const isStoreLoading = useWeatherStore((s) => s.isLoading);
  const openCityModal = useCityModalStore((s) => s.openModal);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);
  const { unit, convert } = useTemperatureUnit();

  const [refreshState, setRefreshState] = React.useState<"idle" | "refreshing" | "success" | "error">("idle");
  const [refreshError, setRefreshError] = React.useState<string | null>(null);

  const isRefreshing = refreshState === "refreshing" || isStoreLoading;

  // --- Use Current Location state machine ---
  type LocationState = "idle" | "requesting" | "detecting" | "fetching" | "success" | "error";
  const [locationState, setLocationState] = React.useState<LocationState>("idle");
  const [locationError, setLocationError] = React.useState<string | null>(null);

  const isLocating = locationState === "requesting" || locationState === "detecting" || locationState === "fetching";

  const handleUseCurrentLocation = React.useCallback(async () => {
    if (isLocating) return;

    if (!navigator.geolocation) {
      setLocationState("error");
      setLocationError("Geolocation is not supported by your browser");
      setTimeout(() => { setLocationState("idle"); setLocationError(null); }, 3000);
      return;
    }

    setLocationState("requesting");
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Step 1: Reverse-geocode via backend (or Next.js API route if remote backend not yet redeployed)
          setLocationState("detecting");
          const { latitude, longitude } = pos.coords;
          let geocodeRes = await apiFetch(
            `/weather/geocode?lat=${latitude}&lon=${longitude}`
          );

          if (!geocodeRes.ok && geocodeRes.status === 404) {
            geocodeRes = await fetch(
              `/api/weather/geocode?lat=${latitude}&lon=${longitude}`
            );
          }

          if (!geocodeRes.ok) {
            const msg = geocodeRes.status === 404
              ? "Could not identify your city from coordinates"
              : "Location detection failed. Please try again.";
            setLocationState("error");
            setLocationError(msg);
            setTimeout(() => { setLocationState("idle"); setLocationError(null); }, 3000);
            return;
          }

          const { city } = await geocodeRes.json() as { city: string };

          // Step 2: Fetch weather for the resolved city — identical to a manual search
          setLocationState("fetching");
          await fetchAllWeather(city, token || undefined);

          const storeError = useWeatherStore.getState().error;
          if (storeError) {
            setLocationState("error");
            setLocationError(storeError);
            setTimeout(() => { setLocationState("idle"); setLocationError(null); }, 3000);
            return;
          }

          // Refresh history for authenticated users
          if (isAuthenticated && token) {
            fetchHistory(token);
          }

          setLocationState("success");
          setTimeout(() => { setLocationState("idle"); }, 2000);
        } catch {
          setLocationState("error");
          setLocationError("Failed to fetch location data. Please try again.");
          setTimeout(() => { setLocationState("idle"); setLocationError(null); }, 3000);
        }
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please allow access in your browser settings."
            : err.code === err.POSITION_UNAVAILABLE
            ? "Your device location is currently unavailable."
            : "Location request timed out. Please try again.";
        setLocationState("error");
        setLocationError(msg);
        setTimeout(() => { setLocationState("idle"); setLocationError(null); }, 3000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isLocating, fetchAllWeather, token, isAuthenticated, fetchHistory]);

  const handleRefresh = React.useCallback(async () => {
    if (isRefreshing) return;

    const cityToFetch = selectedCity || weather?.city || "New York";
    setRefreshState("refreshing");
    setRefreshError(null);

    try {
      await fetchAllWeather(cityToFetch, token || undefined);
      const currentError = useWeatherStore.getState().error;
      if (currentError) {
        setRefreshState("error");
        setRefreshError(currentError);
        setTimeout(() => {
          setRefreshState("idle");
          setRefreshError(null);
        }, 3000);
      } else {
        if (isAuthenticated && token) {
          fetchHistory(token);
        }
        setRefreshState("success");
        setTimeout(() => {
          setRefreshState("idle");
        }, 2000);
      }
    } catch (err: unknown) {
      setRefreshState("error");
      setRefreshError(err instanceof Error ? err.message : "Failed to refresh weather");
      setTimeout(() => {
        setRefreshState("idle");
        setRefreshError(null);
      }, 3000);
    }
  }, [isRefreshing, selectedCity, weather?.city, fetchAllWeather, token, isAuthenticated, fetchHistory]);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Brand Section */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              {open && (
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <CloudSun className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Weather</span>
                  </div>
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className="ml-auto size-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                {open ? (
                  <PanelLeftClose className="size-4" />
                ) : (
                  <PanelLeftOpen className="size-4" />
                )}
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.link}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={activeNav === item.title}
                    onClick={() => setActiveNav(item.title)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Add City" onClick={openCityModal}>
                <Plus />
                <span>Add City</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={
                  locationState === "requesting"
                    ? "Requesting location permission…"
                    : locationState === "detecting"
                    ? "Detecting your city…"
                    : locationState === "fetching"
                    ? "Fetching weather for your location…"
                    : locationState === "success"
                    ? "Location found!"
                    : locationState === "error"
                    ? locationError || "Location detection failed"
                    : "Use Current Location"
                }
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                aria-label="Use Current Location"
                aria-busy={isLocating}
                className={cn(
                  "transition-all duration-200",
                  locationState === "success" && "text-emerald-400 hover:text-emerald-300",
                  locationState === "error" && "text-rose-400 hover:text-rose-300",
                  isLocating && "opacity-80 cursor-not-allowed"
                )}
              >
                {locationState === "success" ? (
                  <Check className="size-4 text-emerald-400 animate-in fade-in zoom-in duration-200" />
                ) : locationState === "error" ? (
                  <AlertCircle className="size-4 text-rose-400 animate-in fade-in zoom-in duration-200" />
                ) : locationState === "detecting" || locationState === "fetching" ? (
                  <Loader2 className="size-4 animate-spin text-indigo-400" />
                ) : locationState === "requesting" ? (
                  <LocateFixed className="size-4 animate-pulse text-indigo-400" />
                ) : (
                  <LocateFixed className="size-4" />
                )}
                <span>
                  {locationState === "requesting"
                    ? "Requesting…"
                    : locationState === "detecting"
                    ? "Detecting…"
                    : locationState === "fetching"
                    ? "Fetching…"
                    : locationState === "success"
                    ? "Located!"
                    : locationState === "error"
                    ? "Failed"
                    : "Use Current Location"}
                </span>
                {locationState === "success" && (
                  <span className="ml-auto text-[10px] font-medium text-emerald-400/90 group-data-[collapsible=icon]:hidden animate-in fade-in duration-200">
                    Done
                  </span>
                )}
                {locationState === "error" && (
                  <span className="ml-auto text-[10px] font-medium text-rose-400/90 group-data-[collapsible=icon]:hidden animate-in fade-in duration-200">
                    Retry
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={
                  refreshState === "refreshing"
                    ? "Refreshing weather..."
                    : refreshState === "success"
                      ? "Weather updated!"
                      : refreshState === "error"
                        ? refreshError || "Failed to refresh"
                        : "Refresh Weather"
                }
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh Weather"
                aria-busy={isRefreshing}
                className={cn(
                  "transition-all duration-200",
                  refreshState === "success" && "text-emerald-400 hover:text-emerald-300",
                  refreshState === "error" && "text-rose-400 hover:text-rose-300",
                  isRefreshing && "opacity-80 cursor-not-allowed"
                )}
              >
                {refreshState === "success" ? (
                  <Check className="size-4 text-emerald-400 animate-in fade-in zoom-in duration-200" />
                ) : refreshState === "error" ? (
                  <AlertCircle className="size-4 text-rose-400 animate-in fade-in zoom-in duration-200" />
                ) : (
                  <RefreshCw
                    className={cn(
                      "size-4 transition-transform duration-300",
                      isRefreshing && "animate-spin text-indigo-400"
                    )}
                  />
                )}
                <span>
                  {refreshState === "refreshing"
                    ? "Refreshing..."
                    : refreshState === "success"
                      ? "Updated!"
                      : refreshState === "error"
                        ? "Failed"
                        : "Refresh Weather"}
                </span>
                {refreshState === "success" && (
                  <span className="ml-auto text-[10px] font-medium text-emerald-400/90 group-data-[collapsible=icon]:hidden animate-in fade-in duration-200">
                    Done
                  </span>
                )}
                {refreshState === "error" && (
                  <span className="ml-auto text-[10px] font-medium text-rose-400/90 group-data-[collapsible=icon]:hidden animate-in fade-in duration-200">
                    Retry
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Collections */}
        {/* <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarMenu>
            {collections.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton tooltip={item.name}>
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup> */}

        {/* Explore */}
        {/* <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarMenu>
            {exploreItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={`${item.city} ${item.value}`}>
                  <item.icon />
                  <span className="flex-1">{item.city}</span>
                  <span className="text-xs text-sidebar-foreground/60">
                    {item.value}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup> */}

        {/* Live Weather Widget */}
        {weather && (
          <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
            <div className="rounded-xl border border-sidebar-border/50 bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/20 p-3">
              <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mb-2">
                Now in {weather.city}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {convert(weather.temperature)}°
                </span>
                <span className="text-xs text-sidebar-foreground/60">{unit}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-sidebar-foreground/50">
                <span>AQI {weather.aqi}</span>
                <span>·</span>
                <span>{weather.condition}</span>
              </div>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* User Section */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
