import { LeaderboardEntry, TopicPerformance } from "@/types";
import { shuffleArray } from "./utils";

export interface QuestionBankItem {
  id: string;
  courseId: string;
  topicId: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: string;
  question: string;
  code?: string | null;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: { id: string; name: string };
}

/**
 * Intelligently distributes question count among selected topics
 * e.g., 20 questions across 4 topics = [5, 5, 5, 5]
 * e.g., 10 questions across 3 topics = [4, 3, 3]
 */
export function calculateTopicDistribution(
  topicIds: string[],
  totalQuestions: number
): { topicId: string; count: number }[] {
  if (topicIds.length === 0 || totalQuestions <= 0) return [];

  const baseCount = Math.floor(totalQuestions / topicIds.length);
  let remainder = totalQuestions % topicIds.length;

  return topicIds.map((topicId) => {
    const count = baseCount + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    return { topicId, count };
  });
}

/**
 * Selects a balanced, randomized mix of Easy, Medium (Intermediate), and Hard questions.
 * Target distribution: ~30% Easy, ~40% Medium, ~30% Hard.
 */
export function balanceDifficultyQuestions<T extends { id: string; difficulty: string }>(
  pool: T[],
  targetCount: number
): T[] {
  if (pool.length <= targetCount) {
    return shuffleArray(pool);
  }

  const easyTarget = Math.max(1, Math.round(targetCount * 0.3));
  const hardTarget = Math.max(1, Math.round(targetCount * 0.3));
  const mediumTarget = Math.max(1, targetCount - easyTarget - hardTarget);

  const easyPool = shuffleArray(pool.filter((q) => q.difficulty === "EASY"));
  const mediumPool = shuffleArray(pool.filter((q) => q.difficulty === "MEDIUM"));
  const hardPool = shuffleArray(pool.filter((q) => q.difficulty === "HARD"));

  const selected: T[] = [];
  const usedIds = new Set<string>();

  const takeFromPool = (sourcePool: T[], count: number) => {
    for (const item of sourcePool) {
      if (selected.length >= targetCount) break;
      if (count <= 0) break;
      if (!usedIds.has(item.id)) {
        selected.push(item);
        usedIds.add(item.id);
        count--;
      }
    }
  };

  takeFromPool(easyPool, easyTarget);
  takeFromPool(mediumPool, mediumTarget);
  takeFromPool(hardPool, hardTarget);

  // If any tier had fewer questions, fill remaining from any available pool
  if (selected.length < targetCount) {
    const remainingPool = shuffleArray(pool.filter((q) => !usedIds.has(q.id)));
    takeFromPool(remainingPool, targetCount - selected.length);
  }

  return shuffleArray(selected);
}

/**
 * Prepares questions for a quiz attempt:
 * - Shuffles question order
 * - Shuffles option order for each question
 * - Strips correctAnswer from question objects before sending to client
 */
export function prepareQuizQuestions(questions: QuestionBankItem[]): {
  clientQuestions: Omit<QuestionBankItem, "correctAnswer" | "explanation">[];
  orderedQuestionIds: string[];
} {
  const shuffledQuestions = shuffleArray(questions);

  const clientQuestions = shuffledQuestions.map((q) => {
    const shuffledOptions = shuffleArray([...q.options]);
    return {
      id: q.id,
      courseId: q.courseId,
      topicId: q.topicId,
      difficulty: q.difficulty,
      type: q.type,
      question: q.question,
      code: q.code,
      options: shuffledOptions,
      topic: q.topic,
    };
  });

  return {
    clientQuestions,
    orderedQuestionIds: shuffledQuestions.map((q) => q.id),
  };
}

/**
 * Deterministically shuffles options for a question using a seed string
 * (e.g. `${attemptId}_${questionId}`).
 * Ensures:
 * 1. Options appear in random A, B, C, D order (~25% chance for each).
 * 2. Order is stable across page reloads/auto-advances for the same student attempt.
 * 3. Different students (different attempt IDs) get different option permutations.
 */
export function shuffleOptionsWithSeed(options: string[], seed: string): string[] {
  if (!options || options.length <= 1) return options ? [...options] : [];

  // Hash the seed string into a 32-bit integer
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  // Mulberry32 PRNG
  const random = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Evaluates submitted answers on the server:
 * Computes score, percentage, accuracy, and topic-wise breakdown.
 * Frontend NEVER sends its own score or accuracy.
 */
export function calculateQuizResults(
  questions: QuestionBankItem[],
  answers: { questionId: string; selectedAnswer: string }[],
  startedAt: Date,
  submittedAt: Date,
  durationMinutes: number
): {
  score: number;
  totalQuestions: number;
  percentage: number;
  accuracy: number;
  timeTaken: number;
  isTimedOut: boolean;
  topicBreakdown: TopicPerformance[];
  evaluatedAnswers: {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
} {
  const totalQuestions = questions.length;
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedAnswer]));

  let correctCount = 0;
  let answeredCount = 0;

  const topicStats = new Map<string, { name: string; total: number; correct: number }>();

  const evaluatedAnswers = questions.map((q) => {
    const selectedAnswer = answerMap.get(q.id) ?? "";
    const isCorrect = selectedAnswer === q.correctAnswer;
    if (selectedAnswer !== "") {
      answeredCount++;
    }
    if (isCorrect) {
      correctCount++;
    }

    const topicName = q.topic?.name ?? "General";
    const currentTopicStat = topicStats.get(topicName) || { name: topicName, total: 0, correct: 0 };
    currentTopicStat.total++;
    if (isCorrect) currentTopicStat.correct++;
    topicStats.set(topicName, currentTopicStat);

    return {
      questionId: q.id,
      selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const elapsedSeconds = Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000);
  const maxSeconds = durationMinutes * 60;
  const timeTaken = Math.max(0, Math.min(elapsedSeconds, maxSeconds));
  const isTimedOut = elapsedSeconds > maxSeconds + 5; // 5 second grace period

  const topicBreakdown: TopicPerformance[] = Array.from(topicStats.values()).map((stat) => ({
    topicName: stat.name,
    total: stat.total,
    correct: stat.correct,
    percentage: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
  }));

  return {
    score: correctCount,
    totalQuestions,
    percentage,
    accuracy,
    timeTaken,
    isTimedOut,
    topicBreakdown,
    evaluatedAnswers,
  };
}

/**
 * Deterministic Leaderboard Ranking Algorithm (Section 30 & 60)
 * Sort order:
 * 1. Score descending
 * 2. Accuracy descending
 * 3. Time taken ascending (faster wins)
 * 4. Submission timestamp ascending (earlier submission wins)
 * 5. User ID ascending (deterministic tie-breaker)
 */
export function rankLeaderboardEntries(
  entries: Omit<LeaderboardEntry, "rank">[]
): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    // 1. Higher score
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // 2. Higher accuracy
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }

    // 3. Faster completion time
    if (a.timeTaken !== b.timeTaken) {
      return a.timeTaken - b.timeTaken;
    }

    // 4. Earlier submission timestamp
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : Infinity;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : Infinity;
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 5. Deterministic tie-breaker
    return a.userId.localeCompare(b.userId);
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
