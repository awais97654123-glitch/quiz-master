import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { calculateQuizResults } from "@/lib/quiz-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            course: true,
          },
        },
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

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Ownership check (or creator viewing participant result)
    if (attempt.userId !== dbUser.id && attempt.quiz.creatorId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (attempt.status !== "SUBMITTED" && attempt.status !== "TIMED_OUT") {
      return NextResponse.json(
        { error: "Results are not available until the quiz has been submitted." },
        { status: 400 }
      );
    }

    const questions = attempt.attemptQuestions.map((aq) => {
      const q = aq.question;
      return {
        id: q.id,
        courseId: q.courseId,
        topicId: q.topicId,
        difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
        type: q.type,
        question: q.question,
        code: q.code,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
      };
    });

    const userAnswers = attempt.answers.map((a) => ({
      questionId: a.questionId,
      selectedAnswer: a.selectedAnswer,
    }));

    const evaluation = calculateQuizResults(
      questions,
      userAnswers,
      attempt.startedAt,
      attempt.submittedAt || attempt.expiresAt,
      attempt.quiz.duration
    );

    return NextResponse.json({
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizName: attempt.quiz.name,
      courseName: attempt.quiz.course.name,
      status: attempt.status,
      score: attempt.score ?? evaluation.score,
      totalQuestions: evaluation.totalQuestions,
      percentage: attempt.percentage ?? evaluation.percentage,
      accuracy: attempt.accuracy ?? evaluation.accuracy,
      timeTaken: attempt.timeTaken ?? evaluation.timeTaken,
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: attempt.submittedAt?.toISOString() || null,
      topicBreakdown: evaluation.topicBreakdown,
      reviewedQuestions: evaluation.evaluatedAnswers.map((ea) => {
        const q = questions.find((item) => item.id === ea.questionId)!;
        return {
          questionId: ea.questionId,
          question: q.question,
          code: q.code,
          options: q.options,
          selectedAnswer: ea.selectedAnswer,
          correctAnswer: ea.correctAnswer,
          isCorrect: ea.isCorrect,
          explanation: ea.explanation,
          topicName: q.topic?.name || "General",
          difficulty: q.difficulty,
        };
      }),
    });
  } catch (error) {
    console.error("Get result error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
