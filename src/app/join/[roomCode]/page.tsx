"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  LogIn,
  BookOpen,
  Clock,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";

export default function JoinQuizPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  const router = useRouter();

  const [quizDetails, setQuizDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/room/${roomCode}/status`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setQuizDetails(data);
          setIsLoading(false);
        } else {
          setError(data.error || "Room not found");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load room");
        setIsLoading(false);
      });
  }, [roomCode]);

  const handleJoin = async () => {
    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push(`/login?redirect=/join/${roomCode}`);
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const res = await fetch(`/api/room/${roomCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/room/${roomCode}`);
      } else {
        setError(data.error || "Failed to join room");
        setIsJoining(false);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !quizDetails) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-[#0E1A38] border border-border p-8 rounded-2xl shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Room Unavailable</h2>
          <p className="text-sm text-muted-foreground">{error || "Invalid or expired room code."}</p>
          <Link
            href="/join"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white font-bold text-sm"
          >
            Try Another Code
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex flex-col">
      {/* Dark Blue Header Banner - Screen 9 */}
      <header className="bg-[#0B132B] text-white py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <QuizMasterLogo size="md" variant="light" showText={false} />
              <div>
                <span className="font-black text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  QuizMaster
                </span>
                <span className="block text-[11px] text-blue-200/70 font-medium">
                  Live Assessment Arena
                </span>
              </div>
            </Link>
          </div>

          <div className="text-center sm:text-right">
            <h1 className="text-lg sm:text-xl font-black text-white">
              Quiz Room Invitation
            </h1>
            <p className="text-xs text-blue-200/80 font-mono">
              Room PIN: {roomCode}
            </p>
          </div>
        </div>
      </header>

      {/* Main Join Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white dark:bg-[#0E1A38] border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] px-2 py-0.5 rounded-full bg-blue-500/10">
                  {quizDetails.courseName}
                </span>
                <h2 className="text-xl font-black text-foreground mt-1 truncate">
                  {quizDetails.name}
                </h2>
              </div>
            </div>

            {/* Room Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground font-medium block">Host Examiner</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block truncate">
                  {quizDetails.creatorName || "Instructor"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground font-medium block">Questions</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">
                  {quizDetails.questionCount} Items
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground font-medium block">Duration</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">
                  {quizDetails.duration} Minutes
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground font-medium block">Room Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
                  {quizDetails.status === "WAITING" ? "Waiting for Host" : "In Progress"}
                </span>
              </div>
            </div>

            {/* Join Action */}
            <button
              type="button"
              disabled={isJoining}
              onClick={handleJoin}
              className="w-full py-4 px-6 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isJoining ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Enter Live Lobby</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
