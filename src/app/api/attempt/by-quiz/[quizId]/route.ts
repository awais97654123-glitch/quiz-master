import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { shuffleArray } from "@/lib/utils";
import { shuffleOptionsWithSeed } from "@/lib/quiz-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
        quizQuestions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Find attempt for this user
    let attempt = await prisma.attempt.findFirst({
      where: { quizId, userId: dbUser.id },
      include: {
        attemptQuestions: {
          include: {
            question: {
              include: { topic: true },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
        answers: true,
      },
    });

    // If attempt doesn't exist yet, create one
    if (!attempt) {
      const startedAt = quiz.startedAt || new Date();
      const expiresAt = new Date(startedAt.getTime() + quiz.duration * 60 * 1000);
      const questionIds = quiz.quizQuestions.map((qq) => qq.questionId);
      const shuffledIds = shuffleArray(questionIds);

      attempt = await prisma.attempt.create({
        data: {
          quizId,
          userId: dbUser.id,
          startedAt,
          expiresAt,
          status: "IN_PROGRESS",
          attemptQuestions: {
            create: shuffledIds.map((qid, idx) => ({
              questionId: qid,
              orderIndex: idx,
            })),
          },
        },
        include: {
          attemptQuestions: {
            include: {
              question: {
                include: { topic: true },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
          answers: true,
        },
      });
    }

    // Check timer expiration
    if (new Date() > new Date(attempt.expiresAt.getTime() + 5000) && attempt.status === "IN_PROGRESS") {
      await prisma.attempt.update({
        where: { id: attempt.id },
        data: { status: "TIMED_OUT", submittedAt: attempt.expiresAt },
      });
      return NextResponse.json({ isFinished: true, attemptId: attempt.id, status: "TIMED_OUT" });
    }

    if (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT") {
      return NextResponse.json({ isFinished: true, attemptId: attempt.id, status: attempt.status });
    }

    const clientQuestions = attempt.attemptQuestions.map((aq) => {
      const q = aq.question;
      const rawOptions = JSON.parse(q.options);
      const options = shuffleOptionsWithSeed(rawOptions, `${attempt.id}_${q.id}`);
      return {
        id: q.id,
        courseId: q.courseId,
        topicId: q.topicId,
        difficulty: q.difficulty,
        type: q.type,
        question: q.question,
        code: q.code,
        options,
        topic: q.topic,
        orderIndex: aq.orderIndex,
      };
    });

    const savedAnswers: Record<string, string> = {};
    for (const ans of attempt.answers) {
      savedAnswers[ans.questionId] = ans.selectedAnswer;
    }

    return NextResponse.json({
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizName: quiz.name,
      roomCode: quiz.roomCode,
      courseName: quiz.course.name,
      startedAt: attempt.startedAt.toISOString(),
      expiresAt: attempt.expiresAt.toISOString(),
      status: attempt.status,
      durationMinutes: quiz.duration,
      questions: clientQuestions,
      savedAnswers,
    });
  } catch (error) {
    console.error("by-quiz attempt error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
