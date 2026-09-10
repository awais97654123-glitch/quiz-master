import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const { searchParams } = new URL(req.url);
    const isQuick = searchParams.get("quick") === "1";

    if (isQuick) {
      const quickQuiz = await prisma.quiz.findUnique({
        where: { roomCode },
        select: {
          id: true,
          status: true,
          roomCode: true,
          creatorId: true,
        },
      });

      if (!quickQuiz) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      return NextResponse.json({
        quizId: quickQuiz.id,
        status: quickQuiz.status,
        roomCode: quickQuiz.roomCode,
        creatorId: quickQuiz.creatorId,
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { roomCode },
      include: {
        creator: {
          include: { profile: true },
        },
        course: true,
        participants: {
          take: 100,
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Room not found or invalid room code" }, { status: 404 });
    }

    return NextResponse.json({
      quizId: quiz.id,
      name: quiz.name,
      roomCode: quiz.roomCode,
      status: quiz.status,
      creatorId: quiz.creatorId,
      creatorName: quiz.creator.profile?.name || quiz.creator.email?.split("@")[0] || quiz.creator.phoneNumber || "Host",
      courseName: quiz.course.name,
      questionCount: quiz.questionCount,
      duration: quiz.duration,
      participants: quiz.participants.map((p) => ({
        id: p.user.id,
        name: p.user.profile?.name || p.user.email?.split("@")[0] || p.user.phoneNumber || "Student",
        username: p.user.profile?.username || "student",
        avatarUrl: p.user.profile?.avatarUrl,
        status: p.status,
        joinedAt: p.joinedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Room status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
