"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Users,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  StopCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { SubpageHeader } from "@/components/SubpageHeader";
import { getSocket } from "@/lib/socket";
import { LeaderboardEntry } from "@/types";

export default function LiveLeaderboardDashboardPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cheatViolations, setCheatViolations] = useState<Record<string, number>>({});

  useEffect(() => {
    const userStr = localStorage.getItem("codequiz_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }

    // Fetch initial leaderboard
    fetch(`/api/quiz/${quizId}/leaderboard`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setQuizInfo(data);
          setLeaderboard(data.leaderboard || []);
          setIsFinished(data.isFinished);
          setIsLoading(false);

          if (data.isFinished && data.leaderboard?.length > 0) {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
            });
          }
        } else {
          setError(data.error || "Failed to load leaderboard");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });

    // Listen for real-time leaderboard updates and anti-cheat events from Socket.IO
    const socket = getSocket();
    function onLeaderboardUpdate(data: { quizId: string; leaderboard: LeaderboardEntry[] }) {
      if (data.quizId === quizId) {
        setLeaderboard(data.leaderboard);
        const allDone =
          data.leaderboard.length > 0 &&
          data.leaderboard.every((e) => e.status === "SUBMITTED" || e.status === "TIMED_OUT");
        if (allDone) {
          setIsFinished(true);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    }

    function onCheatWarning(data: { quizId: string; userId: string; userName: string; violations: number }) {
      if (data.quizId === quizId) {
        setCheatViolations((prev) => ({
          ...prev,
          [data.userId]: data.violations,
        }));
      }
    }

    socket.on("leaderboard_update", onLeaderboardUpdate);
    socket.on("student_cheat_warning", onCheatWarning);

    return () => {
      socket.off("leaderboard_update", onLeaderboardUpdate);
      socket.off("student_cheat_warning", onCheatWarning);
    };
  }, [quizId]);

  const isHost = Boolean(currentUser?.id && quizInfo?.creatorId && currentUser.id === quizInfo.creatorId);

  const handleDisqualify = async (targetUserId: string, targetName: string) => {
    if (!confirm(`Are you sure you want to DISQUALIFY and CLOSE THE TAB for ${targetName}? This will immediately terminate their quiz session.`)) {
      return;
    }

    const token = localStorage.getItem("codequiz_token");
    try {
      const res = await fetch(`/api/quiz/${quizId}/disqualify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId,
          reason: "Host Disqualification: Academic Dishonesty / Tab Switch Cheating",
        }),
      });

      if (res.ok) {
        // Broadcast socket event to close the student's tab immediately
        const socket = getSocket();
        socket.emit("disqualify_participant", {
          quizId,
          targetUserId,
          reason: "Host Disqualification: Academic Dishonesty / Tab Switch Cheating",
        });

        // Update local leaderboard state
        setLeaderboard((prev) =>
          prev.map((e) => (e.userId === targetUserId ? { ...e, status: "TIMED_OUT" } : e))
        );
      } else {
        const d = await res.json();
        alert(d.error || "Failed to disqualify participant");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-academic-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  const finishedCount = leaderboard.filter((e) => e.status === "SUBMITTED" || e.status === "TIMED_OUT").length;

  return (
    <div className="min-h-screen bg-background pb-16">
      <SubpageHeader
        title={quizInfo?.name || "Tournament Leaderboard"}
        subtitle={isFinished ? "Session Concluded" : "Live Real-Time Scoring"}
        badge={isFinished ? "Concluded" : "Live"}
        backUrl="/"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Banner */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>{isFinished ? "Final Tournament Results" : "Live Real-Time Leaderboard"}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {isFinished ? "Session Concluded" : "Submissions Synchronizing"}
              </span>
            </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {quizInfo?.name || "Tournament Leaderboard"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Deterministic ranking calculated server-side: Score → Accuracy → Fastest Time → Submission Order
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-muted rounded-xl border border-border text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Completion</span>
            <span className="font-mono font-extrabold text-foreground text-sm">
              {finishedCount} / {leaderboard.length} Players
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Leaderboard Table with Podium and Host Disqualify Controls */}
      <div className="space-y-4">
        <LeaderboardTable
          entries={leaderboard}
          currentUserId={currentUser?.id}
          isFinished={isFinished}
          isHost={isHost}
          cheatViolations={cheatViolations}
          onDisqualify={handleDisqualify}
        />
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/history"
          className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
        >
          View Quiz History
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/quiz/create/setup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Host Another Session</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-academic-blue text-white text-sm font-bold hover:bg-academic-blue/90 shadow-sm"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
