import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import { sendWelcomeEmail, sendQuizResultEmail, sendRoomInviteEmail } from "@/lib/email";
import { z } from "zod";

const SendEmailSchema = z.object({
  type: z.enum(["welcome", "quiz_result", "room_invite", "test"]),
  toEmail: z.string().email(),
  userName: z.string().optional(),
  quizName: z.string().optional(),
  score: z.number().optional(),
  totalQuestions: z.number().optional(),
  percentage: z.number().optional(),
  attemptId: z.string().optional(),
  roomCode: z.string().optional(),
  inviterName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    switch (data.type) {
      case "welcome": {
        const result = await sendWelcomeEmail({
          toEmail: data.toEmail,
          userName: data.userName,
        });
        return NextResponse.json(result);
      }
      case "quiz_result": {
        if (!data.quizName || data.score === undefined || !data.totalQuestions || !data.attemptId) {
          return NextResponse.json({ error: "Missing quiz result parameters" }, { status: 400 });
        }
        const result = await sendQuizResultEmail({
          toEmail: data.toEmail,
          userName: data.userName,
          quizName: data.quizName,
          score: data.score,
          totalQuestions: data.totalQuestions,
          percentage: data.percentage ?? Math.round((data.score / data.totalQuestions) * 100),
          attemptId: data.attemptId,
        });
        return NextResponse.json(result);
      }
      case "room_invite": {
        if (!data.roomCode || !data.quizName) {
          return NextResponse.json({ error: "Missing room invite parameters" }, { status: 400 });
        }
        const result = await sendRoomInviteEmail({
          toEmail: data.toEmail,
          inviterName: data.inviterName || "Quiz Master Host",
          roomCode: data.roomCode,
          quizName: data.quizName,
        });
        return NextResponse.json(result);
      }
      case "test": {
        const result = await sendWelcomeEmail({
          toEmail: data.toEmail,
          userName: data.userName || "Tester",
        });
        return NextResponse.json({ success: true, message: "Test email dispatched via Resend", result });
      }
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Resend API route error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
