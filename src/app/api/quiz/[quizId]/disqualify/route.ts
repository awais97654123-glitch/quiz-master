import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { z } from "zod";

const DisqualifySchema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().optional().default("Academic Dishonesty: Unauthorized Tab Switch"),
});

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
    const body = await req.json();
    const parsed = DisqualifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { targetUserId, reason } = parsed.data;

    // Check that requester is the creator of the quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.creatorId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the quiz creator can disqualify participants" },
        { status: 403 }
      );
    }

    // Find target user's attempt
    const attempt = await prisma.attempt.findFirst({
      where: { quizId, userId: targetUserId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Participant attempt not found" }, { status: 404 });
    }

    // Mark attempt as TIMED_OUT / disqualified
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "TIMED_OUT",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Participant disqualified: ${reason}`,
      targetUserId,
    });
  } catch (error) {
    console.error("Disqualify participant error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
