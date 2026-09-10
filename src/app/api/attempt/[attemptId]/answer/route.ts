import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { z } from "zod";

const RecordAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedAnswer: z.string().min(1),
});

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
    const body = await req.json();
    const parsed = RecordAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { questionId, selectedAnswer } = parsed.data;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        attemptQuestions: {
          where: { questionId },
          include: { question: true },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt has already been submitted or expired" }, { status: 400 });
    }

    // Check timer expiration
    if (new Date() > new Date(attempt.expiresAt.getTime() + 5000)) {
      await prisma.attempt.update({
        where: { id: attempt.id },
        data: { status: "TIMED_OUT", submittedAt: attempt.expiresAt },
      });
      return NextResponse.json({ error: "Time has expired" }, { status: 400 });
    }

    const targetQuestion = attempt.attemptQuestions[0]?.question;
    if (!targetQuestion) {
      return NextResponse.json({ error: "Question not part of this quiz attempt" }, { status: 400 });
    }

    const isCorrect = selectedAnswer === targetQuestion.correctAnswer;

    // Upsert answer
    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
      create: {
        attemptId,
        questionId,
        selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      answerId: answer.id,
      isCorrect,
      correctAnswer: targetQuestion.correctAnswer,
      explanation: targetQuestion.explanation || null,
    });
  } catch (error) {
    console.error("Save answer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
