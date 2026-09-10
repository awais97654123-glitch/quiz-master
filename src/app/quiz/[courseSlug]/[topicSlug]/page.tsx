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
  HelpCircle,
  Play,
  Share2,
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

interface TopicPageProps {
  params: Promise<{
    courseSlug: string;
    topicSlug: string;
  }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { courseSlug, topicSlug } = await params;
  const cSlug = courseSlug.toLowerCase();
  const tSlug = topicSlug.toLowerCase();

  const topic = await prisma.topic.findFirst({
    where: {
      slug: tSlug,
      course: { slug: cSlug },
    },
    include: {
      course: true,
      _count: { select: { questions: true } },
    },
  });

  if (!topic) {
    return constructMetadata({
      title: "Topic Quiz Not Found",
      description: "The requested quiz topic could not be found.",
      path: `/quiz/${cSlug}/${tSlug}`,
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${topic.name} Quiz — Free ${topic.course.name} MCQ Practice`,
    description: `Practice ${topic.name} multiple-choice questions for ${topic.course.name}. Challenge yourself with interactive MCQs, instant answer feedback, and detailed explanations.`,
    path: `/quiz/${cSlug}/${tSlug}`,
    keywords: [
      `${topic.name.toLowerCase()} quiz`,
      `${topic.name.toLowerCase()} mcq`,
      `${topic.name.toLowerCase()} practice test`,
      `${topic.course.name.toLowerCase()} ${topic.name.toLowerCase()}`,
      "coding quiz",
      "web development mcq",
    ],
  });
}

export default async function TopicQuizPage({ params }: TopicPageProps) {
  const { courseSlug, topicSlug } = await params;
  const cSlug = courseSlug.toLowerCase();
  const tSlug = topicSlug.toLowerCase();

  const topic = await prisma.topic.findFirst({
    where: {
      slug: tSlug,
      course: { slug: cSlug },
    },
    include: {
      course: true,
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
      _count: { select: { questions: true } },
    },
  });

  if (!topic) {
    notFound();
  }

  // Related sibling topics in the same course
  const siblingTopics = await prisma.topic.findMany({
    where: {
      courseId: topic.courseId,
      id: { not: topic.id },
    },
    take: 6,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const topicFaqs = [
    {
      question: `What concepts are covered in the ${topic.name} quiz?`,
      answer: `This practice quiz specifically focuses on core rules, syntax variations, edge cases, and practical code scenarios related to ${topic.name} in ${topic.course.name}.`,
    },
    {
      question: `How can I practice ${topic.name} questions?`,
      answer: `Click the 'Start Practice Quiz' button below to launch a targeted exam session loaded exclusively with questions testing ${topic.name}.`,
    },
    {
      question: `Are answers shown immediately during the test?`,
      answer: `Yes, each selected answer is evaluated instantly with color indicators and detailed explanation breakdowns.`,
    },
  ];

  const parsedSampleQuestions = topic.questions.map((q) => {
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
    { name: `${topic.course.name} Quiz`, url: `/quiz/${topic.course.slug}` },
    { name: topic.name, url: `/quiz/${topic.course.slug}/${topic.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const faqSchema = generateFaqSchema(topicFaqs);
  const quizSchema = generateQuizSchema({
    name: `${topic.name} Practice Quiz — ${topic.course.name}`,
    description: `Targeted quiz testing ${topic.name} fundamentals and intermediate mastery.`,
    url: `/quiz/${topic.course.slug}/${topic.slug}`,
    courseName: topic.course.name,
    questionCount: topic._count.questions,
    sampleQuestions: parsedSampleQuestions,
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd schema={[breadcrumbSchema, faqSchema, quizSchema]} />

      <div className="max-w-4xl mx-auto space-y-10">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Topic Hero Card */}
        <header className="p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900/50">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{topic.course.name} Curriculum Topic</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {topic.name} Quiz
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Practice multiple-choice questions on <span className="font-semibold text-slate-900 dark:text-white">{topic.name}</span>.
            Strengthen your comprehension of essential frontend development patterns with instant feedback and academic explanations.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href={`/quiz/single/setup?course=${topic.course.slug}&topic=${topic.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start {topic.name} Quiz</span>
            </Link>

            <Link
              href={`/quiz/${topic.course.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>Back to all {topic.course.name} topics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Overview of Topic Learning */}
        <section aria-label="Topic Learning Guide" className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[#060a17] border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Why Master {topic.name}?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {topic.name} is a key concept in {topic.course.name}. Developers who understand its subtleties write cleaner code, avoid unexpected runtime bugs, and perform better in technical job interviews.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Randomized option shuffling (A, B, C, D) to eliminate pattern guessing.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Balanced difficulty levels covering beginners to advanced edge cases.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Immediate explanations helping you learn why each answer is correct.</span>
            </li>
          </ul>
        </section>

        {/* Sample Questions */}
        {topic.questions.length > 0 && (
          <section aria-label="Sample Questions" className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sample {topic.name} Questions
            </h2>
            <div className="space-y-3">
              {topic.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-white dark:bg-[#080d1e] border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Sample #{idx + 1}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {q.question}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Answer: {q.correctAnswer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Topic FAQs */}
        <section aria-label="Topic FAQ" className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {topic.name} Quiz FAQs
          </h2>
          <div className="space-y-3">
            {topicFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] space-y-1.5"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Sibling Topics */}
        {siblingTopics.length > 0 && (
          <nav aria-label="Related Topics" className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              More {topic.course.name} Quizzes
            </h3>
            <div className="flex flex-wrap gap-2">
              {siblingTopics.map((st) => (
                <Link
                  key={st.id}
                  href={`/quiz/${topic.course.slug}/${st.slug}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c1b] hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {st.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
