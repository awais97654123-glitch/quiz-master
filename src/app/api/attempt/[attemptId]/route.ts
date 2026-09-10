import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { shuffleOptionsWithSeed } from "@/lib/quiz-engine";

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
          include: { course: true },
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

    // Ownership check
    if (attempt.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already submitted, indicate redirect to result
    if (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT") {
      return NextResponse.json({
        isFinished: true,
        attemptId: attempt.id,
        status: attempt.status,
      });
    }

    // Check if timer has expired on server
    const now = new Date();
    if (now > new Date(attempt.expiresAt.getTime() + 5000)) {
      // Auto-submit expired attempt
      await prisma.attempt.update({
        where: { id: attempt.id },
        data: {
          status: "TIMED_OUT",
          submittedAt: attempt.expiresAt,
        },
      });

      return NextResponse.json({
        isFinished: true,
        attemptId: attempt.id,
        status: "TIMED_OUT",
      });
    }

    // Prepare questions WITHOUT correct answers or explanations
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

    // Map existing answered questions
    const answeredMap: Record<string, string> = {};
    for (const ans of attempt.answers) {
      answeredMap[ans.questionId] = ans.selectedAnswer;
    }

    return NextResponse.json({
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizName: attempt.quiz.name,
      courseName: attempt.quiz.course.name,
      startedAt: attempt.startedAt.toISOString(),
      expiresAt: attempt.expiresAt.toISOString(),
      status: attempt.status,
      durationMinutes: attempt.quiz.duration,
      questions: clientQuestions,
      savedAnswers: answeredMap,
    });
  } catch (error) {
    console.error("Get attempt error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
