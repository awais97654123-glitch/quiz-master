import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Code2,
  Layers,
  Zap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  HelpCircle,
  Play,
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
      title: "Course Quiz Not Found",
      description: "The requested programming quiz course could not be found.",
      path: `/quiz/${cleanSlug}`,
      noIndex: true,
    });
  }

  const courseName = course.name;
  return constructMetadata({
    title: `${courseName} Quiz — Free ${courseName} MCQ Practice Test`,
    description: `Test and enhance your ${courseName} skills with our free online quiz. Practice ${course._count.questions} verified multiple-choice questions across ${course._count.topics} curriculum topics with instant scoring.`,
    path: `/quiz/${cleanSlug}`,
    keywords: [
      `${courseName.toLowerCase()} quiz`,
      `free ${courseName.toLowerCase()} quiz`,
      `${courseName.toLowerCase()} mcqs`,
      `${courseName.toLowerCase()} practice test`,
      `${courseName.toLowerCase()} test online`,
      "coding quiz",
      "web development quiz",
    ],
  });
}

export default async function CourseQuizPage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const cleanSlug = courseSlug.toLowerCase();

  const course = await prisma.course.findUnique({
    where: { slug: cleanSlug },
    include: {
      topics: {
        orderBy: { name: "asc" },
      },
      questions: {
        take: 3,
        select: {
          id: true,
          question: true,
          options: true,
          correctAnswer: true,
          explanation: true,
          difficulty: true,
        },
      },
      _count: {
        select: {
          questions: true,
          topics: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Related other courses
  const otherCourses = await prisma.course.findMany({
    where: {
      id: { not: course.id },
    },
    take: 2,
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const courseFaqs = [
    {
      question: `What concepts does this ${course.name} quiz test?`,
      answer: `This ${course.name} assessment covers fundamental syntax, core architecture, best practices, and real-world debugging across ${course._count.topics} distinct curriculum topics.`,
    },
    {
      question: `How many questions are in the ${course.name} practice test?`,
      answer: `Our question bank contains ${course._count.questions} high-quality questions balanced dynamically between Easy, Medium, and Hard difficulty levels.`,
    },
    {
      question: `Are answers and explanations provided after each ${course.name} question?`,
      answer: `Yes! Every question features instant feedback with color-coded right/wrong highlights and a detailed academic explanation.`,
    },
    {
      question: `Is this ${course.name} quiz suitable for job interview preparation?`,
      answer: `Yes, many questions replicate technical frontend developer interview screenings and junior-to-mid level practical challenges.`,
    },
  ];

  const parsedSampleQuestions = course.questions.map((q) => {
    let opts: string[] = [];
    try {
      opts = JSON.parse(q.options);
    } catch {
      opts = ["A", "B", "C", "D"];
    }
    return {
      question: q.question,
      options: opts,
      correctAnswer: q.correctAnswer,
    };
  });

  const breadcrumbItems = [
    { name: "Quizzes", url: "/quiz" },
    { name: `${course.name} Quiz`, url: `/quiz/${course.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const faqSchema = generateFaqSchema(courseFaqs);
  const quizSchema = generateQuizSchema({
    name: `${course.name} Master Practice Quiz`,
    description: `Complete ${course.name} exam covering ${course._count.topics} core curriculum topics.`,
    url: `/quiz/${course.slug}`,
    courseName: course.name,
    questionCount: course._count.questions,
    sampleQuestions: parsedSampleQuestions,
  });

  const isHtml = course.slug === "html";
  const isCss = course.slug === "css";
  const isJs = course.slug === "javascript";

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd schema={[breadcrumbSchema, faqSchema, quizSchema]} />

      <div className="max-w-5xl mx-auto space-y-12">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Course Header */}
        <header className="p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900/50">
              {isHtml && <Code2 className="w-4 h-4" />}
              {isCss && <Layers className="w-4 h-4" />}
              {isJs && <Zap className="w-4 h-4" />}
              <span>Official Curriculum Assessment</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {course.name} Quiz &amp; MCQs
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Test your knowledge of {course.name} with {course._count.questions} carefully curated multiple-choice questions.
              Covers {course._count.topics} topics across beginner, intermediate, and advanced levels with instant feedback.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href={`/quiz/single/setup?course=${course.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start {course.name} Practice Test</span>
              </Link>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                <span>• {course._count.questions} Questions</span>
                <span>• {course._count.topics} Topics</span>
                <span>• Free &amp; Unlimited</span>
              </div>
            </div>
          </div>
        </header>

        {/* Detailed Topic Curriculum Grid */}
        <section aria-label="Curriculum Topics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {course.name} Quiz Topics &amp; Syllabus
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Choose a specific topic below to practice targeted multiple-choice questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {course.topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/quiz/${course.slug}/${topic.slug}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 group transition-all"
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {topic.name}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between mt-1">
                  <span>Practice MCQs</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sample Question Preview */}
        {course.questions.length > 0 && (
          <section aria-label="Sample Questions" className="p-8 rounded-2xl bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Sample {course.name} Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                A glimpse of the types of conceptual and practical questions included in this exam.
              </p>
            </div>

            <div className="space-y-4">
              {course.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Question {idx + 1}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {q.question}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Answer: {q.correctAnswer} — {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Course FAQs */}
        <section aria-label="Course FAQ" className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {course.name} Quiz FAQs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] space-y-2"
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

        {/* Related Quizzes Navigation */}
        <nav aria-label="Related Quizzes" className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Related Quizzes &amp; Topics
          </h3>
          <div className="flex flex-wrap gap-4">
            {otherCourses.map((c) => (
              <Link
                key={c.id}
                href={`/quiz/${c.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] hover:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white transition-colors"
              >
                <span>{c.name} Quiz</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </Link>
            ))}
            <Link
              href="/online-test"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] hover:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white transition-colors"
            >
              <span>Online Practice Test Hub</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
