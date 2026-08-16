"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface SidebarShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

export function SidebarShell({ children, header }: SidebarShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
      className="h-screen overflow-hidden bg-[#08080f]"
    >
      {/* Sidebar — on mobile renders as Sheet overlay, on desktop as fixed panel */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header — contains SidebarTrigger for mobile */}
        <header className="shrink-0">{header}</header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto lg:overflow-hidden p-3 sm:p-4 min-h-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
