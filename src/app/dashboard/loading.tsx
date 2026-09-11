import React from "react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="w-48 h-8 rounded-xl animate-shimmer" />
          <div className="w-64 h-4 rounded-md animate-shimmer" />
        </div>
        <div className="w-32 h-10 rounded-xl animate-shimmer" />
      </div>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <div className="w-8 h-8 rounded-lg animate-shimmer" />
            <div className="w-20 h-4 rounded-md animate-shimmer" />
            <div className="w-16 h-8 rounded-lg animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Chart & History Skeleton */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="w-40 h-6 rounded-lg animate-shimmer" />
          <div className="w-full h-64 rounded-xl animate-shimmer" />
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="w-36 h-6 rounded-lg animate-shimmer" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/50 h-14 animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
