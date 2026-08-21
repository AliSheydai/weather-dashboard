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
} from "lucide-react";

import { NavUser } from "@/components/sidebar/nav-user";
import { useWeatherStore } from "@/stores/weatherStore";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
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
  { title: "Browse", icon: Compass, link: "/browse" },
  { title: "Map", icon: Map, link: "/map" },
  { title: "Metrics", icon: BarChart3, link: "/metrics" },
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
  const { unit, convert } = useTemperatureUnit();

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
              <SidebarMenuButton tooltip="Add City">
                <Plus />
                <span>Add City</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Use Current Location">
                <LocateFixed />
                <span>Use Current Location</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Refresh Weather">
                <RefreshCw />
                <span>Refresh Weather</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Collections */}
        <SidebarGroup>
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
        </SidebarGroup>

        {/* Explore */}
        <SidebarGroup>
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
        </SidebarGroup>

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
