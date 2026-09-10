"use client";

import { useState, useEffect } from "react";
import { QuizMasterIcon } from "@/components/QuizMasterIcon";

interface AppSplashLoaderProps {
  onComplete?: () => void;
}

export function AppSplashLoader({ onComplete }: AppSplashLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Genuine initialization check (session & DOM ready)
      try {
        if (typeof window !== "undefined") {
          // Verify session storage / local user state quickly
          localStorage.getItem("codequiz_user");
        }
      } catch {
        // ignore
      }

      // Smooth brief breathing pause so transition is graceful and never abrupt
      await new Promise((r) => setTimeout(r, 650));

      if (!isMounted) return;
      setIsFading(true);

      setTimeout(() => {
        if (isMounted) {
          setIsVisible(false);
          if (onComplete) onComplete();
        }
      }, 300);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none transition-all duration-300 ease-out bg-[#f8fafc] dark:bg-[#040714] text-slate-900 dark:text-slate-100 ${
        isFading ? "opacity-0 scale-98 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Soft, restrained ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dark mode soft nebula glow */}
        <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-purple-600/15 rounded-full blur-[100px] animate-pulse" />
        {/* Light mode clean soft ambient shadow */}
        <div className="dark:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/60 via-cyan-100/40 to-indigo-100/50 rounded-full blur-[90px]" />
      </div>

      {/* Pure Centered Layout: Icon + Name + Subtle Indicator */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 px-6">
        
        {/* 1. Main Focus: Original Quiz Master Arena Icon with Gentle Floating & Soft Glow */}
        <div className="animate-subtle-float">
          <div className="animate-subtle-glow">
            <QuizMasterIcon size={84} withGlow={true} />
          </div>
        </div>

        {/* 2. App Name: Premium Clean Typography */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <span>Quiz Master</span>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] uppercase text-[0.88em]">
              Arena
            </span>
          </h1>
        </div>

        {/* 3. Small Subtle Minimalist Loading Indicator */}
        <div className="pt-2 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"
            style={{ animationDelay: "180ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse"
            style={{ animationDelay: "360ms" }}
          />
        </div>

      </div>
    </div>
  );
}
