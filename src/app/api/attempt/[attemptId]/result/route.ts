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
        subtopic: (q as any).subtopic || "General",
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

    // Fetch user's persistent learning records for these questions
    const questionIds = questions.map((q) => q.id);
    const progressList = await prisma.userQuestionProgress.findMany({
      where: {
        userId: dbUser.id,
        questionId: { in: questionIds },
      },
    });
    const progressMap = new Map(progressList.map((p) => [p.questionId, p]));

    let firstAttemptCorrect = 0;
    let previouslyMissed = 0;
    let recoveredQuestions = 0;
    let needsReview = 0;
    let masteredQuestions = 0;

    const reviewedQuestions = evaluation.evaluatedAnswers.map((ea) => {
      const q = questions.find((item) => item.id === ea.questionId)!;
      const progress = progressMap.get(ea.questionId);

      const hadMistake = progress ? progress.incorrectAttempts > 0 : !ea.isCorrect;
      const incorrectCount = progress ? progress.incorrectAttempts : (!ea.isCorrect ? 1 : 0);
      const correctCount = progress ? progress.correctAttempts : (ea.isCorrect ? 1 : 0);
      const totalAttempts = progress ? progress.attempts : 1;
      const isMastered = progress ? progress.mastered : false;

      if (hadMistake) {
        previouslyMissed++;
        if (ea.isCorrect) {
          recoveredQuestions++;
        }
      } else if (ea.isCorrect) {
        firstAttemptCorrect++;
      }

      if (!ea.isCorrect || progress?.status === "LEARNING") {
        needsReview++;
      }
      if (isMastered) {
        masteredQuestions++;
      }

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
        subtopic: q.subtopic,
        // Historical Learning Metrics (Immutable mistake tracking)
        previouslyIncorrect: hadMistake,
        totalAttempts,
        correctAttempts: correctCount,
        incorrectAttempts: incorrectCount, // NEVER erased!
        masteryStatus: progress?.status || (ea.isCorrect ? "LEARNING" : "LEARNING"),
        mastered: isMastered,
        nextReviewAt: progress?.nextReviewAt?.toISOString() || null,
      };
    });

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
      // Comprehensive Separate Learning Metrics
      learningMetrics: {
        firstAttemptCorrect,
        previouslyMissed,
        recoveredQuestions,
        needsReview,
        masteredQuestions,
        firstAttemptAccuracy: evaluation.totalQuestions > 0 ? Math.round((firstAttemptCorrect / evaluation.totalQuestions) * 100) : 0,
        currentAccuracy: attempt.accuracy ?? evaluation.accuracy,
      },
      reviewedQuestions,
    });
  } catch (error) {
    console.error("Get result error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
