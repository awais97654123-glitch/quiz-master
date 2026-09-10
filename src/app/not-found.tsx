import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { HelpCircle, Home, ArrowRight, BookOpen, Code2, Layers, Zap } from "lucide-react";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Page Not Found (404)",
  description: "The page you are looking for does not exist or has been moved.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The page you requested could not be located. It may have been renamed or moved. Check out our popular quizzes below:
          </p>
        </div>

        {/* Helpful Popular Quiz Links */}
        <div className="space-y-2 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Popular Quizzes:
          </span>
          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/quiz/javascript"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#080d1e] hover:border-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>JavaScript Quiz &amp; MCQs</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/quiz/html"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#080d1e] hover:border-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-orange-500" />
                <span>HTML5 Semantics &amp; Forms</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/quiz/css"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#080d1e] hover:border-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>CSS3, Flexbox &amp; Grid</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Homepage</span>
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse All Quizzes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
