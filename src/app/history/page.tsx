"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  Filter,
  PlayCircle,
  Users,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileCode,
  Trophy,
  Award,
  BookOpen,
  Search,
} from "lucide-react";
import { formatTime, formatPercentage } from "@/lib/utils";
import { DashboardShell } from "@/components/DashboardShell";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const url = `/api/history?course=${selectedCourse}&mode=${selectedMode}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedCourse, selectedMode]);

  // Derived statistics for Screen 13 metric cards
  const totalQuizzes = history.length;
  const totalScore = history.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgPercentage = totalQuizzes > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalQuizzes)
    : 0;

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.quizName?.toLowerCase().includes(q) ||
      item.courseName?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell activePath="/history">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              My Quizzes & History
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review your examination records, past answers, and academic progress
            </p>
          </div>

          <Link
            href="/quiz/single/setup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Take New Quiz</span>
          </Link>
        </div>

        {/* 4 Metric Cards - Matching Screen 13 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground uppercase">
              <BookOpen className="w-4 h-4 text-[#1D4ED8]" />
              <span>Total Attempts</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-2">{totalQuizzes}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">All modes completed</p>
          </div>

          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Total Score</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-2">{totalScore}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Correct questions answered</p>
          </div>

          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Average Score</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
              {avgPercentage}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative accuracy</p>
          </div>

          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Distinctions</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground mt-2">
              {history.filter((h) => (h.percentage || 0) >= 80).length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Scores ≥ 80%</p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quiz name..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Course Filter */}
            <div className="flex items-center bg-muted/50 rounded-xl p-1 text-xs font-semibold">
              {[
                { slug: "all", label: "All" },
                { slug: "html", label: "HTML" },
                { slug: "css", label: "CSS" },
                { slug: "javascript", label: "JS" },
              ].map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCourse(c.slug)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedCourse === c.slug
                      ? "bg-white dark:bg-card text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Mode Filter */}
            <div className="flex items-center bg-muted/50 rounded-xl p-1 text-xs font-semibold">
              {[
                { slug: "all", label: "All Modes" },
                { slug: "SINGLE", label: "Solo" },
                { slug: "MULTIPLAYER", label: "Live" },
              ].map((m) => (
                <button
                  key={m.slug}
                  onClick={() => setSelectedMode(m.slug)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedMode === m.slug
                      ? "bg-white dark:bg-card text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Table - Screen 13 */}
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <History className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h2 className="text-lg font-bold text-foreground">No Quiz Records Found</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t taken any quizzes matching your filters yet.
            </p>
            <Link
              href="/quiz/single/setup"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
            >
              Start First Quiz
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Quiz Name</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4 text-center">Score</th>
                    <th className="py-3.5 px-4 text-center">Time</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredHistory.map((item) => {
                    const isPassed = (item.percentage || 0) >= 70;
                    return (
                      <tr key={item.attemptId} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-foreground">
                            {item.quizName}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {item.mode === "SINGLE" ? "Individual Practice" : "Multiplayer Tournament"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#1D4ED8]">
                            {item.courseName}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`font-black text-sm px-2.5 py-1 rounded-full ${
                              isPassed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {formatPercentage(item.percentage)}
                          </span>
                          <span className="block text-[11px] text-muted-foreground mt-0.5">
                            {item.score} correct
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-xs text-muted-foreground">
                          {formatTime(item.timeTaken)}
                        </td>
                        <td className="py-4 px-4 text-xs text-muted-foreground">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/quiz/result/${item.attemptId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted/60 hover:bg-[#1D4ED8] hover:text-white text-foreground font-bold text-xs transition-colors border border-border/70"
                          >
                            <span>View Result</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
