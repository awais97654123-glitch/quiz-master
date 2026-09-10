"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Code2,
  HelpCircle,
  Layers,
} from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";

export default function AdminGenerateQuestionsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [count, setCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        const cList = data.courses || [];
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourseId(cList[0].id);
          if (cList[0].topics?.length > 0) {
            setSelectedTopicId(cList[0].topics[0].id);
          }
        }
      });
  }, []);

  const currentCourse = courses.find((c) => c.id === selectedCourseId);

  useEffect(() => {
    if (currentCourse?.topics?.length > 0) {
      setSelectedTopicId(currentCourse.topics[0].id);
    }
  }, [selectedCourseId, currentCourse]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGeneratedResult(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/admin/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          topicId: selectedTopicId,
          difficulty,
          count,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedResult(data);
      } else {
        setError(data.error || "Failed to generate questions");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Question Bank
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-academic-blue" />
            <span>AI Question Generation Pipeline</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Produce educationally rigorous, validated questions using Google Gemini AI.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="bg-card border border-border p-7 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Course Discipline
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-academic-blue/40"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Target Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-academic-blue/40"
            >
              {currentCourse?.topics?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-center rounded-xl border text-xs font-bold transition-all ${
                    difficulty === d
                      ? "bg-academic-blue text-white border-academic-blue shadow-sm"
                      : "bg-background border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setCount(cnt)}
                  className={`py-2 text-center rounded-xl border text-xs font-bold transition-all ${
                    count === cnt
                      ? "bg-academic-blue text-white border-academic-blue shadow-sm"
                      : "bg-background border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-3 px-4 rounded-xl bg-academic-blue text-white font-bold text-sm hover:bg-academic-blue/90 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? "Executing Gemini Pipeline & Validating Schema..." : "Generate & Validate Questions"}</span>
        </button>
      </form>

      {/* Generated Results Preview */}
      {generatedResult && (
        <div className="space-y-4 animate-in fade-in zoom-in-98 duration-150">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                Generated {generatedResult.generatedCount} questions • Saved {generatedResult.savedCount} validated
                entries into Database!
              </span>
            </div>
            <Link
              href="/admin/questions"
              className="text-xs underline font-semibold hover:text-emerald-800 dark:hover:text-emerald-200"
            >
              View in Question Bank →
            </Link>
          </div>

          <div className="space-y-4">
            {generatedResult.questions?.map((q: any, idx: number) => (
              <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-bold text-academic-blue">AI Generated #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-muted font-medium">{q.difficulty}</span>
                </div>

                <p className="text-base font-semibold text-foreground leading-relaxed">{q.question}</p>

                {q.code && <CodeBlock code={q.code} />}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt: string) => {
                    const isCorrect = opt === q.correctAnswer;
                    return (
                      <div
                        key={opt}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <span className="text-[10px] uppercase font-bold text-emerald-600">✓ Key</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
                  <span className="font-bold text-foreground">Explanation: </span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
