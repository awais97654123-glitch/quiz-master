import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);

    const quiz = await prisma.quiz.findUnique({
      where: { roomCode },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 404 });
    }

    if (quiz.status === "FINISHED" || quiz.status === "CANCELLED") {
      return NextResponse.json({ error: "This quiz session has ended" }, { status: 400 });
    }

    // Add or update participant
    const participant = await prisma.quizParticipant.upsert({
      where: {
        quizId_userId: {
          quizId: quiz.id,
          userId: dbUser.id,
        },
      },
      update: {
        status: "JOINED",
        lastSeenAt: new Date(),
      },
      create: {
        quizId: quiz.id,
        userId: dbUser.id,
        status: "JOINED",
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      roomCode: quiz.roomCode,
      status: quiz.status,
      participant: {
        id: participant.user.id,
        name: participant.user.profile?.name || participant.user.email?.split("@")[0] || participant.user.phoneNumber || "Student",
        username: participant.user.profile?.username || "student",
        avatarUrl: participant.user.profile?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Room join error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
