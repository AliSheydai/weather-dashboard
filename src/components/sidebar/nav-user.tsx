"use client"

import {
  User,
  Settings,
  Thermometer,
  LogOut,
  ChevronsUpDown,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { useAuthStore } from "@/stores/authStore"
import { useNotificationStore } from "@/stores/notificationStore"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { motion } from "framer-motion"
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { unit, setUnit } = useTemperatureUnit()
  const resetNotifications = useNotificationStore((s) => s.reset)

  const displayName = user?.name || "Guest"
  const displayEmail = user?.email || "Sign in to sync your data"
  const avatarUrl = (user as any)?.avatar || ""

  const handleLogout = () => {
    resetNotifications()
    logout()
    router.push("/login")
  }

  const handleUnitToggle = (newUnit: "C" | "F", e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUnit(newUnit)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" />}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs">{displayEmail}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="rounded-lg">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">{displayEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {isAuthenticated ? (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="size-4 text-muted-foreground" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  {/* Temperature Unit Switcher */}
                  <div
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-accent/40 select-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2.5 text-sidebar-foreground">
                      <Thermometer className="size-4 text-indigo-400" />
                      <span className="text-xs font-medium">Temperature</span>
                    </div>

                    {/* Segmented Toggle Control */}
                    <div className="relative flex items-center bg-white/[0.06] border border-white/[0.08] p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={(e) => handleUnitToggle("C", e)}
                        className={`relative z-10 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                          unit === "C"
                            ? "text-white font-semibold"
                            : "text-white/40 hover:text-white/80"
                        }`}
                      >
                        {unit === "C" && (
                          <motion.div
                            layoutId="activeUnitPill"
                            className="absolute inset-0 bg-indigo-600 rounded-md shadow-sm shadow-indigo-500/20"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative z-10">°C</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleUnitToggle("F", e)}
                        className={`relative z-10 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                          unit === "F"
                            ? "text-white font-semibold"
                            : "text-white/40 hover:text-white/80"
                        }`}
                      >
                        {unit === "F" && (
                          <motion.div
                            layoutId="activeUnitPill"
                            className="absolute inset-0 bg-indigo-600 rounded-md shadow-sm shadow-indigo-500/20"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative z-10">°F</span>
                      </button>
                    </div>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4 text-red-400" />
                  <span className="text-red-400">Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => router.push("/login")}>
                <User className="size-4" />
                <span>Sign in</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
