"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  Play,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

export default function CreateQuizSetupPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>("javascript");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [quizName, setQuizName] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state matching Screen 8
  const [createdRoom, setCreatedRoom] = useState<{
    roomCode: string;
    quizId: string;
    name: string;
    courseName: string;
    questionCount: number;
    durationMinutes: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load courses");
        setIsLoading(false);
      });
  }, []);

  const currentCourse = courses.find((c) => c.slug === selectedCourseSlug) || courses[0];

  useEffect(() => {
    if (currentCourse) {
      if (!quizName || quizName.includes("Quiz") || quizName.includes("Room") || quizName.includes("Tournament")) {
        setQuizName(`${currentCourse.name} Multiplayer Challenge`);
      }
      if (currentCourse.topics?.length > 0) {
        setSelectedTopicIds(currentCourse.topics.slice(0, 4).map((t: any) => t.id));
      }
    }
  }, [selectedCourseSlug, currentCourse]);

  const handleToggleTopic = (topicId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      if (selectedTopicIds.length === 1) {
        setError("At least one topic must remain selected");
        return;
      }
      setSelectedTopicIds(selectedTopicIds.filter((id) => id !== topicId));
      setError(null);
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId]);
      setError(null);
    }
  };

  const handleSelectAll = () => {
    if (currentCourse?.topics) {
      setSelectedTopicIds(currentCourse.topics.map((t: any) => t.id));
      setError(null);
    }
  };

  const handleClearAll = () => {
    if (currentCourse?.topics?.length > 0) {
      setSelectedTopicIds([currentCourse.topics[0].id]);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (selectedTopicIds.length === 0) {
      setError("Please select at least one topic");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: quizName || `${currentCourse.name} Quiz`,
          courseId: currentCourse.id,
          topicIds: selectedTopicIds,
          questionCount,
          durationMinutes,
          description: description.trim() ? description : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Show Screen 8 success view
        setCreatedRoom({
          roomCode: data.roomCode,
          quizId: data.quizId,
          name: quizName,
          courseName: currentCourse.name,
          questionCount,
          durationMinutes,
        });
      } else {
        setError(data.error || "Failed to create quiz room");
        setIsCreating(false);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      setIsCreating(false);
    }
  };

  const copyRoomCode = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <DashboardShell activePath="/quiz/create/setup">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-9 h-9 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  // SCREEN 8: Success / Code & QR Presentation
  if (createdRoom) {
    const joinUrl = typeof window !== "undefined"
      ? `${window.location.origin}/join/${createdRoom.roomCode}`
      : `https://quizmaster.com/join/${createdRoom.roomCode}`;

    return (
      <DashboardShell activePath="/quiz/create/setup">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Quiz Created Successfully!
            </h1>
            <p className="text-sm text-muted-foreground">
              Share this code or QR with your students or peers to join the live session
            </p>
          </div>

          {/* Screen 8 Room Code & QR Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Monospace Code Display */}
            <div className="bg-muted/40 border border-border rounded-xl p-5 text-center space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Quiz Join Code
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-black text-[#1D4ED8] tracking-widest">
                {createdRoom.roomCode}
              </div>
              <button
                type="button"
                onClick={copyRoomCode}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Code"}</span>
              </button>
            </div>

            {/* QR Code Section */}
            <QRCodeDisplay roomCode={createdRoom.roomCode} />

            {/* Quiz Details */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/20 border border-border/60 text-center text-xs">
              <div>
                <p className="text-muted-foreground font-medium">Course</p>
                <p className="font-bold text-foreground mt-0.5">{createdRoom.courseName}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Questions</p>
                <p className="font-bold text-foreground mt-0.5">{createdRoom.questionCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Timer</p>
                <p className="font-bold text-foreground mt-0.5">{createdRoom.durationMinutes} mins</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push(`/room/${createdRoom.roomCode}`)}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Enter Live Lobby</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedRoom(null);
                  setIsCreating(false);
                }}
                className="py-3.5 px-6 rounded-xl border border-border hover:bg-muted font-bold text-sm text-foreground transition-all cursor-pointer"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // SCREEN 7: Create Quiz Form
  return (
    <DashboardShell activePath="/quiz/create/setup">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - Screen 7 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Create Quiz
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Host a synchronized live exam room with instant invite code & QR
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold self-start">
            <Users className="w-3.5 h-3.5" />
            <span>Multiplayer Room</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateRoom} className="space-y-6">
          {/* Quiz Name */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quiz Name
            </label>
            <input
              type="text"
              required
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="e.g. JavaScript Arrays & Async Programming"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-semibold text-base focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 transition-all"
            />
          </div>

          {/* Select Course - Screen 7 Pill Buttons */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Select Course
            </label>
            <div className="grid grid-cols-3 gap-3">
              {courses.map((course) => {
                const isSelected = selectedCourseSlug === course.slug;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseSlug(course.slug)}
                    className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-[#1D4ED8] text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-600/20"
                        : "bg-muted/40 hover:bg-muted text-foreground border border-border/70"
                    }`}
                  >
                    <span className="text-base">{course.name}</span>
                    <span className={`text-[11px] font-normal ${isSelected ? "text-blue-100" : "text-muted-foreground"}`}>
                      {course.topics?.length || 0} topics
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Topics - Screen 7 Checkbox Cards */}
          {currentCourse && (
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Select Topics
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedTopicIds.length} of {currentCourse.topics?.length || 0} topics selected
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[#1D4ED8] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {currentCourse.topics?.map((topic: any) => {
                  const isChecked = selectedTopicIds.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleToggleTopic(topic.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "bg-blue-500/10 border-blue-500/40 text-[#1D4ED8] font-semibold"
                          : "bg-background border-border/70 text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-[#1D4ED8] text-white"
                            : "border border-muted-foreground/40"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs truncate font-medium">{topic.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Questions & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Number of Questions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 15, 20, 50].map((num) => {
                  const isSelected = questionCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`py-2.5 rounded-xl font-bold text-sm text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#1D4ED8] text-white shadow-sm"
                          : "bg-muted/40 hover:bg-muted text-foreground border border-border/70"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Time Limit (Minutes)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 30].map((mins) => {
                  const isSelected = durationMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2.5 rounded-xl font-bold text-sm text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#1D4ED8] text-white shadow-sm"
                          : "bg-muted/40 hover:bg-muted text-foreground border border-border/70"
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button - Screen 7 "Create & Generate Code" */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-4 px-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                <span>Create & Generate Code</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
