import React from "react";

export default function PracticeLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B]">
      <div className="bg-[#0B132B] py-14 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="w-24 h-4 rounded-md animate-shimmer" />
          <div className="w-72 h-10 rounded-xl animate-shimmer" />
          <div className="w-full max-w-lg h-5 rounded-md animate-shimmer" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4"
            >
              <div className="w-20 h-5 rounded-full animate-shimmer" />
              <div className="w-36 h-6 rounded-lg animate-shimmer" />
              <div className="w-full h-12 rounded-lg animate-shimmer" />
              <div className="w-full h-10 rounded-xl animate-shimmer mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
