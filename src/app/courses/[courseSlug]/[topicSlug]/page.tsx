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
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateBreadcrumbSchema, generateQuizSchema } from "@/lib/schema-generator";
import { getTopicCurriculum, getVerifiedCurriculumQuestions } from "@/lib/topic-curriculum";

export const dynamic = "force-dynamic";

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
    include: { course: true },
  });

  if (!topic) {
    return constructMetadata({
      title: "Topic Guide Not Found",
      description: "The requested programming topic guide could not be found.",
      path: `/courses/${cSlug}/${tSlug}`,
      noIndex: true,
    });
  }

  const topicName = topic.name;
  const courseName = topic.course.name;

  return constructMetadata({
    title: `${topicName} — ${courseName} Concepts & Practice Test`,
    description: `Comprehensive educational guide to ${topicName} in ${courseName}. Understand core principles, avoid common misconceptions, and test your knowledge with verified interactive MCQs.`,
    path: `/courses/${cSlug}/${tSlug}`,
    keywords: [
      `${topicName.toLowerCase()} ${courseName.toLowerCase()}`,
      `${topicName.toLowerCase()} concepts`,
      `${topicName.toLowerCase()} quiz`,
      `${topicName.toLowerCase()} practice test`,
      `${topicName.toLowerCase()} mcqs`,
      `learn ${topicName.toLowerCase()}`,
    ],
  });
}

export default async function TopicEducationalPage({ params }: TopicPageProps) {
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
      _count: {
        select: { questions: true },
      },
    },
  });

  if (!topic) {
    notFound();
  }

  const course = topic.course;
  const curriculum = getTopicCurriculum(course.name, topic.name);
  const sampleQuestions = getVerifiedCurriculumQuestions(course.name, topic.name, 2);

  // Fetch sibling topics for related concepts navigation
  const siblingTopics = await prisma.topic.findMany({
    where: {
      courseId: course.id,
      id: { not: topic.id },
    },
    take: 4,
    orderBy: { name: "asc" },
  });

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Courses", path: "/courses" },
    { label: course.name, path: `/courses/${course.slug}` },
    { label: topic.name, path: `/courses/${course.slug}/${topic.slug}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const quizSchema = generateQuizSchema({
    topicName: topic.name,
    courseName: course.name,
    courseSlug: course.slug,
    topicSlug: topic.slug,
    questionCount: topic._count.questions,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1B] text-foreground">
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={quizSchema} />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-5xl mx-auto space-y-4">
          <Breadcrumbs items={breadcrumbs} className="text-slate-400" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              {course.name} Guide
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {topic._count.questions} Verified Questions
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {topic.name}
          </h1>

          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            {curriculum?.definition ||
              `Master ${topic.name} in ${course.name}. Explore core mental models, code behaviors, and diagnostic assessment questions.`}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/quiz/single/setup?course=${encodeURIComponent(course.slug)}&topic=${encodeURIComponent(topic.slug)}`}
              className="py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start {topic.name} Practice Quiz</span>
            </Link>
            <Link
              href={`/courses/${course.slug}`}
              className="py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all"
            >
              View Full {course.name} Syllabus
            </Link>
          </div>
        </div>
      </section>

      {/* Main Educational Layout */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Core Concepts Grid */}
        {curriculum && curriculum.coreConcepts.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Core Concepts & Learning Objectives
                </h2>
                <p className="text-xs text-muted-foreground">
                  Key mechanics and cognitive principles tested in this topic.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {curriculum.coreConcepts.map((concept, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-2.5 text-xs text-foreground/90 font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{concept}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Common Misconceptions & Traps */}
        {curriculum && curriculum.commonMisconceptions.length > 0 && (
          <section className="bg-card border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Common Learner Misconceptions & Traps
                </h2>
                <p className="text-xs text-muted-foreground">
                  Frequently misunderstood behaviors to watch out for during practice.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {curriculum.commonMisconceptions.map((misconception, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground/90 flex items-start gap-3"
                >
                  <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{misconception}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sample Question Previews */}
        {sampleQuestions.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Sample Conceptual Questions
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real examples of verified questions testing this topic.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sampleQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-muted-foreground">
                      Question Preview #{idx + 1}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                      {q.difficulty}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    {q.question}
                  </p>

                  {q.code && (
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                      <code>{q.code}</code>
                    </pre>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-muted-foreground"
                      >
                        <span className="font-bold text-foreground mr-1.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-muted-foreground">
                    <strong className="text-blue-600 dark:text-blue-400 font-semibold mr-1">
                      Conceptual Explanation:
                    </strong>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-black text-white">
              Ready to Test Your {topic.name} Skills?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-lg leading-relaxed">
              Experience our server-authoritative assessment engine with instant conceptual feedback,
              mistake history tracking, and timed exam simulation.
            </p>
          </div>

          <Link
            href={`/quiz/single/setup?course=${encodeURIComponent(course.slug)}&topic=${encodeURIComponent(topic.slug)}`}
            className="py-3.5 px-6 rounded-2xl bg-white text-blue-700 font-black text-sm hover:bg-blue-50 shadow-md transition-all shrink-0 inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-blue-700" />
            <span>Launch Quiz</span>
          </Link>
        </section>

        {/* Related Sibling Topics */}
        {siblingTopics.length > 0 && (
          <section className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-foreground">
              Explore Related {course.name} Topics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {siblingTopics.map((sib) => (
                <Link
                  key={sib.id}
                  href={`/courses/${course.slug}/${sib.slug}`}
                  className="p-3.5 rounded-xl bg-card border border-border hover:border-blue-500/40 text-xs font-bold text-foreground/90 hover:text-blue-600 transition-colors block text-center"
                >
                  {sib.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
