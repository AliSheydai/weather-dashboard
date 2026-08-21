import { User, LogOut, Settings, ChevronDown, Thermometer } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { motion } from "framer-motion";

interface UserProfileProps {
  name: string;
  email: string;
  avatar?: string | null;
  onLogout?: () => void;
  onSettings?: () => void;
}

export function UserProfile({
  name,
  email,
  avatar,
  onLogout,
  onSettings,
}: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { unit, setUnit } = useTemperatureUnit();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-white truncate">{name}</div>
          <div className="text-xs text-[#64748b] truncate">{email}</div>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-[#64748b] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#09090d] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl p-1.5 space-y-1">
          <button
            onClick={() => {
              onSettings?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          {/* Temperature Unit Switcher */}
          <div
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:bg-white/[0.04] select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <Thermometer className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-medium text-white/80">Unit</span>
            </div>

            <div className="relative flex items-center bg-white/[0.06] border border-white/[0.08] p-0.5 rounded-lg">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnit("C");
                }}
                className={`relative z-10 px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
                  unit === "C"
                    ? "text-white font-semibold"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {unit === "C" && (
                  <motion.div
                    layoutId="activeUserPill"
                    className="absolute inset-0 bg-indigo-600 rounded-md shadow-sm"
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
                onClick={(e) => {
                  e.stopPropagation();
                  setUnit("F");
                }}
                className={`relative z-10 px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
                  unit === "F"
                    ? "text-white font-semibold"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {unit === "F" && (
                  <motion.div
                    layoutId="activeUserPill"
                    className="absolute inset-0 bg-indigo-600 rounded-md shadow-sm"
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

          <div className="h-px bg-white/[0.06]" />

          <button
            onClick={() => {
              onLogout?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
