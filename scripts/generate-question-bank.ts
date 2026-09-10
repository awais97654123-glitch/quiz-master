import { PrismaClient } from "@prisma/client";
import { generateQuestionsWithGemini } from "../src/lib/gemini";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 CodeQuiz Arena - Question Bank Expansion Pipeline");

  const courses = await prisma.course.findMany({
    include: { topics: true },
  });

  if (courses.length === 0) {
    console.error("No courses found. Please run 'npm run seed' first.");
    process.exit(1);
  }

  let totalGenerated = 0;

  for (const course of courses) {
    console.log(`\n📚 Processing Course: ${course.name} (${course.topics.length} topics)`);

    // Target a subset of key topics to expand in this run
    const targetTopics = course.topics.slice(0, 5);

    for (const topic of targetTopics) {
      console.log(`  -> Generating questions for: ${topic.name}...`);
      try {
        const questions = await generateQuestionsWithGemini(
          course.name,
          topic.name,
          "MEDIUM",
          2
        );

        for (const q of questions) {
          const existing = await prisma.question.findFirst({
            where: {
              courseId: course.id,
              topicId: topic.id,
              question: q.question,
            },
          });

          if (!existing) {
            await prisma.question.create({
              data: {
                courseId: course.id,
                topicId: topic.id,
                difficulty: q.difficulty,
                type: q.type,
                question: q.question,
                code: q.code,
                options: JSON.stringify(q.options),
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                generationSource: process.env.GEMINI_API_KEY ? "gemini" : "curriculum_engine",
              },
            });
            totalGenerated++;
          }
        }
      } catch (err) {
        console.warn(`  Failed generating for ${topic.name}:`, err);
      }
    }
  }

  console.log(`\n✨ Successfully added ${totalGenerated} validated questions to the question bank!`);
}

main()
  .catch((e) => {
    console.error("Error generating question bank:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
