"use client";

import { Trophy, Medal, Award, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { LeaderboardEntry } from "@/types";
import { formatTime, formatPercentage } from "@/lib/utils";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isFinished?: boolean;
  isHost?: boolean;
  cheatViolations?: Record<string, number>;
  onDisqualify?: (userId: string, userName: string) => Promise<void>;
}

export function LeaderboardTable({
  entries,
  currentUserId,
  isFinished = false,
  isHost = false,
  cheatViolations = {},
  onDisqualify,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-2xl">
        <p className="text-muted-foreground text-sm">No participant scores recorded yet.</p>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20 ring-2 ring-amber-300">
            <Trophy className="w-3.5 h-3.5 fill-current" />
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md ring-2 ring-slate-200">
            <Medal className="w-3.5 h-3.5 fill-current" />
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-amber-600">
            <Award className="w-3.5 h-3.5 fill-current" />
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center border border-border">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Top 3 Podium Highlights if finished */}
      {isFinished && entries.length >= 3 && (
        <div className="bg-gradient-to-b from-academic-blue/10 to-transparent p-6 border-b border-border flex items-end justify-center gap-4 sm:gap-8 pt-10">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={entries[1].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${entries[1].userId}`}
                alt={entries[1].name}
                className="w-14 h-14 rounded-full border-2 border-slate-300 shadow-md object-cover"
              />
              <span className="absolute -top-2 -right-1 bg-slate-300 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                #2
              </span>
            </div>
            <p className="text-xs font-bold text-foreground max-w-[90px] truncate text-center">{entries[1].name}</p>
            <p className="text-[11px] text-academic-blue font-semibold">{formatPercentage(entries[1].percentage)}</p>
            <div className="h-16 w-20 bg-slate-300/20 border border-slate-300/40 rounded-t-xl mt-2 flex items-center justify-center font-bold text-xs text-muted-foreground">
              2nd
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-500">
                <Trophy className="w-5 h-5 fill-amber-500 animate-bounce" />
              </div>
              <img
                src={entries[0].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${entries[0].userId}`}
                alt={entries[0].name}
                className="w-18 h-18 rounded-full border-3 border-amber-400 shadow-lg object-cover"
              />
              <span className="absolute -top-2 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                #1
              </span>
            </div>
            <p className="text-sm font-extrabold text-foreground max-w-[100px] truncate text-center">{entries[0].name}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">{formatPercentage(entries[0].percentage)}</p>
            <div className="h-24 w-24 bg-amber-500/20 border border-amber-400/50 rounded-t-xl mt-2 flex items-center justify-center font-black text-sm text-amber-600 dark:text-amber-400">
              1st 🏆
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={entries[2].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${entries[2].userId}`}
                alt={entries[2].name}
                className="w-14 h-14 rounded-full border-2 border-amber-700 shadow-md object-cover"
              />
              <span className="absolute -top-2 -right-1 bg-amber-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                #3
              </span>
            </div>
            <p className="text-xs font-bold text-foreground max-w-[90px] truncate text-center">{entries[2].name}</p>
            <p className="text-[11px] text-academic-blue font-semibold">{formatPercentage(entries[2].percentage)}</p>
            <div className="h-12 w-20 bg-amber-700/20 border border-amber-700/40 rounded-t-xl mt-2 flex items-center justify-center font-bold text-xs text-muted-foreground">
              3rd
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
            <tr>
              <th className="py-3 px-4 w-14 text-center">Rank</th>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-center">Accuracy</th>
              <th className="py-3 px-4 text-center">Time</th>
              <th className="py-3 px-4 text-center">Status</th>
              {isHost && <th className="py-3 px-4 text-center">Host Control</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {entries.map((entry) => {
              const isCurrentUser = entry.userId === currentUserId;
              const violations = cheatViolations[entry.userId] || 0;
              return (
                <tr
                  key={entry.userId}
                  className={`transition-colors ${
                    isCurrentUser ? "bg-academic-blue/5 font-medium" : "hover:bg-muted/40"
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">{getRankBadge(entry.rank)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.userId}`}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full border border-border object-cover bg-muted"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{entry.name}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-academic-blue text-white">
                              You
                            </span>
                          )}
                          {violations > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 animate-pulse">
                              ⚠️ {violations} Tab Switch{violations > 1 ? "es" : ""}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{entry.institution || `@${entry.username}`}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-foreground">
                    {entry.score}
                    <span className="text-xs font-normal text-muted-foreground"> / {entry.totalQuestions}</span>
                    <span className="block text-[11px] text-academic-blue font-semibold">
                      ({formatPercentage(entry.percentage)})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-foreground">
                    {formatPercentage(entry.accuracy)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{formatTime(entry.timeTaken)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {entry.status === "SUBMITTED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Finished
                      </span>
                    ) : entry.status === "TIMED_OUT" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" /> Disqualified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full animate-pulse">
                        Solving...
                      </span>
                    )}
                  </td>
                  {isHost && (
                    <td className="py-3 px-4 text-center">
                      {entry.status === "TIMED_OUT" ? (
                        <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                          Tab Closed
                        </span>
                      ) : entry.status !== "SUBMITTED" ? (
                        <button
                          onClick={() => onDisqualify?.(entry.userId, entry.name)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                          title="Disqualify student and terminate their session"
                        >
                          Close Tab / Kick
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
