import React from "react";

export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B]">
      {/* Header Skeleton */}
      <div className="bg-[#0B132B] py-14 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="w-28 h-4 rounded-md animate-shimmer" />
          <div className="w-80 h-10 rounded-xl animate-shimmer" />
          <div className="w-full max-w-xl h-5 rounded-md animate-shimmer" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-5 rounded-full animate-shimmer" />
                <div className="w-16 h-4 rounded-md animate-shimmer" />
              </div>
              <div className="w-44 h-6 rounded-lg animate-shimmer" />
              <div className="w-full h-12 rounded-lg animate-shimmer" />
              <div className="pt-3 border-t border-border/50 flex gap-2">
                <div className="flex-1 h-9 rounded-xl animate-shimmer" />
                <div className="flex-1 h-9 rounded-xl animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
