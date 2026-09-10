import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateQuestionsWithGemini } from "@/lib/gemini";
import { z } from "zod";

const GenerateRequestSchema = z.object({
  courseId: z.string().min(1),
  topicId: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  count: z.number().int().min(1).max(10).default(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { courseId, topicId, difficulty, count } = parsed.data;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });

    if (!course || !topic) {
      return NextResponse.json({ error: "Invalid course or topic" }, { status: 400 });
    }

    // Call Gemini generation service
    const generated = await generateQuestionsWithGemini(
      course.name,
      topic.name,
      difficulty,
      count
    );

    let savedCount = 0;
    const savedQuestions = [];

    for (const q of generated) {
      // Check for duplicates
      const duplicate = await prisma.question.findFirst({
        where: {
          courseId,
          topicId,
          question: q.question,
        },
      });

      if (!duplicate) {
        const record = await prisma.question.create({
          data: {
            courseId,
            topicId,
            difficulty: q.difficulty,
            type: q.type,
            question: q.question,
            code: q.code,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            generationSource: process.env.GEMINI_API_KEY
              ? "gemini"
              : process.env.OPENAI_API_KEY
              ? "openai"
              : "curriculum_engine",
          },
        });
        savedCount++;
        savedQuestions.push({
          ...record,
          options: q.options,
        });
      }
    }

    return NextResponse.json({
      success: true,
      requestedCount: count,
      generatedCount: generated.length,
      savedCount,
      questions: savedQuestions,
    });
  } catch (error) {
    console.error("Generate questions API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
