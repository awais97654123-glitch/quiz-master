import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  HelpCircle,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateQuizSchema,
} from "@/lib/schema-generator";

export const metadata: Metadata = constructMetadata({
  title: "All Online Quizzes & Practice Tests — HTML, CSS, JavaScript MCQs",
  description:
    "Explore free interactive quizzes and MCQs for web developers. Practice HTML5, CSS3, Flexbox, Grid, and Modern JavaScript with server-timed tests and instant answer explanations.",
  path: "/quiz",
  keywords: [
    "online quiz",
    "free online quiz",
    "online test",
    "MCQ quiz",
    "practice quiz",
    "HTML quiz",
    "CSS quiz",
    "JavaScript quiz",
    "programming quiz",
    "web development quiz",
  ],
});

const QUIZ_FAQS = [
  {
    question: "What web development quizzes are available on Quiz Master Arena?",
    answer:
      "Quiz Master Arena provides comprehensive multiple choice quizzes covering HTML5 semantic structure and forms, CSS3 styling including Flexbox and Grid, and modern JavaScript from core basics to advanced closures, promises, and async programming.",
  },
  {
    question: "Are all online practice quizzes free to take?",
    answer:
      "Yes, all single-player practice quizzes and multiplayer competitive arena modes on Quiz Master Arena are 100% free with unlimited retakes.",
  },
  {
    question: "How does the quiz scoring and timing work?",
    answer:
      "Quizzes utilize server-authoritative timers to ensure fair evaluation. When a question is answered, you receive immediate feedback highlighting correct options along with detailed explanations to reinforce understanding.",
  },
  {
    question: "Can I take quizzes on specific topics instead of full courses?",
    answer:
      "Yes, you can practice specific curriculum topics such as Semantic HTML, CSS Flexbox, JavaScript Async/Await, or take comprehensive multi-topic assessments.",
  },
];

export default async function AllQuizzesPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          topics: true,
          questions: true,
        },
      },
      topics: {
        take: 6,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const totalQuestions = courses.reduce((acc, c) => acc + c._count.questions, 0);

  const breadcrumbItems = [{ name: "Quizzes", url: "/quiz" }];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const faqSchema = generateFaqSchema(QUIZ_FAQS);
  const quizSchema = generateQuizSchema({
    name: "Web Development Master Quiz & Practice Arena",
    description:
      "Comprehensive test covering HTML, CSS, and modern JavaScript with instant answer evaluations.",
    url: "/quiz",
    courseName: "Web Development",
    questionCount: totalQuestions || 100,
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd schema={[breadcrumbSchema, faqSchema, quizSchema]} />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Web Development Assessments</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Free Online Quizzes &amp; Practice Tests
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Test your programming mastery with verified multiple-choice questions across{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">100+ curriculum topics</span>.
            Instant explanations, randomized options, and server-authoritative timers.
          </p>
        </header>

        {/* Course Catalog Cards */}
        <section aria-label="Available Quiz Courses" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isHtml = course.slug === "html";
            const isCss = course.slug === "css";
            const isJs = course.slug === "javascript";

            return (
              <article
                key={course.id}
                className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] shadow-sm hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-250"
              >
                <div>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isHtml
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          : isCss
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isHtml && <Code2 className="w-6 h-6" />}
                      {isCss && <Layers className="w-6 h-6" />}
                      {isJs && <Zap className="w-6 h-6" />}
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {course._count.questions} MCQs Available
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.name} Quiz
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {isHtml &&
                      "Master document structure, semantic tags, forms, accessibility, and modern HTML5 APIs."}
                    {isCss &&
                      "Sharpen your modern styling knowledge with Flexbox, CSS Grid, media queries, and box model mechanics."}
                    {isJs &&
                      "Challenge yourself with core JS syntax, ES6+, closures, promises, DOM manipulation, and asynchronous patterns."}
                  </p>

                  {/* Popular Topics Preview */}
                  <div className="space-y-2 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Sample Topics:
                    </span>
                    <ul className="flex flex-wrap gap-1.5 list-none p-0">
                      {course.topics.map((topic) => (
                        <li key={topic.id}>
                          <Link
                            href={`/quiz/${course.slug}/${topic.slug}`}
                            className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            {topic.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={`/quiz/${course.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Syllabus &amp; Topics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/quiz/single/setup?course=${course.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    Start Quiz
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* Feature Highlights Section */}
        <section aria-label="Quiz Features" className="p-8 rounded-2xl bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Why Practice on Quiz Master Arena?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Server-Timed Fairness
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Timers are synchronized strictly on the backend to provide genuine exam simulation without client-side tampering.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Instant Detailed Answers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Learn from your mistakes instantly with clear technical explanations for both correct and incorrect options.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Difficulty Balanced
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Questions are balanced dynamically across Easy, Medium, and Hard tiers to fit beginners and seasoned developers alike.
              </p>
            </div>
          </div>
        </section>

        {/* Visible FAQ Section */}
        <section aria-label="Frequently Asked Questions" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Everything you need to know about our free web development online quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {QUIZ_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] space-y-2"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base flex items-start gap-2">
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

        {/* Footer Deep Internal Links */}
        <nav aria-label="Quick Directory Links" className="text-center pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Looking for more specialized practice?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <Link href="/topics" className="text-blue-600 dark:text-blue-400 hover:underline">
              All 108 Curriculum Topics
            </Link>
            <span>•</span>
            <Link href="/online-test" className="text-blue-600 dark:text-blue-400 hover:underline">
              Timed Online Practice Tests
            </Link>
            <span>•</span>
            <Link href="/mcq" className="text-blue-600 dark:text-blue-400 hover:underline">
              Multiple Choice Questions Directory
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
