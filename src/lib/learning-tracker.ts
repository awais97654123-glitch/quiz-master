import prisma from "./prisma";

export interface EvaluatedAnswerRecord {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  topicId?: string;
  courseId?: string;
}

export interface AttemptLearningMetrics {
  currentScore: number;
  totalQuestions: number;
  currentAccuracy: number;
  firstAttemptCorrect: number;
  previouslyMissed: number;
  recoveredQuestions: number;
  needsReview: number;
  masteredQuestions: number;
}

/**
 * Calculates spaced repetition review date based on consecutive correct count
 */
export function calculateNextReviewDate(consecutiveCorrect: number, isCorrect: boolean): Date {
  const now = new Date();
  if (!isCorrect) {
    // Mistake made: review within 24 hours
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  // Spaced intervals: 1 -> 3 days, 2 -> 7 days, 3+ -> 21 days
  let intervalDays = 3;
  if (consecutiveCorrect === 2) intervalDays = 7;
  if (consecutiveCorrect >= 3) intervalDays = 21;

  return new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
}

/**
 * Records user attempts in UserQuestionProgress:
 * STRICT RULE: A previous mistake is NEVER erased by a later correct answer.
 * If user had 1 incorrect attempt, and later gets it right, incorrectAttempts remains 1.
 */
export async function recordUserQuestionAttempts(params: {
  userId: string;
  courseId?: string;
  answers: EvaluatedAnswerRecord[];
}): Promise<void> {
  const { userId, courseId, answers } = params;
  const now = new Date();

  for (const item of answers) {
    if (!item.selectedAnswer || item.selectedAnswer.trim() === "") {
      // Skipped question
      continue;
    }

    try {
      const existing = await prisma.userQuestionProgress.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId: item.questionId,
          },
        },
      });

      if (!existing) {
        // First time seeing this question
        const isCorrect = item.isCorrect;
        const nextReviewAt = calculateNextReviewDate(isCorrect ? 1 : 0, isCorrect);

        await prisma.userQuestionProgress.create({
          data: {
            userId,
            questionId: item.questionId,
            courseId: item.courseId || courseId,
            topicId: item.topicId,
            attempts: 1,
            correctAttempts: isCorrect ? 1 : 0,
            incorrectAttempts: isCorrect ? 0 : 1,
            firstIncorrectAt: isCorrect ? null : now,
            lastAttemptAt: now,
            lastCorrectAt: isCorrect ? now : null,
            consecutiveCorrect: isCorrect ? 1 : 0,
            mastered: false,
            status: isCorrect ? "LEARNING" : "LEARNING",
            nextReviewAt,
          },
        });
      } else {
        // Existing question progress update
        const isCorrect = item.isCorrect;
        const newConsecutive = isCorrect ? existing.consecutiveCorrect + 1 : 0;
        const newCorrectCount = isCorrect ? existing.correctAttempts + 1 : existing.correctAttempts;
        // IMMUTABLE HISTORICAL RULE: Never decrement or reset incorrectAttempts!
        const newIncorrectCount = isCorrect ? existing.incorrectAttempts : existing.incorrectAttempts + 1;
        const firstIncorrectAt = existing.firstIncorrectAt || (!isCorrect ? now : null);

        // Mastery criteria: 3 consecutive correct or previously answered correctly multiple times with high consistency
        const isNowMastered = newConsecutive >= 3 || (existing.mastered && isCorrect);
        const newStatus = isNowMastered ? "MASTERED" : (isCorrect ? "REVIEW" : "LEARNING");
        const nextReviewAt = calculateNextReviewDate(newConsecutive, isCorrect);

        await prisma.userQuestionProgress.update({
          where: { id: existing.id },
          data: {
            attempts: existing.attempts + 1,
            correctAttempts: newCorrectCount,
            incorrectAttempts: newIncorrectCount, // Preserved forever!
            firstIncorrectAt,
            lastAttemptAt: now,
            lastCorrectAt: isCorrect ? now : existing.lastCorrectAt,
            consecutiveCorrect: newConsecutive,
            mastered: isNowMastered,
            masteredAt: isNowMastered && !existing.mastered ? now : existing.masteredAt,
            status: newStatus,
            nextReviewAt,
          },
        });
      }

      // Update question aggregate analytics on Question model
      await prisma.question.update({
        where: { id: item.questionId },
        data: {
          timesShown: { increment: 1 },
          timesCorrect: item.isCorrect ? { increment: 1 } : undefined,
          timesIncorrect: !item.isCorrect ? { increment: 1 } : undefined,
        },
      });
    } catch (err) {
      console.warn(`Error tracking progress for question ${item.questionId}:`, err);
    }
  }
}

/**
 * Computes both Current Attempt Performance and Historical Learning Performance:
 * Keeps Current Score completely independent from Historical Mistake metrics.
 */
export async function computeAttemptLearningMetrics(params: {
  userId: string;
  evaluatedAnswers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
}): Promise<AttemptLearningMetrics> {
  const { userId, evaluatedAnswers } = params;
  const totalQuestions = evaluatedAnswers.length;

  let currentScore = 0;
  let firstAttemptCorrect = 0;
  let previouslyMissed = 0;
  let recoveredQuestions = 0;
  let needsReview = 0;
  let masteredQuestions = 0;

  const questionIds = evaluatedAnswers.map((ea) => ea.questionId);
  const progressRecords = await prisma.userQuestionProgress.findMany({
    where: {
      userId,
      questionId: { in: questionIds },
    },
  });
  const progressMap = new Map(progressRecords.map((p) => [p.questionId, p]));

  for (const ea of evaluatedAnswers) {
    if (ea.isCorrect) {
      currentScore++;
    }

    const progress = progressMap.get(ea.questionId);

    if (progress) {
      // Check if user previously made a mistake on this question
      const hadHistoricalMistake = progress.incorrectAttempts > (ea.isCorrect ? 0 : 1);

      if (hadHistoricalMistake) {
        previouslyMissed++;
        if (ea.isCorrect) {
          // Question recovered! Answered correctly today despite past mistake
          recoveredQuestions++;
        }
      } else if (ea.isCorrect && progress.incorrectAttempts === 0) {
        // Pure first-attempt mastery
        firstAttemptCorrect++;
      }

      if (!ea.isCorrect || progress.status === "LEARNING") {
        needsReview++;
      }

      if (progress.mastered) {
        masteredQuestions++;
      }
    } else {
      // First attempt on this question ever
      if (ea.isCorrect) {
        firstAttemptCorrect++;
      } else {
        needsReview++;
      }
    }
  }

  const currentAccuracy = totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0;

  return {
    currentScore,
    totalQuestions,
    currentAccuracy,
    firstAttemptCorrect,
    previouslyMissed,
    recoveredQuestions,
    needsReview,
    masteredQuestions,
  };
}

/**
 * Pure calculation of next review interval in hours and mastery level progression
 */
export function calculateNextReviewInterval(
  consecutiveCorrect: number,
  isCorrect: boolean
): {
  intervalHours: number;
  masteryLevel: "NEW" | "LEARNING" | "REVIEW" | "MASTERED";
  mastered: boolean;
} {
  if (!isCorrect) {
    return { intervalHours: 4, masteryLevel: "LEARNING", mastered: false };
  }
  if (consecutiveCorrect === 1) {
    return { intervalHours: 24, masteryLevel: "REVIEW", mastered: false };
  }
  if (consecutiveCorrect === 2) {
    return { intervalHours: 72, masteryLevel: "REVIEW", mastered: false };
  }
  return { intervalHours: 168, masteryLevel: "MASTERED", mastered: true };
}

/**
 * Pure calculation of learning metrics for in-memory or unit testing
 */
export function calculateAttemptLearningMetrics(
  questionResults: {
    isCorrect: boolean;
    previouslyIncorrect: boolean;
    consecutiveCorrect: number;
  }[]
): {
  currentScore: number;
  totalQuestions: number;
  currentAccuracy: number;
  firstAttemptCorrectCount: number;
  firstAttemptAccuracy: number;
  previouslyMissedCount: number;
  recoveredCount: number;
  masteredCount: number;
  needsReviewCount: number;
} {
  const totalQuestions = questionResults.length;
  let currentScore = 0;
  let firstAttemptCorrectCount = 0;
  let previouslyMissedCount = 0;
  let recoveredCount = 0;
  let masteredCount = 0;
  let needsReviewCount = 0;

  for (const q of questionResults) {
    if (q.isCorrect) {
      currentScore++;
    }

    if (q.previouslyIncorrect) {
      previouslyMissedCount++;
      if (q.isCorrect) {
        recoveredCount++;
      }
    } else if (q.isCorrect) {
      firstAttemptCorrectCount++;
    }

    if (!q.isCorrect) {
      needsReviewCount++;
    }

    if (q.consecutiveCorrect >= 3) {
      masteredCount++;
    }
  }

  const currentAccuracy = totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0;
  const firstAttemptAccuracy =
    totalQuestions > 0 ? Math.round((firstAttemptCorrectCount / totalQuestions) * 100) : 0;

  return {
    currentScore,
    totalQuestions,
    currentAccuracy,
    firstAttemptCorrectCount,
    firstAttemptAccuracy,
    previouslyMissedCount,
    recoveredCount,
    masteredCount,
    needsReviewCount,
  };
}
