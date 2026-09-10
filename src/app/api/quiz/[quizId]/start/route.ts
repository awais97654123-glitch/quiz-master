import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { shuffleArray } from "@/lib/utils";

export async function POST(
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
        quizQuestions: true,
        participants: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Room security: Only creator can start
    if (quiz.creatorId !== dbUser.id) {
      return NextResponse.json({ error: "Only the quiz creator can start the session" }, { status: 403 });
    }

    if (quiz.status === "LIVE") {
      return NextResponse.json({ message: "Quiz already in progress", quizId });
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + quiz.duration * 60 * 1000);

    // Update quiz status and generate attempts for all participants
    await prisma.$transaction(async (tx) => {
      await tx.quiz.update({
        where: { id: quizId },
        data: {
          status: "LIVE",
          startedAt,
        },
      });

      const questionIds = quiz.quizQuestions.map((qq) => qq.questionId);

      // Create an attempt for every participant who joined
      for (const participant of quiz.participants) {
        const existingAttempt = await tx.attempt.findFirst({
          where: { quizId, userId: participant.userId },
        });

        if (!existingAttempt) {
          // Randomize question order per participant
          const randomizedQids = shuffleArray(questionIds);
          await tx.attempt.create({
            data: {
              quizId,
              userId: participant.userId,
              startedAt,
              expiresAt,
              status: "IN_PROGRESS",
              attemptQuestions: {
                create: randomizedQids.map((qid, idx) => ({
                  questionId: qid,
                  orderIndex: idx,
                })),
              },
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      roomCode: quiz.roomCode,
      status: "LIVE",
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Start quiz error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
