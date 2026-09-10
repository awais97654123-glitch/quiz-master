"use client";

import React from "react";

interface QuizMasterIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
  withGlow?: boolean;
}

export function QuizMasterIcon({
  className = "",
  size = "md",
  withGlow = true,
}: QuizMasterIconProps) {
  const pixelSize = typeof size === "number" ? size : {
    xs: 18,
    sm: 24,
    md: 36,
    lg: 48,
    xl: 72,
    "2xl": 96,
  }[size];

  const id = React.useId().replace(/:/g, "");

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Soft ambient glow behind the icon */}
      {withGlow && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-purple-600/40 blur-md pointer-events-none opacity-80"
          style={{ transform: "scale(0.9)" }}
        />
      )}

      {/* Scalable SVG Vector */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_10px_rgba(56,189,248,0.35)]"
      >
        <defs>
          {/* Main Electric Cyan to Violet Gradient */}
          <linearGradient id={`brandGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          {/* Core Accent Gradient for Lightning & Quiz Glyph */}
          <linearGradient id={`lightningGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Dark Metallic Inner Background */}
          <linearGradient id={`bgGrad-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Subtle Cyber Rim Glow */}
          <radialGradient id={`glowGrad-${id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Hexagonal Shield Crest */}
        <path
          d="M50 4 
             L88 24 
             L88 66 
             L50 94 
             L12 66 
             L12 24 
             Z"
          fill={`url(#bgGrad-${id})`}
          stroke={`url(#brandGrad-${id})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Subtle Inner Glow Layer */}
        <path
          d="M50 8 
             L84 26 
             L84 64 
             L50 89 
             L16 64 
             L16 26 
             Z"
          fill={`url(#glowGrad-${id})`}
        />

        {/* Secondary Inner Geometric Accent Line */}
        <path
          d="M50 14 
             L79 30 
             L79 61 
             L50 83 
             L21 61 
             L21 30 
             Z"
          stroke={`url(#brandGrad-${id})`}
          strokeWidth="1"
          strokeDasharray="4 3"
          strokeOpacity="0.45"
        />

        {/* ========================================================================= */}
        {/* HERO GLYPH: Stylized Question Mark fused with Speed/Lightning Bolt */}
        {/* ========================================================================= */}
        
        {/* Top Question Arc / Speed Sweep */}
        <path
          d="M34 38 
             C34 27, 41 21, 51 21 
             C61 21, 68 28, 68 37 
             C68 45, 62 50, 56 54 
             L46 61 
             L58 61 
             L42 75 
             L46 64 
             L38 64 
             L50 51 
             C56 47, 60 43, 60 37 
             C60 32, 56 28, 51 28 
             C45 28, 41 32, 41 38 
             Z"
          fill={`url(#lightningGrad-${id})`}
        />

        {/* Precision Question Dot / Energy Diamond */}
        <path
          d="M50 78 
             L55 83 
             L50 88 
             L45 83 
             Z"
          fill={`url(#lightningGrad-${id})`}
        />

        {/* Diagonal Speed Slash Accent */}
        <path
          d="M32 46 L38 52"
          stroke="#38BDF8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M62 46 L68 52"
          stroke="#C084FC"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
      </svg>
    </div>
  );
}
