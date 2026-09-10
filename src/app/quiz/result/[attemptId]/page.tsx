"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatTime, formatPercentage } from "@/lib/utils";
import { CodeBlock } from "@/components/CodeBlock";
import { DashboardShell } from "@/components/DashboardShell";

interface ReviewedQuestion {
  questionId: string;
  question: string;
  code?: string | null;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  topicName: string;
  difficulty: string;
}

export default function SingleQuizResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  const router = useRouter();

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`/api/attempt/${attemptId}/result`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setResult(data);
          setIsLoading(false);

          if (data.percentage >= 70) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        } else {
          setError(data.error || "Failed to load examination results");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message || "Network error loading results");
        setIsLoading(false);
      });
  }, [attemptId, router]);

  if (isLoading) {
    return (
      <DashboardShell activePath="/history">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-9 h-9 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !result) {
    return (
      <DashboardShell activePath="/history">
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Result Not Found</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white font-bold text-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const isPassed = result.percentage >= 70;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.percentage / 100) * circumference;

  return (
    <DashboardShell activePath="/history">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - Matching Screen 6 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Quiz Result
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {result.quizName} • {result.courseName}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold self-start ${
              isPassed
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {isPassed ? "Passed with Distinction" : "Completed"}
          </span>
        </div>

        {/* Circular Gauge & Overview Card - Screen 6 */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            {/* SVG Circular Percentage Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-muted"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className={isPassed ? "stroke-emerald-500" : "stroke-amber-500"}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-foreground">
                    {Math.round(result.percentage)}%
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    Score
                  </span>
                </div>
              </div>
              <p className="mt-3 font-bold text-foreground text-sm">
                Your Score: <span className="text-[#1D4ED8]">{result.score}</span> / {result.totalQuestions}
              </p>
            </div>

            {/* Stats List - Screen 6 */}
            <div className="w-full md:w-auto flex-1 max-w-sm space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Time Taken</span>
                </div>
                <span className="font-mono font-bold text-sm text-foreground">
                  {formatTime(result.timeTaken)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Correct</span>
                </div>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {result.score} questions
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <div className="flex items-center gap-2.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Incorrect</span>
                </div>
                <span className="font-bold text-sm text-rose-600 dark:text-rose-400">
                  {result.totalQuestions - result.score} questions
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Average Accuracy</span>
                </div>
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {formatPercentage(result.accuracy)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Screen 6: Blue "View Answers" Button */}
          <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setShowAnswers(!showAnswers)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnswers ? "Hide Detailed Answers" : "View Answers & Review"}</span>
            </button>

            <Link
              href="/quiz/single/setup"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border/80 hover:bg-muted font-bold text-sm text-foreground transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-muted hover:bg-muted/80 font-bold text-sm text-foreground transition-all flex items-center justify-center gap-2"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Detailed Question Review Section (toggled by "View Answers") */}
        {showAnswers && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1D4ED8]" />
                <span>Question Review ({result.reviewedQuestions?.length || 0})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {result.reviewedQuestions?.map((q: ReviewedQuestion, idx: number) => {
                return (
                  <div
                    key={q.questionId}
                    className={`bg-card border rounded-2xl p-6 shadow-sm transition-all ${
                      q.isCorrect ? "border-emerald-500/30" : "border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center bg-muted text-foreground">
                          #{idx + 1}
                        </span>
                        <span className="text-xs uppercase font-semibold text-muted-foreground">
                          {q.topicName}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                          q.isCorrect
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {q.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-base font-semibold text-foreground leading-relaxed">
                      {q.question}
                    </p>

                    {q.code && (
                      <div className="my-3 rounded-xl overflow-hidden border border-border/60">
                        <CodeBlock code={q.code} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                      {q.options.map((opt) => {
                        const isUserPick = q.selectedAnswer === opt;
                        const isCorrectOpt = q.correctAnswer === opt;

                        let style = "border-border bg-background text-foreground/80";
                        if (isCorrectOpt) {
                          style = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                        } else if (isUserPick && !q.isCorrect) {
                          style = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through";
                        }

                        return (
                          <div
                            key={opt}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${style}`}
                          >
                            <span>{opt}</span>
                            {isCorrectOpt && (
                              <span className="text-[10px] uppercase font-bold text-emerald-600 ml-2 shrink-0">
                                ✓ Correct
                              </span>
                            )}
                            {isUserPick && !isCorrectOpt && (
                              <span className="text-[10px] uppercase font-bold text-rose-600 ml-2 shrink-0">
                                ✗ Your Pick
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-border/70 text-xs text-foreground/90 space-y-1">
                        <span className="font-bold text-[#1D4ED8] block uppercase text-[10px] tracking-wider">
                          Explanation:
                        </span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
