import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Play,
  Award,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema-generator";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Free Coding Practice Tests & Skill Drills",
    description:
      "Practice verified web development MCQs across JavaScript, CSS, HTML, and Python. Test your conceptual skills with instant feedback, timed quizzes, and spaced repetition tracking.",
    path: "/practice",
    keywords: [
      "coding practice",
      "programming practice test",
      "JavaScript practice test",
      "CSS practice test",
      "HTML practice test",
      "free MCQ practice",
      "developer skill assessment",
    ],
  });
}

export default async function PracticePage() {
  const courses = await prisma.course.findMany({
    include: {
      topics: {
        include: {
          _count: { select: { questions: true } },
        },
      },
      _count: { select: { questions: true } },
    },
    orderBy: { name: "asc" },
  });

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Practice", path: "/practice" },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B] text-foreground">
      <JsonLd schema={breadcrumbSchema} />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-5xl mx-auto space-y-4">
          <Breadcrumbs items={breadcrumbs} className="text-slate-400" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Assessment Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Developer Practice Arena
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Select your skill track, configure your question count, and test your conceptual reasoning with our server-authoritative engine.
            Track your historical mistakes and reinforce weak topics with spaced repetition.
          </p>
        </div>
      </section>

      {/* Main Practice Tracks */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-blue-500/40"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {course.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {course._count.questions} MCQs
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-black text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.name} Practice
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    Test your conceptual and practical understanding of {course.name} with verified multi-difficulty quizzes.
                  </p>
                </div>

                {/* Topics Preview */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Included Topics ({course.topics.length})
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {course.topics.slice(0, 4).map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-foreground/80 border border-border/40"
                      >
                        {t.name}
                      </span>
                    ))}
                    {course.topics.length > 4 && (
                      <span className="text-[11px] px-1.5 py-0.5 text-muted-foreground">
                        +{course.topics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-border/60 space-y-2">
                <Link
                  href={`/quiz/single/setup?course=${encodeURIComponent(course.slug)}`}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Custom Practice</span>
                </Link>
                <Link
                  href={`/courses/${course.slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-muted/50 hover:bg-muted text-foreground/90 font-bold text-xs block text-center transition-colors"
                >
                  Explore Course Guide
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Multiplayer & Live Practice Callout */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 to-[#0B132B] text-white border border-border/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Multiplayer Live Lobby</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Want to Compete in Real-Time?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Create a multiplayer arena room, share an 8-digit PIN or QR code with classmates or colleagues,
              and race against the clock with live socket synchronization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/quiz/create/setup"
              className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md text-center"
            >
              Host Arena Room
            </Link>
            <Link
              href="/join"
              className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all text-center"
            >
              Enter with PIN
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
