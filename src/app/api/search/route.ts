import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sanitizeRoomCode } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const cleanCode = sanitizeRoomCode(query);

    // Search Topics
    const topics = await prisma.topic.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      include: { course: true },
      take: 4,
    });

    // Search Quizzes (by name or by room PIN / Code)
    const quizzes = await prisma.quiz.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          ...(cleanCode ? [
            { roomCode: { equals: cleanCode } },
            { roomCode: { contains: cleanCode } },
          ] : []),
        ],
      },
      include: { course: true, creator: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // Search Creators/Profiles
    const profiles = await prisma.profile.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 3,
    });

    const results = [
      ...quizzes
        .filter((q) => q.mode === "MULTIPLAYER" && q.roomCode)
        .map((q) => ({
          type: "quiz" as const,
          id: q.id,
          title: `Room #${q.roomCode} — ${q.name}`,
          subtitle: `Live Arena • ${q.course.name} • Status: ${q.status} • Host: ${q.creator.profile?.name || "Host"}`,
          href: `/join/${q.roomCode}`,
        })),
      ...topics.map((t) => ({
        type: "topic" as const,
        id: t.id,
        title: `${t.name} (${t.course.name})`,
        subtitle: `Course Topic • Start a quiz in ${t.name}`,
        href: `/quiz/single/setup?course=${t.course.slug}&topic=${t.id}`,
      })),
      ...quizzes
        .filter((q) => q.mode !== "MULTIPLAYER" || !q.roomCode)
        .map((q) => ({
          type: "quiz" as const,
          id: q.id,
          title: q.name,
          subtitle: `${q.course.name} • ${q.questionCount} Questions • by ${q.creator.profile?.name || "Examiner"}`,
          href: `/quiz/single/setup`,
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
