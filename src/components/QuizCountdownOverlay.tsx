"use client";

import React, { useState, useEffect } from "react";
import { Zap, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { QuizMasterIcon } from "@/components/QuizMasterIcon";

interface QuizCountdownOverlayProps {
  quizTitle?: string;
  courseTitle?: string;
  questionCount?: number;
  onComplete: () => void;
}

export function QuizCountdownOverlay({
  quizTitle,
  courseTitle,
  questionCount,
  onComplete,
}: QuizCountdownOverlayProps) {
  // Stages: 3 -> 2 -> 1 -> 0 ("GO!") -> finished
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Play subtle futuristic countdown tone via Web Audio API (graceful fallback if muted)
  const playSound = (stage: number) => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (stage === 0) {
        // "GO!" tone: uplifting high pitch double chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // 3, 2, 1 countdown pips
        const frequencies = [0, 659.25, 554.37, 440]; // 1=E5, 2=C#5, 3=A4
        const freq = frequencies[stage] || 440;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Ignore if autoplay audio context policy prevents tone
    }
  };

  useEffect(() => {
    // Initial sound on mount (step 3)
    playSound(3);

    const step2Timer = setTimeout(() => {
      setCurrentStep(2);
      playSound(2);
    }, 900);

    const step1Timer = setTimeout(() => {
      setCurrentStep(1);
      playSound(1);
    }, 1800);

    const goTimer = setTimeout(() => {
      setCurrentStep(0);
      playSound(0);
    }, 2700);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3400);

    const endTimer = setTimeout(() => {
      onComplete();
    }, 3700);

    return () => {
      clearTimeout(step2Timer);
      clearTimeout(step1Timer);
      clearTimeout(goTimer);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden transition-all duration-300 ${
        isFadingOut
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      } bg-white/95 dark:bg-[#05091B]/95 backdrop-blur-2xl`}
    >
      {/* Dynamic Background Ambient Light Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/15 dark:bg-blue-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-cyan-500/10 dark:bg-cyan-400/15 blur-[120px]" />
      </div>

      {/* Top Header: Arena Identity + Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center shadow-xs">
            <QuizMasterIcon size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-500/30 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              <span>ARENA INITIALIZING</span>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md">
              {quizTitle || "Code Examination Arena"}
            </h3>
          </div>
        </div>

        {/* Skip Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Dynamic Animated Countdown Number */}
      <div className="flex flex-col items-center justify-center relative z-10 my-auto">
        {/* Pulsing Concentric Outer Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-blue-500/20 dark:border-cyan-400/20 absolute animate-ping duration-1000 pointer-events-none" />
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border border-blue-600/30 dark:border-blue-400/30 absolute pointer-events-none" />

          {/* Glowing Center Badge Container */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-500/20 backdrop-blur-xl border-2 border-blue-500/40 dark:border-blue-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] dark:shadow-[0_0_70px_rgba(6,182,212,0.35)]">
            {/* Step 3 */}
            {currentStep === 3 && (
              <div
                key="step-3"
                className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-600 via-blue-500 to-cyan-400 dark:from-white dark:via-blue-300 dark:to-cyan-400 animate-in zoom-in-50 fade-in duration-300 drop-shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
              >
                3
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div
                key="step-2"
                className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-700 via-indigo-600 to-cyan-400 dark:from-white dark:via-cyan-200 dark:to-blue-400 animate-in zoom-in-50 fade-in duration-300 drop-shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
              >
                2
              </div>
            )}

            {/* Step 1 */}
            {currentStep === 1 && (
              <div
                key="step-1"
                className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-600 via-cyan-500 to-emerald-400 dark:from-white dark:via-emerald-300 dark:to-cyan-400 animate-in zoom-in-50 fade-in duration-300 drop-shadow-[0_4px_12px_rgba(6,182,212,0.4)]"
              >
                1
              </div>
            )}

            {/* Step 0: "GO!" */}
            {currentStep === 0 && (
              <div
                key="step-go"
                className="text-4xl sm:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 animate-in zoom-in-75 fade-in duration-200 drop-shadow-[0_4px_16px_rgba(16,185,129,0.5)] flex items-center gap-1.5"
              >
                <span>GO!</span>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Status Text */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {currentStep === 3 && "Synchronizing Examination Questions..."}
            {currentStep === 2 && "Preparing Code Environment & Timer..."}
            {currentStep === 1 && "Spaced Repetition & Mastery Active..."}
            {currentStep === 0 && "🚀 Arena Active — Good Luck!"}
          </p>

          {/* 3 Interactive Countdown Stage Dots */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep <= 3
                  ? "w-7 bg-blue-600 dark:bg-blue-400"
                  : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep <= 2
                  ? "w-7 bg-blue-600 dark:bg-blue-400"
                  : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep <= 1
                  ? "w-7 bg-cyan-500 dark:bg-cyan-400"
                  : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === 0
                  ? "w-7 bg-emerald-500"
                  : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer: Tips & Info */}
      <div className="w-full max-w-md text-center relative z-10 space-y-1.5 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>Incorrect answers will be re-queued so you can master them</span>
        </div>
        {courseTitle && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Technology: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
            {questionCount ? ` • ${questionCount} Questions` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
