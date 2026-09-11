import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  HelpCircle,
  Code2,
  Layers,
  Zap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateBreadcrumbSchema, generateFaqSchema } from "@/lib/schema-generator";

export const metadata: Metadata = constructMetadata({
  title: "HTML, CSS & JavaScript MCQs — Free Web Development Multiple Choice Questions",
  description:
    "Practice hundreds of verified multiple-choice questions (MCQs) for HTML5, CSS3, and JavaScript. Categorized by difficulty from beginner fundamentals to advanced frontend development.",
  path: "/mcq",
  keywords: [
    "HTML MCQs",
    "CSS MCQs",
    "JavaScript MCQs",
    "MCQ quiz",
    "programming MCQs",
    "coding multiple choice questions",
    "frontend developer MCQs",
  ],
});

const MCQ_FAQS = [
  {
    question: "What are multiple choice questions (MCQs) on Quiz Master Arena?",
    answer:
      "Our MCQs are four-option questions designed by educators to test conceptual understanding, syntax knowledge, code output prediction, and debugging skills.",
  },
  {
    question: "Are question options always in the same order?",
    answer:
      "No. Every question option is deterministically randomized (A, B, C, D) for each test attempt to eliminate position-bias memory.",
  },
  {
    question: "Are MCQs categorized by difficulty?",
    answer:
      "Yes, questions are tagged as Easy, Medium, or Hard, allowing learners of all experience levels to test their skills effectively.",
  },
];

export const dynamic = "force-dynamic";

export default async function McqDirectoryPage() {
  let courses: any[] = [];
  try {
    courses = await prisma.course.findMany({
      include: {
        topics: {
          take: 8,
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            questions: true,
            topics: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.warn("McqDirectoryPage DB fetch error:", err);
  }

  const breadcrumbItems = [{ name: "MCQs Directory", url: "/mcq" }];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const faqSchema = generateFaqSchema(MCQ_FAQS);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd schema={[breadcrumbSchema, faqSchema]} />

      <div className="max-w-5xl mx-auto space-y-12">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900/50">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Curated MCQ Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Web Development MCQs
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Practice multiple-choice questions across HTML5, CSS3, and JavaScript.
            Explore topic-level questions with verified answers and explanations.
          </p>
        </header>

        {/* Course MCQs Collections */}
        <section aria-label="MCQ Categories" className="space-y-8">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {course.name} MCQs
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {course._count.questions} questions across {course._count.topics} curriculum topics
                  </p>
                </div>

                <Link
                  href={`/quiz/${course.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>View all {course.name} MCQs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {course.topics.map((topic: any) => (
                  <Link
                    key={topic.id}
                    href={`/quiz/${course.slug}/${topic.slug}`}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#080d1e] hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* FAQs */}
        <section aria-label="MCQ FAQs" className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            MCQ Practice FAQs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MCQ_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] space-y-1.5"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {faq.question}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Explore all 108 topics in our complete curriculum index</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
