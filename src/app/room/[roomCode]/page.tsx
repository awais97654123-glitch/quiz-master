"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Play,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { useSocketRoom, getSocket } from "@/lib/socket";
import { QuizMasterLogo } from "@/components/QuizMasterLogo";

export default function WaitingRoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  const router = useRouter();

  const [roomData, setRoomData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load current user
  useEffect(() => {
    const userStr = localStorage.getItem("codequiz_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch initial room status
  const fetchRoomStatus = async () => {
    try {
      const res = await fetch(`/api/room/${roomCode}/status`);
      const data = await res.json();
      if (res.ok) {
        setRoomData(data);
        if (data.status === "LIVE") {
          router.push(`/live/${data.quizId}`);
        }
      } else {
        setError(data.error || "Room not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load room");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomStatus();
  }, [roomCode]);

  // Connect to real-time Socket.IO room
  const socketUser = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.profile?.name || currentUser.email?.split("@")[0] || "Student",
        username: currentUser.profile?.username || "student",
        avatarUrl: currentUser.profile?.avatarUrl,
      }
    : null;

  const { socket, participants: liveParticipants } = useSocketRoom(roomCode, socketUser);

  // Listen for real-time quiz start event
  useEffect(() => {
    if (!socket) return;

    function onQuizStarted(data: { roomCode: string; quizId: string }) {
      if (data.roomCode === roomCode) {
        const targetCreatorId = roomData?.creatorId;
        const isCreator = currentUser?.id && targetCreatorId && currentUser.id === targetCreatorId;
        if (isCreator) {
          router.push(`/live/${data.quizId}/dashboard`);
        } else {
          router.push(`/live/${data.quizId}`);
        }
      }
    }

    socket.on("quiz_started", onQuizStarted);
    return () => {
      socket.off("quiz_started", onQuizStarted);
    };
  }, [socket, roomCode, currentUser, roomData, router]);

  // Polling fallback with jitter for high concurrency (100-1000 participants)
  useEffect(() => {
    let timeoutId: any;
    let isCancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/room/${roomCode}/status?quick=1`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "LIVE" && data.quizId) {
            const isCreator = currentUser?.id && data.creatorId && currentUser.id === data.creatorId;
            if (isCreator) {
              router.push(`/live/${data.quizId}/dashboard`);
            } else {
              router.push(`/live/${data.quizId}`);
            }
            return;
          }
        }
      } catch {
        // ignore
      }

      if (!isCancelled) {
        // Randomized jitter between 5000ms - 8000ms prevents server spikes with 100-1000 students
        const nextDelay = 5000 + Math.random() * 3000;
        timeoutId = setTimeout(checkStatus, nextDelay);
      }
    };

    // Initial check after 3 seconds, then jittered
    timeoutId = setTimeout(checkStatus, 3000 + Math.random() * 2000);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roomCode, currentUser, router]);

  const handleStartQuiz = async () => {
    if (!roomData?.quizId) return;
    setIsStarting(true);
    setError(null);

    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/quiz/${roomData.quizId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        if (socket) {
          socket.emit("start_quiz", {
            roomCode,
            quizId: roomData.quizId,
            creatorId: currentUser?.id,
          });
        }
        router.push(`/live/${roomData.quizId}/dashboard`);
      } else {
        setError(data.error || "Failed to start quiz session");
        setIsStarting(false);
      }
    } catch (err: any) {
      setError(err.message || "Start error");
      setIsStarting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-[#0E1A38] border border-border p-8 rounded-2xl shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Room Unavailable</h2>
          <p className="text-sm text-muted-foreground">{error || "Invalid room code"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-sm font-bold hover:bg-blue-700 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCreator = currentUser?.id === roomData.creatorId;
  const allParticipantsMap = new Map();
  roomData.participants?.forEach((p: any) => allParticipantsMap.set(p.id, p));
  liveParticipants?.forEach((p: any) => allParticipantsMap.set(p.id, { ...p, isOnline: true }));
  const combinedParticipants = Array.from(allParticipantsMap.values());

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1B] flex flex-col">
      {/* Screen 10 Top Header */}
      <header className="bg-[#0B132B] text-white py-6 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <QuizMasterLogo size="sm" variant="light" showText={false} />
              <span className="font-black text-lg text-white">QuizMaster</span>
            </Link>
            <span className="text-white/30">•</span>
            <span className="text-xs font-semibold text-blue-200">Live Lobby</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-colors cursor-pointer border border-white/10"
            >
              <span>PIN: {roomCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Screen 10 */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner with Title and Host Controls */}
        <div className="bg-white dark:bg-[#0E1A38] border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#1D4ED8] uppercase">
                {roomData.courseName}
              </span>
              <span className="text-xs text-muted-foreground">
                Hosted by <strong className="text-foreground">{roomData.creatorName}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              {roomData.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {roomData.questionCount} Questions • {roomData.duration} Minutes
            </p>
          </div>

          {/* Screen 10: Big Green "Start Quiz" button for Host */}
          {isCreator ? (
            <button
              onClick={handleStartQuiz}
              disabled={isStarting}
              className="px-7 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isStarting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Quiz Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1D4ED8] text-xs font-bold animate-pulse">
              <Clock className="w-4 h-4" />
              <span>Waiting for host to start the quiz...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column: QR Code & Participants Roster (Screen 10) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR Code Card */}
          <div className="md:col-span-1 space-y-4">
            <QRCodeDisplay roomCode={roomCode} />
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1A38] border border-border/80 text-xs text-muted-foreground space-y-2">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Real-time Synchronized
              </p>
              <p className="text-[11px] leading-relaxed">
                When the host clicks &ldquo;Start Quiz Now&rdquo;, every student screen will instantly transition to the questions with live scoring.
              </p>
            </div>
          </div>

          {/* Connected Participants Roster - Screen 10 */}
          <div className="md:col-span-2 bg-white dark:bg-[#0E1A38] border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1D4ED8]" />
                <h2 className="font-black text-base text-foreground">
                  Participants Joined
                </h2>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/10 text-[#1D4ED8]">
                {combinedParticipants.length} Ready
              </span>
            </div>

            {combinedParticipants.length === 0 ? (
              <div className="py-14 text-center text-muted-foreground text-sm space-y-2">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <p className="font-semibold text-foreground">Waiting for participants...</p>
                <p className="text-xs text-muted-foreground">
                  Invite students by sharing the PIN <strong className="font-mono text-foreground">{roomCode}</strong>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {combinedParticipants.map((p: any) => {
                  const isCurrent = currentUser?.id === p.id;
                  const isRoomCreator = p.id === roomData.creatorId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? "bg-blue-500/5 border-blue-500/40 ring-1 ring-blue-500/20"
                          : "bg-background border-border/70 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}`}
                            alt={p.name}
                            className="w-10 h-10 rounded-full border border-border bg-muted object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-foreground truncate">
                              {p.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#1D4ED8] text-white">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate block">
                            {isRoomCreator ? "Host / Instructor" : `@${p.username || "student"}`}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        Online
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
