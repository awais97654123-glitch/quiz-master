import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { shuffleArray } from "@/lib/utils";
import {
  calculateTopicDistribution,
  prepareQuizQuestions,
  balanceDifficultyQuestions,
} from "@/lib/quiz-engine";
import { z } from "zod";

const StartSingleQuizSchema = z.object({
  name: z.string().min(2, "Quiz name must be at least 2 characters"),
  courseId: z.string().min(1, "Course is required"),
  topicIds: z.array(z.string()).min(1, "At least one topic must be selected"),
  questionCount: z.number().int().min(5).max(50),
  durationMinutes: z.number().int().min(1).max(60).default(15),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);
    const body = await req.json();
    const parsed = StartSingleQuizSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, courseId, topicIds, questionCount, durationMinutes } = parsed.data;

    // Fetch candidate questions from selected topics
    const topicCandidates = await prisma.question.findMany({
      where: {
        topicId: { in: topicIds },
      },
      include: { topic: true },
    });

    if (topicCandidates.length === 0) {
      return NextResponse.json(
        { error: "No questions currently available for the selected topics. Please choose additional topics." },
        { status: 400 }
      );
    }

    // Anti-repetition: Find questions recently answered by this user to avoid duplicate questions
    const recentAnswers = await prisma.answer.findMany({
      where: {
        attempt: { userId: dbUser.id },
      },
      select: { questionId: true },
      orderBy: { answeredAt: "desc" },
      take: 60,
    });
    const recentSeenIds = new Set(recentAnswers.map((a) => a.questionId));

    // Prioritize unseen questions so questions do not repeat endlessly
    const unseen = topicCandidates.filter((q) => !recentSeenIds.has(q.id));
    const seen = topicCandidates.filter((q) => recentSeenIds.has(q.id));
    const prioritizedPool = [...shuffleArray(unseen), ...shuffleArray(seen)];

    const targetCount = Math.min(questionCount, prioritizedPool.length);

    // Select balanced, randomized mix of Easy (~30%), Medium (~40%), and Hard (~30%) questions strictly from selected topics
    const balancedQuestions = balanceDifficultyQuestions(prioritizedPool, targetCount);

    const formattedQuestions = balancedQuestions.map((q) => ({
      ...q,
      difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
      options: JSON.parse(q.options),
    }));

    // Prepare questions with server-side randomization (options and question sequence)
    const { clientQuestions, orderedQuestionIds } = prepareQuizQuestions(formattedQuestions);

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

    // Create Quiz and Attempt inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          creatorId: dbUser.id,
          name,
          courseId,
          questionCount: clientQuestions.length,
          duration: durationMinutes,
          mode: "SINGLE",
          status: "LIVE",
          startedAt,
          quizTopics: {
            create: topicIds.map((tid) => ({ topicId: tid })),
          },
        },
      });

      const attempt = await tx.attempt.create({
        data: {
          quizId: quiz.id,
          userId: dbUser.id,
          startedAt,
          expiresAt,
          status: "IN_PROGRESS",
          attemptQuestions: {
            create: orderedQuestionIds.map((qid, idx) => ({
              questionId: qid,
              orderIndex: idx,
            })),
          },
        },
      });

      return { quiz, attempt };
    });

    return NextResponse.json({
      attemptId: result.attempt.id,
      quizId: result.quiz.id,
      name,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      durationMinutes,
      totalQuestions: clientQuestions.length,
      questions: clientQuestions,
    });
  } catch (error) {
    console.error("Start single quiz error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
