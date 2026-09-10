"use client";

import React from "react";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  activePath?: string;
  className?: string;
}

export function DashboardShell({
  children,
  activePath,
  className = "",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Left Dark Sidebar */}
      <AppSidebar activePath={activePath} />

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 overflow-y-auto px-4 sm:px-8 py-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}
