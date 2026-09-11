import React from "react";

export default function TopicsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B]">
      <div className="bg-[#0B132B] py-14 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="w-24 h-4 rounded-md animate-shimmer" />
          <div className="w-64 h-10 rounded-xl animate-shimmer" />
          <div className="w-full max-w-md h-5 rounded-md animate-shimmer" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="w-40 h-6 rounded-lg animate-shimmer" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-2"
                >
                  <div className="w-28 h-5 rounded-md animate-shimmer" />
                  <div className="w-full h-8 rounded-md animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
