"use client";

import React from "react";
import { QuizMasterIcon } from "@/components/QuizMasterIcon";

interface QuizMasterLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "auto" | "light" | "dark" | "blue";
  showText?: boolean;
}

export function QuizMasterLogo({
  className = "",
  size = "md",
  variant = "auto",
  showText = true,
}: QuizMasterLogoProps) {
  const iconSize = {
    xs: "xs" as const,
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
    xl: "xl" as const,
  }[size];

  const textStyles = {
    xs: "text-xs gap-1",
    sm: "text-sm gap-1.5",
    md: "text-base sm:text-lg gap-2",
    lg: "text-xl sm:text-2xl gap-2.5",
    xl: "text-3xl gap-3",
  }[size];

  const textColor = {
    auto: "text-slate-900 dark:text-white",
    light: "text-white",
    dark: "text-slate-900",
    blue: "text-blue-600",
  }[variant];

  return (
    <div className={`inline-flex items-center select-none font-sans group ${className}`}>
      {/* Brand Icon */}
      <QuizMasterIcon size={iconSize} withGlow={true} />

      {showText && (
        <div className={`flex items-center ml-2.5 ${textStyles}`}>
          <span className={`font-extrabold tracking-tight ${textColor} transition-colors`}>
            Quiz Master
          </span>
          <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] drop-shadow-[0_0_12px_rgba(56,189,248,0.35)] uppercase text-[0.85em]">
            Arena
          </span>
        </div>
      )}
    </div>
  );
}
