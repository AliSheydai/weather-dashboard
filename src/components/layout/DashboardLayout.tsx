"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({
  sidebar,
  header,
  children,
}: DashboardLayoutProps) {
  const { isOpen, toggle } = useSidebarStore();
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-[#08080f] overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="hidden lg:flex flex-col shrink-0">
          {sidebar}
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebar}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header with mobile menu toggle */}
        <header className="shrink-0 flex items-center">
          {isMobile && (
            <button
              onClick={toggle}
              className="p-2 ml-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1">{header}</div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-hidden p-3 sm:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
