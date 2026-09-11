import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ReportSchema = z.object({
  reason: z.enum([
    "NOT_RELATED_TO_TOPIC",
    "WRONG_ANSWER",
    "MULTIPLE_CORRECT",
    "WRONG_EXPLANATION",
    "UNCLEAR",
    "DUPLICATE",
    "TYPO",
    "OTHER",
  ]),
  details: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);
    const body = await req.json();
    const parsed = ReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { reason, details } = parsed.data;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Create report and update trust score
    await prisma.$transaction(async (tx) => {
      await tx.questionReport.create({
        data: {
          questionId,
          userId: dbUser.id,
          reason,
          details: details?.trim() || null,
          status: "PENDING",
        },
      });

      const updatedReportCount = question.reportCount + 1;
      const shouldFlag = updatedReportCount >= 2;
      const newTrustScore = Math.max(0, question.trustScore - 20);

      await tx.question.update({
        where: { id: questionId },
        data: {
          reportCount: updatedReportCount,
          trustScore: newTrustScore,
          status: shouldFlag ? "FLAGGED" : question.status,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reporting. This question has been logged for quality review.",
    });
  } catch (error) {
    console.error("Report question error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
