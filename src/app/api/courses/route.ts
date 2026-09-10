import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        topics: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
