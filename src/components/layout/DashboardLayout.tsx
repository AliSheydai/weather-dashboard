"use client";

import { ReactNode } from "react";

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
  return (
    <div className="flex h-screen bg-[#08080f] overflow-hidden">
      {/* Sidebar — always rendered; SidebarProvider inside handles mobile Sheet vs desktop panel */}
      {sidebar}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="shrink-0 flex items-center">
          <div className="flex-1">{header}</div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto lg:overflow-hidden p-3 sm:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
