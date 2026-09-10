"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BookOpen,
  PlusCircle,
  Trophy,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Zap,
  PlayCircle,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { ScoreAnalyticsChart } from "@/components/ScoreAnalyticsChart";
import { formatPercentage, formatTime } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    accuracy: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login?redirect=/dashboard");
      return;
    }

    const storedUser = localStorage.getItem("codequiz_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        if (u.profile) setProfile(u.profile);
      } catch {
        // ignore
      }
    }

    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const data = await res.json();
        setProfile(data.profile);
        if (data.user) {
          setCurrentUser((prev: any) => ({ ...prev, ...data.user }));
        }

        const historyAttempts = data.history || data.attempts || [];
        setAttempts(historyAttempts);

        if (data.stats) {
          setStats({
            totalQuizzes: data.stats.totalQuizzes || 0,
            averageScore: data.stats.averageScore || 0,
            bestScore: data.stats.bestScore || 0,
            accuracy: data.stats.accuracy || 0,
            totalQuestionsAnswered: data.stats.totalQuestionsAnswered || 0,
            correctAnswers: data.stats.correctAnswers || 0,
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [router]);

  const displayName =
    profile?.name ||
    currentUser?.profile?.name ||
    currentUser?.name ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Student Candidate");

  const displayEmail =
    currentUser?.email ||
    profile?.user?.email ||
    (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("codequiz_user") || "{}").email : "") ||
    "";

  const displayInstitution =
    profile?.institution || currentUser?.profile?.institution || "Active Learner";

  const displayAvatar =
    profile?.avatarUrl ||
    currentUser?.profile?.avatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <DashboardShell activePath="/dashboard">
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        
        {/* Top Header & Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-600/15">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border-2 border-white/25 object-cover shadow-md"
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-cyan-200">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{displayInstitution}</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
                  {displayEmail ? `${displayEmail} • ` : ""}Real-time live examination metrics & score progression
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                href="/quiz/single/setup"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-white/90 font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                <PlayCircle className="w-4 h-4 text-blue-600" />
                <span>Start Quiz</span>
              </Link>
              <Link
                href="/quiz/create/setup"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white font-bold text-xs backdrop-blur-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-cyan-300" />
                <span>Create Room</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Average Score */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {stats.averageScore}%
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Overall assessment mean</p>
            </div>
          </div>

          {/* Card 2: Total Quizzes */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Quizzes Taken</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {stats.totalQuizzes}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Completed test sessions</p>
            </div>
          </div>

          {/* Card 3: Best Score */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Highest Score</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-cyan-400">
                {stats.bestScore}%
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Personal tournament peak</p>
            </div>
          </div>

          {/* Card 4: Accuracy */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Overall Accuracy</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {stats.accuracy}%
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stats.correctAnswers}/{stats.totalQuestionsAnswered} correct answers
              </p>
            </div>
          </div>
        </div>

        {/* Interactive SVG Score Analytics Chart */}
        <ScoreAnalyticsChart
          attempts={attempts}
          title="Live Score Trajectory & Performance Curve"
        />

        {/* Detailed Assessment History: "Kab konsa quiz kiya aur konsa score aaya" */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Examination Log</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed timeline of your completed quizzes, dates, and achieved scores
              </p>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>Full History Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Loading live performance records...
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No Quiz Attempts Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Once you finish solo quizzes or multiplayer challenges, your live scores and historical logs will appear right here.
              </p>
              <Link
                href="/quiz/single/setup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors"
              >
                <span>Take First Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-semibold">
                    <th className="pb-3 pl-2">Quiz / Assessment</th>
                    <th className="pb-3 px-4">Date & Time</th>
                    <th className="pb-3 px-4 text-center">Score</th>
                    <th className="pb-3 px-4 text-center">Percentage</th>
                    <th className="pb-3 px-4 text-center">Duration</th>
                    <th className="pb-3 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {attempts.map((att) => {
                    const pct = att.percentage ?? (att.totalQuestions ? Math.round((att.score / att.totalQuestions) * 100) : att.score * 10);
                    const isPassing = pct >= 60;
                    const dateStr = new Date(att.submittedAt || att.startedAt || Date.now()).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = new Date(att.submittedAt || att.startedAt || Date.now()).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                        {/* Title & Subject */}
                        <td className="py-4 pl-2">
                          <div className="font-bold text-sm text-foreground">
                            {att.quiz?.name || "Standard Quiz Challenge"}
                          </div>
                          {att.quiz?.course?.name && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {att.quiz.course.name}
                            </div>
                          )}
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{dateStr}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground pl-5">
                            {timeStr}
                          </div>
                        </td>

                        {/* Raw Score */}
                        <td className="py-4 px-4 text-center font-bold text-foreground">
                          {att.score} / {att.totalQuestions || 10}
                        </td>

                        {/* Percentage Badge */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              pct >= 85
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : pct >= 60
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>

                        {/* Time Taken */}
                        <td className="py-4 px-4 text-center text-muted-foreground whitespace-nowrap">
                          {att.timeTaken ? (
                            <span className="font-mono">
                              {Math.floor(att.timeTaken / 60)}m {att.timeTaken % 60}s
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </td>

                        {/* Action Link */}
                        <td className="py-4 pr-2 text-right">
                          <Link
                            href={`/quiz/result/${att.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-blue-600 hover:text-white hover:border-blue-600 font-semibold text-xs text-foreground transition-all shadow-2xs"
                          >
                            <span>Review</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
