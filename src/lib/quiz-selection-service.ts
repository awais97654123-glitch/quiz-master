import prisma from "./prisma";
import { shuffleArray } from "./utils";
import { calculateTopicDistribution, balanceDifficultyQuestions } from "./quiz-engine";
import { generateAndValidateQuestions } from "./ai-question-service";

export interface QuestionSelectionRequest {
  userId?: string;
  courseId: string;
  topicIds: string[];
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  count: number;
}

export interface ClientQuestionItem {
  id: string;
  courseId: string;
  topicId: string;
  subtopic?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: string;
  question: string;
  code?: string | null;
  options: string[];
  topic?: { id: string; name: string };
}

export interface QuizSelectionResult {
  orderedQuestionIds: string[];
  clientQuestions: ClientQuestionItem[];
  topicFulfillments: {
    topicId: string;
    topicName: string;
    requestedCount: number;
    fulfilledCount: number;
  }[];
  totalSelected: number;
}

/**
 * MASTER QUESTION SELECTION SERVICE:
 * Enforces hard topic isolation, per-topic quota allocation, mistake prioritization,
 * difficulty balancing within topics, and zero cross-topic contamination.
 */
export async function getQuizQuestions(
  request: QuestionSelectionRequest
): Promise<QuizSelectionResult> {
  const { userId, courseId, topicIds, difficulty, count } = request;

  // 1. Course Validation
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { topics: true },
  });

  if (!course) {
    throw new Error(`Invalid courseId: ${courseId}`);
  }

  // 2. Exact Topic-to-Course Validation
  const courseTopicIds = new Set(course.topics.map((t) => t.id));
  const validTopicIds = topicIds.filter((tid) => courseTopicIds.has(tid));

  if (validTopicIds.length === 0) {
    throw new Error("None of the selected topics belong to the specified course.");
  }

  // 3. Calculate Independent Distribution Per Topic (Section 11)
  const topicQuotas = calculateTopicDistribution(validTopicIds, count);
  const selectedQuestionsAcrossTopics: any[] = [];
  const topicFulfillments = [];

  // Fetch user's previous mistakes if logged in to prioritize personalized review
  const userProgressMap = new Map<string, any>();
  if (userId) {
    const userProgress = await prisma.userQuestionProgress.findMany({
      where: { userId },
    });
    for (const p of userProgress) {
      userProgressMap.set(p.questionId, p);
    }
  }

  // 4. Process Each Topic Independently (Hard Isolation)
  for (const { topicId, count: topicTargetCount } of topicQuotas) {
    const topicRecord = course.topics.find((t) => t.id === topicId)!;

    // Fetch existing approved questions strictly for this courseId and topicId
    // Exclude flagged or rejected questions, or questions with 2+ reports
    const dbQuestions = await prisma.question.findMany({
      where: {
        courseId,
        topicId,
        status: { in: ["APPROVED", "system"] },
        reportCount: { lt: 2 },
      },
      include: { topic: true },
    });

    let candidatePool = [...dbQuestions];

    // Check if we need more questions for this specific topic
    if (candidatePool.length < topicTargetCount) {
      const missingCount = topicTargetCount - candidatePool.length;
      try {
        const generated = await generateAndValidateQuestions({
          courseId,
          topicId,
          courseName: course.name,
          topicName: topicRecord.name,
          difficulty: difficulty || "MEDIUM",
          count: missingCount,
        });

        if (generated.length > 0) {
          // Re-fetch approved questions from DB to include newly generated ones
          const refreshed = await prisma.question.findMany({
            where: {
              courseId,
              topicId,
              status: "APPROVED",
            },
            include: { topic: true },
          });
          candidatePool = refreshed;
        }
      } catch (genErr) {
        console.warn(`AI generation fallback warning for topic ${topicRecord.name}:`, genErr);
      }
    }

    // Adaptive personalization: sort pool prioritizing questions user previously struggled with
    const prioritizedPool = [...candidatePool].sort((a, b) => {
      const progA = userProgressMap.get(a.id);
      const progB = userProgressMap.get(b.id);

      const scoreA = progA
        ? (progA.incorrectAttempts > 0 ? 100 : 0) + (progA.status === "LEARNING" ? 50 : 0)
        : 25; // unseen
      const scoreB = progB
        ? (progB.incorrectAttempts > 0 ? 100 : 0) + (progB.status === "LEARNING" ? 50 : 0)
        : 25;

      return scoreB - scoreA;
    });

    // Balance difficulty strictly inside this topic
    const topicSelected = balanceDifficultyQuestions(
      prioritizedPool,
      Math.min(topicTargetCount, prioritizedPool.length)
    );

    selectedQuestionsAcrossTopics.push(...topicSelected);

    topicFulfillments.push({
      topicId,
      topicName: topicRecord.name,
      requestedCount: topicTargetCount,
      fulfilledCount: topicSelected.length,
    });
  }

  // 5. Deduplicate and shuffle overall quiz order
  const uniqueQuestions = Array.from(
    new Map(selectedQuestionsAcrossTopics.map((q) => [q.id, q])).values()
  );
  const shuffledQuestions = shuffleArray(uniqueQuestions);

  // 6. Strip correctAnswer and explanation for client safety
  const clientQuestions: ClientQuestionItem[] = shuffledQuestions.map((q) => {
    let parsedOptions: string[] = [];
    try {
      parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
    } catch {
      parsedOptions = [];
    }

    return {
      id: q.id,
      courseId: q.courseId,
      topicId: q.topicId,
      subtopic: q.subtopic,
      difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
      type: q.type,
      question: q.question,
      code: q.code,
      options: shuffleArray(parsedOptions), // randomize option order
      topic: q.topic ? { id: q.topic.id, name: q.topic.name } : undefined,
    };
  });

  return {
    orderedQuestionIds: shuffledQuestions.map((q) => q.id),
    clientQuestions,
    topicFulfillments,
    totalSelected: clientQuestions.length,
  };
}
