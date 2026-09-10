"use client";

import { useApiLoading } from "@/lib/loading-context";
import { Loader2 } from "lucide-react";
import { QuizMasterIcon } from "@/components/QuizMasterIcon";

export function GlobalLoadingOverlay() {
  const { isLoading, message } = useApiLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between">
      {/* Top subtle progress line */}
      <div className="w-full h-1 bg-cyan-900/20 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600 animate-pulse w-full shadow-[0_0_10px_rgba(56,189,248,0.7)]" />
      </div>

      {/* Floating Center-Bottom Status Badge */}
      <div className="self-center mb-8 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 dark:bg-[#060b1e]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_25px_rgba(6,182,212,0.2)] text-slate-800 dark:text-slate-100 text-xs font-medium animate-in fade-in zoom-in-95 duration-150">
          <QuizMasterIcon size={18} withGlow={false} />
          <Loader2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 animate-spin" />
          <span>{message || "Loading..."}</span>
        </div>
      </div>
    </div>
  );
}
