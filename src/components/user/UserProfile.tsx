"use client";

import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";

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

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
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
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a2e] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
          <button
            onClick={() => {
              onSettings?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#94a3b8] hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => {
              onLogout?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
