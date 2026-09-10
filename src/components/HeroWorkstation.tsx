"use client";

import React from "react";

export function HeroWorkstation() {
  return (
    <div className="relative w-full max-w-xl mx-auto flex items-center justify-center select-none">
      {/* Background ambient lighting orbs */}
      <div className="absolute -top-10 right-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating 3D Shield: HTML (Top Left) */}
      <div className="absolute -top-2 left-6 z-20 animate-bounce duration-1000" style={{ animationDuration: "4s" }}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs shadow-xl shadow-orange-500/30 border border-orange-400/40 backdrop-blur-md transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all cursor-pointer">
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-mono">
            5
          </div>
          <span className="tracking-wider">HTML</span>
        </div>
      </div>

      {/* Floating 3D Shield: CSS (Top Center/Right) */}
      <div className="absolute -top-8 right-28 z-20 animate-pulse" style={{ animationDuration: "3s" }}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-xs shadow-xl shadow-blue-500/30 border border-blue-400/40 backdrop-blur-md transform rotate-6 hover:rotate-0 hover:scale-110 transition-all cursor-pointer">
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-mono">
            3
          </div>
          <span className="tracking-wider">CSS</span>
        </div>
      </div>

      {/* Floating 3D Shield: JS (Far Right) */}
      <div className="absolute top-12 right-2 z-20 animate-bounce" style={{ animationDuration: "5s" }}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/30 border border-yellow-300/40 backdrop-blur-md transform rotate-12 hover:rotate-0 hover:scale-110 transition-all cursor-pointer">
          <span className="tracking-wider">JS</span>
        </div>
      </div>

      {/* Floating Neon Glyph: </> (Center Top) */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 animate-pulse">
        <div className="font-mono text-cyan-400 text-lg font-black tracking-widest drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] opacity-90">
          &lt;/&gt;
        </div>
      </div>

      {/* Main Coding Workstation SVG Illustration */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-b from-[#0E1630]/80 via-[#090E21]/90 to-[#060A18] border border-white/10 shadow-2xl p-4 flex items-center justify-center">
        <svg
          viewBox="0 0 540 380"
          className="w-full h-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient Room Lighting Gradient */}
            <radialGradient id="deskLampGlow" cx="480" cy="40" r="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#EA580C" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>

            {/* Screen 1 Code Glow */}
            <linearGradient id="screen1Glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Screen 2 Code Glow */}
            <linearGradient id="screen2Glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
            </linearGradient>

            {/* Neon Cyan Glow Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Room Atmosphere */}
          <rect width="540" height="380" rx="20" fill="#070C1E" />
          <circle cx="480" cy="40" r="160" fill="url(#deskLampGlow)" />

          {/* Ambient Warm Pendant Desk Lamp */}
          <line x1="480" y1="0" x2="480" y2="40" stroke="#71717A" strokeWidth="2" />
          <path d="M460 40 Q480 28 500 40 L510 52 L450 52 Z" fill="#F97316" />
          <ellipse cx="480" cy="52" rx="30" ry="6" fill="#FDE047" opacity="0.8" />

          {/* Futuristic Desk Surface */}
          <path
            d="M30 330 L510 330 L490 350 L50 350 Z"
            fill="#0F172A"
            stroke="#1E293B"
            strokeWidth="2"
          />
          <line x1="30" y1="330" x2="510" y2="330" stroke="#38BDF8" strokeWidth="2" strokeOpacity="0.5" />

          {/* Desktop Coffee Mug with </> Logo */}
          <rect x="130" y="300" width="24" height="28" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <path d="M154 306 C162 306, 162 320, 154 320" stroke="#475569" strokeWidth="2" fill="none" />
          <text x="142" y="318" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">&lt;/&gt;</text>
          {/* Steam */}
          <path d="M138 294 Q142 290 139 285" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <path d="M144 294 Q148 290 145 285" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

          {/* Mouse & Neon Mat */}
          <ellipse cx="185" cy="336" rx="20" ry="6" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1" />
          <ellipse cx="185" cy="335" rx="7" ry="4" fill="#38BDF8" opacity="0.8" />

          {/* PRIMARY MONITOR 1 (Center Left - Large Screen with IDE) */}
          <g transform="translate(140, 120)">
            {/* Monitor Stand */}
            <rect x="95" y="145" width="20" height="35" rx="3" fill="#1E293B" />
            <ellipse cx="105" cy="180" rx="35" ry="8" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />

            {/* Screen Bezel */}
            <rect x="0" y="0" width="210" height="145" rx="10" fill="#0B0F19" stroke="#38BDF8" strokeWidth="2" />
            {/* Inner Screen Display */}
            <rect x="5" y="5" width="200" height="135" rx="6" fill="url(#screen1Glow)" />

            {/* Window Top Controls */}
            <rect x="5" y="5" width="200" height="16" rx="4" fill="#1E293B" />
            <circle cx="16" cy="13" r="3" fill="#EF4444" />
            <circle cx="26" cy="13" r="3" fill="#F59E0B" />
            <circle cx="36" cy="13" r="3" fill="#10B981" />
            <text x="105" y="16" fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="middle">app/quiz/core.ts</text>

            {/* Code Lines with Syntax Coloring */}
            {/* Line 1 */}
            <rect x="15" y="32" width="30" height="4" rx="2" fill="#F472B6" />
            <rect x="50" y="32" width="55" height="4" rx="2" fill="#38BDF8" />
            <rect x="110" y="32" width="20" height="4" rx="2" fill="#FBBF24" />

            {/* Line 2 */}
            <rect x="25" y="42" width="45" height="4" rx="2" fill="#818CF8" />
            <rect x="75" y="42" width="40" height="4" rx="2" fill="#4ADE80" />

            {/* Line 3 */}
            <rect x="35" y="52" width="60" height="4" rx="2" fill="#38BDF8" />
            <rect x="100" y="52" width="30" height="4" rx="2" fill="#F472B6" />

            {/* Line 4 */}
            <rect x="25" y="62" width="50" height="4" rx="2" fill="#4ADE80" />
            <rect x="80" y="62" width="60" height="4" rx="2" fill="#FBBF24" />

            {/* Line 5 */}
            <rect x="15" y="72" width="25" height="4" rx="2" fill="#818CF8" />

            {/* Line 6 */}
            <rect x="25" y="82" width="40" height="4" rx="2" fill="#F472B6" />
            <rect x="70" y="82" width="55" height="4" rx="2" fill="#38BDF8" />

            {/* Line 7 */}
            <rect x="35" y="92" width="70" height="4" rx="2" fill="#4ADE80" />
            <rect x="110" y="92" width="25" height="4" rx="2" fill="#818CF8" />

            {/* Line 8 */}
            <rect x="25" y="102" width="35" height="4" rx="2" fill="#FBBF24" />

            {/* Line 9 */}
            <rect x="15" y="112" width="80" height="4" rx="2" fill="#38BDF8" />

            {/* Glowing active cursor */}
            <rect x="100" y="112" width="5" height="8" rx="1" fill="#38BDF8" className="animate-pulse" />
          </g>

          {/* SECONDARY MONITOR 2 (Left Angle) */}
          <g transform="translate(45, 140) rotate(8)">
            <rect x="0" y="0" width="85" height="120" rx="8" fill="#0B0F19" stroke="#818CF8" strokeWidth="1.5" />
            <rect x="4" y="4" width="77" height="112" rx="4" fill="url(#screen2Glow)" />
            {/* Code lines */}
            <rect x="10" y="15" width="25" height="3" rx="1" fill="#38BDF8" />
            <rect x="10" y="24" width="40" height="3" rx="1" fill="#F472B6" />
            <rect x="10" y="33" width="30" height="3" rx="1" fill="#4ADE80" />
            <rect x="10" y="42" width="50" height="3" rx="1" fill="#818CF8" />
            <rect x="10" y="51" width="35" height="3" rx="1" fill="#FBBF24" />
            <rect x="10" y="60" width="45" height="3" rx="1" fill="#38BDF8" />
            <rect x="10" y="69" width="20" height="3" rx="1" fill="#4ADE80" />
          </g>

          {/* DEVELOPER SILHOUETTE (Sitting from Behind with Glowing Headphones) */}
          <g transform="translate(320, 110)">
            {/* Ergonomic Gaming Chair Backrest */}
            <path
              d="M30 130 C20 180, 20 230, 10 260 L140 260 C130 230, 130 180, 120 130 Q75 110 30 130 Z"
              fill="#090E21"
              stroke="#1E293B"
              strokeWidth="2.5"
            />
            {/* Chair Headrest */}
            <rect x="40" y="75" width="70" height="45" rx="14" fill="#0B132B" stroke="#334155" strokeWidth="2" />
            {/* Chair neon accent ring */}
            <path d="M45 105 Q75 115 105 105" stroke="#38BDF8" strokeWidth="2" opacity="0.6" />

            {/* Developer Torso / Hoodie */}
            <path
              d="M35 170 C25 210, 20 240, 15 260 L135 260 C130 240, 125 210, 115 170 Q75 155 35 170 Z"
              fill="#1E293B"
            />

            {/* Neck */}
            <rect x="65" y="125" width="20" height="25" rx="6" fill="#0F172A" />

            {/* Head (Viewed from Behind) */}
            <ellipse cx="75" cy="115" rx="24" ry="28" fill="#020617" />
            {/* Stylized Dark Hair */}
            <path
              d="M51 115 C51 90, 99 90, 99 115 C95 100, 85 92, 75 92 C65 92, 55 100, 51 115 Z"
              fill="#0F172A"
            />

            {/* Glowing Over-Ear Headphones */}
            {/* Headband */}
            <path
              d="M48 112 C45 80, 105 80, 102 112"
              stroke="#38BDF8"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              filter="url(#cyanGlow)"
            />
            {/* Left Earcup */}
            <ellipse cx="48" cy="114" rx="7" ry="12" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
            {/* Right Earcup */}
            <ellipse cx="102" cy="114" rx="7" ry="12" fill="#7C3AED" stroke="#C084FC" strokeWidth="2" />

            {/* Ambient Cyan Rim Light on Developer */}
            <path
              d="M35 170 C28 200, 24 235, 18 260"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* Plant on Desk (Right corner) */}
          <g transform="translate(25, 275)">
            <path d="M5 45 L25 45 L20 25 L10 25 Z" fill="#1E293B" stroke="#334155" />
            {/* Leaves */}
            <path d="M15 25 Q5 10 0 15 Q10 22 15 25" fill="#10B981" opacity="0.8" />
            <path d="M15 25 Q15 5 22 8 Q18 18 15 25" fill="#34D399" opacity="0.9" />
            <path d="M15 25 Q28 15 30 20 Q22 24 15 25" fill="#059669" opacity="0.8" />
          </g>
        </svg>
      </div>
    </div>
  );
}
