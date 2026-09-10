"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Play,
  BookOpen,
  Clock,
  Layers,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";

function SingleQuizSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCourse = searchParams.get("course") || "html";
  const defaultTopic = searchParams.get("topic");

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>(defaultCourse);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [quizName, setQuizName] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!quizName || quizName.includes("Quiz") || quizName.includes("Assessment") || quizName.includes("Test")) {
        setQuizName(`${currentCourse.name} Quiz`);
      }
      if (defaultTopic && currentCourse.topics?.some((t: any) => t.id === defaultTopic)) {
        setSelectedTopicIds([defaultTopic]);
      } else if (currentCourse.topics?.length > 0) {
        // default select first 4 topics
        setSelectedTopicIds(currentCourse.topics.slice(0, 4).map((t: any) => t.id));
      }
    }
  }, [selectedCourseSlug, currentCourse]);

  const handleToggleTopic = (topicId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      if (selectedTopicIds.length === 1) {
        setError("Please select at least one topic");
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

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("codequiz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (selectedTopicIds.length === 0) {
      setError("Please select at least one topic for your quiz");
      return;
    }

    setIsStarting(true);
    try {
      const res = await fetch("/api/quiz/single/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: quizName || `${currentCourse?.name || "Code"} Quiz`,
          courseId: currentCourse?.id,
          topicIds: selectedTopicIds,
          questionCount,
          durationMinutes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/quiz/single/${data.attemptId}`);
      } else {
        setError(data.error || "Failed to start quiz");
        setIsStarting(false);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell activePath="/">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-9 h-9 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activePath="/">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - Matching Screen 4 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Single Quiz
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customize your solo practice test and challenge your skills
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[#1D4ED8] text-xs font-bold self-start">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Mode</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleStartQuiz} className="space-y-6">
          {/* Quiz Name Input */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quiz Name
            </label>
            <input
              type="text"
              required
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="e.g. HTML Basics & Modern Layouts"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-semibold text-base focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/40 transition-all"
            />
          </div>

          {/* Select Course - Screen 4 Pill Buttons */}
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
                        : "bg-muted/40 hover:bg-muted text-foreground border border-border/70 hover:border-border"
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

          {/* Select Topics - Screen 4 Checkbox Cards */}
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

          {/* Questions & Duration - Screen 4 Grid */}
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

          {/* Action Button - Screen 4 Big Blue "Start Quiz" Button */}
          <button
            type="submit"
            disabled={isStarting}
            className="w-full py-4 px-6 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isStarting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Quiz</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}

export default function SingleQuizSetupPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell activePath="/">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-3 border-[#1D4ED8] border-t-transparent animate-spin" />
          </div>
        </DashboardShell>
      }
    >
      <SingleQuizSetupContent />
    </Suspense>
  );
}
