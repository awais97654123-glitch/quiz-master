import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { calculateQuizResults } from "@/lib/quiz-engine";

export async function POST(
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
    const submissionTimestamp = new Date();

    // Perform submission evaluation and update inside an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.attempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: true,
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
        throw new Error("ATTEMPT_NOT_FOUND");
      }

      if (attempt.userId !== dbUser.id) {
        throw new Error("FORBIDDEN");
      }

      // Duplicate submission protection: if already submitted, return existing state
      if (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT") {
        return {
          alreadySubmitted: true,
          attemptId: attempt.id,
          score: attempt.score,
          percentage: attempt.percentage,
          accuracy: attempt.accuracy,
          timeTaken: attempt.timeTaken,
        };
      }

      // Parse question bank items for evaluation
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
        submissionTimestamp,
        attempt.quiz.duration
      );

      const finalStatus = evaluation.isTimedOut ? "TIMED_OUT" : "SUBMITTED";

      const updatedAttempt = await tx.attempt.update({
        where: { id: attempt.id },
        data: {
          status: finalStatus,
          submittedAt: submissionTimestamp,
          score: evaluation.score,
          percentage: evaluation.percentage,
          accuracy: evaluation.accuracy,
          timeTaken: evaluation.timeTaken,
        },
      });

      return {
        alreadySubmitted: false,
        attemptId: updatedAttempt.id,
        score: updatedAttempt.score,
        totalQuestions: evaluation.totalQuestions,
        percentage: updatedAttempt.percentage,
        accuracy: updatedAttempt.accuracy,
        timeTaken: updatedAttempt.timeTaken,
        status: finalStatus,
        topicBreakdown: evaluation.topicBreakdown,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "ATTEMPT_NOT_FOUND") {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Submit attempt error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
