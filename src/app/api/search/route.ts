import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search Topics
    const topics = await prisma.topic.findMany({
      where: {
        name: { contains: query },
      },
      include: { course: true },
      take: 4,
    });

    // Search Quizzes
    const quizzes = await prisma.quiz.findMany({
      where: {
        name: { contains: query },
      },
      include: { course: true, creator: { include: { profile: true } } },
      take: 4,
    });

    // Search Creators/Profiles
    const profiles = await prisma.profile.findMany({
      where: {
        OR: [{ name: { contains: query } }, { username: { contains: query } }],
      },
      take: 3,
    });

    const results = [
      ...topics.map((t) => ({
        type: "topic" as const,
        id: t.id,
        title: `${t.name} (${t.course.name})`,
        subtitle: `Course Topic • Start a quiz in ${t.name}`,
        href: `/quiz/single/setup?course=${t.course.slug}&topic=${t.id}`,
      })),
      ...quizzes.map((q) => ({
        type: "quiz" as const,
        id: q.id,
        title: q.name,
        subtitle: `${q.course.name} • ${q.questionCount} Questions • by ${q.creator.profile?.name || "Examiner"}`,
        href: q.mode === "MULTIPLAYER" && q.roomCode ? `/join/${q.roomCode}` : `/quiz/single/setup`,
      })),
      ...profiles.map((p) => ({
        type: "creator" as const,
        id: p.id,
        title: p.name,
        subtitle: `@${p.username} • ${p.institution}`,
        href: `/profile`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
