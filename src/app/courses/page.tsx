import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Code2,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  Clock,
  Compass,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema-generator";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Programming Courses & Topic Directory",
    description:
      "Explore comprehensive web development and programming courses. Practice verified multiple-choice questions in JavaScript, CSS, HTML, and more with instant evaluation.",
    path: "/courses",
    keywords: [
      "programming courses",
      "coding courses",
      "JavaScript course",
      "CSS course",
      "HTML course",
      "developer quiz directory",
      "web development curriculum",
    ],
  });
}

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      topics: {
        include: {
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { questions: true, topics: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Courses", path: "/courses" },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const courseListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Web Development Courses & Quizzes",
    description: "Curated learning tracks with verified concept assessments.",
    itemListElement: courses.map((c, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: c.name,
      description: `${c.name} interactive MCQs, core concepts, and diagnostic assessments.`,
      url: `https://quiz-join.vercel.app/courses/${c.slug}`,
    })),
  };

  const getCourseColor = (slug: string) => {
    switch (slug.toLowerCase()) {
      case "javascript":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          gradient: "from-amber-500 to-yellow-500",
          badge: "bg-amber-500/10 text-amber-500",
        };
      case "css":
        return {
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          gradient: "from-blue-500 to-cyan-500",
          badge: "bg-blue-500/10 text-blue-500",
        };
      case "html":
        return {
          bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          gradient: "from-orange-500 to-red-500",
          badge: "bg-orange-500/10 text-orange-500",
        };
      default:
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          gradient: "from-emerald-500 to-teal-500",
          badge: "bg-emerald-500/10 text-emerald-500",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B] text-foreground">
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={courseListSchema} />

      {/* Top Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <Breadcrumbs items={breadcrumbs} className="text-slate-400" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Curated Curriculum
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Programming Courses & Topic Tracks
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Master core computer science and web development concepts through targeted curriculum tracks.
            Every topic is strictly isolated with verified multiple-choice questions, detailed explanations, and conceptual debugging.
          </p>
        </div>
      </section>

      {/* Course Grid */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const colors = getCourseColor(course.slug);
            return (
              <div
                key={course.id}
                className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-blue-500/40"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${colors.bg}`}
                    >
                      {course.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {course._count.questions} Questions
                    </span>
                  </div>

                  <div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="text-xl font-black text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      {course.name} Curriculum
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      Explore {course.name} topics, syntax rules, architectural patterns, and practical reasoning assessments.
                    </p>
                  </div>

                  {/* Topics Preview List */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Key Topics ({course.topics.length})</span>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.topics.slice(0, 5).map((topic) => (
                        <Link
                          key={topic.id}
                          href={`/courses/${course.slug}/${topic.slug}`}
                          className="text-xs px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/50 transition-colors"
                        >
                          {topic.name}
                        </Link>
                      ))}
                      {course.topics.length > 5 && (
                        <span className="text-xs px-2 py-1 text-muted-foreground">
                          +{course.topics.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between gap-3">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-muted/70 hover:bg-muted text-foreground font-bold text-xs text-center transition-colors"
                  >
                    Explore Syllabus
                  </Link>
                  <Link
                    href={`/quiz/single/setup?course=${encodeURIComponent(course.slug)}`}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Practice Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights Section */}
        <section className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-black text-foreground">
              Built for Deep Technical Mastery
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quiz Master Arena goes beyond trivia. Every course is calibrated with cognitive difficulty balancing,
              strict topic isolation, and persistent mistake history tracking so you continuously advance your skills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Strict Topic Isolation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When you choose Promises or Flexbox, 100% of questions directly test that topic without cross-course leakage.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Spaced Repetition</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Historical mistakes are preserved forever. Incorrect questions are automatically queued for timed retention reviews.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Concept-Driven Explanations</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every question includes reasoning explaining why the correct choice works and why common alternatives fail.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
