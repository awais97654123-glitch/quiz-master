import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { getQuizQuestions } from "@/lib/quiz-selection-service";
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

    // Use Unified Master Question Selection Service (Hard Topic Isolation & Mistakes Priority)
    const selection = await getQuizQuestions({
      userId: dbUser.id,
      courseId,
      topicIds,
      count: questionCount,
    });

    if (selection.totalSelected === 0) {
      return NextResponse.json(
        { error: "No validated questions available for the selected topics. Please choose additional topics." },
        { status: 400 }
      );
    }

    const clientQuestions = selection.clientQuestions;
    const orderedQuestionIds = selection.orderedQuestionIds;

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
