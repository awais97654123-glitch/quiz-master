import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.count();
  const topics = await prisma.topic.count();
  const questions = await prisma.question.count();
  const users = await prisma.user.count();

  console.log("=== NEON POSTGRESQL STATS ===");
  console.log(`Courses: ${courses}`);
  console.log(`Topics: ${topics}`);
  console.log(`Total Questions: ${questions}`);
  console.log(`Users: ${users}`);

  const sampleQuestions = await prisma.question.findMany({
    take: 3,
    select: {
      question: true,
      difficulty: true,
      course: { select: { name: true } },
      topic: { select: { name: true } }
    }
  });
  console.log("Sample questions in Neon DB:", JSON.stringify(sampleQuestions, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
