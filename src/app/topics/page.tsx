import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, ArrowRight, Code2, Layers, Zap } from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema-generator";

export const metadata: Metadata = constructMetadata({
  title: "All Web Development Quiz Topics (100+ Topics) — HTML, CSS & JavaScript",
  description:
    "Complete directory of 100+ web development quiz topics. Explore targeted multiple-choice practice tests for HTML5 semantics, CSS Grid, Flexbox, JavaScript ES6+, closures, and asynchronous programming.",
  path: "/topics",
  keywords: [
    "quiz topics",
    "web development topics",
    "HTML topics",
    "CSS topics",
    "JavaScript topics",
    "frontend curriculum",
    "programming syllabus",
  ],
});

export default async function TopicsIndexPage() {
  const courses = await prisma.course.findMany({
    include: {
      topics: {
        orderBy: { name: "asc" },
      },
      _count: {
        select: { topics: true, questions: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const breadcrumbItems = [{ name: "Curriculum Topics", url: "/topics" }];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd schema={breadcrumbSchema} />

      <div className="max-w-6xl mx-auto space-y-12">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900/50">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complete Curriculum Index</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            All Web Development Quiz Topics
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Browse our full taxonomy of web development curriculum topics. Select any topic to access dedicated practice questions and instant answer explanations.
          </p>
        </header>

        {/* Courses and Full Topics Lists */}
        <div className="space-y-12">
          {courses.map((course) => {
            const isHtml = course.slug === "html";
            const isCss = course.slug === "css";

            return (
              <section
                key={course.id}
                aria-labelledby={`course-${course.slug}`}
                className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      {isHtml && <Code2 className="w-5 h-5" />}
                      {isCss && <Layers className="w-5 h-5" />}
                      {!isHtml && !isCss && <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 id={`course-${course.slug}`} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        {course.name} Topics
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {course.topics.length} specialized topics available
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/quiz/${course.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <span>View {course.name} Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {course.topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/quiz/${course.slug}/${topic.slug}`}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#080d1e] hover:border-blue-500/60 hover:bg-blue-50/30 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all truncate"
                    >
                      {topic.name}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
