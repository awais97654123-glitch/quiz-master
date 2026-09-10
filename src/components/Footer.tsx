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

  // Dashboard pages also have their own full height layout
  if (
    pathname.startsWith("/quiz/") ||
    pathname.startsWith("/room/") ||
    pathname.startsWith("/live/") ||
    pathname === "/history" ||
    pathname === "/leaderboard" ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/")
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
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Courses</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/quiz/single/setup?course=html" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  HTML5 & Semantics
                </Link>
              </li>
              <li>
                <Link href="/quiz/single/setup?course=css" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  CSS3, Flexbox & Grid
                </Link>
              </li>
              <li>
                <Link href="/quiz/single/setup?course=javascript" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Modern JavaScript (ES6+)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/quiz/single/setup" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Single Quiz
                </Link>
              </li>
              <li>
                <Link href="/quiz/create/setup" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Create Quiz
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Join Room
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Leaderboard
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
