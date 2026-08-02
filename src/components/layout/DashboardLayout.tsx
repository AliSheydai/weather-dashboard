"use client";

import { ReactNode } from "react";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({ sidebar, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-80 border-r border-border bg-card flex flex-col">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
