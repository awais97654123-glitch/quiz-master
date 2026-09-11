import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Timer,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Code2,
  Layers,
  HelpCircle,
  Award,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateBreadcrumbSchema, generateFaqSchema } from "@/lib/schema-generator";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Practice Tests & Technical MCQs — Web Development",
  description:
    "Take free online practice tests for web developers. Timed examinations for HTML, CSS, and JavaScript with server-authoritative scoring, instant explanations, and performance metrics.",
  path: "/online-test",
  keywords: [
    "online test",
    "online practice test",
    "free online test",
    "web development practice test",
    "coding assessment",
    "technical test online",
    "programming test",
  ],
});

const ONLINE_TEST_FAQS = [
  {
    question: "What makes Quiz Master Arena online tests different from standard quizzes?",
    answer:
      "Our practice tests feature server-authoritative timers that prevent client-side clock tampering, randomized options to prevent pattern memory, and comprehensive post-test performance analytics.",
  },
  {
    question: "Can I take an online practice test without creating an account?",
    answer:
      "Yes! You can immediately start practicing tests as a guest, or log in to track your completion history, accuracy metrics, and leaderboard rankings.",
  },
  {
    question: "How are the practice test questions structured?",
    answer:
      "Each assessment is comprised of verified multiple-choice questions (MCQs) balanced across Easy, Medium, and Hard difficulty levels.",
  },
];

export const dynamic = "force-dynamic";

export default async function OnlineTestPage() {
  let courses: any[] = [];
  try {
    courses = await prisma.course.findMany({
      include: {
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
    console.warn("OnlineTestPage DB fetch error:", err);
  }

  const breadcrumbItems = [{ name: "Online Practice Tests", url: "/online-test" }];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const faqSchema = generateFaqSchema(ONLINE_TEST_FAQS);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd schema={[breadcrumbSchema, faqSchema]} />

      <div className="max-w-5xl mx-auto space-y-12">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900/50">
            <Timer className="w-3.5 h-3.5" />
            <span>Server-Authoritative Testing Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Free Online Practice Tests
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Evaluate your technical readiness with timed assessments engineered to mirror frontend job screenings and certification exams.
          </p>
        </header>

        {/* Test Format Cards */}
        <section aria-label="Available Practice Tests" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Timed Assessment
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {course._count.questions} MCQs
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {course.name} Practice Test
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Structured assessment covering all {course._count.topics} curriculum topics with server-timed countdowns.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/quiz/single/setup?course=${course.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Launch Practice Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Examination Guide */}
        <section aria-label="Test Instructions" className="p-8 rounded-2xl bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            How Our Online Practice Tests Work
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>1. Select Course &amp; Topics</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose a full comprehensive exam across all subjects or drill down into targeted topics.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Timer className="w-5 h-5" />
                <span>2. Timed Simulation</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Answer each randomized question within the server timer constraint to test your practical speed.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Award className="w-5 h-5" />
                <span>3. Instant Scoring</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review your final accuracy percentage, duration, and question-by-question explanations immediately.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section aria-label="Online Test FAQs" className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Online Practice Test FAQs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ONLINE_TEST_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] space-y-1.5"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Navigation */}
        <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Browse our complete quiz catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
