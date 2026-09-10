"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { formatTime, formatPercentage } from "@/lib/utils";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.institution?.toLowerCase().includes(q) ||
      e.courseName?.toLowerCase().includes(q)
    );
  });

  const top3 = entries.slice(0, 3);

  return (
    <DashboardShell activePath="/leaderboard">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header - Screen 12 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Global Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Top performing developers and high achievers across HTML, CSS & JavaScript
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold self-start">
            <Trophy className="w-3.5 h-3.5 fill-current" />
            <span>Hall of Fame</span>
          </div>
        </div>

        {/* Top 3 Podium - Screen 12 */}
        {top3.length >= 3 && (
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-end justify-center gap-4 sm:gap-8 pt-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={top3[1].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[1].userId}`}
                    alt={top3[1].name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-300 shadow-md object-cover"
                  />
                  <span className="absolute -top-2 -right-1 bg-slate-200 text-slate-800 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                    #2
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground max-w-[100px] truncate text-center">
                  {top3[1].name}
                </p>
                <p className="text-[11px] text-[#1D4ED8] font-bold">
                  {top3[1].score} pts ({top3[1].percentage}%)
                </p>
                <div className="h-16 sm:h-20 w-20 sm:w-24 bg-slate-200/40 dark:bg-slate-800/60 border border-slate-300/40 rounded-t-2xl mt-2 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">
                  2nd 🥈
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500">
                    <Trophy className="w-6 h-6 fill-amber-500" />
                  </div>
                  <img
                    src={top3[0].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[0].userId}`}
                    alt={top3[0].name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-amber-400 shadow-xl object-cover ring-4 ring-amber-400/20"
                  />
                  <span className="absolute -top-2 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    #1
                  </span>
                </div>
                <p className="text-sm font-black text-foreground max-w-[120px] truncate text-center">
                  {top3[0].name}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                  {top3[0].score} pts ({top3[0].percentage}%)
                </p>
                <div className="h-24 sm:h-28 w-24 sm:w-28 bg-amber-500/20 border border-amber-400/50 rounded-t-2xl mt-2 flex items-center justify-center font-black text-sm text-amber-600 dark:text-amber-400 shadow-xs">
                  1st 🏆
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={top3[2].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[2].userId}`}
                    alt={top3[2].name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-700 shadow-md object-cover"
                  />
                  <span className="absolute -top-2 -right-1 bg-amber-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                    #3
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground max-w-[100px] truncate text-center">
                  {top3[2].name}
                </p>
                <p className="text-[11px] text-[#1D4ED8] font-bold">
                  {top3[2].score} pts ({top3[2].percentage}%)
                </p>
                <div className="h-12 sm:h-16 w-20 sm:w-24 bg-amber-700/20 border border-amber-700/40 rounded-t-2xl mt-2 flex items-center justify-center font-black text-xs text-amber-700 dark:text-amber-400">
                  3rd 🥉
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-card border border-border/80 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players by name, institution or course..."
            className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Ranked Table */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-5">Developer</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Accuracy</th>
                  <th className="py-3.5 px-4 text-center">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEntries.map((e) => (
                  <tr key={e.userId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-black inline-flex items-center justify-center ${
                          e.rank === 1
                            ? "bg-amber-400 text-slate-950 shadow-xs"
                            : e.rank === 2
                            ? "bg-slate-300 text-slate-900"
                            : e.rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {e.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={e.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${e.userId}`}
                          alt={e.name}
                          className="w-8 h-8 rounded-full border border-border object-cover bg-muted"
                        />
                        <div>
                          <span className="font-bold text-foreground text-sm block">
                            {e.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            {e.institution || `@${e.username}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#1D4ED8]">
                        {e.courseName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">
                      {e.score}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {e.percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                      {formatTime(e.timeTaken)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
