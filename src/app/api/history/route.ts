import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);
    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get("course");
    const mode = searchParams.get("mode"); // "SINGLE" | "MULTIPLAYER"

    const where: any = {
      userId: dbUser.id,
      status: { in: ["SUBMITTED", "TIMED_OUT"] },
    };

    if (courseSlug && courseSlug !== "all") {
      where.quiz = {
        course: { slug: courseSlug },
      };
    }

    if (mode && mode !== "all") {
      where.quiz = {
        ...(where.quiz || {}),
        mode,
      };
    }

    const attempts = await prisma.attempt.findMany({
      where,
      include: {
        quiz: {
          include: { course: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    const historyItems = attempts.map((att) => ({
      attemptId: att.id,
      quizId: att.quizId,
      quizName: att.quiz.name,
      courseName: att.quiz.course.name,
      courseSlug: att.quiz.course.slug,
      mode: att.quiz.mode,
      score: att.score ?? 0,
      percentage: att.percentage ?? 0,
      accuracy: att.accuracy ?? 0,
      timeTaken: att.timeTaken ?? 0,
      status: att.status,
      submittedAt: att.submittedAt ? att.submittedAt.toISOString() : att.startedAt.toISOString(),
    }));

    return NextResponse.json({ history: historyItems });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
