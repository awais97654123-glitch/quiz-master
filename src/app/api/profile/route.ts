import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  institution: z.string().min(2, "Institution is required"),
  avatarUrl: z.string().optional().nullable(),
  bio: z.string().max(250).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);

    // Calculate real profile statistics from attempts
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: dbUser.id,
        status: { in: ["SUBMITTED", "TIMED_OUT"] },
      },
      include: {
        quiz: {
          include: { course: true },
        },
        answers: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    const totalQuizzes = attempts.length;
    let totalScore = 0;
    let bestScore = 0;
    let totalQuestionsAnswered = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let fastestCompletion = Infinity;

    for (const att of attempts) {
      const score = att.score ?? 0;
      totalScore += att.percentage ?? 0;
      if ((att.percentage ?? 0) > bestScore) {
        bestScore = att.percentage ?? 0;
      }
      if (att.timeTaken && att.timeTaken > 0 && att.timeTaken < fastestCompletion) {
        fastestCompletion = att.timeTaken;
      }

      for (const ans of att.answers) {
        totalQuestionsAnswered++;
        if (ans.isCorrect) correctAnswers++;
        else incorrectAnswers++;
      }
    }

    const quizzesCreated = await prisma.quiz.count({
      where: { creatorId: dbUser.id },
    });

    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    const accuracy = totalQuestionsAnswered > 0 ? Math.round((correctAnswers / totalQuestionsAnswered) * 100) : 0;

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        phoneNumber: dbUser.phoneNumber,
        createdAt: dbUser.createdAt,
      },
      profile: dbUser.profile,
      stats: {
        totalQuizzes,
        quizzesCreated,
        averageScore,
        bestScore: Math.round(bestScore),
        totalQuestionsAnswered,
        correctAnswers,
        incorrectAnswers,
        accuracy,
        fastestCompletion: fastestCompletion !== Infinity ? fastestCompletion : null,
      },
      history: attempts.slice(0, 20),
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);
    const body = await req.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, username, institution, avatarUrl, bio } = parsed.data;

    // Check if username is taken by another user
    const existing = await prisma.profile.findFirst({
      where: {
        username,
        userId: { not: dbUser.id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: dbUser.id },
      update: {
        name,
        username,
        institution,
        avatarUrl,
        bio,
        profileCompleted: true,
      },
      create: {
        userId: dbUser.id,
        name,
        username,
        institution,
        avatarUrl,
        bio,
        profileCompleted: true,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Profile POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
