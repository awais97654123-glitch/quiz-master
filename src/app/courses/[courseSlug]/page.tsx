import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Code2,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Play,
  Share2,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateBreadcrumbSchema, generateCourseSchema } from "@/lib/schema-generator";

export const dynamic = "force-dynamic";

interface CoursePageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const cleanSlug = courseSlug.toLowerCase();

  const course = await prisma.course.findUnique({
    where: { slug: cleanSlug },
    include: { _count: { select: { topics: true, questions: true } } },
  });

  if (!course) {
    return constructMetadata({
      title: "Course Not Found",
      description: "The requested programming course could not be found.",
      path: `/courses/${cleanSlug}`,
      noIndex: true,
    });
  }

  const courseName = course.name;
  return constructMetadata({
    title: `${courseName} Course Curriculum & Topic Quizzes`,
    description: `Master ${courseName} concepts with our verified topic syllabus. Study definitions, common pitfalls, and take targeted practice quizzes with instant feedback.`,
    path: `/courses/${cleanSlug}`,
    keywords: [
      `${courseName.toLowerCase()} course`,
      `${courseName.toLowerCase()} curriculum`,
      `${courseName.toLowerCase()} topics`,
      `${courseName.toLowerCase()} quiz`,
      `${courseName.toLowerCase()} mcqs`,
      `learn ${courseName.toLowerCase()}`,
    ],
  });
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const cleanSlug = courseSlug.toLowerCase();

  const course = await prisma.course.findUnique({
    where: { slug: cleanSlug },
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
  });

  if (!course) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Courses", path: "/courses" },
    { label: course.name, path: `/courses/${course.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const courseSchema = generateCourseSchema({
    name: course.name,
    description: `Comprehensive ${course.name} curriculum with strictly isolated topic assessments.`,
    courseSlug: course.slug,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B] text-foreground">
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={courseSchema} />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-5xl mx-auto space-y-4">
          <Breadcrumbs items={breadcrumbs} className="text-slate-400" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <span>Course Guide & Tracks</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {course.name} Course Curriculum
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Structured {course.name} curriculum featuring {course.topics.length} isolated learning topics and {course._count.questions} verified conceptual questions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={`/quiz/single/setup?course=${encodeURIComponent(course.slug)}`}
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Full Course Quiz</span>
            </Link>
            <Link
              href="/courses"
              className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Topic Syllabus Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-foreground">
                Course Topics & Modules ({course.topics.length})
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Select a topic to read its conceptual definition, study common mistakes, and take a focused practice quiz.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {course.topics.map((topic, index) => (
              <div
                key={topic.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-blue-500/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">Module {index + 1}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {topic._count.questions} Questions
                    </span>
                  </div>

                  <div>
                    <Link
                      href={`/courses/${course.slug}/${topic.slug}`}
                      className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      {topic.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      Explore {topic.name} key concepts, implementation patterns, and practical assessment questions.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  <Link
                    href={`/courses/${course.slug}/${topic.slug}`}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Read Concepts
                  </Link>
                  <Link
                    href={`/quiz/single/setup?course=${encodeURIComponent(course.slug)}&topic=${encodeURIComponent(topic.slug)}`}
                    className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Practice Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
