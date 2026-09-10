"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { CodeBlock } from "@/components/CodeBlock";
import { getSocket } from "@/lib/socket";
import { QuizCountdownOverlay } from "@/components/QuizCountdownOverlay";

interface AttemptQuestion {
  id: string;
  courseId: string;
  topicId: string;
  difficulty: string;
  type: string;
  question: string;
  code?: string | null;
  options: string[];
  topic?: { name: string };
  orderIndex: number;
}

interface AttemptQuestionItem extends AttemptQuestion {
  queueKey: string;
  isReview?: boolean;
  reviewRound?: number;
}

interface QuestionFeedback {
  isChecked: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
  explanation?: string | null;
}

export default function LiveParticipantQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const router = useRouter();

  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<AttemptQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, QuestionFeedback>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [requeuedCount, setRequeuedCount] = useState(0);
  const [showCountdown, setShowCountdown] = useState(true);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState("");
  const [tabViolations, setTabViolations] = useState(0);
  const [tabWarningMessage, setTabWarningMessage] = useState<string | null>(null);

  // Anti-cheat tab switch and window blur tracking
  useEffect(() => {
    if (isLoading || isDisqualified || showCountdown) return;

    const socket = getSocket();
    const stored = localStorage.getItem("codequiz_user");
    const parsedUser = stored ? JSON.parse(stored) : null;
    const userId = parsedUser?.id;
    const userName = parsedUser?.profile?.name || parsedUser?.email?.split("@")[0] || "Candidate";

    let warningTimer: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations((prev) => {
          const next = prev + 1;
          if (socket && userId) {
            socket.emit("student_cheat_warning", {
              roomCode: attempt?.roomCode,
              quizId,
              userId,
              userName,
              violations: next,
            });
          }
          setTabWarningMessage(`⚠️ Tab switch #${next} detected! The exam host has been notified.`);
          clearTimeout(warningTimer);
          warningTimer = setTimeout(() => setTabWarningMessage(null), 5000);
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for host disqualification
    const onDisqualified = (data: { quizId: string; userId: string; reason?: string }) => {
      if (data.quizId === quizId && data.userId === userId) {
        setIsDisqualified(true);
        setDisqualifyReason(data.reason || "Unauthorized Tab Switch Cheating");
      }
    };

    socket.on("student_disqualified", onDisqualified);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.off("student_disqualified", onDisqualified);
      clearTimeout(warningTimer);
    };
  }, [isLoading, isDisqualified, showCountdown, attempt, quizId]);

  useEffect(() => {
    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadAttempt = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/attempt/by-quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          if (data.isFinished) {
            router.push(`/quiz/result/${data.attemptId}`);
            return;
          }
          setAttempt(data);

          const initialQuestions: AttemptQuestionItem[] = (data.questions || []).map(
            (q: AttemptQuestion, idx: number) => ({
              ...q,
              queueKey: `${q.id}-0`,
              isReview: false,
              reviewRound: 0,
            })
          );
          setQuestions(initialQuestions);

          const initialAnswers: Record<string, string> = {};
          if (data.savedAnswers) {
            for (const [qid, ans] of Object.entries(data.savedAnswers)) {
              initialAnswers[`${qid}-0`] = ans as string;
            }
          }
          setSelectedAnswers(initialAnswers);
        } else {
          setError(data.error || "Failed to load tournament questions");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to tournament session");
      } finally {
        setIsLoading(false);
      }
    };

    loadAttempt();
  }, [quizId, router]);

  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAutoAdvance();
  }, []);

  const handleSelectOption = async (option: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !attempt?.attemptId || isChecking) return;

    if (feedbacks[currentQ.queueKey]?.isChecked) return;

    clearAutoAdvance();
    setValidationError(null);
    setIsChecking(true);

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.queueKey]: option,
    }));

    const token = localStorage.getItem("codequiz_token");
    try {
      const res = await fetch(`/api/attempt/${attempt.attemptId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQ.id,
          selectedAnswer: option,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const isCorrect = Boolean(data.isCorrect);

        setFeedbacks((prev) => ({
          ...prev,
          [currentQ.queueKey]: {
            isChecked: true,
            isCorrect,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
          },
        }));

        if (!isCorrect) {
          // Re-queue question 3 steps ahead or at the end
          const nextQuestions = [...questions];
          const targetIndex = Math.min(currentIndex + 3, nextQuestions.length);
          const reviewItem: AttemptQuestionItem = {
            ...currentQ,
            queueKey: `${currentQ.id}-review-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            isReview: true,
            reviewRound: (currentQ.reviewRound || 0) + 1,
          };
          nextQuestions.splice(targetIndex, 0, reviewItem);
          setQuestions(nextQuestions);
          setRequeuedCount((prev) => prev + 1);
        }

        const advanceDelay = isCorrect ? 1200 : 2200;
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setValidationError(null);
          } else {
            setShowConfirmModal(true);
          }
        }, advanceDelay);
      } else {
        setValidationError(data.error || "Failed to verify answer");
      }
    } catch (err: any) {
      setValidationError(err.message || "Network error checking answer");
    } finally {
      setIsChecking(false);
    }
  };

  const handleNextQuestion = () => {
    clearAutoAdvance();
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (!feedbacks[currentQ.queueKey]?.isChecked) {
      setValidationError("Please select an answer to continue!");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setValidationError(null);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attempt?.attemptId) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);
    const token = localStorage.getItem("codequiz_token");

    try {
      const res = await fetch(`/api/attempt/${attempt.attemptId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const socket = getSocket();
        socket.emit("participant_submitted", {
          roomCode: attempt.roomCode || "",
          quizId,
          userId: attempt.userId,
        });

        router.push(`/live/${quizId}/dashboard`);
      } else {
        const data = await res.json();
        setError(data.error || "Submission failed");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isDisqualified) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-500/10 animate-bounce">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-rose-500 tracking-tight">
              SESSION TERMINATED
            </h2>
            <p className="text-sm font-bold text-slate-200">
              Disqualified by Room Host
            </p>
            <p className="text-xs text-slate-400">
              {disqualifyReason || "Academic dishonesty: unauthorized tab switching or window defocus detected."}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            Your quiz attempt has been closed and locked by the room creator. You can no longer participate in this session.
          </div>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <span>Return to Arena Home</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-[#0E1A38] border border-border p-8 rounded-2xl shadow-xl">
          <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Live Tournament Active</h2>
          <p className="text-sm text-muted-foreground">View the tournament standings and results:</p>
          <button
            onClick={() => router.push(`/live/${quizId}/dashboard`)}
            className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white font-bold text-sm hover:bg-blue-700 cursor-pointer"
          >
            View Live Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentKey = currentQuestion.queueKey;
  const currentFeedback = feedbacks[currentKey];
  const isChecked = Boolean(currentFeedback?.isChecked);
  const chosenOption = selectedAnswers[currentKey];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const checkedQuestionsCount = Object.values(feedbacks).filter((f) => f.isChecked).length;
  const isFinalQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex flex-col transition-colors">
      {/* 3-2-1-GO Dynamic Countdown Overlay */}
      {showCountdown && (
        <QuizCountdownOverlay
          quizTitle={attempt?.quizName || "Live Tournament Challenge"}
          courseTitle={attempt?.courseName}
          questionCount={questions.length}
          onComplete={() => setShowCountdown(false)}
        />
      )}

      {/* Top Header */}
      <header className="bg-white dark:bg-[#0B132B] border-b border-border/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              title="Quit exam"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">
                  Live
                </span>
                <h1 className="text-base sm:text-lg font-black text-foreground truncate">
                  {attempt?.quizName || "Live Tournament"}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Question {currentIndex + 1} of {questions.length} • {currentQuestion.topic?.name || "Topic"}
              </p>
            </div>
          </div>

          {/* Time Left Badge */}
          <div className="flex items-center gap-3 shrink-0">
            {requeuedCount > 0 && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{requeuedCount} Re-queued</span>
              </div>
            )}
            {attempt.expiresAt && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-mono font-bold text-sm">
                <Clock className="w-4 h-4 shrink-0" />
                <TimerDisplay expiresAt={attempt.expiresAt} onExpire={handleSubmitQuiz} />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quit</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-border/40 h-1">
          <div
            className="bg-[#1D4ED8] h-1 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Floating Anti-Cheat Tab Switch Warning Banner */}
      {tabWarningMessage && (
        <div className="bg-rose-500 text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          <span>{tabWarningMessage}</span>
        </div>
      )}

      {/* Main Question Card */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="bg-white dark:bg-[#0E1A38] border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[#1D4ED8] uppercase tracking-wider text-sm">
                Question {currentIndex + 1} of {questions.length}
              </span>

              {currentQuestion.isReview && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold animate-pulse">
                  <RotateCcw className="w-3 h-3" />
                  <span>Review Round #{currentQuestion.reviewRound || 1} • Practice to Master</span>
                </span>
              )}
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                currentQuestion.difficulty === "HARD"
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : currentQuestion.difficulty === "MEDIUM"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-foreground leading-snug tracking-tight">
            {currentQuestion.question}
          </h2>

          {currentQuestion.code && (
            <div className="rounded-xl overflow-hidden border border-border/60">
              <CodeBlock code={currentQuestion.code} />
            </div>
          )}

          {/* 4 Options Grid with A, B, C, D badges */}
          <div className="space-y-3 pt-1">
            {currentQuestion.options.map((option: string, idx: number) => {
              const optionLetters = ["A", "B", "C", "D"];
              const isSelected = chosenOption === option;
              const isCorrectAnswer = isChecked && currentFeedback?.correctAnswer === option;
              const isWrongChoice = isChecked && isSelected && !currentFeedback?.isCorrect;

              let optionClasses = "";
              if (isChecked) {
                if (isCorrectAnswer) {
                  optionClasses =
                    "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/25 shadow-xs";
                } else if (isWrongChoice) {
                  optionClasses =
                    "bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/25 shadow-xs";
                } else {
                  optionClasses = "bg-background/70 border-border/40 text-muted-foreground opacity-50";
                }
              } else {
                if (isSelected) {
                  optionClasses =
                    "bg-blue-500/10 border-[#1D4ED8] text-[#1D4ED8] ring-2 ring-blue-500/20 shadow-xs";
                } else {
                  optionClasses =
                    "bg-background border-border/70 hover:border-blue-400/60 text-foreground hover:bg-muted/40";
                }
              }

              return (
                <button
                  key={`${currentKey}-${idx}`}
                  type="button"
                  disabled={isChecked}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base font-semibold transition-all flex items-center gap-3.5 ${
                    isChecked ? "cursor-default" : "cursor-pointer"
                  } ${optionClasses}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-all ${
                      isCorrectAnswer
                        ? "bg-emerald-600 text-white"
                        : isWrongChoice
                        ? "bg-rose-600 text-white"
                        : isSelected
                        ? "bg-[#1D4ED8] text-white shadow-xs"
                        : "bg-muted text-muted-foreground border border-border/60"
                    }`}
                  >
                    {optionLetters[idx]}
                  </span>

                  <span className="flex-1 leading-relaxed">{option}</span>

                  {isCorrectAnswer && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="hidden sm:inline">Correct Answer</span>
                    </div>
                  )}

                  {isWrongChoice && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                      <XCircle className="w-5 h-5" />
                      <span className="hidden sm:inline">Your Answer</span>
                    </div>
                  )}

                  {!isChecked && isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-[#1D4ED8] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Instant Feedback Card */}
          {isChecked && currentFeedback && (
            <div
              className={`p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
                currentFeedback.isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {currentFeedback.isCorrect ? (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-black tracking-tight">
                      {currentFeedback.isCorrect
                        ? currentQuestion.isReview
                          ? "🎉 Concept Mastered! You remembered and answered correctly!"
                          : "✨ Correct! Well done!"
                        : "❌ Incorrect Answer"}
                    </h4>

                    {!currentFeedback.isCorrect && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                        <RotateCcw className="w-3 h-3" /> Re-queued in 2-3 questions
                      </span>
                    )}
                  </div>

                  {!currentFeedback.isCorrect && (
                    <p className="text-xs text-rose-800/95 dark:text-rose-200/95">
                      The correct answer is:{" "}
                      <strong className="font-black text-emerald-700 dark:text-emerald-300 underline underline-offset-2">
                        {currentFeedback.correctAnswer}
                      </strong>
                    </p>
                  )}

                  {currentFeedback.explanation && (
                    <div className="pt-2 border-t border-current/10 text-xs leading-relaxed opacity-95">
                      <span className="font-bold">💡 Why: </span>
                      <span>{currentFeedback.explanation}</span>
                    </div>
                  )}

                  {!currentFeedback.isCorrect && (
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pt-1">
                      🔁 <strong>Learning Mode:</strong> We've re-queued this question so it appears again a few questions later. That way, you memorize and master it!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(currentIndex - 1);
                setValidationError(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
              Checked {checkedQuestionsCount} of {questions.length} questions
            </span>

            {!isChecked ? (
              <button
                type="button"
                disabled={isChecking}
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isChecking ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : isFinalQuestion ? (
              <button
                type="button"
                onClick={() => {
                  clearAutoAdvance();
                  setShowConfirmModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Quiz</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Jumper Grid */}
        <div className="bg-white dark:bg-[#0E1A38] border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider">
              Question Navigator
            </span>
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Correct
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Incorrect
              </span>
              {requeuedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Review
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const f = feedbacks[q.queueKey];
              const hasEvaluated = Boolean(f?.isChecked);
              const wasCorrect = f?.isCorrect;

              let btnStyle = "";
              if (isCurrent) {
                btnStyle = "ring-2 ring-[#1D4ED8] bg-[#1D4ED8] text-white shadow-xs";
              } else if (hasEvaluated) {
                if (wasCorrect) {
                  btnStyle = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
                } else {
                  btnStyle = "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30";
                }
              } else if (q.isReview) {
                btnStyle = "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30";
              } else {
                btnStyle = "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted";
              }

              return (
                <button
                  key={q.queueKey}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setValidationError(null);
                  }}
                  className={`relative w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${btnStyle}`}
                  title={q.isReview ? `Review Round #${q.reviewRound}` : `Question ${idx + 1}`}
                >
                  {q.isReview ? <RotateCcw className="w-3.5 h-3.5" /> : idx + 1}
                  {q.isReview && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0E1A38]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-foreground">Quit Tournament?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to exit? Your answers so far will be scored as-is.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={() => router.push("/quiz/single/setup")}
                className="px-5 py-2 rounded-xl bg-destructive text-white font-bold text-sm hover:bg-destructive/90 cursor-pointer"
              >
                Quit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Confirm Submission</h3>
            <p className="text-sm text-muted-foreground">
              You evaluated <span className="font-bold text-foreground">{checkedQuestionsCount}</span> of{" "}
              <span className="font-bold text-foreground">{questions.length}</span> question rounds.
            </p>
            {checkedQuestionsCount < questions.length && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 font-medium">
                ⚠️ You still have {questions.length - checkedQuestionsCount} unevaluated question(s).
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitQuiz}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
