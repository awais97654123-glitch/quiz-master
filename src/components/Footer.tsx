"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Code2 } from "lucide-react";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";

export function Footer() {
  const pathname = usePathname();

  // Landing page ('/') has its own dedicated footer
  if (pathname === "/") {
    return null;
  }

  // Hide only on immersive active exam sessions
  if (
    pathname.startsWith("/live/") ||
    (pathname.startsWith("/quiz/single/") && pathname !== "/quiz/single/setup") ||
    pathname.startsWith("/room/") ||
    pathname.startsWith("/quiz/result/")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#040712] text-slate-600 dark:text-slate-400 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <QuizMasterLogo size="sm" />
            <p className="text-xs max-w-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The premier examination and competitive testing platform for frontend developers. Real-time multiplayer rooms, AI curriculum generation, and server-authoritative scoring.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Server-Authoritative Timing
              </span>
              <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                <Code2 className="w-4 h-4" /> HTML • CSS • JS
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Courses &amp; Quizzes</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/quiz/html" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  HTML5 Quiz &amp; MCQs
                </Link>
              </li>
              <li>
                <Link href="/quiz/css" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  CSS3, Flexbox &amp; Grid
                </Link>
              </li>
              <li>
                <Link href="/quiz/javascript" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Modern JavaScript Quiz
                </Link>
              </li>
              <li>
                <Link href="/topics" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  All 108 Curriculum Topics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Practice Tests</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/quiz" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  All Online Quizzes
                </Link>
              </li>
              <li>
                <Link href="/online-test" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Timed Online Tests
                </Link>
              </li>
              <li>
                <Link href="/mcq" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Web Development MCQs
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Global Leaderboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Quiz Master Arena. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
