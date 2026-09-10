"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Sparkles,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Code2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { SubpageHeader } from "@/components/SubpageHeader";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []));
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourseId) params.append("courseId", selectedCourseId);
      if (selectedTopicId) params.append("topicId", selectedTopicId);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
      if (searchQuery) params.append("q", searchQuery);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load admin questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCourseId, selectedTopicId, selectedDifficulty, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this question from the question bank?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setQuestions(questions.filter((q) => q.id !== id));
        setTotalCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to delete question:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const currentCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="min-h-screen bg-background pb-16">
      <SubpageHeader
        title="Question Bank Explorer"
        subtitle="Question Bank Governance & Curriculum Audit"
        badge="Admin"
        backUrl="/"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-academic-blue/10 text-academic-blue text-xs font-semibold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Question Bank Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Question Bank Explorer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit, filter, review, and expand curriculum questions stored in PostgreSQL.
          </p>
        </div>

        <Link
          href="/admin/questions/generate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-academic-blue text-white font-semibold text-sm hover:bg-academic-blue/90 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Question Generator</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-academic-blue/40"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
          {/* Course filter */}
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setSelectedTopicId("");
              setPage(1);
            }}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none"
          >
            <option value="">All Disciplines</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Topic filter */}
          <select
            value={selectedTopicId}
            onChange={(e) => {
              setSelectedTopicId(e.target.value);
              setPage(1);
            }}
            disabled={!selectedCourseId}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none disabled:opacity-50"
          >
            <option value="">All Topics</option>
            {currentCourse?.topics?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Count Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase">
        <span>Showing {questions.length} of {totalCount} Questions</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-academic-blue border-t-transparent animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <Database className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Questions Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting filters or use the Gemini generator to expand this topic.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-academic-blue/10 text-academic-blue">
                    {q.course.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {q.topic.name}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted/60 text-foreground">
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Source: {q.generationSource}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  disabled={deletingId === q.id}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">{q.question}</p>

              {q.code && <CodeBlock code={q.code} />}

              {/* Options */}
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

              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border">
                <span className="font-bold text-foreground">Explanation: </span>
                {q.explanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-semibold text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
