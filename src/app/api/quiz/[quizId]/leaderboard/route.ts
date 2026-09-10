import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rankLeaderboardEntries } from "@/lib/quiz-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        attempts: {
          include: {
            user: {
              include: { profile: true },
            },
            attemptQuestions: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const unrankedEntries = quiz.attempts.map((att) => ({
      userId: att.userId,
      name: att.user.profile?.name || att.user.email?.split("@")[0] || att.user.phoneNumber || "Student",
      username: att.user.profile?.username || "student",
      avatarUrl: att.user.profile?.avatarUrl,
      institution: att.user.profile?.institution,
      score: att.score ?? 0,
      totalQuestions: att.attemptQuestions.length > 0 ? att.attemptQuestions.length : quiz.questionCount,
      percentage: att.percentage ?? 0,
      accuracy: att.accuracy ?? 0,
      timeTaken: att.timeTaken ?? 0,
      submittedAt: att.submittedAt ? att.submittedAt.toISOString() : null,
      status: att.status as "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT",
    }));

    const rankedEntries = rankLeaderboardEntries(unrankedEntries);

    const isAllFinished =
      rankedEntries.length > 0 &&
      rankedEntries.every((e) => e.status === "SUBMITTED" || e.status === "TIMED_OUT");

    return NextResponse.json({
      quizId: quiz.id,
      creatorId: quiz.creatorId,
      name: quiz.name,
      status: quiz.status,
      isFinished: quiz.status === "FINISHED" || isAllFinished,
      leaderboard: rankedEntries,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
