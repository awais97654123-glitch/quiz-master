import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getOrCreateDbUser } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { generateRoomCode, shuffleArray } from "@/lib/utils";
import { balanceDifficultyQuestions } from "@/lib/quiz-engine";
import { z } from "zod";

const CreateQuizRoomSchema = z.object({
  name: z.string().min(2, "Quiz name must be at least 2 characters"),
  courseId: z.string().min(1, "Course is required"),
  topicIds: z.array(z.string()).min(1, "At least one topic must be selected"),
  questionCount: z.number().int().min(5).max(50),
  durationMinutes: z.number().int().min(1).max(120).default(15),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const authUser = await verifyAuthToken(authHeader);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(authUser);
    const body = await req.json();
    const parsed = CreateQuizRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, courseId, topicIds, questionCount, durationMinutes, description } = parsed.data;

    // Generate collision-safe 8-digit room code
    let roomCode = generateRoomCode();
    let collisionCheck = await prisma.quiz.findFirst({
      where: { roomCode, status: { in: ["WAITING", "LIVE"] } },
    });

    while (collisionCheck) {
      roomCode = generateRoomCode();
      collisionCheck = await prisma.quiz.findFirst({
        where: { roomCode, status: { in: ["WAITING", "LIVE"] } },
      });
    }

    // Fetch candidate questions strictly from selected topics
    const candidates = await prisma.question.findMany({
      where: {
        topicId: { in: topicIds },
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json({ error: "No questions found for the selected topics. Please choose additional topics." }, { status: 400 });
    }

    const targetCount = Math.min(questionCount, candidates.length);

    // Select balanced, randomized mix of Easy (~30%), Medium (~40%), and Hard (~30%) questions
    const balanced = balanceDifficultyQuestions(shuffleArray(candidates), targetCount);
    const selectedQuestionIds = balanced.map((q) => q.id);

    // Create Quiz in WAITING status with roomCode
    const quiz = await prisma.quiz.create({
      data: {
        creatorId: dbUser.id,
        name,
        courseId,
        questionCount: selectedQuestionIds.length,
        duration: durationMinutes,
        mode: "MULTIPLAYER",
        status: "WAITING",
        roomCode,
        description,
        quizTopics: {
          create: topicIds.map((tid) => ({ topicId: tid })),
        },
        quizQuestions: {
          create: selectedQuestionIds.map((qid, index) => ({
            questionId: qid,
            orderIndex: index,
          })),
        },
      },
    });

    return NextResponse.json({
      quizId: quiz.id,
      roomCode: quiz.roomCode,
      name: quiz.name,
      status: quiz.status,
    });
  } catch (error) {
    console.error("Create quiz room error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
