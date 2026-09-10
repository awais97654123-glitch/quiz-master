"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Plus,
  Search,
  ArrowRight,
  Code2,
  Users,
  Trophy,
  Zap,
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { HeroWorkstation } from "@/components/HeroWorkstation";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";
import { AppSplashLoader } from "@/components/AppSplashLoader";

export default function HomePage() {
  const router = useRouter();
  const [roomQuery, setRoomQuery] = useState("");

  const handleRoomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomQuery.trim().toUpperCase();
    if (clean) {
      router.push(`/join/${clean}`);
    } else {
      router.push("/join");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-200 relative transition-colors duration-250">
      {/* Minimalist Centered App Splash Loader */}
      <AppSplashLoader />

      {/* Immersive Background Image & Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Fullscreen High-Resolution White & Blue Arena Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 dark:opacity-25 mix-blend-multiply dark:mix-blend-screen scale-105 transform transition-opacity duration-250"
          style={{
            backgroundImage: "url('/hero-arena-blue.jpg')",
          }}
        />
        {/* Deep Vignette Gradient to ensure perfect text contrast in both modes */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-slate-50/90 to-blue-50/40 dark:from-[#050915]/75 dark:via-[#050915]/88 dark:to-[#030612] transition-colors duration-250" />
        {/* Top-left royal blue glow */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-600/15 dark:bg-blue-600/20 rounded-full blur-[140px]" />
        {/* Top-right cyan/sky glow */}
        <div className="absolute top-10 -right-32 w-[650px] h-[650px] bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-[150px]" />
        {/* Center blue highlight */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[180px]" />
        {/* Subtle tech grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#2563EB 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (2-Column Layout with White & Blue 3D Arena Artwork) */}
        {/* ========================================================================= */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pt-14 lg:pb-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Badges, Subtitle & CTAs */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
              
              {/* Royal Blue Badge: ⚡ Learn • Practice • Grow */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wider uppercase shadow-xs dark:shadow-[0_0_15px_rgba(37,99,235,0.25)] backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" />
                <span>Learn • Practice • Grow</span>
              </div>

              {/* Massive Bold Headline with Royal Blue & Cyan Gradient */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white transition-colors duration-250">
                Test Your Skills <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#06B6D4] drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                  Build Your Future
                </span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal transition-colors duration-250">
                Create, Join and Take Quizzes on HTML, CSS, JavaScript and more. Improve your coding skills with real-time quizzes, ranked tournaments, and live competitions.
              </p>

              {/* Two Large Action Buttons in White & Royal Blue */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                
                {/* PRIMARY: Start a Quiz (Solid Royal Blue Pill) */}
                <Link
                  href="/quiz/single/setup"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#0284C7] hover:from-[#1E40AF] hover:to-[#0369A1] text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black leading-tight">Start a Quiz</div>
                    <div className="text-[11px] text-blue-100 font-medium flex items-center gap-1">
                      <span>Test your knowledge</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* SECONDARY: Create Quiz (White Card with Royal Blue Border) */}
                <Link
                  href="/quiz/create/setup"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-blue-50/80 dark:bg-[#0E1736]/70 dark:hover:bg-[#132048]/90 text-blue-700 dark:text-cyan-300 font-bold border-2 border-blue-600 dark:border-cyan-500/40 hover:border-blue-700 dark:hover:border-cyan-400 shadow-md shadow-blue-500/10 hover:scale-[1.03] active:scale-95 backdrop-blur-md transition-all flex items-center justify-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-white/10 flex items-center justify-center shrink-0 border border-blue-200 dark:border-white/10 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 text-blue-600 dark:text-cyan-400 stroke-[3]" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black leading-tight">Create Quiz</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-300 font-medium flex items-center gap-1">
                      <span>Make your own room</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>

              </div>
            </div>

            {/* Right Column: New 3D White & Royal Blue Elite Arena Artwork */}
            <div className="lg:col-span-6 flex justify-center relative">
              
              {/* Floating Shield Badges */}
              <div className="absolute -top-4 -left-3 z-20 animate-bounce" style={{ animationDuration: "4s" }}>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-blue-700 dark:text-cyan-300 font-extrabold text-xs shadow-xl shadow-blue-500/20 border border-blue-200 dark:border-blue-500/40 backdrop-blur-md">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Season 1 Arena</span>
                </div>
              </div>

              <div className="absolute -bottom-4 right-4 z-20 animate-pulse" style={{ animationDuration: "3.5s" }}>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white font-bold text-xs shadow-xl shadow-blue-500/20 border border-blue-200 dark:border-blue-500/40 backdrop-blur-md">
                  <Code2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>HTML5 • CSS3 • JavaScript</span>
                </div>
              </div>

              {/* Main 3D Artwork Image Container */}
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl p-[2px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 shadow-2xl shadow-blue-600/25 group overflow-hidden">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                  <img
                    src="/hero-arena-blue.jpg"
                    alt="Quiz Master Elite Coding Arena"
                    className="w-full h-full object-cover object-center scale-102 group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle glossy reflection sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. DEDICATED CODE ROOM SEARCH (Matching Reference Design Pill) */}
        {/* ========================================================================= */}
        <section className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 shadow-2xl shadow-blue-500/20">
            
            {/* Outer Corner Glow Brackets */}
            <div className="absolute -left-2 -top-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg pointer-events-none" />
            <div className="absolute -right-2 -bottom-2 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg pointer-events-none" />

            <div className="rounded-[22px] bg-white/95 dark:bg-[#070D21]/95 border border-slate-200 dark:border-transparent backdrop-blur-2xl px-5 sm:px-8 py-5 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-5 transition-colors shadow-lg dark:shadow-2xl">
              
              {/* Left: </> Icon + Heading */}
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-xs dark:shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <span className="font-mono text-blue-600 dark:text-cyan-300 font-black text-xl">&lt;/&gt;</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Find a Code Room
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Search for a coding room by name or code...
                  </p>
                </div>
              </div>

              {/* Center/Right: Search Bar & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <form onSubmit={handleRoomSearch} className="relative w-full sm:w-64 md:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={roomQuery}
                    onChange={(e) => setRoomQuery(e.target.value)}
                    placeholder="e.g. A7E3B9C2"
                    className="w-full pl-9 pr-11 py-2.5 rounded-full bg-slate-100 dark:bg-[#0D1533] border border-slate-300 dark:border-slate-700/80 focus:border-blue-500 dark:focus:border-cyan-400 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all uppercase"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                    title="Search & Join Room"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </form>

                <Link
                  href="/join"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Browse Rooms</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. POPULAR COURSES SECTION (Explore Coding Curriculums) */}
        {/* ========================================================================= */}
        <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
          
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest shadow-xs">
              <span className="text-cyan-500 dark:text-cyan-400">&lt;&lt;</span>
              <span>POPULAR COURSES</span>
              <span className="text-cyan-500 dark:text-cyan-400">&gt;&gt;</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
              Explore Coding{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-300">
                Curriculums
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-normal transition-colors">
              Choose your specialization, and take targeted assessments across core web development technologies.
            </p>
          </div>

          {/* 3 Premium Dark Glass Curriculum Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
            
            {/* CARD 1: HTML5 Mastery */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-emerald-500/40 via-cyan-500/20 to-transparent shadow-xl hover:shadow-emerald-500/20 transition-all group">
              <div className="h-full rounded-[23px] bg-white/95 dark:bg-[#0A122A]/90 border border-slate-200/80 dark:border-white/5 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden transition-colors shadow-md dark:shadow-xl">
                
                {/* Background Watermark */}
                <div className="absolute top-2 right-4 text-7xl font-mono font-black text-emerald-500/5 select-none pointer-events-none group-hover:text-emerald-500/10 transition-colors">
                  &lt;/&gt;
                </div>

                <div className="space-y-4 relative z-10">
                  {/* HTML Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30">
                    5
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                      HTML5 Mastery
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      Semantic structures, accessibility, forms, media APIs, and modern HTML5 document elements.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> 35 Topics
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> 100+ Questions
                    </span>
                  </div>
                </div>

                {/* Card CTA Button */}
                <Link
                  href="/quiz/single/setup?course=html"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10"
                >
                  <span>Practice HTML</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            </div>

            {/* CARD 2: CSS3 & Layouts */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-blue-500/50 via-indigo-500/20 to-transparent shadow-xl hover:shadow-blue-500/20 transition-all group">
              <div className="h-full rounded-[23px] bg-white/95 dark:bg-[#0A122A]/90 border border-slate-200/80 dark:border-white/5 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden transition-colors shadow-md dark:shadow-xl">
                
                {/* Background Watermark */}
                <div className="absolute top-2 right-4 text-7xl font-mono font-black text-blue-500/5 select-none pointer-events-none group-hover:text-blue-500/10 transition-colors">
                  #3
                </div>

                <div className="space-y-4 relative z-10">
                  {/* CSS Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
                    3
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      CSS3 & Layouts
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      Flexbox, CSS Grid, animations, specificity, box model, responsive layouts, and modern pseudo-classes.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> 36 Topics
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> 100+ Questions
                    </span>
                  </div>
                </div>

                {/* Card CTA Button */}
                <Link
                  href="/quiz/single/setup?course=css"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10"
                >
                  <span>Practice CSS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            </div>

            {/* CARD 3: JavaScript Core */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-amber-500/50 via-yellow-500/20 to-transparent shadow-xl hover:shadow-amber-500/20 transition-all group">
              <div className="h-full rounded-[23px] bg-white/95 dark:bg-[#0A122A]/90 border border-slate-200/80 dark:border-white/5 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden transition-colors shadow-md dark:shadow-xl">
                
                {/* Background Watermark */}
                <div className="absolute top-2 right-4 text-7xl font-mono font-black text-amber-500/5 select-none pointer-events-none group-hover:text-amber-500/10 transition-colors">
                  &#123; &#125;
                </div>

                <div className="space-y-4 relative z-10">
                  {/* JS Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-amber-500/30">
                    JS
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                      JavaScript Core
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      Event loop, closures, promises, async/await, array algorithms, prototypes, and ES6+ features.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> 36 Topics
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> 100+ Questions
                    </span>
                  </div>
                </div>

                {/* Card CTA Button */}
                <Link
                  href="/quiz/single/setup?course=javascript"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#B45309] hover:to-[#D97706] text-white font-bold text-xs shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10"
                >
                  <span>Practice JS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. FEATURE STRIP (4 Columns in Sleek Glass Container) */}
        {/* ========================================================================= */}
        <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-3xl bg-white/90 dark:bg-[#080E24]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl p-6 sm:p-8 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              
              {/* Feature 1: Live Competitions */}
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(37,99,235,0.25)]">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">Live Competitions</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px]">
                  Compete with developers worldwide in real time
                </p>
              </div>

              {/* Feature 2: Real-time Feedback */}
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/15 dark:bg-cyan-600/20 border border-cyan-500/30 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">Real-time Feedback</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px]">
                  Get instant results, score breakdowns, and improve faster
                </p>
              </div>

              {/* Feature 3: Track Progress */}
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 dark:bg-emerald-600/20 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">Track Progress</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px]">
                  Monitor your syllabus accuracy and historical growth
                </p>
              </div>

              {/* Feature 4: Build Your Portfolio */}
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 dark:bg-indigo-600/20 border border-indigo-500/30 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">Build Your Portfolio</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px]">
                  Showcase your verified scores and distinctions to employers
                </p>
              </div>

            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. MOTIVATIONAL SECTION WITH NEON DIVIDER */}
        {/* ========================================================================= */}
        <section className="max-w-4xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-blue-500/40 to-blue-500" />
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm tracking-widest px-2">&lt;/&gt;</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500 via-cyan-500/40 to-transparent" />
          </div>

          <p className="text-sm sm:text-base font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400">
            Better Skills • Bigger Opportunities
          </p>
        </section>


        {/* ========================================================================= */}
        {/* 6. RESPONSIVE FOOTER */}
        {/* ========================================================================= */}
        <footer id="about" className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#040712] text-slate-600 dark:text-slate-400 pt-14 pb-10 transition-colors duration-250">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Brand Column */}
              <div className="space-y-3 md:col-span-1">
                <QuizMasterLogo size="md" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                  The premier frontend engineering assessment platform with synchronized live tournaments, deep syllabus coverage, and deterministic grading.
                </p>
              </div>

              {/* Curriculums */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Curriculums</h4>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <Link href="/quiz/single/setup?course=html" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      HTML5 Mastery
                    </Link>
                  </li>
                  <li>
                    <Link href="/quiz/single/setup?course=css" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      CSS3 & Flexbox/Grid
                    </Link>
                  </li>
                  <li>
                    <Link href="/quiz/single/setup?course=javascript" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      JavaScript Core & Async
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Platform Features */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Platform</h4>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <Link href="/quiz/single/setup" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      Single Quiz Arena
                    </Link>
                  </li>
                  <li>
                    <Link href="/quiz/create/setup" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      Create Live Room
                    </Link>
                  </li>
                  <li>
                    <Link href="/join" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      Join by PIN / QR
                    </Link>
                  </li>
                  <li>
                    <Link href="/leaderboard" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      Global Leaderboard
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social & Contact */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Community</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Join thousands of developers leveling up their frontend mastery daily.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-300 dark:border-white/10">
                    <Github className="w-4 h-4" />
                  </span>
                  <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-300 dark:border-white/10">
                    <Twitter className="w-4 h-4" />
                  </span>
                  <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-300 dark:border-white/10">
                    <Linkedin className="w-4 h-4" />
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Copyright */}
            <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <p>© {new Date().getFullYear()} Quiz Master Arena. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
                <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
                <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">System Status</Link>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
